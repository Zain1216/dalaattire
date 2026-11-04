<?php
// POST backend/api/submit.php  (JSON body)
// Saves the site's forms so they appear in the admin Inbox:
//   { "type": "order",       name, phone, email?, address, city, postal?, notes?, payment, coupon?, items: [{ id, size, qty }] }
//   { "type": "appointment", name, phone, garment, date?, notes? }
//   { "type": "contact",     name, email, phone, subject?, message }
//   { "type": "subscribe",   email }
// Order prices are worked out here from the database; whatever the browser says about prices is ignored.
// Spam protection: a hidden "website" field that people never fill in, and a limit per visitor per hour.

declare(strict_types=1);
require __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
allow_our_origins_only('form API');

const MAX_PER_HOUR = 30;
const SIZES = ['S', 'M', 'L', 'XL'];
const PAYMENTS = ['Cash on Delivery', 'Bank Transfer'];

function reply(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function field(array $in, string $key, int $max, bool $required = false, string $label = ''): string
{
    $value = trim(preg_replace('/\s+/u', ' ', (string) ($in[$key] ?? '')) ?? '');
    if ($key === 'message' || $key === 'notes' || $key === 'address') {
        // keep line breaks in longer text
        $value = trim(str_replace("\r", '', (string) ($in[$key] ?? '')));
    }
    if ($required && $value === '') {
        reply(['error' => ($label ?: ucfirst($key)) . ' is required.'], 422);
    }
    if (mb_strlen($value) > $max) {
        reply(['error' => ($label ?: ucfirst($key)) . " is too long (max {$max} characters)."], 422);
    }
    return $value;
}

function valid_email(string $email, bool $required): string
{
    if ($email === '' && !$required) {
        return '';
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        reply(['error' => 'Please enter a valid email address.'], 422);
    }
    return strtolower($email);
}

function valid_phone(string $phone): string
{
    if (!preg_match('/^\+?[0-9 ()-]{7,20}$/', $phone)) {
        reply(['error' => 'Please enter a valid phone number, e.g. 0300 1234567.'], 422);
    }
    return $phone;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    reply(['error' => 'Method not allowed.'], 405);
}

try {
    ensure_submissions_table();
    ensure_product_columns();
    $pdo = db();

    $raw = file_get_contents('php://input', false, null, 0, 65536);
    $in = json_decode((string) $raw, true);
    if (!is_array($in)) {
        reply(['error' => 'Invalid request.'], 400);
    }

    // Hidden field: real visitors leave it empty. Pretend success so bots learn nothing.
    if (trim((string) ($in['website'] ?? '')) !== '') {
        reply(['ok' => true]);
    }

    $ip = visitor_ip();
    $recent = $pdo->prepare('SELECT COUNT(*) FROM form_submissions WHERE ip = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)');
    $recent->execute([$ip]);
    if ((int) $recent->fetchColumn() >= MAX_PER_HOUR) {
        reply(['error' => 'Too many submissions from your connection. Please try again later or contact us on WhatsApp.'], 429);
    }

    $type = (string) ($in['type'] ?? '');
    $row = ['name' => '', 'email' => '', 'phone' => '', 'total' => null, 'data' => []];

    switch ($type) {
        case 'subscribe':
            $row['email'] = valid_email(field($in, 'email', 190, true, 'Email'), true);
            // Already on the list: nothing new to save
            $dup = $pdo->prepare("SELECT COUNT(*) FROM form_submissions WHERE type = 'subscribe' AND email = ?");
            $dup->execute([$row['email']]);
            if ((int) $dup->fetchColumn() > 0) {
                reply(['ok' => true, 'message' => 'You are already subscribed. Thank you!']);
            }
            break;

        case 'contact':
            $row['name'] = field($in, 'name', 120, true, 'Full name');
            $row['email'] = valid_email(field($in, 'email', 190, true, 'Email'), true);
            $row['phone'] = valid_phone(field($in, 'phone', 40, true, 'Phone number'));
            $row['data'] = [
                'subject' => field($in, 'subject', 200),
                'message' => field($in, 'message', 4000, true, 'Message'),
            ];
            break;

        case 'appointment':
            $row['name'] = field($in, 'name', 120, true, 'Full name');
            $row['phone'] = valid_phone(field($in, 'phone', 40, true, 'Phone / WhatsApp'));
            $date = field($in, 'date', 10);
            if ($date !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
                reply(['error' => 'Please choose a valid date.'], 422);
            }
            $row['data'] = [
                'garment' => field($in, 'garment', 120),
                'date'    => $date,
                'notes'   => field($in, 'notes', 2000),
            ];
            break;

        case 'order':
            $row['name'] = field($in, 'name', 120, true, 'Full name');
            $row['phone'] = valid_phone(field($in, 'phone', 40, true, 'Phone / WhatsApp'));
            $row['email'] = valid_email(field($in, 'email', 190), false);
            $payment = field($in, 'payment', 40);
            if (!in_array($payment, PAYMENTS, true)) {
                $payment = PAYMENTS[0];
            }
            $items = is_array($in['items'] ?? null) ? array_slice($in['items'], 0, 20) : [];
            if (!$items) {
                reply(['error' => 'Your cart is empty.'], 422);
            }

            // Look up every product: current name and the price that applies today
            $find = $pdo->prepare('SELECT slug, name, price, price_on_request, offer_price, offer_ends_at
                                   FROM products WHERE slug = ? AND is_active = 1');
            $lines = [];
            $subtotal = 0;
            foreach ($items as $item) {
                $slug = (string) ($item['id'] ?? '');
                $size = (string) ($item['size'] ?? '');
                $qty = (int) ($item['qty'] ?? 0);
                $find->execute([$slug]);
                $p = $find->fetch();
                if (!$p) {
                    reply(['error' => 'One of the products in your cart is no longer available. Please check your cart.'], 409);
                }
                if ($p['price_on_request']) {
                    reply(['error' => "“{$p['name']}” is price on request. Please contact us on WhatsApp for it."], 409);
                }
                if (!in_array($size, SIZES, true) || $qty < 1 || $qty > 10) {
                    reply(['error' => 'Please check the sizes and quantities in your cart.'], 422);
                }
                $offer = active_offer($p);
                $unit = $offer && $offer['price'] ? (int) $offer['price'] : (int) $p['price'];
                $lineTotal = $unit * $qty;
                $subtotal += $lineTotal;
                $lines[] = ['product' => $p['slug'], 'name' => $p['name'], 'size' => $size, 'qty' => $qty,
                            'unit_price' => $unit, 'regular_price' => (int) $p['price'], 'line_total' => $lineTotal];
            }
            $shipping = max(0, (int) (config()['shipping_fee'] ?? 0));
            $row['total'] = $subtotal + $shipping;
            $row['data'] = [
                'items'    => $lines,
                'subtotal' => $subtotal,
                'shipping' => $shipping,
                'coupon'   => field($in, 'coupon', 40),
                'payment'  => $payment,
                'address'  => field($in, 'address', 300, true, 'Street address'),
                'city'     => field($in, 'city', 80, true, 'City'),
                'postal'   => field($in, 'postal', 20),
                'notes'    => field($in, 'notes', 2000),
            ];
            break;

        default:
            reply(['error' => 'Unknown form.'], 400);
    }

    $pdo->prepare('INSERT INTO form_submissions (type, name, email, phone, total, data, ip) VALUES (?, ?, ?, ?, ?, ?, ?)')
        ->execute([$type, $row['name'], $row['email'], $row['phone'], $row['total'],
                   json_encode($row['data'], JSON_UNESCAPED_UNICODE), $ip]);
    $id = (int) $pdo->lastInsertId();

    $out = ['ok' => true, 'id' => $id];
    if ($type === 'order') {
        $reference = 'DA-' . (1000 + $id);
        $pdo->prepare('UPDATE form_submissions SET reference = ? WHERE id = ?')->execute([$reference, $id]);
        $out += ['reference' => $reference, 'items' => $row['data']['items'], 'subtotal' => $row['data']['subtotal'],
                 'shipping' => $row['data']['shipping'], 'total' => $row['total']];
    }
    reply($out);
} catch (Throwable $e) {
    error_log('submit.php: ' . $e->getMessage());
    reply(['error' => 'Something went wrong on our side. Please try again, or contact us on WhatsApp.'], 500);
}

<?php
// Admin API used by the admin app (admin/index.html), which can run on GitHub Pages or on this server.
//
//   GET  admin.php?action=status                     -> { needsSetup }
//   POST admin.php?action=setup     (first admin)    -> { token, username }
//   POST admin.php?action=login                      -> { token, username }
//   Everything else needs the header  Authorization: Bearer <token>
//   POST logout | GET me | GET categories | POST category_save | POST category_delete
//   GET  products[&category=ID] | GET product&id=ID | POST product_save | POST product_toggle
//   POST product_delete | POST image_delete | POST image_cover
//
// Requests carry no cookies, so cross-site request forgery does not apply; only the
// websites in config 'allowed_origins' (plus localhost) may call it from a browser.

declare(strict_types=1);
require __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

// ---------------------------------------------------------------------------
// CORS: answer only our own sites
// ---------------------------------------------------------------------------
/** "https://zain1216.github.io/dalaattire" -> "https://zain1216.github.io" */
function origin_of(string $url): string
{
    $p = parse_url($url);
    if (empty($p['scheme']) || empty($p['host'])) {
        return '';
    }
    return strtolower($p['scheme'] . '://' . $p['host']) . (isset($p['port']) ? ':' . $p['port'] : '');
}

// Allowed: the configured list, plus the storefront (site_url) and this backend (backend_url),
// so an older config.php without 'allowed_origins' still works for the GitHub admin.
$allowedOrigins = array_filter(array_merge(
    config()['allowed_origins'] ?? [],
    [origin_of((string) (config()['site_url'] ?? '')), origin_of((string) (config()['backend_url'] ?? ''))]
));

$origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
if ($origin !== '') {
    $allowed = in_array(strtolower(rtrim($origin, '/')), array_map(static fn ($o) => strtolower(rtrim($o, '/')), $allowedOrigins), true)
        || preg_match('#^https?://(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$#', $origin);
    if (!$allowed) {
        http_response_code(403);
        exit(json_encode(['error' => 'This website may not use the admin API.']));
    }
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Headers: Authorization, Content-Type');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Max-Age: 600');
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function respond(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function fail(string $message, int $status = 400): void
{
    respond(['error' => $message], $status);
}

function input(string $key, string $default = ''): string
{
    return trim((string) ($_POST[$key] ?? $default));
}

function require_method(string $method): void
{
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        fail('Method not allowed.', 405);
    }
}

/** Tables added after the first release; created here so an existing database needs no manual step. */
function ensure_auth_tables(): void
{
    db()->exec("CREATE TABLE IF NOT EXISTS admin_tokens (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        admin_id INT UNSIGNED NOT NULL,
        token_hash CHAR(64) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_tokens_admin FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE,
        INDEX idx_tokens_expiry (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    db()->exec("CREATE TABLE IF NOT EXISTS admin_login_attempts (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        ip VARCHAR(45) NOT NULL,
        username VARCHAR(60) NOT NULL,
        attempted_at DATETIME NOT NULL,
        INDEX idx_attempts_ip (ip, attempted_at),
        INDEX idx_attempts_user (username, attempted_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
}

function issue_token(int $adminId): string
{
    $token = bin2hex(random_bytes(32));
    $hours = max(1, (int) (config()['session_hours'] ?? 12));
    db()->prepare('INSERT INTO admin_tokens (admin_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR))')
        ->execute([$adminId, hash('sha256', $token), $hours]);
    db()->exec('DELETE FROM admin_tokens WHERE expires_at < NOW()');
    return $token;
}

function bearer_token(): string
{
    $header = (string) ($_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
    if ($header === '' && function_exists('getallheaders')) {
        foreach (getallheaders() as $name => $value) {
            if (strcasecmp($name, 'Authorization') === 0) {
                $header = (string) $value;
            }
        }
    }
    return preg_match('/^Bearer\s+([a-f0-9]{64})$/i', $header, $m) ? strtolower($m[1]) : '';
}

/** The logged-in admin, or a 401 response. */
function require_admin(): array
{
    $token = bearer_token();
    if ($token !== '') {
        $stmt = db()->prepare('SELECT a.id, a.username FROM admin_tokens t JOIN admins a ON a.id = t.admin_id
                               WHERE t.token_hash = ? AND t.expires_at > NOW()');
        $stmt->execute([hash('sha256', $token)]);
        if ($admin = $stmt->fetch()) {
            return $admin;
        }
    }
    fail('Please log in again.', 401);
}

function client_ip(): string
{
    return substr((string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 0, 45);
}

function product_row(array $p): array
{
    return [
        'id'           => (int) $p['id'],
        'slug'         => $p['slug'],
        'name'         => $p['name'],
        'category_id'  => (int) $p['category_id'],
        'category'     => $p['category'] ?? '',
        'description'  => $p['description'] ?? '',
        'price'        => (int) $p['price'],
        'price_on_request' => (bool) $p['price_on_request'],
        'offer_price'  => $p['offer_price'] !== null ? (int) $p['offer_price'] : null,
        'offer_ends_at' => utc_iso($p['offer_ends_at']),
        'offer_active' => active_offer($p) !== null,
        'color'        => $p['color'],
        'availability' => $p['availability'],
        'is_active'    => (bool) $p['is_active'],
        'sort_order'   => (int) $p['sort_order'],
        'cover'        => !empty($p['cover']) ? admin_image_url($p['cover']) : null,
        'site_link'    => site_url('product.html?id=' . rawurlencode($p['slug'])),
    ];
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
$action = (string) ($_GET['action'] ?? '');

try {
    ensure_auth_tables();
    ensure_product_columns();
    $pdo = db();

    switch ($action) {
        case 'status':
            respond(['needsSetup' => (int) $pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn() === 0]);

        case 'setup':
            require_method('POST');
            if ((int) $pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn() > 0) {
                fail('An admin account already exists. Please log in.', 409);
            }
            $username = input('username');
            $password = (string) ($_POST['password'] ?? '');
            if (!preg_match('/^[A-Za-z0-9_.-]{3,60}$/', $username)) {
                fail('Username must be 3–60 letters, numbers, dots, dashes or underscores.');
            }
            if (strlen($password) < 10) {
                fail('Password must be at least 10 characters.');
            }
            $pdo->prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)')
                ->execute([$username, password_hash($password, PASSWORD_DEFAULT)]);
            respond(['token' => issue_token((int) $pdo->lastInsertId()), 'username' => $username]);

        case 'login':
            require_method('POST');
            $username = input('username');
            $password = (string) ($_POST['password'] ?? '');
            $recent = $pdo->prepare('SELECT COUNT(*) FROM admin_login_attempts
                                     WHERE (ip = ? OR username = ?) AND attempted_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)');
            $recent->execute([client_ip(), $username]);
            if ((int) $recent->fetchColumn() >= 10) {
                fail('Too many wrong attempts. Try again in 15 minutes.', 429);
            }
            $stmt = $pdo->prepare('SELECT id, username, password_hash FROM admins WHERE username = ?');
            $stmt->execute([$username]);
            $admin = $stmt->fetch();
            if (!$admin || !password_verify($password, $admin['password_hash'])) {
                $pdo->prepare('INSERT INTO admin_login_attempts (ip, username, attempted_at) VALUES (?, ?, NOW())')
                    ->execute([client_ip(), substr($username, 0, 60)]);
                fail('Wrong username or password.', 401);
            }
            $pdo->prepare('DELETE FROM admin_login_attempts WHERE ip = ? OR username = ?')->execute([client_ip(), $username]);
            $pdo->exec('DELETE FROM admin_login_attempts WHERE attempted_at < DATE_SUB(NOW(), INTERVAL 1 DAY)');
            respond(['token' => issue_token((int) $admin['id']), 'username' => $admin['username']]);
    }

    // Everything below needs a logged-in admin
    $admin = require_admin();

    switch ($action) {
        case 'me':
            respond(['username' => $admin['username']]);

        case 'logout':
            require_method('POST');
            $pdo->prepare('DELETE FROM admin_tokens WHERE token_hash = ?')->execute([hash('sha256', bearer_token())]);
            respond(['ok' => true]);

        case 'categories':
            $rows = $pdo->query('SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS products
                                 FROM categories c ORDER BY c.sort_order, c.name')->fetchAll();
            respond(['categories' => array_map(static fn ($c) => [
                'id'         => (int) $c['id'],
                'slug'       => $c['slug'],
                'name'       => $c['name'],
                'sort_order' => (int) $c['sort_order'],
                'products'   => (int) $c['products'],
                'hero'       => $c['hero_image'] !== '' ? admin_image_url($c['hero_image']) : null,
                'site_link'  => site_url('category.html?c=' . rawurlencode($c['slug'])),
            ], $rows)]);

        case 'category_save':
            require_method('POST');
            $id = (int) input('id', '0');
            $name = input('name');
            if ($name === '') {
                fail('Category name is required.');
            }
            $slug = unique_slug('categories', slugify(input('slug') ?: $name), $id);
            $sort = (int) input('sort_order', '0');
            $newHero = (($_FILES['hero']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) ? save_upload($_FILES['hero']) : null;
            if ($id) {
                $old = $pdo->prepare('SELECT hero_image FROM categories WHERE id = ?');
                $old->execute([$id]);
                $oldHero = $old->fetchColumn();
                if ($oldHero === false) {
                    fail('That category no longer exists.', 404);
                }
                $pdo->prepare('UPDATE categories SET name = ?, slug = ?, sort_order = ?, hero_image = ? WHERE id = ?')
                    ->execute([$name, $slug, $sort, $newHero ?? $oldHero, $id]);
                if ($newHero) {
                    delete_upload((string) $oldHero);
                }
            } else {
                $pdo->prepare('INSERT INTO categories (name, slug, sort_order, hero_image) VALUES (?, ?, ?, ?)')
                    ->execute([$name, $slug, $sort, $newHero ?? 'assets/pages/contact-hero.jpg']);
                $id = (int) $pdo->lastInsertId();
            }
            respond(['ok' => true, 'id' => $id, 'message' => "Category “{$name}” saved."]);

        case 'category_delete':
            require_method('POST');
            $id = (int) input('id', '0');
            $count = $pdo->prepare('SELECT COUNT(*) FROM products WHERE category_id = ?');
            $count->execute([$id]);
            if ((int) $count->fetchColumn() > 0) {
                fail('This category still has products. Move or delete them first.', 409);
            }
            $hero = $pdo->prepare('SELECT hero_image FROM categories WHERE id = ?');
            $hero->execute([$id]);
            $path = (string) $hero->fetchColumn();
            $pdo->prepare('DELETE FROM categories WHERE id = ?')->execute([$id]);
            delete_upload($path);
            respond(['ok' => true, 'message' => 'Category deleted.']);

        case 'products':
            $sql = 'SELECT p.*, c.name AS category,
                           (SELECT path FROM product_images i WHERE i.product_id = p.id ORDER BY i.sort_order, i.id LIMIT 1) AS cover
                    FROM products p JOIN categories c ON c.id = p.category_id';
            $params = [];
            if ((int) ($_GET['category'] ?? 0)) {
                $sql .= ' WHERE p.category_id = ?';
                $params[] = (int) $_GET['category'];
            }
            $stmt = $pdo->prepare($sql . ' ORDER BY c.sort_order, p.sort_order, p.name');
            $stmt->execute($params);
            respond(['products' => array_map('product_row', $stmt->fetchAll())]);

        case 'product':
            $stmt = $pdo->prepare('SELECT p.*, c.name AS category FROM products p JOIN categories c ON c.id = p.category_id WHERE p.id = ?');
            $stmt->execute([(int) ($_GET['id'] ?? 0)]);
            $p = $stmt->fetch();
            if (!$p) {
                fail('That product no longer exists.', 404);
            }
            $images = $pdo->prepare('SELECT id, path FROM product_images WHERE product_id = ? ORDER BY sort_order, id');
            $images->execute([(int) $p['id']]);
            respond([
                'product' => product_row($p) + ['images' => array_map(static fn ($i) => [
                    'id' => (int) $i['id'], 'url' => admin_image_url($i['path']),
                ], $images->fetchAll())],
                'colors' => $pdo->query("SELECT DISTINCT color FROM products WHERE color <> '' ORDER BY color")->fetchAll(PDO::FETCH_COLUMN),
            ]);

        case 'product_save':
            require_method('POST');
            $id = (int) input('id', '0');
            $name = input('name');
            $categoryId = (int) input('category_id', '0');
            $price = input('price');
            $availability = input('availability', 'In Stock');
            $errors = [];
            if ($name === '') {
                $errors[] = 'Name is required.';
            }
            $cat = $pdo->prepare('SELECT COUNT(*) FROM categories WHERE id = ?');
            $cat->execute([$categoryId]);
            if (!(int) $cat->fetchColumn()) {
                $errors[] = 'Choose a category.';
            }
            $onRequest = input('price_on_request', '0') === '1';
            if ($onRequest && $price === '') {
                $price = '0'; // no price shown; customers ask on WhatsApp
            } elseif (!ctype_digit($price) || (int) $price <= 0) {
                $errors[] = 'Price must be a whole number of rupees, e.g. 12999 (or tick "Price on request").';
            }

            // Limited-time offer: optional sale price and/or end time (sent by the admin app in UTC)
            $offerPrice = input('offer_price');
            if ($offerPrice !== '' && (!ctype_digit($offerPrice) || (int) $offerPrice <= 0)) {
                $errors[] = 'Offer price must be a whole number of rupees, e.g. 9999.';
            } elseif ($offerPrice !== '' && !$onRequest && ctype_digit($price) && (int) $offerPrice >= (int) $price) {
                $errors[] = 'Offer price must be lower than the regular price.';
            }
            $offerEnds = null;
            if (input('offer_ends_at') !== '') {
                try {
                    $offerEnds = (new DateTimeImmutable(input('offer_ends_at')))->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s');
                } catch (Exception $e) {
                    $errors[] = 'Offer end time is not a valid date.';
                }
            }
            if (!in_array($availability, ['In Stock', 'Made to Order'], true)) {
                $errors[] = 'Choose an availability.';
            }
            $files = uploaded_files('images');
            if ($id) {
                $exists = $pdo->prepare('SELECT COUNT(*) FROM products WHERE id = ?');
                $exists->execute([$id]);
                if (!(int) $exists->fetchColumn()) {
                    fail('That product no longer exists.', 404);
                }
            }
            $imageCount = $pdo->prepare('SELECT COUNT(*) FROM product_images WHERE product_id = ?');
            $imageCount->execute([$id]);
            if (!(int) $imageCount->fetchColumn() && !$files) {
                $errors[] = 'Add at least one photo — products without photos are not shown on the site.';
            }
            if ($errors) {
                fail(implode(' ', $errors), 422);
            }

            $saved = [];
            try {
                foreach ($files as $file) {
                    $saved[] = save_upload($file);
                }
                $pdo->beginTransaction();
                $slug = unique_slug('products', slugify(input('slug') ?: $name), $id);
                $values = [$slug, $categoryId, $name, input('description'), (int) $price, input('color'),
                           $availability, input('is_active', '0') === '1' ? 1 : 0, (int) input('sort_order', '0'),
                           $onRequest ? 1 : 0, $offerPrice !== '' ? (int) $offerPrice : null, $offerEnds];
                if ($id) {
                    $pdo->prepare('UPDATE products SET slug = ?, category_id = ?, name = ?, description = ?, price = ?, color = ?,
                                   availability = ?, is_active = ?, sort_order = ?, price_on_request = ?, offer_price = ?, offer_ends_at = ?
                                   WHERE id = ?')->execute(array_merge($values, [$id]));
                } else {
                    $pdo->prepare('INSERT INTO products (slug, category_id, name, description, price, color, availability, is_active, sort_order,
                                   price_on_request, offer_price, offer_ends_at)
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')->execute($values);
                    $id = (int) $pdo->lastInsertId();
                }
                $next = $pdo->prepare('SELECT COALESCE(MAX(sort_order), 0) FROM product_images WHERE product_id = ?');
                $next->execute([$id]);
                $order = (int) $next->fetchColumn();
                $insert = $pdo->prepare('INSERT INTO product_images (product_id, path, sort_order) VALUES (?, ?, ?)');
                foreach ($saved as $path) {
                    $insert->execute([$id, $path, ++$order]);
                }
                $pdo->commit();
            } catch (Throwable $e) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                array_walk($saved, 'delete_upload');
                throw $e;
            }
            respond(['ok' => true, 'id' => $id, 'message' => 'Product saved.']);

        case 'product_toggle':
            require_method('POST');
            $pdo->prepare('UPDATE products SET is_active = 1 - is_active WHERE id = ?')->execute([(int) input('id', '0')]);
            respond(['ok' => true]);

        case 'product_delete':
            require_method('POST');
            $id = (int) input('id', '0');
            $paths = $pdo->prepare('SELECT path FROM product_images WHERE product_id = ?');
            $paths->execute([$id]);
            $files = $paths->fetchAll(PDO::FETCH_COLUMN);
            $pdo->prepare('DELETE FROM products WHERE id = ?')->execute([$id]);
            array_walk($files, 'delete_upload');
            respond(['ok' => true, 'message' => 'Product deleted.']);

        case 'image_delete':
        case 'image_cover':
            require_method('POST');
            $productId = (int) input('product_id', '0');
            $imageId = (int) input('image_id', '0');
            $img = $pdo->prepare('SELECT path FROM product_images WHERE id = ? AND product_id = ?');
            $img->execute([$imageId, $productId]);
            $path = $img->fetchColumn();
            if ($path === false) {
                fail('That photo no longer exists.', 404);
            }
            if ($action === 'image_delete') {
                $left = $pdo->prepare('SELECT COUNT(*) FROM product_images WHERE product_id = ?');
                $left->execute([$productId]);
                if ((int) $left->fetchColumn() <= 1) {
                    fail('A product needs at least one photo. Add another before removing this one.', 409);
                }
                $pdo->prepare('DELETE FROM product_images WHERE id = ?')->execute([$imageId]);
                delete_upload((string) $path);
                respond(['ok' => true, 'message' => 'Photo removed.']);
            }
            // Cover = lowest sort order; push the others after it
            $pdo->prepare('UPDATE product_images SET sort_order = sort_order + 1 WHERE product_id = ?')->execute([$productId]);
            $pdo->prepare('UPDATE product_images SET sort_order = 0 WHERE id = ?')->execute([$imageId]);
            respond(['ok' => true, 'message' => 'Cover photo changed.']);
    }

    fail('Unknown action.', 404);
} catch (RuntimeException $e) {
    // Upload problems and similar, safe to show to the admin
    fail($e->getMessage(), 422);
} catch (Throwable $e) {
    error_log('admin.php: ' . $e->getMessage());
    fail('Something went wrong on the server. Please try again.', 500);
}

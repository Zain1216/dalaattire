<?php
// Shared setup for the API, admin panel and setup script:
// config loading, the PDO connection and small helpers.

declare(strict_types=1);

const SITE_ROOT = __DIR__ . '/..';

function config(): array
{
    static $config = null;
    if ($config === null) {
        $file = __DIR__ . '/config.php';
        if (!is_file($file)) {
            $file = __DIR__ . '/config.sample.php';
        }
        $config = require $file;
    }
    return $config;
}

/** Connection to the catalog database. Pass $withDb = false to connect before the database exists. */
function db(bool $withDb = true): PDO
{
    static $pdo = null;
    if ($withDb && $pdo !== null) {
        return $pdo;
    }
    $c = config()['db'];
    $dsn = sprintf('mysql:host=%s;port=%d;charset=utf8mb4', $c['host'], $c['port']);
    if ($withDb) {
        $dsn .= ';dbname=' . $c['name'];
    }
    $conn = new PDO($dsn, $c['user'], $c['password'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    if ($withDb) {
        $pdo = $conn;
    }
    return $conn;
}

/** "https://zain1216.github.io/dalaattire" -> "https://zain1216.github.io" */
function origin_of(string $url): string
{
    $p = parse_url($url);
    if (empty($p['scheme']) || empty($p['host'])) {
        return '';
    }
    return strtolower($p['scheme'] . '://' . $p['host']) . (isset($p['port']) ? ':' . $p['port'] : '');
}

/**
 * CORS for APIs that only our own websites may call from a browser: the configured
 * allowed_origins, the storefront (site_url), this backend (backend_url) and localhost.
 * Other websites get 403; OPTIONS preflight requests are answered here.
 */
function allow_our_origins_only(string $what): void
{
    $allowedOrigins = array_map(static fn ($o) => strtolower(rtrim($o, '/')), array_filter(array_merge(
        config()['allowed_origins'] ?? [],
        [origin_of((string) (config()['site_url'] ?? '')), origin_of((string) (config()['backend_url'] ?? ''))]
    )));

    $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($origin !== '') {
        $allowed = in_array(strtolower(rtrim($origin, '/')), $allowedOrigins, true)
            || preg_match('#^https?://(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$#', $origin);
        if (!$allowed) {
            http_response_code(403);
            exit(json_encode(['error' => "This website may not use the {$what}."]));
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
}

/**
 * The visitor's IP address, for rate limits. Behind Hostinger's CDN every request can arrive from the
 * CDN's address, so the address the CDN forwards is used when present. (A visitor could fake that
 * header, which only lets them dodge the limit — it is never used for anything else.)
 */
function visitor_ip(): string
{
    foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_REAL_IP', 'HTTP_X_FORWARDED_FOR'] as $header) {
        $value = trim(explode(',', (string) ($_SERVER[$header] ?? ''))[0]);
        if ($value !== '' && filter_var($value, FILTER_VALIDATE_IP)) {
            return $value;
        }
    }
    return substr((string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 0, 45);
}

/** Table for everything visitors send through the site's forms (created on first use). */
function ensure_submissions_table(): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    db()->exec("CREATE TABLE IF NOT EXISTS form_submissions (
        id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        type        ENUM('order', 'appointment', 'contact', 'subscribe') NOT NULL,
        reference   VARCHAR(20)  NULL,
        name        VARCHAR(120) NOT NULL DEFAULT '',
        email       VARCHAR(190) NOT NULL DEFAULT '',
        phone       VARCHAR(40)  NOT NULL DEFAULT '',
        total       INT UNSIGNED NULL,
        data        MEDIUMTEXT   NOT NULL,
        status      ENUM('new', 'in_progress', 'done') NOT NULL DEFAULT 'new',
        ip          VARCHAR(45)  NOT NULL DEFAULT '',
        created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_submissions_list (type, status, created_at),
        INDEX idx_submissions_ip (ip, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
}

/**
 * Add product columns introduced after the first release (price on request, limited-time offer),
 * so a database imported earlier keeps working without a manual step. Runs once per request.
 */
function ensure_product_columns(): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    $have = db()->query(
        "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products'"
    )->fetchAll(PDO::FETCH_COLUMN);
    $add = [
        'price_on_request' => 'ADD COLUMN price_on_request TINYINT(1) NOT NULL DEFAULT 0',
        'offer_price'      => 'ADD COLUMN offer_price INT UNSIGNED NULL',
        'offer_ends_at'    => 'ADD COLUMN offer_ends_at DATETIME NULL',
    ];
    $missing = array_diff_key($add, array_flip($have));
    if ($missing) {
        db()->exec('ALTER TABLE products ' . implode(', ', $missing));
    }
}

/** UTC "Y-m-d H:i:s" from the database -> ISO 8601 for JavaScript ("2026-11-10T19:00:00Z"). */
function utc_iso(?string $datetime): ?string
{
    return $datetime ? str_replace(' ', 'T', $datetime) . 'Z' : null;
}

/**
 * The product's offer as the storefront should see it, or null when there is none / it has ended.
 * An offer can be a sale price, a deadline (countdown), or both.
 */
function active_offer(array $p): ?array
{
    $price = $p['offer_price'] !== null ? (int) $p['offer_price'] : null;
    $ends = $p['offer_ends_at'] ?: null;
    if ($price === null && $ends === null) {
        return null;
    }
    if ($ends !== null && $ends <= gmdate('Y-m-d H:i:s')) {
        return null;
    }
    if ($price !== null && !$p['price_on_request'] && $price >= (int) $p['price']) {
        $price = null; // not a discount; keep only the countdown
    }
    if ($price === null && $ends === null) {
        return null;
    }
    return ['price' => $p['price_on_request'] ? null : $price, 'endsAt' => utc_iso($ends)];
}

/**
 * Public URL of the backend folder (the folder holding backend/, admin/ and uploads/), no trailing slash.
 * Uses the backend_url setting when given, otherwise works it out from the current request.
 */
function backend_url(): string
{
    $configured = rtrim((string) (config()['backend_url'] ?? ''), '/');
    if ($configured !== '') {
        return $configured;
    }
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https';
    $host = (string) ($_SERVER['HTTP_HOST'] ?? 'localhost');
    // e.g. /daula-attire/backend/api/catalog.php -> /daula-attire
    $base = preg_replace('#/(backend|admin)/.*$#', '', (string) ($_SERVER['SCRIPT_NAME'] ?? ''));
    return ($https ? 'https' : 'http') . '://' . $host . rtrim((string) $base, '/');
}

/** Is this a photo uploaded through the admin (stored next to the backend, not on the storefront)? */
function is_upload(string $path): bool
{
    return strpos($path, trim(config()['upload_dir'], '/') . '/') === 0;
}

/**
 * Link for a photo as the storefront should load it: uploads get a full backend URL,
 * the site's own assets/... stay relative because the storefront serves them itself.
 */
function public_image_url(string $path): string
{
    return is_upload($path) ? backend_url() . '/' . $path : $path;
}

/** URL of a storefront page or asset, as seen from the admin panel. */
function site_url(string $path): string
{
    $site = rtrim((string) (config()['site_url'] ?? ''), '/');
    return ($site !== '' ? $site : '..') . '/' . ltrim($path, '/');
}

/**
 * Image URL for the admin app, which may run on GitHub Pages or on Hostinger:
 * uploads get a full backend URL, built-in photos are loaded from the storefront.
 */
function admin_image_url(string $path): string
{
    return is_upload($path) ? backend_url() . '/' . $path : site_url($path);
}

/** URL-friendly slug: "Gold Groom Sherwani" -> "gold-groom-sherwani". */
function slugify(string $text): string
{
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9]+/', '-', $text), '-'));
    return $slug !== '' ? $slug : 'item';
}

/** Make $slug unique in $table by adding -2, -3 ... ; $exceptId skips the row being edited. */
function unique_slug(string $table, string $slug, int $exceptId = 0): string
{
    $base = $slug;
    $n = 2;
    $stmt = db()->prepare("SELECT COUNT(*) FROM {$table} WHERE slug = ? AND id <> ?");
    while (true) {
        $stmt->execute([$slug, $exceptId]);
        if ((int) $stmt->fetchColumn() === 0) {
            return $slug;
        }
        $slug = $base . '-' . $n++;
    }
}

/**
 * Save one uploaded photo from $_FILES and return its site-relative path.
 * Only real JPEG / PNG / WebP images are accepted.
 */
function save_upload(array $file): string
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Upload failed (error code ' . (int) ($file['error'] ?? -1) . ').');
    }
    if ($file['size'] > config()['max_upload_bytes']) {
        throw new RuntimeException('Photo is larger than ' . round(config()['max_upload_bytes'] / 1048576) . ' MB.');
    }
    $types = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    if (!isset($types[$mime]) || @getimagesize($file['tmp_name']) === false) {
        throw new RuntimeException('Only JPG, PNG or WebP photos can be uploaded.');
    }

    $relDir = trim(config()['upload_dir'], '/');
    $absDir = SITE_ROOT . '/' . $relDir;
    if (!is_dir($absDir) && !mkdir($absDir, 0755, true)) {
        throw new RuntimeException('Could not create the upload folder.');
    }
    $name = date('Ymd') . '-' . bin2hex(random_bytes(8)) . '.' . $types[$mime];
    if (!move_uploaded_file($file['tmp_name'], $absDir . '/' . $name)) {
        throw new RuntimeException('Could not save the uploaded photo.');
    }
    return $relDir . '/' . $name;
}

/** Delete a photo file, but only if it lives in the upload folder (never site assets). */
function delete_upload(string $path): void
{
    if (is_upload($path) && strpos($path, '..') === false) {
        @unlink(SITE_ROOT . '/' . $path);
    }
}

/**
 * Normalise the $_FILES entry for an <input type="file" name="x[]" multiple> into a list.
 */
function uploaded_files(string $field): array
{
    if (empty($_FILES[$field]) || !is_array($_FILES[$field]['name'])) {
        return [];
    }
    $list = [];
    foreach ($_FILES[$field]['name'] as $i => $name) {
        if (($_FILES[$field]['error'][$i] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
            continue;
        }
        $list[] = [
            'name'     => $name,
            'tmp_name' => $_FILES[$field]['tmp_name'][$i],
            'size'     => $_FILES[$field]['size'][$i],
            'error'    => $_FILES[$field]['error'][$i],
        ];
    }
    return $list;
}

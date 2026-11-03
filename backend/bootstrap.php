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

/** Image src for the admin panel: uploads live next to the admin, built-in photos on the storefront. */
function admin_image_src(string $path): string
{
    return is_upload($path) ? '../' . $path : site_url($path);
}

/** Escape text for HTML output. */
function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
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

<?php
// Shared admin code: session login, CSRF protection, flash messages and page layout.

declare(strict_types=1);
require __DIR__ . '/../backend/bootstrap.php';

session_set_cookie_params([
    'httponly' => true,
    'samesite' => 'Lax',
    'secure'   => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
]);
session_name('daula_admin');
session_start();

function current_admin(): ?string
{
    return $_SESSION['admin'] ?? null;
}

function require_login(): void
{
    if (!current_admin()) {
        header('Location: login.php');
        exit;
    }
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '">';
}

/** Stop any POST that did not come from one of our own forms. */
function verify_csrf(): void
{
    if (!hash_equals(csrf_token(), (string) ($_POST['csrf'] ?? ''))) {
        http_response_code(400);
        exit('This form expired. Go back, refresh the page and try again.');
    }
}

function flash(string $message, string $type = 'ok'): void
{
    $_SESSION['flash'][] = ['message' => $message, 'type' => $type];
}

function redirect(string $url): void
{
    header('Location: ' . $url);
    exit;
}

function admin_header(string $title): void
{
    $flashes = $_SESSION['flash'] ?? [];
    unset($_SESSION['flash']);
    $page = basename($_SERVER['SCRIPT_NAME']);
    ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title><?= e($title) ?> | Daula Attire Admin</title>
  <link rel="icon" href="<?= e(site_url('assets/daula-logo.png')) ?>" type="image/png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="admin.css">
</head>
<body>
  <?php if (current_admin()): ?>
  <header class="admin-bar">
    <a href="index.php" class="admin-brand">DAULA ATTIRE <span>Admin</span></a>
    <nav>
      <a href="index.php" class="<?= in_array($page, ['index.php', 'product.php'], true) ? 'active' : '' ?>">Products</a>
      <a href="categories.php" class="<?= $page === 'categories.php' ? 'active' : '' ?>">Categories</a>
      <a href="<?= e(site_url('category.html')) ?>" target="_blank" rel="noopener">View Site</a>
      <form method="post" action="logout.php"><?= csrf_field() ?><button type="submit">Log Out (<?= e(current_admin()) ?>)</button></form>
    </nav>
  </header>
  <?php endif; ?>
  <main class="admin-main">
    <?php foreach ($flashes as $f): ?>
      <p class="flash flash-<?= e($f['type']) ?>" role="status"><?= e($f['message']) ?></p>
    <?php endforeach; ?>
<?php
}

function admin_footer(): void
{
    echo "  </main>\n</body>\n</html>\n";
}

<?php
require __DIR__ . '/_init.php';

if (current_admin()) {
    redirect('index.php');
}

try {
    if ((int) db()->query('SELECT COUNT(*) FROM admins')->fetchColumn() === 0) {
        redirect('setup.php');
    }
} catch (PDOException $e) {
    redirect('setup.php');
}

$error = '';
$username = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $username = trim((string) ($_POST['username'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');

    // Slow down repeated guessing from the same session
    $_SESSION['login_attempts'] = ($_SESSION['login_attempts'] ?? 0) + 1;
    if ($_SESSION['login_attempts'] > 5) {
        sleep(min(10, $_SESSION['login_attempts'] - 5));
    }

    $stmt = db()->prepare('SELECT username, password_hash FROM admins WHERE username = ?');
    $stmt->execute([$username]);
    $admin = $stmt->fetch();
    if ($admin && password_verify($password, $admin['password_hash'])) {
        session_regenerate_id(true);
        $_SESSION['admin'] = $admin['username'];
        unset($_SESSION['login_attempts']);
        redirect('index.php');
    }
    $error = 'Wrong username or password.';
}

admin_header('Log In');
?>
<div class="card narrow">
  <h1>Admin Log In</h1>
  <?php if ($error): ?><p class="flash flash-error"><?= e($error) ?></p><?php endif; ?>
  <form method="post" class="form">
    <?= csrf_field() ?>
    <label>Username<input name="username" value="<?= e($username) ?>" autocomplete="username" required autofocus></label>
    <label>Password<input type="password" name="password" autocomplete="current-password" required></label>
    <button type="submit" class="btn">Log In</button>
  </form>
</div>
<?php admin_footer();

<?php
// Creates the first admin account. Locks itself once any admin exists.

require __DIR__ . '/_init.php';

try {
    $hasAdmin = (int) db()->query('SELECT COUNT(*) FROM admins')->fetchColumn() > 0;
} catch (PDOException $e) {
    admin_header('Setup');
    echo '<div class="card narrow"><h1>Database not ready</h1><p>Create the database first: run <code>php backend/setup.php</code>, or import <code>backend/database/schema.sql</code> and <code>seed.sql</code> in phpMyAdmin. Then check <code>backend/config.php</code>.</p></div>';
    admin_footer();
    exit;
}

if ($hasAdmin) {
    flash('An admin account already exists. Please log in.');
    redirect('login.php');
}

$error = '';
$username = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $username = trim((string) ($_POST['username'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');
    $confirm = (string) ($_POST['confirm'] ?? '');

    if (!preg_match('/^[A-Za-z0-9_.-]{3,60}$/', $username)) {
        $error = 'Username must be 3–60 letters, numbers, dots, dashes or underscores.';
    } elseif (strlen($password) < 10) {
        $error = 'Password must be at least 10 characters.';
    } elseif ($password !== $confirm) {
        $error = 'The two passwords do not match.';
    } else {
        $stmt = db()->prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)');
        $stmt->execute([$username, password_hash($password, PASSWORD_DEFAULT)]);
        session_regenerate_id(true);
        $_SESSION['admin'] = $username;
        flash('Admin account created. Welcome!');
        redirect('index.php');
    }
}

admin_header('Create Admin');
?>
<div class="card narrow">
  <h1>Create Admin Account</h1>
  <p class="muted">This page works only once. After this account is created it locks itself.</p>
  <?php if ($error): ?><p class="flash flash-error"><?= e($error) ?></p><?php endif; ?>
  <form method="post" class="form">
    <?= csrf_field() ?>
    <label>Username<input name="username" value="<?= e($username) ?>" autocomplete="username" required></label>
    <label>Password<input type="password" name="password" autocomplete="new-password" minlength="10" required></label>
    <label>Confirm Password<input type="password" name="confirm" autocomplete="new-password" minlength="10" required></label>
    <button type="submit" class="btn">Create Account</button>
  </form>
</div>
<?php admin_footer();

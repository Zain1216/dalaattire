<?php
// One-time local setup from the command line:
//   php backend/setup.php            creates the database, tables and starting catalog
//   php backend/setup.php --reset    drops and rebuilds the catalog tables (deletes admin edits!)
// Admin accounts are created afterwards at /admin/setup.php.

declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Run this from the command line: php backend/setup.php');
}

$reset = in_array('--reset', $argv, true);
$name = config()['db']['name'];
if (!preg_match('/^[A-Za-z0-9_]+$/', $name)) {
    exit("Database name may only use letters, numbers and underscores.\n");
}

db(false)->exec("CREATE DATABASE IF NOT EXISTS `{$name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
echo "Database `{$name}` ready.\n";

$pdo = db();
if ($reset) {
    $pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
    $pdo->exec('DROP TABLE IF EXISTS product_images, products, categories');
    $pdo->exec('SET FOREIGN_KEY_CHECKS = 1');
    echo "Catalog tables dropped.\n";
}

/** Run a .sql file statement by statement. */
function run_sql_file(PDO $pdo, string $file): void
{
    $sql = preg_replace('/^--.*$/m', '', file_get_contents($file));
    foreach (array_filter(array_map('trim', explode(";\n", $sql))) as $statement) {
        $pdo->exec($statement);
    }
}

run_sql_file($pdo, __DIR__ . '/database/schema.sql');
echo "Tables created.\n";

$count = (int) $pdo->query('SELECT COUNT(*) FROM categories')->fetchColumn();
if ($count === 0) {
    run_sql_file($pdo, __DIR__ . '/database/seed.sql');
    printf(
        "Starting catalog added: %d categories, %d products.\n",
        $pdo->query('SELECT COUNT(*) FROM categories')->fetchColumn(),
        $pdo->query('SELECT COUNT(*) FROM products')->fetchColumn()
    );
} else {
    echo "Catalog already has data, so the starting catalog was not added again.\n";
}

$admins = (int) $pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn();
echo $admins
    ? "Done.\n"
    : "Done. Next: open /admin/setup.php in your browser to create the admin account.\n";

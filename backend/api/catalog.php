<?php
// GET backend/api/catalog.php
// Returns every category and active product, in the same shape script.js uses.
// Uploaded photos come back as full backend URLs; the site's own assets/... paths stay relative.
// { "categories": { slug: { name, hero } }, "products": { slug: { name, price, color, category, availability, images, description } } }

declare(strict_types=1);
require __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=60');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $categories = [];
    foreach (db()->query('SELECT slug, name, hero_image FROM categories ORDER BY sort_order, name') as $row) {
        $categories[$row['slug']] = ['name' => $row['name'], 'hero' => public_image_url($row['hero_image'])];
    }

    $images = [];
    foreach (db()->query('SELECT product_id, path FROM product_images ORDER BY product_id, sort_order, id') as $row) {
        $images[$row['product_id']][] = $row['path'];
    }

    $products = [];
    $rows = db()->query(
        'SELECT p.id, p.slug, p.name, p.description, p.price, p.color, p.availability, c.slug AS category
         FROM products p JOIN categories c ON c.id = p.category_id
         WHERE p.is_active = 1
         ORDER BY c.sort_order, p.sort_order, p.name'
    );
    foreach ($rows as $row) {
        // A product with no photo would break the grid, so it is left out until one is added
        if (empty($images[$row['id']])) {
            continue;
        }
        $products[$row['slug']] = [
            'name'         => $row['name'],
            'price'        => (int) $row['price'],
            'color'        => $row['color'],
            'category'     => $row['category'],
            'availability' => $row['availability'],
            'images'       => array_map('public_image_url', $images[$row['id']]),
            'description'  => $row['description'],
        ];
    }

    echo json_encode(['categories' => $categories, 'products' => $products], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    error_log('catalog.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Catalog unavailable']);
}

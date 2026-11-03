<?php
// Products list: filter by category, show/hide on the site, delete.

require __DIR__ . '/_init.php';
require_login();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $id = (int) ($_POST['id'] ?? 0);
    $action = $_POST['action'] ?? '';

    if ($action === 'toggle') {
        db()->prepare('UPDATE products SET is_active = 1 - is_active WHERE id = ?')->execute([$id]);
        flash('Product visibility updated.');
    } elseif ($action === 'delete') {
        $paths = db()->prepare('SELECT path FROM product_images WHERE product_id = ?');
        $paths->execute([$id]);
        $files = $paths->fetchAll(PDO::FETCH_COLUMN);
        db()->prepare('DELETE FROM products WHERE id = ?')->execute([$id]);
        array_walk($files, 'delete_upload');
        flash('Product deleted.');
    }
    redirect('index.php' . (isset($_GET['category']) ? '?category=' . urlencode((string) $_GET['category']) : ''));
}

$categories = db()->query('SELECT id, name FROM categories ORDER BY sort_order, name')->fetchAll();
$filter = (int) ($_GET['category'] ?? 0);

$sql = 'SELECT p.id, p.slug, p.name, p.price, p.color, p.availability, p.is_active, c.name AS category,
               (SELECT path FROM product_images i WHERE i.product_id = p.id ORDER BY i.sort_order, i.id LIMIT 1) AS cover
        FROM products p JOIN categories c ON c.id = p.category_id';
$params = [];
if ($filter) {
    $sql .= ' WHERE p.category_id = ?';
    $params[] = $filter;
}
$sql .= ' ORDER BY c.sort_order, p.sort_order, p.name';
$stmt = db()->prepare($sql);
$stmt->execute($params);
$products = $stmt->fetchAll();

admin_header('Products');
?>
<div class="page-head">
  <h1>Products <span class="count"><?= count($products) ?></span></h1>
  <a href="product.php" class="btn">+ Add Product</a>
</div>

<form method="get" class="toolbar">
  <label>Category
    <select name="category" onchange="this.form.submit()">
      <option value="0">All categories</option>
      <?php foreach ($categories as $c): ?>
        <option value="<?= (int) $c['id'] ?>" <?= $filter === (int) $c['id'] ? 'selected' : '' ?>><?= e($c['name']) ?></option>
      <?php endforeach; ?>
    </select>
  </label>
  <noscript><button type="submit" class="btn btn-ghost">Filter</button></noscript>
</form>

<div class="table-wrap">
  <table class="data-table">
    <thead>
      <tr><th>Photo</th><th>Name</th><th>Category</th><th>Price</th><th>Colour</th><th>Availability</th><th>On Site</th><th></th></tr>
    </thead>
    <tbody>
    <?php foreach ($products as $p): ?>
      <tr class="<?= $p['is_active'] ? '' : 'row-hidden' ?>">
        <td><?php if ($p['cover']): ?><img src="<?= e(admin_image_src($p['cover'])) ?>" alt="" class="thumb"><?php else: ?><span class="no-photo">No photo</span><?php endif; ?></td>
        <td><a href="product.php?id=<?= (int) $p['id'] ?>" class="strong"><?= e($p['name']) ?></a></td>
        <td><?= e($p['category']) ?></td>
        <td>Rs. <?= number_format((int) $p['price']) ?></td>
        <td><?= e($p['color']) ?></td>
        <td><?= e($p['availability']) ?></td>
        <td>
          <form method="post">
            <?= csrf_field() ?><input type="hidden" name="id" value="<?= (int) $p['id'] ?>"><input type="hidden" name="action" value="toggle">
            <button type="submit" class="pill <?= $p['is_active'] ? 'pill-on' : 'pill-off' ?>"><?= $p['is_active'] ? 'Visible' : 'Hidden' ?></button>
          </form>
        </td>
        <td>
          <div class="actions">
            <a href="<?= e(site_url('product.html?id=' . $p['slug'])) ?>" target="_blank" rel="noopener">View</a>
            <a href="product.php?id=<?= (int) $p['id'] ?>">Edit</a>
            <form method="post" onsubmit="return confirm('Delete <?= e(addslashes($p['name'])) ?>? This cannot be undone.')">
              <?= csrf_field() ?><input type="hidden" name="id" value="<?= (int) $p['id'] ?>"><input type="hidden" name="action" value="delete">
              <button type="submit" class="link-danger">Delete</button>
            </form>
          </div>
        </td>
      </tr>
    <?php endforeach; ?>
    <?php if (!$products): ?>
      <tr><td colspan="8" class="empty">No products yet. <a href="product.php">Add the first one.</a></td></tr>
    <?php endif; ?>
    </tbody>
  </table>
</div>
<?php admin_footer();

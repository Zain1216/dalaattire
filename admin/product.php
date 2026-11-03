<?php
// Add or edit a product, including its photos.

require __DIR__ . '/_init.php';
require_login();

$id = (int) ($_GET['id'] ?? 0);
$categories = db()->query('SELECT id, name FROM categories ORDER BY sort_order, name')->fetchAll();
$availabilities = ['In Stock', 'Made to Order'];

$product = [
    'name' => '', 'slug' => '', 'category_id' => $categories[0]['id'] ?? 0, 'description' => '',
    'price' => '', 'color' => '', 'availability' => 'In Stock', 'is_active' => 1, 'sort_order' => 0,
];
if ($id) {
    $stmt = db()->prepare('SELECT * FROM products WHERE id = ?');
    $stmt->execute([$id]);
    $product = $stmt->fetch();
    if (!$product) {
        flash('That product no longer exists.', 'error');
        redirect('index.php');
    }
}

$errors = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $action = $_POST['action'] ?? 'save';

    // Photo actions on an existing product
    if ($id && in_array($action, ['delete_image', 'cover_image'], true)) {
        $imageId = (int) ($_POST['image_id'] ?? 0);
        $img = db()->prepare('SELECT path FROM product_images WHERE id = ? AND product_id = ?');
        $img->execute([$imageId, $id]);
        $path = $img->fetchColumn();
        if ($path !== false && $action === 'delete_image') {
            db()->prepare('DELETE FROM product_images WHERE id = ?')->execute([$imageId]);
            delete_upload($path);
            flash('Photo removed.');
        } elseif ($path !== false) {
            // Cover = lowest sort order; push everything else after it
            db()->prepare('UPDATE product_images SET sort_order = sort_order + 1 WHERE product_id = ?')->execute([$id]);
            db()->prepare('UPDATE product_images SET sort_order = 0 WHERE id = ?')->execute([$imageId]);
            flash('Cover photo changed.');
        }
        redirect('product.php?id=' . $id);
    }

    $product = array_merge($product, [
        'name'         => trim((string) ($_POST['name'] ?? '')),
        'slug'         => trim((string) ($_POST['slug'] ?? '')),
        'category_id'  => (int) ($_POST['category_id'] ?? 0),
        'description'  => trim((string) ($_POST['description'] ?? '')),
        'price'        => trim((string) ($_POST['price'] ?? '')),
        'color'        => trim((string) ($_POST['color'] ?? '')),
        'availability' => (string) ($_POST['availability'] ?? ''),
        'is_active'    => isset($_POST['is_active']) ? 1 : 0,
        'sort_order'   => (int) ($_POST['sort_order'] ?? 0),
    ]);

    if ($product['name'] === '') {
        $errors[] = 'Name is required.';
    }
    if (!in_array($product['category_id'], array_map('intval', array_column($categories, 'id')), true)) {
        $errors[] = 'Choose a category.';
    }
    if (!ctype_digit($product['price']) || (int) $product['price'] <= 0) {
        $errors[] = 'Price must be a whole number of rupees, e.g. 12999.';
    }
    if (!in_array($product['availability'], $availabilities, true)) {
        $errors[] = 'Choose an availability.';
    }
    $newFiles = uploaded_files('images');
    $hasImages = $id && (int) db()->query('SELECT COUNT(*) FROM product_images WHERE product_id = ' . $id)->fetchColumn() > 0;
    if (!$hasImages && !$newFiles) {
        $errors[] = 'Add at least one photo — products without photos are not shown on the site.';
    }

    if (!$errors) {
        $pdo = db();
        $saved = [];
        try {
            foreach ($newFiles as $file) {
                $saved[] = save_upload($file);
            }
            $pdo->beginTransaction();
            $slug = unique_slug('products', slugify($product['slug'] !== '' ? $product['slug'] : $product['name']), $id);
            $values = [
                $slug, $product['category_id'], $product['name'], $product['description'], (int) $product['price'],
                $product['color'], $product['availability'], $product['is_active'], $product['sort_order'],
            ];
            if ($id) {
                $pdo->prepare('UPDATE products SET slug = ?, category_id = ?, name = ?, description = ?, price = ?, color = ?,
                               availability = ?, is_active = ?, sort_order = ? WHERE id = ?')
                    ->execute(array_merge($values, [$id]));
            } else {
                $pdo->prepare('INSERT INTO products (slug, category_id, name, description, price, color, availability, is_active, sort_order)
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
                    ->execute($values);
                $id = (int) $pdo->lastInsertId();
            }
            $next = (int) $pdo->query('SELECT COALESCE(MAX(sort_order), 0) FROM product_images WHERE product_id = ' . $id)->fetchColumn();
            $insert = $pdo->prepare('INSERT INTO product_images (product_id, path, sort_order) VALUES (?, ?, ?)');
            foreach ($saved as $path) {
                $insert->execute([$id, $path, ++$next]);
            }
            $pdo->commit();
            flash('Product saved.');
            redirect('product.php?id=' . $id);
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            array_walk($saved, 'delete_upload');
            $errors[] = $e instanceof RuntimeException ? $e->getMessage() : 'Could not save the product.';
            if (!($e instanceof RuntimeException)) {
                error_log('product.php: ' . $e->getMessage());
            }
        }
    }
}

$images = [];
if ($id) {
    $stmt = db()->prepare('SELECT id, path FROM product_images WHERE product_id = ? ORDER BY sort_order, id');
    $stmt->execute([$id]);
    $images = $stmt->fetchAll();
}

admin_header($id ? 'Edit ' . $product['name'] : 'Add Product');
?>
<div class="page-head">
  <h1><?= $id ? 'Edit Product' : 'Add Product' ?></h1>
  <div class="head-links">
    <?php if ($id && $product['slug']): ?><a href="<?= e(site_url('product.html?id=' . $product['slug'])) ?>" target="_blank" rel="noopener">View on site</a><?php endif; ?>
    <a href="index.php">&larr; All products</a>
  </div>
</div>

<?php foreach ($errors as $err): ?><p class="flash flash-error"><?= e($err) ?></p><?php endforeach; ?>

<?php if (!$categories): ?>
  <p class="flash flash-error">Add a category first, then come back to add products. <a href="categories.php">Go to Categories</a></p>
<?php endif; ?>

<div class="edit-grid">
  <form method="post" enctype="multipart/form-data" class="card form" id="product-form">
    <?= csrf_field() ?>
    <input type="hidden" name="action" value="save">
    <label>Name*<input name="name" value="<?= e($product['name']) ?>" required maxlength="160"></label>
    <div class="row">
      <label>Category*
        <select name="category_id" required>
          <?php foreach ($categories as $c): ?>
            <option value="<?= (int) $c['id'] ?>" <?= (int) $product['category_id'] === (int) $c['id'] ? 'selected' : '' ?>><?= e($c['name']) ?></option>
          <?php endforeach; ?>
        </select>
      </label>
      <label>Price (Rs.)*<input name="price" value="<?= e((string) $product['price']) ?>" inputmode="numeric" pattern="[0-9]+" required></label>
    </div>
    <div class="row">
      <label>Colour<input name="color" value="<?= e($product['color']) ?>" maxlength="40" placeholder="e.g. Green" list="colour-list"></label>
      <label>Availability*
        <select name="availability">
          <?php foreach ($availabilities as $a): ?>
            <option <?= $product['availability'] === $a ? 'selected' : '' ?>><?= e($a) ?></option>
          <?php endforeach; ?>
        </select>
      </label>
    </div>
    <datalist id="colour-list">
      <?php foreach (db()->query("SELECT DISTINCT color FROM products WHERE color <> '' ORDER BY color") as $row): ?>
        <option value="<?= e($row['color']) ?>">
      <?php endforeach; ?>
    </datalist>
    <label>Description<textarea name="description" rows="4"><?= e($product['description']) ?></textarea></label>
    <div class="row">
      <label>Web address (slug)<input name="slug" value="<?= e($product['slug']) ?>" maxlength="120" placeholder="Made from the name if left empty"></label>
      <label>Sort order<input type="number" name="sort_order" value="<?= (int) $product['sort_order'] ?>"></label>
    </div>
    <label>Add photos<?= $images ? '' : '*' ?><input type="file" name="images[]" accept="image/jpeg,image/png,image/webp" multiple></label>
    <p class="hint">JPG, PNG or WebP, up to <?= (int) round(config()['max_upload_bytes'] / 1048576) ?> MB each. Portrait photos look best.</p>
    <label class="check"><input type="checkbox" name="is_active" <?= $product['is_active'] ? 'checked' : '' ?>> Show this product on the site</label>
    <button type="submit" class="btn">Save Product</button>
  </form>

  <?php if ($id): ?>
  <section class="card">
    <h2>Photos</h2>
    <p class="hint">The first photo is the cover shown in category grids.</p>
    <div class="photo-grid">
      <?php foreach ($images as $i => $img): ?>
        <figure class="photo">
          <img src="<?= e(admin_image_src($img['path'])) ?>" alt="">
          <figcaption>
            <?php if ($i === 0): ?><span class="pill pill-on">Cover</span><?php else: ?>
              <form method="post"><?= csrf_field() ?><input type="hidden" name="action" value="cover_image"><input type="hidden" name="image_id" value="<?= (int) $img['id'] ?>"><button type="submit" class="link">Make cover</button></form>
            <?php endif; ?>
            <?php if (count($images) > 1): ?>
              <form method="post" onsubmit="return confirm('Remove this photo?')"><?= csrf_field() ?><input type="hidden" name="action" value="delete_image"><input type="hidden" name="image_id" value="<?= (int) $img['id'] ?>"><button type="submit" class="link-danger">Remove</button></form>
            <?php endif; ?>
          </figcaption>
        </figure>
      <?php endforeach; ?>
    </div>
  </section>
  <?php endif; ?>
</div>
<?php admin_footer();

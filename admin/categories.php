<?php
// Categories: add, rename, reorder, change banner photo, delete (only when empty).

require __DIR__ . '/_init.php';
require_login();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $action = $_POST['action'] ?? '';
    $id = (int) ($_POST['id'] ?? 0);

    try {
        if ($action === 'delete') {
            $count = db()->prepare('SELECT COUNT(*) FROM products WHERE category_id = ?');
            $count->execute([$id]);
            if ((int) $count->fetchColumn() > 0) {
                flash('This category still has products. Move or delete them first.', 'error');
            } else {
                $hero = db()->prepare('SELECT hero_image FROM categories WHERE id = ?');
                $hero->execute([$id]);
                $path = (string) $hero->fetchColumn();
                db()->prepare('DELETE FROM categories WHERE id = ?')->execute([$id]);
                delete_upload($path);
                flash('Category deleted.');
            }
        } elseif ($action === 'save') {
            $name = trim((string) ($_POST['name'] ?? ''));
            if ($name === '') {
                throw new RuntimeException('Category name is required.');
            }
            $slug = unique_slug('categories', slugify(trim((string) ($_POST['slug'] ?? '')) ?: $name), $id);
            $sort = (int) ($_POST['sort_order'] ?? 0);

            $newHero = null;
            if (($_FILES['hero']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
                $newHero = save_upload($_FILES['hero']);
            }

            if ($id) {
                $old = db()->prepare('SELECT hero_image FROM categories WHERE id = ?');
                $old->execute([$id]);
                $oldHero = (string) $old->fetchColumn();
                db()->prepare('UPDATE categories SET name = ?, slug = ?, sort_order = ?, hero_image = ? WHERE id = ?')
                    ->execute([$name, $slug, $sort, $newHero ?? $oldHero, $id]);
                if ($newHero) {
                    delete_upload($oldHero);
                }
                flash("Category “{$name}” saved.");
            } else {
                db()->prepare('INSERT INTO categories (name, slug, sort_order, hero_image) VALUES (?, ?, ?, ?)')
                    ->execute([$name, $slug, $sort, $newHero ?? 'assets/pages/contact-hero.jpg']);
                flash("Category “{$name}” added.");
            }
        }
    } catch (RuntimeException $e) {
        flash($e->getMessage(), 'error');
    }
    redirect('categories.php');
}

$categories = db()->query(
    'SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS products
     FROM categories c ORDER BY c.sort_order, c.name'
)->fetchAll();

admin_header('Categories');
?>
<div class="page-head">
  <h1>Categories <span class="count"><?= count($categories) ?></span></h1>
</div>

<div class="cat-list">
  <?php foreach ($categories as $c): ?>
  <form method="post" enctype="multipart/form-data" class="card cat-card">
    <?= csrf_field() ?>
    <input type="hidden" name="id" value="<?= (int) $c['id'] ?>">
    <img src="<?= e(admin_image_src($c['hero_image'])) ?>" alt="" class="cat-hero">
    <div class="form">
      <div class="row">
        <label>Name<input name="name" value="<?= e($c['name']) ?>" required maxlength="120"></label>
        <label>Web address (slug)<input name="slug" value="<?= e($c['slug']) ?>" maxlength="80"></label>
      </div>
      <div class="row">
        <label>Sort order<input type="number" name="sort_order" value="<?= (int) $c['sort_order'] ?>"></label>
        <label>New banner photo<input type="file" name="hero" accept="image/jpeg,image/png,image/webp"></label>
      </div>
      <div class="cat-actions">
        <button type="submit" name="action" value="save" class="btn">Save</button>
        <a href="index.php?category=<?= (int) $c['id'] ?>"><?= (int) $c['products'] ?> products</a>
        <a href="<?= e(site_url('category.html?c=' . $c['slug'])) ?>" target="_blank" rel="noopener">View page</a>
        <button type="submit" name="action" value="delete" class="link-danger"
          <?= $c['products'] ? 'disabled title="Move or delete its products first"' : 'onclick="return confirm(\'Delete this category?\')"' ?>>Delete</button>
      </div>
    </div>
  </form>
  <?php endforeach; ?>

  <form method="post" enctype="multipart/form-data" class="card cat-card cat-new">
    <?= csrf_field() ?>
    <input type="hidden" name="action" value="save">
    <h2>Add Category</h2>
    <div class="form">
      <div class="row">
        <label>Name*<input name="name" required maxlength="120" placeholder="e.g. Waistcoat"></label>
        <label>Sort order<input type="number" name="sort_order" value="<?= count($categories) + 1 ?>"></label>
      </div>
      <label>Banner photo<input type="file" name="hero" accept="image/jpeg,image/png,image/webp"></label>
      <button type="submit" class="btn">Add Category</button>
    </div>
  </form>
</div>
<?php admin_footer();

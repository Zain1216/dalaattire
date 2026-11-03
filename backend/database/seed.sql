-- Starting catalog (generated from the site's original product list).
-- Import after schema.sql.
SET NAMES utf8mb4;

INSERT INTO categories (slug, name, hero_image, sort_order) VALUES
  ('sherwani', 'Sherwani', 'assets/pages/services-hero.jpg', 1),
  ('tuxedo', 'Tuxedo', 'assets/pages/about-hero.jpg', 2),
  ('shalwar-kameez', 'Shalwar Kameez', 'assets/pages/contact-store.jpg', 3),
  ('three-piece-suit', '3-Piece Suit', 'assets/footer-bg.jpg', 4);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'beige-sherwani', id, 'Beige Hand Embroidered Sherwani', 'Soft beige cloth with tonal hand embroidery and a classic band collar.', 12999, 'Beige', 'In Stock', 1
  FROM categories WHERE slug = 'sherwani';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'beige-sherwani'), 'assets/pages/sherwani-1.jpg', 1);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'gold-groom-sherwani', id, 'Gold Groom Sherwani', 'Quilted gold sherwani for the groom, finished with a matching collar.', 12999, 'Gold', 'In Stock', 2
  FROM categories WHERE slug = 'sherwani';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'gold-groom-sherwani'), 'assets/pages/sherwani-2.jpg', 1);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'champagne-sherwani', id, 'Champagne Jamawar Sherwani', 'Champagne jamawar with an embroidered collar and cuffs.', 12999, 'Beige', 'In Stock', 3
  FROM categories WHERE slug = 'sherwani';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'champagne-sherwani'), 'assets/pages/sherwani-3.jpg', 1);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'bottle-green-sherwani', id, 'Bottle Green Sherwani', 'Bottle green sherwani with gold threadwork along the front opening.', 12999, 'Green', 'In Stock', 4
  FROM categories WHERE slug = 'sherwani';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'bottle-green-sherwani'), 'assets/products/bottle-green-sherwani.jpg', 1);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'steel-blue-sherwani', id, 'Steel Blue Embroidered Sherwani', 'Steel blue jacquard with ivory floral embroidery and pearl buttons.', 12999, 'Blue', 'In Stock', 5
  FROM categories WHERE slug = 'sherwani';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'steel-blue-sherwani'), 'assets/products/steel-blue-sherwani.jpg', 1);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'emerald-angrakha-sherwani', id, 'Emerald Angrakha Sherwani', 'Angrakha-style emerald sherwani with an embroidered panel.', 12999, 'Green', 'In Stock', 6
  FROM categories WHERE slug = 'sherwani';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'emerald-angrakha-sherwani'), 'assets/products/emerald-angrakha-sherwani.jpg', 1);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'emerald-sherwani', id, 'Emerald Embroidered Sherwani', 'Deep emerald jamawar with an asymmetric front and hand-worked antique gold embroidery.', 48000, 'Green', 'In Stock', 7
  FROM categories WHERE slug = 'sherwani';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'emerald-sherwani'), 'assets/products/emerald-sherwani.jpg', 1),
  ((SELECT id FROM products WHERE slug = 'emerald-sherwani'), 'assets/products/emerald-sherwani-detail-1.jpg', 2),
  ((SELECT id FROM products WHERE slug = 'emerald-sherwani'), 'assets/products/emerald-sherwani-detail-2.jpg', 3);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'ivory-sherwani', id, 'Ivory Sherwani with Shawl', 'Ivory jamawar with an embroidered collar and a matching draped shawl.', 12999, 'Ivory', 'In Stock', 8
  FROM categories WHERE slug = 'sherwani';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'ivory-sherwani'), 'assets/products/ivory-sherwani.jpg', 1);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'navy-embroidered-sherwani', id, 'Navy Embroidered Sherwani', 'Navy silk with silver embroidery down the front panel and cuffs.', 12999, 'Blue', 'In Stock', 9
  FROM categories WHERE slug = 'sherwani';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'navy-embroidered-sherwani'), 'assets/products/navy-embroidered-sherwani.jpg', 1);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'maroon-velvet-sherwani', id, 'Maroon Velvet Sherwani', 'Rich maroon velvet with antique gold floral embroidery on the hem and sleeves.', 12999, 'Maroon', 'Made to Order', 10
  FROM categories WHERE slug = 'sherwani';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'maroon-velvet-sherwani'), 'assets/products/maroon-velvet-sherwani.jpg', 1);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'green-velvet-sherwani', id, 'Green Velvet Sherwani', 'Deep green velvet with gold floral embroidery for winter weddings.', 12999, 'Green', 'Made to Order', 11
  FROM categories WHERE slug = 'sherwani';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'green-velvet-sherwani'), 'assets/products/green-velvet-sherwani.jpg', 1);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'navy-velvet-sherwani', id, 'Navy Velvet Sherwani', 'Navy velvet with paisley and lattice embroidery in antique gold.', 12999, 'Blue', 'Made to Order', 12
  FROM categories WHERE slug = 'sherwani';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'navy-velvet-sherwani'), 'assets/products/navy-velvet-sherwani.jpg', 1);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'white-dinner-jacket-tuxedo', id, 'White Dinner Jacket Tuxedo', 'Ivory dinner jacket with a shawl collar, worn with a black bow tie.', 12999, 'Ivory', 'In Stock', 13
  FROM categories WHERE slug = 'tuxedo';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'white-dinner-jacket-tuxedo'), 'assets/pages/tuxedo-1.jpg', 1);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'classic-black-tuxedo', id, 'Classic Black Tuxedo', 'Single-breasted black tuxedo with satin shawl lapels.', 12999, 'Black', 'In Stock', 14
  FROM categories WHERE slug = 'tuxedo';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'classic-black-tuxedo'), 'assets/pages/tuxedo-2.jpg', 1);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'black-tie-tuxedo', id, 'Black Tie Peak Lapel Tuxedo', 'Black tuxedo with peak lapels for formal evening events.', 12999, 'Black', 'In Stock', 15
  FROM categories WHERE slug = 'tuxedo';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'black-tie-tuxedo'), 'assets/pages/tuxedo-3.jpg', 1);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'brown-pinstripe-tuxedo', id, 'Brown Pinstripe Double-Breasted Tuxedo', 'Double-breasted brown pinstripe with a soft structured shoulder.', 12999, 'Brown', 'Made to Order', 16
  FROM categories WHERE slug = 'tuxedo';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'brown-pinstripe-tuxedo'), 'assets/products/brown-pinstripe-tuxedo.jpg', 1);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'brown-tuxedo', id, 'Brown Tuxedo with Waistcoat', 'Brown tuxedo with a double-breasted contrast waistcoat and bow tie.', 12999, 'Brown', 'Made to Order', 17
  FROM categories WHERE slug = 'tuxedo';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'brown-tuxedo'), 'assets/products/brown-tuxedo.jpg', 1);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'olive-shalwar-kameez', id, 'Olive Shalwar Kameez with Waistcoat', 'Olive shalwar kameez paired with a matching band-collar waistcoat.', 12999, 'Green', 'In Stock', 18
  FROM categories WHERE slug = 'shalwar-kameez';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'olive-shalwar-kameez'), 'assets/pages/shalwar-1.jpg', 1);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'charcoal-shalwar-kameez', id, 'Charcoal Shalwar Kameez', 'Charcoal grey kameez with a shirt collar and concealed placket.', 12999, 'Grey', 'In Stock', 19
  FROM categories WHERE slug = 'shalwar-kameez';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'charcoal-shalwar-kameez'), 'assets/pages/shalwar-2.jpg', 1);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'sage-shalwar-kameez', id, 'Sage Shalwar Kameez', 'Sage green kameez with a band collar and front pocket.', 12999, 'Green', 'In Stock', 20
  FROM categories WHERE slug = 'shalwar-kameez';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'sage-shalwar-kameez'), 'assets/pages/shalwar-3.jpg', 1);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'beige-shalwar-kameez', id, 'Beige Shalwar Kameez', 'Beige kameez with a contrast collar and patch pocket.', 12999, 'Beige', 'In Stock', 21
  FROM categories WHERE slug = 'shalwar-kameez';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'beige-shalwar-kameez'), 'assets/products/beige-shalwar-kameez.jpg', 1);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'navy-shalwar-kameez', id, 'Navy Shalwar Kameez', 'Deep navy kameez with a classic collar for evening wear.', 12999, 'Blue', 'In Stock', 22
  FROM categories WHERE slug = 'shalwar-kameez';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'navy-shalwar-kameez'), 'assets/products/navy-shalwar-kameez.jpg', 1);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'olive-three-piece-suit', id, 'Olive Three-Piece Suit', 'Olive wool three-piece with notch lapels and a matching waistcoat.', 12999, 'Green', 'In Stock', 23
  FROM categories WHERE slug = 'three-piece-suit';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'olive-three-piece-suit'), 'assets/products/olive-three-piece-suit.jpg', 1);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'navy-three-piece-suit', id, 'Navy Three-Piece Suit', 'Navy single-breasted three-piece, cut slim with a matching waistcoat.', 12999, 'Blue', 'In Stock', 24
  FROM categories WHERE slug = 'three-piece-suit';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'navy-three-piece-suit'), 'assets/pages/about-portrait.jpg', 1);

INSERT INTO products (slug, category_id, name, description, price, color, availability, sort_order)
  SELECT 'navy-double-breasted-suit', id, 'Navy Double-Breasted Suit', 'Navy double-breasted suit with peak lapels and a waistcoat.', 12999, 'Blue', 'Made to Order', 25
  FROM categories WHERE slug = 'three-piece-suit';
INSERT INTO product_images (product_id, path, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'navy-double-breasted-suit'), 'assets/tailoring-008.jpg', 1);


-- Daula Attire catalog: categories, products and product photos.
-- Import into an empty database (phpMyAdmin > Import, or `php backend/setup.php`).

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(80)  NOT NULL UNIQUE,
  name        VARCHAR(120) NOT NULL,
  hero_image  VARCHAR(255) NOT NULL DEFAULT '',
  sort_order  INT          NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug          VARCHAR(120) NOT NULL UNIQUE,
  category_id   INT UNSIGNED NOT NULL,
  name          VARCHAR(160) NOT NULL,
  description   TEXT         NOT NULL,
  price         INT UNSIGNED NOT NULL,
  color         VARCHAR(40)  NOT NULL DEFAULT '',
  availability  ENUM('In Stock', 'Made to Order') NOT NULL DEFAULT 'In Stock',
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order    INT          NOT NULL DEFAULT 0,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_products_category (category_id, is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_images (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id  INT UNSIGNED NOT NULL,
  path        VARCHAR(255) NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 0,
  CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES products (id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_images_product (product_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admins (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username       VARCHAR(60)  NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Login sessions for the admin app (only a hash of each token is stored)
CREATE TABLE IF NOT EXISTS admin_tokens (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id    INT UNSIGNED NOT NULL,
  token_hash  CHAR(64)     NOT NULL UNIQUE,
  expires_at  DATETIME     NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tokens_admin FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE,
  INDEX idx_tokens_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Failed logins, used to slow down password guessing
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ip            VARCHAR(45)  NOT NULL,
  username      VARCHAR(60)  NOT NULL,
  attempted_at  DATETIME     NOT NULL,
  INDEX idx_attempts_ip (ip, attempted_at),
  INDEX idx_attempts_user (username, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

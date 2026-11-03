# Going live: GitHub Pages + Hostinger backend

| Part | Where it lives | Address |
|---|---|---|
| Website (HTML, CSS, JS, photos) | GitHub Pages | https://zain1216.github.io/dalaattire/ |
| Catalog API | Hostinger | https://subscription.zainulabideen.tech/daula-attire/backend/api/catalog.php |
| Admin panel | Hostinger | https://subscription.zainulabideen.tech/daula-attire/admin/ |
| MySQL database | Hostinger | (only the backend talks to it) |

The subdomain already runs another app at its root, so everything for Daula Attire goes in its own
**`daula-attire`** folder. Do not upload into the subdomain's root.

---

## 1. Create the database (hPanel)

1. hPanel → **Databases → MySQL Databases**.
2. Create a database, a user and a strong password. Hostinger adds a prefix, e.g.
   database `u123456789_daula`, user `u123456789_daula`.
3. Write the three values down — you need them in step 3.

## 2. Import the tables (phpMyAdmin)

1. Next to the new database click **Enter phpMyAdmin**.
2. **Import** → choose `backend/database/schema.sql` → **Go**.
3. **Import** again → choose `backend/database/seed.sql` → **Go**
   (adds the 4 categories and 25 products the site has today).

## 3. Upload the backend (File Manager)

1. hPanel → **Files → File Manager** → open the subdomain's folder
   (usually `domains/zainulabideen.tech/public_html/subscription`, or whatever folder the subdomain points to).
2. Create a folder named **`daula-attire`** inside it.
3. Upload `hostinger-upload.zip` into `daula-attire` and **Extract** it there. It contains only:
   ```
   daula-attire/
     backend/   (API, config sample, SQL files)
     admin/     (admin panel)
     uploads/   (photos you upload in the admin go here)
   ```
4. The zip already contains `backend/config.php` with the live database settings (built from
   `backend/config.hostinger.php` on your computer). If you change the database password later,
   edit `daula-attire/backend/config.php` in File Manager, or update `config.hostinger.php` and rebuild.
   Neither file is ever pushed to GitHub.

## 4. Check it works

1. Open https://subscription.zainulabideen.tech/daula-attire/backend/api/catalog.php
   — you should see JSON starting with `{"categories":{"sherwani":...`.
2. Open https://subscription.zainulabideen.tech/daula-attire/backend/config.php
   — this must show **403 Forbidden** (the password file is protected).

## 5. Create your admin account

Open https://subscription.zainulabideen.tech/daula-attire/admin/setup.php, choose a username and a
password of 10+ characters. This page works only once, then locks itself.
Afterwards log in at https://subscription.zainulabideen.tech/daula-attire/admin/

## 6. Done

The GitHub site already asks this backend for its products (see `BACKEND_URL` in `script.js`).
Products and categories you add, edit or hide in the admin show up on the live site within about a
minute — no code change or push needed.

If the backend is ever unreachable, the site falls back to its built-in product list, so it never
shows an empty shop.

---

### Updating the backend later

Run `php backend/build-upload.php` on your computer to rebuild `hostinger-upload.zip`, upload it
to `daula-attire` and extract it, choosing **overwrite**. The photos in `uploads/` on the server are
not inside the zip, so they are kept.

### Working locally (XAMPP)

```bash
php backend/setup.php
php -S 127.0.0.1:8090 -t .
```
Then open http://127.0.0.1:8090/ (site) and http://127.0.0.1:8090/admin/ (admin). On localhost the
site uses the local backend instead of Hostinger.

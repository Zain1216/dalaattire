# Going live: GitHub Pages + Hostinger backend

| Part | Where it lives | Address |
|---|---|---|
| Website (HTML, CSS, JS, photos) | GitHub Pages | https://zain1216.github.io/dalaattire/ |
| **Admin panel** (HTML/JS app) | GitHub Pages | https://zain1216.github.io/dalaattire/admin/ |
| Catalog API (for the website) | Hostinger | https://subscription.zainulabideen.tech/daula-attire/backend/api/catalog.php |
| Admin API (for the admin panel) | Hostinger | https://subscription.zainulabideen.tech/daula-attire/backend/api/admin.php |
| MySQL database + uploaded photos | Hostinger | only the backend talks to them |

GitHub Pages cannot run PHP, so the admin panel is a plain HTML/JS app on GitHub that sends every
change to the admin API on Hostinger. The subdomain already runs another app at its root, so
everything for Daula Attire on Hostinger lives in its own **`daula-attire`** folder.

---

## 1. Database (hPanel) — done once

1. hPanel → **Databases → MySQL Databases**: database and user `u194310732_daula`.
2. **phpMyAdmin** → select the database → **Import** `backend/database/schema.sql`, then `backend/database/seed.sql`.
   (Already done? Skip it. The admin API creates its two login tables by itself.)

## 2. Upload the backend (File Manager)

1. On your computer, build the upload file:
   ```bash
   C:\xampp\php\php.exe backend/build-upload.php
   ```
   This creates `hostinger-upload.zip` with `backend/` (API + your live `config.php`) and `uploads/`.
2. hPanel → **Files → File Manager** → open the subdomain's folder → open **`daula-attire`**
   (create it if it does not exist).
3. **If there is an old `admin` folder inside `daula-attire`, delete it.** The admin panel now runs from
   GitHub; the old PHP admin pages are no longer used.
4. Upload `hostinger-upload.zip` into `daula-attire` and **Extract** it, choosing **overwrite**.
   Photos already in `uploads/` are kept.

## 3. Check it works

1. https://subscription.zainulabideen.tech/daula-attire/backend/api/catalog.php — shows JSON starting with `{"categories":`.
2. https://subscription.zainulabideen.tech/daula-attire/backend/config.php — must show **403 Forbidden**.

## 4. Push the website to GitHub

Commit and push as usual. GitHub Pages publishes the website and the admin app.

## 5. Use the admin panel

Open **https://zain1216.github.io/dalaattire/admin/**
- First time (no admin account yet): it shows **Create Admin Account**. This works only once.
- After that: log in, then add, edit, hide or delete products and categories and upload photos.
  Changes appear on the live website within about a minute.
- A login lasts 12 hours (`session_hours` in `config.php`). After 10 wrong passwords, logging in is
  blocked for 15 minutes.

---

### How the pieces trust each other

- The admin API only answers browsers on `https://zain1216.github.io`, on the backend itself, and on
  `localhost` (for working on your computer). Other websites get **403**. Change the list in
  `allowed_origins` in `config.php` if the website moves to your own domain.
- Logging in gives the browser a random token; every change sends it. Logging out (or 12 hours)
  makes it useless. Only a hash of the token is stored in the database.
- `config.php` (database password) is only on Hostinger and in `backend/config.hostinger.php` on your
  computer. Neither is ever pushed to GitHub.

### Updating the backend later

Rebuild `hostinger-upload.zip` (step 2.1), upload it to `daula-attire` and extract with **overwrite**.

### Working locally (XAMPP)

```bash
C:\xampp\php\php.exe backend/setup.php
C:\xampp\php\php.exe -S 127.0.0.1:8090 -t .
```
Open http://127.0.0.1:8090/ (website) and http://127.0.0.1:8090/admin/ (admin). On localhost both use
the local backend instead of Hostinger.

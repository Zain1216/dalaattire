<?php
// Copy this file to config.php and fill in your database details.
// config.php is not committed to Git, so live passwords stay off GitHub.

return [
    'db' => [
        'host'     => '127.0.0.1',
        'port'     => 3306,
        'name'     => 'daula_attire',
        'user'     => 'root',
        'password' => '',          // XAMPP default is an empty password
    ],

    // Public address of the storefront (GitHub Pages), without a trailing slash.
    // Used for "View on site" links and for showing the site's built-in photos (assets/...) in the admin.
    // Leave empty when the storefront and backend are on the same server (local XAMPP).
    'site_url' => '',              // live: 'https://zain1216.github.io/dalaattire'

    // Public address of this backend folder, without a trailing slash.
    // Photos uploaded in the admin are served from here, so the API returns full links to them.
    // Leave empty to work it out from the request (fine on most hosts).
    'backend_url' => '',           // live: 'https://subscription.zainulabideen.tech/daula-attire'

    // Where admin uploads are saved, relative to the backend folder's root.
    'upload_dir' => 'uploads/products',

    // Largest photo an admin may upload, in bytes (5 MB).
    'max_upload_bytes' => 5 * 1024 * 1024,
];

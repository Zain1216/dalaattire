<?php
// Builds hostinger-upload.zip in the project root: the backend/, admin/ and uploads/ folders
// ready to extract into the "daula-attire" folder on Hostinger.
// Leaves out the local config.php and any uploaded photos. If backend/config.hostinger.php exists,
// it goes into the zip as backend/config.php, so the live settings arrive ready to use.
//   php backend/build-upload.php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Run this from the command line.');
}

$root = realpath(__DIR__ . '/..');
$zipPath = $root . '/hostinger-upload.zip';
@unlink($zipPath);

$zip = new ZipArchive();
if ($zip->open($zipPath, ZipArchive::CREATE) !== true) {
    exit("Could not create {$zipPath}\n");
}

$skip = ['backend/config.php', 'backend/config.hostinger.php', 'backend/build-upload.php'];
$count = 0;
foreach (['backend', 'admin'] as $folder) {
    $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root . '/' . $folder, FilesystemIterator::SKIP_DOTS));
    foreach ($files as $file) {
        $rel = str_replace('\\', '/', substr($file->getPathname(), strlen($root) + 1));
        if (in_array($rel, $skip, true)) {
            continue;
        }
        $zip->addFile($file->getPathname(), $rel);
        $count++;
    }
}
// Upload folder with its safety rules, but none of the local test photos
$zip->addFile($root . '/uploads/.htaccess', 'uploads/.htaccess');
$zip->addEmptyDir('uploads/products');
$count++;

$live = $root . '/backend/config.hostinger.php';
if (is_file($live)) {
    $zip->addFile($live, 'backend/config.php');
    $count++;
}

$zip->close();
printf("Built hostinger-upload.zip with %d files%s.\n", $count, is_file($live) ? ' (includes live config.php)' : ' (no live config: create backend/config.php on the server)');

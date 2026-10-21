<?php

require __DIR__ . '/../vendor/autoload.php';

use App\Config\Rutas;
use Dotenv\Dotenv;

Dotenv::createImmutable(__DIR__ . '/..')->safeLoad();

(new Rutas())->despachar();

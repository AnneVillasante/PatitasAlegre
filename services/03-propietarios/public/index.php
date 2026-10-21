<?php

require __DIR__ . '/../vendor/autoload.php';

use App\Config\Rutas;
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->safeLoad();

$rutas = new Rutas();
$rutas->despachar();

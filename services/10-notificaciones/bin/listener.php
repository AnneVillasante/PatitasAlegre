<?php

require __DIR__ . '/../vendor/autoload.php';

use App\Eventos\EventoListener;
use Dotenv\Dotenv;

Dotenv::createImmutable(__DIR__ . '/..')->safeLoad();
(new EventoListener())->escuchar();

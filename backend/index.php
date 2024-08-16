<?php
require './vendor/autoload.php';

use Course\Map\MapPoints\MapPointsTable;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Slim\App;

$file = file_get_contents('config.json');
$config = json_decode($file, true);
$pdo = new PDO('sqlite:' . __DIR__ . $config['database_path']);
$table = new MapPointsTable($pdo);
$controller = new Controller($table);

$app = new App;
$app->get('/hello/{name}', function (Request $request, Response $response) {
    $name = $request->getAttribute('name');
    $response->getBody()->write("Hello, $name");

    return $response;
});

$app->run();

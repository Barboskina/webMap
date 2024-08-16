<?php

namespace Course\Map\MapPoints;

use Exception;
use PDO;

class MapPointsTable {
    protected PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function getLevelList(int $level, int $zoom): array {
        try {
            $sql = 'SELECT * FROM points WHERE level = :level AND zoom = :zoom';
            $query = $this->pdo->prepare($sql);
            if (!$query) {
                throw new Exception('Запрос на выбор объектов карты построен некорректно.');
            }
            $query->bindValue(':level', $level, PDO::PARAM_INT);
            $query->bindValue(':zoom', $zoom, PDO::PARAM_INT);
            $result = $query->execute();

            if (!$result) {
                throw new Exception('Прои выполнении запроса на выбор объектов карты произошла ошибка.');
            }

            $array = array();
            while ($row = $query->fetch(PDO::FETCH_ASSOC)) {
                $array[] = $row;
            }
        } catch (Exception $e) {
            throw new MapPointsException('Ошибка выбора объектов карты', previous: $e);
        }

        return $array;
    }

    public function getSearchPoints(): array {
        $sql = 'SELECT * FROM points WHERE name LIKE ? LIMIT 1';
        return array();
    }
}
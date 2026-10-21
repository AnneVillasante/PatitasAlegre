<?php

namespace App\Xml;

use RuntimeException;
use SimpleXMLElement;

class XmlParser
{
    public function parsear(string $xmlString): array
    {
        if (empty(trim($xmlString))) {
            throw new RuntimeException('XML vacío');
        }

        libxml_use_internal_errors(true);
        $xml = simplexml_load_string($xmlString);
        if ($xml === false) {
            $errors = libxml_get_errors();
            libxml_clear_errors();
            $message = $errors ? trim($errors[0]->message) : 'XML inválido';
            throw new \InvalidArgumentException('XML malformado: ' . $message);
        }

        return $this->convertir($xml);
    }

    private function convertir(SimpleXMLElement $xml): array
    {
        $result = [];
        foreach ($xml->children() as $child) {
            $name = $child->getName();
            if ($child->count() > 0) {
                $result[$name] = $this->convertir($child);
            } else {
                $value = trim((string) $child);
                $result[$name] = $value !== '' ? $value : null;
            }
        }
        return $result;
    }
}

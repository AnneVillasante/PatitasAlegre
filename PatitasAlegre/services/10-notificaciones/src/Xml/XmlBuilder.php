<?php

namespace App\Xml;

use SimpleXMLElement;

class XmlBuilder
{
    public function buildSuccess(string $rootElement, array $data): string
    {
        $xml = new SimpleXMLElement("<{$rootElement}/>");
        $this->arrayToXml($data, $xml);
        return $xml->asXML();
    }

    public function buildError(string $rootElement, string $codigo, string $mensaje): string
    {
        return $this->buildSuccess($rootElement, [
            'codigo' => $codigo,
            'estado' => 'FALLIDO',
            'mensaje' => $mensaje,
        ]);
    }

    private function arrayToXml(array $data, SimpleXMLElement $xml): void
    {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $node = $xml->addChild(is_numeric($key) ? 'item' : (string) $key);
                $this->arrayToXml($value, $node);
                continue;
            }
            $xml->addChild(
                (string) $key,
                htmlspecialchars((string) ($value ?? ''), ENT_XML1, 'UTF-8')
            );
        }
    }
}

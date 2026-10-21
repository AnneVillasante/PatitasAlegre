# WSO2 EI artifacts

`proxy-services/` contiene los cinco proxies Synapse y `xsd/` sus contratos de entrada.

1. Copiar los XSD a `repository/deployment/server/synapse-configs/default/registry/entries/xsd/` o registrarlos como recursos `conf:/xsd/`.
2. Importar los XML de `proxy-services/` desde WSO2 EI o copiarlos a la carpeta de proxies.
3. Levantar los servicios backend en 8003, 8005, 8007, 8008 y 8010.
4. Probar los endpoints en `http://localhost:8280/services/{ProxyName}`.

Los proxies enrutan por el elemento raíz del XML y registran `ESB_ORIGIN=WSO2`. La configuración de endpoints está en `config/esb-endpoints.json`.

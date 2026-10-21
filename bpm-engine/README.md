# BPM engine artifacts

El proceso `procesos/ProcesoCrearCita.bpel` define la secuencia de invocaciones y `procesos/deploy.xml` el descriptor base de despliegue.

Antes de desplegar en WSO2 BPS hay que empaquetar también los WSDL con los partner links `ClientePLT`, `PropietariosPLT`, `VeterinariosPLT`, `CitasPLT` y `NotificacionesPLT`. El repositorio actual expone XML/HTTP, por lo que esos WSDL deben usar los proxies Synapse como fachada.

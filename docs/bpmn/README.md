# Orquestación Crear Cita

`proceso-cita.bpmn` modela el orden de validación y creación:

1. Verificar propietario mediante `PropietariosProxy`.
2. Verificar veterinario mediante `VeterinariosProxy`.
3. Crear la cita mediante `CitasProxy`.
4. Notificar mediante `NotificacionesProxy`.
5. Terminar con éxito o rechazo en los gateways.

El BPEL de referencia está en `bpm-engine/procesos/ProcesoCrearCita.bpel`. Para desplegarlo en WSO2 BPS se deben asociar WSDL y partner links con los proxies Synapse. Los servicios actuales exponen XML sobre HTTP; el adaptador WSDL/REST debe configurarse en el paquete de despliegue del BPS.

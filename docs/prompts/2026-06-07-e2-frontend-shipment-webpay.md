# Session: 2026-06-07 — Frontend-shipment-webpay

Se utilizó el modelo a través de chat para poder orientar el trabajo, muchas de las sugerencias fueron adaptadas o no consideradas en el proyecto. Se utilizó para la creación de algunas de las vistas y la elaboaración de tests. Los archivos mencionados en cada promts fueron adjuntados al momento de realizar la consulta.

## Participantes

- Usuario: OrianaCrescio
- Modelo: OpenAI GPT5.3

## Promt 1

Hagamos todas las vistas con botones redondos, los de confirmar cosas que sean de un color verde y los de cancelar que sean rojos. Utiliza una paleta de colores que siga con estas vistas, tengo este archivo index.

## Respuesta (Resumen)

Entrega un archivo index con clases para unificar las vistas de toda la página. Se decidió usar dicho archivo.

## Prompt 2

El backend me pasó esta información, algunos de los endpoints requieren el token de autenticacion (estamos usando auth0 como autenticador):
"1. Cotización (RF02) — POST /quotes
// req
{ "destinationId":"COR","height":100,"width":80,"depth":50,"criteria":"price","maxHops":5 }
// res 200
{ "destinationId":"COR","criteria":"price","routeMetricCost":12000,"hops":3,"nextHop":"HGW",
"path":["HGW","RNC","COR"],"fPrice":1,"amount":15000,"reachable":true,"maxHopsOk":true } 2. Crear envío (RF01) — POST /shipments
// req (campos de quote + opcionales)
{ "destinationId":"COR","height":100,"width":80,"depth":50,"criteria":"price","maxHops":5,
"deliverNotBefore":"2026-06-10T12:00:00Z","metaContent":"frágil" }
// res 201
{ "shipmentId":"uuid","packageId":"uuid","amount":15000,"quote":{...} }
. Iniciar pago (RF03) — POST /payments
// req
{ "shipmentId":"uuid" }
// res 201
{ "paymentId":"uuid","token":"webpay-token","url":"https://webpay.../initTransaction" }
Redirige a Webpay con un form auto-submit:

<form action={url} method="POST">
  <input type="hidden" name="token_ws" value={token} />
</form>
POST /payments/commit
// req  (acepta token_ws o ws_token; si no hay token → anulada, sin error)
{ "token_ws":"<valor del query>" }
// res 200
{ "status":"SUCCESS","reason":null,"message":"Transacción aceptada.",
  "paymentId":"uuid","shipmentId":"uuid","amount":15000,"currency":"CLP",
  "authorizationCode":"1213","transactionDate":"2026-05-20T12:03:00Z" }

 Historial (RF05) — GET /shipments?page=1&limit=25

{ "data":[ { "id":"uuid","packageId":"uuid","originId":"HGW","destinationId":"COR",
"criteria":"price","amount":15000,"hops":3,"nextHop":"HGW","routeMetricCost":12000,
"routePath":["HGW","RNC","COR"],"status":"sent","createdAt":"...",
"payment":{ "id":"uuid","status":"SUCCESS","amount":15000,"authorizationCode":"1213",
"transactionDate":"...","reason":null } } ],
"meta":{ "total":1,"page":1,"limit":25,"totalPages":1 } }"
Estaremos trabajando con el frontend de la app segun los siguientes requisitos:
RF01 (3 ptos) (Esencial): La aplicación debe permitir que un usuario autenticado cree una solicitud de envío de paquete, indicando ciudad destino,
dimensiones, criterio de ruteo, maxHops, deliverNotBefore y metaContent. Debe validar dimensiones, alcanzabilidad y que maxHops alcance para la ruta
seleccionada.
RF02 (3 ptos): La aplicación debe calcular y mostrar una cotización antes del pago, incluyendo criterio usado, routeMetricCost, cantidad de saltos, siguiente
salto o ruta, f_price y precio final
RF05 (2 ptos): La aplicación debe ofrecer una vista donde cada usuario pueda revisar sus envíos, pagos, estados de compra y estado del envío inicial.
RF08 (2 ptos): Debe poder accederse a la interfaz de admin con las capacidades solicitadas
RNF04 (2 ptos): El frontend administrador debe mostrar un indicador visible de disponibilidad del servicio de jobs/workers usando /heartbeat o mecanismo
equivalente
RNF05 (3 ptos) (Esencial): La aplicación debe separar permisos entre usuarios normales y administradores. Los usuarios normales solo pueden ver y operar
sus propios envíos; los admins acceden a las vistas operacionales heredadas de E1 y nuevas vistas de rutas/jobs/pagos.

## Respuesta

Entrega sugerencia para los archivos de shipmentService, CreateShipmentPage, MyShipmentsPage, ShipmentDetailPage, paymentService, paymentReturnPage, webpayRedirect, heartbeatService y WorkerHeartbeat de los cuales se decidió implementar la solución propuesta. Sin embargo, para algunas de las soluciones propuestas se decidió colocar funciones en un archivo de formatters para evitar la duplicación de éstas.

## Promt 3 (Resumen)

Se le entregó los archivos: LandingPage, WorkerHeartbeat, CreateShipmentPage, MyShipmentPage, PaymentReturnPage y ShipmentDetailPage pidiendo tests para ellos.

## Respuesta (resumen)

Entrega sugerencia para los tests. Se decidió utilizar la sugerencia con algunos cambios en los strings que se pedían estar en la página ya que los tests no corrían porque los textos no eran exactamente iguales.

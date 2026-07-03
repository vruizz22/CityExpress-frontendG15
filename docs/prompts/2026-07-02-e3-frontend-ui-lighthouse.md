# Session: 2026-06-07 — Frontend-shipment-webpay

Se utilizó el modelo a través de chat para poder orientar el trabajo, muchas de las sugerencias fueron adaptadas o no consideradas en el proyecto. Se utilizó para la creación de algunas de las vistas y la elaboaración de tests. Los archivos mencionados en cada promts fueron adjuntados al momento de realizar la consulta.

## Participantes

- Usuario: OrianaCrescio
- Modelo: OpenAI GPT5.3

## Promt (resumen)

Se le entregó los archivos de los componentes y las páginas para mejorar la UI. Se sugirió usar tailwind o shadcn para mejorar y modernizar las vistas. Además se pidió consejo sobre cómo obligar a que CD no ocurra si CI no pasa (evitar que se realicen de forma paralela que es lo que teníamos anteriormente). Por último se pidió agregar un par de tests para alcanzar un coverage de 75%.

## Respuesta (Resumen)

Entrega un archivo index con clases para unificar las vistas de toda la página. Se decidió usar dicho archivo. Además sugirió modificar algunos de los archivos de componentes y páginas para mejorar la UI ya que con el css no era suficiente. Además, sugirió cambiar el archivo de workflows para que no se haga el deploy en cada push sino cuando se pasa el CI. Sugirió no usar componentes nuevos de Shadcn ya que implicaría mucho cambio en el código, se tomó esta sugerencia y se buscó mejorar las vistas de mejor manera usando css y mínimo cambio en los archivos jsx.

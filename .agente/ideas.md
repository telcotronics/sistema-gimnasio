# ideas.md — Ideas y posibilidades

> Especulativo — "podría ser interesante si...". Sin compromiso.
> Cuando una idea se aprueba y se decide que debe hacerse, moverla a `objetivos.md`.
> Cuando una idea pasa directamente a ejecución, moverla a `proyecto_memoria.md`.

---

## Ideas pendientes

### Integración de lector de huella dactilar / biométrico
- **Descripción:** Permitir el registro y validación de visitas/ingresos a través de un lector biométrico USB conectado a la computadora de la recepción.
- **Notas:** Requiere una extensión o app nativa pequeña que sirva de puente entre el lector de huellas y la app web.

### Notificaciones de vencimiento automáticas
- **Descripción:** Enviar un correo electrónico automatizado a los miembros (ej. 3 días antes de que expire su membresía) utilizando la pasarela SMTP del ecosistema (`smtp.sigmac.app`).
- **Notas:** El servidor debería correr una tarea cron diaria que analice las fechas de vencimiento de las membresías de los socios y dispare los emails correspondientes.

### Aplicación móvil para los Socios (CUSTOMERS)
- **Descripción:** Crear la aplicación móvil "CUSTOMERS" que les permita a los socios ver su código QR de acceso en el celular, revisar su historial de pagos, reservar clases o áreas del gimnasio.
- **Notas:** Planeado como un proyecto satélite en Flutter o React Native consumiendo la misma `API-SIGMA-CLOUD`.

---

## Ideas en borrador

- Módulo de reservas de clases dirigidas (Spinning, Crossfit, etc.) con cupos limitados.
- Generador de rutinas y planes de entrenamiento personalizados para los instructores.
- Gráficas de peso y progreso corporal de los socios en sus perfiles.

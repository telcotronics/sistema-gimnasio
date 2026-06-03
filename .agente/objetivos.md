# objetivos.md — Objetivos del proyecto

> Cosas que deben implementarse o cumplirse, sin importar cuándo.
> Describen QUÉ — no cómo. El cómo va en proyecto_memoria.md cuando se ejecuta.
>
> Flujo: ideas.md → objetivos.md → (en ejecución) → proyecto_memoria.md

---

## Pendientes

| # | Objetivo | Origen | Prioridad |
|---|----------|--------|-----------|
| 1 | Migrar módulo Miembros a API-SIGMA-CLOUD (resolver duplicidad de componentes) | Backlog TAREA-03 | Alta |
| 2 | Migrar módulos restantes de HttpService (Pagos, Visitas, Membresías, Usuarios, Configuración, Chat) | Backlog TAREA-04 | Alta |
| 3 | Implementar guardado de ventas e impresión de tickets en `genera_venta.vue` | Backlog TAREA-05 | Alta |
| 4 | Completar el módulo de Inventario de Productos (conectar backend y crear listado) | Backlog TAREA-06 | Alta |
| 5 | Conectar Dashboard con endpoints de estadísticas reales de la API | Backlog TAREA-07 | Media |
| 6 | Implementar módulo de Cuentas por Cobrar (CXC) | Backlog TAREA-08 | Media |
| 7 | Implementar módulo de Abonos vinculados a CXC | Backlog TAREA-09 | Media |
| 8 | Migrar diseño y estilos de los módulos legados al Sistema B (CSS custom oscuro + Lexend) | Backlog TAREA-10 | Baja |
| 9 | Agregar validaciones a todos los formularios clave | Backlog TAREA-11 | Baja |

---

## En curso

| # | Objetivo | Iniciado |
|---|----------|----------|
| — | — | — |

---

## Completados

| Fecha | Objetivo | Notas |
|---|---|---|
| 2026-05-11 | Obtener credenciales del tenant y base de datos para desarrollo | x-api-key y tenant configurados |
| 2026-05-11 | Actualizar `ApiService.js` para dar soporte a API-SIGMA-CLOUD | Headers y parámetros query multi-tenant listos |
| 2026-05-11 | Migrar pantalla de Login a API-SIGMA-CLOUD | JWT y DB del tenant guardados en `localStorage` |

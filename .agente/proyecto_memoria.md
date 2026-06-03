# proyecto_memoria.md — Memoria técnica del proyecto

> Decisiones tomadas, razonamiento detrás de cada elección y estado actual.
> Actualizar con cada decisión técnica relevante.

---

## Decisiones técnicas

| Fecha | Decisión | Razonamiento |
|---|---|---|
| 2026-06-03 | Migración de Plan de Proyecto a agentes | Se reestructura la documentación interna del proyecto al esquema de agentes del ecosistema Telcotronics (`agents.md`, `.agente/`) para mejorar la automatización y alineación. |
| 2026-05-11 | Migración de `ApiService.js` a `API-SIGMA-CLOUD` | Sustituir el monolito legacy `app.factura-e.net` por el API Gateway centralizado multi-tenant. Se implementa soporte para header `x-api-key`, token Bearer JWT y parámetro query `?db=`. |
| 2026-05-11 | Activación del Tema Oscuro en Vuetify | Se actualizó `plugins/Vuetify.js` con `dark: true` y se creó `src/assets/global.css` con design tokens unificados. Se unifica el color primario a `#13ec13`. |
| 2026-05-11 | Depuración de dependencias Telcotronics hardcodeadas | Se eliminaron llamadas directas y URLs quemadas en Membresías, CRUD_Areas, y genera_venta. Ahora todas usan `ApiService.js`. |
| 2026-05-11 | Rutas placeholder para CXC y Abonos | Se agregaron componentes base en `/cxc` y `/abonos` para evitar errores de navegación (menú sin componente). |
| 2025-12-01 | Reemplazo del backend PHP (Legacy) | Se descarta el backend PHP localizado en `api/` a favor del backend Node del ecosistema. Las referencias a `HttpService.js` quedan marcadas para migración. |

---

## Estado actual

El frontend se encuentra en desarrollo activo y operando parcialmente en producción. Actualmente, se está ejecutando la migración del stack HTTP. 17 componentes que originalmente llamaban a endpoints PHP a través de `HttpService.js` están siendo migrados a `ApiService.js` para consumir la `API-SIGMA-CLOUD`.

---

## Pendientes

- [ ] Migrar los 17 componentes restantes de `HttpService.js` (PHP muerto) a `ApiService.js` (API-SIGMA-CLOUD).
- [ ] Confirmar formato exacto del endpoint `/api/auth/login` y completar la integración de Login/Sesión.
- [ ] Implementar el guardado de ventas en `genera_venta.vue` (`handleSave` → `POST api/ventas`) y la impresión de tickets.
- [ ] Completar el módulo de Inventario de Productos (conectar `guardarProducto` y crear componente de lista).
- [ ] Conectar el Dashboard principal con endpoints de estadísticas reales de la API.
- [ ] Implementar la base de datos de CXC y Abonos (crear tablas `cxc` y `abonos`, e integrar sus respectivos módulos).

---

## Notas y observaciones

- **Coexistencia de dos sistemas de diseño:**
  - **Sistema A (legado):** Vuetify puro, íconos `mdi-*`, fuente Roboto.
  - **Sistema B (objetivo):** CSS custom oscuro, Material Symbols Outlined, fuente Lexend.
  - **Estrategia:** La unificación de estilos se realiza de forma gradual al editar componentes para mitigar riesgos.
- **Modelo SaaS:** El backend de API es multi-tenant. Cada gimnasio se registra en el panel superadmin (ADMIN) que crea su BD correspondiente y le provee su propia `x-api-key`.

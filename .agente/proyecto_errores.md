# proyecto_errores.md — Registro de errores

> Cada error relevante durante desarrollo o producción.

---

## Plantilla

### [FECHA] — [Título corto]
- **Síntoma:** [qué fallaba]
- **Causa raíz:** [por qué ocurrió]
- **Solución:** [qué se cambió]
- **Estado:** ✅ Resuelto | 🔧 En curso | ⏳ Pendiente

---

## Errores registrados

### 2026-05-11 — BUG-01: Fragmentación de backends
- **Síntoma:** Referencias cruzadas y URLs hardcodeadas apuntando a distintos endpoints y entornos (incluyendo URLs de Telcotronics) dentro de múltiples componentes.
- **Causa raíz:** Falta de un servicio centralizado de peticiones HTTP que abstrajera la URL base y las credenciales.
- **Solución:** Se creó `src/Servicios/ApiService.js` como cliente HTTP centralizado basado en Axios y se eliminaron las referencias hardcodeadas en Membresías, CRUD_Areas, y genera_venta.
- **Estado:** ✅ Resuelto

### 2026-05-11 — BUG-03: Rutas del menú sin componente
- **Síntoma:** Al hacer clic en `/cxc` o `/abonos` en el Navigation Drawer, la aplicación fallaba o no respondía.
- **Causa raíz:** Las rutas estaban definidas en el menú pero no tenían componentes asociados ni estaban registradas en el router.
- **Solución:** Se crearon componentes placeholder y se registraron en `src/router/index.js`.
- **Estado:** ✅ Resuelto

### 2026-05-11 — BUG-04: Tema Vuetify sin activar
- **Síntoma:** La interfaz del gimnasio no aplicaba los colores de la marca ni el tema oscuro del ecosistema.
- **Causa raíz:** El plugin de Vuetify carecía de la configuración `dark: true` y la paleta de colores.
- **Solución:** Se actualizó `plugins/Vuetify.js` y se creó `src/assets/global.css` con variables CSS para el tema oscuro.
- **Estado:** ✅ Resuelto

### 2026-05-11 — BUG-06: Componentes usando HttpService (PHP muerto)
- **Síntoma:** Múltiples formularios y listas (pagos, visitas, configuración, perfil) fallan al interactuar con el servidor.
- **Causa raíz:** Originalmente 17 componentes consumían `HttpService.js` apuntando al backend PHP deshabilitado `https://api-gym.factura-e.net/api/`.
- **Solución:** Migrar las llamadas en cada uno de estos componentes a la API centralizada usando `ApiService.js`. Se completó la migración del módulo de Miembros (3 componentes) y Login (1 componente), quedando 14 pendientes.
- **Estado:** 🔧 En curso (Miembros completado)

### 2026-05-11 — BUG-07: ApiService.js apunta al monolito legacy
- **Síntoma:** Las llamadas realizadas con `ApiService.js` fallan o devuelven datos de un ecosistema desactualizado.
- **Causa raíz:** `ApiService.js` apuntaba a `app.factura-e.net` (monolito legacy) y carecía de autenticación por headers y soporte multi-tenant `?db=`.
- **Solución:** Modificar `ApiService.js` para usar `api-gateway-cloud.telcotronics.net` como base, inyectando `x-api-key`, JWT Bearer y parámetro `?db=`.
- **Estado:** 🔧 En curso (migrado, pendiente verificación y pruebas en endpoints específicos)

### 2026-05-11 — BUG-08: API key y credenciales del tenant no definidas
- **Síntoma:** Imposibilidad de autenticarse en la nueva pasarela `API-SIGMA-CLOUD`.
- **Causa raíz:** El gimnasio no tenía asignado un API Key ni se conocía el parámetro de base de datos exacto.
- **Solución:** Se recuperaron las credenciales (`x-api-key`: `ak_8f58d181cb8ad5042b677cf8a63ca708`) y la BD (`TELCOTRONICS` en desarrollo) de la administración de SIGMA-WEBCONTROL y se configuraron en `config/`.
- **Estado:** ✅ Resuelto

### 2026-06-03 — BUG-09: Fallos de compilación Webpack 3 por ES6+
- **Síntoma:** El compilador de producción fallaba con errores de sintaxis (Unexpected token) en Vuetify, Login.vue, genera_venta.vue y MiembroAccessCard.vue.
- **Causa raíz:** Se introdujeron características de ES6+/ES2020 (como `vuetify/lib`, optional chaining `?.` y optional catch binding `catch { }`) que no son soportadas por la versión heredada de Webpack 3 y su configuración excluida de babel-loader para node_modules.
- **Solución:** Se importó el bundle ES5 `'vuetify'` en Vuetify.js y se reescribieron los operadores `?.` y `catch { }` por sintaxis ES5 compatible.
- **Estado:** ✅ Resuelto

# Plan del Proyecto — Sistema de Administración para Gimnasio

> **Última actualización:** 2026-05-11
> **Versión del frontend:** 1.0.2
> **Rama activa:** `main`
> **Autor:** Pablinux
> **Estado general:** En desarrollo activo. Producción parcialmente operativa. Migración a API-SIGMA-CLOUD en curso.

---

## 1. Contexto: Ecosistema SIGMA

Este proyecto (sistema-gimnasio) es un **cliente/tenant** del ecosistema SIGMA, desarrollado también por Pablinux. Entender esta arquitectura es esencial para trabajar en el proyecto.

```
┌─────────────────────────────────────────────────────────────────┐
│                       ECOSISTEMA SIGMA                          │
│                                                                 │
│  ┌──────────────────────┐    ┌──────────────────────────────┐  │
│  │  API-SIGMA-CLOUD     │    │  API-SIGMA-WEBCONTROL        │  │
│  │  (Gateway multi-     │    │  (Admin backbone)            │  │
│  │   tenant)            │    │  Puerto: 3002                │  │
│  │  api-gateway-cloud   │    │  BD: TELCOTRONICS +          │  │
│  │  .telcotronics.net   │◄───│      webControl (API keys)  │  │
│  │  /api-docs           │    └──────────────────────────────┘  │
│  └──────────┬───────────┘                                       │
│             │  Auth: x-api-key header + JWT Bearer              │
│             │  Multi-tenant: parámetro ?db=<nombre_bd>          │
│             │                                                    │
│     ┌───────┴────────────────────────────────────┐             │
│     │            TENANTS                          │             │
│     │  ?db=gimnasio  ?db=empresa2  ?db=empresa3   │             │
│     └──────────────────────────────────────────── ┘             │
└─────────────────────────────────────────────────────────────────┘
         ▲
         │ consume
┌────────┴─────────┐
│ sistema-gimnasio  │
│ Vue 2 + Vuetify 2 │
│ (este repositorio)│
└───────────────────┘
```

### APIs del ecosistema

| API | URL | Rol | Auth |
|-----|-----|-----|------|
| **API-SIGMA-CLOUD** | `https://api-gateway-cloud.telcotronics.net/` | Gateway multi-tenant. **Única API activa a usar.** | `x-api-key` header + `Authorization: Bearer <jwt>` |
| API-SIGMA-WEBCONTROL | — (interna) | Admin: gestiona API keys, auth, CRM, monitoreo | `x-api-key` |
| ~~APP-SIGMA-WEB~~ | `https://app.factura-e.net` | **LEGACY.** Monolito original antes de la división. | — |
| ~~PHP api/~~ | `https://api-gym.factura-e.net/api/` | **MUERTO.** Reemplazado por Node.js. El directorio `api/` existe en el repo pero NO SE USA. | — |

**Documentación interactiva de API-SIGMA-CLOUD:** `https://api-gateway-cloud.telcotronics.net/api-docs`

### Autenticación en API-SIGMA-CLOUD

```
Headers requeridos:
  x-api-key: <api_key_del_gimnasio>       ← clave asignada a este tenant
  Authorization: Bearer <jwt_token>        ← JWT obtenido tras login

Multi-tenant:
  Cada request lleva ?db=<nombre_base_datos> para identificar el tenant.
  El gimnasio tiene su propia BD en el servidor MySQL de SIGMA.
```

---

## 2. Stack Tecnológico (Frontend)

| Capa | Tecnología | Versión | Notas |
|------|-----------|---------|-------|
| Framework | Vue.js | 2.5.x | Options API. No migrar a Vue 3 sin planificación. |
| UI | Vuetify | 2.7.x | Tema oscuro activado. Color primario `#13ec13`. |
| HTTP | axios | — | Via `ApiService.js`. **No usar `HttpService.js`** (apunta a PHP muerto). |
| Build | Webpack 3 (vue-cli 2) | 3.6.x | No carga `.env` automáticamente. Variables en `config/`. |
| Router | Vue Router | 3.x | SPA hash mode. |
| Íconos | MDI (Vuetify legacy) + Material Symbols Outlined (Google Fonts) | — | Coexisten en distintos módulos. Objetivo: unificar en Material Symbols. |
| Fuentes | Lexend (módulos nuevos), Roboto (Vuetify legacy) | — | Objetivo: unificar en Lexend. |
| Extras | jsbarcode, qrcode.vue, printd | — | QR y código de barras en credencial de miembro. |

---

## 3. Estructura del Proyecto

```
sistema-gimnasio/
├── api/                          ← Backend PHP — OBSOLETO, NO USAR
│   └── (archivos .php)           ← Solo referencia histórica
│
├── src/
│   ├── App.vue                   ← Raíz: maneja login/sesión/snackbar global
│   ├── main.js                   ← Punto de entrada Vue + Vuetify + global.css
│   ├── plugins/Vuetify.js        ← Tema oscuro: primary #13ec13, bg #102210
│   ├── assets/global.css         ← CSS variables :root + overrides Vuetify
│   ├── router/index.js           ← Todas las rutas SPA
│   ├── Servicios/
│   │   ├── ApiService.js         ← ✅ Servicio activo (axios → app.factura-e.net)
│   │   │                            ⚠️ PENDIENTE: actualizar URL a API-SIGMA-CLOUD
│   │   ├── HttpService.js        ← ❌ OBSOLETO (fetch → PHP muerto). No usar.
│   │   └── Utiles.js             ← Helpers de fecha/array
│   └── components/
│       ├── Encabezado.vue        ← AppBar + NavigationDrawer
│       ├── inicio_dashboard.vue  ← Dashboard (datos estáticos, API pendiente)
│       ├── Usuarios/             ← Login, CRUD usuarios, perfil, contraseña
│       ├── Clientes/             ← CRUD clientes (RUC/Cédula)
│       ├── Miembros/             ← CRUD miembros, credencial, pago
│       ├── Membresias/           ← CRUD planes/tipos de membresía
│       ├── Pagos/                ← Listado de pagos, registro de cobro
│       ├── Visitas/              ← Registro y listado de visitas
│       ├── cajas/                ← Apertura, cuadre, estado de cajas
│       ├── Ventas/               ← Formulario de venta (genera_venta.vue)
│       ├── Inventario/           ← Solo formulario de creación (sin lista ni backend)
│       ├── Estados/              ← Semáforo de miembros + estado de cajas
│       ├── Configuracion/        ← Config del gimnasio + CRUD áreas
│       ├── CXC/                  ← Placeholder "en construcción"
│       ├── Abonos/               ← Placeholder "en construcción"
│       ├── Chat/                 ← ChatBot WebSocket + envío de mensajes
│       └── Dialogos/             ← Componentes reutilizables (cards, breadcrumbs, etc.)
│
├── config/
│   ├── dev.env.js                ← Variables Webpack desarrollo
│   └── prod.env.js               ← Variables Webpack producción
├── .env                          ← Referencia (NO lo carga Webpack 3 automáticamente)
└── plan_proyecto.md              ← Este archivo
```

### Flujo de autenticación actual

1. `App.vue` verifica `localStorage.getItem('logeado')` al montar.
2. Sin sesión → muestra `<Login>`.
3. Login llama `HttpService` → `usuarios.php` (PHP muerto — **pendiente migrar**).
4. Si OK → guarda en `localStorage`: `logeado`, `nombreUsuario`, `idUsuario`.
5. En `mounted()` de `App.vue` carga ajustes del negocio (nombre, logo) y los guarda en `localStorage`.

**Flujo objetivo** (tras migración a API-SIGMA-CLOUD):
1. Login llama `POST /api/auth/login` con `x-api-key`.
2. Respuesta retorna `jwt_token`.
3. `ApiService.js` almacena el JWT y lo envía en `Authorization: Bearer` en cada request.
4. `?db=<bd_gimnasio>` va en cada request para identificar el tenant.

---

## 4. Servicio HTTP: estado actual y objetivo

### 4.1 Situación actual

| Servicio | Archivo | Apunta a | Estado |
|----------|---------|----------|--------|
| `HttpService.js` | `src/Servicios/HttpService.js` | `api-gym.factura-e.net/api/` (PHP) | **OBSOLETO — NO USAR** |
| `ApiService.js` | `src/Servicios/ApiService.js` | `app.factura-e.net` (legacy monolith) | **Transitorio — actualizar** |
| **Objetivo** | `ApiService.js` actualizado | `api-gateway-cloud.telcotronics.net` | **Target final** |

### 4.2 Objetivo: ApiService.js con soporte SIGMA

```js
// src/Servicios/ApiService.js — versión objetivo
import axios from 'axios'

const BASE_URL  = process.env.VUE_APP_API_SIGMA  || 'https://api-gateway-cloud.telcotronics.net'
const API_KEY   = process.env.VUE_APP_API_KEY    || ''
const DB_TENANT = process.env.VUE_APP_DB_TENANT  || 'gimnasio'

function getToken() {
  return localStorage.getItem('jwt_token') || ''
}

function headers() {
  return {
    'x-api-key': API_KEY,
    'Authorization': `Bearer ${getToken()}`
  }
}

const ApiService = {
  async get(ruta, params = {}) {
    const res = await axios.get(`${BASE_URL}/${ruta}`, {
      headers: headers(),
      params: { db: DB_TENANT, ...params }
    })
    return res.data
  },
  async post(ruta, datos) {
    const res = await axios.post(`${BASE_URL}/${ruta}?db=${DB_TENANT}`, datos, { headers: headers() })
    return res.data
  },
  async put(ruta, datos) {
    const res = await axios.put(`${BASE_URL}/${ruta}?db=${DB_TENANT}`, datos, { headers: headers() })
    return res.data
  },
  async delete(ruta) {
    const res = await axios.delete(`${BASE_URL}/${ruta}?db=${DB_TENANT}`, { headers: headers() })
    return res.data
  }
}

export default ApiService
```

### 4.3 Variables de entorno (config/prod.env.js)

```js
module.exports = {
  NODE_ENV: '"production"',
  VUE_APP_API_SIGMA:  '"https://api-gateway-cloud.telcotronics.net"',
  VUE_APP_API_KEY:    '"<api_key_del_gimnasio>"',    // obtener de API-SIGMA-WEBCONTROL
  VUE_APP_DB_TENANT:  '"<nombre_bd_gimnasio>"'       // confirmar con el admin de SIGMA
}
```

> **Nota Webpack 3:** Las variables `.env` NO se cargan automáticamente.
> Siempre definirlas en `config/dev.env.js` y `config/prod.env.js`.

---

## 5. Bugs y Deuda Técnica

### ~~BUG-01~~ — Fragmentación de backends ✅ RESUELTO 2026-05-11
Referencias hardcodeadas a Telcotronics eliminadas de los componentes de Membresías, CRUD_Areas y genera_venta. Se creó `ApiService.js` como punto de acceso centralizado.

---

### ~~BUG-03~~ — Rutas del menú sin componente ✅ RESUELTO 2026-05-11
`/cxc` y `/abonos` ya tienen componentes placeholder y están registradas en el router.

---

### ~~BUG-04~~ — Tema Vuetify sin activar ✅ RESUELTO 2026-05-11
`Vuetify.js` actualizado con `dark: true` y paleta de colores completa. `global.css` creado con design tokens CSS.

---

### BUG-06 — 17 componentes usan HttpService (PHP muerto) [CRÍTICO]
**Severidad:** CRÍTICA  
**Descripto:** `HttpService.js` apunta a `https://api-gym.factura-e.net/api/` que es el backend PHP descartado. Toda llamada falla.

**Componentes afectados:**

| Componente | Endpoint PHP viejo | Migrado |
|------------|--------------------|---------|
| `App.vue` | `ajustes.php` | ❌ |
| `Usuarios/Login.vue` | `usuarios.php → login` | ❌ |
| `Usuarios/Usuarios.vue` | `usuarios.php → listar` | ❌ |
| `Usuarios/NuevoUsuario.vue` | `usuarios.php → crear` | ❌ |
| `Usuarios/EditarUsuario.vue` | `usuarios.php → editar` | ❌ |
| `Usuarios/CambiarPassword.vue` | `usuarios.php → cambiar_pass` | ❌ |
| `Usuarios/MiPerfil.vue` | `usuarios.php → perfil` | ❌ |
| `Miembros/NuevoMiembro.vue` | `miembros.php → crear` | ❌ |
| `Miembros/EditarMiembro.vue` | `miembros.php → editar` | ❌ |
| `Miembros/BusquedaMiembro.vue` | `miembros.php → buscar` | ❌ |
| `Miembros/RealizarPago.vue` | `pagos.php → registrar` | ❌ |
| `Membresias/Membresias.vue` | `membresias.php → listar` | ❌ |
| `Pagos/Pagos.vue` | `pagos.php → listar` | ❌ |
| `Visitas/Visitas.vue` | `visitas.php → listar` | ❌ |
| `Configuracion/ConfiguracionComponent.vue` | `ajustes.php` | ❌ |
| `inicio_dashboard.vue` | revertido a datos estáticos | 🚧 |
| `Chat/Envia_msg.vue` | URL PHP hardcodeada | ❌ |

**Solución:** Para cada módulo, identificar el endpoint equivalente en API-SIGMA-CLOUD (ver `/api-docs`) y migrar a `ApiService.get/post/put/delete(...)`.

---

### BUG-07 — ApiService.js apunta al monolito legacy [ALTA]
**Severidad:** ALTA  
`ApiService.js` usa `app.factura-e.net` (APP-SIGMA-WEB, el monolito original que fue reemplazado por API-SIGMA-CLOUD). También le falta la autenticación `x-api-key` + JWT Bearer y el parámetro `?db=` para multi-tenancy.

**Componentes que ya usan ApiService (y están parcialmente migrados):**
- `Membresias/Crear_membresias.vue` — `POST api/tipos-membresia`
- `Membresias/Crud_membresias_card.vue` — `GET/DELETE api/tipos-membresia`
- `Membresias/Crud_editarMembresia.vue` — `GET/PUT api/tipos-membresia/:id`
- `Configuracion/CRUD_Areas.vue` — `GET/POST/PUT/DELETE api/areas`
- `Ventas/genera_venta.vue` — `GET api/cajas_activas`, `GET api/productos`, `GET api/tipos-membresia`

**Solución:** Actualizar `ApiService.js` para apuntar a `api-gateway-cloud.telcotronics.net` con headers de auth (ver sección 4.2).

---

### BUG-08 — API key y credenciales del tenant no definidas [BLOQUEANTE]
**Severidad:** BLOQUEANTE para BUG-06 y BUG-07  
Para conectar correctamente a API-SIGMA-CLOUD el gimnasio necesita:
1. Su `x-api-key` asignada en API-SIGMA-WEBCONTROL.
2. El nombre de su BD (parámetro `?db=`).
3. Credenciales de login en la nueva API.

**Acción:** Obtener estos valores de la administración de API-SIGMA-WEBCONTROL y agregarlos a `config/prod.env.js`.

---

## 6. Estado de Módulos

### Leyenda
- ✅ **Completo** — funciona
- ⚠️ **Funcional con issues** — funciona pero con deuda técnica
- 🚧 **En desarrollo** — UI construida, lógica incompleta
- ❌ **Roto / sin componente** — no funciona

---

### 6.1 Autenticación / Sesión ❌ (por BUG-06)
- Login llama a HttpService → PHP muerto — **falla en producción** ❌
- Logout borra `localStorage` ✅
- Flujo "debe cambiar password" al primer login ✅ (UI, no funciona por fallo de login)
- Sesión basada en `localStorage.logeado = true` sin token real ⚠️
- Sin roles: cualquier usuario autenticado ve todo ⚠️

---

### 6.2 Dashboard (`/`) 🚧
- Layout visual, tarjetas de stats, gráfico líneas SVG, gráfico barras ✅
- **Datos completamente hardcodeados** — no llama a ninguna API ❌
- Métodos `aplicarDatos()`, `_mapearHoras()`, `_mapearMeses()` listos y esperando datos ✅

---

### 6.3 Miembros (`/crud_miembros_card`, `/crud_miembrosForm`, `/crud_miembrosForm/:id`) ⚠️
- Lista en cards con búsqueda ✅ (usa `app.factura-e.net`)
- Crear/editar miembro ✅ (usa `app.factura-e.net`)
- Estado ACTIVO/VENCIDO con semáforo ✅
- Credencial con QR y código de barras ✅
- Coexisten componentes legacy (`NuevoMiembro.vue`, `EditarMiembro.vue`) y nuevos — **duplicidad sin resolver** ⚠️

---

### 6.4 Membresías/Planes (`/crud_membresia_card`, `/CRUD_MembresiaForm`) ⚠️
- Lista en cards y tabla ✅
- Formulario crear/editar unificado ✅
- Migrado a `ApiService.js` (apunta a `app.factura-e.net`) — pendiente apuntar a SIGMA ⚠️

---

### 6.5 Usuarios (`/usuarios`, `/nuevo-usuario`, etc.) ❌
- UI completa ✅
- Todas las llamadas via `HttpService` → PHP muerto ❌

---

### 6.6 Clientes (`/clientes`, `/Crear_cliente`, `/editar-cliente/:ruc`) ⚠️
- CRUD completo ✅ (usa `app.factura-e.net`)
- Pendiente migrar a SIGMA con `?db=` y auth ⚠️

---

### 6.7 Visitas (`/registrar-visita`, `/visitas`) ⚠️
- Registro con modo Miembro / Visita ocasional 🚧
- Listado ✅ (usa `HttpService` → falla)
- `RegistroVisitaMiembro.vue` usa `app.factura-e.net` ✅ (parcialmente)

---

### 6.8 Pagos (`/pagos`, `/registrar-cobro`) ⚠️
- Listado con filtro por fechas ✅ (HttpService → falla)
- Formulario de cobro usa `app.factura-e.net` ⚠️

---

### 6.9 Cajas (`/caja_apertura`, `/caja_cuadre`, `/estado_cajas`) ⚠️
- Apertura de turno ✅ (usa `app.factura-e.net`)
- Cuadre: lógica incompleta (`console.log` en acciones) 🚧
- Estado de cajas ✅ (usa `app.factura-e.net`)

---

### 6.10 Ventas (`/venta`) 🚧
- UI completa: cliente, ítems, método pago, descuento, totales ✅
- Vendedor desde `localStorage.nombreUsuario` ✅
- Caja desde `ApiService.get('api/cajas_activas')` ✅
- **`handleSave()`** — solo `console.log`. **La venta no se guarda.** ❌
- **`handlePrint()`** — no implementado ❌
- Secuencia de venta (`SEQ-2023-001`) estática ❌

---

### 6.11 Inventario (`/inventario`) 🚧
- Formulario de creación con 4 tabs (General, Clasificación, Precios, Impuestos) ✅ (UI)
- **`guardarProducto()`** — solo `console.log` ❌
- **No existe lista de productos** ❌
- Sin endpoint en la API para inventario del gimnasio ❌
- Categorías, marcas, unidades son arrays estáticos ❌

---

### 6.12 Estados de Miembros (`/estado_miembros`) ⚠️
- Tabla con semáforo VERDE/AMARILLO/ROJO ✅ (usa `app.factura-e.net`)
- Acciones del menú contextual hacen `alert()` en lugar de navegar ❌
- Columna "Saldo CXC" requiere tabla `cxc` en BD ❌

---

### 6.13 CXC — Cuentas por Cobrar (`/cxc`) ❌
- Componente placeholder "en construcción" ✅
- Sin lógica, sin API, sin tabla en BD ❌

---

### 6.14 Abonos (`/abonos`) ❌
- Componente placeholder "en construcción" ✅
- Sin lógica, sin API, sin tabla en BD ❌

---

### 6.15 Configuración (`/configurar`, `/admin-areas`) ⚠️
- Config general usa `HttpService` → PHP muerto ❌
- CRUD áreas migrado a `ApiService.js` ✅

---

### 6.16 Chat (`/chat`, `/enviar_msg`) ⚠️
- ChatBot WebSocket ✅
- Envío de mensajes: URL PHP hardcodeada en `Envia_msg.vue` ❌

---

## 7. Design System

### 7.1 Tokens de diseño (fuente de verdad)

```css
/* src/assets/global.css */
:root {
  --color-bg:          #102210;
  --color-surface:     #1c2e1c;
  --color-surface-2:   #243324;
  --color-border:      rgba(255, 255, 255, 0.08);
  --color-primary:     #13ec13;
  --color-primary-dim: rgba(19, 236, 19, 0.15);
  --color-text-primary:   #ffffff;
  --color-text-secondary: #9ca3af;
  --color-text-muted:     #6b7280;
  --color-success:  #13ec13;
  --color-warning:  #f59e0b;
  --color-error:    #ef4444;
  --color-info:     #3b82f6;
  --font-family:    'Lexend', system-ui, sans-serif;
  --radius-sm:  0.5rem;
  --radius-md:  0.75rem;
  --radius-lg:  1rem;
}
```

### 7.2 Vuetify.js — configuración activa

```js
dark: true, primary: '#13ec13', background: '#102210', surface: '#1c2e1c'
```

### 7.3 Coexistencia de dos sistemas de diseño

- **Sistema A (legado):** Vuetify puro, `mdi-*`, Roboto — en módulos viejos (Pagos, Visitas, Usuarios, Cajas)
- **Sistema B (objetivo):** CSS custom oscuro, Material Symbols Outlined, Lexend — en módulos nuevos (Dashboard, Miembros, Ventas, Inventario)

**Estrategia:** Migración gradual por módulo al editar. No refactor masivo. No mezclar íconos MDI y Material Symbols en el mismo componente.

---

## 8. Base de Datos (en API-SIGMA-CLOUD, tenant del gimnasio)

### 8.1 Tablas presentes (a confirmar con `/api-docs`)

| Tabla | Estado | Módulo |
|-------|--------|--------|
| `membresias` | ✅ En uso | Planes |
| `miembros` | ✅ En uso | Miembros |
| `usuarios` | ✅ En uso | Auth |
| `pagos` | ✅ En uso | Pagos |
| `visitas` | ✅ En uso | Visitas |
| `ajustes` | ✅ En uso | Config |
| `productos` | 🚧 Existe, sin módulo frontend completo | Inventario |
| `ventas` | 🚧 Existe, no se guarda desde frontend | Ventas |
| `productos_venta` | 🚧 Idem | Ventas |
| `movimientos_caja` | ⚠️ Parcial | Cajas |

### 8.2 Tablas por crear

```sql
CREATE TABLE cxc (
    id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_cliente    BIGINT UNSIGNED NOT NULL,
    id_venta      BIGINT UNSIGNED,
    fecha_emision DATETIME NOT NULL DEFAULT NOW(),
    fecha_vence   DATE NOT NULL,
    monto_total   DECIMAL(8,2) NOT NULL,
    monto_cobrado DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    saldo         DECIMAL(8,2) GENERATED ALWAYS AS (monto_total - monto_cobrado) STORED,
    estado        ENUM('PENDIENTE','PARCIAL','CANCELADA') NOT NULL DEFAULT 'PENDIENTE',
    observacion   VARCHAR(255)
);

CREATE TABLE abonos (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_cxc      BIGINT UNSIGNED NOT NULL,
    id_usuario  BIGINT UNSIGNED NOT NULL,
    fecha       DATETIME NOT NULL DEFAULT NOW(),
    monto       DECIMAL(8,2) NOT NULL,
    tipo_pago   ENUM('EFECTIVO','TRANSFERENCIA','TARJETA','CHEQUE','DEPOSITO') NOT NULL,
    referencia  VARCHAR(100),
    FOREIGN KEY (id_cxc) REFERENCES cxc(id)
);
```

---

## 9. Backlog Priorizado

### ~~TAREA-00~~ — Obtener credenciales del tenant ✅ COMPLETADO 2026-05-11
- `x-api-key`: `ak_8f58d181cb8ad5042b677cf8a63ca708`
- BD tenant actual: `TELCOTRONICS` (temporal durante desarrollo)
- BD futura: cada empresa crea su propia BD al registrarse (modelo SaaS — ver sección SaaS)

---

### ~~TAREA-01~~ — Actualizar ApiService.js para API-SIGMA-CLOUD ✅ COMPLETADO 2026-05-11
- `BASE_URL` → `api-gateway-cloud.telcotronics.net`
- Headers: `x-api-key` + `Authorization: Bearer <jwt>`
- Parámetro `?db=` en todos los requests
- Tenant leído de `localStorage.db_tenant` (SaaS) con fallback a env var `TELCOTRONICS`
- `config/prod.env.js` y `config/dev.env.js` actualizados

---

### ~~TAREA-02~~ — Migrar Login a API-SIGMA-CLOUD ✅ COMPLETADO 2026-05-11
- `Login.vue` → `ApiService.login({ usuario, password })` → `POST /api/auth/login`
- `App.vue` → guarda `jwt_token` + `db_tenant` en localStorage al login
- `App.vue` → `obtenerInformacionNegocio()` usa `ApiService.get('api/ajustes')`
- `verificarSesion()` ahora valida que existan tanto `logeado` como `jwt_token`
- **Pendiente confirmar:** formato exacto de respuesta del endpoint `/api/auth/login` (ver `/api-docs`)

---

### TAREA-03 — Migrar módulo Miembros [ALTA]
**Prerequisito:** TAREA-01.  
Componentes: `Crud_miembros.vue`, `crud_miembrosForm.vue`, `BusquedaMiembro.vue`, `RealizarPago.vue`.  
Resolver duplicidad: deprecar `NuevoMiembro.vue` y `EditarMiembro.vue` (legacy) si `crud_miembrosForm.vue` cubre ambos casos.

---

### TAREA-04 — Migrar módulos restantes de HttpService [ALTA]
**Prerequisito:** TAREA-01.  
En orden de prioridad:
1. `Pagos/Pagos.vue` + `Form_regPagos.vue`
2. `Visitas/Visitas.vue` + `RegistroVisitaMiembro.vue`
3. `Membresias/Membresias.vue`
4. `Usuarios/` (CRUD completo)
5. `Configuracion/ConfiguracionComponent.vue`
6. `Chat/Envia_msg.vue`

---

### TAREA-05 — Implementar guardado de ventas [ALTA]
**Prerequisito:** TAREA-01.  
- `genera_venta.vue`: implementar `handleSave()` → `ApiService.post('api/ventas', payload)`.
- `handlePrint()`: generar PDF/impresión del ticket.
- Generar `form.sequence` dinámicamente desde la API.
- **Criterio:** Guardar venta con ≥2 ítems, verificar en API.

---

### TAREA-06 — Completar módulo Inventario [ALTA]
1. Confirmar endpoint de inventario en API-SIGMA-CLOUD (ver `/api-docs`).
2. Conectar `guardarProducto()` en `Crear_producto.vue`.
3. Crear `src/components/Inventario/Lista_productos.vue`.
4. Agregar ruta `/inventario/:id` para edición.
5. **Criterio:** Crear producto → aparece en lista → se puede editar y eliminar.

---

### TAREA-07 — Conectar Dashboard con datos reales [MEDIA]
**Prerequisito:** TAREA-01.  
- Identificar endpoint de estadísticas en API-SIGMA-CLOUD.
- En `mounted()` de `inicio_dashboard.vue`: llamar a la API y pasar datos a `aplicarDatos()`.
- Los métodos `_mapearHoras()` y `_mapearMeses()` ya están listos.

---

### TAREA-08 — Implementar módulo CXC [MEDIA]
1. Crear tabla `cxc` (ver sección 8.2) en la BD del tenant.
2. Confirmar o crear endpoint en API-SIGMA-CLOUD: `GET/POST /api/cxc`.
3. Implementar `src/components/CXC/ListaCXC.vue` — tabla con saldo, estado, cliente.
4. Al guardar venta en crédito: crear registro CXC automáticamente.

---

### TAREA-09 — Implementar módulo Abonos [MEDIA]
**Prerequisito:** TAREA-08.  
1. Crear tabla `abonos` (ver sección 8.2).
2. Endpoint `GET/POST /api/abonos`.
3. `src/components/Abonos/RegistrarAbono.vue` — formulario de pago parcial.
4. Al registrar abono: actualizar `cxc.monto_cobrado` y `cxc.estado`.

---

### TAREA-10 — Migrar estilo de módulos legado [BAJA — continuo]
Orden sugerido (menor a mayor riesgo):
1. `Pagos/Pagos.vue`
2. `Visitas/Visitas.vue`
3. `Usuarios/Usuarios.vue`
4. `cajas/AperturaCaja.vue`
5. `cajas/caja_cuadre.vue`

Regla: no cambiar lógica JS, solo CSS y estructura HTML. Un componente a la vez.

---

### TAREA-11 — Agregar validaciones a formularios [BAJA]
Prioritarios: `crud_miembrosForm.vue`, `NuevoCliente.vue`, `genera_venta.vue`, `Crear_producto.vue`.

---

## 10. Convenciones del Proyecto

### HTTP
- **Regla:** Usar siempre `ApiService.js`. Nunca `HttpService.js`. Nunca `axios` directo en componentes.
- Nunca hardcodear URLs en componentes.
- Siempre usar variables de entorno via `config/prod.env.js`.

### Componentes Vue
- Options API (Vue 2). No Composition API.
- `PascalCase` para archivos: `ListaMiembros.vue`, `FormMembresia.vue`.
- `<style scoped>` en todos los componentes.
- No repetir `@import` de Google Fonts en cada componente — solo en `global.css`.

### Variables de entorno (Webpack 3)
- Definir en `config/prod.env.js` y `config/dev.env.js`, NO en `.env`.
- Acceder como `process.env.VUE_APP_NOMBRE`.

---

## 11. Modelo SaaS — Arquitectura del Producto

El sistema se divide en **4 aplicaciones** sobre la misma base de APIs del ecosistema SIGMA.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SIGMA SaaS Platform                          │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐   │
│  │  1. ADMIN        │  │  2. SOCIOS       │  │  3. CUSTOMERS    │   │
│  │  (superadmin)    │  │  (este repo)     │  │  (por hacer)     │   │
│  │                  │  │                  │  │                  │   │
│  │ · Crea empresas  │  │ · Panel del      │  │ · App del socio  │   │
│  │ · Crea BDs       │  │   gimnasio       │  │   para sus       │   │
│  │ · Gestiona       │  │ · Miembros,      │  │   clientes       │   │
│  │   API keys       │  │   pagos, ventas  │  │ · Ver membresía  │   │
│  │ · Gestiona       │  │ · Cajas,         │  │ · Historial      │   │
│  │   usuarios admin │  │   inventario     │  │ · Reservas       │   │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                     │                      │            │
│  ┌────────▼─────────────────────▼──────────────────────▼─────────┐ │
│  │                    4. WEB PÚBLICA                              │ │
│  │         Landing page, info de planes, contacto                 │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              │                                      │
│           ┌──────────────────┴──────────────────┐                  │
│           │         API-SIGMA-CLOUD              │                  │
│           │  api-gateway-cloud.telcotronics.net  │                  │
│           │  Multi-tenant · x-api-key + JWT       │                  │
│           └─────────────────────────────────────┘                  │
│                              │                                      │
│           ┌──────────────────┴──────────────────┐                  │
│           │       API-SIGMA-WEBCONTROL           │                  │
│           │  Auth · API keys · CRM · Monitoring  │                  │
│           └─────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Las 4 aplicaciones

| App | Quién la usa | Repo / Estado | API principal |
|-----|-------------|---------------|---------------|
| **1. ADMIN** | Pablinux / superadmin | Por crear | API-SIGMA-WEBCONTROL |
| **2. SOCIOS** | El dueño del gimnasio y su staff | **Este repo** — en desarrollo | API-SIGMA-CLOUD |
| **3. CUSTOMERS** | Los socios/clientes del gimnasio | Por crear | API-SIGMA-CLOUD |
| **4. WEB pública** | Público general | Por crear | — (estática o API-SIGMA-CLOUD solo lectura) |

### Flujo de creación de un nuevo tenant (empresa)

```
Superadmin entra al portal ADMIN
  → Crea empresa (nombre, RUC, plan)
  → API-SIGMA-WEBCONTROL:
       · Crea la BD del tenant (ej: "GYM_QUITO_NORTE")
       · Genera x-api-key exclusiva para ese tenant
       · Crea usuario administrador inicial
  → Sistema envía credenciales al dueño del gimnasio

Dueño del gimnasio entra al portal SOCIOS (este repo)
  → Login → POST /api/auth/login
  → Respuesta incluye: jwt_token + db_tenant + nombre_empresa
  → Frontend guarda en localStorage: jwt_token, db_tenant
  → ApiService.js ya envía ?db=GYM_QUITO_NORTE en cada request
```

### Lo que ya está preparado en este repo

`ApiService.js` ya es multi-tenant desde el login:
```js
function getTenant () {
  return localStorage.getItem('db_tenant') || process.env.VUE_APP_DB_TENANT || 'TELCOTRONICS'
}
```
Cuando el Login se migre a API-SIGMA-CLOUD (TAREA-02) y guarde `db_tenant` en `localStorage`, el sistema funciona multi-tenant sin más cambios en `ApiService.js`.

### Estado actual vs objetivo

| Aspecto | Ahora | Objetivo |
|---------|-------|----------|
| BD usada | `TELCOTRONICS` (env var) | Viene del login (`localStorage.db_tenant`) |
| Registro de empresa | No existe | Portal ADMIN (app separada) |
| App de clientes | No existe | CUSTOMERS (app separada) |
| Web pública | No existe | Landing page (app separada) |
| Roles | Sin roles reales | Admin / Cajero / Instructor por tenant |

---

## 12. Entorno de Desarrollo

```bash
cd /home/pablinux/Projects/Node/sistema-gimnasio
npm run dev        # webpack-dev-server → http://localhost:8080
npm run build      # genera /dist para producción
```

---

## 13. Historial de Cambios Relevantes

| Fecha | Descripción |
|-------|-------------|
| 2026-05-11 | ApiService.js migrado a API-SIGMA-CLOUD con auth x-api-key + JWT + multi-tenant ?db=. Variables de entorno SIGMA en config/. Modelo SaaS documentado. Plan reescrito con arquitectura SIGMA completa. |
| 2026-05-11 | Refactor: eliminadas referencias Telcotronics hardcodeadas. Creado ApiService.js. Rutas CXC/Abonos con placeholders. Tema Vuetify oscuro activado. |
| 2026-05 | Módulo ventas con descuentos y crédito. Fix: usuario vendedor desde localStorage. |
| 2025-12 | Estados de miembros y cajas. Módulos de pagos mejorados. |
| 2025-11 | Búsqueda en lista de miembros. |
| 2025-08 | Llevado a producción. Clientes, membresías, chat bot. |

---

*Este documento es la única fuente de verdad sobre el estado del proyecto. Actualizar al completar tareas o descubrir bugs.*

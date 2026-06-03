# agents.md — Punto de entrada del proyecto

> **Reglas:**
> - Este archivo es el eslabón más importante. Leerlo siempre antes de cualquier tarea.
> - Cada cambio significativo debe reflejarse en este archivo y en los demás archivos del índice.
> - Debe ser técnico, claro y detallado para que cualquier humano, agente o IA lo entienda sin explicaciones previas.
> - **Cuando se diga "actualizar proyecto":** hacer commit de los cambios pendientes, actualizar `agents.md` y `.agente/proyecto_estructura.md` con el árbol de archivos actual.

---

## Antecedentes

`sistema-gimnasio` es una aplicación cliente de administración de gimnasios en el ecosistema SIGMA. Originalmente, el gimnasio se gestionaba mediante un backend en PHP monolítico y obsoleto que residía en el subdirectorio `api/`. Con la evolución del ecosistema, se introdujo el backend centralizado multi-tenant `API-SIGMA-CLOUD` y se descartó el backend PHP. El frontend del gimnasio (este repositorio) requiere migrar todas sus llamadas de `HttpService.js` (PHP muerto) al nuevo `ApiService.js` (conectado a `API-SIGMA-CLOUD` con autenticación `x-api-key` + Bearer JWT + parámetro de tenant `?db=`).

---

## Objetivo general

Administrar de manera centralizada y multi-tenant las operaciones de un gimnasio cliente del ecosistema SIGMA.

1. Gestionar el control de miembros (registro de socios, planes, credenciales con QR/código de barras, estados de vencimiento).
2. Procesar cobros de membresías, registrar visitas y ventas de productos en caja (turnos y cuadre).
3. Integrar la facturación y flujos de cuentas por cobrar (CXC y abonos) a través del API Gateway central.

---

## Stack técnico

| Componente | Tecnología |
|---|---|
| Lenguaje | JavaScript / HTML / CSS |
| Framework | Vue.js 2.5.x (Options API) + Vuetify 2.7.x |
| Base de datos | MariaDB 10.11 (vía API-SIGMA-CLOUD / MySQL multi-tenant) |
| HTTP Client | Axios (vía `src/Servicios/ApiService.js`) |
| Build Tool | Webpack 3 (vue-cli 2) |
| Extras | `jsbarcode`, `qrcode.vue` (v1.7.0), `printd` |

---

## Módulos del sistema

### 1. Autenticación y Sesión
**Estado: ❌ Roto / Pendiente confirmar formato**
Permite el ingreso de usuarios con JWT, validando `logeado` y `db_tenant` en `localStorage`.

### 2. Dashboard
**Estado: 🚧 En desarrollo**
Layout visual de estadísticas y gráficos SVG/barras, actualmente con datos estáticos.

### 3. Miembros
**Estado: ✅ Operativo**
Gestión de socios, emisión de credenciales con código de barras/QR, semáforo de estado de acceso. Conectado a la API-SIGMA-CLOUD a través de ApiService.

### 4. Membresías y Planes
**Estado: ⚠️ Funcional con issues**
CRUD de tipos de membresías, migrado a `ApiService.js` pero apuntando al monolito legacy.

### 5. Usuarios del Sistema
**Estado: ❌ Roto**
Administración de perfiles y contraseñas de personal del gimnasio. Pendiente migrar de PHP a Node/SIGMA-CLOUD.

### 6. Clientes
**Estado: ⚠️ Funcional con issues**
CRUD de clientes/RUC. Pendiente migrar a SIGMA-CLOUD con auth y ?db=.

### 7. Visitas
**Estado: ⚠️ Funcional con issues**
Registro de visitas ocasionales o de miembros. Listado roto por depender de PHP.

### 8. Pagos y Cobros
**Estado: ⚠️ Funcional con issues**
Registro y listado de pagos de membresías. Listado roto por depender de PHP.

### 9. Control de Cajas
**Estado: ⚠️ Funcional con issues**
Apertura, cuadre de turnos y estado de las cajas de cobro. Cuadre de caja tiene la lógica incompleta.

### 10. Ventas y Facturación
**Estado: 🚧 En desarrollo**
Interfaz de venta de productos. Lógica de guardado (`handleSave`) e impresión (`handlePrint`) pendientes de implementar.

### 11. Inventario de Productos
**Estado: 🚧 En desarrollo**
Formulario de creación de productos. Falta la lista de inventario, edición, borrado y endpoints de la API.

### 12. Estados de Miembros (Semáforo)
**Estado: ⚠️ Funcional con issues**
Tabla de control de accesos basada en semáforos verde/amarillo/rojo.

### 13. Cuentas por Cobrar (CXC)
**Estado: ❌ Roto / Sin componente**
Módulo placeholder "en construcción". Requiere tabla `cxc` y endpoint de API.

### 14. Abonos
**Estado: ❌ Roto / Sin componente**
Módulo placeholder "en construcción". Requiere tabla `abonos` y endpoint de API.

### 15. Configuración y Áreas
**Estado: ⚠️ Funcional con issues**
Ajustes generales del negocio (roto por PHP) y CRUD de áreas del local (funcional).

### 16. Chat
**Estado: ⚠️ Funcional con issues**
Chatbot WebSocket operativo. Envío de mensajes tiene URL PHP hardcodeada.

---

## Infraestructura (referencia rápida)

> ⚠️ La infraestructura es compartida por todo el ecosistema Telcotronics
> (sigma-robot, sigma-web, sigma-c, sigmac_app, CRM, ERP y otros).
> La fuente de verdad es **`mcp.telcotronics.net`** — actualmente 🔧 **en mantenimiento**.
> Mientras esté en mantenimiento, la fuente alternativa es `/home/pablinux/Projects/infraestructura.md`.
> No editar `.agente/infraestructura.md` directamente — ver protocolo de sincronización.

| Parámetro | Valor |
|---|---|
| Dominio público | `[pendiente]` |
| Puerto interno | — (Cliente estático Apache) |
| Servicio systemd | — |
| BD principal | `webControl` (API Keys) / BD Tenant (ej: `TELCOTRONICS`) |
| MCP ecosistema | `mcp.telcotronics.net` 🔧 en mantenimiento |

> **Correo del ecosistema:** usar `no-reply@sigmac.app` con contraseña `Sigma.2030@`
> vía `smtp.sigmac.app:587` (STARTTLS). Desde LAN interna usar `192.168.10.111:587`.
> Credenciales disponibles en `.agente/infraestructura.md` — sección servidor-email.

> Para el detalle completo y datos del ecosistema ver `.agente/infraestructura.md`.

## Documentos del ecosistema (referencia)

> Estos documentos viven en `/home/pablinux/Projects/` y son la fuente de verdad del ecosistema.
> **No duplicar su contenido aquí** — referenciarlos.

| Documento | Descripción |
|---|---|
| `~/Projects/design-system.md` | Sistema de diseño unificado — colores, tipografía, componentes para Flutter / Vue / Java / PHP |
| `~/Projects/roadmap.md` | Hoja de ruta estratégica — decisiones técnicas tomadas y pendientes de ejecutar |
| `~/Projects/infraestructura.md` | Arquitectura completa de servidores, red, CTs y servicios del ecosistema |
| `~/Projects/prompt_actualizacion.md` | Protocolo de actualización — registrar objetivos, documentar sesiones, sincronizar |

---

## Variables de entorno (definidas en `config/`)

| Variable | Descripción | Valor / Default |
|---|---|---|
| `VUE_APP_API_SIGMA` | URL base de API-SIGMA-CLOUD | `"https://api-gateway-cloud.telcotronics.net"` |
| `VUE_APP_API_KEY` | API Key del tenant del gimnasio | `"ak_8f58d181cb8ad5042b677cf8a63ca708"` |
| `VUE_APP_DB_TENANT` | BD tenant por defecto en desarrollo | `"TELCOTRONICS"` |

---

## Migraciones

Runner: `Manual MySQL/MariaDB import`

| Archivo | Tabla principal | Estado |
|---|---|---|
| `sistema_gimnasio.sql` | Inicialización de tablas del gimnasio | ✅ Importado |
| `bd_esquema.sql` | Tablas `cxc` y `abonos` | ⏳ Pendiente |

---

## Para arrancar en local

```bash
npm install
npm run dev
```

---

## Índice de archivos del proyecto

```
proyecto/
├── README.md
├── agents.md                            # ← LEER PRIMERO
└── .agente/
    ├── infraestructura.md               # Ecosistema — espejo del global
    ├── proyecto_estructura.md           # Árbol de archivos y rutas
    ├── proyecto_memoria.md              # Decisiones técnicas e historial
    ├── proyecto_errores.md              # Registro de errores
    ├── objetivos.md                     # Qué debe cumplirse (sin fecha)
    └── ideas.md                         # Posibilidades sin compromiso
```

---

## Estado global del proyecto

| Módulo | Estado |
|---|---|
| Autenticación / Sesión | ❌ Roto / Login migrado pero pendiente confirmar |
| Dashboard | 🚧 En desarrollo (datos estáticos) |
| Miembros | ✅ Operativo |
| Membresías / Planes | ⚠️ Funcional (apunta a app.factura-e.net legacy) |
| Usuarios del Sistema | ❌ Roto (HttpService → PHP muerto) |
| Clientes | ⚠️ Funcional (apunta a app.factura-e.net legacy) |
| Visitas | ⚠️ Funcional con issues (listado usa HttpService → falla) |
| Pagos y Cobros | ⚠️ Funcional con issues (listado usa HttpService → falla) |
| Control de Cajas | ⚠️ Funcional con issues (cuadre de caja incompleto) |
| Ventas y Facturación | 🚧 En desarrollo (lógica de guardado incompleta) |
| Inventario de Productos | 🚧 En desarrollo (sin lista ni backend) |
| Estados de Miembros | ⚠️ Funcional (apunta a app.factura-e.net legacy) |
| Cuentas por Cobrar (CXC) | ❌ Roto / Sin componente (placeholder) |
| Abonos | ❌ Roto / Sin componente (placeholder) |
| Configuración y Áreas | ⚠️ Configuración general rota (PHP); áreas funcionales |
| Chat | ⚠️ Chatbot funcional; envío de mensajes con URL PHP hardcodeada |

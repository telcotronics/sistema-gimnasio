# proyecto_estructura.md — Estructura del proyecto

> Árbol de archivos, rutas HTTP/API y dependencias entre módulos.
> Actualizar al agregar o mover archivos ("actualizar proyecto").

---

## Árbol de archivos

```
.
├── 0_copia server-SIS_GYM.sh
├── agents.md
├── api
│   ├── ajustes.php
│   ├── base_datos.php
│   ├── encabezado.php
│   ├── funciones_ajustes.php
│   ├── funciones_inicio.php
│   ├── funciones_membresias.php
│   ├── funciones_miembros.php
│   ├── funciones_pagos.php
│   ├── funciones_usuarios.php
│   ├── funciones_visitas.php
│   ├── imagenes
│   │   ├── logo.png
│   │   └── usuario.png
│   ├── inicio.php
│   ├── membresias.php
│   ├── miembros.php
│   ├── pagos.php
│   ├── usuarios.php
│   └── visitas.php
├── bd_esquema.sql
├── build
│   ├── build.js
│   ├── check-versions.js
│   ├── logo.png
│   ├── utils.js
│   ├── vue-loader.conf.js
│   ├── webpack.base.conf.js
│   ├── webpack.dev.conf.js
│   └── webpack.prod.conf.js
├── config
│   ├── dev.env.js
│   ├── index.js
│   └── prod.env.js
├── dist.zip
├── index.html
├── LICENSE
├── package.json
├── package-lock.json
├── plan_proyecto.md
├── README.md
├── requerimientos_backend.md
├── sistema_gimnasio.sql
├── src
│   ├── App.vue
│   ├── assets
│   │   ├── Captura desde 2025-12-17 13-17-12.png
│   │   ├── favicon_io.zip
│   │   ├── global.css
│   │   ├── logo_gim.ico
│   │   ├── logo_gim.jpg
│   │   └── logo.png
│   ├── components
│   │   ├── Abonos
│   │   │   └── ListaAbonos.vue
│   │   ├── cajas
│   │   │   ├── AddTransactionModal.vue
│   │   │   ├── AperturaCaja.vue
│   │   │   └── caja_cuadre.vue
│   │   ├── Chat
│   │   │   ├── Chat_ws.vue
│   │   │   └── Envia_msg.vue
│   │   ├── Clientes
│   │   │   ├── EditarCliente.vue
│   │   │   ├── ListaClientes.vue
│   │   │   └── NuevoCliente.vue
│   │   ├── Configuracion
│   │   │   ├── ConfiguracionComponent.vue
│   │   │   ├── CRUD_Areas.vue
│   │   │   └── FormConfiguracion.vue
│   │   ├── CXC
│   │   │   └── ListaCXC.vue
│   │   ├── Dialogos
│   │   │   ├── Breadcrumbs.vue
│   │   │   ├── CartasPersonalizadas.vue
│   │   │   ├── CartasTotalesMiembros.vue
│   │   │   ├── CartasTotales.vue
│   │   │   ├── DialogoEliminar.vue
│   │   │   ├── PeriodoBusqueda.vue
│   │   │   ├── PieComponent.vue
│   │   │   └── SparklineComponent.vue
│   │   ├── Encabezado.vue
│   │   ├── Estados
│   │   │   ├── EstadoCajas_listar.vue
│   │   │   └── EstadosMiembros.vue
│   │   ├── footer_noImplementado.vue
│   │   ├── inicio_dashboard.vue
│   │   ├── Inventario
│   │   │   └── Crear_producto.vue
│   │   ├── Membresias
│   │   │   ├── Crear_membresias.vue
│   │   │   ├── Crear_planes.vue
│   │   │   ├── Crud_crearMembresia.vue
│   │   │   ├── Crud_editarMembresia.vue
│   │   │   ├── CRUD_MembresiaForm.vue
│   │   │   ├── Crud_membresias_card.vue
│   │   │   ├── Crud_membresias.vue
│   │   │   ├── FormMembresia.vue
│   │   │   └── Membresias.vue
│   │   ├── Miembros
│   │   │   ├── BusquedaMiembro.vue
│   │   │   ├── CredencialMiembro.vue
│   │   │   ├── crud_miembrosForm.vue
│   │   │   ├── Crud_miembros.vue
│   │   │   ├── EditarMiembro.vue
│   │   │   ├── EstadoCajas.vue
│   │   │   ├── FormMiembro.vue
│   │   │   ├── MiembroAccessCard.vue
│   │   │   ├── NuevoMiembro.vue
│   │   │   └── RealizarPago.vue
│   │   ├── Pagos
│   │   │   ├── Form_regPagos.vue
│   │   │   └── Pagos.vue
│   │   ├── Usuarios
│   │   │   ├── CambiarPassword.vue
│   │   │   ├── EditarUsuario.vue
│   │   │   ├── FormUsuario.vue
│   │   │   ├── Login.vue
│   │   │   ├── MiPerfil.vue
│   │   │   ├── NuevoUsuario.vue
│   │   │   └── Usuarios.vue
│   │   ├── Ventas
│   │   │   └── genera_venta.vue
│   │   └── Visitas
│   │       ├── RegistrarVisita.vue
│   │       ├── RegistroVisitaMiembro.vue
│   │       └── Visitas.vue
│   ├── main.js
│   ├── plugins
│   │   └── Vuetify.js
│   ├── router
│   │   └── index.js
│   └── Servicios
│       ├── ApiService.js
│       ├── HttpService.js
│       └── Utiles.js
└── static
```

---

## Rutas SPA (Rutas HTTP en `src/router/index.js`)

| Método | Ruta | Componente Handler | Descripción |
|---|---|---|---|
| GET (Hash) | `/` | `src/components/inicio_dashboard.vue` | Dashboard principal con estadísticas estáticas |
| GET (Hash) | `/membresias` | `src/components/Membresias/Membresias.vue` | Módulo legacy de membresías |
| GET (Hash) | `/crear_membresia` | `src/components/Membresias/Crear_membresias.vue` | Componente de creación de membresías (legacy) |
| GET (Hash) | `/crear_planes` | `src/components/Membresias/Crear_planes.vue` | Creación de planes de membresía |
| GET (Hash) | `/crud_membresia_card` | `src/components/Membresias/Crud_membresias_card.vue` | Listado de membresías en cards |
| GET (Hash) | `/crud_membresias` | `src/components/Membresias/Crud_membresias.vue` | Listado y administración de membresías en tabla |
| GET (Hash) | `/CRUD_MembresiaForm` | `src/components/Membresias/CRUD_MembresiaForm.vue` | Formulario unificado de creación de membresías |
| GET (Hash) | `/CRUD_MembresiaForm/:id` | `src/components/Membresias/CRUD_MembresiaForm.vue` | Formulario unificado de edición de membresía por ID |
| GET (Hash) | `/crud_miembros_card` | `src/components/Miembros/Crud_miembros.vue` | Listado de miembros en cards con semáforo |
| GET (Hash) | `/crud_miembrosForm` | `src/components/Miembros/crud_miembrosForm.vue` | Formulario unificado de creación de miembro |
| GET (Hash) | `/crud_miembrosForm/:id` | `src/components/Miembros/crud_miembrosForm.vue` | Formulario unificado de edición de miembro por ID |
| GET (Hash) | `/admin-areas` | `src/components/Configuracion/CRUD_Areas.vue` | CRUD de áreas físicas del gimnasio |
| GET (Hash) | `/nuevo-miembro` | `src/components/Miembros/NuevoMiembro.vue` | Formulario legacy de nuevo miembro |
| GET (Hash) | `/clientes` | `src/components/Clientes/ListaClientes.vue` | Listado de clientes |
| GET (Hash) | `/Crear_cliente` | `src/components/Clientes/NuevoCliente.vue` | Formulario de creación de cliente |
| GET (Hash) | `/editar-cliente/:client_rucCed` | `src/components/Clientes/EditarCliente.vue` | Edición de datos de cliente |
| GET (Hash) | `/editar-miembro/:id` | `src/components/Miembros/EditarMiembro.vue` | Formulario legacy de edición de miembro |
| GET (Hash) | `/usuarios` | `src/components/Usuarios/Usuarios.vue` | Listado de usuarios del sistema |
| GET (Hash) | `/nuevo-usuario` | `src/components/Usuarios/NuevoUsuario.vue` | Formulario de nuevo usuario |
| GET (Hash) | `/editar-usuario/:id` | `src/components/Usuarios/EditarUsuario.vue` | Formulario de edición de usuario |
| GET (Hash) | `/cambiar-password` | `src/components/Usuarios/CambiarPassword.vue` | Módulo para cambio de contraseña de usuario |
| GET (Hash) | `/pagos` | `src/components/Pagos/Pagos.vue` | Listado de cobros/pagos registrados |
| GET (Hash) | `/registrar-cobro` | `src/components/Pagos/Form_regPagos.vue` | Registro de cobro de membresías |
| GET (Hash) | `/caja_cuadre` | `src/components/cajas/caja_cuadre.vue` | Formulario para cuadrar la caja activa |
| GET (Hash) | `/registrar-visita` | `src/components/Visitas/RegistroVisitaMiembro.vue` | Registro de visita de miembro o visitante ocasional |
| GET (Hash) | `/visitas` | `src/components/Visitas/Visitas.vue` | Listado histórico de visitas |
| GET (Hash) | `/chat` | `src/components/Chat/Chat_ws.vue` | Chatbot asistido por WebSockets |
| GET (Hash) | `/enviar_msg` | `src/components/Chat/Envia_msg.vue` | Panel de envío masivo de mensajes |
| GET (Hash) | `/configurar` | `src/components/Configuracion/ConfiguracionComponent.vue` | Parámetros de negocio / datos generales |
| GET (Hash) | `/perfil` | `src/components/Usuarios/MiPerfil.vue` | Perfil del usuario activo |
| GET (Hash) | `/estado_miembros` | `src/components/Estados/EstadosMiembros.vue` | Semáforo de estado de acceso de socios |
| GET (Hash) | `/estado_cajas` | `src/components/Estados/EstadoCajas_listar.vue` | Estado de las cajas registradas |
| GET (Hash) | `/caja_apertura` | `src/components/cajas/AperturaCaja.vue` | Apertura de turno de caja |
| GET (Hash) | `/venta` | `src/components/Ventas/genera_venta.vue` | Generador de ventas/facturación de productos |
| GET (Hash) | `/inventario` | `src/components/Inventario/Crear_producto.vue` | Formulario de creación de producto (Inventario) |
| GET (Hash) | `/cxc` | `src/components/CXC/ListaCXC.vue` | Listado de Cuentas por Cobrar |
| GET (Hash) | `/abonos` | `src/components/Abonos/ListaAbonos.vue` | Listado de abonos registrados |

---

## Dependencias entre módulos

- **Autenticación (`Login.vue` / `App.vue`)**
  - Carga el estado de sesión y valida los tokens JWT guardados localmente. Almacena en `localStorage` las credenciales del tenant y usuario.
- **Servicio HTTP (`ApiService.js`)**
  - Proxy central de comunicación Axios que inyecta cabeceras `x-api-key` y tokens JWT de portador en cada petición a `api-gateway-cloud.telcotronics.net` junto con el parámetro tenant `?db=`.
- **Navegación (`Encabezado.vue`)**
  - Componente que gestiona el menú Appbar / NavigationDrawer y controla la navegación interna de la aplicación web SPA de cara al usuario.
- **Módulo de Ventas (`genera_venta.vue`)**
  - Requiere llamadas GET a `/api/cajas_activas`, `/api/productos`, y `/api/tipos-membresia` para poblar el carrito y métodos de pago correspondientes.
- **Control de Miembros y Semáforo (`EstadosMiembros.vue` / `MiembroAccessCard.vue`)**
  - Consume datos de miembros y renderiza las credenciales físicas utilizando librerías externas enlazadas en `package.json` (`jsbarcode`, `qrcode.vue`).

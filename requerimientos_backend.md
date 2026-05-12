# Requerimientos de Backend — Sistema Gimnasio (APP-SIGMA-WEB / API-SIGMA-CLOUD)

> **Fecha:** 2026-05-11
> **Proyecto frontend:** sistema-gimnasio (Vue 2, este repo)
> **API destino:** API-SIGMA-CLOUD — `https://api-gateway-cloud.telcotronics.net`
> **Tabla de usuarios:** `usuarios` (tenant DB, ej: `TELCOTRONICS`)

---

## 1. Autenticación con JWT

### 1.1 Endpoint de login

```
POST /api/auth/login
```

**Headers requeridos:**
```
x-api-key: <api_key_del_tenant>
Content-Type: application/json
```

**Body:**
```json
{
  "n_sesion":   "paul",
  "clave":      "mi_password",
  "db":         "TELCOTRONICS"
}
```

**Lógica esperada:**
1. Recibir `n_sesion`, `clave` y `db`.
2. Conectar al schema indicado por `db`.
3. Buscar en tabla `usuarios`:
   ```sql
   SELECT * FROM usuarios
   WHERE n_sesion = ?
     AND clave    = MD5(?)
     AND plataforma = 'APP-GIMNASIO'
   LIMIT 1
   ```
4. Si no existe → responder `401`.
5. Si `nivel` u otro campo indica "debe cambiar clave" → incluirlo en la respuesta.
6. Si existe y activo → generar JWT y responder `200`.

**Respuesta exitosa (`200`):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id_usr":          13,
    "cod_usr":         "XU0017",
    "nombre":          "Paul",
    "apellido":        "Admin Sistema",
    "n_sesion":        "paul",
    "rol":             "ADMIN",
    "nivel":           "1",
    "plataforma":      "APP-GIMNASIO",
    "departamentoArea":"3-ADMINISTRADOR",
    "form_init":       null
  },
  "db_tenant": "TELCOTRONICS"
}
```

**Respuesta error (`401`):**
```json
{
  "success": false,
  "message": "Credenciales incorrectas"
}
```

---

### 1.2 Claims del JWT

El token debe incluir los datos del usuario para que el gateway pueda validarlos sin consultar la BD en cada request:

```json
{
  "id_usr":          13,
  "cod_usr":         "XU0017",
  "nombre":          "Paul",
  "rol":             "ADMIN",
  "nivel":           "1",
  "plataforma":      "APP-GIMNASIO",
  "departamentoArea":"3-ADMINISTRADOR",
  "db_tenant":       "TELCOTRONICS",
  "iat":             1715000000,
  "exp":             1715086400
}
```

- **Expiración sugerida:** 24 horas (`86400` segundos).
- **Algoritmo:** HS256.
- **Secret:** variable de entorno `JWT_SECRET` (no hardcodear).

---

### 1.3 Middleware de validación JWT

Todos los endpoints protegidos deben pasar por un middleware que:

1. Lee el header `Authorization: Bearer <token>`.
2. Verifica la firma con `JWT_SECRET`.
3. Verifica que no esté expirado.
4. Inyecta `req.usuario` con los claims para uso en el handler.
5. Si falla → responde `401 Unauthorized`.

```js
// Ejemplo de middleware (Node.js + jsonwebtoken)
function verificarToken(req, res, next) {
  const auth = req.headers['authorization']
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token requerido' })
  }
  try {
    const token = auth.split(' ')[1]
    req.usuario = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Token inválido o expirado' })
  }
}
```

---

### 1.4 Endpoint de renovación de token (opcional, recomendado)

```
POST /api/auth/refresh
Headers: Authorization: Bearer <token_actual>
```

Devuelve un nuevo token con expiración renovada sin pedir usuario/clave otra vez.

---

### 1.5 Endpoint de logout (opcional)

```
POST /api/auth/logout
Headers: Authorization: Bearer <token>
```

Invalida el token (lista negra en Redis o BD). Si no se implementa, el logout es solo client-side (borrar localStorage).

---

## 2. Configuración / Ajustes del negocio

### GET /api/ajustes

Retorna los datos del negocio del tenant activo.

**Headers:** `x-api-key` + `Authorization: Bearer`  
**Query:** `?db=TELCOTRONICS`

**Respuesta esperada:**
```json
{
  "nombre":    "Gimnasio XYZ",
  "logo":      "https://...",
  "telefono":  "0999999999",
  "direccion": "Calle Principal 123"
}
```

> Tabla probable: `ajustes` o `configuracion` en el schema del tenant.

---

## 3. Endpoints pendientes por módulo

Los siguientes endpoints son necesarios para el funcionamiento completo del frontend. Todos requieren `x-api-key` + `Authorization: Bearer` + `?db=<tenant>`.

### 3.1 Usuarios

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/usuarios` | Listar usuarios del tenant |
| GET | `/api/usuarios/:id` | Obtener usuario por `id_usr` |
| POST | `/api/usuarios` | Crear usuario |
| PUT | `/api/usuarios/:id` | Editar usuario |
| DELETE | `/api/usuarios/:id` | Eliminar usuario |
| PUT | `/api/usuarios/:id/clave` | Cambiar contraseña (recibe nueva clave, guarda MD5) |

---

### 3.2 Miembros

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/miembros` | Listar miembros (acepta `?buscar=` para filtrar) |
| GET | `/api/miembros/:id` | Obtener miembro |
| POST | `/api/miembros` | Crear miembro |
| PUT | `/api/miembros/:id` | Editar miembro |
| DELETE | `/api/miembros/:id` | Eliminar miembro |
| GET | `/api/miembros/:id/estado` | Estado activo/vencido (según fecha de vencimiento de membresía) |

---

### 3.3 Tipos de membresía / Planes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/tipos-membresia` | Listar planes |
| GET | `/api/tipos-membresia/:id` | Obtener plan |
| POST | `/api/tipos-membresia` | Crear plan |
| PUT | `/api/tipos-membresia/:id` | Editar plan |
| DELETE | `/api/tipos-membresia/:id` | Eliminar plan |

---

### 3.4 Pagos / Cobros

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/pagos` | Listar pagos (acepta `?desde=` y `?hasta=` para filtrar por fecha) |
| POST | `/api/pagos` | Registrar cobro de membresía |

---

### 3.5 Visitas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/visitas` | Listar visitas |
| POST | `/api/visitas` | Registrar visita (miembro u ocasional) |

---

### 3.6 Cajas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/cajas_activas` | Listar cajas abiertas |
| GET | `/api/cajas` | Listar todas las cajas con su estado |
| POST | `/api/cajas/apertura` | Abrir turno (saldo inicial) |
| POST | `/api/cajas/cierre` | Cerrar/cuadrar caja |
| GET | `/api/cajas/:id/movimientos` | Movimientos de una caja |

---

### 3.7 Ventas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/ventas` | Listar ventas |
| POST | `/api/ventas` | Guardar venta (cabecera + detalle de ítems) |
| GET | `/api/ventas/:id` | Obtener venta con detalle |

**Body esperado para `POST /api/ventas`:**
```json
{
  "id_cliente":      5,
  "id_usuario":      13,
  "id_caja":         2,
  "tipo_pago":       "CONTADO",
  "descuento":       5.00,
  "subtotal":        100.00,
  "iva":             15.00,
  "total":           110.00,
  "items": [
    {
      "id_producto": 1,
      "descripcion": "Membresía mensual",
      "cantidad":    1,
      "precio":      100.00,
      "subtotal":    100.00
    }
  ]
}
```

---

### 3.8 Inventario / Productos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/productos` | Listar productos (acepta `?buscar=`) |
| GET | `/api/productos/:id` | Obtener producto |
| POST | `/api/productos` | Crear producto |
| PUT | `/api/productos/:id` | Editar producto |
| DELETE | `/api/productos/:id` | Eliminar producto |

---

### 3.9 Clientes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/clientes` | Listar clientes |
| GET | `/api/clientes/:id` | Obtener cliente |
| POST | `/api/clientes` | Crear cliente |
| PUT | `/api/clientes/:id` | Editar cliente |
| DELETE | `/api/clientes/:id` | Eliminar cliente |
| GET | `/consultaClientesJson` | Buscar cliente por RUC/cédula/nombre (`?consulta=`) |
| GET | `/api/clientes/:id/miembros` | Membresías activas del cliente |

---

### 3.10 Áreas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/areas` | Listar áreas del gimnasio |
| POST | `/api/areas` | Crear área |
| PUT | `/api/areas/:id` | Editar área |
| DELETE | `/api/areas/:id` | Eliminar área |

---

### 3.11 CXC — Cuentas por Cobrar *(tabla pendiente de crear)*

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/cxc` | Listar CXC (acepta `?estado=PENDIENTE`) |
| POST | `/api/cxc` | Crear CXC (normalmente al guardar venta en crédito) |
| PUT | `/api/cxc/:id` | Actualizar estado |

---

### 3.12 Abonos *(tabla pendiente de crear)*

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/abonos?id_cxc=` | Listar abonos de una CXC |
| POST | `/api/abonos` | Registrar abono |

---

### 3.13 Dashboard / Estadísticas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/estadisticas` | Resumen: visitas hoy/semana/mes, pagos hoy/mes, afluencia por hora, pagos por mes |

**Respuesta esperada:**
```json
{
  "visitasHoy":    12,
  "visitasSemana": 74,
  "visitasMes":    210,
  "pagosHoy":      450.00,
  "pagosMes":      8200.00,
  "afluenciaHora": [
    { "hora": "06:00", "visitas": 3 },
    { "hora": "07:00", "visitas": 8 }
  ],
  "pagosPorMes": [
    { "mes": "Ene", "total": 5200.00 },
    { "mes": "Feb", "total": 6100.00 }
  ]
}
```

---

## 4. Formato estándar de respuestas

Todos los endpoints deben seguir este formato:

```json
// Éxito con datos:
{ "success": true, "data": [ ... ] }

// Éxito sin datos (DELETE, por ejemplo):
{ "success": true, "message": "Eliminado correctamente" }

// Error de validación:
{ "success": false, "message": "El campo X es requerido" }

// Error de servidor:
{ "success": false, "message": "Error interno" }
```

---

## 5. Notas de implementación

- **Contraseñas:** almacenadas como `MD5` (varchar 32). El servidor hashea antes de comparar/guardar.
- **Multi-tenant:** el parámetro `?db=` determina el schema. El middleware lo lee del JWT claim `db_tenant` si está presente, sino del query param.
- **CORS:** habilitar para `https://app.factura-e.net` y `http://localhost:8080` (desarrollo).
- **Paginación:** endpoints de listado deberían soportar `?page=` y `?limit=` a futuro.
- **Plataforma de usuarios:** el login filtra por `plataforma = 'APP-GIMNASIO'` para aislar los usuarios de la app web de los de otras plataformas (MOVIL, BASCULA, etc.).

---

*Este documento es el contrato entre el frontend (sistema-gimnasio) y API-SIGMA-CLOUD. Actualizar cuando se confirmen o cambien endpoints.*

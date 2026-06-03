# sistema-gimnasio

Panel web multi-tenant del ecosistema SIGMA para la administración integral de gimnasios (socios/staff).

---

## Requisitos

- Node.js (versión >= 6.0.0)
- npm (versión >= 3.0.0)
- Servidor web (Apache 2.4 o Nginx) para desplegar el bundle compilado de producción.

## Instalación

```bash
# Instalar dependencias base del proyecto
npm install

# Instalar dependencias para generación de credenciales con código de barras y QR
npm install jsbarcode qrcode.vue@1.7.0
```

## Ejecución en local

```bash
# Iniciar servidor de desarrollo Webpack (disponible en http://localhost:8080)
npm run dev
```

## Compilación para producción

```bash
# Compilar y minificar archivos para producción en la carpeta /dist
npm run build
```

## Variables de entorno

Debido a que el build utiliza Webpack 3, las variables de entorno no se cargan automáticamente desde un archivo `.env`. En su lugar, se configuran dentro de `config/dev.env.js` y `config/prod.env.js`.

| Variable | Descripción | Default / Ejemplo |
|---|---|---|
| `VUE_APP_API_SIGMA` | URL base del API Gateway de SIGMA-CLOUD | `"https://api-gateway-cloud.telcotronics.net"` |
| `VUE_APP_API_KEY` | API Key del tenant asignada en SIGMA-WEBCONTROL | `"ak_8f58d181cb8ad5042b677cf8a63ca708"` |
| `VUE_APP_DB_TENANT` | Nombre de la base de datos MySQL/MariaDB del tenant | `"TELCOTRONICS"` |

## Licencia

Este proyecto está bajo la licencia Creative Commons Reconocimiento-CompartirIgual 3.0 (CC BY-SA 3.0).

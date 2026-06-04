# Infraestructura SIGMA — Documentación Técnica

---

> # 🚨 PELIGRO — LEER ANTES DE TOCAR CUALQUIER COSA
>
> **ESTE ARCHIVO NO SE EDITA MANUALMENTE. NUNCA. BAJO NINGUNA CIRCUNSTANCIA. SIN AUTORIZACION**
>
> - ❌ No reescribas este archivo.
> - ❌ No elimines secciones existentes.
> - ❌ No agregues datos que pablinux no haya confirmado explícitamente.
> - ❌ No derives datos del código fuente y los documentes aquí como si fueran infraestructura.
>
> **¿Por qué?** Este documento es la biblia compartida de todo el ecosistema Telcotronics.
> Un dato incorrecto aquí afecta a todos los proyectos y a todas las IAs que lo leen.
> La fuente de verdad es el **MCP de infraestructura** (`mcp.telcotronics.net`).

---

> **Propósito:** Describe la arquitectura completa del ecosistema. Ante cualquier tarea técnica, leer primero.
> **Fuentes de verdad:** Árbol Proxmox VE, tabla DHCP MikroTik (mayo 2026), historia documentada por pablinux.
>
> **Documentos relacionados:**
> - 🎨 **[Design System](design-system.md)** — Estándar visual unificado: colores, tipografía, componentes.
> - 🗺️ **[Roadmap](roadmap.md)** — Decisiones técnicas tomadas y pendientes de ejecutar.

---

## Requisito de documentación

> **Este documento no es un inventario de IPs. Es la guía de integración del ecosistema.**
> Cualquier proyecto, app o servicio debe poder conectarse a otro leyendo solo este archivo —
> sin preguntar, sin buscar en el código, sin horas de explicación.
>
> **Regla de oro:** si alguien necesita enviar un correo, usar WhatsApp, facturar, sincronizar ideas
> o consumir cualquier servicio del ecosistema, la respuesta completa debe estar aquí.
>
> **Todo proyecto o servicio documentado aquí debe incluir:**
> - URL del repositorio Git
> - Tecnología principal, responsable y estado actual
> - Servidor de producción — IP, puerto, dominio público
> - Cómo usarlo desde otra app — URL base, autenticación requerida, ejemplo mínimo
> - Swagger / documentación de API si existe
> - BDs que usa — motor, host, nombre, propósito
> - Servicios que consume — para entender sus dependencias
> - Dónde buscar más información — ruta local del `agents.md` del proyecto
>
> **Sé breve y conciso.** Incluye lo suficiente para conectarse — no más.
> Si los detalles completos ya están en Swagger o en el `agents.md` del proyecto, aquí va solo el enlace.
> El criterio es: ¿puede otra IA o desarrollador usar este servicio leyendo solo esta sección?
> Si la respuesta es no, falta información. Si ocupa más de una página, sobra información.

---

## Documentos del ecosistema

> Leer antes de inicializar, diseñar o desplegar cualquier proyecto nuevo.

| Documento | Descripción |
|---|---|
| [`infraestructura.md`](infraestructura.md) | Este documento — arquitectura de servidores, red, CTs y servicios |
| [`design-system.md`](design-system.md) | Sistema de diseño unificado SIGMA — paleta, tipografía, componentes, multi-plataforma |
| [`roadmap.md`](roadmap.md) | Hoja de ruta estratégica — decisiones técnicas tomadas, pendientes de ejecutar |
| [`prompt_ini_proyectos.md`](prompt_ini_proyectos.md) | Plantilla de inicialización para proyectos nuevos del ecosistema |

---

## Convenciones de scripts en proyectos

Todo proyecto del ecosistema usa exactamente **dos scripts**. Nada más.

### `desplegar.sh` — corre desde la máquina de desarrollo

Sube el código al servidor. Cómo lo hace depende del tipo de proyecto:

| Tipo de proyecto | Mecanismo |
|-----------------|-----------|
| Interpretado (Node.js, Python, PHP) | `git push` al repo + SSH al servidor + `git pull` + reinicio del proceso |
| Compilado (Rust, Java, Go) | Compila localmente + `scp`/`rsync` del binario al servidor + reinicio |

Lee `servers.conf` para saber a qué servidores apuntar.
`servers.conf` **nunca se commitea** — cada desarrollador crea el suyo desde `servers.conf.example`.

### `init.sh` — corre en el servidor

Ejecutor local. Solo arranca lo que ya está instalado. No sube código, no compila.
Puede ser simple (un solo comando) o interactivo (menú de opciones).

### Referencia entre proyectos

| Proyecto | `desplegar.sh` | `init.sh` |
|---------|----------------|-----------|
| `siax_monitor` | Compila Rust + scp binario a cada servidor | Instala como servicio systemd |
| `api_service_ia` | git push + SSH + git pull + reinicio tmux | Interactivo — op.1: instala deps + arranca / op.2: solo arranca |
| _(nuevo proyecto)_ | Seguir el mismo patrón | Seguir el mismo patrón |

---

## Historia del ecosistema

El ecosistema comenzó con herramientas como **MAAS de Ubuntu**, **VirtualBox** (servidores de prueba) y **GNS3** (análisis de red). Las IPs fueron asignadas históricamente y se mantienen por continuidad — **no siguen el número del CT de Proxmox**.

Cronología de los servidores principales:

- **IP .50** — Primer servidor web. Reemplazado por el .150.
- **IP .100 / .101** — Primeros dos equipos de desarrollo (siax-amd / siax-intel). IPs anteriores a Proxmox.
- **IP .150 (server-sigma)** — Servidor monolítico original. Corrió todo el sistema SIGMA junto: BD, API Spring Boot, apps Node.js, y más. Fue vaciándose progresivamente: primero salieron las apps Node a `server-webapps`, luego se separaron la BD, la API y el frontend. Hoy está casi vacío y en proceso de retiro.
- **Nodo "cloud"** — Nuevo servidor Proxmox adquirido para reemplazar al .150. Se crearon 5 CTs dedicados: Servidor-web, servidor-email, SERVIDOR-BD, SIGMA-OPEN-API y Servidor-SIGMA-VW.

> ⏳ **Pendiente de eliminar** — esta sección se retira cuando la migración al nuevo cluster esté completa.

---

## MCPs del ecosistema Telcotronics

> El ecosistema tiene **4 MCPs independientes**, cada uno con un rol distinto.
> No confundirlos — conectarse al MCP equivocado da datos incorrectos o genera acciones en el sistema erróneo.

| MCP | URL | Rol | Estado |
|-----|-----|-----|--------|
| **Infraestructura** | `mcp.telcotronics.net` | Fuente de verdad de toda la infraestructura del ecosistema. Las IAs se conectan aquí para leer y actualizar servidores, CTs, redes, servicios y proyectos. **Fuente de este documento.** | 🔧 En mantenimiento |
| **Comunicaciones robóticas** | `sigma-robot.telcotronics.com` | Envío automatizado de mensajes: Email, WhatsApp y otros canales. Usado por agentes y robots del ecosistema para comunicarse con clientes y sistemas externos. | — |
| **ERP / CRM SIGMA** | — | Datos del ERP y CRM de SIGMA — productos, clientes, ventas, inventario. Usado por los módulos comerciales del ecosistema. | — |
| **Ideas** | `ideas.telcotronics.net` | Orquesta las ideas del ecosistema. Centraliza y coordina lo que se escribe en `ideas.md` de cada proyecto. | — |

---

## Ecosistema de Proyectos Telcotronics

| Proyecto | Repositorio / Git | Tecnología Principal | Responsable | Estado | Rol Central |
|---|---|---|---|---|---|
| **sigmac-web** | `https://git.telcotronics.net/pablinux/SIGMAC-WEB_PHP.git` | Vue 3 + Vite + Laravel 13 + PHP 8.5 | pablinux | ✅ Activo | Frontend web del ecosistema SIGMA. SPA Vue con backend Laravel como proxy hacia API-SIGMA-CLOUD y API-SIGMA-WEBCONTROL |
| **mail-monitor** | `https://git.telcotronics.net/pablinux/Monitor-ServerMail.git` | Rust (Axum + sqlx + Tera + HTMX) | pablinux | ✅ Activo | Administración y monitoreo del servidor de correo SIGMA (Postfix + Dovecot). Gestiona usuarios, logs, fail2ban y notifica eventos a API-SIGMA-WEBCONTROL |
| **SIAX Monitor** | `https://git.telcotronics.net/pablinux/SIAX-MONITOR` | Rust (Nativo) | pablinux | ✅ Activo | Agente de monitoreo systemd |
| **Webswing** | `https://git.telcotronics.net/pablinux/JAVA-WEB-SERVER-APPS` | Java 11 build + Jetty | pablinux | ✅ Activo | Servidor GUI a Canvas HTML5 |
| **SIGMAC** | Local — pendiente subir a git.telcotronics.net | Java 11 (NetBeans + Swing) + MySQL / HikariCP | pablinux | ✅ Producción | ERP desktop de facturación electrónica Ecuador. Corre sobre Webswing (CT 141). BD `facturacion` en .116. |
| **SIGMA-OPEN-API** | `https://github.com/telcotronics/xsystem-open-api` | Spring Boot 1.5.9 + Java 8 | pablinux | ✅ Activo (legacy) | API facturación SRI — sistemas existentes. Nueva URL: `api.factura-e.net` |
| **SIGMAC-SRI-API** | `https://git.telcotronics.net/pablinux/SIGMAC-SRI_API.git` | Spring Boot 1.5.9 + Java 8 | pablinux | ✅ Activo | Nueva API facturación SRI — sistemas nuevos. URL: `api.sigmac.app/sri` |
| **API-SIGMA-WEBCONTROL** | `https://git.telcotronics.net/pablinux/API-SIGMA-WEBCONTROL.git` | Node.js (Express) + MariaDB / MySQL | pablinux | ✅ Activo | Base de autorizaciones, notificaciones, identidades y onboarding |
| **API-SIGMA-CLOUD** | `https://github.com/telcotronics/api-gateway-cloud.git` | Node.js (Express) + MySQL | pablinux | ✅ Activo | API Gateway multi-tenant y motor transaccional comercial |
| **sigma-robot** | `https://git.telcotronics.net/pablinux/sigma-robot.git` | Node.js + Express + MySQL + Socket.IO | pablinux | ✅ Activo | Hub central de comunicaciones e IA. Recibe mensajes WhatsApp (Meta + Web Bot), los procesa con IA (fallback automático SIAX→DeepSeek→Gemini→Claude), expone AI Gateway compatible OpenAI para apps externas, y orquesta agentes IA con flujos configurables desde el panel. |
| **WebControlSigma** | `https://git.telcotronics.net/pablinux/Web_siax-sytem.git` | PHP 8.x + MySQL / MariaDB + Rivescript | pablinux | ✅ Activo | Panel web de control administrativo e interfaz visual para control de licencias, usuarios, captcha y gestión de API Keys en el ecosistema Telcotronics. |
| **sigmac_app** | `https://git.telcotronics.net/pablinux/sigmac_app.git` | Flutter 2.11 / Dart 2.17-beta | pablinux | 🟡 En desarrollo activo | App CRM companion multiplataforma (Android + Linux desktop). Cliente nativo offline-first para gestión de ventas, inventario, clientes, pedidos y proformas. Se sincroniza con API-SIGMA-CLOUD y se autentica vía API-SIGMA-WEBCONTROL. |
| **sigmac-web** | `https://git.telcotronics.net/pablinux/SIGMAC-WEB_PHP.git` | Laravel 13 (PHP 8.5) + Vue 3 + Tailwind | pablinux | 🟡 En desarrollo activo | Versión web del CRM companion. SPA Vue 3 + API REST Laravel. Réplica de sigmac_app para el navegador. URL: `crm.sigmac.app`. Desplegado en Servidor-web (.109). |
| **SitioWeb_telcotronics** | [pendiente — crear repo en git.telcotronics.net] | HTML5/CSS3/JS vanilla + PHP 8.5 + PHPMailer | pablinux | ✅ v2.3.1 | Sitio web institucional y tienda en línea de Telcotronics. 914 productos reales vía API-SIGMA-CLOUD. Apache .109 `/var/www/web_telcotronics/public_html/`. Dominio: `telcotronics.com`. |
| **app_ideas** | `https://git.telcotronics.net/pablinux/APPA-GENERQADOR-DE-IDEAS.git` | Node.js (Express) + MongoDB + EJS | pablinux | 🟡 En desarrollo activo | Canvas de ideas y pensamiento visual. Genera, organiza y visualiza ideas con soporte de IA. Incluye panel de dibujo, flujo, recopilación de procesos e integración con AIT (IA Telcotronics). Puerto 2000. BD: MongoDB `app_ideas` en CT 102 (.146). |
| **app_marketing** | [pendiente — crear repo en git.telcotronics.net] | Node.js (Express) + MongoDB + EJS | pablinux | 🟡 En desarrollo activo | Centro de publicidad y marketing del ecosistema. Gestiona campañas para las apps internas, las sirve vía API REST y widget JS embebible. Trackea impresiones y clics por campaña y por app origen. Puerto 2100. BD: MongoDB `app_marketing` en CT 102 (.146). |
| **app_fidelizacion** | [pendiente — crear repo en git.telcotronics.net] | Node.js (Express) + MySQL + EJS | pablinux | 🟡 En desarrollo activo | Plataforma de lealtad, escáner QR y canjes. Gestión de clientes y transacciones de partners. Puerto 2001. BD: MySQL `nexo_fd` en 192.168.10.149. |
| **api_service_ia** | `git@github.com:telcotronics/API_Service_IA.git` | Python 3.14 + FastAPI + uvicorn | pablinux | 🟡 En desarrollo activo | API REST de modelos de IA preentrenados (OCR, STT, TTS, visión facial, PDF). Único proyecto Python serio del ecosistema. Puerto 8000. BD: MariaDB `api_ia_python` en .149. |

---

---

## Infraestructura física

### Red

| Parámetro | Valor |
|-----------|-------|
| Red local | 192.168.10.0/24 |
| Router / DHCP | MikroTik — XSYSTEM MKT |
| DNS / AdBlocker | AdGuard — 192.168.10.2 |
| WiFi AP | EW1200G-PRO — 192.168.10.254 |

> **Nota:** Los contenedores LXC de Proxmox se identifican por MAC con prefijo `BC:24:11:*`. Las IPs no siguen el número del CT — son históricas y se mantienen desde antes de Proxmox.

---

### Conexiones WAN y NAT — MikroTik XSYSTEM MKT

El ecosistema tiene **3 conexiones a internet** con interfaces separadas en el MikroTik. Cada una tiene su propio conjunto de NATs y sirve servicios distintos.

#### Interfaces WAN

| Interface | Tipo | IP pública | Velocidad | Destino principal |
|-----------|------|-----------|-----------|-------------------|
| `P1 WAN` | Fibra directa | `181.198.143.66` | 15 Gbps | Apache .109 (sitios web) + correo + RustDesk |
| `CHR-MKT_old` | VPN tunnel → VPS Google (antiguo) | `34.170.252.64` | — | Nginx Proxy Manager .141 |
| `CHR_XSYSTEM_V2` | VPN tunnel → VPS Google (nuevo) | `104.198.154.171` | — | server-webapps .160 |

> **DNS por dominio:**
> - `siax-system.net` → gestionado por **Cloudflare** (con o sin proxy según el servicio)
> - `sigmac.app`, `telcotronics.net`, `telcotronics.com`, etc. → gestionados en su registrador propio
>
> **`crm.sigmac.app`** — A record directo a `181.198.143.66` (fibra P1 WAN). No necesita Cloudflare proxy: es un CRM de usuarios limitados, la IP de fibra es estable y certbot maneja el SSL en el servidor.

#### NAT Rules activas

| # | Interface entrada | Puerto ext | Destino interno | Servicio |
|---|-------------------|-----------|----------------|---------|
| 3 | CHR_XSYSTEM_V2 | 80 | 192.168.10.160:80 | Nginx (VPS nuevo) |
| 4 | CHR_XSYSTEM_V2 | 443 | 192.168.10.160:443 | Nginx (VPS nuevo) |
| 5 | CHR-MKT_old | 80 | 192.168.10.141:80 | Nginx Proxy Manager |
| 6 | CHR-MKT_old | 443 | 192.168.10.141:443 | Nginx Proxy Manager |
| 7 | P1 WAN | 80 | 192.168.10.109:80 | **Apache — sitios web** |
| 8 | P1 WAN | 443 | 192.168.10.109:443 | **Apache — sitios web (SSL)** |
| 10 | P1 WAN | 25 | 192.168.10.111:25 | SMTP (Postfix) |
| 11 | P1 WAN | 993 | 192.168.10.111:993 | IMAP SSL (Dovecot) |
| 12 | P1 WAN | 587 | 192.168.10.111:587 | SMTP Submission |
| 13 | P1 WAN | 465 | 192.168.10.111:465 | SMTPS |
| 14 | CHR-MKT_old | 25 | 192.168.10.99:25 | SMTP cluster (mail secundario) |
| 15 | CHR-MKT_old | 143 | 192.168.10.99:143 | IMAP cluster |
| 19-21 | P1 WAN | 21114-21119 | 192.168.10.105:21114+ | RustDesk (UDP+TCP) |

#### NAT Rules deshabilitadas (legacy / pendientes)

| # | Servicio | Destino | Motivo |
|---|---------|---------|--------|
| 1 | SMTP por VPN | .150:25 | Legacy server-sigma |
| 9 | Webmin | .150:10000 | Legacy en retiro |
| 16 | SIGMA-WEB | .150:8443 | Legacy en retiro |
| 17 | WEB-SWING | .110:8090 | Acceso directo desactivado |
| 18 | MONITOR SIAX | .150:8080 | Legacy |

#### Flujo de tráfico por dominio

```
Internet
   │
   ├─ Fibra P1 WAN ──────────────► .109 Apache
   │                                  factura-e.net, crm.sigmac.app
   │                                  sigmac.app, telcotronics.com, etc.
   │                                  Correo: .111 (25/587/465/993)
   │                                  RustDesk: .105
   │
   ├─ VPS Google (viejo) ────────► .141 Nginx Proxy Manager
   │   CHR-MKT_old                    api-gateway-cloud.telcotronics.net
   │                                  git, n8n, proxy, mail, voip, etc.
   │
   └─ VPS Google (nuevo) ────────► .160 server-webapps
       CHR_XSYSTEM_V2                 klickbot.app, mesh.telcotronics.net
                                      api-gateway-sigma.telcotronics.net
```

---

### Hypervisor

| Parámetro | Valor |
|-----------|-------|
| Plataforma | Proxmox VE |
| Nombre | BLACK-SERVER |
| Nodo `cloud` | Servidor nuevo — CTs críticos de producción SIGMA |
| Nodo `cluster` | Servidor principal — resto de servicios del ecosistema |

---

### Todos los CTs y servicios del ecosistema

#### Nodo cloud (producción SIGMA)

| CT | IP | Nombre | Tecnología | Rol | Estado |
|----|-----|--------|-----------|-----|--------|
| 141 | 192.168.10.110 | Servidor-SIGMA-VW | Webswing 20.2.5 + Java Swing | Frontend SIGMA | running |
| 142 | 192.168.10.120 | SIGMA-OPEN-API / SIGMAC-SRI-API | Spring Boot 1.5.9 + Java 8 | API REST facturación (puerto 8080 legacy + 8082 nueva) | running |
| 144 | 192.168.10.111 | servidor-email | Postfix + Dovecot + SnappyMail + **mail-monitor** | Correo + administración | running |
| 145 | 192.168.10.116 | SERVIDOR-BD | PostgreSQL 16.13 | BD sigma_api | running |
| 150 | 192.168.10.109 | Servidor-web | Apache 2.4.66 + PHP 8.5-FPM | Proxy reverso público + host de sitios PHP | running |

#### Nodo cluster (ecosistema)

| CT | IP | Nombre | Tecnología | Rol | Estado |
|----|-----|--------|-----------|-----|--------|
| 100 | 192.168.10.141 | nginxproxymanager | Nginx Proxy Manager | Reverse proxy con UI | running |
| 101 | 192.168.10.143 | cloudflared | Cloudflare Tunnel | Túnel seguro internet | running |
| 102 | 192.168.10.146 | mongodb | MongoDB | BD documental | running |
| 103 | 192.168.10.2 | adguard | AdGuard Home | DNS + bloqueador ads | running |
| 105 | 192.168.10.145 | Ubuntu-Docker | Node.js + **API-SIGMA-WEBCONTROL** | API central auth/onboarding (tmux, pendiente siax-monitor) | running |
| 107 | 192.168.10.156 | syncthing | Syncthing | Sincronización archivos | running |
| 108 | 192.168.10.108 | Servidor-IA (SIAX) | IA autónoma | Coordinador autónomo | running |
| 110 | 192.168.10.106 | meshcentral | MeshCentral | Gestión remota equipos | running |
| 114 | 192.168.10.149 | mariadb | MariaDB + phpMyAdmin | BD relacional (mailserver_db) | running |
| 121 | 192.168.10.112 | SERVER-MAIL | — | Servidor mail secundario | running |
| 122 | 192.168.10.171 | n8n | n8n | Automatización flujos | running |
| 123 | 192.168.10.107 | rustdeskserver | RustDesk Server | Escritorio remoto | running |
| 124 | 192.168.10.173 | jupyternotebook | Jupyter Notebook | Data science / IA | running |
| 125 | 192.168.10.148 | sqlserver2022 | SQL Server 2022 | BD Microsoft | running |
| 128 | 192.168.10.103 | VOIP-SERVER | — | Telefonía IP | running |
| 130 | 192.168.10.151 | gitea | Gitea | Repositorio Git | running |
| 132 | 192.168.10.160 | server-webapps | Node.js / PM2 + **API-SIGMA-CLOUD** | Apps web + API Gateway | running |
| 133 | 192.168.10.144 | redis | Redis | Cache en memoria | running |
| 134 | 192.168.10.102 | apache-tomcat | Apache Tomcat | Servidor Java legacy | running |
| 137 | 192.168.10.172 | flowiseai | Flowise AI | Flujos IA low-code | running |
| 138 | 192.168.10.152 | jenkins | Jenkins | CI/CD | running |
| 139 | 192.168.10.147 | postgresql | PostgreSQL | BD adicional | running |
| 140 | 192.168.10.98 | API-FACTURACION | — | API facturación adicional | running |
| 143 | 192.168.10.115 | DB-EMPRESAS | — | BD de empresas (Tenants) | running |

---

### Mapa de dominios

#### Nginx Proxy Manager (CT 100 — 192.168.10.141)

> Gestiona todos los dominios públicos del ecosistema con SSL automático vía Let's Encrypt.
> Panel admin: `https://proxy.telcotronics.net`

| # | Dominio(s) | Destino interno | SSL | Estado |
|---|-----------|----------------|-----|--------|
| 1 | `mesh.telcotronics.net` | 192.168.10.160:443 | HTTP Only | ✅ Online |
| 2 | `cluster.telcotronics.net` | 192.168.10.140:8006 | Let's Encrypt | ✅ Online |
| 3 | `proxy.telcotronics.net` | 192.168.10.141:81 | Let's Encrypt | ✅ Online |
| 4 | `telcotronics.net` | 192.168.10.166:80 | HTTP Only | ✅ Online |
| 5 | `android.telcotronics.net` | 192.168.10.150:4000 | Let's Encrypt | ✅ Online |
| 8 | `n8n.telcotronics.net` | 192.168.10.171:5678 | Let's Encrypt | ✅ Online |
| 9 | `whisper.telcotronics.net` | 192.168.10.145:8000 | Let's Encrypt | ✅ Online |
| 10 | `voip.telcotronics.net` | 192.168.10.102:80 | Let's Encrypt | ✅ Online |
| 11 | `sigma.telcotronics.net` | 192.168.10.150:8443 | Let's Encrypt | ❌ Offline |
| 12 | `api.telcotronics.net` | 192.168.10.145:8000 | Let's Encrypt | ✅ Online |
| 13 | `dibujo.telcotronics.net` | 192.168.10.159:3000 | Let's Encrypt | ✅ Online |
| 15 | `xsend.telcotronics.net` | 192.168.10.147:80 | Let's Encrypt | ✅ Online |
| 17 | `git.telcotronics.net` | 192.168.10.151:3000 | Let's Encrypt | ✅ Online |
| 19 | `api.klickbot.app` | 192.168.10.170:4001 | Let's Encrypt | ✅ Online |
| 20 | `app.klickbot.app` | 192.168.10.170:3001 | Let's Encrypt | ✅ Online |
| 22 | `api-gateway-cloud.telcotronics.net` | 192.168.10.160:3003 | Let's Encrypt | ✅ Online |
| 23 | `api-gateway-sigma.telcotronics.net` | 192.168.10.160:3003 | Let's Encrypt | ✅ Online |
| 24 | `klickbot.app` | 192.168.10.160:3005 | Let's Encrypt | ✅ Online |

> **Nota:** `api-gateway-cloud` y `api-gateway-sigma` apuntan al mismo destino (.160:3003) — dos dominios para el mismo servicio API-SIGMA-CLOUD. `sigma.telcotronics.net` offline — servicio en .150 (legacy en retiro).

---

### Equipos de desarrollo

| IP | Nombre | Descripción |
|----|--------|-------------|
| 192.168.10.100 | siax-amd | Workstation AMD — desarrollo |
| 192.168.10.101 | siax-intel | Workstation Intel — desarrollo |
| 192.168.10.72 | pablinux-laptop | Laptop de trabajo |
| 192.168.10.155 | DAPSI | Sistema de domótica |

---

### Servidor legacy en retiro

| Parámetro | Valor |
|-----------|-------|
| Nombre | server-sigma |
| IP | 192.168.10.150 |
| OS | Ubuntu 20.04 LTS |
| Estado | ⚠️ En proceso de retiro |
| Historia | Servidor monolítico original. BD ya migrada. Casi vacío. |

---

---

## Bases de datos

### CT cloud — SERVIDOR-BD (192.168.10.116)

| Parámetro | Valor |
|-----------|-------|
| IP | 192.168.10.116 |
| MAC | BC:24:11:50:DE:27 |
| CT Proxmox | 145 (nodo cloud) |
| OS | Ubuntu 24.04 LTS |
| Motores activos | **MySQL 8.0.45** (Producción) / **PostgreSQL 16.13** (API) |
| Bases de datos MySQL | `TELCOTRONICS` (servidor propio de la dueña y patrocinadora), `SIGMA`, `facturacion` |
| Bases de datos PostgreSQL | `sigma_api` (SIGMA-OPEN-API legacy), `sigmac_sri` (SIGMAC-SRI-API nueva), `veronica` (Base original) |
| Rol central | Servidor de base de datos de producción exclusivo de **TELCOTRONICS**. **MySQL** hospeda sus datos comerciales privados en total aislamiento sin compartir nada. **PostgreSQL** es el motor compartido para el almacenamiento de facturas electrónicas de clientes exclusivamente a través de la API `sigma-open-api`. |

**⚠️ Notas de Configuración:**
*   **MySQL (Puerto 3306):** Hospeda de manera aislada y privada los datos comerciales e internos de Telcotronics. No tiene contacto con clientes ni con `sigma-open-api`.
*   **PostgreSQL (Puerto 5432):** Hospeda la base `sigma_api` utilizada de forma compartida por `sigma-open-api` para facturación electrónica con el SRI. Mantener `password_encryption = md5`. El driver JDBC `postgresql-9.4.1212.jre7` no soporta `scram-sha-256`.

---

### CT cluster — mariadb (192.168.10.149)

| Parámetro | Valor |
|-----------|-------|
| IP | 192.168.10.149 |
| MAC | BC:24:11:96:D4:49 |
| CT Proxmox | 114 (nodo cluster) |
| OS | Debian 12 |
| Motor | **MariaDB 10.11.14** |
| Base de datos crítica | **`webControl`** (Base central de WebControlSigma / `Web_siax-sytem`) |
| Otras BDs hospedadas | `mailserver_db` (correo), `gitea` (repositorios), `siax_core`, `SIGMA`, `TELCOTRONICS`, `facturacion`, entre otras (27 BDs en total). |
| Rol central | Servidor de base de datos relacional del clúster del ecosistema. Provee almacenamiento centralizado y es donde vive la base de datos `webControl` con las tablas `usuarios_sesion` (login) y `api_key` (llaves de API). |

---

### CT cluster — DB-EMPRESAS (192.168.10.115)

| Parámetro | Valor |
|-----------|-------|
| IP | 192.168.10.115 |
| MAC | BC:24:11:D4:3C:73 |
| CT Proxmox | 143 (nodo cluster) |
| OS | Ubuntu 24.04 LTS |
| Motor | **MySQL 8.0.45** |
| Bases de datos hospedadas | `EMPRESA_EL_SOL` (Base de datos de cliente tenant activo), `admin` |
| Rol central | Servidor de bases de datos de clientes (Tenants) del ecosistema. Utilizado críticamente por `api-gatewaycloud.telcotronics.net` (`API-SIGMA-CLOUD`) para enrutar de forma dinámica y síncrona el flujo comercial diario de los clientes finales. |

---

---

## APIs

### Sistema SIGMA — Facturación electrónica

SIGMA es el sistema de **facturación electrónica** para Ecuador, basado en el proyecto open source [Verónica](https://github.com/RolandoPalermo/veronica-open-api), adaptado localmente. Se comunica con el **SRI** para envío y autorización de comprobantes electrónicos. Corre en el nodo **cloud** de Proxmox.

#### Flujo de una factura

```
Usuario (navegador)
      │
      ▼
Servidor-SIGMA-VW — Webswing (192.168.10.110)
App Java Swing corriendo en servidor, visible en navegador vía HTML5
      │
      ▼
Servidor-web — Apache proxy (192.168.10.109)
api.factura-e.net → 192.168.10.120:8080
      │
      ▼
SIGMA-OPEN-API — Spring Boot (192.168.10.120:8080)
      │                        │
      ▼                        ▼
SERVIDOR-BD               SRI Ecuador
PostgreSQL 16             cel.sri.gob.ec (internet)
192.168.10.116:5432
```

---

### CT cloud — SIGMA-OPEN-API (192.168.10.120)

| Parámetro | Valor |
|-----------|-------|
| IP | 192.168.10.120 (IP fija) |
| MAC | BC:24:11:1D:F6:60 |
| CT Proxmox | 142 (nodo cloud) |
| OS | Ubuntu 24.04 LTS |
| Rol | API REST de facturación electrónica |
| Framework | Spring Boot 1.5.9 |
| Java | OpenJDK **8** (1.8.0_482) — **NO usar Java 9+** |
| Puerto | 8080 |
| Contexto URL | `/veronica` |
| Usuario deploy | `pablinux` |

**Ruta del proyecto:** `/home/pablinux/app/sigma-open-api/`

**Arrancar:**
```bash
sh /home/pablinux/app/1_factElect_modoPROD.sh   # producción
sh /home/pablinux/app/0_factElect_modoDEV.sh    # desarrollo
```

**Endpoints:**
| Recurso | URL |
|---------|-----|
| Swagger UI | `http://192.168.10.120:8080/veronica/swagger-ui.html` |
| OAuth token | `POST http://192.168.10.120:8080/veronica/oauth/token` |
| API facturas | `http://192.168.10.120:8080/veronica/api/v1.0/` |

**⚠️ Si Maven falla por repositorios HTTP bloqueados:** comentar bloque `maven-default-http-blocker` en `/usr/share/maven/conf/settings.xml`.

---

### CT cloud — SIGMAC-SRI-API (192.168.10.120 — puerto 8082)

| Parámetro | Valor |
|-----------|-------|
| Repositorio Git | `https://git.telcotronics.net/pablinux/SIGMAC-SRI_API.git` |
| Tecnología principal | Spring Boot 1.5.9 + Java 8 (⚠️ Java 9+ rompe dependencias de firma digital) |
| Responsable | pablinux |
| Estado actual | ✅ Producción |
| Equipo / ubicación local | `siax-amd` (`192.168.10.100`) — `/home/pablinux/Projects/java/sigmac-sri-api` |
| CT Proxmox | 142 (nodo cloud) — comparte CT con SIGMA-OPEN-API |
| Puerto interno | `8082` |
| URL interna | `http://192.168.10.120:8082/sri` |
| Dominio público | `https://api.sigmac.app` (SSL Let's Encrypt — expira 2026-08-30) |
| Contexto URL | `/sri` |
| Autenticación | OAuth2 Password Grant — `POST https://api.sigmac.app/sri/oauth/token` |
| Documentación API | `https://api.sigmac.app/sri/swagger-ui.html` |
| Última actualización | 2026-06-01 |

`SIGMAC-SRI-API` es el fork limpio y propiedad total de Telcotronics de la API de facturación electrónica SRI. Sucesor de `SIGMA-OPEN-API` con namespace unificado `com.telcotronics.sri`. Gestiona el ciclo de vida completo de comprobantes electrónicos: generación XML → firma XAdES-BES → envío SRI → autorización → RIDE (PDF). **Esta es la API oficial del ecosistema. Todos los sistemas nuevos deben integrar esta API.**

> ⚠️ **`SIGMA-OPEN-API` (`api.factura-e.net`) entra en estado LEGACY** — solo se mantiene para sistemas existentes que no pueden actualizarse. No integrar nuevos proyectos contra ella. La migración progresiva hacia `api.sigmac.app` es el camino a seguir.

**Credenciales de acceso:**

| Tipo | Parámetro | Valor | Uso |
|------|-----------|-------|-----|
| OAuth2 client | client / secret | `pablinux` / `Microbot%` | Requerido en todas las peticiones de token — va en HTTP Basic Auth |
| Usuario ADMIN | username / password | `admin` / `SigmacAdmin.2026@` | `ROLE_ADMIN` — gestión de certificados, usuarios, catálogos, stats |
| Usuario MONITOR | username / password | _(crear vía admin)_ | `ROLE_MONITOR` — monitoreo operativo: tokens, certificados, stats. Sin acceso a gestión |
| Usuario USER (pruebas) | username / password | `facturador_app` / `SigmacUser.2026@` | `ROLE_USER` — emisión de comprobantes. Usar para pruebas; cada cliente solicita su propio usuario al admin |

> Cada sistema o cliente que consuma esta API debe solicitar al admin la creación de su propio usuario con `ROLE_USER` vía `POST /sri/operaciones/usuarios`.

**Cómo obtener un token y usarlo (ejemplo completo):**

```bash
# 1. Obtener token (client en Basic Auth, usuario en el body)
curl -u pablinux:Microbot% -X POST https://api.sigmac.app/sri/oauth/token \
  -d "username=facturador_app&password=SigmacUser.2026@&grant_type=password"
# Respuesta: { "access_token": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "expires_in": 1199 }

# 2. Usar el token en cada petición
curl https://api.sigmac.app/sri/api/v1.0/facturas/{claveAcceso}/archivos/xml \
  -H "Authorization: Bearer xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# 3. Token ADMIN para stats y gestión
curl -u pablinux:Microbot% -X POST https://api.sigmac.app/sri/oauth/token \
  -d "username=admin&password=SigmacAdmin.2026@&grant_type=password"
```

**BD que usa:**

| BD | Host | Motor | Uso |
|----|------|-------|-----|
| `sigmac_sri` | `192.168.10.116:5432` | PostgreSQL 16.13 | Comprobantes electrónicos (facturas, retenciones, guías, notas, liquidaciones) |

**Endpoints principales (para integración):**

| Método | Endpoint | Descripción | Auth |
|--------|---------|-------------|------|
| POST | `https://api.sigmac.app/sri/oauth/token` | Obtener token OAuth2 | Client `pablinux:Microbot%` |
| POST | `https://api.sigmac.app/sri/api/v1.0/facturas` | Crear y firmar factura | `ROLE_USER` |
| PUT | `https://api.sigmac.app/sri/api/v1.0/facturas/{clave}/enviar` | Enviar al SRI | `ROLE_USER` |
| PUT | `https://api.sigmac.app/sri/api/v1.0/facturas/{clave}/autorizar` | Consultar autorización | `ROLE_USER` |
| GET | `https://api.sigmac.app/sri/api/v1.0/facturas/{clave}/archivos/pdf` | Descargar RIDE (PDF) | `ROLE_USER` |
| GET | `https://api.sigmac.app/sri/api/v1.0/facturas/{clave}/archivos/xml` | Descargar XML firmado | `ROLE_USER` |
| GET | `https://api.sigmac.app/sri/operaciones/stats/resumen` | Total por tipo y estado | `ROLE_ADMIN` |
| GET | `https://api.sigmac.app/sri/operaciones/stats/hoy` | Comprobantes del día | `ROLE_ADMIN` |
| GET | `https://api.sigmac.app/sri/operaciones/stats/recientes?limit=N` | Últimos N comprobantes | `ROLE_ADMIN` |
| GET | `https://api.sigmac.app/sri/monitor/tokens` | Tokens activos por usuario | `ROLE_MONITOR` |
| DELETE | `https://api.sigmac.app/sri/monitor/tokens/{username}` | Revocar tokens de un usuario | `ROLE_MONITOR` |
| GET | `https://api.sigmac.app/sri/monitor/certificados` | Estado y caducidad de certs PKCS12 | `ROLE_MONITOR` |
| GET | `https://api.sigmac.app/sri/monitor/stats/resumen` | Resumen general (monitor) | `ROLE_MONITOR` |
| GET | `https://api.sigmac.app/sri/monitor/stats/hoy` | Comprobantes del día (monitor) | `ROLE_MONITOR` |
| GET | `https://api.sigmac.app/sri/monitor/stats/recientes?limit=N` | Últimos N comprobantes (monitor) | `ROLE_MONITOR` |

El mismo patrón de endpoints aplica para: `retenciones`, `guias-remision`, `notas-credito`, `notas-debito`, `liquidaciones-compra`.

**Módulos disponibles:**

| Módulo | Endpoint base | Auth | Estado |
|--------|--------------|------|--------|
| Factura | `/sri/api/v1.0/facturas` | ROLE_USER | ✅ Operativo |
| Retención | `/sri/api/v1.0/retenciones` | ROLE_USER | ✅ Operativo |
| Guía de Remisión | `/sri/api/v1.0/guias-remision` | ROLE_USER | ✅ Operativo |
| Nota de Crédito | `/sri/api/v1.0/notas-credito` | ROLE_USER | ✅ Operativo |
| Nota de Débito | `/sri/api/v1.0/notas-debito` | ROLE_USER | ✅ Operativo |
| Liquidación de Compra | `/sri/api/v1.0/liquidaciones-compra` | ROLE_USER | ✅ Operativo |
| Estadísticas (admin) | `/sri/operaciones/stats/*` | ROLE_ADMIN | ✅ Operativo |
| Monitor | `/sri/monitor/*` (tokens, certificados, stats) | ROLE_MONITOR | ✅ Operativo |

**Servicios externos que consume:**

| Servicio | URL | Uso |
|---------|-----|-----|
| SRI Recepción (prod) | `https://cel.sri.gob.ec/.../RecepcionComprobantesOffline?wsdl` | Envío comprobantes |
| SRI Autorización (prod) | `https://cel.sri.gob.ec/.../AutorizacionComprobantesOffline?wsdl` | Autorización SRI |

**Integración con el ecosistema:**
- Independiente — no consume APIs internas del ecosistema
- Los sistemas nuevos que requieran facturación deben apuntar a `api.sigmac.app/sri`
- Para más información técnica: `siax-amd:/home/pablinux/Projects/java/sigmac-sri-api/agents.md`

**Arrancar en producción:**
```bash
cd /home/pablinux/app/sigmac-sri-api
./init.sh   # selecciona 2 (producción)
# o: java -jar sigmac-sri-api.jar
```

---

### API-SIGMA-WEBCONTROL — Centro de control administrativo y seguridad

| Parámetro | Valor |
|-----------|-------|
| Repositorio Git | `https://git.telcotronics.net/pablinux/API-SIGMA-WEBCONTROL.git` |
| Tecnología principal | Node.js (Express) con pool de conexión `mysql2/promise` |
| Responsable | pablinux |
| Estado actual | ✅ Producción — `Ubuntu-Docker` CT 105 (`192.168.10.145`) |
| Equipo / ubicación local | `siax-amd` (`192.168.10.100`) — `/home/pablinux/Projects/Node/API-SIGMA-WEBCONTROL` |
| Proceso | `tmux` sesión con `npm start` en `/root/app/API-SIGMA-WEBCONTROL` — pendiente migrar a **siax-monitor** |
| Puerto interno | `3002` |
| URL interna | `http://192.168.10.145:3002` |
| Dominio público | Sin dominio propio — consumido internamente. `sigmac-web` (Laravel) lo proxea para la web. |
| Autenticación | Login por `usrSesion_email` (desde 2026-05-27) — soporta bcrypt y plain-text con auto-migración |
| Rol en el ecosistema | Núcleo central de autorizaciones y notificaciones de salud del ecosistema completo |

`API-SIGMA-WEBCONTROL` es el cerebro y columna vertebral de seguridad y eventos del ecosistema SIGMA. Actúa como la fuente única de verdad para autorizar procesos y recopilar la salud e incidencias operativas de toda la red local y cloud de Telcotronics:

*   **Base Central de Autorizaciones (API Keys)**: Genera, almacena y valida las llaves de acceso de sistema (**API Keys** en la tabla `webControl.api_key`). Es consumida críticamente por las aplicaciones comerciales y, fundamentalmente, por agentes de monitoreo e infraestructura como **SIAX Monitor**, **mail-monitor** o **server-monitor** (encargado de alertar sobre la caída de instancias o servidores) para autenticar sus despachos de telemetría.
*   **Base Central de Notificaciones de Salud y Eventos**: Centraliza y procesa el flujo de logs de errores, caídas de servicios y alertas críticas del sistema. Despacha alertas a las interfaces correspondientes tras recibir notificaciones de eventos (como caídas detectadas por los monitores del cluster o estados de rechazo de documentos del SRI procesados por n8n).
*   **CRM y Licenciamiento**: Controla el registro de empresas aliadas y gestiona los parámetros globales de suscripciones y accesos de usuarios de plataforma.
*   **Onboarding Automático en 3 Pasos**:
    1.  *Pre-registro*: Registra provisionalmente datos en la tabla temporal `usuarios_xValidar` (`usr_est=0`), genera un token y despacha un código OTP de 6 dígitos vía correo electrónico (`emailService.js`) con rate limiting (3 intentos cada 15 min) para mitigar spam de cuentas.
    2.  *Verificación OTP*: Valida el OTP antes de 10 minutos desde el envío. Tras verificarlo, cambia el estado a `usr_est=1` y autoriza al cliente a instanciar la cuenta definitiva.
    3.  *Aprovisionamiento de Base de Datos*: Crea el usuario definitivo en la tabla `usuarios_sesion` (contraseña bcrypt) y clona síncronamente el molde MySQL oficial hacia la nueva base de datos del cliente (`EMPRESA_XXX`) en el host de Tenants (`.115`) ejecutando el script `tenantSchema.js`.
*   **Directorio Centralizado de Clientes**: Proveedor de búsqueda y validación global de datos tributarios RUC/Cédula integrando consultas en bases internas y servicios externos.

**BDs que usa:**

| BD | Host | Motor | Uso |
|----|------|-------|-----|
| `webControl` | `192.168.10.149` | MariaDB 10.11 | `usuarios_sesion` (identidades + login), `usuarios_xValidar` (onboarding temporal), `api_key` (llaves de API) |
| `TELCOTRONICS` | `192.168.10.116` | MySQL 8.0 | Molde/plantilla — clonado para crear BDs tenant en onboarding paso 3 |
| `EMPRESA_XXX` (dinámica) | `192.168.10.115` | MySQL 8.0 | BD del nuevo tenant — aprovisionada automáticamente en paso 3 del onboarding |

**Servicios que consume:**

| Servicio | Host / URL | Uso |
|---------|-----------|-----|
| SMTP | `smtp.sigmac.app:587` (interno: `192.168.10.111:587`) | Envío de OTP al registrar usuarios — `no-reply@sigmac.app`, STARTTLS |

**Endpoints principales (para integración):**

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/pre-register` | Paso 1 onboarding — registro temporal + envío OTP | Pública |
| POST | `/api/auth/verify-otp-registro` | Paso 2 — verificación OTP (10 min, rate limit 3 intentos/15 min) | Pública |
| POST | `/api/auth/register` | Paso 3 — cuenta definitiva + aprovisionamiento BD tenant | Pública |
| POST | `/api/auth/empresas` | Pre-login — devuelve empresas del email sin emitir JWT. `unica: true` si solo tiene una. | Pública |
| POST | `/api/auth/login` | Login — emite JWT (8h) + apiKey. `?dba=EMPRESA_XXX` opcional para multi-empresa. Registra `usrSesion_ultimo_login`. | Pública |
| POST | `/api/auth/forgot-password` | Recuperación paso 1 — envía OTP al email. Respuesta genérica (no revela si existe). | Pública |
| POST | `/api/auth/reset-password` | Recuperación paso 2 — verifica OTP y actualiza contraseña en cloud. | Pública |
| * | `/api/notificaciones/*` | Recepción de eventos de salud e incidencias del ecosistema | `x-api-key` |
| * | `/api/apps/*`, `/api/apps_servcs/*` | Estado e info de apps satélite | `x-api-key` |
| * | `/api/clientes/*` | Validación y búsqueda de RUC/Cédula | `x-api-key` |
| * | `/api/sri/*` | Configuración de firmas electrónicas y SRI | `x-api-key` |

**Header de autenticación para endpoints protegidos:** `x-api-key: {key}` (tabla `webControl.api_key`)

**Módulos disponibles:**

| Módulo | Prefijo de ruta | Estado |
|--------|----------------|--------|
| Autenticación y Onboarding | `/api/auth` | ✅ Operativo |
| Infraestructura y Apps satélite | `/api/apps`, `/api/apps_servcs` | ✅ Operativo |
| Documentos Electrónicos y SRI | `/api`, `/api/sri` | ✅ Operativo |
| Directorio Centralizado de Clientes | `/api/clientes` | ✅ Operativo |
| Monitoreo, Alertas y Proyectos | `/api/notificaciones`, `/api/proyectos` | ✅ Operativo |

**Integración con el ecosistema:**
- **factura-e**: usa `webControl.usuarios_sesion` directamente para auth — login por `usrSesion_email` + bcrypt/plain-text
- **sigmac_app** / **sigmac-web**: registro y login vía `/api/auth/*`. Usuarios nuevos quedan con `usrSesion_panel = 'configuracion'`
- **API-SIGMA-CLOUD**: valida `x-api-key` contra `webControl.api_key` (`.149`) en cada petición entrante
- **mail-monitor**: notifica eventos de seguridad (bans fail2ban, cambios de cuenta) vía `x-api-key`
- Para más información técnica del proyecto: consultar localmente en `siax-amd:/home/pablinux/Projects/Node/API-SIGMA-WEBCONTROL/agents.md`

---

### API-SIGMA-CLOUD — API Gateway Multi-tenant

| Parámetro | Valor |
|-----------|-------|
| Repositorio Git | `https://github.com/telcotronics/api-gateway-cloud.git` (Gitea: `https://git.telcotronics.net/pablinux/API-GATEWAY-CLOUD.git`) |
| Tecnología principal | Node.js (Express) con conmutador de pools dinámicos (`mysql2/promise`) |
| Responsable | pablinux |
| Estado actual | ✅ Producción — `server-webapps` CT 132 (`192.168.10.160`) |
| Equipo / ubicación local | `siax-amd` (`192.168.10.100`) — `/home/pablinux/Projects/Node/API-SIGMA-CLOUD` |
| Puerto interno | `3003` |
| URL interna | `http://192.168.10.160:3003` |
| Dominio público | `api-gateway-cloud.telcotronics.net` / `api-gateway-sigma.telcotronics.net` |
| Servicio systemd | `api-gateway.service` |
| Documentación API | `https://api-gateway-cloud.telcotronics.net/api-docs` (Swagger UI) |
| Rol en el ecosistema | API Gateway multi-tenant cloud y motor transaccional comercial diario de todos los tenants |

`API-SIGMA-CLOUD` es el proxy y enrutador comercial del ecosistema. Se conecta directamente con las aplicaciones de campo finales (Webswing, `sigmac_app` Flutter, `sigma_app` Android) para procesar el volumen operativo diario de cada tenant. Actúa como puente dinámico entre las apps y las bases de datos individuales de los clientes:

*   **Enrutamiento Dinámico Multi-tenant**: Middleware `dbConnection.js` enruta en caliente cada petición hacia la BD del cliente (`EMPRESA_XXX`) mediante el header `x-database` o el parámetro `?db=`.
*   **Autenticación en Dos Capas**: API Key (`x-api-key`) validada contra `webControl.api_key` en `.149`, y JWT Bearer (8 h) para sesiones de usuarios dentro del tenant.
*   **Transaccionalidad Comercial**: Inserción de pedidos, proformas e items bajo `BEGIN TRANSACTION / COMMIT / ROLLBACK` — sin corrupción de registros contables.
*   **Sincronización Delta Offline**: Endpoints masivos con filtro `?desde=` y paginación `?limite=`/`?offset=`. El sync masivo excluye imágenes — se recuperan puntualmente en Base64 con `/api/items/get-items/:item`.

**BDs que usa:**

| BD | Host | Motor | Uso |
|----|------|-------|-----|
| `webControl` | `192.168.10.149` | MariaDB 10.11 | Tabla `api_key` — validación de API Keys en cada petición entrante |
| `EMPRESA_XXX` (dinámica) | `192.168.10.115` | MySQL 8.0 | BD operativa del tenant enrutado — toda la lógica de negocio diaria |
| `TELCOTRONICS` | `192.168.10.116` | MySQL 8.0 | Pool por defecto — datos propios Telcotronics |
| `SIGMA` | `192.168.10.116` | MySQL 8.0 | Pool histórico — consultas legacy |
| `sigma_tv` | `192.168.10.149` | MariaDB 10.11 | Pool canales Sigma TV |

**Headers de autenticación e integración:**

| Header / Param | Requerido | Descripción |
|----------------|-----------|-------------|
| `x-api-key` | ✅ Siempre | API Key del ecosistema — validada contra `webControl.api_key` en `.149` |
| `x-database` o `?db=` | ✅ En endpoints tenant | Nombre de la BD del cliente (ej: `EMPRESA_EL_SOL`) |
| `Authorization: Bearer {jwt}` | En endpoints de usuario | JWT emitido por `/api/auth/login-socio` (validez 8 h) |

**Módulos disponibles:**

| Módulo | Prefijo de ruta | Estado |
|--------|----------------|--------|
| Autenticación dual (admins bcrypt + socios MD5 legacy) | `/api/auth` | ✅ Operativo |
| Catálogo e Inventario (sync delta, PVP multi-tarifa) | `/api/items` | ✅ Operativo |
| Clientes y Miembros | `/api/clientes` | ✅ Operativo |
| Documentos transaccionales (Pedidos y Proformas) | `/api/documentos` | ✅ Operativo |
| Contabilidad y Plan de Cuentas (sync offline Android) | `/api/contabilidad` | ✅ Operativo |
| Panel (Cajas activas, Pagos, Comprobantes) | `/api/panel` | ✅ Operativo |
| Localización (Áreas físicas) | `/api/localizacion` | ✅ Operativo |
| Notificaciones y Alertas | `/api/notificaciones` | ✅ Operativo |

**Integración con el ecosistema:**
- **API-SIGMA-WEBCONTROL**: fuente de validación de `x-api-key` — toda petición entrante consulta `webControl.api_key` en `.149`
- **DB-EMPRESAS (.115)**: destino dinámico de todas las operaciones comerciales de tenants vía `dbConnection.js`
- **sigmac_app / sigmac-web**: consumidor principal — sync offline, pedidos, proformas, clientes e items
- **Webswing (.110)**: cliente desktop de operaciones comerciales diarias
- Para más información técnica del proyecto: consultar localmente en `siax-amd:/home/pablinux/Projects/Node/API-SIGMA-CLOUD/agents.md`

---

---

## Aplicaciones web

### CT cloud — Servidor-web (192.168.10.109)

| Parámetro | Valor |
|-----------|-------|
| IP | 192.168.10.109 |
| MAC | BC:24:11:68:9D:74 |
| CT Proxmox | 150 (nodo cloud) |
| Motor | Apache 2.4.66 + PHP **8.5**-FPM |
| Rol | Proxy reverso público + host de sitios PHP |

> **Convención de directorios:** `/var/www/web_[nombre]/`

| Directorio | Dominio | Notas |
|-----------|---------|-------|
| `web_factura-e` | `factura-e.net` / `app.factura-e.net` | ← **FACTURA-E** (ERP Facturador SIGMA) |
| `web_sigmac-crm` | `crm.sigmac.app` | sigmac-web (Laravel 13 + Vue 3) |
| `web_sigmac_app` | `sigmac.app` | Web de la marca SIGMAC |
| `web_telcotronics` | `telcotronics.com` | Web corporativa Telcotronics |
| `web_domus-fa` | `domus-fa.com` | Sistema domótica DAPSI |
| `web_acerogas` | — | Cliente Acerogas |
| `web_artesymas` | — | Cliente Artes y Más |
| `web_fact_pro` | — | Facturador Pro |
| `web_gimnasio` | — | Cliente Gimnasio |
| `web_helpdesk` | — | Help Desk |
| `web_tiendaPadi` | — | Cliente Tienda Padi |
| `web_xsystem` | — | XSystem |
| `web_zonaindustrial` | — | Cliente Zona Industrial |
| `web_test_facturador` | — | Entorno de pruebas |

**Proxies internos (Apache → backend):**

| Dominio | Destino |
|---------|---------|
| `api.factura-e.net` | http://192.168.10.120:8080/ |
| `app.factura-e.net` | http://*:3001/ |
| `api.sigmac.app` | http://192.168.10.120:8082/ |

---

### CT cloud — Servidor-SIGMA-VW (192.168.10.110)

| Parámetro | Valor |
|-----------|-------|
| IP | 192.168.10.110 |
| MAC | BC:24:11:DC:3B:6E |
| CT Proxmox | 141 (nodo cloud) |
| Rol | Frontend del sistema SIGMA |
| Tecnología | **Webswing 20.2.5** |
| Stack | Java 11 (build) / Java 8 o 11 (runtime), Jetty 9.4, Jersey 2.31, Google Guice 4.1, Protocol Buffers 3.12, TypeScript 5.5, Webpack 5.93 |

**¿Qué es Webswing?** Permite ejecutar aplicaciones Java Swing en el navegador usando HTML5, sin modificar el código fuente. Intercepta el sistema gráfico de Java (AWT Toolkit) y convierte las operaciones gráficas en comandos enviados vía WebSocket al navegador, que los renderiza en un Canvas HTML5.

```
Navegador (HTML5 Canvas)
    │ WebSocket (Protobuf)
Webswing Server (Jetty + Jersey + Guice)
    │ WebSocket (Protobuf)
JVM Swing Process (WebToolkit interceptado)
    │
Aplicación SIGMA (Java Swing — sin modificar)
```

**Compilar Webswing:**
```bash
mvn clean install              # Build completo
mvn clean install -Pdev        # Desarrollo (sin tests)
mvn clean install -Prelease    # Producción con javadoc
```

---

### WebControlSigma — Panel Administrativo del Ecosistema

Panel web central de administración del ecosistema Telcotronics. Gestiona empresas clientes, usuarios cloud (`usuarios_sesion` / `usuarios_xValidar`), API Keys de los 3 sistemas (webControl, sigma-robot, api-IA), licencias de hosts (SHA256 determinista), notificaciones, proyectos y catálogo de apps descargables. Incluye módulo BFF PHP hacia `SIGMAC-SRI-API` para facturación electrónica. Login con bcrypt + captcha. Desplegado en Apache 2.4 + PHP 8.5-FPM en Servidor-web (.109).

| Parámetro | Valor |
|-----------|-------|
| Repositorio Git | `https://git.telcotronics.net/pablinux/Web_siax-sytem.git` |
| Tecnología principal | PHP 8.5 + MariaDB (PDO) |
| Responsable | pablinux |
| Estado actual | ✅ Activo — dashboard métricas 2026-06-03 |
| Equipo / código local | `siax-amd` (`192.168.10.100`) — `/home/pablinux/Projects/php/Web_siax-sytem` |
| Servidor de producción | Servidor-web CT 150 (`192.168.10.109`) |
| Directorio deploy | `/var/www/web_xsystem/public_html` |
| Dominio público | `siax-system.net` |
| Puerto | 80 / 443 (Apache) |
| Última actualización | 2026-06-03 |

**BDs que usa:**

| BD | Host | Motor | Uso |
|----|------|-------|-----|
| `webControl` | `192.168.10.149` | MariaDB 10.11 | BD principal — `ClienteEmpresa`, `HostEmpresa`, `usuarios_sesion`, `usuarios_xValidar`, `panel_control_users`, `api_key`, `notificaciones` |
| `siax_core` | `192.168.10.149` | MariaDB 10.11 | Lectura/escritura API keys de sigma-robot (`api_keys`) |
| `api_ia_python` | `192.168.10.149` | MariaDB 10.11 | Lectura/escritura API keys de api_service_ia (`api_key`) |

**Servicios que consume:**

| Servicio | URL | Autenticación | Propósito |
|---------|-----|---------------|-----------|
| SIGMAC-SRI-API | `https://api.sigmac.app/sri` | OAuth2 Password Grant | Panel BFF facturación SRI — `app/facturacion/` |
| SMTP ecosistema | `smtp.sigmac.app:587` | `no-reply@sigmac.app` | Envío de correos vía PHPMailer |

**Módulos disponibles:**

| Módulo | Ruta | Estado |
|--------|------|--------|
| Login + captcha | `index.php` + `login.php` | ✅ Operativo (bcrypt + PHP 8.5) — rediseño pendiente |
| Panel principal + Dashboard métricas | `PanelMenu.php` | ✅ Operativo — inicio con 7 stat cards + 2 tablas de detalle |
| Hub Clientes (4 tabs: empresas / equipos / sesiones cloud / xValidar) | `app/clientes/sesiones.php` | ✅ Operativo 2026-06-03 |
| API Keys (webControl + sigma-robot + api-IA) | `app/clientes/apikeys.php` | ✅ Operativo — ver/copiar key_value, badge vencida, extender expiración |
| Equipos / Licencias hosts SHA256 | `sesiones.php?tab=equipos` | ✅ Operativo — `licencias.php` redirige aquí |
| Notificaciones por cliente | `app/clientes/notificaciones.php` | ✅ Operativo |
| Panel Facturación SRI (BFF) | `app/facturacion/` | ✅ Operativo |
| Usuarios del panel | `app/usuarios/` | ✅ Operativo |
| Hub Software (7 tabs + Cloud + Reportes CRUD) | `app/software/` | ✅ Operativo — reemplaza `app/sigma/` |
| Webhook sync apps | `POST /api/sync_app.php` | ✅ Operativo — `x-api-key`, INSERT/UPDATE `aplicaciones` |
| Endpoint reportes SIGMAC Java | `GET /api/reportes.php` | ✅ Operativo — catálogo JSON + descarga por `?id=N` |
| Webhooks / chatbot | `webhooks/domus/` | ⚠️ Legacy |

**Algoritmo de licencias:** `hash('sha256', strtoupper($hostname).'|'.strtoupper($empresa).'|'.SIGMA_LIC_SALT)` — resultado (64 hex) en `HostEmpresa.HostEmp_idLic`. Determinista: mismo host+empresa = mismo código siempre.

**BDs de software (en `webControl` — `.149`):**

| Tabla | Uso | Campo clave |
|-------|-----|-------------|
| `aplicaciones` | Catálogo general de apps descargables (Linux/Windows/Mac/BD/Herramientas) | `app_ENLACE` — URL de descarga |
| `aplicaciones_reportes` | Plantillas de reportes por categoría (ventas, inventario, caja, CxC, CxP, compras, contabilidad) | `url_plantilla` — consumida por `GET /api/reportes.php?id=N` |
| `aplicaciones_img` | Iconos y miniaturas para `aplicaciones` y `aplicaciones_reportes` | `ref_tabla` + `ref_id` — FK polimórfica |

**Endpoint de reportes para SIGMAC Java:**
```
GET https://siax-system.net/api/reportes.php          → catálogo JSON completo
GET https://siax-system.net/api/reportes.php?id=N     → descarga directa o redirect
GET https://siax-system.net/api/reportes.php?categoria=ventas → filtrado JSON
→ Sin autenticación — acceso público por URL
```

**Integración con el ecosistema:**
- Provee `webControl.api_key` — consumida por `API-SIGMA-CLOUD` y `API-SIGMA-WEBCONTROL` para validar `x-api-key`
- Gestiona `usuarios_sesion` y su vínculo con `ClienteEmpresa` (FK bidireccional `usrSesion_idEmp` ↔ `clientEmp_idUsuario`)
- Las apps Flutter/PHP/Java registran usuarios vía `API-SIGMA-WEBCONTROL` → `usuarios_xValidar` → OTP → `usuarios_sesion` — visibles y gestionables desde este panel
- **SIGMAC Java** consumirá `GET /api/reportes/{id}` para descargar plantillas de reportes directamente desde el panel

**Más información:** `siax-amd:/home/pablinux/Projects/php/Web_siax-sytem/agents.md`

---

### SitioWeb_telcotronics — Sitio web institucional y tienda en línea

Sitio web público de Telcotronics. SPA estática servida por Apache en Servidor-web (.109). Presenta los servicios, portafolio e historia de la empresa, genera leads vía formulario de contacto PHP+PHPMailer y expone una tienda en línea con **914 productos reales** del catálogo del ERP. Consume SMTP del ecosistema y API-SIGMA-CLOUD para el catálogo.

| Parámetro | Valor |
|-----------|-------|
| Repositorio Git | [pendiente — crear repo en git.telcotronics.net] |
| Tecnología principal | HTML5 / CSS3 / JS ES6+ vanilla · Tailwind CSS (CDN) · PHP 8.5 + PHPMailer |
| Responsable | pablinux |
| Estado actual | ✅ v2.3.1 |
| Código local | `pablinux-laptop` (`192.168.10.72`) — `/home/pablinux/Projects/php/SitioWeb_telcotronics` |
| Servidor de producción | Servidor-web CT 150 (`192.168.10.109`) — Apache 2.4.66 + PHP 8.5-FPM |
| Directorio deploy | `/var/www/web_telcotronics/public_html/` |
| Dominio público | `telcotronics.com` |
| Puerto | 80 / 443 (Apache) |
| Última actualización | 2026-06-03 |

**BDs que usa:** Ninguna propia — consume `TELCOTRONICS` en MySQL `.116` a través de API-SIGMA-CLOUD (nunca conexión directa).

**Servicios que consume:**

| Servicio | URL / Host | Autenticación | Propósito |
|---------|-----------|---------------|-----------|
| SMTP ecosistema | `smtp.sigmac.app:587` (interno: `192.168.10.111:587`) | `no-reply@sigmac.app` / `Sigma.2030@` | Formulario de contacto — lead al equipo + confirmación al remitente |
| API-SIGMA-CLOUD | `https://api-gateway-cloud.telcotronics.net` | `x-api-key: <sigma_api_key>` | Catálogo tienda — grupo de precios `VENTAS_WEB`, BD `TELCOTRONICS` |

**Configuración de API-SIGMA-CLOUD en el servidor** (`api/config.php`, nunca en git):

```php
'sigma_api_key' => '706847ea7fbe9caf9c5d4d26b41391a3cfe5eec8bd4404cc4e7f857d2e950acf',
'sigma_db'      => 'TELCOTRONICS',
```

- `sigma_api_key` — se valida contra `webControl.api_key` en MariaDB `.149`. Gestionar desde **WebControlSigma** (`siax-system.net` → panel "API Keys").
- `sigma_db` — base de datos del catálogo en MySQL `.116`. No cambiar salvo migración de BD.

**Cómo verificar que la key funciona:**
```bash
curl -s "https://api-gateway-cloud.telcotronics.net/api/items/listar_grupo_precio?db=TELCOTRONICS" \
  -H "x-api-key: 706847ea7fbe9caf9c5d4d26b41391a3cfe5eec8bd4404cc4e7f857d2e950acf"
# Respuesta esperada: [...,{"nombre":"VENTAS_WEB",...}]
```

**Cómo renovar la key:** WebControlSigma → "API Keys" → nueva key → editar `api/config.php` en servidor → `rm /tmp/telco_catalogo_*.json`.

**Forzar recarga del catálogo** (sin cambiar la key, refleja productos nuevos del ERP):
```bash
ssh pablinux@192.168.10.109 "rm /tmp/telco_catalogo_*.json"
```

**Agregar productos a la tienda:** desde SIGMAC → Inventario → Producto → Precios → añadir grupo `VENTAS_WEB`.

**Módulos disponibles:**

| Módulo | Archivo | Estado |
|--------|---------|--------|
| Sitio institucional (SPA) | `index.html` | ✅ v2.1.0 — completo |
| Tienda en línea | `tienda.html` | ✅ v2.0 — 914 productos reales, categorías dinámicas, búsqueda, filtros |
| Catálogo proxy | `api/productos.php` | ✅ → API-SIGMA-CLOUD `VENTAS_WEB`, caché 1h en `/tmp` |
| Formulario de contacto | `api/contacto.php` | ✅ PHP + PHPMailer + honeypot — pendiente activar SMTP en servidor |

**Integración con el ecosistema:**
- Consume **API-SIGMA-CLOUD** para catálogo de productos (grupo `VENTAS_WEB`, BD `TELCOTRONICS`)
- Consume **SMTP ecosistema** (`smtp.sigmac.app`) para formulario de contacto
- Chatbot **Dialogflow** embebido (agent ID `eea5ca65-ded3-4c89-bd8a-9e6378cb4686`) — independiente del hosting

**Más información:** `pablinux-laptop:/home/pablinux/Projects/php/SitioWeb_telcotronics/agents.md`

---

### app_ideas — Canvas de Ideas y Pensamiento Visual

| Parámetro | Valor |
|-----------|-------|
| Repositorio Git | `https://git.telcotronics.net/pablinux/APPA-GENERQADOR-DE-IDEAS.git` |
| Tecnología principal | Node.js (Express) + MongoDB + EJS |
| Responsable | pablinux |
| Estado actual | 🟡 En desarrollo activo |
| Puerto | `2000` |
| Servicio systemd | `siax-app-APP_IDEAS` (gestionado por SIAX Monitor) |
| BD principal | MongoDB — `192.168.10.146:27017/app_ideas` (CT 102, nodo cluster) |
| Servidor deploy | `server-webapps` CT 132 (`192.168.10.160`) |
| Dominio público | `ideas.telcotronics.com` |

Canvas de ideas y pensamiento visual del ecosistema. Permite generar, organizar y visualizar ideas con soporte de inteligencia artificial. Cuenta con paneles especializados: dibujo libre, flujo visual, gestión de ideas, generación asistida por IA y recopilación de procesos.

**APIs que consume:**

| Servicio | URL / Variable | Uso |
|---------|---------------|-----|
| MongoDB | `MONGO_URI=mongodb://192.168.10.146:27017/app_ideas` | BD principal — ideas, flujos, sesiones |
| AIT (IA Telcotronics) | `AIT_URL=https://api.telcotronics.net/` | Generación y análisis de ideas con IA |
| Hub API (Tareas) | `HUB_API_URL=https://tareas.telcotronics.com/api/external` | Integración con sistema de tareas |
| Resend | `ReSend_APIKEY` | Envío de emails |

---

### app_marketing — Centro de Publicidad y Marketing del Ecosistema

| Parámetro | Valor |
|-----------|-------|
| Repositorio Git | [pendiente — crear repo en git.telcotronics.net] |
| Tecnología principal | Node.js (Express) + MongoDB + EJS |
| Responsable | pablinux |
| Estado actual | 🟡 En desarrollo activo |
| Puerto | `2100` |
| Servicio systemd | `siax-app-APP_MARKETING` (gestionado por SIAX Monitor) |
| BD principal | MongoDB — `192.168.10.146:27017/app_marketing` (CT 102, nodo cluster) |
| Servidor deploy | `server-webapps` CT 132 (`192.168.10.160`) |
| Dominio público | `marketing.telcotronics.com` (confirmar en Nginx PM) |

Centro de publicidad y marketing del ecosistema Telcotronics. Gestiona campañas promocionales de las apps internas, las sirve a todos los proyectos del ecosistema mediante una API REST pública y un widget JS embebible. Registra impresiones y clics por campaña y por app origen para métricas de rendimiento.

**API pública (CORS abierto — consumida por widget.js desde cualquier app del ecosistema):**

| Endpoint | Método | Uso |
|---------|--------|-----|
| `/api/banner?origen=X` | GET | Devuelve el banner activo para la app X. Registra impresión automáticamente. |
| `/api/clic` | POST | Registra un clic `{ campanaId, origen }`. Devuelve `urlDestino`. |

**Cómo integrar el widget en cualquier proyecto del ecosistema:**
```html
<div id="sigma-banner" data-origen="nombre_app"></div>
<script src="https://marketing.telcotronics.com/js/widget.js"></script>
```

**Apps integradas:**

| App | Estado |
|-----|--------|
| `app_ideas` | 🔴 Pendiente |
| `sigmac-web` | 🔴 Pendiente |
| `sigma-robot` | 🔴 Pendiente |
| `sigmac_app` | 🔴 Pendiente |

---

### app_fidelizacion — Aplicación de Fidelización de Clientes

| Parámetro | Valor |
|-----------|-------|
| Repositorio Git | [pendiente — crear repo en git.telcotronics.net] |
| Tecnología principal | Node.js (Express) + MySQL + EJS + Tailwind CSS |
| Responsable | pablinux |
| Estado actual | 🟡 En desarrollo activo |
| Puerto | `2001` |
| Servicio systemd | `siax-app-APP_FIDELIZACION.service` |
| BD principal | MySQL — `192.168.10.149:3306/nexo_fd` |
| Servidor deploy | `server-webapps` CT 132 (`192.168.10.160`) |

Plataforma de lealtad desarrollada para gestionar clientes y acumulación de puntos (transacciones) vía escaneo QR por parte de comercios (Partners). Incluye un módulo público, panel de cliente (tienda de canje, perfil), panel de partner y un panel administrativo. Integra una API REST para interacción externa (Partners).

**APIs que consume/provee:**

| Servicio | URL / Endpoint | Uso |
|---------|---------------|-----|
| MySQL | `DB_HOST=192.168.10.149` | Base de datos principal de usuarios, catálogo e historial de transacciones |
| API Partners | `/api/v1/partner/*` | Endpoints protegidos vía `x-api-key` para registro de clientes, transacciones y catálogo |

---

### sistema-gimnasio — Sistema de Administración para Gimnasio (SOCIOS)

Panel web de administración de gimnasios en el ecosistema SIGMA (destinado a los dueños y staff del gimnasio). Permite gestionar la base de miembros, tipos de membresías, pagos, visitas, cajas, y facturación de ventas/productos. Es una aplicación SPA cliente escrita en Vue.js 2 con Vuetify 2 que consume la API centralizada multi-tenant `API-SIGMA-CLOUD`.

| Parámetro | Valor |
|-----------|-------|
| Repositorio Git | `https://github.com/telcotronics/sistema-gimnasio.git` |
| Tecnología principal | Vue.js 2.5 + Vuetify 2.7 (Options API) |
| Responsable | pablinux |
| Estado actual | 🚧 En desarrollo activo / Migración a API-SIGMA-CLOUD en curso |
| Equipo / código local | `siax-amd` (`192.168.10.100`) — `/home/pablinux/Projects/Node/sistema-gimnasio` |
| Servidor de producción | `server-sigma` (`192.168.10.150`) / `Servidor-web` CT 150 (`192.168.10.109`) |
| Directorio deploy | `/var/www/web_gimnasio/public_html/` |
| Dominio público | `[pendiente]` |
| Puerto | — |
| Última actualización | 2026-05-31 |

**BDs que usa:**

- No interactúa con BD directamente. Utiliza la `API-SIGMA-CLOUD` enviando el parámetro query `?db=[tenant]` para acceder de manera aislada a la base de datos de cada gimnasio (ej: `TELCOTRONICS` en desarrollo).

**Servicios que consume:**

| Servicio | URL / Endpoint | Autenticación | Propósito |
|---------|---------------|---------------|-----------|
| API-SIGMA-CLOUD | `https://api-gateway-cloud.telcotronics.net/` | `x-api-key` + Bearer JWT | API Gateway del ecosistema |
| WebSocket ChatBot | `ws://[host]/chat` | Ninguna | Servicio de chatbot |

**Módulos disponibles:**

| Módulo | Ruta | Estado |
|--------|------|--------|
| Autenticación / Sesión | `/login` | ✅ Operativo (Login migrado a API-SIGMA-CLOUD) |
| Dashboard | `/` | 🚧 Lógica incompleta (datos hardcodeados) |
| Miembros | `/crud_miembros_card` | ✅ Operativo (Migrado a ApiService y API-SIGMA-CLOUD) |
| Membresías / Planes | `/crud_membresia_card` | ⚠️ Funcional (migrado a ApiService, apunta a app.factura-e.net legacy) |
| Usuarios | `/usuarios` | ❌ Roto (usa HttpService → PHP muerto) |
| Clientes | `/clientes` | ⚠️ Funcional (apunta a app.factura-e.net legacy) |
| Visitas | `/visitas` | ⚠️ Funcional con issues (listado usa HttpService → falla) |
| Pagos | `/pagos` | ⚠️ Funcional con issues (listado usa HttpService → falla) |
| Cajas | `/caja_apertura` | ⚠️ Funcional con issues (cuadre de caja incompleto) |
| Ventas | `/venta` | 🚧 Lógica incompleta (`handleSave` no guarda en API) |
| Inventario | `/inventario` | 🚧 UI lista, sin lista de productos ni backend |
| Estados de Miembros | `/estado_miembros` | ⚠️ Funcional (apunta a app.factura-e.net legacy) |
| CXC (Cuentas por Cobrar) | `/cxc` | ❌ Componente placeholder "en construcción" |
| Abonos | `/abonos` | ❌ Componente placeholder "en construcción" |
| Configuración | `/configurar` | ⚠️ Configuración general usa HttpService (falla); áreas funcionales |
| Chat | `/chat` | ⚠️ WebSocket funcional; envío de mensajes con URL PHP hardcodeada |

**Integración con el ecosistema:**
- Consume la API Gateway `API-SIGMA-CLOUD`.
- Se autentica usando la API Key de tenant asignada desde `API-SIGMA-WEBCONTROL`.

**Más información:** `siax-amd:/home/pablinux/Projects/Node/sistema-gimnasio/agents.md`

---

---

## Apps móviles/desktop

### sigmac_app — App CRM companion multiplataforma

| Parámetro | Valor |
|-----------|-------|
| Repositorio Git | `https://git.telcotronics.net/pablinux/sigmac_app.git` |
| Tecnología principal | Flutter 2.11.0 / Dart 2.17.0-beta |
| Responsable | pablinux |
| Estado actual | 🟡 En desarrollo activo (sesión 18) |
| Plataformas | Android (`com.telcotronics.sigmac_app`) · Linux desktop |
| Package Android | `com.telcotronics.sigmac_app` |
| Rol en el ecosistema | Cliente nativo offline-first para vendedores y administradores. Gestiona ventas, compras, inventario, clientes, pedidos y proformas. Opera con SQLite local y sincroniza con SIGMA GATEWAY CLOUD cuando hay conexión. |

**APIs que consume:**

| API | URL | Uso |
|-----|-----|-----|
| SIGMA WEBCONTROL | `https://api.siax-system.net` | Auth (login/registro/OTP), notificaciones, alertas, mensajes |
| SIGMA GATEWAY CLOUD | `https://api-gateway-cloud.telcotronics.net` | Sync items y clientes (download), upload pedidos/proformas |

**Auth headers:**
- `x-api-key: {auth_api_key}` — clave personal por usuario
- `?db={auth_empresa}` — nombre de la BD tenant (ej: `EMPRESA_EL_SOL`)

**⚠️ Notas críticas:**
- **Flutter 2.11 / Dart 2.17-beta**: APIs de Flutter 3.x no existen. Consultar `.agente/proyecto_errores.md` antes de usar cualquier API nueva.
- **SQLite WAL en Android**: usar `rawQuery()` para PRAGMAs — `execute()` crashea.
- **Dos APIs distintas**: WEBCONTROL (auth/licencias) ≠ GATEWAY CLOUD (datos negocio). No mezclar.
- **DB local schema v8**: migraciones por versión en `database_helper.dart`.

---

### SIGMAC — ERP Desktop Java/Swing

| Parámetro | Valor |
|-----------|-------|
| Repositorio Git | Repositorio local — pendiente subir a git.telcotronics.net |
| Tecnología principal | Java 11 (NetBeans + Swing) + MySQL — pool HikariCP |
| Responsable | pablinux |
| Estado actual | ✅ Producción |
| Equipo / ubicación local | `siax-amd` (`192.168.10.100`) — `/home/pablinux/Projects/java/SIGMAC` |
| Servidor de producción | Servidor-SIGMA-VW CT 141 (`192.168.10.110`) — Webswing 20.2.5 |
| Acceso web | `https://app.factura-e.net` (Apache `.109` → Webswing `.110`) |
| Última actualización | 2026-05-31 |

ERP de escritorio para facturación electrónica en Ecuador. La aplicación Java Swing corre en el servidor Webswing (CT 141) y se publica en el navegador vía HTML5 Canvas sin modificar el código fuente. Gestiona el ciclo completo de ventas, compras, inventario, contabilidad, CXC y CXP. Se integra con el SRI a través de `SIGMA-OPEN-API` (legacy) y `SIGMAC-SRI-API` (nueva).

**BDs que usa:**

| BD | Host | Motor | Uso |
|----|------|-------|-----|
| `facturacion` | `192.168.10.116` (prod) / `192.168.10.149` (test) | MySQL 8.0 | BD principal — facturas, clientes, inventario, contabilidad, CXC, CXP |

**Servicios que consume:**

| Servicio | URL | Uso |
|---------|-----|-----|
| SIGMA-OPEN-API (legacy) | `http://192.168.10.120:8080/veronica` | Firma y autorización SRI — sistemas existentes |
| SIGMAC-SRI-API (nueva) | `https://api.sigmac.app/sri` | Nueva API SRI — migración progresiva |
| SRI Ecuador | `https://cel.sri.gob.ec/...` | Recepción y autorización de comprobantes electrónicos |
| IA local | `http://192.168.10.101:1706` | LLM para módulo SIAX Chat (Nemotron / Gemma) |
| Monitor TCP | `localhost:1803` | Sincronización con servidor de monitoreo interno |

**Módulos disponibles:**

| Módulo | Estado |
|--------|--------|
| Facturación / Ventas | ✅ Producción |
| Inventario / Productos | ✅ Producción |
| Compras / Docs Electrónicos | ✅ Producción |
| Monitor de Servicios SRI (auto) | ✅ Producción |
| CXC — Cuentas por Cobrar | ⚠️ Fix activo en rama |
| CXP — Cuentas por Pagar | ✅ Producción |
| Contabilidad / Bancos | ✅ Producción |
| Notas de Crédito Ventas | ✅ Implementado (pendiente prueba prod) |
| Notas de Crédito Compras | ✅ Implementado (pendiente menú) |
| IA — SIAX Chat | 🔧 En desarrollo |

**Integración con el ecosistema:**
- **FACTURA-E (PHP web):** comparte la BD `facturacion` en `.116` — acceso directo para informes y portal web de clientes. Auth compartida vía `webControl.usuarios_sesion` en `.149`.
- **Webswing CT 141 (.110):** publica la UI Java Swing en el navegador sin modificar código fuente.
- **SIGMA-OPEN-API / SIGMAC-SRI-API:** única vía de comunicación con el SRI para firma y autorización de comprobantes.

**Más información:** `siax-amd:/home/pablinux/Projects/java/SIGMAC/agents.md`

---

---

## Servicios transversales

### sigma-robot — Hub central de comunicaciones e IA

| Parámetro | Valor |
|-----------|-------|
| Repositorio Git | `https://git.telcotronics.net/pablinux/sigma-robot.git` |
| Tecnología principal | Node.js + Express + MySQL + Socket.IO |
| Responsable | pablinux |
| Estado actual | ✅ Activo — `server-webapps` CT 132 (`192.168.10.160`) |
| Puerto | `5000` |
| Servicio systemd | `siax-app-sigma-robot.service` |
| URL pública | `https://sigma-bot.telcotronics.com` |
| MCP expuesto | `sigma-robot.telcotronics.com` — herramientas: `ia_chat`, `whatsapp_enviar`, `crm_consultar`, `woo_consultar`, `db_query`, `buscar_respuesta`, `listar_agentes` |
| Equipo / ubicación local | siax-amd (192.168.10.100) — `/home/pablinux/Projects/Node/sigma-robot` |
| Última actualización | 2026-05-31 |
| Rol en el ecosistema | **Cerebro de comunicaciones y orquestación de agentes IA.** Cualquier app o robot del ecosistema que necesite enviar mensajes, consultar IA, o ejecutar agentes automatizados se conecta aquí. |

**¿Qué hace?**

sigma-robot unifica en un solo hub: mensajería WhatsApp (Meta Cloud API y Web Bot), procesamiento de IA con fallback automático, y ejecución de agentes configurables desde el panel. Es el punto de integración que el resto del ecosistema usa para comunicarse con clientes y automatizar tareas inteligentes.

**Bases de datos:**

| BD | Motor | IP | Variable env | Uso |
|----|-------|----|-------------|-----|
| `siax_core` | MariaDB (CT 114) | 192.168.10.149 | `SIGMA_DB_*` | BD principal — IA, usuarios, agentes, flujos, prompts, API keys |
| `TELCOTRONICS` | MySQL (CT 145) | 192.168.10.116 | `DB_TELCO_*` / `DB_*` | BD externa — comprobantes bancarios (OCR), galerías |

**Servicios que consume:**

| Servicio | IP / URL | Uso |
|---------|---------|-----|
| SIAX IA local | `192.168.10.101:1706` | Proveedor IA primario (Gemma 4 26B) |
| Whisper STT | `192.168.10.145:8000` | Transcripción de audio a texto |
| OCR / TTS / STT | `https://api.telcotronics.net` | Extracción de texto de imágenes y comprobantes |
| n8n | `192.168.10.171:5678` | Workflows de automatización (webhook entrante) |

**Cómo usarlo desde otras apps del ecosistema:**

```
# 1. Enviar mensaje WhatsApp desde CRM/ERP
POST https://sigma-bot.telcotronics.com/api/meta/enviar_mensaje
x-api-key: {api_key}
{ "to": "593XXXXXXXXX", "message": "Hola, tu pedido está listo." }

# 2. Consultar IA (compatible OpenAI)
POST https://sigma-bot.telcotronics.com/gateway/v1/chat
x-api-key: {api_key}
{ "messages": [{ "role": "user", "content": "Analiza este texto: ..." }] }

# 3. Vía MCP (para agentes IA del ecosistema)
Tool: whatsapp_enviar  → envía mensaje WhatsApp
Tool: ia_chat          → consulta IA con fallback automático
Tool: db_query         → consulta BD externa configurada
Tool: crm_consultar    → consulta REST a CRM externo
```

**Prioridad de proveedores IA (fallback automático):**

| Prioridad | Proveedor | Tipo | Variable env |
|-----------|-----------|------|-------------|
| 1 | SIAX | siax | `$SIAX_API` / `$SIAX_URL` |
| 2 | DeepSeek | openai | `$DEEPSEEK_API_KEY` |
| 3 | Gemini | gemini | `$GEMINI_API_KEY` |
| 4 | Claude | anthropic | `$ANTHROPIC_API_KEY` |

**Casos de uso del sistema de agentes (objetivos a cumplir):**

| # | Caso | Estado |
|---|------|--------|
| C1 | CRM/ERP envía documentos/notificaciones por WhatsApp via API | ✅ Activo |
| C2 | App externa envía prompt + datos → IA procesa → retorna resultado | ✅ Activo |
| C3 | Cliente pide algo por WhatsApp → agente consulta BD → responde | 🔧 Motor de flujos pendiente |
| C4 | Chat de soporte recolecta datos del cliente → clasifica → resuelve o escala | 🔧 En desarrollo |

**Módulos disponibles:**

| Módulo | Estado |
|--------|--------|
| WhatsApp Bot WS (whatsapp-web.js) | ✅ Activo |
| WhatsApp Cloud API (Meta Webhooks) | ✅ Activo |
| AI Gateway (`/gateway/v1/chat`) | ✅ Activo |
| Messaging Gateway (`/api/meta/`, `/api/wsbot/`) | ✅ Activo |
| Motor de IA con fallback automático | ✅ Activo — 4 proveedores |
| Panel Admin (AdminLTE 3) | ✅ Activo |
| Portal Agentes (`/agentes`) | ✅ Activo |
| Portal Arrendatarios (`/empresas`) | ✅ Activo |
| MCP Server | ✅ Activo |
| Clasificador de intenciones | ✅ Activo — listo para configurar |
| Agentes / Flujos IA (`ia_agentes`, `ia_flujos`) | 🟡 Estructura lista — motor de ejecución pendiente |
| Chat de soporte integrado (C4) | 🔧 Interfaz activa — flujo guiado pendiente |

**Integración con el ecosistema:**
- **n8n (.171):** envía webhooks entrantes en `/webhook/n8n` para automatizaciones del ecosistema
- **CRM / ERP / sistemas externos:** consumen la Messaging Gateway para enviar mensajes WhatsApp vía API Key
- **Apps externas (Confyui, Dialogflow):** envían prompts a la AI Gateway para procesamiento IA con fallback
- **mail-monitor:** puede consumir la AI Gateway (`/gateway/v1/chat`) para análisis de logs con IA

**Más información:** `siax-amd:/home/pablinux/Projects/Node/sigma-robot/agents.md`

---

### mail-monitor — Administración y monitoreo del servidor de correo

| Parámetro | Valor |
|-----------|-------|
| Repositorio Git | `https://git.telcotronics.net/pablinux/Monitor-ServerMail.git` |
| Tecnología principal | Rust (Axum 0.7 + sqlx 0.7 + Tera + HTMX) |
| Responsable | pablinux |
| Estado actual | ✅ Producción (desplegado en `servidor-email` CT 144, `192.168.10.111`) |
| Rol en el ecosistema | Administración y monitoreo del servidor de correo SIGMA. Gestiona usuarios virtuales de Postfix/Dovecot, visualiza logs por SSH, controla fail2ban y notifica eventos de seguridad y administrativos a `API-SIGMA-WEBCONTROL` |

**Acceso:** `http://192.168.10.111:3000`

**Eventos que notifica a `API-SIGMA-WEBCONTROL`:**

| Evento | Tipo | Severidad |
|--------|------|-----------|
| IP baneada en fail2ban | `seguridad` | `alta` |
| IP desbaneada | `seguridad` | `baja` |
| Cuenta de correo creada | `admin` | `info` |
| Cuenta de correo desactivada | `admin` | `media` |
| Cuenta de correo reactivada | `admin` | `info` |
| Contraseña de cuenta cambiada | `admin` | `info` |

**Cumplimiento RGPD/LOPD:** Tab "Desactivados" en la UI — muestra `fecha_modificacion` (cuándo se desactivó), permite reactivar cuentas o eliminarlas definitivamente (borrado físico de la BD) para cumplir solicitudes de supresión de datos.

**Integración con el ecosistema:**
- **BD correo:** MariaDB en `192.168.10.149` (`mailserver_db`) — tablas `virtual_users`, `virtual_domains`, `app_config`
- **SSH al servidor:** `192.168.10.111` — para logs de Postfix/Dovecot, control de fail2ban y creación de maildirs
- **API-SIGMA-WEBCONTROL:** notificaciones vía `x-api-key` (token de `webControl.api_key`)
- **SIGMA Bot gateway:** análisis de logs con IA (`https://sigma-bot.telcotronics.com/gateway/v1/chat`)

---

### CT cloud — servidor-email (192.168.10.111)

> **Servidor de correo del ecosistema SIGMA.** Cualquier app o sistema que necesite enviar correos usa este servidor. La cuenta de sistema, credenciales y puertos están documentados aquí — no buscar en otro lugar.

| Parámetro | Valor |
|-----------|-------|
| IP | 192.168.10.111 |
| MAC | BC:24:11:EC:44:0D |
| CT Proxmox | 144 (nodo cloud) |
| SMTP | Postfix — relay vía Resend.com |
| IMAP | Dovecot |
| Webmail | SnappyMail 2.38.2 |
| Dominios activos | `sigmac.app`, `factura-e.net` |
| BD usuarios correo | MariaDB en 192.168.10.149 (`mailserver_db`) |
| Administración | mail-monitor en `http://192.168.10.111:3000` — documentación técnica en `/docs` |

#### Configuración de correo para sistemas del ecosistema

> Usar estos datos en cualquier app, servicio o herramienta del ecosistema que necesite enviar correos (CRM SIGMA, sigmac_app, n8n, notificaciones, mailing, etc.).

**Envío (SMTP):**

| Campo | Valor |
|-------|-------|
| Host | `smtp.sigmac.app` |
| Puerto | `587` |
| Usuario | `no-reply@sigmac.app` |
| Contraseña | `Sigma.2030@` |
| Seguridad | `STARTTLS` |

**Lectura (IMAP):**

| Campo | Valor |
|-------|-------|
| Host | `imap.sigmac.app` |
| Puerto | `993` |
| Usuario | `no-reply@sigmac.app` |
| Contraseña | `Sigma.2030@` |
| Seguridad | `SSL/TLS` |

**Desde LAN interna (192.168.10.x):** reemplazar el hostname por `192.168.10.111` — sin dependencia de DNS externo.

**Relay saliente:** Resend.com, gestionado por Postfix. La app solo habla con el SMTP local.

#### Notas técnicas del servidor de correo

**⚠️ mysql-users.cf:** La query DEBE retornar `domain/user/` (ruta relativa Maildir). Si retorna el email completo, Postfix crea archivos en lugar de directorios.

**⚠️ Certificados SSL:** Se copian manualmente desde Servidor-web (.109). No hay certbot en el .111.

---

### SIAX Monitor — Agente de monitoreo de aplicaciones

SIAX Monitor se instala en los servidores donde corren aplicaciones Node.js o Python. Registra cada app como un servicio systemd (`siax-app-NOMBRE.service`), controla su ciclo de vida (start/stop/restart) and monitorea su estado cada 60 segundos reportando al dashboard central. Detecta discrepancias entre el proceso real y el estado de systemd (crashed, zombie). Expone una interface web local y API REST para gestión sin necesidad de acceso SSH directo.

**Control vía systemd:** cada app registrada genera un archivo `.service` en `/etc/systemd/system/`. El agente usa `systemctl` con permisos sudoers para arrancar, detener y consultar el estado real de cada servicio. Soporta auto-detección de rutas NVM para Node.js y `EnvironmentFile` desde `.env`.

**Despliegue:**
```bash
# Desde máquina de desarrollo — compila y sube a los servidores configurados
./desplegar_agent.sh

# En el servidor destino — instala el agente como servicio systemd
sudo ./instalador.sh

# Desde cualquier servidor nuevo — descarga e instala sin necesidad de Rust
curl -sSL http://192.168.10.101:8080/install.sh | sudo bash
```

| Servidor | IP | Usuario de servicio |
|----------|----|-------------------|
| server-webapps (CT 132) | 192.168.10.160 | user_apps |
| siax-intel | 192.168.10.101 | pablinux |
| siax-amd | 192.168.10.100 | pablinux |

---

### SIAX — IA autónoma coordinadora

| Parámetro | Valor |
|-----------|-------|
| IP | 192.168.10.108 |
| Nombre | Servidor-IA |
| Rol | IA autónoma que coordina y ejecuta tareas mientras pablinux descansa o realiza labores administrativas |
| CT Proxmox | 108 (nodo cluster) |

SIAX es la inteligencia artificial del ecosistema. Aprende de forma autónoma y coordina el trabajo técnico de los demás sistemas. Es parte central de la arquitectura operativa.

---

### DAPSI — Domótica

| Parámetro | Valor |
|-----------|-------|
| IP | 192.168.10.155 |
| Nombre | DAPSI |
| MAC | DC:A6:32:11:03:EA |
| Rol | Sistema de domótica con autoaprendizaje |
| Descripción | Primera IA de autoaprendizaje del ecosistema. IP reservada históricamente. Controla dispositivos del entorno físico. |

---

---

## Servicios externos

| Servicio | URL |
|----------|-----|
| SRI Recepción | `https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl` |
| SRI Autorización | `https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl` |

---

---

## api_service_ia — API de Servicios con IA

Microservicio REST que centraliza modelos de IA preentrenados para consumo interno del ecosistema. Es el **único proyecto Python serio de Telcotronics**: todos los demás son Node.js, Java, PHP, Rust o Flutter. Expone capacidades de procesamiento pesado (Whisper, InsightFace, Silero, rembg) como endpoints HTTP autenticados, evitando duplicar dependencias en cada proyecto que las necesite. Actualmente consumido por `sigma-robot` para STT y OCR.

| Parámetro | Valor |
|-----------|-------|
| Repositorio Git | `git@github.com:telcotronics/API_Service_IA.git` |
| Tecnología principal | Python 3.14 + FastAPI + uvicorn |
| Responsable | pablinux |
| Estado actual | ✅ Producción |
| Código local | `siax-amd:/home/pablinux/Projects/Python/api_service_ia/` |
| Servidor producción | `Ubuntu-Docker` — CT 105 (`192.168.10.145`) — usuario `root` |
| Ruta en servidor | `/root/app/API_Service_IA` |
| Dominio público | `api.telcotronics.net` (`whisper.telcotronics.net` — legacy, obsoleto) |
| Puerto | `8000` |
| Servicio de arranque | `tmux` — sesión `api_service_ia` (pendiente migrar a systemd) |
| Última actualización | 2026-06-03 |

**BD que usa:**

| Motor | Host | Base de datos | Tabla | Uso |
|-------|------|--------------|-------|-----|
| MariaDB | `192.168.10.149` (CT 114, nodo cluster) | `api_ia_python` | `api_key` | Validación y gestión de API keys propias |

> ⚠️ Anteriormente apuntaba a `webControl.api_key` en `.150` (legacy en retiro). Migrado a BD propia. Keys huérfanas en `webControl.api_key` pueden eliminarse desde WebControlSigma.

**Módulos disponibles — endpoints para integración:**

| Módulo | Endpoint principal | Retorna | Estado |
|--------|--------------------|---------|--------|
| STT — audio a texto | `POST /convertir_audio_aTexto/` | JSON `{idioma, transcripcion}` | ✅ |
| OCR — imagen a texto | `POST /convertir_img_aTexto/` | JSON `{texto}` | ✅ |
| Remover fondo | `POST /removerFondo_img/` | PNG con transparencia | ✅ |
| PDF a texto | `POST /convertir_pdf_aTexto/` | JSON `{texto}` | ✅ |
| PDF a Word | `POST /convertir_pdf_aWord/` | `.docx` descargable | ✅ |
| PDF a Excel | `POST /convertir_pdf_aExcel/` | `.xlsx` descargable | ✅ |
| PDF tablas a JSON | `POST /pdf_tablas/` | JSON estructurado | ✅ |
| Reconocimiento facial | `POST /facial/detectar/` | JSON `{bbox, confianza}` | ✅ |
| Comparación facial | `POST /facial/comparar/` | JSON `{es_misma_persona, similitud}` | ✅ |
| TTS online (gTTS) | `POST /texto_aVoz/` | MP3 descargable | ✅ requiere internet |
| TTS offline (Silero) | `POST /texto_aVoz/silero/` | WAV 24kHz descargable | ✅ offline tras 1ª descarga |

**Autenticación:** header `X-API-Key` — validado contra `api_ia_python.api_key` en MariaDB .149.

**Integración con el ecosistema:**
- **sigma-robot** la consume para STT (`/convertir_audio_aTexto/`) y OCR/imágenes (`https://api.telcotronics.net`)
- Cualquier proyecto del ecosistema puede consumirla con una API key válida

**Dónde buscar más info:** `siax-amd:/home/pablinux/Projects/Python/api_service_ia/agents.md`

---

## Historial y notas críticas

### Historial de migraciones (Mayo 2026)

- **Separación SIGMA en CTs dedicados:** BD (.116), API (.120), web proxy (.109). Sistema 100% operativo.
- **Migración correo:** Postfix + Dovecot + SnappyMail en .111. Relay vía Resend.com. SSL con certbot.
- **Buzones Maildir:** usuario `vmail`, query mysql-users.cf corregida, SASL entrante habilitado.
- **fail2ban:** instalado en .111 (postfix, dovecot, sshd) y .109 (apache, sshd).

---

### Notas críticas de operación

- **Java en SIGMA-OPEN-API / SIGMAC-SRI-API:** Obligatoriamente Java 8. Java 9+ rompe dependencias de firma digital (MITyCLib). Compilar con `JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64`.
- **PostgreSQL auth:** Mantener `md5`. Driver JDBC 9.4 no soporta `scram-sha-256`.
- **SIAX (192.168.10.108):** IA autónoma coordinadora. No apagar sin coordinación previa.
- **IPs históricas:** No siguen el número del CT. Asignadas antes de Proxmox.
- **LXC:** MAC prefijo `BC:24:11:*` = contenedor Proxmox.
- **Certificados correo:** Renovar en .109 con certbot y re-copiar al .111 manualmente.

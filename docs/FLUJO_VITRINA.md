# Vitrina Market — mapa de funcionamiento

Auditado el 2026-10-29 sobre `marketplace-app` (Next 16) + `marketplace-backend` (NestJS + Prisma/SQLite). Los datos de pruebas se crearon en una copia aislada de la base, no en la real.

## 1. Arquitectura

```mermaid
flowchart LR
  subgraph Web["marketplace-app (Next 16, :3001)"]
    Pages["Páginas: cliente, vendedor, admin"]
    NextAPI["API Next: /api/auth/*, /api/tiktok/*"]
  end
  subgraph API["marketplace-backend (NestJS, :4000, /api/v1)"]
    Ctl["Controladores: products, stores, orders, live-streams, dsp, upload, auth, tiktok-lives, admin, cash-register"]
    Worker["Worker TikTok LIVE (Puppeteer + sockets)"]
  end
  DB[("SQLite · Prisma")]
  Redis[("Redis o memoria")]
  TikTok(["TikTok web / LIVE"])
  DSP(["OpenDSP: repartidores (:3000)"])
  Pages -->|fetch lib/api.ts| Ctl
  Pages --> NextAPI
  NextAPI -->|cookie de sesión| Ctl
  Ctl --> DB
  Worker --> DB
  Worker --> Redis
  Worker --> TikTok
  Ctl -->|cotizar y despachar| DSP
  DSP -->|webhook estado| Ctl
```

## 2. Mapa de rutas y navegación

```mermaid
flowchart TD
  Header["Cabecera, menú Categorías, pestañas móviles, pie"]
  Home["/ inicio · ?q= búsqueda · ?category="]
  Ofertas["/ofertas"]
  Live["/live · ?category= · ?fuente="]
  LiveRoom["/live/[username]"]
  EnVivo["/en-vivo/[slug] tienda pública"]
  EnVivoIdx["/en-vivo"]
  Prod["/product/[slug]"]
  ProdIdx["/product"]
  Cart["/cart"]
  Chk["/checkout?store="]
  Ped["/pedido/[número]"]
  Cta["/cuenta"]
  Login["LoginSheet: Google, celular, TikTok"]

  Header --> Home & Ofertas & Live & Cart & Cta
  Home --> Prod
  Ofertas --> Prod
  Home -->|Ver quién está en vivo| Live
  Live --> LiveRoom
  LiveRoom -->|Comprar ahora| Chk
  LiveRoom --> Prod
  EnVivo --> Prod
  EnVivoIdx -.redirige.-> Live
  ProdIdx -.redirige.-> Home
  Prod -->|Agregar| Cart
  Prod -->|Comprar ahora| Chk
  Cart -->|Hacer pedido| Chk
  Chk -->|Confirmar pedido| Ped
  Ped --> Cta
  Cta -->|sin sesión| Login
  Cta --> Ped
  Cta -->|¿Tienes una tienda?| Vendor
  Header -->|Vender| Vendor

  Vendor["/vendor panel"]
  Vendor --> Onb["/vendor/onboarding (4 pasos)"]
  Vendor --> VProd["/vendor/productos"]
  Vendor --> VTik["/vendor/tiktok"]
  Vendor --> VVen["/vendor/ventas"]
  Vendor --> VCli["/vendor/clientes"]
  Vendor --> VEst["/vendor/estadisticas"]
  Vendor --> VMsg["/vendor/mensajes → WhatsApp"]
  Vendor --> VOfe["/vendor/ofertas"]
  Vendor --> VAju["/vendor/ajustes"]
  Vendor --> VAyu["/vendor/ayuda"]
  Vendor -->|Ver tienda| EnVivo
  VTik -->|Ver cómo lo ven| EnVivo
  Admin["/admin y /admin/tiktok"]
```

## 3. Recorrido del cliente

```mermaid
sequenceDiagram
  actor C as Cliente
  participant W as Web (Next)
  participant A as API v1
  participant D as OpenDSP
  C->>W: Abre / (productos y lives)
  W->>A: GET /products, /categories, /tiktok-lives/active
  C->>W: Agrega al carrito (CartContext, localStorage)
  C->>W: /checkout: dirección, día y hora, pago
  W->>A: POST /dsp/quote (envío)
  W->>A: POST /orders
  A->>D: Crear envío
  D-->>A: Webhook /orders/webhook/dsp (estado, repartidor)
  C->>W: /pedido/[número]
  W->>A: GET /orders/:idOrNumber
```

## 4. Recorrido del vendedor

```mermaid
flowchart LR
  L["Inicia sesión"] --> T{"¿Tiene tienda?"}
  T -- no --> O["Onboarding: datos, ubicación, horario, cobro"]
  O -->|POST /stores| P
  T -- sí --> P["Panel /vendor"]
  P --> Sub["Subir producto con foto (POST /upload, /products)"]
  Sub --> Cat["Catálogo: editar, publicar u ocultar, precio y stock"]
  Cat --> Pro["Promoción % hasta fecha (/stores/:id/offers/bulk)"]
  Cat --> Tk["/vendor/tiktok: usuario TikTok + productos del live"]
  Tk -->|PATCH store + POST /live-streams| Pub["Tienda pública /en-vivo/[slug]"]
  P --> Ped["Pedidos: filtrar, buscar, llamar, WhatsApp"]
  P --> Ajs["Ajustes: tienda, ubicación, horario, cobros"]
```

## 5. Datos (Prisma)

```mermaid
erDiagram
  User ||--o{ Store : posee
  Store ||--o{ ProductOffer : vende
  Product ||--o{ ProductOffer : tiene
  Category ||--o{ Product : agrupa
  Store ||--o{ LiveStream : emite
  Store ||--o{ OrderItem : recibe
  Order ||--o{ OrderItem : contiene
  ProductOffer ||--o{ OrderItem : origen
  Store ||--o| TikTokAccount : registra
  TikTokAccount ||--o{ TikTokLive : detecta
  Store ||--o{ Coupon : ofrece
  Store ||--o{ CashShift : abre
  CashShift ||--o{ CashMovement : registra
  AdminAccount }o--|| AppSetting : configura
```

## 6. Estado verificado

| Área | Estado | Cómo se comprobó |
| --- | --- | --- |
| Enlaces y botones (todos los `href`, `router.push`, `<button>`) | Sin enlaces rotos ni botones sin acción | Escaneo estático + clic en vivo |
| Cliente: inicio, búsqueda, categorías, producto, carrito, checkout, pedido, cuenta | Funciona | Compra real en base aislada |
| Ofertas | Funciona (aparece en `/ofertas`, producto y listado) | Promoción creada y terminada |
| Lives de TikTok (`/live`, `/live/[user]`) | Funciona con video, chat, pestañas, sonido | API real, 43 lives |
| Vendedor: onboarding, productos, ajustes, TikTok, pedidos, promociones | Funciona | Tienda registrada en base aislada |
| Copiar enlace de tienda | Con respaldo nuevo; no se pudo confirmar en el navegador embebido | — |
| OAuth Google/TikTok, WhatsApp, Redis, Docker | No comprobado | Faltan llaves y servicios |

## 7. Brechas encontradas

1. **Admin sin autenticación.** `/admin` abre sin login y `GET/PATCH/DELETE /api/v1/admin/*` no tienen guardia: cualquiera puede banear tiendas. (En el repo ya aparecen `AdminAccount` y `admin-auth.controller.ts`, trabajo en curso.)
2. **Cifras inventadas en admin.** `admin.service.ts` suma `+1420` usuarios, `+840` pedidos y `+154200` al volumen; `AdminControlCenter` muestra “1425 usuarios” y “Bs. 154.200”.
3. **Acceso por celular sin código.** `LoginSheet` → “Usar mi número de celular” → “Entrar” no verifica nada; se puede entrar con cualquier número. Hay `OtpCode` en el esquema, aún sin conectar.
4. **Google y TikTok en modo demo** hasta configurar llaves (el propio sheet lo indica).
5. **El vendedor no puede cambiar el estado de un pedido** (`PATCH /orders/:id/status` existe, sin botón) ni borrar un producto (`DELETE /products/:id` existe, sin botón). `cash-register` no tiene pantalla.
6. **`/vendor/tiktok` afirma “Estás en vivo en Vitrina”** al guardar, sin comprobar que el live exista en TikTok (contradice `TIKTOK_SELLER_FLOW.md`).
7. **Al terminar el live** el campo de usuario de TikTok queda vacío aunque se había guardado.
8. Avatares de clientes vienen de `api.dicebear.com` (servicio externo).

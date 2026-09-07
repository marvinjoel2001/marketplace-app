# 📋 Product Requirements Document (PRD) — CompraYa Marketplace & OpenDSP

## 📌 Document Information
- **Project Name:** CompraYa Marketplace (Chiringuito E-Commerce & OpenDSP Delivery)
- **Target Environment (Frontend):** `http://localhost:3001`
- **Target Environment (Backend API):** `http://localhost:4000/api/v1`
- **OpenDSP Core Dispatch:** `http://localhost:3000/v1`
- **Primary Market & Currency:** Bolivia (Santa Cruz de la Sierra) — Bolivianos (`Bs.`)
- **Document Version:** 2.0 (Ready for TestSprite Automated Execution)

---

## 🔑 Test Credentials & User Personas

| Persona | Role | Email / Identifier | Password | Phone (WhatsApp) | Default Delivery Address |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Comprador de Prueba** | `CUSTOMER` | `test.buyer@compraya.bo` | `Password123!` | `+591 77098765` | `Av. San Martín #500, Equipetrol, Santa Cruz` |
| **Tienda / Vendedor** | `VENDOR` | `tienda.techplus@compraya.bo` | `Password123!` | `+591 78901234` | `Calle 7 Este #120, Equipetrol Norte` |
| **Administrador** | `ADMIN` | `admin@compraya.bo` | `admin123` | `+591 70000001` | `Oficina Central CompraYa, Torre Duo` |
| **Motorizado OpenDSP** | `DRIVER` | `carlos.mendoza@opendsp.bo` | `driver123` | `+591 77012345` | Motocicleta Honda Navi (Placa: 4829-KPL) |

---

## 🎯 1. Product Overview & Architecture
CompraYa is a high-performance multi-vendor e-commerce platform integrated with TikTok Live Commerce and connected to the OpenDSP logistics network for ultra-fast (15–45 min) express deliveries in Santa Cruz, Bolivia.

### Core Architectural Layers:
1. **Frontend App (`marketplace_app`):** Built with Next.js 16, React 19, TailwindCSS, and Lucide Icons running on `http://localhost:3001`.
2. **Backend Services (`marketplace_backend`):** NestJS REST API with Prisma ORM (SQLite/PostgreSQL) running on `http://localhost:4000/api/v1`.
3. **Logistics Core (`dsp_backend`):** OpenDSP multi-tenant dispatch engine running on `http://localhost:3000/v1`.

---

## 🚀 2. Core Functional Requirements & Test Cases

---

### Feature 1: User Authentication & Session Management
- **Description:** Allows users to log in with email, phone (+591), or social credentials, persist session, and complete profile enrichment.
- **Entry Points:**
  - UI Header Login Button `[Iniciar Sesión]`
  - Modal: `http://localhost:3001` (Auth Modal)
  - API: `POST /api/v1/auth/social-login`, `POST /api/v1/auth/enrich-profile`
- **Test Steps:**
  1. Open application at `http://localhost:3001`.
  2. Click `[Iniciar Sesión]` in the top navigation header.
  3. Enter test identifier: `test.buyer@compraya.bo` and click submit (or select `[Google]` / `[TikTok]`).
  4. Verify modal closes, session cookie `chiringuito_auth_token` is set, and user name is displayed in the header.
  5. Fill in delivery address and Bolivian tax number (NIT/CI: `8491029012`).
  6. Click `[Cerrar Sesión]` and verify user returns to guest state.
- **Expected Results:** User is authenticated, profile data persists in `localStorage` under `chiringuito_auth_user`, and protected routes allow access.

---

### Feature 2: Product Catalog, Search & Filtering
- **Description:** Real-time catalog navigation, interactive category filtering, and instant search without page reload.
- **Entry Points:**
  - Home Page: `http://localhost:3001/`
  - Category Pills: `[Ropa y Calzado]`, `[Tecnología]`, `[Belleza]`, `[Hogar]`, `[Deportes]`
  - Search Input: Top navigation bar
- **Test Steps:**
  1. Navigate to `http://localhost:3001/`.
  2. Click on category pill `[Tecnología]`.
  3. Verify product list filters down to technology items.
  4. In the search input, type `"iPhone"` or `"Chompa"`.
  5. Verify results update in real time (< 150ms).
  6. Clear search input and verify full catalog is restored.
- **Expected Results:** Products render with title, formatted price in Bolivianos (`Bs.`), store badge, and stock status.

---

### Feature 3: Product Detail & Variant Selection
- **Description:** Detailed product view displaying image gallery, technical specifications, multi-store offers, and variant selection.
- **Entry Points:**
  - PDP Route: `http://localhost:3001/product/[slug]` (e.g. `/product/chompa-oversize-beige-talla-m`)
- **Test Steps:**
  1. Navigate to `/product/chompa-oversize-beige-talla-m`.
  2. Verify main product image, price (`Bs. 189`), and store name (`ModaBol`).
  3. Click variant pill (e.g. Color `[Negro]`).
  4. Verify the active selection state changes to Negro.
  5. Click `[Añadir al Carrito]` or `[Comprar Ahora]`.
- **Expected Results:** Variant is selected and added to the cart drawer.

---

### Feature 4: Shopping Cart Drawer & Quantity Management
- **Description:** Slide-over cart drawer allowing quantity adjustment, price calculation, and checkout navigation.
- **Entry Points:**
  - Header Cart Icon / Drawer Button
  - Cart Page: `http://localhost:3001/cart`
- **Test Steps:**
  1. Add an item priced at `Bs. 100` to the cart.
  2. Open cart drawer or go to `/cart`.
  3. Click `[+]` button to increase quantity to `2`.
  4. Verify subtotal recalculates to `Bs. 200`.
  5. Click `[-]` button to decrease quantity to `1`.
  6. Verify subtotal recalculates to `Bs. 100`.
  7. Click `[Continuar al Checkout]`.
- **Expected Results:** Quantities and amounts update reactively; checkout page opens.

---

### Feature 5: Checkout Flow & Payment Methods
- **Description:** Order placement with customer information capture, shipping fee calculation, and payment method selection.
- **Entry Points:**
  - Route: `http://localhost:3001/checkout`
- **Test Steps:**
  1. Navigate to `/checkout` with items in cart.
  2. Test Form Validation: Leave customer name or phone empty and click `[Confirmar y Pagar Pedido]`.
  3. Verify HTML5 / UI validation alerts require the fields.
  4. Enter customer data:
     - Name: `Carlos Test`
     - Phone: `77012345`
     - Address: `Av. San Martín #500, Equipetrol, Santa Cruz`
  5. Select Payment Method: Click `[QR Simple]` (BCP / ASFI QR).
  6. Verify shipping fee and total amount breakdown in `Bs.`.
  7. Click `[Confirmar y Pagar Pedido]`.
- **Expected Results:** Order is created in backend (`CY-XXXXXX-XXX`), dispatched to OpenDSP, and redirects to `/order/track/[orderNumber]`.

---

### Feature 6: OpenDSP Logistics Dispatch & Real-Time Tracking
- **Description:** Live delivery tracking with satellite map, 4-step progress indicator, and courier contact card.
- **Entry Points:**
  - Route: `http://localhost:3001/order/track/[orderId]`
  - API: `GET /api/v1/dsp/track/:token`
- **Test Steps:**
  1. Navigate to `/order/track/CY-894120-412`.
  2. Verify 4-step progress tracker:
     - Step 1: `Pedido Confirmado`
     - Step 2: `En Preparación`
     - Step 3: `En Camino con OpenDSP`
     - Step 4: `Entregado`
  3. Verify the GPS map shows Store Origin, Customer Destination, and Courier icon.
  4. Verify Courier Card renders assigned driver: `Carlos Mendoza`, Rating `★ 4.9`, Plate `4829-KPL`, and `[Llamar]` phone link.
- **Expected Results:** Live telemetry polls every 5 seconds; ETA and courier movement are rendered smoothly.

---

### Feature 7: Media & Image Upload Management
- **Description:** Image uploading for product galleries, store logos, and banners with MIME and file size validation.
- **Entry Points:**
  - API: `POST /api/v1/upload/image`, `POST /api/v1/upload/batch`
  - Vendor Modal: `http://localhost:3001/vendor/inventory`
- **Test Steps:**
  1. Send a valid base64 image (JPEG/PNG/WebP < 5 MB) to `/api/v1/upload/image`.
  2. Verify HTTP 200 with `{ success: true, url: "/uploads/products/..." }`.
  3. Send an invalid file (e.g. `application/x-msdownload`).
  4. Verify HTTP 400 Bad Request with descriptive message.
- **Expected Results:** Safe images are stored and public URLs returned; unauthorized MIME types are rejected.

---

### Feature 8: Vendor Inventory Management & Hot Updates
- **Description:** Seller portal for catalog control, price editing, stock adjustments, and product deactivation.
- **Entry Points:**
  - Route: `http://localhost:3001/vendor/inventory`
  - APIs: `PUT /api/v1/products/:id`, `PATCH /api/v1/products/:id/stock`, `DELETE /api/v1/products/:id`
- **Test Steps:**
  1. Navigate to `/vendor/inventory`.
  2. In the inventory table search bar, type `"Xiaomi"` and verify table filters.
  3. Click `[+ Añadir Producto]` to open the modal.
  4. Submit an empty form and verify required field validations.
  5. Fill in title: `"Audífonos Bluetooth Pro"`, price: `"150"`, stock: `"20"` and save.
  6. Verify new item appears in table and is reflected in customer storefront.
- **Expected Results:** Inventory updates in real time without stale cache discrepancies.

---

### Feature 9: Cash Register & End-of-Day Register Closure (Arqueo de Caja POS)
- **Description:** Point-of-sale shift control: opening cash float, recording sales by payment channel, petty cash expenses, physical cash count, and discrepancy reporting.
- **Entry Points:**
  - APIs:
    - `POST /api/v1/cash-register/shifts/open`
    - `POST /api/v1/cash-register/shifts/:id/movements`
    - `POST /api/v1/cash-register/shifts/:id/close`
    - `GET /api/v1/cash-register/shifts/current/:storeId`
- **Test Steps:**
  1. **Apertura de Caja:** Send `POST /cash-register/shifts/open` with `initialCash: 200.00` and `cashierName: "María López"`. Verify status is `OPEN`.
  2. **Registro de Ventas:** Send movements:
     - `SALE_CASH`: `Bs. 120.00`
     - `SALE_QR`: `Bs. 180.00`
     - `SALE_CARD`: `Bs. 150.00`
  3. **Salida de Caja Menor:** Send `EXPENSE` of `Bs. 35.00` (reason: "Embalaje").
  4. **Arqueo y Cierre:** Send `POST /cash-register/shifts/:id/close` with physical cash `actualCash: 285.00` (`200 + 120 - 35 = 285`).
  5. Verify `difference: 0.00` and `auditStatus: "BALANCED"`.
  6. Attempt to add a movement to the closed shift; verify HTTP 400 rejection.
- **Expected Results:** Shift is closed inmutably, audit report is generated, and further mutations are blocked.

---

### Feature 10: Sales Split, Marketplace Commissions & Webhooks
- **Description:** Financial accounting per order: 5% platform commission, 95% merchant net payout, and automatic wallet credit upon delivery.
- **Entry Points:**
  - API: `POST /api/v1/orders/webhook/dsp`
- **Test Steps:**
  1. Create an order with subtotal `Bs. 200.00`.
  2. Verify `platformCommission: Bs. 10.00` (5%) and `vendorEarnings: Bs. 190.00` (95%).
  3. Send delivery webhook from OpenDSP: `{ event: "order.delivered", externalOrderId: orderNumber, status: "DELIVERED" }`.
  4. Verify order status transitions to `DELIVERED`.
  5. Verify store's `walletBalance` increments by `Bs. 190.00`.
- **Expected Results:** Accurate double-entry accounting and automated wallet balance credit.

---

## 🛡️ 3. Non-Functional & Quality Standards
1. **Performance:** Initial page load under 1.2s; API roundtrips under 200ms.
2. **Resilience:** Fallback Haversine pricing activates gracefully within 2.5s if OpenDSP Core is unreachable.
3. **Responsive Design:** 100% functional on Mobile (375px), Tablet (768px), and Desktop (1280px+).
4. **Data Integrity:** Concurrency lock ensures zero overselling on stock = 1 items.

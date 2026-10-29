# Verificación del registro y panel de tienda

Fecha: 2026-10-28, America/La_Paz.

final result: passed

## Referencias y evidencia

- Registro: `C:/Users/marvi/AppData/Local/Temp/codex-clipboard-bc92f427-0011-42eb-b87b-50228bd88408.png` (1536 × 1024, tres columnas de referencia).
- Panel: `C:/Users/marvi/AppData/Local/Temp/codex-clipboard-4f772b55-85dd-41e6-b9b4-089027f54a73.png` (1536 × 1024).
- Capturas y comparaciones: `C:/Users/marvi/.codex/visualizations/2026/10/29/01a185a5-c871-7601-9cf0-e788deeaa983/vendor-qa/`.
- Comparación completa del panel: `dashboard-comparison-final.png`, con la referencia y la implementación en la misma imagen.
- Comparación del registro: `onboarding-comparison-final.png`, con la primera columna de la referencia y la tarjeta de la implementación normalizadas a 488 × 976.
- Comparación del catálogo: `catalog-comparison-final.png`.
- Implementación del panel: `dashboard-desktop.png` y `dashboard-desktop-full.png`.
- Implementación del registro: `onboarding-step-1-final.png`, `onboarding-step-2.png`, `onboarding-step-3.png`.
- Móvil: `dashboard-mobile-320.png`, `clients-mobile.png`, `onboarding-mobile.png`, `onboarding-mobile-320.png`.
- Sesión cerrada tras recarga: `logout-confirmed.png`. Entrada final: `seller-entry-final.png`.

## Estado y normalización

El objetivo del usuario es aproximar las referencias e integrar las funcionalidades existentes. Se comparó escritorio a 1536 × 1024 CSS px; el proveedor devolvió algunas capturas a 1530 × 1020. Se normalizaron proporcionalmente las imágenes en las comparaciones, sin atribuir esa diferencia de densidad al diseño. La captura final completa del registro mide 1536 × 1056 e incluye márgenes exteriores; la tarjeta mide 992 CSS px y el botón Continuar termina a 999 px, visible en el viewport de 1024 px.

Se probaron anchos de 320 y 393 px. A 320 px, el contenido midió 314 px y el extremo derecho del botón de cuenta quedó a 298 px: no hay desbordamiento horizontal ni controles ocultos. El registro también midió 314 px de contenido a 320 px.

Los productos, pedidos e importes de las capturas del panel pertenecen exclusivamente a una copia SQLite temporal en `%TEMP%/vitrina-vendor-qa-20261028/`. Las imágenes de productos recortadas de la referencia se usaron solamente en ese entorno de prueba. No se añadieron esos productos, pedidos, datos de cobro ni imágenes de ejemplo al catálogo o código de producción.

## Superficies revisadas

- Tipografía: se conserva la familia sans serif del producto; títulos con mayor peso, descripciones legibles y etiquetas claras. Diferencia menor frente a la tipografía exacta de la imagen, aceptada por tratarse de una adaptación del producto existente.
- Espaciado y distribución: fondo neutro, tarjetas blancas, cuatro pasos, cuadrícula de categorías, barra lateral en escritorio y navegación móvil. El catálogo, los pedidos y la gráfica principal quedan visibles en la composición de escritorio.
- Colores: violeta para acciones y selección; gris claro en el fondo; estados de stock y errores diferenciados. Foco de teclado visible.
- Imágenes e iconos: se conserva la marca existente; los productos y logos se cargan desde datos reales. Se usan iconos de la biblioteca existente, sin emojis decorativos ni imágenes de fondo en el panel o registro.
- Contenido: textos en español, validación explícita del celular y categoría, datos exclusivos de la tienda y estados vacíos/error con reintento. No se copian cifras de visitas ni porcentajes ficticios de la referencia.

## Historial de correcciones

1. P2: la tarjeta de bienvenida y las imágenes demasiado altas desplazaban la gráfica fuera de la vista. Evidencia inicial: `dashboard-desktop-initial.png` y `dashboard-comparison-initial.png`. Se redujeron la altura del banner, la proporción de las fotos y los espacios de estadísticas. Evidencia final: `dashboard-desktop.png` y `dashboard-comparison-final.png`; la gráfica termina a 990 CSS px dentro de los 1024 px de alto.
2. P2: el encabezado móvil desbordaba a 320 px; el botón de cuenta terminaba a 328 px. Se compactó la marca, se adaptaron los accesos del encabezado y se apilaron las métricas en móvil. Evidencia final: `dashboard-mobile-320.png`, medición de contenido 314 px y cuenta a 298 px.
3. P2: el registro añadía filas inferiores que dificultaban llegar a Continuar en escritorio. Se retiraron los textos secundarios, se ajustaron los espacios y se conservaron los controles de volver. Evidencia final: `onboarding-step-1-final.png` y `onboarding-comparison-final.png`; Continuar termina a 999 px.
4. Error funcional: Leaflet emitía `moveend` durante el desmontaje del mapa y accedía a una instancia destruida. Se retira el listener antes de destruir el mapa, se comprueba cancelación y se aborta la geocodificación pendiente. Se volvió a abrir y cerrar Ubicación sin nuevos errores de consola.

## Interacciones comprobadas

- Vender ofrece Registrar mi tienda e Iniciar sesión en mi tienda, con mensajes de acceso distintos.
- Registro completo de cuatro pasos contra el API y SQLite aislados; validación de categoría, teléfono y datos de cobro; volver conserva los campos; días y horas seleccionables.
- Subir una foto y publicar un producto desde el panel; editar precio y stock; ocultar/publicar; persistencia después de recargar.
- Filtros por disponibilidad y stock; búsqueda local y buscador del encabezado con navegación a `?q=`.
- Aplicar y terminar un descuento persistente con el API.
- Pedidos pendientes/entregados, búsqueda por número y acceso desde pedidos recientes.
- Clientes agrupados por teléfono, búsqueda y enlaces de llamada/WhatsApp. No se enviaron mensajes ni se hicieron llamadas.
- Estadísticas de 7/30 días calculadas sobre los pedidos cargados, sumando solamente líneas de la tienda. La interfaz informa el límite existente de 100 pedidos.
- Guardar un horario, recargar y comprobar el valor guardado.
- Copiar el enlace público de la tienda y verificar su contenido.
- Menú lateral móvil, acceso de cuenta, cierre con Escape y controles visibles a 320 px.
- Cerrar sesión desde Configuración y desde el menú de cuenta; recargar y comprobar que sigue cerrada; iniciar sesión otra vez recupera la tienda.
- Validación adicional del acceso y registro en la app principal `http://localhost:3001/vendor`.
- Revisión de consola después de corregir el mapa: sin nuevos errores durante las pruebas finales.

## Límites y decisiones intencionales

- Los mensajes abren WhatsApp o la aplicación de llamadas. No se presenta una bandeja interna de mensajes inventada.
- La tarjeta de TikTok utiliza estado comprobado para la cuenta y tienda correspondientes. No se validaron OAuth, emisión ni reproducción real de TikTok en esta tarea.
- El tiempo mínimo de preparación muestra la regla existente de una hora; no se añadió un selector que el sistema de entregas no pueda guardar o respetar.
- Las estadísticas usan importes de pedidos, no una confirmación de cobro. No incluyen envío ni pedidos cancelados.
- Se mantuvieron los cambios previos del usuario en los módulos de lives. No se hizo commit, push ni despliegue.

## Verificación técnica

- ESLint de los archivos de tienda, autenticación, hoja de acceso y mapa: sin errores ni advertencias.
- `npx tsc --noEmit`: correcto después de regenerar tipos de rutas y apartar tipos generados obsoletos.
- `npm run build` del frontend: correcto.
- `npm run build` del backend: correcto.
- Suite completa del backend: 28 suites / 227 pruebas aprobadas antes de añadir el caso de primer producto.
- Casos focalizados posteriores: `first-product` y `store-summary`, 2 suites / 2 pruebas aprobadas.

## Pulido opcional

- P3: puede sustituirse la fuente del sistema por la fuente exacta del diseño si se proporciona ese archivo o identidad tipográfica.
- P3: considerar estadísticas paginadas o agregadas por servidor para tiendas con más de 100 pedidos.

No quedan hallazgos P0/P1/P2 de diseño dentro del alcance verificado.

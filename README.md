# 🛠️ FerreMas — Plataforma Web de Comercio Electrónico & Gestión Omnicanal

---

## 📖 1. Contexto del Negocio y Planteamiento del Caso

**FERREMAS** es una distribuidora tradicional de herramientas, maquinarias y materiales de construcción fundada en la década de los 80 en Santiago de Chile. En la actualidad dispone de sucursales estratégicas distribuidas entre la Región Metropolitana y regiones (Valparaíso, Biobío y Los Lagos), comercializando marcas líderes como Bosch, Makita, Stanley y Sika.

Históricamente, la compañía operó bajo un esquema de venta física directa en mostrador. La contingencia sanitaria y las restricciones de movilidad evidenciaron una necesidad crítica: modernizar la operación mediante una plataforma digital capaz de integrar la venta web con los procesos de inventario y los roles operativos de cada sucursal.

### Propósito del Proyecto
Desarrollar una solución integral de comercio electrónico que conecte la vitrina virtual y la experiencia de compra del cliente con paneles internos de gestión específicos para cada perfil de la empresa: **Administrador**, **Vendedor**, **Bodeguero** y **Contador**.

---

## 🎯 2. Matriz de Requerimientos del Sistema

| Código | Requerimiento | Descripción Funcional | Tipo |
| :--- | :--- | :--- | :--- |
| **R.1** | Cuentas Iniciales Administrador | Credenciales temporales con cambio forzado de contraseña en el primer inicio de sesión. | Funcional |
| **R.2** | Sistema de Autenticación | Control de acceso y sesiones diferenciadas por rol operativo. | Funcional |
| **R.3** | Registro y Beneficios Cliente | Registro vía correo electrónico y aplicación de promociones en compras por volumen (>4 unidades). | Funcional |
| **R.4** | Gestión de Personal Interno | Creación, asignación de sucursal y gestión de roles (Vendedor, Bodeguero, Contador). | Funcional |
| **R.5** | Catálogo Virtual | Vitrina interactiva con filtros por categoría y especificaciones técnicas detalladas. | Funcional |
| **R.6** | Carrito de Compras | Persistencia de productos seleccionados, ajuste de unidades y desglose de subtotales. | Funcional |
| **R.7** | Modalidades de Entrega | Selección entre retiro presencial en sucursales o despacho a domicilio. | Funcional |
| **R.8** | Pasarela de Pago Híbrida | Integración con Mercado Pago (tarjetas y código QR) y soporte para transferencia bancaria directa. | Funcional |
| **R.9** | Validación Comercial | Revisión y confirmación de pedidos antes de su paso a bodega. | Funcional |
| **R.10** | Control de Stock y Bodega | Identificación de productos a reponer (stock crítico ≤ 5) y preparación de órdenes. | Funcional |
| **R.11** | Conciliación Financiera | Validación de comprobantes de transferencia y registro contable de entregas. | Funcional |
| **R.12 - R.17** | Estándares de Calidad | Seguridad de datos, responsividad multidispositivo y tiempos de carga óptimos. | No Funcional |

---

## 🏛️ 3. Arquitectura y Tecnologías Utilizadas

El sistema fue concebido bajo el patrón arquitectónico **MVT (Model-View-Template)** utilizando el framework **Django**, acoplado con servicios en la nube para persistencia y pasarelas de pago externas:

<div align="center">

| Componente | Stack Tecnológico | Badges Oficiales |
| :--- | :--- | :--- |
| **Backend & Core** | Python 3.10+ / Django 4.x | ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) ![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white) |
| **Persistencia NoSQL** | Google Cloud Firestore | ![Firestore](https://img.shields.io/badge/Cloud_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black) |
| **Interfaz & UX** | HTML5 / CSS3 / ES6+ / Lucide | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) |
| **Pasarela Financiera** | Mercado Pago SDK | ![Mercado Pago](https://img.shields.io/badge/Mercado_Pago-009EE3?style=for-the-badge&logo=mercadopago&logoColor=white) |
| **Georreferenciación** | REST APIs (Regiones & Comunas) | ![API REST](https://img.shields.io/badge/REST_API-4B5563?style=for-the-badge&logo=fastapi&logoColor=white) |

</div>

<br>

* **⚡ Backend:** Python / Django (orquestación lógica, enrutamiento, controladores de vistas y gestión de sesiones).
* **🔥 Base de Datos & Almacenamiento:** Cloud Firestore (gestión de colecciones de catálogo, pedidos, inventario y usuarios en tiempo real).
* **🎨 Frontend Reactivo:** HTML5 semántico, diseño modular en CSS3 (efectos glassmorphism y paleta corporativa), JavaScript vanilla y Lucide Icons.
* **💳 Pasarela de Pagos:** SDK oficial de Mercado Pago (procesamiento de checkout electrónico con tarjetas de crédito/débito y códigos QR dinámicos).
* **🗺️ Georreferenciación:** Integración de APIs REST con respaldo local para la carga en cascada de regiones y comunas de Chile.

---

## 📸 4. Evidencias del Sistema y Flujos Operativos

### 4.1. Plataforma Pública y Experiencia de Usuario (Cliente)

#### Hero Banner Dinámico de Bienvenida
Cabecera interactiva a pantalla completa del sitio web con logotipo institucional, barra de búsqueda, navegación rápida y carrusel continuo con iconografía de categorías.

<p align="center">
  <img src="./docs/img/01-inicio-hero-banner.gif" alt="Hero Banner FerreMas" width="100%" />
</p>

---

#### Catálogo Virtual, Ficha de Producto y Carrito
Navegación interactiva por el catálogo, apertura del modal con especificaciones normativas (ANSI Z87+), ajuste de cantidades y adición dinámica al carrito de compras.

<p align="center">
  <img src="./docs/img/08-catalogo-modal-detalle-carrito.gif" alt="Modal de Detalle de Producto e Incorporación al Carrito" width="95%" />
</p>

---

#### Directorio Regional de Sucursales Físicas
Módulo informativo con la red de tiendas físicas de FerreMas (Santiago Centro, Quilpué Centro, Viña Oriente, Concepción Norte y Puerto Montt Costanera) indicando direcciones y teléfonos de contacto para retiro presencial.

<p align="center">
  <img src="./docs/img/06-inicio-sucursales-directorio.png" alt="Directorio de Sucursales FerreMas" width="90%" />
</p>

---

### 4.2. Logística de Despacho y Checkout

#### Registro y Libreta de Direcciones
Formulario de contacto y datos de envío con selectores en cascada por Región y Comuna, almacenamiento en tiempo real y vista interactiva de direcciones guardadas.

<p align="center">
  <img src="./docs/img/07-registro-y-gestion-direcciones.gif" alt="Registro y Gestión de Direcciones" width="95%" />
</p>

#### Modalidad Retiro en Tienda y Despacho
Alternancia en el checkout entre retiro físico filtrando sucursales disponibles por región/comuna y despacho a domicilio vinculado a la libreta de direcciones del comprador.

<p align="center">
  <img src="./docs/img/14-checkout-seleccion-retiro-en-tienda.gif" alt="Selección de Retiro en Tienda" width="95%" />
</p>

---

### 4.3. Procesamiento de Pagos (Mercado Pago & Transferencia)

#### Checkout Automatizado (Mercado Pago)
Confirmación del resumen del carrito y redirección fluida a la pasarela de pago para procesar compras seguras mediante tarjetas de crédito, débito o código QR.

<p align="center">
  <img src="./docs/img/16-checkout-flujo-pago-tarjeta-redireccion.gif" alt="Redirección y Checkout Mercado Pago" width="95%" />
</p>

#### Pago Asistido por Transferencia Bancaria
Flujo de pago manual con ingreso de comprobante, datos del titular y entidad bancaria emisora, dejando la orden registrada para revisión del área contable.

<p align="center">
  <img src="./docs/img/17-checkout-flujo-pago-transferencia-bancaria.gif" alt="Flujo de Pago por Transferencia Bancaria" width="95%" />
</p>

---

### 4.4. Panel Administrativo y Roles Internos

#### Menú de Navegación del Perfil Administrador
Panel de gestión con acceso unificado a módulos de personal, catálogo de productos, órdenes de compra, transferencias bancarias y armados de bodega.

<p align="center">
  <img src="./docs/img/18-panel-navegacion-administrador.gif" alt="Panel de Navegación Administrador" width="95%" />
</p>

#### Registro de Personal y Asignación de Roles
Alta de colaboradores internos con asignación de roles operativos (Vendedor, Bodeguero, Contador) y vinculación a una sucursal regional específica.

<p align="center">
  <img src="./docs/img/19-modulo-creacion-gestion-trabajadores.gif" alt="Alta y Asignación de Trabajadores" width="95%" />
</p>

#### Primer Acceso y Cambio Forzado de Contraseña
Directiva de seguridad que intercepta las credenciales temporales generadas por el administrador en el primer inicio de sesión para obligar a definir una clave personal.

<p align="center">
  <img src="./docs/img/20-autenticacion-primer-acceso-cambio-clave.gif" alt="Autenticación Primer Acceso y Cambio de Clave" width="95%" />
</p>

#### Validación de Pagos y Emisión de Comprobantes (Contador)
Consola contable para revisar solicitudes de transferencia pendientes, verificar montos, emitir comprobantes de pago por correo y autorizar la liberación del pedido.

<p align="center">
  <img src="./docs/img/21-contador-validacion-transferencias-comprobante.gif" alt="Validación de Transferencias por el Contador" width="95%" />
</p>

#### Control de Inventario y Stock Crítico (Bodega)
Gestión y monitoreo de existencias clasificado en tiempo real entre artículos disponibles y productos con stock crítico a reponer (stock ≤ 5), con filtros por categoría.

<p align="center">
  <img src="./docs/img/22-bodega-inventario-productos-filtro-categoria.gif" alt="Gestión de Inventario y Stock en Bodega" width="95%" />
</p>

---

## ⚙️ 5. Instalación y Puesta en Marcha Local

### Prerrequisitos
* Python 3.10 o superior
* Git instalado

### Pasos de Despliegue

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/deralexsander/web_FerreMas.git](https://github.com/deralexsander/web_FerreMas.git)
   cd web_FerreMas/web_FerreMas
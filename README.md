# 🛠️ FerreMas — Plataforma Web de Comercio Electrónico & Gestión Omnicanal

[![Django](https://img.shields.io/badge/Backend-Django_4.x-092E20?logo=django&logoColor=white)](#)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)](#)
[![Firebase](https://img.shields.io/badge/NoSQL-Cloud_Firestore-FFCA28?logo=firebase&logoColor=black)](#)
[![Mercado Pago](https://img.shields.io/badge/Pasarela-Mercado_Pago_SDK-009EE3?logo=mercadopago&logoColor=white)](#)
[![Licence](https://img.shields.io/badge/Academic_Project-Duoc_UC-002B49)](#)

---

## 📖 1. Contexto del Negocio y Planteamiento del Caso

**FERREMAS** es una distribuidora tradicional de herramientas, maquinarias y materiales de construcción fundada en la década de los 80 en Santiago de Chile[cite: 1, 8, 10]. En la actualidad dispone de **7 sucursales estratégicas** (4 ubicadas en la Región Metropolitana y 3 en regiones como Valparaíso, Biobío y Los Lagos), distribuyendo marcas reconocidas como Bosch, Makita, Stanley y Sika[cite: 1, 8, 10].

Históricamente, la compañía basó su éxito operativo en la venta física y directa en mostrador[cite: 1, 8]. No obstante, las restricciones de movilidad y distanciamiento derivadas de la contingencia sanitaria de 2020 impactaron fuertemente el flujo de clientes presenciales, evidenciando una debilidad crítica: **la ausencia de un canal digital de ventas e integración de inventario en tiempo real[cite: 1, 2, 8, 10].**

### Propósito del Proyecto
Desarrollar e implementar una plataforma web de comercio electrónico moderna, segura y escalable que combine la vitrina digital orientada al cliente B2C/B2B con paneles de administración interna adaptados a la jerarquía de roles de la empresa (Administrador, Vendedor, Bodeguero y Contador)[cite: 1, 3, 8, 10].

---

## 🎯 2. Matriz de Requerimientos del Sistema

| Código | Módulo / Requerimiento | Descripción Funcional | Tipo |
| :--- | :--- | :--- | :--- |
| **R.1** | Cuentas Iniciales Administrador | Cuentas con credenciales temporales que exigen cambio de clave en el primer acceso. | Funcional |
| **R.2** | Sistema de Autenticación | Control de sesiones y accesos diferenciados según rol asignado. | Funcional |
| **R.3** | Registro y Beneficios Cliente | Alta de clientes por correo con descuentos por compras de volumen (>4 unidades). | Funcional |
| **R.4** | Gestión de Personal Interno | Alta y administración de usuarios (Vendedor, Bodeguero, Contador) y asignación a sucursal[cite: 8]. | Funcional[cite: 8] |
| **R.5** | Catálogo Dinámico | Vitrina virtual de productos con filtros de categoría y ficha técnica detallada[cite: 8]. | Funcional[cite: 8] |
| **R.6** | Carrito de Compras | Gestión local persistente de ítems seleccionados y cálculo dinámico de subtotales[cite: 8]. | Funcional[cite: 8] |
| **R.7** | Despacho y Logística | Selección entre retiro en sucursal filtrado por región/comuna o despacho a domicilio[cite: 8]. | Funcional[cite: 8] |
| **R.8** | Métodos de Pago Híbridos | Integración con pasarela externa (Mercado Pago: QR/Tarjetas) y transferencia bancaria directa[cite: 8]. | Funcional[cite: 8] |
| **R.9** | Validación Comercial | Revisión, aprobación y emisión de órdenes hacia el área de bodega[cite: 4, 8]. | Funcional[cite: 8] |
| **R.10** | Control de Stock y Bodega | Monitoreo de productos a reponer (stock ≤ 5), existencias y preparación de pedidos[cite: 8]. | Funcional[cite: 8] |
| **R.11** | Conciliación y Caja | Validación de comprobantes de transferencia y emisión de boleta por el Contador[cite: 8]. | Funcional[cite: 8] |
| **R.12 - R.17** | Calidad y Arquitectura | Protección de datos sensibles, interfaz responsiva multidispositivo y carga fluida[cite: 8]. | No Funcional[cite: 8] |

---

## 🏛️ 3. Arquitectura y Tecnologías Utilizadas

El sistema fue concebido bajo el patrón arquitectónico **MVT (Model-View-Template)** impulsado por el framework Django, interactuando con servicios en la nube para agilidad y escalabilidad[cite: 8]:

* **Backend:** Python / Django Framework (gestión de sesiones, endpoints, orquestación lógica)[cite: 8, 11].
* **Base de Datos & Almacenamiento:** Cloud Firestore (colecciones para productos, catálogo, control de stock y pedidos en tiempo real)[cite: 7, 8].
* **Frontend:** HTML5 semántico, CSS3 modular (con efectos glassmorphism y variables CSS), JavaScript ES6+ y Lucide Icons[cite: 7].
* **Pasarela de Pagos:** SDK oficial de Mercado Pago (procesamiento de tarjetas de crédito/débito y generación de códigos QR dinámicos).
* **APIs de Georreferenciación:** Servicios REST para la carga y renderizado en cascada de regiones y comunas oficiales de Chile[cite: 8].

---

## 📸 4. Evidencias del Sistema y Flujos Operativos

### 4.1. Plataforma Pública y Experiencia de Usuario (Cliente)

#### Vitrina Principal y Propuesta de Valor
La pantalla inicial incorpora un slider dinámico de categorías y módulos informativos que garantizan la encriptación de datos, soporte continuo y cobertura territorial de tiendas físicas[cite: 1, 4].

| Hero Banner y Categorías | Seguridad Garantizada |
| :---: | :---: |
| ![Hero Banner](docs/img/01-inicio-hero-banner.jpg) | ![Seguridad y Garantías](docs/img/04-inicio-seguridad-garantizada.jpg) |

#### Directorio de Sucursales y Canales de Retiro
Panel dinámico que lista las tiendas activas de la red (Santiago Centro, Quilpué Centro, Viña Oriente, Concepción Norte y Puerto Montt Costanera) con sus datos de contacto y dirección para retiro presencial[cite: 2, 6, 8].

![Directorio Sucursales](docs/img/06-inicio-sucursales-directorio.jpg)

#### Catálogo Virtual, Ficha de Producto y Carrito
Navegación filtrada por categorías (*seguridad*, *herramientas manuales*, *materiales eléctricos*, entre otras), modal con ficha técnica bajo normativas vigentes y sincronización con el carrito de compras[cite: 2, 6].

| Catálogo General de Productos | Incorporación Interactiva al Carrito |
| :---: | :---: |
| ![Catálogo General](docs/img/09-catalogo-general-grid-categorias.jpg) | ![Detalle de Producto](docs/img/08-catalogo-modal-detalle-carrito.gif) |

---

### 4.2. Flujo de Checkout y Opciones de Entrega

El proceso de compra permite alternar entre **Despacho a Domicilio** (con registro normalizado de direcciones) y **Retiro en Tienda** mediante selectores en cascada por Región y Comuna[cite: 8, 9].

| Registro y Libreta de Direcciones | Selección de Retiro en Tienda |
| :---: | :---: |
| ![Gestión Direcciones](docs/img/07-registro-y-gestion-direcciones.gif) | ![Retiro Tienda](docs/img/14-checkout-seleccion-retiro-en-tienda.gif) |

---

### 4.3. Pasarela de Pagos (Híbrida: Mercado Pago & Transferencia)

El cliente dispone de pago electrónico inmediato mediante redirección a **Mercado Pago** (soporte de tarjetas y códigos QR) o pago asistido vía **Transferencia Bancaria** que envía el comprobante a validación interna[cite: 5, 10, 11].

| Redirección y Pago con Tarjeta | Transferencia Bancaria Manual |
| :---: | :---: |
| ![Pago Mercado Pago](docs/img/16-checkout-flujo-pago-tarjeta-redireccion.gif) | ![Pago Transferencia](docs/img/17-checkout-flujo-pago-transferencia-bancaria.gif) |

---

### 4.4. Panel Administrativo y Gestión por Roles

#### Administración y Seguridad de Cuentas
Módulo para el alta de colaboradores asignando perfiles (Administrador, Vendedor, Bodeguero, Contador) y sucursal de pertenencia. Incluye directiva de seguridad con cambio forzado de credenciales en el primer inicio de sesión.

| Menú de Gestión Administrador | Alta de Trabajadores y Sucursales | Cambio de Contraseña Forzado |
| :---: | :---: | :---: |
| ![Menú Admin](docs/img/18-panel-navegacion-administrador.gif) | ![Alta Personal](docs/img/19-modulo-creacion-gestion-trabajadores.gif) | ![Primer Acceso](docs/img/20-autenticacion-primer-acceso-cambio-clave.gif) |

#### Control Financiero y Gestión de Bodega
* **Panel de Contador:** Conciliación de pagos manuales por transferencia, revisión del RUT/banco emisor, emisión del comprobante y aprobación de la orden.
* **Panel de Bodeguero:** Monitoreo del catálogo de existencias segregado entre artículos disponibles y productos críticos a reponer (stock $\le 5$).

| Validación de Transferencias (Contador) | Control de Stock y Reposición (Bodega) |
| :---: | :---: |
| ![Panel Contador](docs/img/21-contador-validacion-transferencias-comprobante.gif) | ![Panel Bodega](docs/img/22-bodega-inventario-productos-filtro-categoria.gif) |

---

## ⚙️ 5. Instalación y Puesta en Marcha Local

### Prerrequisitos
* Python 3.10 o superior[cite: 11]
* Node.js (opcional, para empaquetado frontend)[cite: 11]
* Entorno virtual de Python configurado[cite: 11]

### Pasos de Despliegue

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/tu-usuario/web_FerreMas.git](https://github.com/tu-usuario/web_FerreMas.git)
   cd web_FerreMas/web_FerreMas
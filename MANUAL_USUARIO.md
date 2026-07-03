# RF Realty CRM — Manual de Usuario

> **Versión:** 1.0  
> **Fecha:** Julio 2026  
> **Propósito:** Guía completa de uso del sistema de gestión inmobiliaria

---

## Contenido

1. [Acerca del Sistema](#1-acerca-del-sistema)
2. [Requisitos y Acceso](#2-requisitos-y-acceso)
3. [Inicio de Sesión](#3-inicio-de-sesión)
4. [Panel Principal (Dashboard)](#4-panel-principal-dashboard)
5. [Navegación General](#5-navegación-general)
6. [Gestión de Leads (Clientes Potenciales)](#6-gestión-de-leads-clientes-potenciales)
7. [Gestión de Propiedades](#7-gestión-de-propiedades)
8. [Portafolios de Propiedades](#8-portafolios-de-propiedades)
9. [Calendario y Eventos](#9-calendario-y-eventos)
10. [Documentos](#10-documentos)
11. [Integración con WhatsApp](#11-integración-con-whatsapp)
12. [Solución de Problemas](#12-solución-de-problemas)
13. [Glosario de Términos](#13-glosario-de-términos)
14. [Soporte y Contacto](#14-soporte-y-contacto)

---

## 1. Acerca del Sistema

**RF Realty CRM** es una plataforma web diseñada para que agentes y corredores de bienes raíces puedan gestionar de forma centralizada sus clientes, propiedades, citas y documentos.

### ¿Qué problemas resuelve?

| Problema | Solución |
|---|---|
| Leads perdidos en hojas de cálculo o post-its | Base de datos centralizada con búsqueda instantánea |
| Seguimiento inconsistente de clientes | Pipeline visual con estados (Nuevo → Contactado → Calificado → Negociación → Cerrado) |
| Propiedades desorganizadas | Catálogo con filtros, tipos, precios y vinculación a portafolios |
| Citas y llamadas sin registro | Calendario integrado con eventos por tipo y sincronización a Apple Calendar |
| Documentos dispersos | Repositorio único vinculado a leads, propiedades o portafolios |
| Atención lenta a leads de WhatsApp | Captura automática con inteligencia artificial y respuesta inmediata |

### Capacidades principales

- **Gestión de leads**: Alta, edición, eliminación, pipeline Kanban, filtros
- **Catálogo de propiedades**: CRUD completo, importación desde Excel
- **Portafolios**: Agrupación de propiedades por criterios (año, tipo, proyecto, etc.)
- **Calendario**: Eventos con tipos (Llamada, Reunión, Visita, Tarea), sincronización WebCal
- **Documentos**: Metadatos de archivos vinculados a cualquier entidad del sistema
- **WhatsApp AI**: Recepción automática de leads desde WhatsApp con extracción inteligente de datos
- **Dashboard**: KPIs, gráficos, insights del negocio en tiempo real

---

## 2. Requisitos y Acceso

### Para usar el sistema necesitas

| Requisito | Detalle |
|---|---|
| **Dispositivo** | Computadora, tablet o smartphone |
| **Navegador** | Google Chrome (recomendado), Mozilla Firefox, Safari, Microsoft Edge |
| **Conexión a internet** | Mínimo 1 Mbps (funciona con 3G/4G móvil) |
| **Resolución de pantalla** | Mínimo 320px (smartphone), recomendado 1024px o más |
| **Cuenta de usuario** | Proporcionada por el administrador del sistema |

### URL de acceso

```
https://real-estate-crm-ten-rosy.vercel.app
```

> **Nota**: El acceso al sistema es **privado y por invitación**. No es posible registrarse de forma pública. Si necesitas una cuenta, contacta al administrador.

---

## 3. Inicio de Sesión

### 3.1 Ingresar al sistema

Paso a paso:

1. Abre tu navegador web (Chrome, Safari, Edge o Firefox)
2. En la barra de direcciones, escribe la URL del sistema
3. Presiona **Enter**
4. Verás la pantalla de inicio de sesión con los campos **Email address** y **Password**
5. Ingresa tu **correo electrónico** (el que registraste o te fue proporcionado)
6. Ingresa tu **contraseña**
7. Haz clic en el botón **"Sign in"**

![Pantalla de inicio de sesión](https://via.placeholder.com/500x350?text=Pantalla+de+Login)

### 3.2 Recuperar contraseña

Si olvidaste tu contraseña:

1. En la pantalla de login, haz clic en **"Forgot password"** (si está habilitado)
2. Ingresa tu correo electrónico
3. Revisa tu bandeja de entrada — recibirás un enlace para restablecerla
4. Si no ves el correo, revisa la carpeta de **Spam** o **Correo no deseado**

> Si la opción "Forgot password" no está disponible, contacta al administrador para que restablezca tu contraseña desde el panel de administración.

### 3.3 Cerrar sesión

1. En la esquina inferior izquierda de la barra lateral, haz clic en tu **nombre** o **avatar**
2. Selecciona **"Sign out"**
3. Serás redirigido a la pantalla de inicio de sesión

### 3.4 Primera vez que ingresas

Si es tu primer acceso, el administrador te habrá enviado una invitación por correo electrónico. El proceso es:

1. Revisa tu bandeja de entrada — busca un correo de **Supabase Authentication**
2. Haz clic en el enlace **"Accept Invitation"** o similar
3. Establece tu **nombre completo** y una **contraseña segura**
4. Confirma la contraseña
5. Haz clic en **"Save"** o **"Confirm"**
6. Ve a la URL del sistema e inicia sesión con tu correo y la nueva contraseña

> **Recomendación de contraseña segura**: Usa al menos 8 caracteres, combinando mayúsculas, minúsculas, números y símbolos. Ejemplo: `Casa#2026!`

---

## 4. Panel Principal (Dashboard)

El Dashboard es la primera pantalla que ves al iniciar sesión. Te da una visión general del estado de tu negocio.

### 4.1 Componentes del Dashboard

Al centro de la pantalla verás:

#### Tarjetas de resumen (parte superior)

Cuatro tarjetas con métricas clave:

| Tarjeta | Muestra | Ejemplo |
|---|---|---|
| **Total Leads** | Número total de clientes potenciales registrados | 24 leads |
| **Properties** | Número total de propiedades en el catálogo | 102 propiedades |
| **Portfolios** | Número de portafolios creados | 3 portafolios |
| **Events** | Eventos del calendario en el mes actual | 12 eventos |

#### Gráfico de leads por mes (barra vertical)

Muestra la cantidad de leads creados en cada uno de los últimos 6 meses. Cada barra representa un mes. Útil para identificar tendencias estacionales o evaluar el impacto de campañas de marketing.

#### Gráfico de propiedades por tipo (doughnut / anillo)

Muestra la distribución porcentual de propiedades según su tipo:

- **House** (Casa) — azul
- **Apartment** (Departamento) — verde
- **Land** (Terreno) — naranja
- **Commercial** (Local comercial) — púrpura

Al pasar el mouse sobre cada sección, verás el número exacto de propiedades de ese tipo.

#### Insights rápidos (sección inferior)

Tres datos útiles:

| Insight | Descripción |
|---|---|
| **Último lead** | Nombre del lead más recientemente creado |
| **Propiedad más cara** | Precio y título de la propiedad de mayor valor |
| **Total portafolios** | Número total de portafolios activos |

### 4.2 Actualización de datos

Los datos del Dashboard se actualizan automáticamente cada vez que ingresas a la página. Si realizas cambios en otras secciones (como agregar un lead o una propiedad), estos se reflejarán la próxima vez que visites el Dashboard.

---

## 5. Navegación General

### 5.1 Barra lateral

A la izquierda de la pantalla encontrarás la barra de navegación principal con las siguientes opciones:

| Ícono | Sección | Descripción |
|---|---|---|
| 📊 | **Dashboard** | Panel principal con resumen del negocio |
| 👥 | **Leads** | Gestión de clientes potenciales |
| 🏠 | **Properties** | Catálogo de propiedades inmobiliarias |
| 📁 | **Portfolio** | Portafolios de propiedades agrupadas |
| 📅 | **Calendar** | Calendario de eventos, citas y tareas |
| 📄 | **Documents** | Repositorio de documentos |

### 5.2 Cómo moverse entre secciones

1. Haz clic en cualquier ícono o nombre de sección en la barra lateral
2. La sección seleccionada se resaltará con un color diferente
3. El contenido principal cambiará automáticamente
4. La barra lateral permanece visible para que puedas cambiar de sección rápidamente

### 5.3 En dispositivos móviles

En pantallas pequeñas (smartphones), la barra lateral se oculta automáticamente. Para acceder a ella:

1. Toca el ícono de **menú (☰)** en la esquina superior izquierda
2. Se desplegará la barra lateral
3. Toca la sección a la que deseas ir
4. La barra se cerrará automáticamente

---

## 6. Gestión de Leads (Clientes Potenciales)

### 6.1 ¿Qué es un lead?

Un **lead** es una persona que ha mostrado interés en comprar, vender o alquilar una propiedad. Cada lead contiene:

- **Nombre completo** del contacto
- **Correo electrónico**
- **Número de teléfono** (opcional)
- **Estado** actual en el proceso de venta
- **Fuente** de origen (cómo llegó al sistema)
- **Notas** o comentarios adicionales
- **Resumen de IA** (si aplica)

### 6.2 Vista de lista

Al entrar en **Leads**, verás una tabla con todos tus leads. Cada fila representa un lead y las columnas muestran:

| Columna | Descripción |
|---|---|
| **Name** | Nombre completo del lead |
| **Email** | Correo electrónico |
| **Phone** | Teléfono de contacto |
| **Status** | Estado actual (con etiqueta de color) |
| **Source** | Origen del lead |
| **Created** | Fecha de creación |
| **Actions** | Botón para eliminar |

Puedes **ordenar** la tabla haciendo clic en los encabezados de columna.

### 6.3 Cómo crear un lead nuevo

1. Haz clic en el botón **"+ Add Lead"** en la parte superior derecha
2. Se abrirá un formulario con los siguientes campos:

| Campo | Obligatorio | Descripción | Ejemplo |
|---|---|---|---|
| **Name** | ✅ Sí | Nombre completo del cliente | "María García López" |
| **Email** | ✅ Sí | Correo electrónico válido | "maria@ejemplo.com" |
| **Phone** | ❌ No | Teléfono con código de país | "+51999000111" |
| **Status** | ✅ Sí | Estado en el pipeline | "New" (nuevo) |
| **Source** | ✅ Sí | Cómo llegó el cliente | "Website", "WhatsApp", "Referral" |
| **Notes** | ❌ No | Notas internas o comentarios | "Busca casa en Miraflores, 3 hab" |

3. Completa los campos requeridos (mínimo: nombre y email)
4. Haz clic en el botón **"Add Lead"**
5. El lead aparecerá inmediatamente en la tabla

### 6.4 Cómo ver detalles de un lead

1. En la tabla de leads, haz clic en el **nombre** del lead
2. Se abrirá un panel lateral (drawer) desde la derecha
3. El panel muestra:
   - **Información de contacto**: email, teléfono, fecha de creación
   - **Estado actual**: etiqueta de estado y fuente de origen
   - **Propiedades de Interés**: propiedades vinculadas a este lead
   - **Documentos**: documentos asociados a este lead
   - **Notas**: cualquier comentario registrado
   - **Resumen de IA**: análisis generado automáticamente (si aplica)

### 6.5 Cómo editar un lead

1. Abre el lead (haz clic en su nombre)
2. En el panel lateral, haz clic en **"Edit Lead"**
3. El panel cambiará a modo edición. Modifica los campos que necesites
4. Opciones disponibles:
   - **Nombre**
   - **Email**
   - **Teléfono**
   - **Estado**: cambia el lead de etapa
   - **Fuente de origen**
   - **Notas**
5. Haz clic en **"Save Changes"** para guardar o **"Cancel"** para descartar

### 6.6 Cómo eliminar un lead

1. Abre el lead
2. En el panel lateral, haz clic en **"Delete Lead"**
3. Aparecerá una ventana de confirmación preguntando "Are you sure?"
4. Haz clic en **"Delete"** para confirmar o **"Cancel"** para volver atrás
5. Una vez eliminado, el lead desaparece permanentemente del sistema

> **Importante**: La eliminación es permanente. No se puede recuperar un lead eliminado.

### 6.7 Pipeline Kanban (vista por etapas)

El sistema incluye una vista **Kanban** que organiza los leads en columnas según su estado:

| Columna | Significado | Acción sugerida |
|---|---|---|
| **New** | Lead recién ingresado, sin contacto | Contactar lo antes posible |
| **Contacted** | Se ha establecido contacto inicial | Programar seguimiento |
| **Qualified** | Cliente calificado con interés real | Enviar propuestas |
| **Negotiation** | En negociación activa | Cerrar acuerdo |
| **Closed Won** | Venta cerrada exitosamente | Dar seguimiento post-venta |
| **Closed Lost** | Venta perdida | Archivar para referencia futura |

**Cómo usar el Kanban:**

1. En la página de Leads, haz clic en el botón **"Kanban"** (junto al campo de búsqueda)
2. Los leads se organizarán en columnas verticales por estado
3. Para cambiar el estado de un lead:
   - **Arrástralo** con el mouse desde una columna a otra
   - O haz clic en el lead, luego en **"Edit Lead"** y cambia su estado manualmente
4. Para volver a la vista de tabla, haz clic en **"List"**

### 6.8 Vincular propiedades a un lead

Puedes asociar propiedades específicas a un lead para hacer seguimiento de su interés:

1. Abre el lead (haz clic en su nombre)
2. En el panel lateral, busca la sección **"Propiedades de Interés"**
3. Haz clic en **"+ Agregar"**
4. Se abrirá un selector de propiedades. Busca la propiedad por nombre o examina la lista
5. Selecciona la propiedad deseada
6. Define el **nivel de interés**:

| Nivel | Cuándo usarlo |
|---|---|
| **Bajo** | El cliente mencionó la propiedad sin mucho entusiasmo |
| **Medio** | El cliente mostró interés pero pide más información |
| **Alto** | El cliente quiere visitar la propiedad o hacer una oferta |
| **Oferta** | El cliente ya hizo una oferta formal |

7. Haz clic en **"Link Property"**
8. La propiedad aparecerá en la lista con el nivel de interés asignado

**Para desvincular una propiedad:**
1. En la lista de propiedades vinculadas, busca la propiedad que deseas remover
2. Haz clic en el ícono de **papelera (🗑️)**
3. La propiedad se desvinculará del lead inmediatamente

### 6.9 Filtrar y buscar leads

**Búsqueda por texto:**
1. En el campo de búsqueda (ícono de lupa 🔍), escribe cualquier palabra
2. El sistema buscará en: nombre, email y notas del lead
3. La tabla se filtrará automáticamente mientras escribes

**Filtro por estado:**
1. Usa los botones de filtro rápido junto al campo de búsqueda
2. Puedes seleccionar: **All**, **New**, **Contacted**, **Qualified**, **Negotiation**, etc.
3. Solo se mostrarán los leads que coincidan con el estado seleccionado

---

## 7. Gestión de Propiedades

### 7.1 Lista de propiedades

En **Properties** verás el catálogo completo de inmuebles registrados. Cada propiedad muestra:

| Columna | Descripción | Ejemplo |
|---|---|---|
| **Title** | Nombre o título de la propiedad | "Casa en Miraflores" |
| **Price** | Precio en dólares | "$250,000" |
| **Type** | Tipo de inmueble | "House" |
| **Status** | Disponibilidad | "Available" |
| **City** | Ciudad donde se ubica | "Lima" |
| **Beds/Baths** | Habitaciones y baños | "3 / 2" |
| **Area** | Área en pies cuadrados | "1,500 sq ft" |
| **Created** | Fecha de registro | "2026-06-15" |

### 7.2 Tipos de propiedad disponibles

| Tipo | Descripción |
|---|---|
| **House** | Casa independiente |
| **Apartment** | Departamento en edificio |
| **Land** | Terreno sin construir |
| **Commercial** | Local comercial u oficina |

### 7.3 Estados de propiedad

| Estado | Significado |
|---|---|
| **Available** | Disponible para venta o alquiler |
| **Sold** | Vendida |
| **Rented** | Alquilada |
| **Under Construction** | En construcción o proyecto |

### 7.4 Cómo crear una propiedad

1. Haz clic en **"+ Add Property"**
2. Completa el formulario:

| Campo | Obligatorio | Descripción |
|---|---|---|
| **Title** | ✅ Sí | Nombre descriptivo de la propiedad |
| **Price** | ✅ Sí | Precio en dólares (solo números) |
| **Type** | ✅ Sí | House, Apartment, Land o Commercial |
| **Status** | ❌ No | Por defecto: "Available" |
| **Bedrooms** | ❌ No | Número de habitaciones |
| **Bathrooms** | ❌ No | Número de baños |
| **Area (sq ft)** | ❌ No | Área en pies cuadrados |
| **Address** | ❌ No | Dirección completa |
| **City** | ❌ No | Ciudad |
| **State** | ❌ No | Departamento o provincia |
| **Description** | ❌ No | Descripción detallada |
| **Notes** | ❌ No | Notas internas |

3. Haz clic en **"Add Property"**
4. La nueva propiedad aparecerá en el catálogo

### 7.5 Cómo ver el detalle de una propiedad

Al hacer clic en el **título** de una propiedad, se abrirá un panel lateral con:

- **Información completa**: todos los datos de la propiedad
- **Leads vinculados**: leads que han mostrado interés en esta propiedad
- **Portafolios**: portafolios a los que pertenece esta propiedad

### 7.6 Cómo editar una propiedad

1. Abre la propiedad haciendo clic en su título
2. En el panel lateral, haz clic en **"Edit"**
3. Modifica los campos necesarios
4. Haz clic en **"Save Changes"**

### 7.7 Cómo eliminar una propiedad

1. Abre la propiedad
2. Haz clic en **"Delete"**
3. Confirma la eliminación en la ventana emergente

### 7.8 Importar propiedades desde Excel

Puedes cargar múltiples propiedades a la vez usando un archivo Excel (.xlsx):

**Preparar el archivo Excel:**

El sistema reconoce las columnas por su nombre. Puedes usar los nombres exactos o con emojis:

| Columna requerida | Acepta también |
|---|---|
| `Título` | `🏷️ Título`, `Title`, `Nombre` |
| `Precio` | `💰 Precio`, `Price` |
| `Tipo` | `🏠 Tipo`, `Type` |
| `Estado` | `Status` |
| `Dirección` | `Address`, `Dirección` |
| `Ciudad` | `City` |

**Ejemplo de fila en Excel:**

| Título | Precio | Tipo | Estado | Dirección | Ciudad |
|---|---|---|---|---|---|
| Casa en Miraflores | 250000 | House | Available | Av. Larco 123 | Lima |
| Depto en San Isidro | 180000 | Apartment | Available | Calle Los Olivos 456 | Lima |

**Pasos para importar:**

1. En la página **Properties**, haz clic en **"Import Excel"**
2. Selecciona el archivo `.xlsx` desde tu computadora
3. El sistema procesará el archivo y:
   - Detectará automáticamente las columnas
   - Creará todas las propiedades encontradas
   - Ignorará filas con datos inválidos
4. Verás un mensaje de confirmación con la cantidad de propiedades importadas
5. Las nuevas propiedades aparecerán en la lista

> **Nota**: El archivo debe ser `.xlsx` (Excel moderno). No se soportan archivos `.xls` (Excel antiguo) ni `.csv`.

### 7.9 Filtrar propiedades

Usa el campo de búsqueda para filtrar propiedades por:
- **Título**
- **Descripción**
- **Ciudad**
- **Dirección**

---

## 8. Portafolios de Propiedades

### 8.1 ¿Qué es un portafolio?

Un **portafolio** es una agrupación de propiedades bajo un mismo tema o categoría. Sirve para organizar tu inventario de forma lógica.

**Ejemplos de portafolios:**

| Nombre del portafolio | Propiedades que contiene |
|---|---|
| "Catálogo 2025" | Todas las propiedades adquiridas durante 2025 |
| "Casas Premium" | Casas de lujo con precio superior a $500,000 |
| "Inversiones" | Propiedades para alquiler con alta rentabilidad |
| "Proyecto Costa Verde" | Propiedades en desarrollo en la Costa Verde |

Cada portafolio tiene:
- **Nombre**
- **Descripción** (opcional)
- **Año** (opcional, para clasificación temporal)
- **Tipo** (Standard, Premium, Investment, etc.)
- **Estado** (Active o Inactive)
- **Lista de propiedades** que lo componen

### 8.2 Cómo crear un portafolio

1. Ve a la sección **Portfolio** en la barra lateral
2. Haz clic en el botón **"+ New Portfolio"**
3. Completa el formulario:

| Campo | Obligatorio | Descripción |
|---|---|---|
| **Name** | ✅ Sí | Nombre del portafolio (ej. "Catálogo 2025") |
| **Description** | ❌ No | Breve descripción del portafolio |
| **Year** | ❌ No | Año de referencia (ej. 2025) |
| **Type** | ✅ Sí | Standard, Premium, Investment, etc. |
| **Status** | ✅ Sí | Active o Inactive |

4. Haz clic en **"Create Portfolio"**
5. El portafolio aparecerá en la lista

### 8.3 Cómo ver el detalle de un portafolio

1. En la lista de portafolios, haz clic en el **nombre** del portafolio
2. Verás una página de detalle con:
   - Información del portafolio (nombre, año, tipo, estado)
   - Lista de propiedades vinculadas
   - Botón para agregar más propiedades

### 8.4 Cómo agregar propiedades a un portafolio

1. Abre el portafolio
2. Haz clic en **"+ Add Properties"**
3. Se abrirá un selector con todas las propiedades disponibles
4. Puedes:
   - **Seleccionar una por una**: marca las propiedades deseadas
   - **Buscar**: escribe en el campo de búsqueda para filtrar
5. Haz clic en **"Add Selected"** o confirmar
6. Las propiedades seleccionadas aparecerán en la lista del portafolio

### 8.5 Cómo quitar propiedades de un portafolio

1. Abre el portafolio
2. En la lista de propiedades, busca la que deseas remover
3. Haz clic en el ícono de **papelera (🗑️)**
4. La propiedad se desvinculará del portafolio (la propiedad original no se elimina)

### 8.6 Editar y eliminar portafolios

- Para **editar**: abre el portafolio, haz clic en "Edit", modifica, guarda
- Para **eliminar**: abre el portafolio, haz clic en "Delete", confirma

> **Nota**: Eliminar un portafolio no elimina las propiedades que contiene. Solo se rompe la agrupación.

---

## 9. Calendario y Eventos

### 9.1 Vista general

El calendario muestra una cuadrícula mensual con todos tus eventos programados. Cada día puede contener múltiples eventos.

### 9.2 Tipos de eventos y colores

Cada evento tiene un color según su tipo para identificación rápida:

| Tipo de evento | ¿Para qué usarlo? | Color |
|---|---|---|
| **Call** (Llamada) | Llamada telefónica con un cliente | 🔵 Azul |
| **Meeting** (Reunión) | Reunión presencial o virtual | 🟣 Púrpura |
| **Showing** (Visita) | Visita a una propiedad con un cliente | 🟢 Verde |
| **Task** (Tarea) | Tarea pendiente (ej. "Enviar documentos") | 🟠 Ámbar |
| **Other** (Otro) | Cualquier otro tipo de evento | ⚪ Gris |

### 9.3 Cómo navegar el calendario

- **Mes anterior**: Haz clic en la flecha izquierda (◀)
- **Mes siguiente**: Haz clic en la flecha derecha (▶)
- **Volver al mes actual**: Haz clic en el botón **"Today"**

En la parte superior verás el mes y año actual, ej. "July 2026".

### 9.4 Cómo crear un evento

1. Haz clic en cualquier **día** del calendario
2. Se abrirá un formulario con los siguientes campos:

| Campo | Obligatorio | Descripción |
|---|---|---|
| **Title** | ✅ Sí | Nombre o título del evento |
| **Time** | ❌ No | Hora del evento (formato 24h, ej. "14:30") |
| **Type** | ✅ Sí | Tipo de evento (Call, Meeting, Showing, Task, Other) |
| **Notes** | ❌ No | Notas o detalles adicionales |

3. Completa los campos requeridos
4. Haz clic en **"Add Event"**
5. El evento aparecerá en el día seleccionado

**Ejemplo práctico:**
> Creas un evento "Visita a Casa Miraflores" para el 15 de julio a las 10:00, tipo "Showing". El evento aparecerá verde en el calendario.

### 9.5 Cómo eliminar un evento

1. En el calendario, busca el día que contiene el evento
2. Pasa el mouse sobre el evento que deseas eliminar
3. Aparecerá un pequeño botón rojo con un ícono de **papelera (🗑️)** en la esquina superior derecha del evento
4. Haz clic en ese botón
5. El evento se eliminará inmediatamente

### 9.6 Sincronizar con Apple Calendar (WebCal)

Puedes ver tus eventos del CRM directamente en el calendario de tu iPhone, iPad o Mac.

**¿Qué es WebCal?**
WebCal es un estándar que permite suscribirte a un calendario en línea. Una vez configurado, tu iPhone o Mac actualizará automáticamente los eventos del CRM sin que tengas que hacer nada.

**Cómo configurarlo:**

**Paso 1 — Obtener el enlace de sincronización:**
1. En la página **Calendar**, haz clic en el botón **"WebCal"** (junto al botón "Today")
2. El sistema copiará automáticamente un enlace al portapapeles
3. Verás un mensaje "✅ WebCal link copied"

**Paso 2 — En iPhone o iPad:**
1. Abre **Settings** (Configuración)
2. Toca **Calendar** (Calendario)
3. Toca **Accounts** (Cuentas)
4. Toca **Add Account** (Agregar cuenta)
5. Toca **Other** (Otro)
6. Toca **Add Subscribed Calendar** (Agregar calendario suscrito)
7. Pega el enlace que copiaste
8. Toca **Next** (Siguiente)
9. Opcional: activa **Remove Alarms** si no quieres notificaciones duplicadas
10. Toca **Save** (Guardar)
11. Los eventos del CRM aparecerán en tu calendario

**Paso 2 — En Mac:**
1. Abre la app **Calendar** (Calendario)
2. En el menú superior, haz clic en **File** → **New Calendar Subscription**
3. Pega el enlace que copiaste
4. Haz clic en **Subscribe**
5. En las opciones, elige:
   - **Auto-refresh**: Every hour (para mantenerlo actualizado)
   - **Remove Alarms**: si lo prefieres
6. Haz clic en **OK**
7. Los eventos del CRM aparecerán en tu calendario

**¿Cada cuánto se sincroniza?**
- iPhone/iPad: Cada vez que abre la app Calendar
- Mac: Cada hora (configurable)

**Si dejas de querer la sincronización:**
1. iPhone: Settings → Calendar → Accounts → Calendario suscrito → Delete Account
2. Mac: Calendar → haz clic derecho en el calendario → Unsubscribe

---

## 10. Documentos

### 10.1 ¿Qué son los documentos?

Los documentos son registros de información que puedes asociar a leads, propiedades o portafolios. Cada documento contiene:

| Campo | Descripción |
|---|---|
| **Name** | Nombre del documento (ej. "Ficha técnica - Casa Miraflores") |
| **Type** | Tipo de archivo (PDF, Image, Doc, Spreadsheet, Other) |
| **Linked To** | Entidad a la que está vinculado (Lead, Property o Portfolio) |
| **Description** | Breve descripción del contenido |
| **Notes** | Notas internas adicionales |
| **Created** | Fecha de creación del registro |

### 10.2 Tipos de documento

| Tipo | Ícono | Ejemplos de uso |
|---|---|---|
| **PDF** | 📄 | Contratos, fichas técnicas, informes |
| **Image** | 🖼️ | Fotos de propiedades, capturas de pantalla |
| **Doc** | 📝 | Cartas, propuestas comerciales, informes en Word |
| **Spreadsheet** | 📊 | Tablas de precios, comparativos, presupuestos |
| **Other** | 📁 | Cualquier otro tipo de archivo |

### 10.3 Cómo agregar un documento

**Método 1 — Desde la página Documents:**

1. Ve a **Documents** en la barra lateral
2. Haz clic en **"+ Add Document"**
3. Completa el formulario:

| Campo | Obligatorio | Descripción |
|---|---|---|
| **Name** | ✅ Sí | Nombre descriptivo del documento |
| **Type** | ✅ Sí | PDF, Image, Doc, Spreadsheet u Other |
| **Linked To** | ✅ Sí | Tipo de entidad: Property, Lead o Portfolio |
| **Entity ID** | ✅ Sí | ID de la entidad (lo encuentras en la URL o en el detalle) |
| **Description** | ❌ No | Descripción breve del contenido |
| **Notes** | ❌ No | Notas internas adicionales |

4. Haz clic en **"Add Document"**
5. El documento aparecerá en la tabla

> **¿Dónde encuentro el Entity ID?**
> - **Lead**: abre el lead, el ID está al final de la URL: `/dashboard/leads?selected=**a1b2c3...**`
> - **Property**: similar, en la URL al abrir la propiedad
> - **Portfolio**: al abrir el portafolio, en la URL

**Método 2 — Desde el panel de un Lead (recomendado):**

1. Ve a **Leads** y abre un lead (haz clic en su nombre)
2. En el panel lateral, busca la sección **"Documents"**
3. Haz clic en **"+ Add"**
4. Verás que los campos **Linked To** y **Entity ID** ya están prellenados con los datos del lead
5. Solo completa: **Name**, **Type**, **Description** y **Notes**
6. Haz clic en **"Add Document"**
7. El documento se vinculará automáticamente al lead

### 10.4 Cómo buscar y filtrar documentos

**Búsqueda por texto:**
- Usa el campo de búsqueda (🔍) para encontrar documentos por nombre, descripción o notas

**Filtro por tipo de entidad:**
1. Usa el selector desplegable junto al campo de búsqueda
2. Opciones: **All Types** (todos), **Properties**, **Leads**, **Portfolios**
3. El sistema mostrará solo los documentos del tipo seleccionado

### 10.5 Cómo eliminar un documento

1. En la tabla de documentos, localiza el documento que deseas eliminar
2. Haz clic en el ícono de **papelera (🗑️)** en la columna de acciones
3. El documento se eliminará inmediatamente

> **Importante**: Eliminar un documento no afecta al lead, propiedad o portafolio al que estaba vinculado.

---

## 11. Integración con WhatsApp

### 11.1 ¿Qué hace esta integración?

Cuando un cliente te escribe por WhatsApp, el sistema **automatiza** la atención de la siguiente manera:

1. **Recibe** el mensaje de WhatsApp automáticamente
2. **Analiza** el mensaje usando inteligencia artificial (Gemini de Google)
3. **Extrae** los datos del cliente automáticamente
4. **Crea** un lead en el CRM sin intervención manual
5. **Responde** al cliente confirmando que recibió su información

### 11.2 Datos que la IA extrae automáticamente

Cuando un cliente escribe, por ejemplo:

> "Hola, busco un departamento de 3 habitaciones en San Isidro, mi presupuesto es de 250k. Soy Juan Pérez, mi correo es juan@email.com"

La IA extraerá:

| Campo | Valor extraído |
|---|---|
| **Nombre** | Juan Pérez |
| **Email** | juan@email.com |
| **Teléfono** | (el número de WhatsApp del cliente) |
| **Presupuesto** | $250,000 |
| **Tipo de propiedad** | Apartment (departamento) |
| **Ubicación** | San Isidro |
| **Habitaciones** | 3 |
| **Notas** | Mensaje original completo |

### 11.3 Cómo se crea el lead

El lead se crea automáticamente con:

- **Nombre**: Extraído por la IA, o "WhatsApp Lead" si no se pudo detectar
- **Email**: Extraído por la IA, o un email genérico si no se proporcionó
- **Teléfono**: El número de WhatsApp del cliente
- **Fuente**: "WhatsApp"
- **Estado**: "New"
- **Notas**: Contiene toda la información extraída más el mensaje original

### 11.4 ¿Dónde ver los leads de WhatsApp?

1. Ve a la sección **Leads**
2. Busca los leads con **Source = "WhatsApp"** (columna Source)
3. Abre el lead para ver todos los detalles extraídos en la sección de **Notes**

### 11.5 Respuesta automática al cliente

Cuando la IA procesa el mensaje, envía automáticamente una respuesta al cliente similar a:

> "¡Gracias por tu mensaje, Juan! Hemos recibido tu información correctamente. Estamos buscando las mejores opciones de departamentos en San Isidro con 3 habitaciones dentro de tu presupuesto. Un asesor se comunicará contigo pronto. ¡Saludos! 🏠"

### 11.6 Requisitos técnicos (para el administrador)

Para que la integración funcione, el administrador debe:

1. **Obtener una API Key de Gemini**: Ir a [Google AI Studio](https://aistudio.google.com) → Obtener API Key gratuita
2. **Configurar Twilio WhatsApp**: 
   - Crear una cuenta en [Twilio](https://www.twilio.com)
   - Activar el Sandbox de WhatsApp
   - Configurar el webhook entrante hacia:
     ```
     https://real-estate-crm-ten-rosy.vercel.app/api/webhooks/twilio
     ```
3. **Agregar la API Key** como variable de entorno en la plataforma de hosting

### 11.7 Limitaciones actuales

- La IA funciona mejor con mensajes en español claros y directos
- Si el cliente no proporciona nombre o email, se usan valores genéricos
- La respuesta automática es genérica — no responde preguntas específicas sobre propiedades
- Se requiere que el webhook de Twilio esté correctamente configurado

---

## 12. Solución de Problemas

### 12.1 No puedo iniciar sesión

| Posible causa | Solución |
|---|---|
| Contraseña incorrecta | Usa la opción "Forgot password" para restablecerla |
| Cuenta no activada | Revisa tu correo electrónico (incluyendo Spam) para el enlace de activación |
| Cuenta bloqueada | Contacta al administrador para verificar tu estado |
| Error del navegador | Limpia la caché: Chrome → Configuración → Privacidad → Borrar datos de navegación |

### 12.2 No veo datos en el Dashboard

- **Causa probable**: Es la primera vez que ingresas y aún no hay datos registrados
- **Solución**: Comienza agregando algunos leads y propiedades. El Dashboard se poblará automáticamente.

### 12.3 La importación de Excel falla

| Problema | Solución |
|---|---|
| Archivo no se selecciona | Asegúrate de que sea `.xlsx` (no `.xls` ni `.csv`) |
| Columnas no reconocidas | Verifica que los encabezados coincidan con los nombres soportados (ver sección 7.8) |
| Precios no se importan | Asegúrate de que la columna Precio contenga solo números (sin símbolos como $ o ,) |
| Algunas filas se saltan | Revisa que todas las filas tengan al menos Título y Precio |

### 12.4 El botón WebCal no copia el enlace

- **En computadora**: Asegúrate de que el navegador tenga permiso para acceder al portapapeles
- **En iPhone/Safari**: Safari no siempre permite copiar automáticamente. Intenta en Chrome para iOS

### 12.5 Los eventos del calendario no aparecen en mi iPhone

1. Verifica que el enlace WebCal esté correctamente copiado (no debe tener espacios al inicio o final)
2. Asegúrate de haber seguido los pasos exactos de la [sección 9.6](#96-sincronizar-con-apple-calendar-webcal)
3. La sincronización no es inmediata — puede tomar hasta unos minutos
4. Si el problema persiste, elimina la suscripción y vuelve a crearla

### 12.6 No llegan leads de WhatsApp

| Posible causa | Solución |
|---|---|
| Webhook no configurado en Twilio | El administrador debe configurar la URL del webhook en Twilio |
| API Key de Gemini no configurada | El administrador debe agregar `GEMINI_API_KEY` en las variables de entorno |
| Número de WhatsApp no verificado | Verifica que el Sandbox de Twilio esté activo |
| El mensaje no fue procesado | Los mensajes muy cortos ("Hola", "Gracias") pueden no generar un lead |

### 12.7 La página se ve mal en mi celular

- **Solución**: Asegúrate de tener la última versión de tu navegador
- La interfaz se adapta automáticamente al tamaño de pantalla, pero funciona mejor en tablets y computadoras

---

## 13. Glosario de Términos

| Término | Definición |
|---|---|
| **Lead** | Cliente potencial que ha mostrado interés en una propiedad |
| **Pipeline** | Proceso de ventas organizado en etapas (New → Contacted → Qualified → Negotiation → Closed) |
| **Kanban** | Método visual de organización donde las tareas se mueven entre columnas por estado |
| **Portafolio** | Agrupación de propiedades bajo un mismo tema o categoría |
| **WebCal** | Estándar de sincronización de calendarios basado en web (.ics) |
| **Webhook** | Mecanismo que envía datos automáticamente de un sistema a otro cuando ocurre un evento |
| **Gemini** | Modelo de inteligencia artificial de Google utilizado para analizar mensajes |
| **Twilio** | Plataforma de comunicaciones que conecta WhatsApp con el sistema |
| **KPI** | Indicador clave de rendimiento (ej. número de leads, valor de propiedades) |
| **Entity ID** | Identificador único de un lead, propiedad o portafolio en el sistema |
| **RLS** | Row-Level Security — sistema que asegura que cada usuario ve solo sus propios datos |
| **CRUD** | Crear, Leer, Actualizar, Eliminar — las cuatro operaciones básicas de datos |

---

## 14. Soporte y Contacto

### Reportar problemas

Si encuentras algún error o comportamiento inesperado, comunícate con el administrador del sistema proporcionando:

1. **Descripción del problema**: ¿Qué estabas haciendo?
2. **Pantallazo** (si es posible): Una imagen de lo que ves
3. **URL exacta**: La dirección de la página donde ocurre el problema
4. **Navegador y dispositivo**: Ej. "Chrome 120 en Windows 11" o "Safari en iPhone 15"

### Solicitar nuevas funciones

Si necesitas una funcionalidad que el sistema no tiene actualmente, el administrador evaluará la solicitud y te informará si es posible agregarla.

### Disponibilidad del sistema

El sistema está alojado en la nube y tiene una disponibilidad objetivo del 99.9% (salvo mantenimientos programados).

---

> **Fin del manual**  
> *Documento generado el 02 de julio de 2026*  
> *RF Realty CRM — Versión 1.0*

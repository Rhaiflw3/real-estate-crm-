# Manual de Usuario — Real Estate CRM

> **Versión:** 1.0  
> **Propósito:** Gestión de leads, propiedades, portafolios, calendario y documentos para agentes inmobiliarios.

---

## Índice

1. [Introducción](#1-introducción)
2. [Inicio de Sesión](#2-inicio-de-sesión)
3. [Dashboard](#3-dashboard)
4. [Leads](#4-leads)
5. [Propiedades](#5-propiedades)
6. [Portafolios](#6-portafolios)
7. [Calendario](#7-calendario)
8. [Documentos](#8-documentos)
9. [Integración WhatsApp](#9-integración-whatsapp)
10. [Preguntas Frecuentes](#10-preguntas-frecuentes)

---

## 1. Introducción

El CRM Inmobiliario es una plataforma web para gestionar:

- **Leads** — Clientes potenciales con su información de contacto y propiedades de interés
- **Propiedades** — Catálogo de inmuebles con precios, fotos y detalles
- **Portafolios** — Agrupaciones de propiedades (por año, tipo, etc.)
- **Calendario** — Eventos, llamadas, reuniones y visitas
- **Documentos** — Archivos vinculados a leads, propiedades o portafolios
- **Dashboard** — Resumen visual del estado del negocio

### Requisitos técnicos

- Navegador moderno (Chrome, Edge, Safari, Firefox)
- Conexión a internet
- Resolución recomendada: 1024px o superior

---

## 2. Inicio de Sesión

### Acceder al sistema

1. Abre `https://real-estate-crm-ten-rosy.vercel.app` en tu navegador
2. Ingresa tu **correo electrónico** y **contraseña**
3. Haz clic en **"Sign in"**

![Login](https://via.placeholder.com/400x300?text=Pantalla+de+Login)

### Recuperar contraseña

En la pantalla de login, haz clic en **"Forgot password"** (si está disponible) o contacta al administrador para restablecer tu contraseña desde el panel de Supabase.

### Cerrar sesión

Haz clic en tu avatar o nombre en la barra superior y selecciona **"Sign out"**.

---

## 3. Dashboard

Al iniciar sesión, verás el panel principal con:

| Componente | Descripción |
|---|---|
| **Tarjetas de resumen** | Total leads, propiedades, portafolios, eventos |
| **Gráfico de leads** | Leads creados por mes (barras) |
| **Gráfico de propiedades** | Propiedades por tipo (doughnut) |
| **Insights rápidos** | Lead más reciente, propiedad más cara, total de portafolios |

![Dashboard](https://via.placeholder.com/800x400?text=Dashboard)

### Navegación

Usa la barra lateral izquierda para moverte entre secciones:

- 📊 **Dashboard**
- 👥 **Leads**
- 🏠 **Properties**
- 📁 **Portfolio**
- 📅 **Calendar**
- 📄 **Documents**

---

## 4. Leads

### Lista de leads

En **Leads** verás una tabla con todos los clientes potenciales:

- Nombre
- Email
- Teléfono
- Estado (New, Contacted, Qualified, Negotiation, Closed Won, Closed Lost)
- Fuente (Website, WhatsApp, Referral, etc.)
- Fecha de creación

### Crear un lead

1. Haz clic en **"+ Add Lead"**
2. Completa:
   - **Name** (obligatorio)
   - **Email** (obligatorio)
   - **Phone** (opcional)
   - **Status** (por defecto "New")
   - **Source** (por defecto "Website")
   - **Notes** (opcional)
3. Haz clic en **"Add Lead"**

### Editar un lead

1. Haz clic en el nombre del lead para abrir el panel lateral
2. Haz clic en **"Edit Lead"**
3. Modifica los campos necesarios
4. Haz clic en **"Save Changes"**

### Pipeline Kanban

En la vista de leads, cambia a la vista **"Kanban"** para ver los leads organizados por columna de estado:

| Columna | Acción |
|---|---|
| New | Leads recién ingresados |
| Contacted | Se ha contactado al cliente |
| Qualified | Cliente calificado con interés real |
| Negotiation | En negociación |
| Closed Won | Venta cerrada exitosamente |
| Closed Lost | Venta perdida |

Arrastra y suelta leads entre columnas para cambiar su estado.

### Vincular propiedades a un lead

1. Abre el lead desde la lista
2. En la sección **"Propiedades de Interés"**, haz clic en **"+ Agregar"**
3. Busca y selecciona una propiedad
4. Define el nivel de interés: Bajo, Medio, Alto u Oferta

### Filtrar leads

Usa el campo de búsqueda para filtrar por nombre, email o notas. También puedes filtrar por estado usando los botones de filtro rápido.

---

## 5. Propiedades

### Lista de propiedades

En **Properties** verás todas las propiedades registradas con:

- Título
- Precio
- Tipo (House, Apartment, Land, Commercial)
- Estado (Available, Sold, Rented, Under Construction)
- Ciudad
- Habitaciones / Baños

### Crear una propiedad

1. Haz clic en **"+ Add Property"**
2. Completa los campos obligatorios (título, precio, tipo)
3. Opcionalmente agrega dirección, ciudad, habitaciones, baños, área, notas
4. Haz clic en **"Add Property"**

### Importar propiedades desde Excel

1. Haz clic en **"Import Excel"**
2. Selecciona un archivo `.xlsx` con las columnas:
   - `Título`, `Precio`, `Tipo`, `Estado`, `Dirección`, `Ciudad`
   - Puedes usar emojis en los encabezados (ej. `🏷️ Título`)
3. El sistema detecta automáticamente las columnas y crea las propiedades

### Ver propiedades de un portafolio

Desde **Portfolio**, haz clic en un portafolio para ver sus propiedades vinculadas.

---

## 6. Portafolios

### ¿Qué es un portafolio?

Un portafolio agrupa propiedades bajo una misma categoría. Ejemplos:
- "Propiedades 2025"
- "Casas Premium"
- "Inversiones Comerciales"

### Crear un portafolio

1. Ve a **Portfolio**
2. Haz clic en **"+ New Portfolio"**
3. Ingresa nombre, descripción, año y tipo
4. Haz clic en **"Create Portfolio"**

### Vincular propiedades

1. Abre un portafolio
2. Haz clic en **"+ Add Properties"**
3. Selecciona las propiedades que deseas incluir
4. Las propiedades aparecerán en la lista del portafolio

---

## 7. Calendario

### Vista mensual

En **Calendar** verás un calendario mensual con los eventos registrados.

Los eventos se muestran con colores según su tipo:

| Tipo | Color |
|---|---|
| Call (Llamada) | 🔵 Azul |
| Meeting (Reunión) | 🟣 Púrpura |
| Showing (Visita) | 🟢 Verde |
| Task (Tarea) | 🟠 Ámbar |
| Other (Otro) | ⚪ Gris |

### Agregar un evento

1. Haz clic en cualquier día del calendario
2. Completa:
   - **Title** (obligatorio)
   - **Time** (opcional)
   - **Type** (Call, Meeting, Showing, Task, Other)
   - **Notes** (opcional)
3. Haz clic en **"Add Event"**

### Eliminar un evento

Pasa el mouse sobre un evento en el calendario y haz clic en el ícono 🗑️ que aparece.

### Sincronizar con Apple Calendar (WebCal)

1. En la página de Calendar, haz clic en el botón **"WebCal"**
2. Se copiará un enlace al portapapeles
3. En tu iPhone o Mac:
   - **iPhone:** Settings → Calendar → Accounts → Add Account → Other → Add Subscribed Calendar
   - **Mac:** Calendar → File → New Calendar Subscription
4. Pega el enlace copiado
5. El calendario se sincronizará automáticamente

---

## 8. Documentos

### ¿Qué son los documentos?

Los documentos son registros de archivos vinculados a leads, propiedades o portafolios. Actualmente almacenan metadatos (nombre, tipo, descripción, notas) y pueden incluir un enlace al archivo.

### Tipos de documento

- 📄 PDF
- 🖼️ Image
- 📝 Doc
- 📊 Spreadsheet
- 📁 Other

### Agregar un documento

**Desde la página Documents:**
1. Haz clic en **"+ Add Document"**
2. Completa:
   - **Name** (obligatorio)
   - **Type** (PDF, Image, etc.)
   - **Linked To** (Property, Lead, o Portfolio)
   - **Entity ID** (ID de la propiedad/lead/portafolio)
   - **Description** (opcional)
   - **Notes** (opcional)
3. Haz clic en **"Add Document"**

**Desde un Lead (panel lateral):**
1. Abre un lead
2. En la sección **Documents**, haz clic en **"+ Add"**
3. El tipo de entidad y ID se llenan automáticamente
4. Completa los datos y guarda

### Filtrar documentos

Usa el filtro **"All Types"** para ver solo documentos de Properties, Leads o Portfolios. También puedes buscar por nombre usando el campo de búsqueda.

---

## 9. Integración WhatsApp

### ¿Cómo funciona?

Cuando un cliente te escribe por WhatsApp, el sistema:

1. Recibe el mensaje automáticamente
2. La IA (Gemini) extrae la información del cliente:
   - Nombre
   - Email
   - Teléfono
   - Presupuesto
   - Tipo de propiedad
   - Ubicación deseada
   - Número de habitaciones
3. Se crea un **Lead** automáticamente en el sistema
4. Se envía una respuesta automática al cliente confirmando que recibimos su información

### Configuración (para el administrador)

1. Obtén una API Key gratis en [Google AI Studio](https://aistudio.google.com)
2. Agrégala como `GEMINI_API_KEY` en las variables de entorno de Vercel
3. Configura el webhook de Twilio WhatsApp hacia:
   `https://real-estate-crm-ten-rosy.vercel.app/api/webhooks/twilio`

### Ver leads de WhatsApp

Los leads creados por WhatsApp aparecen en la sección **Leads** con fuente "WhatsApp". La nota del lead contiene los detalles extraídos por la IA.

---

## 10. Preguntas Frecuentes

**¿Puedo tener varios usuarios?**
Sí. El administrador puede invitar usuarios desde el panel de Supabase. El registro público no está disponible.

**¿Los datos están seguros?**
Sí. Los datos se almacenan en Supabase (PostgreSQL) con autenticación mediante Supabase Auth. Cada usuario ve solo sus propios datos.

**¿Puedo usar el CRM en el celular?**
Sí, el sitio es responsive y funciona en navegadores móviles. Para una experiencia óptima, agrega la página a la pantalla de inicio de tu iPhone/Android.

**¿Cómo exportar mis datos?**
Actualmente no hay exportación automática. Contacta al administrador para una exportación manual.

**¿El calendario se sincroniza con mi Google Calendar?**
No directamente. Usa la suscripción WebCal para Apple Calendar, o configura manualmente los eventos. La sincronización bidireccional con Google Calendar está en planes futuros.

**¿Se pueden subir archivos?**
Actualmente los documentos almacenan metadatos. La funcionalidad de subida de archivos está en desarrollo.

---

*Documento generado el 02/07/2026*

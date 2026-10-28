# 🎃 ADORA — Web de Catálogo & Votación de Halloween 2026

Aplicación web interactiva y moderna de votación para validar comercialmente los **49 ramos botánicos de alta costura** de **ADORA (Florería & Experiencias Botánicas)** para la campaña de Halloween 2026.

---

## 🌟 Características de la Aplicación

- **🎨 Diseño Temático Gothic Luxury & Spooky Chic:** Paleta oscura con partículas botánicas flotantes, tipografía editorial y ambientación refinada.
- **📱 49 Ramos en Formato Vertical 9:16:** Fotografías de estudio hiperrealistas con zoom interactivo y detalle botánico.
- **🎃 Sistema de Votación en Tiempo Real:** Los visitantes pueden votar por múltiples ramos favoritos con animación de reacción y persistencia local (`localStorage`).
- **🏆 Podio de Favoritos:** Muestra automáticamente el Top 3 más votado en el encabezado.
- **🔍 Filtros & Búsqueda Instantánea:**
  - Filtrado por categorías: *Halloween Tradicional*, *Gótico & Terror*, *Anime & Shonen*, *Pop & Gaming*, *Harry Potter*, *Retro & Dúos*.
  - Búsqueda en vivo por personaje, SKU o tipo de flor (ej. *Merlina*, *Gojo*, *Girasoles*).
  - Ordenación por votos, precio o nombre.
- **📲 Compartir Votos por WhatsApp:** Botón flotante que recopila los votos del usuario y genera un mensaje directo para WhatsApp con su selección de favoritos.
- **⚡ Cero Dependencias / Servidor:** Funciona al 100% abriendo directamente `index.html` en cualquier navegador o alojándolo gratis en la nube.

---

## 🚀 Cómo Probarla Localmente (Ahora Mismo)

Simplemente haz doble clic sobre el archivo:
```
C:\Users\LENOVO\Documents\Carlitos\Emprendimiento\Adora\adora-halloween-voting-app\index.html
```
Se abrirá instantáneamente en Google Chrome, Edge o tu navegador favorito con las 49 fotos cargadas y el sistema de votación activo.

---

## 🌐 Cómo Publicarla GRATIS en Internet (en menos de 2 minutos)

Tienes las siguientes opciones 100% gratuitas para compartir el enlace con tus amigos y en tus redes:

### Opción 1: Netlify Drop (La más rápida - 30 segundos, sin cuenta)
1. Entra en tu navegador a: **[app.netlify.com/drop](https://app.netlify.com/drop)**
2. Arrastra la carpeta entera `adora-halloween-voting-app` dentro del recuadro en pantalla.
3. ¡Listo! En 10 segundos Netlify te entregará un enlace público gratuito con HTTPS seguro (ejemplo: `https://adora-halloween-2026.netlify.app`).

### Opción 2: Vercel (Gratis con tu cuenta de GitHub)
1. Entra a **[vercel.com](https://vercel.com)**
2. Haz clic en **Add New Project** e importa tu repositorio o arrastra la carpeta.
3. Tendrás tu dominio personalizado gratis tipo: `https://adora-halloween.vercel.app`.

### Opción 3: GitHub Pages (Directo desde tu GitHub)
1. Crea un repositorio público en tu GitHub (ej. `adora-halloween-voting`).
2. Sube los archivos de la carpeta `adora-halloween-voting-app`.
3. Ve a **Settings** $\rightarrow$ **Pages** $\rightarrow$ en **Source** elige `Deploy from a branch` (rama `main`) y haz clic en **Save**.
4. En 1 minuto tu web estará disponible en: `https://carloscarbajallinan.github.io/adora-halloween-voting/`

---

## 📂 Estructura del Proyecto

```
adora-halloween-voting-app/
├── index.html           # Estructura semántica, accesibilidad y modales
├── styles.css           # Estilos temáticos Gothic Luxury, CSS Grid y animaciones
├── app.js               # Lógica interactiva de votación, filtros y enlace de WhatsApp
├── products-data.js     # Datos estructurados de los 49 ramos compatibles con file://
├── products.js          # Módulo ES6 exportable
├── products.json        # Catálogo maestro en JSON
├── README.md            # Guía de publicación y uso
└── images/              # Las 49 fotografías en formato vertical 9:16 nativo
    ├── 01_Gryffindor_El_Rugido_Escarlata.jpg
    ├── 06_Merlina_Addams_v2.jpg
    ├── 13_Deadpool.jpg
    ├── 31_Scream_Ghostface.jpg
    └── ... (49 imágenes totales)
```

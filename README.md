# PrototipMobile

A prototype of a mobile web interface with responsive design and a functional schedule system for an educational institution. The project focuses on compatibility with mobile devices and user-friendly navigation.

---

## Main Directories and Files

### `tunniplan/tunniplay.html`
- **Location:** `PrototipMobile/tunniplan/tunniplay.html`
- **Purpose:** Displays the class schedule.
- **Features:**
  - Responsive layout using Bootstrap.
  - Navigation menu with a dropdown list of classes (1A, 1B, ..., 12B).
  - Bootstrap CSS and icons are loaded via CDN.
  - Fully optimized for mobile devices.

---

### `www.hvg.ee/site2/et.html`
- **Location:** `PrototipMobile/www.hvg.ee/site2/et.html`
- **Purpose:** Main file that serves as the website's primary menu.
- **Features:**
  - Central navigation point of the site.
  - Contains main links to other sections.
  - Acts as the main entry point to the mobile interface.

---

## Technologies

- **HTML5** — Page markup.
- **CSS3** — Styling and layout (via `main.css`).
- **Bootstrap 5** — Responsive components and grid system.
- **JavaScript** — Basic interactivity.
- **CDNs** — External libraries and fonts (Bootstrap, jsDelivr, Google Fonts, etc.).

---

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/DanielDaineko/PrototipMobile.git
   ```

2. Open in your browser:

   - Main interface:
     ```
     www.hvg.ee/site2/et.html
     ```

   - Schedule view:
     ```
     tunniplan/tunniplay.html
     ```

---

## Additional Notes

- Mobile support is implemented via meta viewport tag and Bootstrap grid system.
- Icons are loaded from external SVGs and CDNs.
- The project is structured for further development, including logic, data loading, and API integration.

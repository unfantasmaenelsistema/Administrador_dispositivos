<div align="center">
  <a href="https://www.unfantasmaenelsistema.com/">
    <img src="public/assets/aistudio/icono_81a3db5b.png" alt="Logo Un Fantasma en el Sistema" width="96" height="96" />
  </a>

  # Administrador de dispositivos — Simulador `devmgmt.msc` (Windows 11)

  **Laboratorio interactivo educativo para prácticas de soporte técnico HelpDesk, diagnóstico de controladores y auditoría de firmas digitales.**

  [Visitar unfantasmaenelsistema.com](https://www.unfantasmaenelsistema.com/)
</div>

---

## Descripción general

Esta aplicación web replica fielmente la interfaz y el flujo de trabajo del **Administrador de dispositivos (`devmgmt.msc`) de Windows 11**, diseñada específicamente como entorno seguro de entrenamiento para estudiantes de **GhostAcademy** y ciclos formativos de sistemas microinformáticos, redes y ciberseguridad.

Permite diagnosticar fallos reales de hardware (**Códigos 10, 28 y 43**), inspeccionar identificadores **VEN/DEV** y **VID/PID**, detectar **controladores sin firma WHQL verificada**, revisar el registro cronológico de **Eventos PnP** y resolver incidencias reales guiadas mediante el panel lateral **HelpDesk Tickets**.

---

## Capturas reales de la aplicación

### 1. Vista principal (`devmgmt.msc` + Panel HelpDesk Tickets)
Árbol de hardware dinámico con categorías expandibles, superposición de triángulos amarillos de advertencia sobre los dispositivos afectados y panel lateral de misiones.

![Vista principal del Administrador de dispositivos](docs/screenshots/01-vista-principal.png)

### 2. Propiedades del dispositivo y alerta de firma digital sin verificar
Inspección de la GPU con **Código 43**, aviso visual de firma no verificada (`NVIDIA Beta Unsigned`) y botón funcional para **Revertir al controlador anterior**.

![Propiedades del controlador y alerta de firma WHQL](docs/screenshots/02-propiedades-controlador-firma.png)

### 3. Búsqueda e instalación de controladores mediante `VEN/DEV` y `VID/PID`
Asistente de **Actualizar controlador...** donde el estudiante pega el identificador copiado desde la pestaña **Detalles** (`USB\VID_072F&PID_2200`) para localizar e instalar el paquete compatible y resolver el **Código 28**.

![Buscador de controladores por identificador de hardware](docs/screenshots/03-actualizar-por-ven-dev.png)

### 4. Resolución completa de los 3 tickets de HelpDesk
Validación automática en tiempo real al solucionar las tres incidencias asignadas (**3/3 completados**).

![Panel HelpDesk con los tres tickets completados](docs/screenshots/04-tickets-completados.png)

---

## Características principales

- **Réplica visual de Windows 11 (`devmgmt.msc`)**:
  - Barra de título superior, barra de menú clásica funcional (`Archivo`, `Acción`, `Ver`, `Ayuda`), barra de herramientas con historial real (`Atrás`, `Adelante`, `Buscar cambios de hardware`, `Propiedades`) y buscador/filtro instantáneo.
  - Menú contextual con clic derecho sobre cualquier dispositivo del árbol (`Actualizar controlador`, `Deshabilitar/Habilitar`, `Desinstalar`, `Propiedades`).
- **Motor dinámico de hardware y códigos de error**:
  - **Código 43**: GPU `NVIDIA GeForce RTX 4070` con controlador beta sin verificar (`Revertir al controlador anterior` restaura la versión WHQL estable).
  - **Código 28**: Lector RFID USB sin controlador instalado (`Detalles → Identificadores de hardware` + `Actualizar controlador...` mediante `USB\VID_072F&PID_2200`).
  - **Código 10**: Adaptador `Intel(R) Wi-Fi 6E AX211 160MHz` con fallo de arranque (`Actualizar controlador...` con `PCI\VEN_8086&DEV_51F0`, desinstalación + reescaneo PnP o deshabilitación).
- **Auditoría de firmas digitales (WHQL)**:
  - Valida si el `driverSigner` coincide con `Microsoft Windows Hardware Compatibility Publisher`, mostrando una alerta de seguridad cuando un driver está sin firmar o modificado.
- **Opciones avanzadas de diagnóstico**:
  - Pestaña **Eventos** con registro cronológico en tiempo real de cada acción aplicada.
  - Filtro `Ver → Mostrar dispositivos ocultos` (revela dispositivos desconectados/fantasma) y `Ver → Solo dispositivos con problemas`.
  - Guía técnica integrada en `Ayuda → Guía de códigos (10, 28, 43) y VEN/DEV`.
  - Exportación de informe técnico completo en formato `.json` (`diagnostico-devmgmt.json`).

---

## Solucionario rápido para docentes

| Ticket | Incidencia simulada | Dispositivo objetivo | Código | Solución en el simulador |
| :--- | :--- | :--- | :---: | :--- |
| **Ticket 1** | Pantalla con baja resolución tras actualización | `NVIDIA GeForce RTX 4070` | `43` | Abrir Propiedades → *Controlador* → **Revertir al controlador anterior** |
| **Ticket 2** | Dispositivo USB desconocido al conectar lector RFID | `Dispositivo desconocido (Lector RFID)` | `28` | Copiar `USB\VID_072F&PID_2200` en *Detalles* → *Controlador* → **Actualizar controlador...** |
| **Ticket 3** | Fallo de arranque en tarjeta de red | `Intel(R) Wi-Fi 6E AX211 160MHz` | `10` | Actualizar con `PCI\VEN_8086&DEV_51F0`, desinstalar + *Buscar cambios de hardware*, o **Deshabilitar** |

---

## Estructura del proyecto

```text
├── .github/workflows/
│   └── deploy-pages.yml          # Despliegue automático en GitHub Pages
├── docs/screenshots/             # Capturas reales de la aplicación
├── public/assets/aistudio/       # Logo oficial de Un Fantasma en el Sistema
├── src/
│   ├── components/
│   │   ├── ContextMenu.tsx       # Menú contextual estilo Windows 11
│   │   ├── DevicePropertiesModal.tsx  # Modal (General, Controlador, Detalles, Eventos)
│   │   ├── HelpDeskPanel.tsx     # Panel lateral de misiones GhostAcademy
│   │   ├── HelpModal.tsx         # Guía técnica de códigos y diálogo Acerca de
│   │   └── UpdateDriverModal.tsx # Buscador de software por VEN/DEV y VID/PID
│   ├── data/
│   │   └── devices.ts            # Modelo de datos JSON, tickets y lógica de árbol
│   ├── App.tsx                   # Orquestador principal de devmgmt.msc
│   ├── index.css                 # Configuración Tailwind CSS v4 y scrollbars
│   └── main.tsx                  # Punto de entrada React + FontAwesome
├── index.html
├── package.json
└── vite.config.ts                # Configurado con base: './' para GitHub Pages
```

---

## Instalación y uso local

Requisitos: **Node.js 20+** y **npm**.

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/devmgmt-ghostacademy-simulador.git
cd devmgmt-ghostacademy-simulador

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

Para generar la versión estática lista para producción en `dist/`:

```bash
npm run build
```

---

## Despliegue en GitHub Pages

El proyecto está preconfigurado con `base: './'` en `vite.config.ts` e incluye el workflow `.github/workflows/deploy-pages.yml`:

1. Sube este repositorio a GitHub en la rama `main`.
2. Ve a **Settings → Pages** en tu repositorio de GitHub.
3. En **Source**, selecciona **GitHub Actions**.
4. Cada `push` a `main` compilará automáticamente la carpeta `dist/` y la publicará en tu URL de GitHub Pages.

---

<p align="center">
  Desarrollado para <a href="https://www.unfantasmaenelsistema.com/">Un Fantasma en el Sistema</a>
</p>

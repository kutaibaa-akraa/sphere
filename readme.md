
```markdown
# 🌌 3D Planetarium Project - Astronomical Sphere

An interactive 3D web-based planetarium that simulates the night sky with accurate astronomical calculations. Built with Three.js, this project allows users to explore stars, constellations, and planets from any location on Earth at any time.

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [File Descriptions](#file-descriptions)
- [Database Structure (skydb.js)](#database-structure-skydbjs)
  - [Stars Data](#stars-data)
  - [Star Names](#star-names)
  - [Constellation Names](#constellation-names)
  - [Constellation Lines](#constellation-lines)
  - [Deep Sky Objects](#deep-sky-objects)
  - [Planets Data](#planets-data)
  - [Moon Data](#moon-data)
- [Coordinate Systems](#coordinate-systems)
- [How It Works](#how-it-works)
- [Installation & Usage](#installation--usage)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

## 📖 Overview
This project creates a realistic 3D celestial sphere that renders thousands of stars with accurate positions, colors, and magnitudes. It includes constellation lines, deep sky objects, and planets with precise orbital calculations. The interface supports Arabic language and provides multiple control options for navigation and observation.

## ✨ Features
- **3D Celestial Sphere**: Fully interactive dome with smooth camera controls
- **Accurate Star Positions**: Over 5000 stars with precise RA/Dec coordinates
- **Constellation Visualization**: Named constellations with connection lines
- **Solar System Model**: Planets with realistic orbital parameters
- **Deep Sky Objects**: Includes galaxies, nebulae, and star clusters
- **Dual Coordinate Grids**: Alt-Azimuth and Equatorial coordinate systems
- **Time & Location Controls**: Simulate different dates, times, and observing locations
- **Bilingual Support**: Full Arabic interface with astronomical terms in Arabic
- **Responsive Design**: Works on desktop and mobile devices

## 📁 Project Structure

```
sphere/
├── index.html              # Main HTML file with UI and Three.js setup
├── astro.js                 # Core astronomical calculations
├── astro-bridge.js          # Bridge between data and 3D rendering
├── observer.js              # Observer location and time management
├── skydb.js                  # Complete astronomical database
├── skypos.js                 # Position calculation utilities
├── solar-system.js           # Planetary motion calculations
├── real-stars-renderer.js    # Advanced star rendering
└── plani.js                  # Legacy/auxiliary planet functions
```

## 📄 File Descriptions

### `index.html`
The main entry point containing the UI structure, CSS styling, and Three.js initialization. Features include:
- Status bar with system information
- HUD (Heads-Up Display) for astronomical data
- Control panel for navigation and settings
- Fullscreen canvas for 3D rendering

### `astro.js`
Core astronomical library handling:
- Precession calculations
- Coordinate transformations
- Time conversions (Julian dates, sidereal time)
- Utility functions for astronomical math

### `astro-bridge.js`
Connects astronomical data with Three.js rendering:
- Loads and processes star/constellation data
- Converts equatorial to horizontal coordinates
- Calculates star colors based on spectral type
- Manages star visibility based on observer position
- Generates constellation line geometry

### `observer.js`
Manages observer state:
- Latitude/longitude coordinates
- Current date and time
- Local sidereal time calculation
- Observer altitude and location updates

### `skypos.js`
Position calculation utilities:
- `skypos_transform()`: Converts celestial to screen coordinates
- `init_stars()`: Calculates star colors and sizes
- `init_dsos()`: Initializes deep sky objects
- `init_planets()`: Sets up planetary orbital parameters
- `find_planet()`: Calculates planet positions using Kepler's equation
- `find_moon()`: Calculates Moon position and phase

### `solar-system.js`
Planetary system implementation:
- Planet position calculations
- Moon phase and position
- Planetary rendering and updates

### `real-stars-renderer.js`
Advanced star rendering techniques:
- Star sprite generation
- Magnitude-based sizing
- Color temperature mapping
- Twinkling effects (if implemented)

## 💾 Database Structure (skydb.js)

This file contains all astronomical data and is the heart of the project's accuracy.

### **Stars Data Array (`star`)**
Contains over 5000 stars with basic astronomical data:
```javascript
var star = [
    {pos: {ra: 0.023278, dec: -0.099615}, mag: 4.61, bv: 1.04},
    {pos: {ra: 0.036601, dec: 0.507726}, mag: 2.06, bv: -0.11},
    // ... thousands more
];
```
- **pos.ra**: Right Ascension in radians (0 to 2π)
- **pos.dec**: Declination in radians (-π/2 to π/2)
- **mag**: Apparent magnitude (lower = brighter)
- **bv**: B-V color index (spectral type indicator)

### **Star Names Array (`starname`)**
Maps names to bright stars:
```javascript
var starname = [
    {pos: {ra: 1.767793, dec: -0.291751}, label: "الشعرى اليمانية"}, // Sirius
    {pos: {ra: 1.675305, dec: -0.919716}, label: "سهيل"}, // Canopus
    {pos: {ra: 3.733528, dec: 0.334798}, label: "السماك الرامح"}, // Arcturus
    // ... more named stars
];
```

### **Constellation Names Array (`conname`)**
88 modern constellations with Arabic names:
```javascript
var conname = [
    {pos: {ra: 6.278, dec: 0.654}, abbrev: "And", name: "أندروميدا"},
    {pos: {ra: 2.691, dec: -0.567}, abbrev: "Ant", name: "مفرغة الهواء"},
    {pos: {ra: 4.213, dec: -1.315}, abbrev: "Aps", name: "طائر الفردوس"},
    // ... all constellations
];
```
- **pos.ra/dec**: Approximate center position
- **abbrev**: Standard 3-letter abbreviation
- **name**: Arabic name of the constellation

### **Constellation Lines Array (`conline`)**
Connects stars to form constellation figures:
```javascript
var conline = [
    [2843, 2850], [2850, 2844], [2844, 2785], [66, 46], [46, 48],
    // ... hundreds of connections
];
```
Each pair `[a, b]` represents indices in the `star` array to connect with a line.

### **Deep Sky Objects Array (`dso`)**
Non-stellar objects:
```javascript
var dso = [
    {pos: {ra: 1.459532, dec: 0.384263}, catalog: 1, id: 1, type: 5},  // M1 (Crab Nebula)
    {pos: {ra: 3.587524, dec: 0.495383}, catalog: 1, id: 3, type: 2},  // M3 (Globular Cluster)
    {pos: {ra: 4.291765, dec: -0.463094}, catalog: 1, id: 4, type: 2},  // M4 (Globular Cluster)
    // ... more DSOs
];
```
- **catalog**: 1=Messier, 2=NGC/IC, 0=Other
- **id**: Catalog number
- **type**: 1=open cluster, 2=globular cluster, 3=nebula, 4=planetary nebula, 5=supernova remnant, 6=galaxy, 7=other

### **Planets Array (`planet`)**
Orbital elements for solar system bodies:
```javascript
var planet = [
    {pos: {ra: 0, dec: 0}, name: "عطارد", color: "#FFFFFF",
     a: 0.38709893, e: 0.20563069, i: 0.1222580, o: 0.8435468,
     wb: 1.3518701, L: 4.4026077, dL: 2608.79031222},
    // ... all planets to Pluto
];
```
Orbital elements:
- **a**: Semi-major axis (AU)
- **e**: Eccentricity
- **i**: Inclination (radians)
- **o**: Longitude of ascending node
- **wb**: Longitude of perihelion
- **L**: Mean longitude at epoch
- **dL**: Daily motion (radians/day)

### **Moon Data**
```javascript
var moon = {pos: {ra: 0, dec: 0}};  // Calculated dynamically
```

## 🔭 Coordinate Systems

### Equatorial Coordinates
- **Right Ascension (RA)**: Measured in hours (0-24) or radians (0-2π)
- **Declination (Dec)**: Measured in degrees (-90 to +90) or radians (-π/2 to π/2)
- Fixed relative to distant stars

### Horizontal Coordinates
- **Altitude**: Angle above horizon (0° to 90°)
- **Azimuth**: Angle from North (0° to 360° clockwise)
- Changes with observer location and time

### Transformation Process
1. Convert RA/Dec to local coordinates using observer's LST
2. Calculate altitude and azimuth
3. Check visibility (altitude > -10°)
4. Convert to 3D Cartesian coordinates for rendering

## ⚙️ How It Works

### Initialization Flow
1. HTML loads Three.js and all JavaScript files
2. `skydb.js` provides astronomical data
3. `astro-bridge.js` initializes and processes data
4. `real-stars-renderer.js` creates 3D objects
5. Animation loop updates positions based on time

### Update Loop (60fps)
1. Get current observer time/location from `observer.js`
2. Calculate new star/planet positions using `astro-bridge.js`
3. Update 3D object positions and rotations
4. Render scene with Three.js

### User Interaction
- Arrow controls rotate the view/camera
- Time sliders change simulation time
- Location inputs change observer coordinates
- Toggle switches show/hide grid lines and labels

## 🚀 Installation & Usage

### Prerequisites
- Modern web browser with WebGL support (Chrome, Firefox, Safari, Edge)
- Local web server (optional, for development)

### Quick Start
1. Clone the repository:
   ```bash
   git clone https://github.com/kutaibaa-akraa/sphere.git
   ```
2. Open `index.html` in your browser:
   ```bash
   cd sphere
   open index.html  # or double-click the file
   ```

### Development Setup
1. Use a local server for best performance:
   ```bash
   python -m http.server 8000
   ```
2. Navigate to `http://localhost:8000`

## 📚 Dependencies
- **Three.js r128**: 3D rendering library
- No other external dependencies - pure JavaScript implementation

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request. Areas for improvement:
- Add more stars and deep sky objects
- Improve rendering performance
- Add telescope control interfaces
- Enhance mobile responsiveness
- Add more astronomical calculations (nutation, aberration)

## 📜 License
This project is open source. Please check the repository for specific license information.

---

## 🙏 Acknowledgements
- Ernie Wright for the original astronomical database (`skydb.js`, `skypos.js`)
- Three.js community for the excellent 3D library
- All contributors and users of this planetarium project
```

---

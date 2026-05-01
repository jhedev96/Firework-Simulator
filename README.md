<div align="center">

# 🎆 <br /> <u>Firework Simulator</u> <br />Super Realistic 2D

An advanced, highly realistic, and feature-rich fireworks simulation built with HTML5 Canvas and JavaScript.

<img src="./preview.png" alt="Firework Simulator" style="zoom:35%;" />

</div>

Originally inspired by and based on [Caleb Miller's v2 CodePen](https://codepen.io/MillerTime/pen/XgpNwb), this project has undergone a massive structural refactor and extensive feature expansion, evolving into a robust Object-Oriented (OOP) engine with physics-based particle behaviors, interactive modes, and dynamic environments.

## ✨ Core Features (Since v2)
* Highly realistic particle physics and star distribution.
* Granular controls for shell size, quality, and scale factor.
* Interactive sky lighting that illuminates the background upon explosions.
* Interactive Slow-Motion: Control the simulation speed by dragging near the bottom of the screen.

## 🚀 Version Changelog & New Features

### [v4.0] - Immersion 🆕
* **Settings Redesign:** Cleaned up and categorized the UI options.
* **Ultra Realistic Word Shell:** Text fireworks now feature 3D depth, rotation, and organic particle scattering.
* **Wobble Physics:** Whistling rockets now utilize Lissajous curve physics and thrust decay for chaotic, spiraling ascents.

### [v2.5 & v3.0] - Foundation & Core Additions
* **OOP Refactor:** Completely rewritten from procedural code into clean, modular ES6 Classes.
* **i18n Support:** Added multi-language support (English & Indonesian) with automatic system detection.
* **Audio Engineering:** Added distinct sound effects for rocket lifts and whistling.
* **Dynamic Word Shell:** Introduced the ability to spawn custom text fireworks dynamically.

## 🎮 Desktop Keyboard Shortcuts
* **P** - Pause the simulation.
* **O** - Toggle the settings menu.

## 🛠️ How to Use & Install

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jhedev96/firework-simulator.git
   ```

 * Navigate to the directory & build with NPM/PNPM:
   ```bash
   cd firework-simulator
   
   npm install
   
   npm run build
   // or
   npm run dev
   ```

 * Run the project:
   Simply open the `index.html` in any modern web browser. No build steps or local servers are strictly required!
   
📄 License
This project is licensed under the GNU GPL v3 License. You are free to use, modify, and distribute this software, provided that any derivative works are also open-source under the same license.
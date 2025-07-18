# 🚀 Gungeon Assault

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> **An advanced top-down space shooter game featuring epic UFO boss battles, dynamic particle effects, and professional game mechanics.**

<img width="1919" height="977" alt="image" src="https://github.com/user-attachments/assets/9fae1755-01db-4369-97e9-4560079f3993" />


---

## 🎮 About

**Gungeon Assault** is a high-performance, browser-based space shooter game built with modern web technologies. Experience intense combat against alien invaders, collect powerful weapons, and face off against massive UFO bosses in this action-packed adventure.

---

## ✨ Key Highlights

- 🛸 **Epic UFO Boss Battles** – Face massive alien motherships with multiple phases  
- 🎨 **Stunning Visual Effects** – Dynamic particle systems and space backgrounds  
- 🔫 **Advanced Weapon System** – Multiple weapon tiers with unique characteristics  
- 📱 **Mobile-Friendly** – Touch controls for mobile devices  
- 🎵 **Immersive Audio** – Procedurally generated sound effects  
- ⚡ **High Performance** – Optimized game engine with smooth 60+ FPS  

---

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS

### Game Engine
- HTML5 Canvas
- Web Audio API
- Custom game engine

### Development Tools
- ESLint
- PostCSS
- Lucide React

---

## 🎯 Features

### 🚀 Core Gameplay
- Infinite wave system with increasing difficulty
- Diverse enemy types: scouts, soldiers, heavies, snipers, and bosses
- Advanced AI and formation flying
- Tactical enemy formations

### 🔫 Weapon & Combat System
- 6 weapon tiers with unique effects
- Power-ups: speed, damage, rapid fire, multi-shot
- Reload mechanics with visual feedback
- Realistic bullet physics

### 🛸 Boss Battles
- Boss types: Destroyer, Battlecruiser, Dreadnought, Mothership, Voidlord, Titan
- Phase-based combat with escalating difficulty
- Spiral shots, homing missiles, and laser barrages
- Special abilities like teleportation, shields, area attacks

### 🎨 Visual Effects
- Explosions, engine trails, and muzzle flashes
- Animated parallax starfields
- Camera shake, flash, and transitions
- Modern responsive UI

### 📱 Platform Support
- **Desktop**: WASD + mouse controls  
- **Mobile**: Virtual joystick and touch buttons  
- Responsive layout for all screen sizes

### 🎵 Audio System
- Procedural sound generation
- Unique sound for each weapon type
- Epic boss music and intros
- Ambient space audio

---

## 🚀 Installation

### Prerequisites
- Node.js v16+
- npm or yarn

### Setup Instructions


```bash
# Clone the repo
git clone https://github.com/yourusername/gungeon-assault.git
cd gungeon-assault

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
http://localhost:5173

```
## 🎮 Usage

### Controls

#### 🖥 Desktop
- **Movement:** `W`, `A`, `S`, `D`
- **Aim & Shoot:** Mouse cursor + left click
- **Reload:** `R`
- **Pause:** `ESC`

#### 📱 Mobile
- **Movement:** Virtual joystick (bottom left)
- **Shooting:** Fire button (bottom right)
- **Reload:** Reload button (right side)

---

### 🧠 Gameplay Tips
- 💡 **Manage Your Ammo:** Reload strategically
- ⚡ **Collect Power-ups:** Enemies drop upgrades
- 🧠 **Boss Phases:** Expect aggressive patterns
- 🔺 **Formation Awareness:** Stay alert
- 🚀 **Weapon Upgrades:** Tier up for stronger firepower

---

## 🏗️ Project Structure

```bash
src/
├── components/          
│   └── GameCanvas.tsx         # Main game canvas
├── game/                      
│   ├── GameEngine.ts          # Core engine
│   ├── Player.ts              # Player logic
│   ├── Enemy.ts               # Enemy AI
│   ├── Boss.ts                # Boss mechanics
│   ├── Particle.ts            # Particle effects
│   ├── AudioManager.ts        # Sound management
│   ├── Level.ts               # Wave progression
│   ├── Pickup.ts              # Power-ups
│   ├── TouchControls.ts       # Mobile controls
│   ├── BackgroundRenderer.ts  # Background rendering
│   ├── CampaignManager.ts     # Campaign mode logic
│   ├── RoomTransition.ts      # Transitions
│   ├── types.ts               # Type definitions
│   └── utils.ts               # Helper functions
├── assets/                    # Images, sprites
└── App.tsx                    # App entry point
```
## 🎨 Game Assets

### Sprites Used
- **Player Ship:** `playerShip3_blue.png`
- **Enemies:** `enemyRed1.png` – `enemyRed5.png`
- **Boss:** `ufoRed.png`

### Requirements
- **Format:** PNG
- **Size:**
  - **Ships:** 64×64px  
  - **Bosses:** 128×128px or larger

---

## ⚙️ Build & Deployment

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint the codebase
npm run lint
```
## 🎯 Performance Optimizations

- 🔁 **Object Pooling** – Reuse bullets and particles
- 🎯 **Optimized Collisions** – Efficient detection logic
- 🖼️ **Canvas Tuning** – Minimized redraws
- 🎧 **Audio Caching** – Preloaded sound buffers
- 🧹 **Memory Cleanup** – Automatic object disposal

---

## 🔧 Configuration

You can modify game parameters in the following files:

| Parameter         | File                    |
|------------------|-------------------------|
| Enemy Difficulty | `Enemy.ts`              |
| Wave Timing      | `Level.ts`              |
| Weapon Balance   | `Player.ts`, `Pickup.ts`|
| Boss Behavior    | `Boss.ts`               |

---

### 🎚️ Audio Settings

- Master volume and sound category toggles: `AudioManager.ts`
- Automatic audio context initialization with fallback support

---

## 🤝 Contributing

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/amazing-feature

# 3. Make your changes
git commit -m "Add amazing feature"

# 4. Push and open a PR
git push origin feature/amazing-feature
```
**Made with ❤️ and lots of ☕**  
Enjoy the game, and may your aim be true! 🎯


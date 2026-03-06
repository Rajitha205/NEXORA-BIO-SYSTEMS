# Nexora Bio Systems — Anti-Gravity Landing Experience

A premium, fully interactive 8-page front-end web experience for a high-end futuristic biotech company. Built entirely with pure HTML, CSS, and Vanilla JavaScript with a custom WebGL/Canvas 2D rendering pipeline (no external frameworks or libraries).

## Features

- **Immersive 3D Canvas Elements**: 
  - Dynamic DNA double helix orbiting 3D particles on the Home page.
  - Complex 3D molecular/atom node cluster animations used specifically for the navigational and footer logos across *all* pages.
  - Interactive avatar rendering on the About page.
- **Advanced Micro-Interactions**:
  - Global custom cursor with a trailing magnetic ring.
  - Subtle interactive 3D perspective tilting (glassmorphism) on hover cards.
  - Terminal-style typing effects for data feeds.
- **Responsive Layout**: Designed mobile-first using modern CSS Grid and Flexbox utility classes, guaranteeing seamless scaling from 4K desktop monitors down to mobile devices.
- **Cyberpunk / Sci-Fi Aesthetic**: Heavy use of "glassmorphism", deep matte black backgrounds, neon green (`#39FF14`), and electric cyan (`#00F0FF`) accents and box-shadows.

## Project Structure

### Pages
- `index.html` - The Home page with the hero DNA canvas and overview.
- `about.html` - Founder story, ethics, and company vision.
- `research.html` - Detailed research domains and AI engine descriptions.
- `technology.html` - Physical infrastructure, robotic synthesis labs, and platform architecture.
- `pipeline.html` - Clinical trial tracking, trial phases table, and lead candidate deep dives.
- `publications.html` - Research archive with interactive category filtering.
- `careers.html` - Job openings, company culture, and benefits.
- `contact.html` - Secure terminal-style contact form.

### Assets & Logic
- `styles.css` - The global design system. Contains variables, typography, navigation, footer, glass cards, buttons, and responsive utility grids.
- `home.css` - Specific layout styling for the massive Home page.
- `core.js` - Global JavaScript. Handles the particle system background, the custom cursor, scroll reveal animations, number count-ups, the interactive globe grid background, and the 3D Canvas dynamic logos.
- `home.js` - Specific JavaScript for the Home page. Contains the complex 3D DNA rendering script and the interactive atom viewer.
- `about-anim.js` - Dedicated 3D canvas animation script for the avatar rendering on the About page.

## Usage

This project uses entirely static files. No build tools (like Webpack or Vite), Node.js server, or package managers are required.

Simply open `index.html` in any modern web browser to view the project locally. 

For the best experience, use a modern browser (Chrome, Firefox, Safari, Edge) with hardware acceleration enabled to ensure a smooth 60fps frame rate for the canvas animations.

## Authors
Generated for Anti-Gravity Labs.
© 2026 Nexora Bio Systems. All rights reserved.

# Collaborative Whiteboard

## Overview

Collaborative Whiteboard is a real-time web-based drawing application that allows multiple users to collaborate on the same canvas. Users can create and edit drawings, manage layers, import/export files, and interact with shared content in real time.

## Features

* Real-time collaboration using WebSockets
* Freehand drawing (Pen & Highlighter)
* Eraser with multiple sizes
* Shapes (Rectangle, Circle, Triangle, Line, Arrow)
* Text tool
* Image import and manipulation
* Layer management
* Object selection, resizing, and rotation
* Background color fill
* Import/Export (JSON, PNG, SVG)
* Save and load boards using IndexedDB
* Online user presence

## Technologies Used

* HTML5
* CSS3
* JavaScript (ES6 Modules)
* HTML5 Canvas
* WebSocket
* IndexedDB

## Project Structure

* `index.html` – Main application layout
* `style.css` – User interface styling
* `src/`

  * `core/` – Rendering, state management, camera
  * `tools/` – Drawing and editing tools
  * `ui/` – Toolbar, layers, colors, cursor, and UI components
  * `network/` – WebSocket communication
  * `storage/` – IndexedDB operations


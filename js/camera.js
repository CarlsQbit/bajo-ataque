/* ==========================================================================
   camera.js - Sistema de Paneo y Zoom del mapa
   ========================================================================== */
(function () {
  // Estado global de la cámara para que otras funciones puedan leer la escala actual
  window.camera = { x: 0, y: 0, scale: 1 };

  let isPanning = false;
  let startPanX = 0;
  let startPanY = 0;

  function initCamera() {
    const workspace = document.getElementById("workspace");

    // 1. Iniciar el desplazamiento con el botón central (rueda) o botón derecho
    // Dentro de initCamera() en js/camera.js
    workspace.addEventListener("mousedown", (e) => {
      // 0 = Clic Izquierdo, 1 = Rueda, 2 = Clic Derecho
      if (e.button === 1 || e.button === 2) {
        isPanning = true;
        // La cámara NO requiere corrección matemática de escala porque
        // estamos moviendo todo el lienzo respecto a la pantalla
        startPanX = e.clientX - window.camera.x;
        startPanY = e.clientY - window.camera.y;
        workspace.style.cursor = "grabbing";
      }
    });

    // 2. Mover el mapa arrastrando
    window.addEventListener("mousemove", (e) => {
      if (!isPanning) return;
      window.camera.x = e.clientX - startPanX;
      window.camera.y = e.clientY - startPanY;
      updateTransform();
    });

    // 3. Soltar el mapa
    window.addEventListener("mouseup", (e) => {
      if (e.button === 1 || e.button === 2) {
        isPanning = false;
        workspace.style.cursor = "default";
      }
    });

    // 4. Zoom con la rueda del ratón
    workspace.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault(); // Evita que la página haga scroll vertical

        const zoomSpeed = 0.05;
        let newScale = window.camera.scale;

        // Detectar la dirección de la rueda
        if (e.deltaY < 0) {
          newScale += zoomSpeed; // Acercar
        } else {
          newScale -= zoomSpeed; // Alejar
        }

        // Limitamos el zoom (mínimo 0.4x, máximo 2x) para que no se pierdan
        window.camera.scale = Math.max(0.4, Math.min(newScale, 2));
        updateTransform();
      },
      { passive: false },
    );

    // 5. Paneo ágil con el teclado (WASD / Flechas)
    document.addEventListener("keydown", (e) => {
      // Evitar que el mapa se mueva si el usuario está escribiendo en algún input (ej. renonbrando un nodo)
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      const panSpeed = 40;
      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          window.camera.y += panSpeed;
          break;
        case "s":
        case "arrowdown":
          window.camera.y -= panSpeed;
          break;
        case "a":
        case "arrowleft":
          window.camera.x += panSpeed;
          break;
        case "d":
        case "arrowright":
          window.camera.x -= panSpeed;
          break;
        default:
          return;
      }
      updateTransform();
    });

    // Evitar que salga el molesto menú contextual del navegador si usas el click derecho para mover el mapa
    workspace.addEventListener("contextmenu", (e) => {
      if (
        e.target.id === "workspace" ||
        e.target.id === "game-canvas" ||
        e.target.id === "connections-layer"
      ) {
        e.preventDefault();
      }
    });
  }

  function updateTransform() {
    const canvas = document.getElementById("game-canvas");
    if (canvas) {
      canvas.style.transform = `translate(${window.camera.x}px, ${window.camera.y}px) scale(${window.camera.scale})`;
    }
  }

  document.addEventListener("DOMContentLoaded", initCamera);
})();

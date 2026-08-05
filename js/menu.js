/* ==========================================================================
   menu.js - Menú Principal del Juego
   Responsabilidad: Pantalla inicial, nombre del jugador, tabla de puntuaciones.
   ========================================================================== */

(function () {
  // Estado del menú
  let playerName = "";
  let scores = [];

  // Cargar puntuaciones desde scores.json
  function loadScores() {
    try {
      fetch("scores.json")
        .then((response) => response.json())
        .then((data) => {
          if (data.scores) {
            scores = data.scores.sort((a, b) => b.day - a.day); // Ordenar por días (mayor primero)
            renderScoresTable();
          }
        })
        .catch(() => {
          scores = [];
        });
    } catch (e) {
      scores = [];
    }
  }

  // Guardar puntuación en scores.json
  function saveScore(name, day, nodes) {
    const newScore = {
      name: name,
      day: day,
      nodes: nodes,
      date: new Date().toISOString().split("T")[0], // Formato: YYYY-MM-DD
    };
    scores.push(newScore);
    scores.sort((a, b) => b.day - a.day); // Ordenar por días (mayor primero)

    // Guardar en el archivo (usando fetch + API de GitHub o localStorage)
    // Por ahora, usamos localStorage como fallback
    try {
      localStorage.setItem("bajoAtaqueScores", JSON.stringify({ scores }));
    } catch (e) {
      console.error("No se pudo guardar en localStorage:", e);
    }

    // Actualizar la tabla
    renderScoresTable();
  }

  // Renderizar la tabla de puntuaciones
  function renderScoresTable() {
    const table = document.getElementById("scores-table");
    if (!table) return;

    table.innerHTML = "";

    // Cabecera
    const header = document.createElement("tr");
    header.innerHTML = `
      <th>Posición</th>
      <th>Nombre</th>
      <th>Días</th>
      <th>Nodos</th>
      <th>Fecha</th>
    `;
    table.appendChild(header);

    // Filas de puntuaciones
    scores.forEach((score, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${score.name}</td>
        <td>${score.day}</td>
        <td>${score.nodes}</td>
        <td>${score.date}</td>
      `;
      table.appendChild(row);
    });
  }

  // Inicializar el menú principal
  function initMenu() {
    const menuScreen = document.getElementById("menu-screen");
    if (!menuScreen) return;

    // Cargar puntuaciones
    loadScores();

    // Botón "Jugar"
    const btnPlay = document.getElementById("btn-play");
    if (btnPlay) {
      btnPlay.onclick = () => {
        const nameInput = document.getElementById("player-name");
        if (nameInput) {
          playerName = nameInput.value.trim() || "Jugador";
          window.gameState.playerName = playerName;
        }
        menuScreen.style.display = "none";
        // Iniciar el juego (el tutorial se iniciará automáticamente)
        if (typeof window.initGame === "function") window.initGame();
        if (typeof window.initUI === "function") window.initUI();
        if (typeof window.initNetwork === "function") window.initNetwork();
      };
    }

    // Botón "Tabla de Puntuaciones"
    const btnScores = document.getElementById("btn-scores");
    if (btnScores) {
      btnScores.onclick = () => {
        const scoresModal = document.getElementById("scores-modal");
        if (scoresModal) {
          scoresModal.style.display = "block";
          renderScoresTable();
        }
      };
    }

    // Botón "Cerrar" en la tabla de puntuaciones
    const btnCloseScores = document.getElementById("btn-close-scores");
    if (btnCloseScores) {
      btnCloseScores.onclick = () => {
        const scoresModal = document.getElementById("scores-modal");
        if (scoresModal) scoresModal.style.display = "none";
      };
    }

    // Botón "Glosario" en el menú principal
    const btnGlossary = document.getElementById("btn-glossary-menu");
    if (btnGlossary) {
      btnGlossary.onclick = () => {
        if (typeof window.openGlossaryModal === "function") {
          window.openGlossaryModal();
        }
      };
    }
  }

  // Función para guardar puntuación al ganar
  function saveVictoryScore(day, nodes) {
    if (!playerName) playerName = "Jugador";
    saveScore(playerName, day, nodes);
  }

  // Exponer funciones globales
  window.initMenu = initMenu;
  window.saveVictoryScore = saveVictoryScore;
  window.loadScores = loadScores;
  window.renderScoresTable = renderScoresTable;
})();

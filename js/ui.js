/* ==========================================================================
   ui.js - Interfaz de usuario
   Responsabilidad: menús laterales, tutorial, glosario, HUD, notificaciones
   y conexión entre botones y la lógica del juego.

   Depende de: main.js, economy.js, research.js, network.js, events.js
   ========================================================================== */

(function () {
  /* ------------------------------------------------------------------------
     REFERENCIAS DOM
     ------------------------------------------------------------------------ */
  let tutorialStep = 0;
  let tutorialHighlight = null;

  // Asegurar que window.gameState exista
  window.gameState = window.gameState || {};

  /* ------------------------------------------------------------------------
     INICIALIZACIÓN
     ------------------------------------------------------------------------ */
  function initUI() {
    setupSidebar();
    setupTopControls();
    setupWelcomeScreen();
    setupTutorial();
    setupGlossary();
    setupSellModal();
    updateHUD();
  }

  /* ------------------------------------------------------------------------
     SIDEBAR Y SUBMENÚS
     ------------------------------------------------------------------------ */
  function setupSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;

    const buttons = sidebar.querySelectorAll(".sidebar-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.dataset.target;
        if (!targetId) return;

        // Glosario: comportamiento especial
        if (targetId === "menu-glossary") {
          if (window.gameState && window.gameState.isPaused) {
            openGlossaryModal();
          } else {
            toggleSubmenu("menu-glossary");
          }
          return;
        }

        // Cerrar glosario modal si está abierto
        closeGlossaryModal();

        toggleSubmenu(targetId);
      });
    });
  }

  function toggleSubmenu(targetId) {
    document.querySelectorAll(".submenu-panel").forEach((panel) => {
      if (panel.id === targetId) {
        const isNowActive = !panel.classList.contains("active");
        closeAllSubmenus();
        if (isNowActive) {
          panel.classList.add("active");
          document.body.classList.add("submenu-open");

          // Renderizar contenido al abrir
          if (targetId === "menu-media") renderCableTools();
          if (targetId === "menu-switches") renderBuildMenu();
          if (targetId === "menu-research") renderResearchMenu();
          if (targetId === "menu-loans") renderLoansMenu();
        }
      }
    });
  }

  function closeAllSubmenus() {
    document.querySelectorAll(".submenu-panel").forEach((panel) => {
      panel.classList.remove("active");
    });
    document.body.classList.remove("submenu-open");
  }

  /* ------------------------------------------------------------------------
     CONTROLES SUPERIORES
     ------------------------------------------------------------------------ */
  function setupTopControls() {
    const btnPause = document.getElementById("btn-pause");
    const btnSpeedNormal = document.getElementById("btn-speed-normal");
    const btnSpeedFast = document.getElementById("btn-speed-fast");
    const btnEditMode = document.getElementById("btn-edit-mode");

    if (btnPause) {
      btnPause.addEventListener("click", () => {
        window.setPause(!window.gameState.isPaused);
      });
    }

    if (btnSpeedNormal) {
      btnSpeedNormal.addEventListener("click", () => window.setSpeed(1));
    }

    if (btnSpeedFast) {
      btnSpeedFast.addEventListener("click", () => window.setSpeed(2));
    }

    if (btnEditMode) {
      btnEditMode.addEventListener("click", () => {
        window.setEditMode(!window.gameState.isEditMode);
        if (window.gameState.isEditMode) {
          closeAllSubmenus();
        }
      });
    }
  }

  /* ------------------------------------------------------------------------
     PANTALLA DE BIENVENIDA
     ------------------------------------------------------------------------ */
  function setupWelcomeScreen() {
    const welcome = document.getElementById("welcome-screen");
    const btnStart = document.getElementById("btn-start-game");

    if (!welcome || !btnStart) return;

    btnStart.addEventListener("click", () => {
      welcome.style.display = "none";
      window.setPause(false);
      window.setSpeed(1);
      startTutorial();
    });
  }

  /* ------------------------------------------------------------------------
     TUTORIAL INTERACTIVO
     ------------------------------------------------------------------------ */
  function setupTutorial() {
    const btnNext = document.getElementById("btn-next-tutorial");
    const btnSkip = document.getElementById("btn-skip-tutorial");

    if (btnNext) {
      btnNext.addEventListener("click", nextTutorialStep);
    }
    if (btnSkip) {
      btnSkip.addEventListener("click", endTutorial);
    }
  }

  function startTutorial() {
    tutorialStep = 0;
    const card = document.getElementById("tutorial-card");
    if (card) {
      card.style.display = "block";
      // Añadir botón de cerrar
      const closeBtn = document.createElement("button");
      closeBtn.innerHTML = "&times;";
      closeBtn.className = "tutorial-close-btn";
      closeBtn.style.position = "absolute";
      closeBtn.style.top = "5px";
      closeBtn.style.right = "5px";
      closeBtn.style.background = "none";
      closeBtn.style.border = "none";
      closeBtn.style.fontSize = "1.2rem";
      closeBtn.style.cursor = "pointer";
      closeBtn.onclick = endTutorial;
      card.appendChild(closeBtn);
    }

    // Pausar durante el tutorial
    window.setPause(true);
    nextTutorialStep();
  }

  const TUTORIAL_STEPS = [
    {
      title: "Bienvenido, administrador de red",
      text: "Eres el responsable de mantener la infraestructura de red de esta nueva empresa que esta en rápido crecimiento.¡Si la red colapsa, todo se pierde!",
      target: null,
    },
    {
      title: "Salud de la red",
      text: "Esta barra muestra qué tan estable está la red. Los eventos de seguridad mal resueltos y los nodos sin conexión al router la reducen. Si llega a 0, el juego termina.",
      target: "#health-bar-container",
    },
    {
      title: "Capacitación de empleados",
      text: "Mientras más capacitado esté el personal, menos eventos de seguridad ocurrirán. Puedes mejorarla resolviendo eventos correctamente o comprando investigaciones.",
      target: "#training-bar-container",
    },
    {
      title: "Dinero y Puntos de Inteligencia (PI)",
      text: "El dinero se genera por cada paquete que llega a su destino ($1) y por los eventos que sucedan en la semana. Los PI se obtienen resolviendo eventos y sirven para investigaciones.",
      target: null,
    },
    {
      title: "Paquetes de información",
      text: "Cada nodo genera paquetes de datos. Estos paquetes esperan para ser enviados. El número azul o rojo indica cuántos esperan ser enviados.",
      target: null,
    },
    {
      title: "Los cables transportan los paquetes",
      text: "Cada cable tiene un cooldown: el coaxial es el más lento (3s), la fibra multimodo el más rápido (0.3s). Un cable lento con muchos paquetes en espera genera saturación.",
      target: "#menu-media",
    },
    {
      title: "Tipos de cable",
      text: "El cable Coaxial ($50) es el más barato pero lento. Cat5e, UTP Cat6, Cat6A escalan en velocidad y precio. Fibra Multimodo ($170) es la más rápida y cara. Utilizalos según lo vayas necesitando.",
      target: "#menu-media",
    },
    {
      title: "Switches",
      text: "Los switches amplían cuántos equipos puedes conectar. Switch 8 puertos ($250), 16 puertos ($450), 24 puertos ($700). Conecta nuevos empleados a un switch, y el switch al router.",
      target: "#menu-switches",
    },
    {
      title: "Investigaciones",
      text: "Desbloquea mejoras gastando dinero y PI. Cada investigación tiene algo que ofrecerte",
      target: "#menu-research",
    },
    {
      title: "Eventos de seguridad",
      text: "Cada pocos días aparece un incidente: phishing, DDoS, malware, ransomware y más. Tienes entre 10 y 15 segundos para elegir. Solo verás el costo de cada opción.",
      target: null,
    },
    {
      title: "Eventos positivos",
      text: "También pueden ocurrir buenas noticias: bonos del CEO, auditorías exitosas, subsidios o seminarios gratuitos. Estos aparecen como notificaciones y aplican su beneficio automáticamente.",
      target: null,
    },
    {
      title: "Préstamos",
      text: "Si te quedas sin dinero puedes solicitar un préstamo. Ojo: generan una penalización sobre tus ingresos diarios hasta que los pagues. Úsalos solo en emergencias.",
      target: "#menu-loans",
    },
    {
      title: "Servidores (4 puertos)",
      text: "Los Servidores son nodos con 4 puertos. No te olvides de conectarlos al swtich o al router",
      target: null,
    },
    {
      title: "Eventos de crecimiento de servidores",
      text: "Ocasionalmente aparecerán eventos de expansión de datacenter: nuevos servidores se añaden al mapa. Conéctalos y protégelos rápidamente para aprovechar sus ingresos y recursos.",
      target: null,
    },
    {
      title: "Navegar el mapa (panning)",
      text: "Para moverte por el workspace mantén pulsado botón derecho y arrastra (clic derecho + arrastrar). Así verás zonas lejanas de tu red.",
      target: null,
    },
    {
      title: "Selección rectangular",
      text: "Arrastra con el botón izquierdo para dibujar una selección rectangular, esto selecciona cables para vender.",
      target: null,
    },
    {
      title: "Vender equipo",
      text: "Haz clic derecho sobre un nodo o para abrir el menú rápido de acciones (Vender/Detalles). Vender recupera un porcentaje del coste original y elimina las conexiones asociadas.",
      target: null,
    },

    {
      title: "Glosario",
      text: "Si no entiendes un concepto no te olvides de revisar el glosario, esta colocado en el menú lateral.",
      target: null,
    },

    {
      title: "Condición de victoria",
      text: "Mantén una red de al menos 50 nodos conectados durante 3 meses (84 días). Gestiona bien los recursos y no dejes que la salud llegue a cero. ¡Buena suerte!",
      target: null,
    },
  ];

  function nextTutorialStep() {
    const card = document.getElementById("tutorial-card");
    const title = document.getElementById("tutorial-title");
    const text = document.getElementById("tutorial-text");
    const btnNext = document.getElementById("btn-next-tutorial");

    if (tutorialStep >= TUTORIAL_STEPS.length) {
      endTutorial();
      return;
    }

    const step = TUTORIAL_STEPS[tutorialStep];
    if (title) title.textContent = step.title;
    if (text) text.textContent = step.text;

    if (btnNext) {
      btnNext.textContent =
        tutorialStep === TUTORIAL_STEPS.length - 1 ? "¡Empezar!" : "Siguiente";
    }

    if (step.target) {
      highlightElement(step.target);
    } else {
      removeHighlight();
    }

    tutorialStep++;
  }

  function highlightElement(selector) {
    const target = document.querySelector(selector);
    if (!target) return;

    if (!tutorialHighlight) {
      tutorialHighlight = document.createElement("div");
      tutorialHighlight.id = "tutorial-highlight";
      document.body.appendChild(tutorialHighlight);
    }

    const rect = target.getBoundingClientRect();
    tutorialHighlight.style.display = "block";
    tutorialHighlight.style.left = `${rect.left - 4}px`;
    tutorialHighlight.style.top = `${rect.top - 4}px`;
    tutorialHighlight.style.width = `${rect.width + 8}px`;
    tutorialHighlight.style.height = `${rect.height + 8}px`;
  }

  function removeHighlight() {
    if (tutorialHighlight) {
      tutorialHighlight.style.display = "none";
    }
  }

  function endTutorial() {
    const card = document.getElementById("tutorial-card");
    if (card) card.style.display = "none";
    removeHighlight();
    window.setPause(false);
  }

  /* ------------------------------------------------------------------------
     GLOSARIO
     ------------------------------------------------------------------------ */
  const GLOSSARY_TERMS = [
    {
      term: "Router",
      definition:
        "Nodo central de la red. Todo debe conectarse a él (directa o indirectamente). Si un nodo pierde su ruta al router, acumula tráfico y daña la salud de la red.",
    },
    {
      term: "Switch",
      definition:
        "Dispositivo que distribuye conexiones. Permite conectar múltiples equipos a la red. Disponible en 8, 16 y 24 puertos. Se satura cuando más del 80% de sus puertos están en uso.",
    },
    {
      term: "Endpoint",
      definition:
        "Dispositivo final del usuario: computadora, laptop, impresora. Genera paquetes de datos y aporta $15 diarios si está conectado al router. Tiene solo 1 puerto.",
    },
    {
      term: "Servidor",
      definition:
        "Es una computadora o un sistema informático que sirve información, datos o recursos a otras computadoras conectadas a él, a las cuales se les llama clientes. Muchos servidores están equipados con hardware más potente, como procesadores de muchos núcleos, grandes cantidades de memoria RAM y sistemas de almacenamiento redundante para manejar múltiples solicitudes al mismo tiempo.",
    },
    {
      term: "Paquete de datos",
      definition:
        "Unidad de información que cada nodo genera cada 2 a 3.5 segundos. Se acumula en cola visible (número azul) hasta que un cable lo transporta. Cada entrega genera $1.",
    },
    {
      term: "Cola de paquetes",
      definition:
        "Los paquetes esperan sobre el nodo antes de ser enviados. El número azul muestra cuántos hay en espera. Si llega a 6+, el badge se vuelve rojo — el nodo está saturado.",
    },
    {
      term: "Cable Coaxial",
      definition:
        "Cable legado. Costo: $20, cooldown: 3s. El más barato pero lento. Útil solo al inicio del juego.",
    },
    {
      term: "Cat5e",
      definition:
        "Cable estándar antiguo. Costo: $30, cooldown: 2s. Hasta 100 Mbps. Para conexiones de baja prioridad.",
    },
    {
      term: "UTP Cat6",
      definition:
        "Cable estándar moderno. Costo: $60, cooldown: 1.5s. Hasta 1 Gbps. El más común en oficinas.",
    },
    {
      term: "Cat6A",
      definition:
        "Cable de alto rendimiento. Costo: $90, cooldown: 1s. Hasta 10 Gbps. Ideal para switches en centros de datos.",
    },
    {
      term: "Fibra Multimodo",
      definition:
        "El cable más rápido disponible. Costo: $200, cooldown: 0.3s. Transmisión óptica de alta capacidad. Recomendado para el enlace router–switch principal.",
    },
    {
      term: "Phishing",
      definition:
        "Ataque de ingeniería social. Un empleado recibe un correo fraudulento. Resolverlo bien puede activar un bonus anti-phishing temporal.",
    },
    {
      term: "DDoS",
      definition:
        "Ataque de denegación de servicio distribuido. Satura la red con tráfico masivo. Requiere acción rápida y costosa para mitigarse.",
    },
    {
      term: "Ransomware",
      definition:
        "Malware que cifra archivos y exige rescate. Uno de los eventos más costosos. La mejor respuesta es aislar el nodo y restaurar desde backup.",
    },
    {
      term: "Firewall",
      definition:
        "Barrera de seguridad que filtra tráfico no autorizado. Desbloqueable como investigación para preparar defensas futuras.",
    },
    {
      term: "IDS/IPS",
      definition:
        "Sistema de Detección/Prevención de Intrusiones. Como investigación, otorga +1 PI por cada evento de seguridad resuelto.",
    },
    {
      term: "SLA",
      definition:
        "Service Level Agreement. Acuerdo de nivel de servicio con los clientes. Representado por la salud de la red — si cae a 0, la empresa pierde el contrato.",
    },
    {
      term: "Topología",
      definition:
        "Forma en que los nodos están organizados y conectados. En este juego se recomienda topología en estrella: todos los switches conectados al router central.",
    },
    {
      term: "MitM (Man-in-the-Middle)",
      definition:
        "Un ataque donde un actor intercepta y altera la comunicación entre dos nodos. En el juego, MitM puede provocar pérdida de paquetes o filtrado de datos.",
    },
    {
      term: "Zero-Day",
      definition:
        "Vulnerabilidad desconocida que puede ser explotada sin parche. Representa eventos imprevistos y peligrosos.",
    },
    {
      term: "Backup / Restauración",
      definition:
        "Políticas que permiten recuperar datos después de incidentes como Ransomware. Implementarlas evita pérdida de salud.",
    },
    {
      term: "VPN",
      definition:
        "Túnel cifrado que protege el tráfico y reduce riesgo de MitM o phishing.",
    },
    {
      term: "SIEM",
      definition:
        "Sistema de monitorización central que ayuda a detectar y resolver amenazas más rápido.",
    },
    {
      term: "Malware",
      definition:
        "Término paraguas para cualquier tipo de 'software malicioso' diseñado para infiltrarse, dañar, robar datos o ganar acceso no autorizado a un sistema informático sin el consentimiento del usuario.",
    },
    {
      term: "Virus",
      definition:
        "Tipo de malware que se adjunta a un archivo o programa legítimo y requiere la intervención del usuario (como abrir un documento) para ejecutarse y propagarse a otros archivos del sistema.",
    },
    {
      term: "Gusano (Worm)",
      definition:
        "Malware que tiene la capacidad de replicarse y propagarse automáticamente a través de la red explotando vulnerabilidades, sin necesidad de interactuar con archivos o intervención humana.",
    },
    {
      term: "Troyano (Trojan)",
      definition:
        "Software que se presenta como una aplicación legítima y útil, pero que oculta funciones maliciosas en su interior, como abrir una puerta trasera (backdoor) para que un atacante tome el control.",
    },
    {
      term: "Spyware",
      definition:
        "Software espía diseñado para recopilar información sobre las actividades de un usuario (teclas pulsadas, historial, capturas de pantalla) y enviarla a un tercero sin autorización.",
    },
    {
      term: "Adware",
      definition:
        "Malware diseñado para mostrar anuncios no deseados de forma intrusiva. Aunque suele ser menos dañino que un virus, consume recursos de red y puede ser la puerta de entrada para spyware.",
    },
    {
      term: "Rootkit",
      definition:
        "Conjunto de herramientas diseñadas para ocultar la presencia de malware y proporcionar acceso persistente de nivel de administrador al atacante, volviéndose muy difícil de detectar para sistemas operativos comunes.",
    },
    {
      term: "Movimiento Lateral",
      definition:
        "Técnica utilizada por un atacante o malware (como un gusano o ransomware) para propagarse desde un dispositivo infectado inicial hacia otros servidores o endpoints dentro de la misma red interna.",
    },
  ];

  function setupGlossary() {
    renderGlossaryList("glossary-list-normal");
    renderGlossaryList("glossary-list-paused");

    const btnClose = document.getElementById("btn-close-glossary-modal");
    if (btnClose) {
      btnClose.addEventListener("click", closeGlossaryModal);
    }
  }

  function renderGlossaryList(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";
    GLOSSARY_TERMS.forEach((item) => {
      const div = document.createElement("div");
      div.className = "glossary-item";
      div.innerHTML = `
        <div class="glossary-term">${item.term}</div>
        <div class="glossary-definition">${item.definition}</div>
      `;
      container.appendChild(div);
    });
  }

  function openGlossaryModal() {
    const modal = document.getElementById("glossary-modal");
    if (modal) {
      modal.style.display = "flex";
      // Asegurar que el glosario esté renderizado
      renderGlossaryList("glossary-list-paused");
    }
  }

  function closeGlossaryModal() {
    const modal = document.getElementById("glossary-modal");
    if (modal) modal.style.display = "none";
  }

  /* ------------------------------------------------------------------------
     MENÚS DINÁMICOS
     ------------------------------------------------------------------------ */
  function renderResearchMenu() {
    const container = document.getElementById("research-list");
    if (!container) return;

    container.innerHTML = "";

    Object.values(window.CONFIG.researches).forEach((research) => {
      const bought = window.gameState.researches.includes(research.id);
      const requiresMet =
        !research.requires ||
        window.gameState.researches.includes(research.requires);
      const canAfford =
        requiresMet &&
        window.gameState.money >= research.costMoney &&
        window.gameState.intelPoints >= research.costIntel;

      const item = document.createElement("div");
      item.className = `research-item ${bought ? "bought" : ""} ${!canAfford && !bought ? "locked" : ""}`;
      item.innerHTML = `
        <div class="research-title">${research.title}</div>
        <div class="research-desc">${research.description}</div>
        <div class="research-cost">
                  $${research.costMoney} | ${research.costIntel} PI
                </div>
                ${
                  research.requires &&
                  !window.gameState.researches.includes(research.requires)
                    ? `<div style="color:#f87171;font-size:0.75rem;">🔒 Requiere: ${window.CONFIG.researches[research.requires]?.title || research.requires}</div>`
                    : ""
                }
      `;

      if (!bought) {
        const btn = document.createElement("button");
        btn.className = "buy-btn";
        btn.textContent = canAfford ? "Investigar" : "Sin recursos";
        btn.disabled = !canAfford;
        btn.onclick = () => {
          if (window.buyResearch(research.id)) {
            renderResearchMenu();
            renderLoansMenu();
          }
        };
        item.appendChild(btn);
      } else {
        const badge = document.createElement("div");
        badge.className = "bought-badge";
        badge.textContent = "Adquirido";
        item.appendChild(badge);
      }

      container.appendChild(item);
    });
  }

  function renderLoansMenu() {
    const container = document.getElementById("loans-list");
    if (!container) return;

    container.innerHTML = "";

    Object.entries(window.CONFIG.loans).forEach(([loanId, loan]) => {
      const active = window.gameState.loans.find((l) => l.id === loanId);
      const totalOwed = Math.round(loan.amount * (1 + loan.interest));

      const item = document.createElement("div");
      item.className = `loan-item ${active ? "taken" : ""}`;
      item.innerHTML = `
        <div class="loan-title">${loan.name}</div>
        <div class="loan-desc">Monto: $${loan.amount} | Interés: ${Math.round(loan.interest * 100)}%</div>
        <div class="loan-penalty">Penalización de ingresos: ${Math.round(loan.incomePenalty * 100)}%</div>
      `;

      if (!active) {
        const btn = document.createElement("button");
        btn.className = "buy-btn";
        btn.textContent =
          window.gameState.money >= 0 ? "Solicitar" : "Sin fondos";
        btn.disabled = window.gameState.money < 0;
        btn.onclick = () => {
          if (window.takeLoan(loanId)) {
            renderLoansMenu();
            renderResearchMenu();
          }
        };
        item.appendChild(btn);
      } else {
        const owed = document.createElement("div");
        owed.className = "loan-owed";
        owed.textContent = `Deuda restante: $${totalOwed - active.paid}`;
        item.appendChild(owed);

        const btnPay = document.createElement("button");
        btnPay.className = "pay-btn";
        btnPay.textContent = "Pagar préstamo";
        btnPay.onclick = () => {
          if (window.payLoan(loanId)) {
            renderLoansMenu();
            renderResearchMenu();
          }
        };
        item.appendChild(btnPay);
      }

      container.appendChild(item);
    });
  }

  function renderBuildMenu() {
    const container = document.getElementById("switches-list");
    if (!container) return;

    container.innerHTML = "";

    const switches = [
      { id: "switch8", name: "Switch 8 puertos", cost: 250 },
      { id: "switch16", name: "Switch 16 puertos", cost: 450 },
      { id: "switch24", name: "Switch 24 puertos", cost: 700 },
      ...(window.gameState.switch48Unlocked
        ? [{ id: "switch48", name: "Switch 48 puertos", cost: 1200 }]
        : []),
    ];

    switches.forEach((sw) => {
      const item = document.createElement("div");
      item.className = "switch-item";
      item.innerHTML = `
        <div class="switch-name">${sw.name}</div>
        <div class="switch-cost">$${sw.cost}</div>
      `;

      const btn = document.createElement("button");
      btn.className = "buy-btn";
      btn.textContent =
        window.gameState.money >= sw.cost ? "Comprar" : "Sin fondos";
      btn.disabled = window.gameState.money < sw.cost;
      btn.onclick = () => {
        window.buySwitch(sw.id);
        renderBuildMenu();
      };

      item.appendChild(btn);
      container.appendChild(item);
    });
  }

  function renderCableTools() {
    const container = document.getElementById("media-list");
    if (!container) return;

    container.innerHTML = "";
    const selectedTool = window.gameState?.selectedTool || null;
    const types = window.CABLE_TYPES || {};

    Object.entries(types).forEach(([id, cable]) => {
      const isActive = selectedTool === id;
      const card = document.createElement("div");
      card.className = `cable-card ${isActive ? "active" : ""}`;
      card.style.cssText = `
        background: ${isActive ? "#1e3a5f" : "#1e293b"};
        border: 2px solid ${isActive ? "#3b82f6" : "#334155"};
        border-radius: 8px;
        padding: 10px 12px;
        cursor: pointer;
        margin-bottom: 8px;
        transition: all 0.2s;
      `;

      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
          <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:${cable.color}; flex-shrink:0;"></span>
          <strong style="color:#f1f5f9; font-size:0.9rem;">${cable.name}</strong>
        </div>
        <div style="color:#94a3b8; font-size:0.78rem; margin-bottom:6px;">${cable.description || ""}</div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="color:#cbd5e1; font-size:0.75rem;">Velocidad: ${cable.speed}x</span>
          <span style="color:#22c55e; font-weight:bold; font-size:0.85rem;">$${typeof window.getCablePrice === "function" ? window.getCablePrice(id) : cable.cost}</span>
        </div>
      `;

      card.onclick = () => {
        window.selectTool(id);
        renderCableTools();
      };

      container.appendChild(card);
    });
  }
  /* ------------------------------------------------------------------------
     MODAL DE VENTA
     ------------------------------------------------------------------------ */
  function setupSellModal() {
    // El modal de venta ya se configura en network.js
    // Aquí solo nos aseguramos de que se cierre al hacer clic fuera
    const modal = document.getElementById("sell-modal");
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.style.display = "none";
        }
      });
    }
  }

  /* ------------------------------------------------------------------------
     ACTUALIZACIÓN DE MENÚS
     ------------------------------------------------------------------------ */
  function updateMenus() {
    // Definimos el orden en una lista
    const menuRenderers = [
      { name: "Cables", fn: renderCableTools },
      { name: "Switches", fn: renderBuildMenu },
      { name: "Investigaciones", fn: renderResearchMenu },
      { name: "Préstamos", fn: renderLoansMenu },
    ];

    // Ejecutamos cada uno individualmente dentro de un 'try/catch'
    menuRenderers.forEach((menu) => {
      try {
        console.log(`Intentando renderizar: ${menu.name}`);
        menu.fn();
      } catch (error) {
        console.error(`Error crítico al renderizar ${menu.name}:`, error);
      }
    });
  }

  /* ------------------------------------------------------------------------
     EXPOSICIÓN GLOBAL
     ------------------------------------------------------------------------ */
  window.initUI = initUI;
  window.updateMenus = updateMenus;
  window.renderResearchMenu = renderResearchMenu;
  window.renderLoansMenu = renderLoansMenu;
  window.renderBuildMenu = renderBuildMenu;
  window.renderCableTools = renderCableTools;
  window.openGlossaryModal = openGlossaryModal;
  window.closeGlossaryModal = closeGlossaryModal;
  window.setupGlossary = setupGlossary;

  /* ------------------------------------------------------------------------
     FUNCIONES DE PAUSA Y GAME OVER (movidas del segundo IIFE)
     ------------------------------------------------------------------------ */
  // Estado global
  window.gameState = window.gameState || {};
  window.gameState.isGameOver = window.gameState.isGameOver || false;

  const gameContainer = document.getElementById("game-container");
  const pauseOverlay = document.getElementById("pause-overlay");

  // Utility: bloquear/permitir eventos de teclado salvo los permitidos
  function keyboardFilter(e) {
    // permitir tecla Escape o P para reanudar solo si no es GameOver
    if (window.gameState.isGameOver) {
      // en Game Over solo evitar todo (o permitir F5)
      e.stopImmediatePropagation();
      e.preventDefault();
      return;
    }
    // En pausa, permitir solo teclas específicas (p = toggle)
    if (gameContainer && gameContainer.classList.contains("paused")) {
      const allowed = ["p", "P", "Escape"];
      if (!allowed.includes(e.key)) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    }
  }

  // Mostrar overlay en modo (pause | gameover)
  function showOverlay(mode, details) {
    // mode: 'pause' | 'gameover' | 'victory'
    if (pauseOverlay) {
      pauseOverlay.classList.add("overlay", "active");
      pauseOverlay.classList.remove("game-over", "victory-mode");
      pauseOverlay.innerHTML = ""; // limpiar

      const panel = document.createElement("div");
      panel.className = "pause-panel";

      const text = document.createElement("div");
      text.className =
        mode === "gameover"
          ? "game-over-text"
          : mode === "victory"
            ? "victory-text"
            : "pause-text";
      text.textContent =
        mode === "gameover"
          ? "GAME OVER"
          : mode === "victory"
            ? "🏆 ¡VICTORIA!"
            : "JUEGO PAUSADO";

      // Mostrar información adicional en pausa
      if (mode === "pause" && window.gameState) {
        const info = document.createElement("div");
        info.style.marginTop = "8px";
        info.style.fontSize = "0.9rem";
        info.style.color = "#94a3b8";
        info.textContent = `Día ${window.gameState.day} - Semana ${window.gameState.week} | Salud: ${Math.round(window.gameState.health)}%`;
        panel.appendChild(info);
      }
      panel.appendChild(text);

      if (details && typeof details === "string") {
        const sub = document.createElement("div");
        sub.style.marginTop = "8px";
        sub.style.color = "#94a3b8";
        sub.style.fontSize = "0.95rem";
        sub.innerHTML = details;
        panel.appendChild(sub);
      }

      const buttons = document.createElement("div");
      buttons.className = "pause-buttons";

      if (mode === "pause") {
        const resume = document.createElement("button");
        resume.id = "btn-resume";
        resume.className = "control-btn";
        resume.textContent = "Continuar";
        resume.onclick = () => {
          if (window.gameState?.isGameOver) return;
          setPaused(false);
        };
        buttons.appendChild(resume);

        const glossaryBtn = document.createElement("button");
        glossaryBtn.className = "control-btn";
        glossaryBtn.textContent = "Glosario";
        glossaryBtn.onclick = () => {
          if (typeof window.openGlossaryModal === "function") {
            window.openGlossaryModal();
          }
        };
        buttons.appendChild(glossaryBtn);

        const menuBtn = document.createElement("button");
        menuBtn.className = "control-btn";
        menuBtn.textContent = "Menú Principal";
        menuBtn.onclick = () => {
          if (typeof window.returnToMenu === "function") {
            window.returnToMenu();
          } else {
            window.location.reload();
          }
        };
        buttons.appendChild(menuBtn);
      } else {
        // gameover o victory => mostrar botones de nuevo juego, glosario y menú principal
        const newGameBtn = document.createElement("button");
        newGameBtn.className = "control-btn";
        newGameBtn.textContent = "Nuevo Juego";
        newGameBtn.onclick = () => {
          if (typeof window.restartGame === "function") {
            window.restartGame();
          } else {
            window.location.reload();
          }
        };
        buttons.appendChild(newGameBtn);

        const glossaryBtn = document.createElement("button");
        glossaryBtn.className = "control-btn";
        glossaryBtn.textContent = "Glosario";
        glossaryBtn.onclick = () => {
          if (typeof window.openGlossaryModal === "function") {
            window.openGlossaryModal();
          }
        };
        buttons.appendChild(glossaryBtn);

        const menuBtn = document.createElement("button");
        menuBtn.className = "control-btn";
        menuBtn.textContent = "Menú Principal";
        menuBtn.onclick = () => {
          if (typeof window.returnToMenu === "function") {
            window.returnToMenu();
          } else {
            window.location.reload();
          }
        };
        buttons.appendChild(menuBtn);
      }

      panel.appendChild(buttons);
      pauseOverlay.appendChild(panel);

      // Keyboard filter ya se instala en el código existente
      document.addEventListener("keydown", keyboardFilter, true);
    }
  }

  function setVictory(details) {
    window.gameState.isGameOver = true;
    if (gameContainer) {
      gameContainer.classList.add("paused");
      showOverlay("victory", details || "");
      // deshabilitar botones como hace setGameOver
      document
        .querySelectorAll(
          ".control-btn, .sidebar-btn, .tool-btn, .buy-btn, .event-option-btn",
        )
        .forEach((el) => {
          el.dataset._wasDisabled = el.disabled ? "1" : "0";
          el.disabled = true;
        });
    }
  }
  window.setVictory = setVictory;

  function hideOverlay() {
    if (pauseOverlay) {
      pauseOverlay.classList.remove("active", "game-over");
      pauseOverlay.innerHTML = "";
      document.removeEventListener("keydown", keyboardFilter, true);
    }
  }

  // Poner el juego en pausa / quitar pausa
  function setPaused(paused) {
    // Si GameOver, no permitas reanudar
    if (window.gameState.isGameOver && paused === false) {
      // no reanudar tras game over
      return;
    }

    if (paused) {
      if (gameContainer) gameContainer.classList.add("paused");
      // show overlay with resume
      showOverlay("pause");

      // Asegurar que botones y controles quedan visualmente deshabilitados por overlay
      // (el overlay captura eventos; aquí opcionalmente se marcan disabled para estilos)
      document
        .querySelectorAll(
          ".control-btn, .sidebar-btn, .tool-btn, .buy-btn, .event-option-btn",
        )
        .forEach((el) => {
          // En js/ui.js, dentro de setPaused(paused):
          if (el.id === "btn-resume" || el.id === "btn-pause") return;
          el.dataset._wasDisabled = el.disabled ? "1" : "0";
          el.disabled = true;
        });
    } else {
      // quitar pausa si no estamos en game over
      if (window.gameState.isGameOver) return;
      if (gameContainer) gameContainer.classList.remove("paused");
      hideOverlay();

      // restaurar disabled
      document
        .querySelectorAll(
          ".control-btn, .sidebar-btn, .tool-btn, .buy-btn, .event-option-btn",
        )
        .forEach((el) => {
          if (el.dataset._wasDisabled === "1") el.disabled = true;
          else el.disabled = false;
          delete el.dataset._wasDisabled;
        });
    }
  }

  // Llamar cuando quieras marcar Game Over
  function setGameOver() {
    window.gameState.isGameOver = true;
    // Asegurar que el juego quede difuminado e inactivo
    if (gameContainer) gameContainer.classList.add("paused");
    showOverlay("gameover");

    // deshabilitar todos los botones (incluido pause)
    document
      .querySelectorAll(
        ".control-btn, .sidebar-btn, .tool-btn, .buy-btn, .event-option-btn",
      )
      .forEach((el) => {
        el.dataset._wasDisabled = el.disabled ? "1" : "0";
        el.disabled = true;
      });
  }

  // Función para volver al menú principal
  function returnToMenu() {
    const menuScreen = document.getElementById("menu-screen");
    if (menuScreen) {
      menuScreen.style.display = "block";
    }
    // Reiniciar el juego
    if (typeof window.restartGame === "function") {
      window.restartGame();
    } else {
      window.location.reload();
    }
  }

  // Exponer funciones globales
  window.setPaused = setPaused;
  window.setGameOver = setGameOver;
  window.returnToMenu = returnToMenu;
})();

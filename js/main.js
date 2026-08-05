/* ====
   main.js - Núcleo del juego
   ==== */

/* ----
   CONFIGURACIÓN GLOBAL
   ---- */
const CONFIG = {
  // Tiempo
  msPerDay: 15000, //  30 segundos por día en velocidad normal
  daysPerWeek: 7,

  // Económicos
  startingMoney: 1200,
  startingIntel: 2,
  startingHealth: 100,
  maxHealth: 100,
  packetBaseReward: 2,
  dailyIncomePerEndpoint: 15,
  fiberSpeedMultiplier: 1.5,
  sellReturnRate: 0.4,

  // Capacitación
  maxEmployeeTraining: 100,
  trainingPerCorrectEvent: 5,
  eventReductionPerTraining: 0.1,

  // Contratacion

  // Préstamos
  loans: {
    small: {
      amount: 500,
      interest: 0.2,
      incomePenalty: 0.1,
      name: "Préstamo Rápido",
    },
    large: {
      amount: 1500,
      interest: 0.35,
      incomePenalty: 0.25,
      name: "Línea de Crédito",
    },
  },

  // Investigaciones
  researches: {
    "employee-training": {
      id: "employee-training",
      title: "Capacitación de Empleados",
      costMoney: 700,
      costIntel: 0,
      description: "+15% de capacitación inicial. Reduce riesgo de phishing.",
      effect: { training: 15 },
    },
    "ids-system": {
      id: "ids-system",
      title: "Sistema IDS Básico",
      costMoney: 900,
      costIntel: 3,
      description: "Detecta intrusiones más rápido. +1 PI por evento resuelto.",
      effect: { intelPerEvent: 1 },
    },
    "firewall-basics": {
      id: "firewall-basics",
      title: "Firewall Empresarial",
      costMoney: 1000,
      costIntel: 1,
      description: "Prepara la red para futuras defensas automáticas.",
      effect: { defenseReady: true },
    },
    "dual-nic": {
      id: "dual-nic",
      title: "Tarjeta de Red Dual",
      costMoney: 800,
      costIntel: 2,
      description:
        "Agrega un segundo puerto a todos los endpoints. Permite topologías más complejas.",
      effect: { endpointMaxPorts: 2 },
    },

    "switch-firmware": {
      id: "switch-firmware",
      title: "Firmware Optimizado",
      costMoney: 800,
      costIntel: 2,
      description: "Todos los switches futuros ganan +4 puertos.",
      effect: { switchExtraPorts: 4 },
    },
    "enterprise-switch": {
      id: "enterprise-switch",
      title: "Switch Empresarial",
      costMoney: 1500,
      costIntel: 4,
      description:
        "Desbloquea el Switch 48 puertos ($1200) en el menú de compra.",
      effect: { unlockSwitch48: true },
    },

    // --- Seguridad ---
    "advanced-firewall": {
      id: "advanced-firewall",
      title: "Firewall Avanzado",
      costMoney: 1400,
      costIntel: 3,
      requires: "firewall-basics",
      description: "Reduce el daño de eventos DDoS y ransomware en un 30%.",
      effect: { reduceDDoSDamage: 0.3 },
    },
    siem: {
      id: "siem",
      title: "Sistema SIEM",
      costMoney: 1600,
      costIntel: 5,
      requires: "ids-system",
      description: "Monitoreo centralizado. +2 PI por cada evento resuelto.",
      effect: { intelPerEvent: 2 },
    },
    "vpn-tunnel": {
      id: "vpn-tunnel",
      title: "VPN Empresarial",
      costMoney: 1000,
      costIntel: 2,
      description: "Reduce probabilidad de phishing y MitM en 30%.",
      effect: { phishingResistance: 0.3 },
    },
    "backup-policy": {
      id: "backup-policy",
      title: "Política de Backups",
      costMoney: 900,
      costIntel: 2,
      description: "El ransomware ya no puede dañar la salud de la red.",
      effect: { ransomwareImmunity: true },
    },
    "zero-trust": {
      id: "zero-trust",
      title: "Arquitectura Zero Trust",
      costMoney: 2000,
      costIntel: 6,
      requires: "ids-system",
      description: "Eventos de intrusión aparecen con 40% menos frecuencia.",
      effect: { intrusionReduction: 0.4 },
    },

    // --- Red y rendimiento ---
    "link-aggregation": {
      id: "link-aggregation",
      title: "Agregación de Links",
      costMoney: 1300,
      costIntel: 3,
      requires: "switch-firmware",
      description:
        "Cat6A y Fibra Multimodo reducen su cooldown en 15% adicional.",
      effect: { topCableCooldownBonus: 0.85 },
    },
    // --- Personal ---
    "advanced-training": {
      id: "advanced-training",
      title: "Capacitación Avanzada",
      costMoney: 1200,
      costIntel: 2,
      requires: "employee-training",
      description: "+20% de capacitación adicional al personal.",
      effect: { training: 20 },
    },

    "total-training": {
      id: "total-training",
      title: "Capacitación Total",
      costMoney: 2000,
      costIntel: 5,
      requires: "employee-training",
      description: "+40% de capacitación adicional al personal.",
      effect: { training: 40 },
    },

    "security-awareness": {
      id: "security-awareness",
      title: "Cultura de Ciberseguridad",
      costMoney: 800,
      costIntel: 3,
      requires: "employee-training",
      description: "El tiempo de respuesta en eventos sube de 10s a 25s.",
      effect: { eventExtraTime: 5 },
    },

    // --- Economía ---
    "managed-services": {
      id: "managed-services",
      title: "Servicios Gestionados",
      costMoney: 1800,
      costIntel: 3,
      description:
        "+$5 extra por paquete entregado cuando hay 20+ nodos conectados.",
      effect: { packetBonusAt20Nodes: 5 },
    },
    "green-it": {
      id: "green-it",
      title: "Green IT",
      costMoney: 700,
      costIntel: 1,
      description: "Reduce el costo de todos los cables en 10%.",
      effect: { cableCostDiscount: 0.1 },
    },

    "weekly-intel": {
      id: "weekly-intel",
      title: "Programa de Inteligencia Semanal",
      costMoney: 1600,
      costIntel: 3,
      description: "Aporta +2 PI al final de cada semana.",
      effect: { intelPerWeek: 2 },
    },
  },
};

/* ----
   ESTADO GLOBAL
   ---- */
const gameState = {
  money: CONFIG.startingMoney,
  intelPoints: CONFIG.startingIntel,
  health: CONFIG.startingHealth,
  maxHealth: CONFIG.maxHealth,
  employeeTraining: 0,

  day: 1,
  week: 1,
  weekday: 0, // 0=Lunes ... 6=Domingo

  isPaused: true,
  isEditMode: true,
  speed: 0,
  selectedTool: null,

  nodes: [],
  connections: [],

  researches: [],
  loans: [],

  activeThreats: [],
  defenses: [],

  eventActive: false,
  phishingBonus: 0,
  phishingBonusExpiresDay: null,

  totalPacketsDelivered: 0,
  totalMoneyEarned: 0,

  gameOver: false,
};

/* ----
   VARIABLES DE CONTROL
   ---- */
let gameLoopId = null;
let lastTick = 0;
let dayAccumulator = 0; // acumulador para avance de días
let packetAccumulator = 0;

let hiringCooldown = 0;
const HIRING_COOLDOWN_DAYS = 7; // mínimo 1 semana entre contrataciones

let pcCounter = 2;
function nextPCName() {
  return `PC ${++pcCounter}`;
}

let serverGrowthCooldown = 0;
const SERVER_GROWTH_COOLDOWN_DAYS = 14; // mínimo 2 semanas entre servidores

let serverCounter = 0;
function nextServerName() {
  return `Servidor ${++serverCounter}`;
}

let saturationDamageAccumulator = 0;
const SATURATION_DAMAGE_INTERVAL = 3000; // 1000ms = 1 segundo

/* ----
   INICIALIZACIÓN
   ---- */
function initGame() {
  updateHUD();
  setPause(true);
  // El workspace siempre está en modo edición — no hay toggle
  const workspace = document.getElementById("workspace");
  if (workspace) workspace.classList.add("edit-mode");
  showNotification("Bienvenido, ¡Suerte en tu intento!");
}

/* ----
   PAUSA, VELOCIDAD Y MODO EDICIÓN
   ---- */
function setPause(paused) {
  gameState.isPaused = Boolean(paused);
  const workspace = document.getElementById("workspace");
  const pauseOverlay = document.getElementById("pause-overlay");
  const btnPause = document.getElementById("btn-pause");

  if (workspace) workspace.classList.toggle("paused", gameState.isPaused);
  if (pauseOverlay) pauseOverlay.classList.toggle("active", gameState.isPaused);
  if (btnPause) {
    btnPause.textContent = gameState.isPaused ? "▶️ Reanudar" : "⏸️ Pausa";
    btnPause.classList.toggle("active", gameState.isPaused);
  }

  if (gameState.isPaused) {
    stopLoop();
  } else {
    startLoop();
  }
}

function setSpeed(speed) {
  gameState.speed = speed;
  document
    .querySelectorAll("#top-controls .control-btn")
    .forEach((btn) => btn.classList.remove("active"));

  const btn = document.getElementById(
    speed === 2 ? "btn-speed-fast" : "btn-speed-normal",
  );
  if (btn) btn.classList.add("active");

  if (speed > 0 && gameState.isPaused) {
    setPause(false);
  } else if (speed === 0) {
    setPause(true);
  }
}

function setEditMode() {
  // Siempre en modo edición — función mantenida por compatibilidad con otros módulos
  gameState.isEditMode = true;
  const workspace = document.getElementById("workspace");
  if (workspace) workspace.classList.add("edit-mode");
}

/* ----
   GAME LOOP
   ---- */
function startLoop() {
  if (gameLoopId) return;
  lastTick = performance.now();
  dayAccumulator = 0;
  gameLoopId = requestAnimationFrame(loop);
}

function stopLoop() {
  if (gameLoopId) {
    cancelAnimationFrame(gameLoopId);
    gameLoopId = null;
  }
}

function loop(now) {
  if (!gameState.speed || gameState.isPaused || gameState.gameOver) {
    gameLoopId = null;
    return;
  }

  const effectiveMsPerDay = CONFIG.msPerDay / gameState.speed;
  const rawDelta = now - lastTick;
  lastTick = now;

  const delta = Math.min(rawDelta, effectiveMsPerDay * 2);

  dayAccumulator += delta;
  while (dayAccumulator >= effectiveMsPerDay) {
    dayAccumulator -= effectiveMsPerDay;
    advanceDay();
  }

  // Aplicar daño por saturación en tiempo real
  applyRealTimeSaturationDamage(delta);

  updateVisualSpawns(delta);
  updateDisconnectedVisuals();
  gameLoopId = requestAnimationFrame(loop);
}

/* ----
   AVANCE DEL TIEMPO
   ---- */
function advanceDay() {
  // Forzar cierre de evento si está activo por más de 20 segundos (seguridad)
  if (gameState.eventActive && gameState.eventStartTime) {
    const now = Date.now();
    const eventDuration = now - gameState.eventStartTime;
    if (eventDuration > 20000) { // 20 segundos
      gameState.eventActive = false;
      if (typeof window.showNotification === "function") {
        window.showNotification("Evento cancelado por tiempo de espera.", "warning");
      }
    }
  }
  if (gameState.isPaused || gameState.eventActive || gameState.gameOver) return;

  gameState.day++;
  const prevWeekday = gameState.weekday;
  gameState.weekday = (gameState.weekday + 1) % CONFIG.daysPerWeek;

  // Al terminar el domingo (weekday vuelve a 0 = nuevo lunes)
  if (gameState.weekday === 0) {
    gameState.week++;
    restoreWeeklyHealth();
    if (typeof processLoans === "function") processLoans();
    showNotification(
      `🗓️ Semana ${gameState.week} iniciada. +10 salud recuperada.`,
      "success",
    );
  }

  if (typeof applyDailyIncome === "function") applyDailyIncome();
  applyTrafficSaturation();
  if (typeof applyLoanPenalties === "function") applyLoanPenalties();
  if (typeof tryTriggerSecurityEvent === "function") tryTriggerSecurityEvent();
  if (typeof window.tryTriggerPositiveEvent === "function")
    window.tryTriggerPositiveEvent();
  if (typeof applyInfectedNodeDamage === "function") applyInfectedNodeDamage();

  // Expirar bonus temporal de phishing
  if (
    gameState.phishingBonus > 0 &&
    gameState.phishingBonusExpiresDay !== null &&
    gameState.day >= gameState.phishingBonusExpiresDay
  ) {
    gameState.phishingBonus = 0;
    gameState.phishingBonusExpiresDay = null;
    showNotification("⏰ El bonus anti-phishing ha expirado.", "warning");
  }

  tryHiringEvent();
  tryServerGrowthEvent();
  checkGameOver();
  checkVictory();
  updateHUD();
}

/* ----
   SALUD SEMANAL (+20 al terminar la semana)
   ---- */
function restoreWeeklyHealth() {
  const healAmount = 10;
  if (typeof restoreHealth === "function") {
    restoreHealth(healAmount);
  } else {
    gameState.health = Math.min(
      CONFIG.maxHealth,
      gameState.health + healAmount,
    );
    updateNetworkHealth();
  }

  // --- NUEVO: Bonus de PI por investigaciones al final de la semana ---
  let intelBonusFromResearch = 0;
  if (Array.isArray(gameState.researches)) {
    gameState.researches.forEach((rId) => {
      const r = CONFIG.researches?.[rId];
      if (r?.effect?.intelPerWeek) {
        intelBonusFromResearch += Number(r.effect.intelPerWeek);
      }
    });
  }
  if (intelBonusFromResearch > 0) {
    gameState.intelPoints =
      (gameState.intelPoints || 0) + intelBonusFromResearch;
    if (typeof updateHUD === "function") updateHUD();
    if (typeof updateMoneyUI === "function") updateMoneyUI();
    if (typeof showNotification === "function") {
      showNotification(
        `🔬 +${intelBonusFromResearch} PI otorgados por investigaciones (fin de semana)`,
        "success",
      );
    }
  }
}

/* ----
   SISTEMA DE PAQUETES
   ---- */

// Función centralizada para aplicar daño a la salud de la red
function applyHealthDamage(amount) {
  amount = Math.max(0, Math.floor(amount || 0));
  if (!amount) return;
  gameState.health = Math.max(0, gameState.health - amount);
  updateNetworkHealth();
  showNotification(`💔 Red dañada: -${amount} salud`, "danger");
  checkGameOver();
}

const PACKET_GEN_MIN = 2500; // ms mínimo entre generaciones
const PACKET_GEN_MAX = 4500; // ms máximo entre generaciones // ms entre generaciones por nodo

function updateNodePacketBadge(node) {
  if (!node.element) return;
  let badge = node.element.querySelector(".packet-badge");
  if (!badge) {
    badge = document.createElement("div");
    badge.className = "packet-badge";
    node.element.appendChild(badge);
  }
  const count = node.waitingPackets || 0;
  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";
  const overloadAt = window.gameState.overloadBadgeAt || 6;
  node.element.classList.toggle("packets-overloaded", count >= overloadAt);
  // Pulso rojo en borde: SOLO cuando hay 10+ paquetes acumulados
  node.element.classList.toggle("packet-overload", count >= 10);
}

function hasRouteToRouter(nodeId) {
  const visited = new Set();
  const queue = [nodeId];
  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);
    const node = gameState.nodes.find((n) => n.id === current);
    if (node && node.type === "router") return true;
    gameState.connections
      .filter((c) => c.from === current || c.to === current)
      .forEach((c) => {
        const neighbor = c.from === current ? c.to : c.from;
        if (!visited.has(neighbor)) queue.push(neighbor);
      });
  }
  return false;
}

// Devuelve true si existe una ruta entre aId y bId y esa ruta incluye al menos
// un nodo de tipo "router". Si la única ruta entre ambos no pasa por un router,
// devuelve false.
function pathIncludesRouterBetween(aId, bId) {
  const visited = new Set();
  const queue = [[aId, [aId]]];

  while (queue.length > 0) {
    const [current, path] = queue.shift();
    if (current === bId) {
      // comprobamos si el camino contiene un router
      for (const id of path) {
        const node = gameState.nodes.find((n) => n.id === id);
        if (node?.type === "router") return true;
      }
      return false;
    }

    if (visited.has(current)) continue;
    visited.add(current);

    gameState.connections
      .filter((c) => c.from === current || c.to === current)
      .forEach((c) => {
        const neighbor = c.from === current ? c.to : c.from;
        if (!visited.has(neighbor)) {
          queue.push([neighbor, path.concat(neighbor)]);
        }
      });
  }

  return false;
}

function applyTrafficSaturation() {
  // Esta función solo actualiza el estado lógico (traffic-saturated).
  // El daño real por saturación lo maneja applyRealTimeSaturationDamage
  // (basado en paquetes >= 10), para evitar daños masivos por trafficLoad sin techo.
  gameState.nodes.forEach((node) => {
    const waiting = node.waitingPackets || 0;
    const hasRoute = hasRouteToRouter(node.id);

    // trafficLoad: sube si tiene muchos paquetes esperando, baja si está limpio.
    // Tiene techo en 10 para evitar daños explosivos.
    if (hasRoute && waiting >= 8) {
      node.trafficLoad = Math.min(10, (node.trafficLoad || 0) + 1);
    } else {
      node.trafficLoad = Math.max(0, (node.trafficLoad || 0) - 0.5);
    }

    const overloaded = node.trafficLoad >= 5;
    const wasSaturated = !!node.trafficSaturated;
    node.trafficSaturated = overloaded;

    // Solo actualizar visual si cambió el estado
    if (overloaded !== wasSaturated) {
      if (typeof window.updateNodeVisuals === "function") {
        window.updateNodeVisuals(node);
      } else if (node.element) {
        node.element.classList.toggle("traffic-saturated", overloaded);
      }
    }
  });
}

// Nueva función para daño constante por saturación
function applyRealTimeSaturationDamage(delta) {
  if (gameState.isPaused || gameState.eventActive || gameState.gameOver) return;

  // Acumular tiempo
  saturationDamageAccumulator += delta;

  // Solo aplicar daño cada cierto intervalo
  if (saturationDamageAccumulator >= SATURATION_DAMAGE_INTERVAL) {
    saturationDamageAccumulator = 0; // Resetear acumulador

    let saturatedNodeCount = 0;

    // Solo endpoints saturados cuentan (switches/routers reenvían paquetes, es normal)
    gameState.nodes.forEach((node) => {
      if (node.type !== "endpoint" && node.type !== "server") return;

      const packetCount = node.waitingPackets || 0;
      if (packetCount >= 10) {
        saturatedNodeCount++;
      }
    });

    // Daño de 2 por endpoint saturado (era 5, demasiado agresivo)
    if (saturatedNodeCount > 0) {
      const totalSaturationDamage = 2 * saturatedNodeCount;

      // Aplicar el daño a la salud
      gameState.health = Math.max(0, gameState.health - totalSaturationDamage);

      // Actualizar HUD y verificar Game Over
      updateNetworkHealth();
      checkGameOver();

      // Mostrar notificación solo si hay daño
      showNotification(
        `💔 Red saturada: -${totalSaturationDamage} salud`,
        "danger",
      );
    }
  }
}

// Procesar colas de cada cable
function processConnectionQueues(now) {
  gameState.connections.forEach((connection) => {
    if (!connection.packetQueue || connection.packetQueue.length === 0) return;
    if (connection.cooldownUntil && now < connection.cooldownUntil) return;

    const packet = connection.packetQueue.shift();
    const cableType = window.CABLE_TYPES?.[connection.type];
    const cooldown = (cableType?.cooldown || 1500) / (gameState.speed || 1);
    connection.cooldownUntil = now + cooldown;
    // spawnPacket tendrá la validación final (pathIncludesRouterBetween)
    spawnPacket(connection, packet.flip);
  });
}

function updateVisualSpawns(delta) {
  if (gameState.isPaused || gameState.eventActive) return;

  // 1. Solo endpoints y servers generan paquetes — routers y switches NO
  gameState.nodes.forEach((node) => {
    if (node.type !== "endpoint" && node.type !== "server") return;
    if (!node.packetGenAcc) node.packetGenAcc = 0;
    node.packetGenAcc += delta;
    if (!node.nextGenInterval)
      node.nextGenInterval =
        PACKET_GEN_MIN + Math.random() * (PACKET_GEN_MAX - PACKET_GEN_MIN);
    const genInterval = node.nextGenInterval / (gameState.speed || 1);
    if (node.packetGenAcc >= genInterval) {
      node.packetGenAcc = 0;
      node.nextGenInterval =
        PACKET_GEN_MIN + Math.random() * (PACKET_GEN_MAX - PACKET_GEN_MIN); // nuevo intervalo aleatorio
      if (!node.waitingPackets) node.waitingPackets = 0;
      if (node.waitingPackets < 10) {
        node.waitingPackets++;
        updateNodePacketBadge(node);
      }
    }
  });

  // 2. Cada cable despacha paquetes de sus nodos cuando su cooldown termina
  const now = performance.now();

  // Procesar colas de conexión
  processConnectionQueues(now);

  gameState.connections.forEach((connection) => {
    if (connection.cooldownUntil && now < connection.cooldownUntil) return;

    const fromNode = gameState.nodes.find((n) => n.id === connection.from);
    const toNode = gameState.nodes.find((n) => n.id === connection.to);
    if (!fromNode || !toNode) return;

    const fromWaiting = fromNode.waitingPackets || 0;
    const toWaiting = toNode.waitingPackets || 0;
    if (fromWaiting === 0 && toWaiting === 0) return;

    // REGLA DE BLOQUEO: si AMBOS nodos no tienen ruta al router, bloquear paquetes aquí
    const fromHasRoute = hasRouteToRouter(fromNode.id);
    const toHasRoute = hasRouteToRouter(toNode.id);

    if (!fromHasRoute && !toHasRoute) {
      // Penalizar ambos nodos por intentar comunicación ilegal
      fromNode.trafficLoad = (fromNode.trafficLoad || 0) + 0.5;
      toNode.trafficLoad = (toNode.trafficLoad || 0) + 0.5;
      updateNodePacketBadge(fromNode);
      updateNodePacketBadge(toNode);
      if (typeof window.updateNodeVisuals === "function") {
        window.updateNodeVisuals(fromNode);
        window.updateNodeVisuals(toNode);
      }
      return;
    }

    // Dirección: el nodo con más paquetes manda primero
    let sender, flip;
    if (toWaiting > fromWaiting) {
      sender = toNode;
      flip = true;
    } else {
      sender = fromNode;
      flip = false;
    }

    // Verificar cooldown de procesamiento del nodo receptor
    const receiver = flip ? fromNode : toNode;
    if (receiver.processCooldownUntil && now < receiver.processCooldownUntil)
      return;

    sender.waitingPackets = Math.max(0, sender.waitingPackets - 1);
    updateNodePacketBadge(sender);

    const cableType = window.CABLE_TYPES?.[connection.type];
    const cooldown = (cableType?.cooldown || 1500) / (gameState.speed || 1);
    connection.cooldownUntil = now + cooldown;

    // Cooldown de procesamiento del receptor (según tipo de nodo)
    const processTimes = {
      router: 200,
      switch8: 400,
      switch16: 300,
      switch24: 250,
      endpoint: 800,
      server: 500,
    };
    const processTime =
      (processTimes[receiver.type] || 600) / (gameState.speed || 1);
    receiver.processCooldownUntil = now + processTime;

    // Verificar que el sender tenga ruta al router (basta con BFS simple)
    if (!hasRouteToRouter(sender.id)) return;

    // Si llega aquí, hay ruta al router -> proceder con envío
    spawnPacket(connection, flip);
  });
}

function spawnPacket(connection, flip = Math.random() < 0.5) {
  const fromNode = gameState.nodes.find(
    (n) => n.id === (flip ? connection.to : connection.from),
  );
  const toNode = gameState.nodes.find(
    (n) => n.id === (flip ? connection.from : connection.to),
  );
  if (!fromNode || !toNode) return;

  // Protección final: el sender debe tener ruta al router (no bloquear hops intermedios)
  if (!hasRouteToRouter(fromNode.id)) return;

  // ✅ Sender tiene ruta al router, continuar...
  const t = (connection.type || "").toLowerCase();
  const isFiber = t === "fibra" || t.includes("fiber") || t.includes("fibra");
  const speed =
    (isFiber ? CONFIG.fiberSpeedMultiplier : 1) * (gameState.speed || 1);
  const duration = 1500 / speed;

  const svg = document.getElementById("connections-layer");
  if (!svg) return;

  // Obtener centro del nodo desde el elemento DOM
  const fromEl = document.getElementById(fromNode.id);
  const toEl = document.getElementById(toNode.id);
  const workspaceEl = document.getElementById("workspace");

  if (!fromEl || !toEl || !workspaceEl) return;

  // offsetLeft/offsetTop: coordenadas relativas al workspace, inmunes al zoom del navegador
  const x1 = fromEl.offsetLeft + fromEl.offsetWidth / 2;
  const y1 = fromEl.offsetTop + fromEl.offsetHeight / 2;
  const x2 = toEl.offsetLeft + toEl.offsetWidth / 2;
  const y2 = toEl.offsetTop + toEl.offsetHeight / 2;

  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
  );
  circle.setAttribute("r", "6");
  circle.setAttribute("fill", isFiber ? "#22d3ee" : "#a3e635");
  circle.setAttribute("opacity", "0.9");

  const animate = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "animateMotion",
  );
  animate.setAttribute("dur", `${duration}ms`);
  animate.setAttribute("repeatCount", "1");
  animate.setAttribute("fill", "freeze");
  animate.setAttribute("path", `M ${x1} ${y1} L ${x2} ${y2}`);

  circle.appendChild(animate);
  svg.appendChild(circle);

  animate.beginElement();

  setTimeout(() => {
    circle.remove();
    deliverPacket(toNode, isFiber);
  }, duration);
}

function deliverPacket(node, isFiber) {
  if (gameState.gameOver) return;

  // Routers y switches reenvían el paquete acumulándolo — no dan recompensa
  if (
    node.type === "router" ||
    node.type === "switch8" ||
    node.type === "switch16" ||
    node.type === "switch24" ||
    node.type === "switch48"
  ) {
    if (!node.waitingPackets) node.waitingPackets = 0;
    if (node.waitingPackets < 10) {
      node.waitingPackets++;
      updateNodePacketBadge(node);
    }
    return;
  }

  // Endpoints y servers: dar recompensa solo si tienen ruta al router
  if (!hasRouteToRouter(node.id)) {
    const nodeEl = document.getElementById(node.id);
    const fx = nodeEl ? nodeEl.offsetLeft + nodeEl.offsetWidth / 2 : 0;
    const fy = nodeEl ? nodeEl.offsetTop : 0;
    showFloatingText(`✖ perdido`, fx, fy);
    return;
  }

  const baseReward = CONFIG.packetBaseReward;
  const penalty =
    typeof getTotalIncomePenalty === "function" ? getTotalIncomePenalty() : 0;
  const totalReward = Math.round(baseReward * (1 - penalty) * 100) / 100;

  gameState.money += totalReward;
  gameState.totalMoneyEarned += totalReward;
  gameState.totalPacketsDelivered++;

  const nodeEl = document.getElementById(node.id);
  const fx = nodeEl ? nodeEl.offsetLeft + nodeEl.offsetWidth / 2 : 0;
  const fy = nodeEl ? nodeEl.offsetTop : 0;
  showFloatingText(`+$${totalReward}`, fx, fy);

  if (typeof updateMoneyUI === "function") updateMoneyUI();
  if (typeof updateHUD === "function") updateHUD();
  if (typeof refreshBuildMenus === "function") refreshBuildMenus();
}

// Actualiza la clase node-disconnected según si cada nodo tiene ruta al router
function updateDisconnectedVisuals() {
  gameState.nodes.forEach((node) => {
    if (!node.element) return;
    // El router siempre está "conectado" a sí mismo
    if (node.type === "router") {
      node.element.classList.remove("node-disconnected");
      return;
    }
    const connected = hasRouteToRouter(node.id);
    node.element.classList.toggle("node-disconnected", !connected);
  });
}

function showFloatingText(text, x, y) {
  const layer = document.getElementById("packets-layer");
  if (!layer) return;

  const el = document.createElement("div");
  el.className = "floating-text";
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y - 20}px`;

  layer.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

/* ----
   CONTRATACIÓN Y CRECIMIENTO B2B
   ---- */
// (sin cambios en el resto del archivo — deja las funciones existentes)
function tryHiringEvent() {
  if (gameState.gameOver) return;

  hiringCooldown--;
  if (hiringCooldown > 0) return;

  const roll = Math.random();

  if (roll < 0.01) {
    hiringCooldown = HIRING_COOLDOWN_DAYS;
    const count = 6 + Math.floor(Math.random() * 5); // 6 a 10
    for (let i = 0; i < count; i++) {
      addEndpointNode?.(nextPCName());
    }
    showNotification(
      `🏢 ¡Contratación masiva! Ojala estés listo — ${count} nuevos dispositivos esperan conexión.`,
      "success",
    );
    return;
  }

  if (roll < 0.1) {
    hiringCooldown = HIRING_COOLDOWN_DAYS;
    const count = 2 + Math.floor(Math.random() * 4); // 2 a 5
    for (let i = 0; i < count; i++) {
      addEndpointNode?.(nextPCName());
    }
    showNotification(
      `👥 Nueva gente para colaborar, nuevos nodos que conectar — ${count} dispositivos agregados.`,
      "success",
    );
    return;
  }

  if (roll < 0.7) {
    hiringCooldown = HIRING_COOLDOWN_DAYS;
    addEndpointNode?.(nextPCName());
    showNotification(
      "👤 ¡Dale la bienvenida a tu nuevo compañero! Conéctalo a la red.",
      "success",
    );
    return;
  }
}

function tryServerGrowthEvent() {
  if (gameState.gameOver) return;

  serverGrowthCooldown--;
  if (serverGrowthCooldown > 0) return;

  const roll = Math.random();

  if (roll < 0.03) {
    serverGrowthCooldown = SERVER_GROWTH_COOLDOWN_DAYS;
    const count = 2 + Math.floor(Math.random() * 2); // 2 a 3
    for (let i = 0; i < count; i++) {
      window.addServerNode?.(nextServerName());
    }
    showNotification(
      `🏗️ ¡Expansión de datacenter! Se agregaron ${count} servidores — conéctalos y protégelos.`,
      "success",
    );
    return;
  }

  if (roll < 0.12) {
    serverGrowthCooldown = SERVER_GROWTH_COOLDOWN_DAYS;
    window.addServerNode?.(nextServerName());
    showNotification(
      "🖥️ TI aprobó un nuevo servidor dedicado. Conéctalo a la red.",
      "success",
    );
    return;
  }
}

function tryB2BGrowthEvent() {
  if (gameState.gameOver) return;
  if (Math.random() > 0.08) return;
  const reward = 300 + Math.floor(Math.random() * 5) * 100;
  if (typeof applyMoneyReward === "function") {
    applyMoneyReward(reward);
  } else {
    gameState.money += reward;
    updateMoneyUI();
  }
  showNotification(
    `📈 Nuevo cliente B2B: +$${reward} por contrato de servicio.`,
    "success",
  );
}

/* ----
   GAME OVER
   ---- */
function checkGameOver() {
  if (gameState.health <= 0 && !gameState.gameOver) {
    gameState.gameOver = true;
    gameState.health = 0;
    setPause(true);
    showNotification(
      "💀 GAME OVER: La red ha colapsado. Recarga para intentarlo de nuevo.",
      "danger",
      10000,
    );

    const overlay = document.getElementById("pause-overlay");
    if (overlay) {
      overlay.classList.add("active");
      overlay.innerHTML = '<div class="pause-text">💀 GAME OVER</div>';
    }
  }
}

/* ----
   HUD Y NOTIFICACIONES
   ---- */
function updateMoneyUI() {
  const el = document.getElementById("money-display");
  if (el) el.textContent = `$${gameState.money.toLocaleString()}`;
}

function updateNetworkHealth() {
  const bar = document.getElementById("health-fill");
  const text = document.getElementById("health-text");
  const percentage = Math.round((gameState.health / gameState.maxHealth) * 100);
  if (bar) bar.style.width = `${percentage}%`;
  if (text) text.textContent = `${percentage}%`;
}

function updateTrainingBar() {
  const bar = document.getElementById("training-fill");
  const text = document.getElementById("training-text");
  if (!bar || !text) return;
  bar.style.width = `${gameState.employeeTraining}%`;
  text.textContent = `${gameState.employeeTraining}%`;
}

function updateTimeUI() {
  const el = document.getElementById("time-display");
  if (!el) return;

  const dayName = getWeekdayName(gameState.weekday);
  const isLastDay = gameState.weekday === 6; // Domingo
  el.textContent = `Sem ${gameState.week} · ${dayName}`;
  el.title = `Día ${gameState.day} total`;

  // Resaltar el domingo (último día antes de recuperar salud)
  el.style.color = isLastDay ? "#f97316" : "";
}

function getWeekdayName(index) {
  const days = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  return days[index] ?? "Lunes";
}

function updateHUD() {
  updateMoneyUI();
  updateNetworkHealth();
  updateTrainingBar();
  updateTimeUI();

  const intelEl = document.getElementById("intel-display");
  if (intelEl) intelEl.textContent = `${gameState.intelPoints} PI`;
}

function showNotification(message, type = "info", duration = 5000) {
  const area = document.getElementById("notification-area");
  if (!area) return;

  const note = document.createElement("div");
  note.className = `notification ${type}`;
  note.textContent = message;
  area.appendChild(note);

  setTimeout(() => {
    note.style.animation = "fadeOut 0.5s ease forwards";
    setTimeout(() => note.remove(), 500);
  }, duration);
}

function checkVictory() {
  if (gameState.gameOver) return;

  const connectedNodeIds = new Set();
  gameState.connections.forEach((c) => {
    connectedNodeIds.add(c.from);
    connectedNodeIds.add(c.to);
  });
  const connectedCount = connectedNodeIds.size;

  // 3 meses = 12 semanas = 84 días
  const hasEnoughTime = gameState.day >= 84;
  const hasEnoughNodes = connectedCount >= 50;

  if (hasEnoughTime && hasEnoughNodes) {
    gameState.gameOver = true;
    setPause(true);
    const details = `¡Ganaste en ${gameState.day} días con ${connectedCount} nodos conectados!`;
    showNotification(
      `🏆 ¡VICTORIA! Administraste una red de ${connectedCount} nodos durante más de 3 meses. ¡Eres un Network Admin profesional!`,
      "success",
      15000,
    );
    if (typeof window.setVictory === "function") {
      window.setVictory(details);
    }

    const overlay = document.getElementById("pause-overlay");
    if (overlay) {
      overlay.classList.add("active");
      overlay.innerHTML = `
        <div class="pause-text">🏆 ¡VICTORIA!</div>
        <div style="margin-top:12px; font-size:1rem; color:#4ade80;">
          Red de <strong>${connectedCount} nodos</strong> activa<br>
          por más de <strong>3 meses</strong>
        </div>
        <div style="margin-top:10px; font-size:0.85rem; color:#94a3b8;">
          Recarga para jugar de nuevo
        </div>
      `;
    }
  }
}

/* ----
   EXPOSICIÓN GLOBAL
   ---- */
window.gameState = gameState;
window.CONFIG = CONFIG;
window.setPause = setPause;
window.setSpeed = setSpeed;
window.setEditMode = setEditMode;
window.showNotification = showNotification;
window.updateMoneyUI = updateMoneyUI;
window.updateNetworkHealth = updateNetworkHealth;
window.updateTrainingBar = updateTrainingBar;
window.updateHUD = updateHUD;
window.advanceDay = advanceDay;
window.restoreWeeklyHealth = restoreWeeklyHealth;
window.spawnPacket = spawnPacket;
window.deliverPacket = deliverPacket;
window.tryHiringEvent = tryHiringEvent;
window.tryServerGrowthEvent = tryServerGrowthEvent;
window.checkGameOver = checkGameOver;
window.checkVictory = checkVictory;
window.nextPCName = nextPCName;
window.nextServerName = nextServerName;

/* ----
   ARRANQUE
   ---- */
document.addEventListener("DOMContentLoaded", initGame);

/* ----
   VICTORIA
   ---- */

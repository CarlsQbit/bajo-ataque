/* ==========================================================================
   network-nodes.js - Crear, registrar, anclas, comprar/vender nodos
   ========================================================================== */

(function () {
  /* Helper centralizado: centro de un nodo en coordenadas del workspace */
  function getNodeCenter(node) {
    return {
      x: node.element.offsetLeft + node.element.offsetWidth / 2,
      y: node.element.offsetTop + node.element.offsetHeight / 2,
    };
  }
  window.getNodeCenter = getNodeCenter;

  function registerNodeFromDOM(el) {
    const id = el.id;
    if (!id) return;
    const type = el.dataset.type || "endpoint";
    const name = el.querySelector(".node-name")?.textContent || type;
    if (window.gameState.nodes.find((n) => n.id === id)) return;

    const node = {
      id,
      type,
      name,
      x: el.offsetLeft,
      y: el.offsetTop,
      connections: 0,
      maxPorts: window.NODE_TYPES[type]?.maxPorts || 1,
      infected: false,
      saturated: false,
      trafficLoad: 0,
      trafficSaturated: false,
      element: el,
    };
    el.style.setProperty(
      "--node-color",
      window.NODE_TYPES[type]?.color || "#ffffff",
    );
    window.gameState.nodes.push(node);
    window.updateNodeVisuals(node);
    window.createPortAnchors(node);
    requestAnimationFrame(() => {
      window.positionAnchors(node);
      window.updateAllConnections();
    });
  }

  function createNode(type, x, y, customName) {
    const config = window.NODE_TYPES[type];
    if (!config) return null;

    const id = `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const workspace = document.getElementById("workspace");

    const el = document.createElement("div");
    el.className = `network-node node-${type}`;
    el.id = id;
    el.dataset.type = type;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.innerHTML = `
      <div class="node-icon"></div>
      <div class="node-name">${customName || config.name}</div>
      <div class="node-ports">
        <span class="port-count">0</span>/<span class="port-max">${config.maxPorts}</span>
      </div>
      <div class="node-status"></div>`;
    workspace.appendChild(el);

    const node = {
      id,
      type,
      name: customName || config.name,
      x,
      y,
      connections: 0,
      maxPorts: config.maxPorts,
      infected: false,
      saturated: false,
      trafficLoad: 0,
      trafficSaturated: false,
      element: el,
    };
    el.style.setProperty("--node-color", config.color || "#ffffff");
    window.gameState.nodes.push(node);
    window.updateNodeVisuals(node);
    window.createPortAnchors(node);
    requestAnimationFrame(() => {
      window.positionAnchors(node);
      window.updateAllConnections();
    });
    return node;
  }

  function addEndpointNode(name) {
    const nodeName = name || window.nextPCName(); // ← este cambio
    const nodes = window.gameState.nodes;
    let cx, cy;
    if (nodes.length > 0) {
      cx = nodes.reduce((s, n) => s + n.x, 0) / nodes.length;
      cy = nodes.reduce((s, n) => s + n.y, 0) / nodes.length;
    } else {
      const workspace = document.getElementById("workspace");
      cx = workspace.clientWidth / 2;
      cy = workspace.clientHeight / 2;
    }
    const angle = Math.random() * Math.PI * 2;
    const radius = 100 + Math.random() * 100;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    return createNode("endpoint", x, y, nodeName); // ← usa nodeName
  }
  function addServerNode(name) {
    const workspace = document.getElementById("workspace");
    const x = 100 + Math.random() * (workspace.clientWidth - 200);
    const y = 100 + Math.random() * (workspace.clientHeight - 200);
    return createNode("server", x, y, name || "Servidor");
  }

  function createPortAnchors(node) {
    const el = node.element;
    el.querySelectorAll(".port-anchor").forEach((a) => a.remove());
    const count = Math.min(node.maxPorts, 8);
    for (let i = 0; i < count; i++) {
      const anchor = document.createElement("div");
      anchor.className = "port-anchor";
      anchor.dataset.nodeId = node.id;
      anchor.dataset.portIndex = i;
      anchor.title = `Puerto ${i + 1}`;
      el.appendChild(anchor);
    }
    positionAnchors(node);
  }

  function positionAnchors(node) {
    const anchors = node.element.querySelectorAll(".port-anchor");
    const count = anchors.length;
    if (count === 0) return;
    const width = node.element.clientWidth;
    const height = node.element.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    anchors.forEach((anchor, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      anchor.style.left = `${Math.cos(angle) * radius + centerX - 6}px`;
      anchor.style.top = `${Math.sin(angle) * radius + centerY - 6}px`;
    });
  }

  function buySwitch(type) {
    const config = window.NODE_TYPES[type];
    if (!config) {
      window.showNotification("Tipo de switch no válido.", "warning");
      return;
    }
    if (window.gameState.money < config.cost) {
      window.showNotification(
        `Necesitas $${config.cost} para comprar ${config.name}.`,
        "warning",
      );
      return;
    }
    window.applyMoneyPenalty(config.cost);
    const workspace = document.getElementById("workspace");
    const x = workspace.clientWidth / 2 - 40 + (Math.random() - 0.5) * 100;
    const y = workspace.clientHeight / 2 - 40 + (Math.random() - 0.5) * 100;
    createNode(type, x, y, config.name);
    window.showNotification(
      `${config.name} comprado por $${config.cost}.`,
      "success",
    );
    if (!window.gameState.isEditMode) {
      window.setEditMode(true);
      window.showNotification(
        "Entra en Modo Edición para conectar el nuevo switch.",
        "info",
      );
    }
  }

  let nodeToSell = null;

  function openSellModal(node) {
    nodeToSell = node;
    const modal = document.getElementById("sell-modal");
    const title = document.getElementById("sell-title");
    const desc = document.getElementById("sell-description");
    if (!modal || !title || !desc) return;
    const config = window.NODE_TYPES[node.type];
    const sellValue = Math.round(
      (config?.cost || 0) * window.CONFIG.sellReturnRate,
    );
    title.textContent = `Vender ${node.name}`;
    desc.textContent = `Recuperarás $${sellValue} (40% del valor original). Se eliminarán todas sus conexiones.`;
    const btnConfirm = document.getElementById("btn-confirm-sell");
    if (btnConfirm) btnConfirm.onclick = confirmSellNode;
    modal.style.display = "flex";
  }

  function confirmSellNode() {
    if (!nodeToSell) return;
    const config = window.NODE_TYPES[nodeToSell.type];
    const sellValue = Math.round(
      (config?.cost || 0) * window.CONFIG.sellReturnRate,
    );
    window.gameState.connections
      .filter((c) => c.from === nodeToSell.id || c.to === nodeToSell.id)
      .forEach((c) => window.removeConnection(c));
    if (sellValue > 0) {
      window.gameState.money += sellValue;
      window.updateMoneyUI();
    }
    nodeToSell.element.remove();
    window.gameState.nodes = window.gameState.nodes.filter(
      (n) => n.id !== nodeToSell.id,
    );
    window.showNotification(
      `${nodeToSell.name} vendido por $${sellValue}.`,
      "success",
    );
    window.closeSellModal();
  }

  function updateNodeVisuals(node) {
    if (!node || !node.element) return;
    const portCount = node.element.querySelector(".port-count");
    if (portCount) portCount.textContent = node.connections;
    node.element.classList.toggle("infected", node.infected);
    const portsFull = node.connections >= node.maxPorts;
    node.element.classList.toggle("ports-full", portsFull);
    node.element.classList.toggle("no-connections", node.connections === 0);
    node.element.classList.toggle(
      "saturated",
      node.saturated && !node.trafficSaturated,
    );
    node.element.classList.toggle("traffic-saturated", !!node.trafficSaturated);
  }
  function updatePortCounters() {
    window.gameState.nodes.forEach((n) => updateNodeVisuals(n));
  }

  function checkSaturation() {
    window.gameState.nodes.forEach((node) => {
      const isSwitch =
        node.type === "switch8" ||
        node.type === "switch16" ||
        node.type === "switch24" ||
        node.type === "switch48";
      if (!isSwitch) {
        node.saturated = false;
      } else {
        const threshold = window.gameState.saturationThreshold || 0.8;
        const ratio = node.connections / node.maxPorts;
        node.saturated = ratio >= threshold && node.connections < node.maxPorts;
      }
      updateNodeVisuals(node);
    });
  }

  function setNodeInfected(nodeId, infected) {
    const node = window.gameState.nodes.find((n) => n.id === nodeId);
    if (node) {
      node.infected = infected;
      updateNodeVisuals(node);
    }
  }

  window.registerNodeFromDOM = registerNodeFromDOM;
  window.createNode = createNode;
  window.addEndpointNode = addEndpointNode;
  window.addServerNode = addServerNode;
  window.createPortAnchors = createPortAnchors;
  window.positionAnchors = positionAnchors;
  window.buySwitch = buySwitch;
  window.openSellNodeModal = openSellModal;
  window.confirmSellNode = confirmSellNode;
  window.updateNodeVisuals = updateNodeVisuals;
  window.updatePortCounters = updatePortCounters;
  window.checkSaturation = checkSaturation;
  window.setNodeInfected = setNodeInfected;

  // --- NUEVO: Refrescar el texto de "X / MAX" puertos en la interfaz ---
  window.refreshPortDisplays = function () {
    if (!window.gameState?.nodes) return;
    window.gameState.nodes.forEach((n) => {
      if (!n.element) return;
      const portMaxLabel = n.element.querySelector(".port-max");
      if (portMaxLabel) portMaxLabel.textContent = n.maxPorts;
    });
  };
})();

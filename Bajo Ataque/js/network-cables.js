/* ==========================================================================
   network-cables.js - SVG, dibujo, selección, rubber band, venta de cables
   ========================================================================== */

(function () {
  let selectedConnection = null;
  let selectedConnections = [];

  function createConnection(fromNode, toNode, type) {
    if (fromNode.id === toNode.id) {
      window.showNotification(
        "No puedes conectar un nodo consigo mismo.",
        "warning",
      );
      return null;
    }
    if (fromNode.connections >= fromNode.maxPorts) {
      window.showNotification(
        `${fromNode.name} no tiene puertos disponibles.`,
        "warning",
      );
      return null;
    }
    if (toNode.connections >= toNode.maxPorts) {
      window.showNotification(
        `${toNode.name} no tiene puertos disponibles.`,
        "warning",
      );
      return null;
    }
    const exists = window.gameState.connections.some(
      (c) =>
        (c.from === fromNode.id && c.to === toNode.id) ||
        (c.from === toNode.id && c.to === fromNode.id),
    );
    if (exists) {
      window.showNotification("Estos nodos ya están conectados.", "warning");
      return null;
    }
    const cableCost =
      typeof window.getCablePrice === "function"
        ? window.getCablePrice(type)
        : window.CABLE_TYPES[type].cost;
    if (window.gameState.money < cableCost) {
      window.showNotification(
        `Necesitas $${cableCost} para cablear.`,
        "warning",
      );
      return null;
    }
    window.applyMoneyPenalty(cableCost);

    const fromPort = fromNode.connections;
    const toPort = toNode.connections;
    fromNode.connections++;
    toNode.connections++;

    const connection = {
      id: `conn-${Date.now()}`,
      from: fromNode.id,
      to: toNode.id,
      type,
      fromPort,
      toPort,
    };
    window.gameState.connections.push(connection);
    window.updatePortCounters();
    window.updateNodeVisuals(fromNode);
    window.updateNodeVisuals(toNode);
    drawConnection(connection);
    window.checkSaturation();
    window.showNotification(
      `Conexión ${window.CABLE_TYPES[type].name} creada por $${cableCost}.`,
      "success",
    );
    return connection;
  }

  function removeConnection(connection) {
    const fromNode = window.gameState.nodes.find(
      (n) => n.id === connection.from,
    );
    const toNode = window.gameState.nodes.find((n) => n.id === connection.to);
    if (fromNode) fromNode.connections--;
    if (toNode) toNode.connections--;

    window.gameState.connections = window.gameState.connections.filter(
      (c) => c.id !== connection.id,
    );

    const line = document.getElementById(connection.id);
    const hitLine = document.getElementById(connection.id + "-hit");
    if (line) line.remove();
    if (hitLine) hitLine.remove();

    window.updatePortCounters();
    if (fromNode) window.updateNodeVisuals(fromNode);
    if (toNode) window.updateNodeVisuals(toNode);
    window.checkSaturation();
  }

  function drawConnection(connection) {
    const svg = document.getElementById("connections-layer");
    if (!svg) return;

    let line = document.getElementById(connection.id);
    if (!line) {
      line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.id = connection.id;
      line.dataset.type = connection.type;
      svg.appendChild(line);
    }

    const hitId = connection.id + "-hit";
    let hitLine = document.getElementById(hitId);
    if (!hitLine) {
      hitLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      hitLine.id = hitId;
      hitLine.setAttribute("stroke", "transparent");
      hitLine.setAttribute("stroke-width", "20");
      hitLine.style.cursor = "pointer";
      svg.appendChild(hitLine);
    }

    const fromNode = window.gameState.nodes.find(
      (n) => n.id === connection.from,
    );
    const toNode = window.gameState.nodes.find((n) => n.id === connection.to);
    if (!fromNode || !toNode) return;

    // ✅ Usar offsetLeft/offsetTop — coordenadas relativas al workspace, inmunes al zoom
    const c1 = window.getNodeCenter(fromNode);
    const c2 = window.getNodeCenter(toNode);
    const x1 = c1.x,
      y1 = c1.y;
    const x2 = c2.x,
      y2 = c2.y;

    [line, hitLine].forEach((l) => {
      l.setAttribute("x1", x1);
      l.setAttribute("y1", y1);
      l.setAttribute("x2", x2);
      l.setAttribute("y2", y2);
    });
    line.classList.remove("cable-utp", "cable-fibra");
    const cssClassMap = {
      //fibra_mono: "cable-fibra-monomodo",
      fibra: "cable-fibra-multimodo",
      utp: "cable-cat6",
      cat5e: "cable-cat5e",
      cat6a: "cable-cat6a",
      coaxial: "cable-coaxial",
    };
    const cssClass = cssClassMap[connection.type] || `cable-${connection.type}`;
    line.classList.add(cssClass);

    hitLine.onclick = null;
    hitLine.onclick = (e) => {
      if (!window.gameState.isEditMode) return;
      e.stopPropagation();
      selectSingleCable(connection);
    };
  }

  function updateAllConnections() {
    window.gameState.connections.forEach((c) => drawConnection(c));
  }

  function clearCableSelection() {
    selectedConnections.forEach((conn) => {
      const line = document.getElementById(conn.id);
      if (line) line.classList.remove("cable-selected");
    });
    selectedConnections = [];
    if (selectedConnection) {
      const line = document.getElementById(selectedConnection.id);
      if (line) line.classList.remove("cable-selected");
      selectedConnection = null;
    }
  }

  function selectSingleCable(connection) {
    clearCableSelection();
    selectedConnection = connection;
    selectedConnections = [connection];
    const line = document.getElementById(connection.id);
    if (line) line.classList.add("cable-selected");

    const cableType = window.CABLE_TYPES[connection.type];
    const refund = Math.round(
      (cableType?.cost || 0) * window.CONFIG.sellReturnRate,
    );
    showCableSellModal(1, refund);
  }

  function selectCablesInRect(selRect) {
    clearCableSelection();
    window.gameState.connections.forEach((conn) => {
      const fromNode = window.gameState.nodes.find((n) => n.id === conn.from);
      const toNode = window.gameState.nodes.find((n) => n.id === conn.to);
      if (!fromNode || !toNode) return;

      const c1 = window.getNodeCenter(fromNode);
      const c2 = window.getNodeCenter(toNode);
      const x1 = c1.x,
        y1 = c1.y;
      const x2 = c2.x,
        y2 = c2.y;

      if (lineIntersectsRect(x1, y1, x2, y2, selRect)) {
        selectedConnections.push(conn);
        const line = document.getElementById(conn.id);
        if (line) line.classList.add("cable-selected");
      }
    });

    if (selectedConnections.length > 0) {
      const totalRefund = selectedConnections.reduce((sum, conn) => {
        const ct = window.CABLE_TYPES[conn.type];
        return sum + Math.round((ct?.cost || 0) * window.CONFIG.sellReturnRate);
      }, 0);
      showCableSellModal(selectedConnections.length, totalRefund);
    }
  }

  function showCableSellModal(count, refund) {
    const modal = document.getElementById("sell-modal");
    const title = document.getElementById("sell-title");
    const desc = document.getElementById("sell-description");
    if (!modal || !title || !desc) return;
    title.textContent =
      count === 1 ? "Eliminar cable" : `Eliminar ${count} cables`;
    desc.textContent = `¿Eliminar ${count === 1 ? "este cable" : "los cables seleccionados"}? Recuperarás $${refund}.`;
    const btnConfirm = document.getElementById("btn-confirm-sell");
    if (btnConfirm) btnConfirm.onclick = () => confirmSellConnection();
    modal.style.display = "flex";
  }

  function confirmSellConnection() {
    const toDelete =
      selectedConnections.length > 0
        ? [...selectedConnections]
        : selectedConnection
          ? [selectedConnection]
          : [];
    if (toDelete.length === 0) return;

    let totalRefund = 0;
    toDelete.forEach((conn) => {
      const ct = window.CABLE_TYPES[conn.type];
      totalRefund += Math.round((ct?.cost || 0) * window.CONFIG.sellReturnRate);
      removeConnection(conn);
    });
    if (totalRefund > 0) {
      window.gameState.money += totalRefund;
      window.updateMoneyUI();
    }
    window.showNotification(
      `${toDelete.length} cable(s) eliminado(s). Reembolso: $${totalRefund}.`,
      "success",
    );
    selectedConnections = [];
    selectedConnection = null;
    window.closeSellModal();
  }

  function lineIntersectsRect(x1, y1, x2, y2, rect) {
    const inRect = (px, py) =>
      px >= rect.x &&
      px <= rect.x + rect.w &&
      py >= rect.y &&
      py <= rect.y + rect.h;
    if (inRect(x1, y1) || inRect(x2, y2)) return true;
    const sides = [
      [rect.x, rect.y, rect.x + rect.w, rect.y],
      [rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + rect.h],
      [rect.x, rect.y + rect.h, rect.x + rect.w, rect.y + rect.h],
      [rect.x, rect.y, rect.x, rect.y + rect.h],
    ];
    return sides.some(([sx1, sy1, sx2, sy2]) =>
      segmentsIntersect(x1, y1, x2, y2, sx1, sy1, sx2, sy2),
    );
  }

  function segmentsIntersect(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y) {
    const d1x = p2x - p1x,
      d1y = p2y - p1y;
    const d2x = p4x - p3x,
      d2y = p4y - p3y;
    const cross = d1x * d2y - d1y * d2x;
    if (Math.abs(cross) < 1e-10) return false;
    const dx = p3x - p1x,
      dy = p3y - p1y;
    const t = (dx * d2y - dy * d2x) / cross;
    const u = (dx * d1y - dy * d1x) / cross;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  }

  window.createConnection = createConnection;
  window.removeConnection = removeConnection;
  window.drawConnection = drawConnection;
  window.updateAllConnections = updateAllConnections;
  window.clearCableSelection = clearCableSelection;
  window.selectCablesInRect = selectCablesInRect;
  window.confirmSellConnection = confirmSellConnection;
})();

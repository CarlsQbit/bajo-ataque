/* ==========================================================================
   network.js - Inicialización, drag de nodos, pan con clic derecho
   ========================================================================== */

(function () {
  let draggedNode = null;
  let dragOffset = { x: 0, y: 0 };
  let cableStart = null;
  let tempLine = null;
  let isSelecting = false;
  let selectionStart = { x: 0, y: 0 };
  let selectionBox = null;

  // Pan
  let isPanning = false;
  let panStart = { x: 0, y: 0 };
  let panMoved = false;

  /* --- Init --- */
  function initNetwork() {
    const workspace = document.getElementById("workspace");
    if (!workspace) return;

    workspace.querySelectorAll(".network-node").forEach((el) => {
      window.registerNodeFromDOM(el);
    });

    requestAnimationFrame(() => positionInitialNodes());

    workspace.addEventListener("mousedown", onWorkspaceMouseDown);
    workspace.addEventListener("mousemove", onWorkspaceMouseMove);
    workspace.addEventListener("mouseup", onWorkspaceMouseUp);
    workspace.addEventListener("contextmenu", onWorkspaceContextMenu);
    workspace.addEventListener("dblclick", onWorkspaceDoubleClick);

    window.addEventListener("resize", () => {
      setTimeout(() => window.updateAllConnections?.(), 50);
    });

    const btnCancelSell = document.getElementById("btn-cancel-sell");
    if (btnCancelSell) btnCancelSell.onclick = window.closeSellModal;

    const btnConfirmSell = document.getElementById("btn-confirm-sell");
    if (btnConfirmSell) btnConfirmSell.onclick = window.confirmSellNode;

    document.addEventListener("keydown", (e) => {
      if (e.key === "Delete" && window.gameState.isEditMode) {
        window.confirmSellConnection();
      }
      if (e.key === "Escape") {
        window.clearCableSelection();
      }
    });

    window.updateAllConnections();
    window.updatePortCounters();
  }

  /* --- Mouse Down --- */
  function onWorkspaceMouseDown(e) {
    // Clic derecho → iniciar pan
    if (e.button === 2) {
      isPanning = true;
      panMoved = false;
      panStart = { x: e.clientX, y: e.clientY };
      e.preventDefault();
      document.getElementById("workspace").style.cursor = "grabbing";
      return;
    }

    const anchor = e.target.closest(".port-anchor");
    const nodeEl = e.target.closest(".network-node");

    if (!window.gameState.isEditMode) {
      if (anchor)
        window.showNotification(
          "Debes entrar en Modo Edición para conectar cables.",
          "warning",
        );
      return;
    }

    if (nodeEl && !anchor) {
      const node = window.gameState.nodes.find((n) => n.id === nodeEl.id);
      if (node) {
        draggedNode = node;
        const rect = nodeEl.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
        nodeEl.classList.add("dragging");
      }
      return;
    }

    if (anchor) {
      if (!window.gameState.selectedTool) {
        window.showNotification(
          "Selecciona un tipo de cable en el menú Cableado primero.",
          "warning",
        );
        return;
      }
      e.preventDefault();
      startCable(anchor, e.clientX, e.clientY);
      return;
    }

    if (!nodeEl && !anchor) {
      window.clearCableSelection();
      const workspace = document.getElementById("workspace");
      const rect = workspace.getBoundingClientRect();
      isSelecting = true;
      selectionStart = { x: e.clientX - rect.left, y: e.clientY - rect.top };

      selectionBox = document.createElement("div");
      selectionBox.id = "selection-box";
      selectionBox.style.cssText = `
        position:absolute; border:2px dashed #60a5fa; background:rgba(96,165,250,0.1);
        pointer-events:none; z-index:999;
        left:${selectionStart.x}px; top:${selectionStart.y}px; width:0; height:0;`;
      workspace.appendChild(selectionBox);
    }
  }

  /* --- Mouse Move --- */
  function onWorkspaceMouseMove(e) {
    // Pan: mover todos los nodos
    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      panStart = { x: e.clientX, y: e.clientY };
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) panMoved = true;

      window.gameState.nodes.forEach((node) => {
        node.x += dx;
        node.y += dy;
        node.element.style.left = `${node.x}px`;
        node.element.style.top = `${node.y}px`;
        window.positionAnchors(node);
      });
      window.updateAllConnections();
      return;
    }

    if (draggedNode) {
      const workspace = document
        .getElementById("workspace")
        .getBoundingClientRect();
      let x = e.clientX - workspace.left - dragOffset.x;
      let y = e.clientY - workspace.top - dragOffset.y;
      x = Math.max(0, Math.min(x, workspace.width - 80));
      y = Math.max(0, Math.min(y, workspace.height - 80));
      draggedNode.x = x;
      draggedNode.y = y;
      draggedNode.element.style.left = `${x}px`;
      draggedNode.element.style.top = `${y}px`;
      window.positionAnchors(draggedNode);
      window.updateAllConnections();
    }

    if (cableStart && tempLine) {
      const workspace = document
        .getElementById("workspace")
        .getBoundingClientRect();
      tempLine.setAttribute("x2", e.clientX - workspace.left);
      tempLine.setAttribute("y2", e.clientY - workspace.top);
    }

    if (isSelecting && selectionBox) {
      const workspace = document
        .getElementById("workspace")
        .getBoundingClientRect();
      const curX = e.clientX - workspace.left;
      const curY = e.clientY - workspace.top;
      const x = Math.min(curX, selectionStart.x);
      const y = Math.min(curY, selectionStart.y);
      const w = Math.abs(curX - selectionStart.x);
      const h = Math.abs(curY - selectionStart.y);
      selectionBox.style.left = `${x}px`;
      selectionBox.style.top = `${y}px`;
      selectionBox.style.width = `${w}px`;
      selectionBox.style.height = `${h}px`;
    }
  }

  /* --- Mouse Up --- */
  function onWorkspaceMouseUp(e) {
    if (e.button === 2) {
      isPanning = false;
      document.getElementById("workspace").style.cursor = "";
      if (!panMoved && window.gameState.isEditMode) {
        const nodeEl = e.target.closest(".network-node");
        if (nodeEl) {
          const node = window.gameState.nodes.find((n) => n.id === nodeEl.id);
          if (node && node.type !== "router" && node.type !== "endpoint") {
            window.openSellNodeModal(node);
          } else if (node) {
            window.showNotification("No puedes vender este nodo.", "warning");
          }
        }
      }
      panMoved = false;
      return;
    }

    if (draggedNode) {
      draggedNode.element.classList.remove("dragging");
      draggedNode = null;
    }

    if (cableStart) {
      const anchor = e.target.closest(".port-anchor");
      const nodeEl = e.target.closest(".node");
      const fromNode = window.gameState.nodes.find(
        (n) => n.id === cableStart.nodeId,
      );
      let toNode = null;
      if (anchor) {
        toNode = window.gameState.nodes.find(
          (n) => n.id === anchor.dataset.nodeId,
        );
      } else if (nodeEl) {
        toNode = window.gameState.nodes.find((n) => n.element === nodeEl);
      }

      if (fromNode && toNode && fromNode.id !== toNode.id) {
        window.createConnection(
          fromNode,
          toNode,
          window.gameState.selectedTool || "utp",
        );
      }

      if (tempLine) tempLine.remove();
      cableStart = null;
      tempLine = null;
    }

    if (isSelecting && selectionBox) {
      const workspace = document
        .getElementById("workspace")
        .getBoundingClientRect();
      const box = selectionBox.getBoundingClientRect();
      const selRect = {
        x: box.left - workspace.left,
        y: box.top - workspace.top,
        w: box.width,
        h: box.height,
      };
      selectionBox.remove();
      selectionBox = null;
      isSelecting = false;
      if (selRect.w > 5 && selRect.h > 5) {
        window.selectCablesInRect(selRect);
      }
    }
  }

  /* --- Contextmenu: solo prevenir menú nativo --- */
  function onWorkspaceContextMenu(e) {
    e.preventDefault();
  }

  /* --- Doble clic → vender nodo --- */
  function onWorkspaceDoubleClick(e) {
    const nodeEl = e.target.closest(".network-node");
    if (!nodeEl) return;
    const node = window.gameState.nodes.find((n) => n.id === nodeEl.id);
    if (!node) return;
    if (node.type === "router" || node.type === "endpoint") {
      window.showNotification("No puedes vender este nodo.", "warning");
      return;
    }
    window.openSellNodeModal(node);
  }

  /* --- Cable temporal --- */
  function startCable(anchor, x, y) {
    const svg = document.getElementById("connections-layer");
    if (!svg) return;
    cableStart = {
      nodeId: anchor.dataset.nodeId,
      portIndex: parseInt(anchor.dataset.portIndex),
    };

    const workspace = document
      .getElementById("workspace")
      .getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();

    tempLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    tempLine.setAttribute(
      "x1",
      anchorRect.left + anchorRect.width / 2 - workspace.left,
    );
    tempLine.setAttribute(
      "y1",
      anchorRect.top + anchorRect.height / 2 - workspace.top,
    );
    tempLine.setAttribute("x2", x - workspace.left);
    tempLine.setAttribute("y2", y - workspace.top);
    tempLine.classList.add("cable-temp");
    svg.appendChild(tempLine);
  }

  /* --- closeSellModal global --- */
  function closeSellModal() {
    const modal = document.getElementById("sell-modal");
    if (modal) modal.style.display = "none";
    window.clearCableSelection?.();
  }

  /* --- selectTool --- */
  function selectTool(tool) {
    window.gameState.selectedTool = tool;
    document
      .querySelectorAll(".tool-btn")
      .forEach((btn) => btn.classList.remove("active"));
    const btn = document.getElementById(`tool-${tool}`);
    if (btn) btn.classList.add("active");
  }

  /* --- Exposición --- */
  window.initNetwork = initNetwork;
  window.closeSellModal = closeSellModal;
  window.selectTool = selectTool;

  document.addEventListener("DOMContentLoaded", initNetwork);
})();

function positionInitialNodes() {
  const workspace = document.getElementById("workspace");
  if (!workspace) return;

  const W = workspace.clientWidth;
  const H = workspace.clientHeight;
  const cx = W / 2 - 40;
  const cy = H / 2 - 40;

  // Layout fijo: router al centro, los demás en semicírculo debajo
  const layout = {
    router: { x: cx, y: cy - 60 },
    "ceo-station": { x: cx - 180, y: cy + 100 },
    "qa-station": { x: cx + 100, y: cy + 100 },
  };

  window.gameState.nodes.forEach((node) => {
    const pos = layout[node.id];
    if (!pos) return;
    node.x = pos.x;
    node.y = pos.y;
    node.element.style.left = `${pos.x}px`;
    node.element.style.top = `${pos.y}px`;
    window.positionAnchors(node);
  });

  window.updateAllConnections?.();
}

// Nueva función global para limpiar cualquier conexión en curso
function cancelPendingCable() {
  if (window.tempLine && window.tempLine.parentNode) {
    window.tempLine.remove();
  }
  window.cableStart = null;
  window.tempLine = null;
}

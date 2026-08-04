/* ==========================================================================
   research.js - Investigaciones y capacitación de empleados
   Responsabilidad: árbol de investigaciones, barra de capacitación y
   reducción de probabilidad de eventos de seguridad.
   ========================================================================== */

(function () {
  /* ------------------------------------------------------------------------
     COMPRAR INVESTIGACIÓN
     ------------------------------------------------------------------------ */
  function buyResearch(researchId) {
    const research = window.CONFIG.researches[researchId];
    if (!research) return false;

    if (window.gameState.researches.includes(researchId)) {
      if (typeof window.showNotification === "function") {
        window.showNotification(
          "Ya has comprado esta investigación.",
          "warning",
        );
      }
      return false;
    }

    if (
      window.gameState.money < research.costMoney ||
      window.gameState.intelPoints < research.costIntel
    ) {
      if (typeof window.showNotification === "function") {
        window.showNotification(
          "Recursos insuficientes para esta investigación.",
          "warning",
        );
      }
      return false;
    }

    window.gameState.money -= research.costMoney;
    window.gameState.intelPoints -= research.costIntel;
    window.gameState.researches.push(researchId);

    // Aplicar efecto inmediato
    if (research.effect && research.effect.training) {
      addEmployeeTraining(research.effect.training);
    }
    if (research.effect && research.effect.endpointMaxPorts) {
      const newMax = research.effect.endpointMaxPorts;
      window.gameState.nodes
        .filter((n) => n.type === "endpoint")
        .forEach((n) => {
          n.maxPorts = newMax;
          if (typeof window.createPortAnchors === "function")
            window.createPortAnchors(n);
        });
      window.NODE_TYPES.endpoint.maxPorts = newMax;
    }

    // Router upgrade
    if (research.effect && research.effect.routerExtraPorts) {
      const extra = research.effect.routerExtraPorts;
      window.gameState.nodes
        .filter((n) => n.type === "router")
        .forEach((n) => {
          n.maxPorts += extra;
          if (typeof window.createPortAnchors === "function")
            window.createPortAnchors(n);
        });
      window.NODE_TYPES.router.maxPorts += extra;
      // NUEVO: Refrescar etiquetas en pantalla
      if (typeof window.refreshPortDisplays === "function")
        window.refreshPortDisplays();
    }

    // Switch firmware: +4 puertos a todos los switches
    if (research.effect && research.effect.switchExtraPorts) {
      const extra = research.effect.switchExtraPorts;
      ["switch8", "switch16", "switch24"].forEach((type) => {
        window.NODE_TYPES[type].maxPorts += extra;
      });
      window.gameState.nodes
        .filter((n) => ["switch8", "switch16", "switch24"].includes(n.type))
        .forEach((n) => {
          n.maxPorts += extra;
          if (typeof window.createPortAnchors === "function")
            window.createPortAnchors(n);
        });
    }

    // Enterprise switch: desbloquear switch48
    if (research.effect && research.effect.unlockSwitch48) {
      window.NODE_TYPES["switch48"] = {
        name: "Switch 48 puertos",
        maxPorts: 48,
        cost: 1200,
        color: "#065f46",
      };
      window.gameState.switch48Unlocked = true;
      if (typeof window.renderBuildMenu === "function")
        window.renderBuildMenu();
    }

    // QoS / Load balancing: umbral de saturación
    if (research.effect && research.effect.saturationThreshold) {
      window.gameState.saturationThreshold =
        research.effect.saturationThreshold;
    }

    // Load balancing: badge rojo
    if (research.effect && research.effect.overloadBadgeAt) {
      window.gameState.overloadBadgeAt = research.effect.overloadBadgeAt;
    }

    // Link aggregation: cooldown bonus en cables top
    if (research.effect && research.effect.topCableCooldownBonus) {
      const bonus = research.effect.topCableCooldownBonus;
      ["cat6a", "fibra"].forEach((type) => {
        if (window.CABLE_TYPES[type]) {
          window.CABLE_TYPES[type].cooldown = Math.round(
            (window.CABLE_TYPES[type].cooldown || 1000) * bonus,
          );
        }
      });
    }

    // Security awareness: tiempo extra en eventos
    if (research.effect && research.effect.eventExtraTime) {
      window.gameState.eventExtraTime =
        (window.gameState.eventExtraTime || 0) + research.effect.eventExtraTime;
    }

    // IT Certification: ingreso diario por endpoint
    if (research.effect && research.effect.endpointDailyIncome) {
      window.gameState.endpointDailyIncome =
        research.effect.endpointDailyIncome;
    }

    if (typeof window.updateMoneyUI === "function") window.updateMoneyUI();
    if (typeof window.updateHUD === "function") window.updateHUD();
    if (typeof window.showNotification === "function") {
      window.showNotification(
        `Investigación completada: ${research.title}`,
        "success",
      );
    }
    return true;
  }

  /* ------------------------------------------------------------------------
     CAPACITACIÓN DE EMPLEADOS
     ------------------------------------------------------------------------ */
  function addEmployeeTraining(amount) {
    const before = window.gameState.employeeTraining;
    window.gameState.employeeTraining = Math.min(
      window.CONFIG.maxEmployeeTraining,
      window.gameState.employeeTraining + amount,
    );

    if (typeof window.updateTrainingBar === "function")
      window.updateTrainingBar();
    if (typeof window.updateHUD === "function") window.updateHUD();

    const gained = window.gameState.employeeTraining - before;
    if (gained > 0 && typeof window.showNotification === "function") {
      window.showNotification(
        `Capacitación de empleados aumentada: +${gained}%`,
        "success",
      );
    }
  }

  function getEventProbabilityReduction() {
    const training = window.gameState.employeeTraining;
    return Math.min(
      0.9,
      (training / 10) * window.CONFIG.eventReductionPerTraining,
    );
  }

  function hasResearch(researchId) {
    return window.gameState.researches.includes(researchId);
  }

  /* ------------------------------------------------------------------------
     EXPOSICIÓN GLOBAL
     ------------------------------------------------------------------------ */
  Object.assign(window, {
    buyResearch,
    addEmployeeTraining,
    getEventProbabilityReduction,
    hasResearch,
  });
})();

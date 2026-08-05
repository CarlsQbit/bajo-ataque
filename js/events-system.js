/* ==========================================================================
   events-system.js - Lógica de disparo y manejo de eventos de seguridad
   ========================================================================== */

(function () {
  // Variables de control
  let eventCheckCooldown = 0;
  const EVENT_CHECK_INTERVAL = 3;

  // Cooldown para eventos de seguridad (7 días = 1 semana)
  const SECURITY_EVENT_COOLDOWN_DAYS = 7;
  window.securityEventCooldowns = window.securityEventCooldowns || {};
  
  // Cooldown para eventos positivos (5 días)
  const POSITIVE_EVENT_COOLDOWN_DAYS = 5;
  window.positiveEventCooldowns = window.positiveEventCooldowns || {};
  let lastEventId = null;
  let positiveEventCooldown = 0;
  const POSITIVE_EVENT_INTERVAL = 5;

  // Función para disparar eventos de seguridad
  function tryTriggerSecurityEvent() {
    if (!window.gameState) return;
    if (window.gameState.eventActive) return;
    if (window.gameState.isPaused) return;

    eventCheckCooldown--;
    if (eventCheckCooldown > 0) return;
    eventCheckCooldown = EVENT_CHECK_INTERVAL;

    const reduction =
      typeof window.getEventProbabilityReduction === "function"
        ? window.getEventProbabilityReduction()
        : 0;

    // Usar SECURITY_EVENTS del archivo events-security.js
    const EVENTS = window.SECURITY_EVENTS || [];
    
    // Filtrar eventos que no están en cooldown
    const availableEvents = EVENTS.filter((ev) => {
      const lastTriggeredDay = window.securityEventCooldowns[ev.id];
      const daysSinceLastTrigger = lastTriggeredDay ? window.gameState.day - lastTriggeredDay : Infinity;
      return daysSinceLastTrigger >= SECURITY_EVENT_COOLDOWN_DAYS;
    });
    
    const triggeredEvents = availableEvents.filter((ev) => {
      const effectiveProbability = ev.probability * (1 - reduction);
      return Math.random() < effectiveProbability;
    });

    if (triggeredEvents.length === 0) return;

    const filtered = triggeredEvents.filter((ev) => ev.id !== lastEventId);
    const pool = filtered.length > 0 ? filtered : triggeredEvents;
    const event = pool[Math.floor(Math.random() * pool.length)];
    lastEventId = event.id;
    
    // Registrar el día en que se disparó este evento
    window.securityEventCooldowns[event.id] = window.gameState.day;
    
    openEventModal(event);
  }

  // Función para disparar eventos positivos
  function tryTriggerPositiveEvent() {
    if (!window.gameState) return;
    if (window.gameState.eventActive) return;
    if (window.gameState.isPaused) return;

    positiveEventCooldown--;
    if (positiveEventCooldown > 0) return;
    positiveEventCooldown = POSITIVE_EVENT_INTERVAL;

    // Usar POSITIVE_EVENTS del archivo events-positive.js
    const POSITIVE_EVENTS = window.POSITIVE_EVENTS || [];
    
    // Filtrar eventos que no están en cooldown
    const availableEvents = POSITIVE_EVENTS.filter((ev) => {
      const lastTriggeredDay = window.positiveEventCooldowns[ev.id];
      const daysSinceLastTrigger = lastTriggeredDay ? window.gameState.day - lastTriggeredDay : Infinity;
      return daysSinceLastTrigger >= POSITIVE_EVENT_COOLDOWN_DAYS;
    });
    
    const triggered = availableEvents.filter(
      (ev) => Math.random() < ev.probability,
    );
    if (triggered.length === 0) return;

    const event = triggered[Math.floor(Math.random() * triggered.length)];
    
    // Registrar el día en que se disparó este evento
    window.positiveEventCooldowns[event.id] = window.gameState.day;

    let gainText = "";
    if (event.type === "money") {
      if (typeof window.applyMoneyReward === "function")
        window.applyMoneyReward(event.amount);
      else if (window.gameState) window.gameState.money += event.amount;
      gainText = `+$${event.amount}`;
    } else if (event.type === "training") {
      if (typeof window.addEmployeeTraining === "function")
        window.addEmployeeTraining(event.amount);
      gainText = `+${event.amount}% capacitación`;
    } else if (event.type === "intel") {
      if (typeof window.addIntelPoints === "function")
        window.addIntelPoints(event.amount);
      gainText = `+${event.amount} PI`;
    } else if (event.type === "health") {
      if (typeof window.restoreHealth === "function")
        window.restoreHealth(event.amount);
      else if (window.gameState) {
        window.gameState.health = Math.min(
          window.gameState.maxHealth || 100,
          window.gameState.health + event.amount,
        );
        if (typeof window.updateNetworkHealth === "function")
          window.updateNetworkHealth();
      }
      gainText = `+${event.amount}% salud de red`;
    }

    if (typeof window.showNotification === "function") {
      window.showNotification(
        `${event.title} — ${event.description} ✅ ${gainText}`,
        "success",
      );
    }
  }

  // Función para abrir el modal de evento
  function openEventModal(event) {
    if (!window.gameState) return;

    if (typeof window.cancelPendingCable === "function")
      window.cancelPendingCable();
    const modal = document.getElementById("event-modal");
    const title = document.getElementById("event-title");
    const desc = document.getElementById("event-description");
    const options = document.getElementById("event-options");

    if (!modal || !title || !desc || !options) {
      // Si no existe la UI, cancelar el evento y aplicar una penalización pequeña
      window.gameState.eventActive = false;
      if (typeof window.applyHealthDamage === "function")
        window.applyHealthDamage(5);
      else if (window.gameState)
        window.gameState.health = Math.max(0, window.gameState.health - 5);
      if (typeof window.updateNetworkHealth === "function")
        window.updateNetworkHealth();
      if (typeof window.showNotification === "function") {
        window.showNotification(
          "Evento ocurrido pero UI no disponible: -5 salud",
          "danger",
        );
      }
      return;
    }

    title.textContent = event.title;
    desc.textContent = event.description;
    options.innerHTML = "";

    event.options.forEach((opt, index) => {
      const btn = document.createElement("button");
      btn.className = "event-option-btn";

      const canAfford =
        window.gameState.money >= (opt.costMoney || 0) &&
        window.gameState.intelPoints >= (opt.costIntel || 0);

      // Etiquetas de costo
      const costParts = [];
      if (opt.costMoney && opt.costIntel) {
        costParts.push(
          `<span style="color:#f87171;">Costo: $${opt.costMoney} + ${opt.costIntel} PI</span>`,
        );
      } else if (opt.costMoney) {
        costParts.push(
          `<span style="color:#f87171;">Costo: $${opt.costMoney}</span>`,
        );
      } else if (opt.costIntel) {
        costParts.push(
          `<span style="color:#fb923c;">Costo: ${opt.costIntel} PI</span>`,
        );
      } else {
        costParts.push(`<span style="color:#94a3b8;">Costo: Gratis</span>`);
      }

      const tagsHTML = `<div style="margin-top:5px; display:flex; gap:6px; flex-wrap:wrap; font-size:0.75rem;">${costParts.join("")}</div>`;
      btn.innerHTML = `<span>${opt.label}</span>${tagsHTML}`;

      if (!canAfford) {
        btn.disabled = true;
        btn.title = "Recursos insuficientes";
        btn.style.opacity = "0.5";
      }

      btn.onclick = () => resolveEventOption(event, opt, index);
      options.appendChild(btn);
    });

    modal.style.display = "flex";
    window.gameState.eventStartTime = Date.now(); // Registrar inicio del evento

    // Contador visual y temporizador de respuesta
    let totalSeconds = 10;
    if (window.gameState?.researches?.includes("security-awareness")) {
      totalSeconds += 5;
    }
    const timerEl = document.getElementById("event-timer");
    let remaining = totalSeconds;
    if (timerEl) timerEl.textContent = `⏱ ${remaining}s`;

    // Limpiar cualquier timer previo
    if (modal._timerInterval) clearInterval(modal._timerInterval);
    if (modal._autoClose) clearTimeout(modal._autoClose);

    modal._timerInterval = setInterval(() => {
      remaining--;
      if (timerEl) timerEl.textContent = `⏱ ${remaining}s`;
    }, 1000);

    // Auto-cierre: si el jugador no responde en el tiempo, aplicar daño
    modal._autoClose = setTimeout(() => {
      if (modal._timerInterval) {
        clearInterval(modal._timerInterval);
        modal._timerInterval = null;
      }

      modal.style.display = "none";
      const feedbackEl = document.getElementById("event-feedback");
      if (feedbackEl) feedbackEl.style.display = "none";

      window.gameState.eventActive = false;

      const damage = 25;
      if (typeof window.applyHealthDamage === "function") {
        window.applyHealthDamage(damage);
      } else if (window.gameState) {
        window.gameState.health = Math.max(0, window.gameState.health - damage);
        if (typeof window.updateNetworkHealth === "function")
          window.updateNetworkHealth();
      }

      if (typeof window.showNotification === "function") {
        window.showNotification(
          `⏰ Evento ignorado. No tomaste acción. -${damage} salud`,
          "danger",
        );
      }

      if (typeof window.checkGameOver === "function") window.checkGameOver();
    }, totalSeconds * 1000);
  }

  // Función para resolver la opción seleccionada en un evento
  function resolveEventOption(event, option, index) {
    const modal = document.getElementById("event-modal");
    if (modal?._autoClose) {
      clearTimeout(modal._autoClose);
      modal._autoClose = null;
    }
    if (modal?._timerInterval) {
      clearInterval(modal._timerInterval);
      modal._timerInterval = null;
    }
    const timerEl = document.getElementById("event-timer");
    if (timerEl) timerEl.textContent = "";
    const feedback = document.getElementById("event-feedback");
    const options = document.getElementById("event-options");

    // Verificar recursos otra vez antes de aplicar
    if (
      window.gameState.money < (option.costMoney || 0) ||
      window.gameState.intelPoints < (option.costIntel || 0)
    ) {
      if (typeof window.showNotification === "function") {
        window.showNotification(
          "Recursos insuficientes para esta opción.",
          "warning",
        );
      }
      return;
    }

    // Aplicar costos
    if (option.costMoney && typeof window.applyMoneyPenalty === "function") {
      window.applyMoneyPenalty(option.costMoney);
    } else if (option.costMoney && window.gameState) {
      window.gameState.money = Math.max(
        0,
        window.gameState.money - option.costMoney,
      );
      if (typeof window.updateMoneyUI === "function") window.updateMoneyUI();
    }

    if (option.costIntel && typeof window.addIntelPoints === "function") {
      window.addIntelPoints(-option.costIntel);
    } else if (option.costIntel && window.gameState) {
      window.gameState.intelPoints = Math.max(
        0,
        window.gameState.intelPoints - option.costIntel,
      );
    }

    // Efectos por elegir la opción
    if (option.correct) {
      if (option.rewardMoney) {
        const reward =
          typeof window.getRandomReward === "function"
            ? window.getRandomReward()
            : Math.floor(Math.random() * 100) + 50;
        if (typeof window.applyMoneyReward === "function") {
          const finalReward = window.applyMoneyReward(reward);
          if (typeof window.showNotification === "function")
            window.showNotification(`Recompensa: +$${finalReward}`, "success");
        } else if (window.gameState) {
          window.gameState.money += reward;
          if (typeof window.updateMoneyUI === "function")
            window.updateMoneyUI();
          if (typeof window.showNotification === "function")
            window.showNotification(`Recompensa: +$${reward}`, "success");
        }
      }
      if (option.rewardIntel && typeof window.addIntelPoints === "function") {
        window.addIntelPoints(option.rewardIntel);
      } else if (option.rewardIntel && window.gameState) {
        window.gameState.intelPoints =
          (window.gameState.intelPoints || 0) + option.rewardIntel;
      }

      if (event.givesTraining && option.trainingAmount) {
        if (typeof window.addEmployeeTraining === "function")
          window.addEmployeeTraining(option.trainingAmount);
        else if (window.gameState)
          window.gameState.employeeTraining = Math.min(
            (window.gameState.employeeTraining || 0) + option.trainingAmount,
            100,
          );
      }

      // Sumar PI extra por investigaciones (IDS, SIEM, etc.)
      let intelBonusFromResearch = 0;
      if (window.CONFIG && Array.isArray(window.gameState?.researches)) {
        window.gameState.researches.forEach((rId) => {
          const r = window.CONFIG.researches?.[rId];
          if (r?.effect?.intelPerEvent)
            intelBonusFromResearch += Number(r.effect.intelPerEvent);
        });
      }
      if (intelBonusFromResearch > 0) {
        if (typeof window.addIntelPoints === "function")
          window.addIntelPoints(intelBonusFromResearch);
        else if (window.gameState)
          window.gameState.intelPoints += intelBonusFromResearch;
        if (typeof window.showNotification === "function")
          window.showNotification(
            `+${intelBonusFromResearch} PI (Investigación)`,
            "info",
          );
      }

      if (typeof option.apply === "function") {
        try {
          option.apply();
        } catch (err) {
          console.error("Error en option.apply():", err);
        }
      }
    } else {
      // Opción incorrecta -> daño
      const damage =
        typeof window.getRandomHealthDamage === "function"
          ? window.getRandomHealthDamage()
          : 5;
      if (typeof window.applyHealthDamage === "function")
        window.applyHealthDamage(damage);
      else if (window.gameState) {
        window.gameState.health = Math.max(0, window.gameState.health - damage);
        if (typeof window.updateNetworkHealth === "function")
          window.updateNetworkHealth();
      }
      if (typeof window.showNotification === "function")
        window.showNotification(`La red sufrió ${damage} de daño`, "danger");
    }

    if (feedback) {
      feedback.textContent = option.feedback;
      feedback.className = `event-feedback ${option.correct ? "success" : "danger"}`;
      feedback.style.display = "block";
    }

    if (options) {
      Array.from(options.children).forEach((btn) => (btn.disabled = true));
    }

    setTimeout(() => {
      if (modal) modal.style.display = "none";
      if (feedback) feedback.style.display = "none";
      window.gameState.eventActive = false;
      if (typeof window.checkGameOver === "function") window.checkGameOver();
    }, 1200);
  }

  // Función para aplicar daño por nodos infectados
  function applyInfectedNodeDamage() {
    if (!window.gameState) return;
    const infectedCount = (window.gameState.nodes || []).filter(
      (n) => n && n.infected,
    ).length;
    if (infectedCount > 0) {
      const damage = infectedCount * 2;
      if (typeof window.applyHealthDamage === "function") {
        window.applyHealthDamage(damage);
      } else {
        window.gameState.health = Math.max(0, window.gameState.health - damage);
        if (typeof window.updateNetworkHealth === "function")
          window.updateNetworkHealth();
      }
      if (typeof window.showNotification === "function") {
        window.showNotification(
          `🦠 Nodos infectados: -${damage} salud`,
          "danger",
        );
      }
    }
  }

  // Exponer funciones globales
  window.tryTriggerSecurityEvent = tryTriggerSecurityEvent;
  window.tryTriggerPositiveEvent = tryTriggerPositiveEvent;
  window.applyInfectedNodeDamage = applyInfectedNodeDamage;
})();

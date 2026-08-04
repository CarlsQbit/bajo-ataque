/* ==========================================================================
   events.js - Sistema de incidentes de seguridad (versión corregida)
   ========================================================================== */

(function () {
  /* ------------------------------------------------------------------------
     EVENTOS DE SEGURIDAD
     ------------------------------------------------------------------------ */
  /* =========================================================================
        events.js - Sistema de incidentes de seguridad (Versión Pedagógica)
        ========================================================================= */

  const EVENTS = [
    {
      id: "phishing",
      title: "📧 Correo sospechoso",
      description:
        "Un empleado recibió un correo pidiendo contraseñas corporativas urgentes. ¿Qué haces?",
      probability: 0.25,
      givesTraining: true,
      options: [
        {
          label: "Capacitar al empleado inmediatamente",
          correct: true,
          costMoney: 0,
          costIntel: 1,
          feedback:
            "Correcto. El factor humano es la mayor vulnerabilidad. Al capacitarlo, conviertes al eslabón débil en tu primer filtro de seguridad.",
          rewardMoney: true,
          rewardIntel: 1,
          trainingAmount: 10,
        },
        {
          label: "Ignorar, parece inofensivo",
          correct: false,
          feedback:
            "Incorrecto. Los atacantes usan ingeniería social para explotar la confianza. Al ignorarlo, permitiste que las credenciales fueran exfiltradas.",
          damageHealth: true,
        },
        {
          label: "Bloquear remitente y reportar",
          correct: true,
          costMoney: 0,
          costIntel: 0,
          feedback:
            "Buena acción de contención. Bloquear el dominio evita que otros empleados caigan en el mismo anzuelo.",
          rewardMoney: true,
          rewardIntel: 0,
        },
      ],
    },
    {
      id: "ddos",
      title: "🌊 Ataque DDoS",
      description:
        "La red recibe tráfico masivo desde múltiples fuentes. Los servicios se ralentizan.",
      probability: 0.2,
      givesTraining: false,
      options: [
        {
          label: "Contratar servicio anti-DDoS (Scrubbing)",
          correct: true,
          costMoney: 500,
          costIntel: 2,
          feedback:
            "Correcto. Los servicios de limpieza (Scrubbing) filtran el tráfico basura en la nube, dejando pasar solo a los usuarios legítimos.",
          rewardMoney: true,
          rewardIntel: 1,
        },
        {
          label: "Apagar el router principal",
          correct: false,
          costMoney: 700,
          feedback:
            "Incorrecto. Apagar el router logra el objetivo del atacante: dejar a tu empresa sin servicios (pérdida de disponibilidad total).",
          rewardMoney: false,
          rewardIntel: 0,
        },
        {
          label: "Esperar a que pase solo",
          correct: false,
          feedback:
            "Incorrecto. Un ataque DDoS no se detiene solo. La saturación de los switches agotó tus recursos y causó una caída en la calidad del servicio.",
          damageHealth: true,
        },
      ],
    },
    {
      id: "malware",
      title: "🦠 Detección de malware",
      description:
        "El antivirus reportó un archivo sospechoso en una estación de trabajo.",
      probability: 0.2,
      givesTraining: true,
      options: [
        {
          label: "Aislar el endpoint y limpiar",
          correct: true,
          costMoney: 100,
          costIntel: 0,
          feedback:
            "Correcto. La segmentación evita el movimiento lateral del malware hacia los servidores críticos.",
          rewardMoney: true,
          rewardIntel: 1,
        },
        {
          label: "Desinstalar el antivirus",
          correct: false,
          feedback:
            "Error crítico. Eliminar la herramienta de detección permitió que el malware tomara el control total de la red interna sin resistencia.",
          damageHealth: true,
        },
        {
          label: "Reiniciar la computadora",
          correct: false,
          feedback:
            "Incorrecto. Muchos malwares son persistentes y se cargan al iniciar el sistema. El reinicio no eliminó la infección.",
          damageHealth: true,
        },
      ],
    },
    {
      id: "insider",
      title: "👤 Amenaza interna",
      description:
        "Un empleado copió información confidencial en una USB sin permiso.",
      probability: 0.15,
      givesTraining: true,
      options: [
        {
          label: "Revisar logs y capacitar al personal",
          correct: true,
          costMoney: 700,
          costIntel: 1,
          feedback:
            "Correcto. Investigar el origen y reforzar la política de seguridad ayuda a prevenir futuras fugas por negligencia.",
          rewardMoney: true,
          rewardIntel: 1,
          trainingAmount: 10,
        },
        {
          label: "Despedir sin investigar",
          correct: false,
          feedback:
            "Incorrecto. Despedir sin entender el proceso de la fuga no soluciona la falta de controles técnicos (como el bloqueo de puertos USB).",
          damageHealth: true,
        },
        {
          label: "Ignorar, es solo una copia",
          correct: false,
          feedback:
            "Error. La fuga de datos confidenciales compromete la propiedad intelectual y puede tener consecuencias legales graves.",
          damageHealth: true,
        },
      ],
    },
    {
      id: "firmware",
      title: "⚠️ Vulnerabilidad de firmware",
      description:
        "Se publicó una vulnerabilidad crítica en el firmware de los routers.",
      probability: 0.2,
      givesTraining: false,
      options: [
        {
          label: "Aplicar parche de seguridad",
          correct: true,
          costMoney: 0,
          costIntel: 1,
          feedback:
            "Excelente. Mantener los dispositivos actualizados es la base de la higiene cibernética.",
          rewardMoney: true,
          rewardIntel: 2,
        },
        {
          label: "Comprar routers nuevos",
          correct: true,
          costMoney: 500,
          costIntel: 0,
          feedback:
            "Solucionaste el problema, pero gastaste innecesariamente. Un parche suele ser suficiente para equipos modernos.",
          rewardMoney: false,
          rewardIntel: 0,
        },
        {
          label: "No hacer nada",
          correct: false,
          feedback:
            "Incorrecto. Ignorar parches de seguridad conocidos es una invitación abierta para que los atacantes tomen el control de tu red.",
          damageHealth: true,
        },
      ],
    },
    {
      id: "weak-passwords",
      title: "🔑 Contraseñas débiles detectadas",
      description:
        "La auditoría muestra que el 40% del personal usa contraseñas simples.",
      probability: 0.2,
      givesTraining: true,
      options: [
        {
          label: "Implementar política de contraseñas",
          correct: true,
          costMoney: 150,
          costIntel: 1,
          feedback:
            "Correcto. Establecer requisitos de longitud y complejidad reduce drásticamente el éxito de ataques de fuerza bruta.",
          rewardMoney: true,
          rewardIntel: 1,
          trainingAmount: 8,
        },
        {
          label: "Enviar un correo recordatorio",
          correct: false,
          feedback:
            "Inútil. La gente ignora los correos sobre contraseñas si no se les obliga mediante políticas técnicas.",
          damageHealth: true,
        },
        {
          label: "Activar 2FA (Doble factor)",
          correct: true,
          costMoney: 300,
          costIntel: 0,
          feedback:
            "Excelente elección. El 2FA invalida la utilidad de una contraseña débil, añadiendo una capa de seguridad esencial.",
          rewardMoney: true,
          rewardIntel: 2,
        },
      ],
    },
    {
      id: "ransomware",
      title: "🔒 Ransomware detectado",
      description:
        "Un equipo cifró sus archivos. Existe riesgo de propagación.",
      probability: 0.15,
      givesTraining: false,
      options: [
        {
          label: "Aislar y restaurar desde backup",
          correct: true,
          costMoney: 300,
          costIntel: 1,
          feedback:
            "Correcto. El backup es tu seguro de vida. La recuperación de datos es la única forma real de vencer al ransomware.",
          rewardMoney: true,
          rewardIntel: 2,
        },
        {
          label: "Pagar el rescate",
          correct: false,
          costMoney: 200,
          costIntel: 0,
          feedback:
            "Error. Pagar no asegura la recuperación de datos y te convierte en un blanco recurrente para los criminales.",
          damageHealth: true,
        },
        {
          label: "Apagar toda la red",
          correct: true,
          costMoney: 0,
          costIntel: 2,
          feedback:
            "Medida desesperada pero efectiva. Detuviste la propagación, aunque el costo operativo de la inactividad es alto.",
          rewardMoney: false,
          rewardIntel: 0,
        },
      ],
    },
    {
      id: "rogue-ap",
      title: "📶 Punto de acceso no autorizado",
      description: "Se detectó un Access Point desconocido en la red interna.",
      probability: 0.18,
      givesTraining: true,
      options: [
        {
          label: "Localizar y desconectar el AP",
          correct: true,
          costMoney: 0,
          costIntel: 2,
          feedback:
            "Correcto. Cualquier dispositivo no gestionado es un punto ciego para tu equipo de seguridad.",
          rewardMoney: true,
          rewardIntel: 3,
          trainingAmount: 5,
        },
        {
          label: "Ignorar, parece inofensivo",
          correct: false,
          feedback:
            "Error. Los puntos de acceso no autorizados suelen ser usados para ataques Man-in-the-Middle y robo de tráfico.",
          damageHealth: true,
        },
        {
          label: "Implementar 802.1X (Autenticación)",
          correct: true,
          costMoney: 400,
          costIntel: 2,
          feedback:
            "Excelente. El estándar 802.1X autentica cada dispositivo que se conecta, eliminando el riesgo de APs desconocidos.",
          rewardMoney: true,
          rewardIntel: 3,
        },
      ],
    },
    {
      id: "ssl-expired",
      title: "🔐 Certificado SSL expirado",
      description:
        "El certificado SSL venció. Los clientes ven advertencias de seguridad.",
      probability: 0.1,
      givesTraining: false,
      options: [
        {
          label: "Renovar certificado SSL",
          correct: true,
          costMoney: 500,
          costIntel: 0,
          feedback:
            "Correcto. Un sitio web sin SSL válido genera desconfianza y expone el tráfico a intercepciones.",
          rewardMoney: true,
          rewardIntel: 3,
        },
        {
          label: "Usar HTTP temporalmente",
          correct: false,
          feedback:
            "Muy mala idea. Al quitar el cifrado (HTTPS), los datos de tus usuarios viajan visibles para cualquier atacante en la red.",
          damageHealth: true,
        },
        {
          label: "Configurar renovación automática",
          correct: true,
          costMoney: 300,
          costIntel: 1,
          feedback:
            "La mejor práctica. Automatizar los certificados evita errores humanos y olvidos administrativos.",
          rewardMoney: true,
          rewardIntel: 2,
        },
      ],
    },
    {
      id: "no-backup",
      title: "💾 Backup no configurado",
      description:
        "La auditoría detectó que ningún servidor tiene política de respaldo activa. Un fallo hoy significaría pérdida total de datos.",
      probability: 0.18,
      givesTraining: true,
      options: [
        {
          label: "Configurar backup local en disco externo",
          correct: true,
          costMoney: 200,
          costIntel: 0,
          feedback:
            "Correcto. Es una solución básica pero efectiva. Los datos críticos están protegidos.",
          rewardMoney: true,
          rewardIntel: 1,
          trainingAmount: 5,
        },
        {
          label: "Contratar servicio de backup en la nube",
          correct: true,
          costMoney: 400,
          costIntel: 1,
          feedback:
            "Excelente. El backup en la nube es offsite, automático y resistente a desastres físicos.",
          rewardMoney: true,
          rewardIntel: 2,
          trainingAmount: 10,
        },
        {
          label: "Ignorarlo, nunca ha pasado nada",
          correct: false,
          feedback:
            "Incorrecto. Un disco falló y se perdieron semanas de datos de clientes.",
          damageHealth: true,
        },
      ],
    },
    {
      id: "dns-down",
      title: "🌐 Servidor DNS caído",
      description:
        "El DNS primario dejó de responder. Los usuarios no pueden resolver nombres de dominio y reportan que 'el internet no funciona'.",
      probability: 0.2,
      givesTraining: false,
      options: [
        {
          label: "Configurar DNS secundario (8.8.8.8 como fallback)",
          correct: true,
          costMoney: 0,
          costIntel: 1,
          feedback:
            "Correcto. El DNS de Google como secundario restauró la resolución de nombres inmediatamente.",
          rewardMoney: true,
          rewardIntel: 2,
        },
        {
          label: "Redirigir tráfico usando IPs directas temporalmente",
          correct: true,
          costMoney: 100,
          costIntel: 0,
          feedback:
            "Funcionó como parche temporal, pero mantener IPs hardcodeadas es difícil de escalar.",
          rewardMoney: false,
          rewardIntel: 1,
        },
        {
          label: "Esperar a que el servidor DNS se recupere solo",
          correct: false,
          feedback:
            "Incorrecto. El DNS estuvo caído 4 horas. Toda la red pareció 'sin internet' para los usuarios.",
          damageHealth: true,
        },
      ],
    },
  ];

  /* ------------------------------------------------------------------------
     EVENTOS POSITIVOS
     ------------------------------------------------------------------------ */
  const POSITIVE_EVENTS = [
    {
      id: "ceo-bonus",
      title: "🎉 ¡El CEO amaneció de buenas!",
      description:
        "El CEO quedó impresionado con el desempeño de la red y otorgó un bono especial al equipo de TI.",
      type: "money",
      amount: 300,
      probability: 0.15,
    },
    {
      id: "audit-passed",
      title: "✅ Auditoría superada con éxito",
      description:
        "La auditoría calificó la red como 'Excelente'. El cliente principal renovó contrato y pagó por adelantado.",
      type: "money",
      amount: 500,
      probability: 0.12,
    },
    {
      id: "grant-received",
      title: "🏆 Subsidio gubernamental aprobado",
      description:
        "La empresa fue seleccionada para un subsidio de modernización tecnológica.",
      type: "money",
      amount: 700,
      probability: 0.08,
    },
    {
      id: "training-seminar",
      title: "📚 Seminario gratuito de ciberseguridad",
      description:
        "Un proveedor ofreció un seminario gratuito. El equipo aprendió nuevas técnicas de defensa.",
      type: "training",
      amount: 15,
      probability: 0.18,
    },
    {
      id: "intern-helpful",
      title: "💡 El becario encontró una falla",
      description:
        "El nuevo becario detectó una vulnerabilidad menor antes de que fuera explotada.",
      type: "intel",
      amount: 3,
      probability: 0.2,
    },
    {
      id: "network-optimized",
      title: "⚡ Optimización automática de red",
      description:
        "Las herramientas de monitoreo detectaron y corrigieron cuellos de botella.",
      type: "health",
      amount: 15,
      probability: 0.15,
    },
    {
      id: "vendor-discount",
      title: "🛒 Descuento sorpresa de proveedor",
      description:
        "El proveedor de hardware ofrece un reembolso por volumen de compras del trimestre.",
      type: "money",
      amount: 400,
      probability: 0.12,
    },
    {
      id: "coffee-machine",
      title: "☕ Nueva cafetera en el área de TI",
      description:
        "La moral del equipo subió. Resolvieron tickets más rápido y detectaron amenazas adicionales.",
      type: "intel",
      amount: 2,
      probability: 0.2,
    },
  ];

  /* ------------------------------------------------------------------------
     VARIABLES DE CONTROL
     ------------------------------------------------------------------------ */
  let eventCheckCooldown = 0;
  const EVENT_CHECK_INTERVAL = 3;
  let lastEventId = null;
  let positiveEventCooldown = 0;
  const POSITIVE_EVENT_INTERVAL = 5;

  /* ------------------------------------------------------------------------
     GENERACIÓN DE EVENTOS DE SEGURIDAD
     ------------------------------------------------------------------------ */
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

    const triggeredEvents = EVENTS.filter((ev) => {
      const effectiveProbability = ev.probability * (1 - reduction);
      return Math.random() < effectiveProbability;
    });

    if (triggeredEvents.length === 0) return;

    const filtered = triggeredEvents.filter((ev) => ev.id !== lastEventId);
    const pool = filtered.length > 0 ? filtered : triggeredEvents;
    const event = pool[Math.floor(Math.random() * pool.length)];
    lastEventId = event.id;
    openEventModal(event);
  }

  /* ------------------------------------------------------------------------
     GENERACIÓN DE EVENTOS POSITIVOS
     ------------------------------------------------------------------------ */
  function tryTriggerPositiveEvent() {
    if (!window.gameState) return;
    if (window.gameState.eventActive) return;
    if (window.gameState.isPaused) return;

    positiveEventCooldown--;
    if (positiveEventCooldown > 0) return;
    positiveEventCooldown = POSITIVE_EVENT_INTERVAL;

    const triggered = POSITIVE_EVENTS.filter(
      (ev) => Math.random() < ev.probability,
    );
    if (triggered.length === 0) return;

    const event = triggered[Math.floor(Math.random() * triggered.length)];

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

  /* ------------------------------------------------------------------------
       MODAL DE EVENTO DE SEGURIDAD
       ------------------------------------------------------------------------ */
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

    // Contador visual y temporizador de respuesta
    // Tiempo base fijo de 10 segundos
    let totalSeconds = 10;
    // Si tiene la investigación "Seguridad en Empleados", añadir 5 segundos
    if (window.gameState?.researches?.includes("security-awareness")) {
      totalSeconds += 5;
    }
    const timerEl = document.getElementById("event-timer");
    let remaining = totalSeconds;
    if (timerEl) timerEl.textContent = `⏱ ${remaining}s`;

    // limpiar cualquier timer previo por seguridad
    if (modal._timerInterval) clearInterval(modal._timerInterval);
    if (modal._autoClose) clearTimeout(modal._autoClose);

    modal._timerInterval = setInterval(() => {
      remaining--;
      if (timerEl) timerEl.textContent = `⏱ ${remaining}s`;
    }, 1000);

    // Auto-cierre: si el jugador no responde en el tiempo, aplicar daño
    modal._autoClose = setTimeout(() => {
      // limpieza de intervalos
      if (modal._timerInterval) {
        clearInterval(modal._timerInterval);
        modal._timerInterval = null;
      }

      modal.style.display = "none";
      const feedbackEl = document.getElementById("event-feedback");
      if (feedbackEl) feedbackEl.style.display = "none";

      window.gameState.eventActive = false;

      // DAÑO POR NO RESPONDER: use applyHealthDamage si está disponible
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

      // Asegurarse de chequear game over
      if (typeof window.checkGameOver === "function") window.checkGameOver();
    }, totalSeconds * 1000); // Timeout usa totalSeconds corregido
  } // ← Esta llave cierra la función openEventModal()

  /* ------------------------------------------------------------------------
       RESOLUCIÓN DE OPCIÓN
       ------------------------------------------------------------------------ */
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

    // Verificar recursos otra vez antes de aplicar (mantener modal abierto si no alcanza)
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
      // No cerramos el modal aquí; el jugador puede elegir otra opción
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

      // --- NUEVO: Sumar PI extra por investigaciones (IDS, SIEM, etc.) ---
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
      // -----------------------------------------------------------------

      if (typeof option.apply === "function") {
        try {
          option.apply();
        } catch (err) {
          // no romper el flujo si la función apply tiene errores
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
  } // ← Esta llave cierra la función resolveEventOption()

  /* ------------------------------------------------------------------------
     DAÑO POR NODOS INFECTADOS
     ------------------------------------------------------------------------ */
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
          `🚨 Nodos infectados: -${damage} salud`,
          "danger",
        );
      }
    }
  }

  /* ------------------------------------------------------------------------
     EXPOSICIÓN GLOBAL
     ------------------------------------------------------------------------ */
  window.tryTriggerSecurityEvent = tryTriggerSecurityEvent;
  window.tryTriggerPositiveEvent = tryTriggerPositiveEvent;
  window.applyInfectedNodeDamage = applyInfectedNodeDamage;
  window.EVENTS = EVENTS;
})();

research.js(
  /* ==========================================================================
   research.js - Investigaciones y capacitación de empleados
   Responsabilidad: árbol de investigaciones, barra de capacitación y
   reducción de probabilidad de eventos de seguridad.
   ========================================================================== */

  function () {
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
          (window.gameState.eventExtraTime || 0) +
          research.effect.eventExtraTime;
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
  },
)();

Network -
  noes.js(
    /* ==========================================================================
   network-nodes.js - Crear, registrar, anclas, comprar/vender nodos
   ========================================================================== */

    function () {
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
        node.element.classList.toggle(
          "traffic-saturated",
          !!node.trafficSaturated,
        );
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
            node.saturated =
              ratio >= threshold && node.connections < node.maxPorts;
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
    },
  )();

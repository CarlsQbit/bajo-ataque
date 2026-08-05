/* ==========================================================================
   economy.js - Sistema económico
   Responsabilidad: recompensas variables, daños a salud, préstamos,
   ingresos diarios y penalizaciones.
   ========================================================================== */

(function () {

  // Función para actualizar todos los menús de compra
  function updateAllBuyMenus() {
    if (typeof window.renderResearchMenu === "function") window.renderResearchMenu();
    if (typeof window.renderBuildMenu === "function") window.renderBuildMenu();
    if (typeof window.renderLoansMenu === "function") window.renderLoansMenu();
    if (typeof window.renderCableTools === "function") window.renderCableTools();
  }

  /* ------------------------------------------------------------------------
     RECOMPENSAS Y DAÑOS VARIABLES
     ------------------------------------------------------------------------ */
  function getRandomReward() {
    // $200 a $700, aumentando de $100 en $100
    const steps = (700 - 200) / 100 + 1;
    const index = Math.floor(Math.random() * steps);
    return 200 + index * 100;
  }

  function getRandomHealthDamage() {
    // 10%, 20%, 30% o 40%
    const steps = (40 - 10) / 10 + 1;
    const index = Math.floor(Math.random() * steps);
    return 10 + index * 10;
  }

  /* ------------------------------------------------------------------------
     APLICACIÓN DE RECOMPENSAS Y PENALIZACIONES
     ------------------------------------------------------------------------ */
  function applyMoneyReward(baseAmount) {
    const bonus = 1 + (window.gameState?.phishingBonus || 0);
    const total = Math.round(baseAmount * bonus);
    window.gameState.money += total;
    window.gameState.totalMoneyEarned += total;
    if (typeof window.updateMoneyUI === "function") window.updateMoneyUI();
    if (typeof updateAllBuyMenus === "function") updateAllBuyMenus();
    return total;
  }

  function applyMoneyPenalty(amount) {
    window.gameState.money = Math.max(0, window.gameState.money - amount);
    if (typeof window.updateMoneyUI === "function") window.updateMoneyUI();
    if (typeof updateAllBuyMenus === "function") updateAllBuyMenus();
  }

  function applyHealthDamage(percentage) {
    const damage = (window.gameState.maxHealth * percentage) / 100;
    window.gameState.health = Math.max(0, window.gameState.health - damage);
    if (typeof window.updateNetworkHealth === "function")
      window.updateNetworkHealth();
    return damage;
  }

  function restoreHealth(amount) {
    window.gameState.health = Math.min(
      window.gameState.maxHealth,
      window.gameState.health + amount,
    );
    if (typeof window.updateNetworkHealth === "function")
      window.updateNetworkHealth();
  }

  function addIntelPoints(amount) {
    window.gameState.intelPoints += amount;
    if (typeof window.updateHUD === "function") window.updateHUD();
    if (typeof updateAllBuyMenus === "function") updateAllBuyMenus();
  }

  /* ------------------------------------------------------------------------
     INGRESOS DIARIOS Y PAQUETES
     ------------------------------------------------------------------------ */
  function applyDailyIncome() {
    const connectedEndpoints = window.gameState.nodes.filter(
      (n) => n.type === "endpoint" && n.connections > 0,
    ).length;

    const baseIncome =
      connectedEndpoints * (window.CONFIG.dailyIncomePerEndpoint || 15);
    const totalIncome = Math.round(baseIncome * (1 - getTotalIncomePenalty()));
    window.gameState.money += totalIncome;
    window.gameState.totalMoneyEarned += totalIncome;
  }

  function getTotalIncomePenalty() {
    return window.gameState.loans.reduce(
      (sum, loan) => sum + loan.incomePenalty,
      0,
    );
  }

  /* ------------------------------------------------------------------------
     PRÉSTAMOS
     ------------------------------------------------------------------------ */
  function takeLoan(loanId) {
    const loanConfig = window.CONFIG.loans[loanId];
    if (!loanConfig) return false;

    const alreadyTaken = window.gameState.loans.some((l) => l.id === loanId);
    if (alreadyTaken) {
      if (typeof window.showNotification === "function") {
        window.showNotification("Ya tienes este préstamo activo.", "warning");
      }
      return false;
    }

    const loan = {
      id: loanId,
      name: loanConfig.name,
      amount: loanConfig.amount,
      interest: loanConfig.interest,
      incomePenalty: loanConfig.incomePenalty,
      totalOwed: Math.round(loanConfig.amount * (1 + loanConfig.interest)),
      paid: 0,
    };

    window.gameState.loans.push(loan);
    window.gameState.money += loanConfig.amount;
    if (typeof window.updateMoneyUI === "function") window.updateMoneyUI();
    if (typeof window.updateAllBuyMenus === "function") window.updateAllBuyMenus();
    if (typeof window.showNotification === "function") {
      window.showNotification(
        `${loanConfig.name} aprobado: +$${loanConfig.amount}`,
        "success",
      );
    }
    return true;
  }

  function payLoan(loanId) {
    const loan = window.gameState.loans.find((l) => l.id === loanId);
    if (!loan) return false;

    const remaining = loan.totalOwed - loan.paid;
    if (window.gameState.money < remaining) {
      if (typeof window.showNotification === "function") {
        window.showNotification(
          "No tienes suficiente dinero para pagar el préstamo.",
          "warning",
        );
      }
      return false;
    }

    window.gameState.money -= remaining;
    loan.paid = loan.totalOwed;
    if (typeof window.updateAllBuyMenus === "function") window.updateAllBuyMenus();
    window.gameState.loans = window.gameState.loans.filter(
      (l) => l.id !== loanId,
    );
    if (typeof window.updateMoneyUI === "function") window.updateMoneyUI();
    if (typeof window.showNotification === "function") {
      window.showNotification(
        `Préstamo "${loan.name}" pagado completamente.`,
        "success",
      );
    }
    return true;
  }

  function applyLoanPenalties() {
    // La penalización principal ya se aplica en applyDailyIncome.
    // Aquí se puede agregar interés compuesto semanal si se desea.
  }

  function processLoans() {
    if (
      window.gameState.loans.length > 0 &&
      typeof window.showNotification === "function"
    ) {
      window.showNotification(
        `Préstamos activos: ${window.gameState.loans.length}. Recuerda pagarlos.`,
        "warning",
      );
    }
  }

  /* ------------------------------------------------------------------------
       PRECIOS DE CABLES CON DESCUENTO (GREEN IT)
       ------------------------------------------------------------------------ */
  function getCablePrice(type) {
    const config = window.CABLE_TYPES?.[type];
    if (!config) return 0;

    let price = config.cost || 0;

    // Si tiene la investigación "green-it", aplicamos el 10% de descuento
    if (window.hasResearch && window.hasResearch("green-it")) {
      // Usamos el valor de CONFIG si existe, sino 0.1 por defecto
      const discount =
        window.CONFIG?.researches?.["green-it"]?.effect?.cableCostDiscount ||
        0.1;
      price = Math.round(price * (1 - discount));
    }

    return price;
  }

  // Asegúrate de agregarla al Object.assign
  Object.assign(window, {
    // ... tus otras funciones ...
    getCablePrice,
    // ...
  });

  /* ------------------------------------------------------------------------
     EXPOSICIÓN GLOBAL
     ------------------------------------------------------------------------ */
  Object.assign(window, {
    getRandomReward,
    getRandomHealthDamage,
    applyMoneyReward,
    applyMoneyPenalty,
    applyHealthDamage,
    restoreHealth,
    addIntelPoints,
    getCablePrice,
    applyDailyIncome,
    getTotalIncomePenalty,
    takeLoan,
    payLoan,
    applyLoanPenalties,
    processLoans,
  });
})();

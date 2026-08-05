/* ==========================================================================
   events-positive.js - Eventos positivos (bonos, auditorías, subsidios, etc.)
   ========================================================================== */

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
    description: "La empresa fue seleccionada para un subsidio de modernización tecnológica.",
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
    title: "🔍 El becario encontró una falla",
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
    title: "💰 Descuento sorpresa de proveedor",
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

// Exponer el array de eventos positivos
window.POSITIVE_EVENTS = POSITIVE_EVENTS;

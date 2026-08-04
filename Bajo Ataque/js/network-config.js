/* ====
    network-config.js - Tipos de nodos y cables
    ==== */

window.NODE_TYPES = {
  router: { name: "Router", maxPorts: 8, cost: 0, color: "#3b82f6" },
  switch8: {
    name: "Switch 8 puertos",
    maxPorts: 8,
    cost: 250,
    color: "#10b981",
  },
  switch16: {
    name: "Switch 16 puertos",
    maxPorts: 16,
    cost: 450,
    color: "#059669",
  },
  switch24: {
    name: "Switch 24 puertos",
    maxPorts: 24,
    cost: 700,
    color: "#047857",
  },
  endpoint: { name: "Endpoint", maxPorts: 1, cost: 0, color: "#f59e0b" },
  server: {
    name: "Servidor",
    maxPorts: 4,
    cost: 0,
    color: "#8b5cf6",
    // Generación de paquetes más rápida (ms)
    packetGenMin: 800, // 0.8s mínimo entre paquetes
    packetGenMax: 1500, // 1.5s máximo entre paquetes
    // Límite de cola antes de considerarlo saturado
    queueLimit: 20,
  },
};

window.CABLE_TYPES = {
  coaxial: {
    name: "Cable Coaxial",
    cost: 50,
    speed: 0.4,
    cooldown: 3000,
    color: "#a16207",
    description: "Tecnología legada. Muy barato pero lento. Ideal al inicio.",
  },
  cat5e: {
    name: "Cat5e",
    cost: 60,
    speed: 0.7,
    cooldown: 2000,
    color: "#94a3b8",
    description: "Hasta 100 Mbps. El más común en oficinas antiguas.",
  },
  utp: {
    name: "UTP Cat6",
    cost: 80,
    speed: 1.2,
    cooldown: 1500,
    color: "#64748b",
    description: "Hasta 1 Gbps. Estándar actual en redes empresariales.",
  },
  cat6a: {
    name: "Cat6A",
    cost: 120,
    speed: 1.8,
    cooldown: 1000,
    color: "#475569",
    description: "Hasta 10 Gbps. Usado en centros de datos modernos.",
  },
  fibra: {
    name: "Fibra Multimodo",
    cost: 170,
    speed: 2.5,
    cooldown: 500,
    color: "#06b6d4",
    description: "Transmisión óptica. Alta velocidad para distancias medias.",
  },
  // fibra_mono: {
  //   name: "Fibra Monomodo",
  //   cost: 130,
  //   speed: 2.5,
  //   cooldown: 500,
  //   color: "#0ea5e9",
  //   description: "Largas distancias con baja pérdida de señal. Usada en WANs y backbones.",
  // },
};

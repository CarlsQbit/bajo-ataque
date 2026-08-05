/* ==========================================================================
   events-security.js - Eventos de seguridad (phishing, DDoS, malware, etc.)
   ========================================================================== */

const SECURITY_EVENTS = [
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
    title: "🌪 Ataque DDoS",
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
    description: "El antivirus reportó un archivo sospechoso en una estación de trabajo.",
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
    description: "Un empleado copió información confidencial en una USB sin permiso.",
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
    description: "Se publicó una vulnerabilidad crítica en el firmware de los routers.",
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
    description: "La auditoría muestra que el 40% del personal usa contraseñas simples.",
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
    description: "Un equipo cifró sus archivos. Existe riesgo de propagación.",
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
    description: "El certificado SSL venció. Los clientes ven advertencias de seguridad.",
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
          "Incorrecto. El DNS estuvo caído 4 horas. Toda la red parecía 'sin internet' para los usuarios.",
        damageHealth: true,
      },
    ],
  },
];

// Exponer el array de eventos de seguridad
window.SECURITY_EVENTS = SECURITY_EVENTS;

/* ============================================================
   CONFIGURACIÓN DEL CONSULTORIO — edita solo este archivo
   para cambiar WhatsApp y los mensajes precargados.
   El texto visible y el schema.org viven en index.html.
   ============================================================ */
window.CLINICA = {
  /* WhatsApp: 52 + LADA + número, sin espacios ni signos */
  whatsapp: "523312345678",

  /* Mensaje precargado por sección. La clave debe coincidir
     con el atributo data-wa="..." del enlace en el HTML. */
  mensajes: {
    general:        "Hola, vi su página y quiero agendar una valoración.",
    hero:           "Hola, quiero agendar una valoración dental.",
    ortodoncia:     "Hola, me interesa un tratamiento de ortodoncia. ¿Me pueden dar informes?",
    blanqueamiento: "Hola, quiero informes del blanqueamiento dental.",
    rehabilitacion: "Hola, necesito una rehabilitación oral. ¿Cómo es el proceso?",
    resultados:     "Hola, vi los casos en su página. Quiero saber si mi caso es parecido.",
    faq:            "Hola, tengo una duda sobre un tratamiento.",
    contacto:       "Hola, quiero agendar una cita.",
    cierre:         "Hola, quiero agendar una valoración dental.",
    pie:            "Hola, quiero informes.",
    flotante:       "Hola, quiero agendar una valoración dental."
  },

  /* Etiqueta que se añade al mensaje para saber de dónde viene el lead.
     Déjalo en "" si no quieres rastreo. */
  firmaOrigen: "\n\n(Vengo del sitio web)"
};

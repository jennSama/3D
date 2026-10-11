# PLAN · Guía 25 · Juego de caries en Odontopediatría

**Fecha:** 2026-10-11 · **Responsable:** docente de Odontopediatría

1. **Ficha.**
   - Compensación: controlar la causa antes de restaurar, frente al atajo barato o el sobretratamiento.
   - Rondas: 3 casos × 5 rondas × 3 opciones, con 10 fichas por caso.
   - Tentación marcada en cada ronda.
   - Reflexión: justificar la compensación en cada caso y comparar las tres edades en el acumulado.
   - Uso: tarea en casa o en clase con proyector.
   - Registro: hoja de Google del docente; el progreso del estudiante queda en su navegador.
   - Trucos: memorizar la opción de 3 puntos. Se mitiga con la justificación y el número de intento.
2. **Carpeta.** `juego_caries_github/` con `index.html`, `reglas.md` (v2.0), `partidas_referencia.csv`, `Code.gs`, las instrucciones y los guiones. Aplicación v2.1.
3. **Herramientas.** HTML de un solo archivo (audio incrustado) publicado en GitHub Pages, más la hoja de Google con Apps Script. El paquete SCORM queda como opción futura si el LMS debe registrar la nota.
4. **Pasos 1 a 5.**
   - Reglas y tarjetas: ✔ (`reglas.md`).
   - Juego: ✔
   - Partidas de referencia: ✔ (22 de 22 pruebas internas, 2026-10-11).
   - Cierre y teclado: ✔
   - Revisión por un colega: **pendiente**.
5. **Consideraciones.** La advertencia «puntos = reglas educativas» está en pantalla. No hay azar. No se piden identidades. El escenario es ficticio. Hay teclado, reinicio, alto contraste y tamaño de texto.
6. **Nivel actual: 2.** Siguiente nivel (3): una devolución de la IA sobre la estrategia jugada, sin cambiar los puntos.
7. **LMS.** Recurso URL (Moodle) o enlace externo (Canvas, D2L) con el enlace de GitHub Pages. La justificación se entrega en un Foro o una Tarea.
8. **Pruebas de aceptación.**

| Prueba | Esperado | Estado |
|---|---|---|
| Partida A de cada caso | 15 puntos · 0 fichas | ✔ automática |
| Partida B de cada caso | 5 puntos · 6 fichas | ✔ automática |
| Partida C (3,3,3,0,0) | 9 puntos · 1 o 0 fichas | ✔ automática y jugada en la interfaz (C1) |
| Opción que no se puede pagar | Deshabilitada con el motivo | ✔ |
| Cada elección | Consecuencia visible | ✔ |
| Partida y reinicio solo con teclado | Completa | Pendiente (colega) |
| Cierre | Resumen + justificación | ✔ |
| «Mi avance» | Estado, intentos, mejor y último puntaje, continuar | ✔ |
| Retroalimentación al cierre de cada caso | Elección, consecuencia y opción recomendada en las 5 rondas | ✔ (v2.2, Camila 10/15 con 9 fichas) |
| Likert y autoevaluación | Solo en el cierre final, con los 3 casos | ✔ (v2.2) |
| Modo inglés | Interfaz, escena, casos, opciones, retroalimentación y narración | ✔ (v2.2) |
| Bienvenida antes de los casos | Explicación, 5 pasos, competencias y botón a los casos | ✔ (v3.0) |
| Vitrina 3D | Tocar a un paciente abre su caso | ✔ (v3.0, Camila) |
| Clínica 3D | Caminar con teclado y con toques, abrir estaciones, caso completo 15/15 | ✔ (v3.0) |
| Cambio 3D/2D en plena ronda | Sin perder el avance ni duplicar capas | ✔ (v3.0) |
| Teléfono (375 px) en la bienvenida | La vitrina cabe completa | ✔ (v3.0) |
| Sin internet | Vista 2D automática | Pendiente: probar sin conexión |
| Práctica guiada | Paso a paso, teoría, 3 pistas (concepto, descarte, recomendada y puntos), reintento con devolución de fichas | ✔ (v4.0, Valentina 13/15, 3 pistas, 1 reintento) |
| Evaluación bloqueada hasta la práctica | Botón deshabilitado con el motivo | ✔ (v4.0) |
| Evaluación sin ayuda | Sin pistas, teoría, tabla ni reintento; puntos ocultos hasta elegir | ✔ (v4.0, Valentina 8/15) |
| Retroalimentación de errores | «Lo que no hiciste correctamente» con lo correcto, el porqué y la teoría | ✔ (v4.0, 3 errores listados) |
| Biblioteca teórica | 8 temas; enlace desde un error y regreso al cierre | ✔ (v4.0) |
| Registro | Filas con `modo`, `pistas_usadas` y `reintentos`; el acumulado cuenta solo evaluaciones | ✔ en CSV; hoja pendiente de URL /exec |
| Audio de ElevenLabs desde `audio/` | Usa el mp3 si existe; si no, la voz incrustada | ✔ probado con un archivo temporal; **faltan los 9 mp3** (cuenta sin créditos) |
| Fila en la hoja + pestaña Avance | Aparece con el código | Pendiente (requiere su URL /exec) |
| Teléfono (375 px) | Sin desplazamiento horizontal | ✔ |

9. **Siguiente acción.**
   - Implementar `Code.gs` y pegar la URL `/exec` en `index.html`.
   - Publicar en GitHub Pages.
   - Pedir a un colega una partida sin explicación (protocolo R3.5).

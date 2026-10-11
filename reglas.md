# Reglas · Consultas de Odontopediatría (caries)

**Versión de reglas:** 2.0 · 2026-10-05 (constante `VERSION_REGLAS` en `index.html`)
**Versión de la aplicación:** 4.0 · 2026-10-11. Los costos y los puntos de cada opción no cambian.
- **4.0** agrega:
  - dos modos por caso (práctica guiada y evaluación sin ayuda, ver «Modos»);
  - la Biblioteca teórica;
  - retroalimentación final de errores con lo correcto, el porqué y el tema para repasar;
  - dibujos clínicos más realistas;
  - una clínica 3D con texturas, iluminación y mobiliario clínico.

## Modos de cada caso

| | Práctica guiada (paso 1) | Evaluación sin ayuda (paso 2) |
|---|---|---|
| Razonamiento «paso a paso» por decisión | Sí | No |
| Teoría de la decisión | Sí, desplegable | No (solo en la Biblioteca, fuera de la ronda) |
| Pistas | 3 por ronda: 1) concepto, 2) descarta la opción que agrava, 3) señala la recomendada y muestra los puntos | No |
| Puntos de cada opción antes de elegir | Ocultos, salvo con la pista 3 o en la tabla de puntuación (ayuda) | Ocultos; se revelan al elegir |
| Reintentar una decisión que no fue la mejor | Sí, se recuperan las fichas | No |
| Cuenta para el puntaje acumulado y el cierre final | No (se registra como práctica, con pistas y reintentos) | Sí |
| Habilitación | Siempre | Al terminar la práctica de ese caso |

En la práctica guiada, la tabla de puntuación visible que pide la guía 25 está disponible como herramienta de ayuda. En la evaluación se oculta para que el puntaje refleje el criterio propio. En ambos modos los **costos en fichas** se ven siempre, y la consecuencia de cada elección se explica de inmediato.

**Retroalimentación final de cada caso:** primero aparece «Lo que no hiciste correctamente», con:
- la opción elegida y su consecuencia;
- lo correcto, con su costo, sus puntos y su consecuencia;
- el porqué (el principio clínico de esa ronda);
- los temas de la Biblioteca teórica para repasar.

Después, plegado, aparece «Lo que hiciste bien».
- **3.0** agrega:
  - la bienvenida «¿De qué trata el simulador?» antes de los casos;
  - la selección de pacientes en una vitrina 3D;
  - la clínica en 3D (Three.js), con la vista 2D como alternativa y como respaldo sin internet.
- **2.1** agregó el panel «Mi avance», el número de intento y la pestaña «Avance» en la hoja de Google.
- **2.2** agrega:
  - retroalimentación de cada decisión al cierre de cada caso;
  - valoración Likert y autoevaluación una sola vez, al final de los tres casos;
  - toda la experiencia en inglés cuando se elige *English*;
  - audios de ElevenLabs que se cargan desde la carpeta `audio/`.
**Guía:** 25 · Juego educativo con puntuación · Curso Vibe Coding CEDIA 2026

## Objetivo

El estudiante comprende que **en caries se controla la causa antes de restaurar**. Decide con un tiempo clínico limitado y explica qué compensación hizo: dónde invirtió tiempo, dónde ahorró y qué riesgo aceptó.

**Compensación que enseña:** invertir fichas en diagnóstico, prevención y educación, frente al atajo barato (poco tiempo y poca calidad) y frente al sobretratamiento (mucho tiempo y ninguna calidad).

## Escenario

Una clínica de Odontopediatría **ficticia** recibe a tres pacientes que representan tres etapas: primera infancia, edad escolar y adolescencia. Cada caso se juega en una escena 2D: el estudiante camina por la clínica (sala de espera, ficha clínica, sillón dental, mesa de educación) y en cada estación toma una decisión. Los casos y los nombres son inventados. El contenido proviene de la clase «Caries dental en niños y adolescentes».

## Reglas fijas

1. Cada caso empieza con **10 fichas de tiempo clínico** y tiene **5 rondas** en orden fijo.
2. Cada ronda tiene **3 opciones**, y cada opción indica su **costo en fichas** (0 a 4) y sus **puntos de calidad** (0, 1 o 3).
3. Puntuación máxima: **15 puntos por caso** y **45 en total**.
4. **No hay azar.** Cada opción tiene una sola consecuencia, fija y explicada en pantalla después de elegir.
5. Si una opción cuesta más que las fichas disponibles, aparece **deshabilitada con el motivo**.
6. La **tabla de puntuación** se puede consultar en cada ronda, antes de elegir.
7. En pantalla se lee: *«Los puntos son reglas educativas basadas en el contenido de la clase, no predicciones clínicas ni una escala psicométricamente validada.»*
8. **Cierre de cada caso:**
   - **Retroalimentación de cada decisión:** lo elegido, su consecuencia y, si no fue la mejor opción, la opción recomendada con su costo y su consecuencia.
   - Una pregunta de compensación generada a partir de la partida, la justificación escrita y el desempeño por competencia con enlace al microrecurso.
8b. **Cierre final** (solo con los tres casos completos):
   - Resultado acumulado sobre 45 puntos y desempeño por competencia.
   - **Valoración de la experiencia** (Likert de 5 ítems) y **autoevaluación formativa** por competencia, una sola vez.
   - Comparación entre la percepción del estudiante y su desempeño, y reflexión final.
   - Todo se envía a la pestaña «Acumulado».
8c. **Idioma:** con *English* se traducen la interfaz, la escena 2D, los casos, las opciones, las consecuencias y la retroalimentación, además de la narración. Los ids y los datos que llegan a la hoja no cambian; la columna `idioma` registra el idioma usado.
9. **Registro:** se usa un código anónimo de 3 a 12 caracteres (se rechazan las cédulas de 10 dígitos), el nivel académico y el consentimiento. Sin consentimiento no se calcula.
10. **Avance:** se guarda en el navegador del estudiante (panel «Mi avance»). Cada caso calculado se envía a la hoja de Google del docente; si no hay conexión, queda en cola y se reenvía.
11. Todo se puede jugar con **teclado**: flechas o WASD, E o Espacio, teclas 1 a 3 y Esc. También hay un **botón para reiniciar el caso**.

Puntos por opción: **3** = decisión adecuada · **1** = atajo tentador (barato e insuficiente) · **0** = error u omisión, o sobretratamiento.

## Tarjetas de decisión

### C1 · Valentina, 3 años 6 meses · Primera infancia

| Ronda | Decisión | Opción | Costo | Puntos | Consecuencia explicada |
|---|---|---|---|---|---|
| R1 | Diagnóstico integral | Examen visual rápido y anotar las lesiones *(tentadora)* | 1 | 1 | Ves las lesiones pero no la causa; sin historia dietética el tratamiento queda a medias. |
| | | Anamnesis completa e historia dietética | 3 | 3 | Descubres biberón nocturno con jugo, ≈6 momentos de azúcar y pasta sin flúor: diagnóstico = lesión + actividad + riesgo + contexto. |
| | | Radiografías de toda la boca y prueba de S. mutans | 4 | 0 | Casi la mitad del tiempo sin conocer hábitos; los microorganismos no determinan la enfermedad; radiografías según necesidad. |
| R2 | Riesgo cariogénico | Riesgo moderado: es solo una cavidad *(tentadora)* | 1 | 1 | Subestima: lesiones activas + azúcar frecuente + biofilm + bajo flúor = riesgo alto; seguimiento insuficiente. |
| | | No clasificar: el riesgo es igual para todos | 0 | 0 | Sin clasificación individual no se decide intensidad ni frecuencia de control. |
| | | Riesgo alto | 2 | 3 | Correcto; mayor intensidad preventiva y controles cada 3 meses. |
| R3 | Lesión inicial no cavitada | Recomendar «cepíllese mejor» *(tentadora)* | 1 | 1 | Correcto pero insuficiente en riesgo alto; la lesión activa probablemente progrese. |
| | | Remineralizar (barniz, pasta fluorada supervisada, dieta, seguimiento) | 2 | 3 | La lesión no cavitada puede detenerse o revertirse; se preserva estructura. |
| | | Restaurar con resina los cuatro incisivos | 3 | 0 | Sobretratamiento: se pierde tejido sano y la causa sigue activa. |
| R4 | Cavidad en molar temporal | Solo observar: se va a caer | 0 | 0 | El diente temporal progresa rápido; riesgo de dolor e infección. |
| | | Restauración mínimamente invasiva + plan preventivo | 2 | 3 | Repara estructura y controla la enfermedad. |
| | | Restaurar y dar de alta *(tentadora)* | 1 | 1 | Restaurar sin controlar la causa mantiene activa la enfermedad. |
| R5 | Educación familiar y seguimiento | Folleto genérico y control en un año *(tentadora)* | 0 | 1 | Información sin metas rara vez cambia hábitos; un año es demasiado en riesgo alto. |
| | | Charla larga sobre microbiota intestinal | 2 | 0 | Relación indirecta con caries; la familia no sabe qué cambiar esta noche. |
| | | Metas concretas con la familia y control en 3 meses | 1 | 3 | Educación familiar = prevención real en casa. |

### C2 · Mateo, 7 años · Edad escolar

| Ronda | Decisión | Opción | Costo | Puntos | Consecuencia explicada |
|---|---|---|---|---|---|
| R1 | Diagnóstico integral | Vistazo rápido: «no hay huecos» *(tentadora)* | 1 | 1 | Sin secar ni iluminar, la lesión inicial en fisura pasa desapercibida. |
| | | Radiografías de todos los dientes | 4 | 0 | No indicadas por rutina; no muestran hábitos. |
| | | Historia dietética y examen con superficies secas | 3 | 3 | ≈5 momentos de azúcar, cepillado sin supervisión, historia de restauraciones y mancha blanca en fisura del 36. |
| R2 | Riesgo cariogénico | Riesgo bajo: no tiene cavidades *(tentadora)* | 1 | 1 | Ausencia de cavidades no es ausencia de enfermedad. |
| | | Riesgo moderado | 2 | 3 | Correcto: intensificar higiene, dieta, flúor y sellantes; reevaluar. |
| | | Clasificar por edad: a los 7 años todos son de bajo riesgo | 0 | 0 | El riesgo es individual; los molares recién erupcionados son vulnerables. |
| R3 | Molares permanentes sanos | Sellantes de fosas y fisuras | 2 | 3 | Indicados en fisuras susceptibles; control de retención. |
| | | Indicar que se cepille mejor las muelas *(tentadora)* | 1 | 1 | La destreza a los 7 años no alcanza el fondo de fisuras profundas. |
| | | Preparar las fisuras y colocar resinas | 3 | 0 | Sobretratamiento de dientes sanos. |
| R4 | Lesión inicial en fisura | Solo flúor y revisar en un año *(tentadora)* | 1 | 1 | Sin sellar ni acortar el control, la lesión activa puede progresar. |
| | | Abrir y restaurar con resina | 3 | 0 | Sacrifica estructura sana; inicia el ciclo restaurador. |
| | | Sellar + flúor + seguimiento | 2 | 3 | Mínimamente invasivo; detiene la lesión antes de perder estructura. |
| R5 | Autonomía supervisada y escuela | Folleto general y control en un año *(tentadora)* | 0 | 1 | Cepillado sin supervisión; sellantes sin revisar a tiempo. |
| | | Prohibir todos los dulces y dar de alta | 0 | 0 | La prohibición total rara vez se cumple; deja sin control lo realizado. |
| | | Autonomía supervisada y control en 6 meses | 1 | 3 | Adulto completa el cepillado, lonchera sin azúcar, control de sellantes. |

### C3 · Camila, 14 años · Adolescencia

| Ronda | Decisión | Opción | Costo | Puntos | Consecuencia explicada |
|---|---|---|---|---|---|
| R1 | Diagnóstico integral | Preguntar solo a la mamá y revisar rápido *(tentadora)* | 1 | 1 | Historia incompleta; la paciente no se siente parte del plan. |
| | | Entrevista directa con Camila y revelado de biofilm | 3 | 3 | ≈4 bebidas azucaradas al día, sin higiene entre brackets; biofilm donde están las manchas. |
| | | Pedir que retiren los brackets para examinar | 4 | 0 | Desproporcionado; corresponde a una decisión conjunta con ortodoncia. |
| R2 | Riesgo cariogénico | Riesgo bajo: el esmalte adulto ya es maduro | 0 | 0 | Lesiones activas, cavidad, azúcar y ortodoncia pesan más que la edad. |
| | | Riesgo alto | 2 | 3 | Correcto: programa intensivo coordinado con ortodoncia. |
| | | Riesgo moderado: ya es grande y se cepilla sola *(tentadora)* | 1 | 1 | Autonomía no es protección; controles demasiado espaciados. |
| R3 | Manchas blancas alrededor de brackets | Recomendar un enjuague bucal *(tentadora)* | 1 | 1 | No reemplaza la remoción mecánica del biofilm. |
| | | Barniz de flúor + técnica de higiene con cepillo interproximal | 2 | 3 | Controla biofilm y remineraliza sin perder estructura. |
| | | Resinas estéticas sobre las manchas | 3 | 0 | Sobretratamiento prematuro; no cambia la causa. |
| R4 | Cavidad en premolar | Esperar a que termine la ortodoncia | 0 | 0 | La cavidad progresa; riesgo de compromiso pulpar. |
| | | Restaurar sin hablar de bebidas *(tentadora)* | 1 | 1 | Restaurar sin controlar la causa mantiene activa la enfermedad. |
| | | Restauración mínimamente invasiva + plan preventivo | 2 | 3 | Repara estructura y trata la causa. |
| R5 | Autocuidado y acuerdos | Folleto y control en un año *(tentadora)* | 0 | 1 | Sin acuerdo propio ni seguimiento, los hábitos no cambian. |
| | | Acuerdo con Camila y control en 3 meses | 1 | 3 | Metas que la paciente elige y puede sostener. |
| | | Sermón sobre consecuencias y amenaza de retirar brackets | 2 | 0 | Deteriora la relación; el miedo no sostiene cambios. |

## Pregunta de compensación en el cierre (regla)

Se elige la primera condición que se cumpla:

1. Hubo una opción de **0 puntos y costo ≥ 2** (sobretratamiento): «Gastaste N fichas en … y eso no sumó calidad. ¿Qué dejaste de hacer y qué riesgo corre ahora el paciente?»
2. Hubo un **atajo** (menos de 3 puntos y costo ≤ 1): «Ahorraste fichas con … Explica qué riesgo aceptaste a cambio.»
3. Quedaron **rondas sin responder**: «¿Qué parte del manejo quedó abierta?»
4. Si no se cumple ninguna (partida perfecta): «Usaste N de 10 fichas sin margen. Si la consulta tuviera solo 8 fichas, ¿qué sacrificarías y por qué?»

## Competencias (autoevaluación y acumulado)

| Competencia | Rondas | Repaso en el microrecurso |
|---|---|---|
| Diagnóstico integral | R1 | m2 · Los factores |
| Clasificación del riesgo | R2 | m5 · Riesgo y manejo |
| Manejo de lesiones | R3 + R4 | m5 · Riesgo y manejo |
| Educación y seguimiento según la edad | R5 | m6 · Prevención según la edad |

Nivel de desempeño según el porcentaje de puntos: 100 % → 4 · 60 % o más → 3 · 30 % o más → 2 · menos de 30 % → 1.

## Trucos revisados

- **El presupuesto es exacto.** La partida preventiva cuesta 10 fichas en los tres casos. Un solo desvío caro hace imposible el máximo, y eso es intencional: obliga a priorizar.
- **Memorizar.** Repetir el caso permite aprender la opción de 3 puntos. Por eso la nota no es el puntaje: lo que se evalúa es la **justificación**. Además, la pregunta de compensación cambia según la partida y la hoja registra el **número de intento**.
- **La opción de 0 fichas no es una salida gratis.** «Folleto» vale 1 punto, y «observar» o «no clasificar» valen 0.
- **Clicar rápido.** Cada ronda exige caminar hasta la estación y la consecuencia aparece antes de poder avanzar.

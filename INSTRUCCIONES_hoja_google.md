# Conectar el juego a una hoja de Google (su Gmail) · 10 minutos

Cada vez que un estudiante pulsa **«Calcular y guardar resultados»**, el juego agrega una fila a una hoja de Google en **su** cuenta de Gmail, y la pestaña **Avance** se actualiza sola, con una fila por estudiante. Puede descargar la hoja como Excel cuando quiera (Archivo › Descargar › Microsoft Excel .xlsx).

## 1. Crear la hoja
1. Entre a https://sheets.google.com con su cuenta de Gmail.
2. Cree una hoja en blanco y póngale un nombre, por ejemplo **Resultados juego caries**.

## 2. Pegar el código receptor
1. En la hoja, vaya a **Extensiones › Apps Script**.
2. Borre lo que aparece y pegue todo el contenido del archivo **Code.gs**.
3. Pulse el ícono de guardar (💾).

## 3. Publicarlo como aplicación web
1. Arriba a la derecha pulse **Implementar › Nueva implementación**.
2. En «Seleccionar tipo» (el engranaje) elija **Aplicación web**.
3. Configure:
   - **Ejecutar como:** Yo (su correo).
   - **Quién tiene acceso:** Cualquier persona.
4. Pulse **Implementar** y acepte los permisos que pide Google. Es su propio script; si aparece «Google no verificó esta app», use *Configuración avanzada › Ir a… (no seguro)*.
5. Copie la **URL de la aplicación web**, que termina en `/exec`.

> Si ya tenía conectada la versión anterior, pegue el nuevo `Code.gs` y use **Implementar › Gestionar implementaciones › ✏️ › Versión: Nueva versión › Implementar**. Así la URL `/exec` no cambia.

## 4. Conectar el juego
**Opción A (recomendada, para todos los estudiantes).** Abra `index.html` con el Bloc de notas y busque la línea:

```
const URL_HOJA_GOOGLE = "";
```

Pegue la URL entre las comillas, guarde y suba `index.html` a GitHub (**Add file › Upload files**).

**Opción B (para probar en su equipo).** Abra el juego, despliegue **Panel docente**, pegue la URL, pulse **Guardar en este dispositivo** y luego **Enviar fila de prueba**. En la hoja debe aparecer la pestaña **Resultados** con una fila de código `PRUEBA`.

## Qué ve usted en la hoja
| Pestaña | Contenido |
|---|---|
| **Avance** | Una fila por código de participante con:<br>• nivel académico;<br>• evaluaciones completadas (0 a 3);<br>• puntaje y porcentaje acumulado de las **evaluaciones** (sobre 45 puntos, con el último intento de cada caso);<br>• por caso: la **práctica guiada** (puntaje y pistas usadas), el estado de la evaluación, el último puntaje, el mejor puntaje y los intentos;<br>• la fecha de la última actividad.<br>La práctica llega a la hoja solo si el estudiante ya había ingresado su código y consentimiento en una evaluación anterior. Se reconstruye con cada caso recibido, o desde el menú **Juego caries › Actualizar avance**. |
| **Resultados** | Una fila por caso calculado: cada decisión con su costo y puntos, el puntaje, las fichas, el nivel por competencia, el número de intento, la duración, el idioma, los ajustes de accesibilidad y la **justificación escrita**. |
| **Acumulado** | Una fila por estudiante al terminar los tres casos («Cierre final»): puntaje sobre 45, porcentaje por competencia, **valoración Likert** (5 ítems y promedio), **autoevaluación** frente al desempeño real y la reflexión final que compara las tres edades. |

Cada fila tiene un `id_registro`, así que un registro reenviado no se duplica. Las filas `PRUEBA` no cuentan en Avance.

## Dónde funciona el envío
- **Sí funciona** desde GitHub Pages, desde el archivo subido a Moodle o desde el archivo abierto directamente en el navegador.
- **No funciona** en la vista previa dentro de Claude, porque bloquea las conexiones a otros sitios. Ahí el juego guarda el registro en el dispositivo y ofrece el CSV.

## Seguridad
- La clave `odontoped-caries-2026`, presente en `Code.gs` y en el juego, impide que lleguen a la hoja envíos que no traen la clave. Puede cambiarla, siempre en ambos lados a la vez.
- Si se pierde la conexión, el juego guarda el registro en el dispositivo y lo reintenta al volver la conexión o con **Reintentar envío**.
- La clave está visible dentro de `index.html`. Sirve para filtrar envíos casuales, no es una contraseña fuerte. La hoja no recibe datos sensibles.

/**
 * Receptor de resultados · Juego «Consultas de Odontopediatría» (caries)
 * Pegue este código en Extensiones > Apps Script de su hoja de Google
 * e impleméntelo como Aplicación web (ver INSTRUCCIONES_hoja_google.md).
 *
 * Cada caso calculado llega como una fila en la pestaña «Resultados»;
 * el resultado acumulado de los tres casos, en la pestaña «Acumulado».
 * La pestaña «Avance» se reconstruye sola: una fila por código de participante
 * con el estado de cada caso, intentos, mejor y último puntaje.
 * No se reciben nombres ni datos identificatorios: solo el código del participante.
 */
const HOJA = 'Resultados';
const HOJA_AVANCE = 'Avance';
const CLAVE = 'odontoped-caries-2026';   // debe coincidir con CLAVE_HOJA en el juego
const CASOS = [['C1', 'Valentina'], ['C2', 'Mateo'], ['C3', 'Camila']];
const MAX_CASO = 15;

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const datos = JSON.parse(e.postData.contents);
    if (datos.clave !== CLAVE) return respuesta({ ok: false, error: 'clave' });
    const reg = datos.registro || {};
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const nombre = reg.tipo === 'acumulado' ? 'Acumulado' : HOJA;
    const sh = ss.getSheetByName(nombre) || ss.insertSheet(nombre);

    // encabezados: se crean con la primera fila y se amplían si llegan columnas nuevas
    let enc = sh.getLastRow() > 0 ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] : [];
    const nuevas = Object.keys(reg).filter(k => enc.indexOf(k) === -1);
    if (nuevas.length) {
      enc = enc.concat(nuevas);
      sh.getRange(1, 1, 1, enc.length).setValues([enc]).setFontWeight('bold');
      sh.setFrozenRows(1);
    }

    // evita duplicados si el mismo registro se reenvía
    const col = enc.indexOf('id_registro') + 1;
    if (col > 0 && sh.getLastRow() > 1 && reg.id_registro) {
      const ya = sh.getRange(2, col, sh.getLastRow() - 1, 1).createTextFinder(String(reg.id_registro)).matchEntireCell(true).findNext();
      if (ya) return respuesta({ ok: true, duplicado: true });
    }

    sh.appendRow(enc.map(k => (k in reg ? reg[k] : '')));
    if (nombre === HOJA) actualizarAvance();
    return respuesta({ ok: true });
  } catch (err) {
    return respuesta({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Reconstruye la pestaña «Avance» a partir de «Resultados». También se puede ejecutar a mano. */
function actualizarAvance() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const res = ss.getSheetByName(HOJA);
  const av = ss.getSheetByName(HOJA_AVANCE) || ss.insertSheet(HOJA_AVANCE);
  const enc = ['codigo_participante', 'nivel_academico', 'casos_completados', 'puntaje_acumulado', 'porcentaje_acumulado'];
  CASOS.forEach(([id, nom]) => enc.push(`${id}_${nom}_practica`, `${id}_estado`, `${id}_ultimo`, `${id}_mejor`, `${id}_intentos`));
  enc.push('intentos_totales', 'ultima_actividad');

  const filas = [];
  if (res && res.getLastRow() > 1) {
    const datos = res.getDataRange().getValues();
    const h = datos.shift();
    const i = k => h.indexOf(k);
    const iCod = i('codigo_participante'), iNiv = i('nivel_academico'), iCaso = i('caso_id'),
          iPts = i('puntaje_total'), iFecha = i('fecha_hora'), iModo = i('modo'), iPistas = i('pistas_usadas');
    const por = {};
    datos.forEach(f => {
      const cod = String(f[iCod] || '').trim();
      if (!cod || cod === 'PRUEBA' || f[iPts] === '' || f[iPts] === null) return;
      const p = por[cod] || (por[cod] = { nivel: '', casos: {}, practica: {}, n: 0, ultima: '' });
      const fecha = f[iFecha] instanceof Date ? f[iFecha].toISOString() : String(f[iFecha] || '');
      if (fecha >= p.ultima) { p.ultima = fecha; if (iNiv >= 0 && f[iNiv]) p.nivel = f[iNiv]; }
      // la práctica guiada se informa aparte y no cuenta para el puntaje acumulado
      if (iModo >= 0 && f[iModo] === 'guiado') {
        p.practica[f[iCaso]] = `Sí · ${Number(f[iPts]) || 0}/15 · ${iPistas >= 0 ? Number(f[iPistas]) || 0 : 0} pistas`;
        return;
      }
      const c = p.casos[f[iCaso]] || (p.casos[f[iCaso]] = { ultimo: 0, mejor: 0, intentos: 0, fecha: '' });
      const pts = Number(f[iPts]) || 0;
      c.intentos++; p.n++;
      c.mejor = Math.max(c.mejor, pts);
      if (fecha >= c.fecha) { c.fecha = fecha; c.ultimo = pts; }
    });
    Object.keys(por).sort().forEach(cod => {
      const p = por[cod];
      const hechos = CASOS.filter(([id]) => p.casos[id]);
      const total = hechos.reduce((a, [id]) => a + p.casos[id].ultimo, 0);
      const fila = [cod, p.nivel, hechos.length, total, Math.round(total / (MAX_CASO * CASOS.length) * 100)];
      CASOS.forEach(([id]) => {
        const c = p.casos[id];
        fila.push(p.practica[id] || (c ? 'Sin registro' : 'Pendiente'), c ? 'Evaluación completada' : 'Pendiente', c ? c.ultimo : '', c ? c.mejor : '', c ? c.intentos : 0);
      });
      fila.push(p.n, p.ultima ? new Date(p.ultima) : '');
      filas.push(fila);
    });
  }

  av.clear();
  av.getRange(1, 1, 1, enc.length).setValues([enc]).setFontWeight('bold');
  av.setFrozenRows(1);
  if (filas.length) {
    av.getRange(2, 1, filas.length, enc.length).setValues(filas);
    av.getRange(2, enc.length, filas.length, 1).setNumberFormat('yyyy-mm-dd hh:mm');
  }
  av.getRange(filas.length + 3, 1).setValue('Puntaje y porcentaje acumulados: solo evaluaciones, sobre 45 puntos (último intento de cada caso). La práctica guiada se muestra en las columnas *_practica y no cuenta para la nota. Se actualiza con cada caso recibido.').setFontStyle('italic');
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Juego caries').addItem('Actualizar avance', 'actualizarAvance').addToUi();
}

function doGet() {
  return respuesta({ ok: true, mensaje: 'Receptor activo' });
}

function respuesta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

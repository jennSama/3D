/**
 * Respaldo del avance — servidor en Google Apps Script + Google Sheets
 * Plantilla de la skill «cedia-respaldo-avance» v1 · Vibe Coding CEDIA 2026.
 *
 * Qué hace
 *  - Registra a cada persona con un CÓDIGO (p. ej. GUIA-0007) y un CÓDIGO PRIVADO DE RECUPERACIÓN
 *    (20 caracteres). En la hoja solo se guarda el hash SHA-256 del código privado, nunca el código.
 *  - Guarda el avance (elementos completados, puntajes y estado) con fusión que solo avanza:
 *    un dispositivo atrasado nunca borra lo hecho en otro.
 *  - «Olvidé mi código»: si la persona dejó su correo, recibe un código privado nuevo en ese correo.
 *  - Registro de actividad opcional, respaldo diario de toda la hoja en una carpeta restringida,
 *    resumen para el docente y borrado de datos de prueba con doble confirmación.
 *
 * Seguridad aplicada (la misma base que la plataforma Vibe Coding CEDIA 2026)
 *  - LockService alrededor de cada escritura; códigos emitidos desde un contador, nunca por fila.
 *  - Comparación en tiempo constante del hash; bloqueo temporal tras 10 intentos fallidos.
 *  - Listas de campos permitidos, límites de tamaño, validación de cada valor.
 *  - Protección contra inyección de fórmulas en la hoja (texto que empieza con = + - @).
 *  - Rechazos registrados solo con motivo y hash; nunca el contenido enviado.
 *  - Las respuestas nunca confirman si un correo o un código existe.
 *
 * CONFIGURACIÓN (en este orden)
 *  1. Pegue el ID de su hoja en SHEET_ID (está en la dirección de la hoja, entre /d/ y /edit).
 *  2. Ajuste APP, TOKEN y NOMBRE_APP. El TOKEN debe ser igual al de progreso-config.js.
 *  3. Ejecute configurarInicial() una vez desde el editor y autorice los permisos.
 *  4. Implementar › Nueva implementación › Aplicación web › Ejecutar como: yo ·
 *     Quién tiene acceso: cualquier persona. Copie la URL en progreso-config.js.
 *  5. Haga una prueba completa. Para borrar los datos de prueba ejecute armarBorradoDePrueba()
 *     y luego, dentro de cinco minutos, borrarDatosDePrueba().
 */
var CONFIG_SERVIDOR = {
  SHEET_ID: "PEGUE_AQUI_EL_ID_DE_SU_HOJA",
  APP: "CARIES",                 // prefijo de los códigos: MIAPP-0001 (2 a 8 letras mayúsculas o números)
  TOKEN: "KzQFGLcaQrrRh2ys", // literal compartido con progreso-config.js: filtra envíos basura; NO es una contraseña
  NOMBRE_APP: "Consultas de Odontopediatría",
  ZONA: "America/Guayaquil",
  CORREO_ACTIVO: true,          // enviar el código por correo cuando la persona deja su correo
  CORREO_TOPE_DIARIO: 80,       // tope propio, por debajo de la cuota diaria de Google
  CARPETA_RESPALDOS: "",        // vacío = «Respaldos de avance — <APP> (restringido)»
  RESPALDOS_A_CONSERVAR: 14,
  REGISTROS_POR_MINUTO: 30,     // freno contra registros automáticos
  MAX_ELEMENTOS: 500,
  MAX_CLAVES_ESTADO: 200,
  MAX_ESTADO_VALOR: 4000,       // caracteres por valor de estado
  MAX_JSON: 45000,              // caracteres por celda (Google admite 50 000)
  MAX_EVENTOS_LOTE: 50,
  MAX_FILAS_ACTIVIDAD: 200000,
  MAX_DETALLE: 500
};

var VERSION_SERVIDOR = 1;
var HOJA_REGISTRO = "Registro", HOJA_AVANCE = "Avance", HOJA_ACTIVIDAD = "Actividad";
var HOJA_RECHAZOS = "Rechazados", HOJA_REINICIOS = "Reinicios", HOJA_RESUMEN = "Resumen", HOJA_CODIGOS = "Códigos emitidos";
var COL_REGISTRO = ["Código", "Fecha de registro", "Nombre", "Correo", "Consentimiento", "Recuperación (hash)",
                    "Correo enviado", "Último guardado", "Idioma"];
var COL_AVANCE = ["Código", "Actualizado", "Elementos (JSON)", "Estado (JSON)", "Versión de la app", "Idioma", "Hechos", "Puntaje medio"];
var COL_ACTIVIDAD = ["Código", "Servidor", "Cliente", "Evento", "Elemento", "Detalle"];
var COL_RECHAZOS = ["Fecha y hora", "Motivo", "Referencia (hash)"];
var COL_REINICIOS = ["Fecha y hora", "Código", "Elementos (JSON)", "Estado (JSON)"];
var COL_CODIGOS = ["Fecha y hora", "Código", "Motivo", "Correo enviado"];
var RX_ID = /^[A-Za-z0-9][A-Za-z0-9_.:\-]{0,63}$/;

/* ------------------------------------------------------------------ utilidades */
function ss_() { return SpreadsheetApp.openById(CONFIG_SERVIDOR.SHEET_ID); }
function props_() { return PropertiesService.getScriptProperties(); }
function cache_() { return CacheService.getScriptCache(); }
function app_() { return String(CONFIG_SERVIDOR.APP || "APP").toUpperCase(); }
function ahora_() { return Utilities.formatDate(new Date(), CONFIG_SERVIDOR.ZONA, "yyyy-MM-dd HH:mm:ss"); }
function hoy_() { return Utilities.formatDate(new Date(), CONFIG_SERVIDOR.ZONA, "yyyy-MM-dd"); }
function salida_(obj) {
  obj.v = VERSION_SERVIDOR;
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function plano_(x) { return x !== null && Object.prototype.toString.call(x) === "[object Object]"; }
function hex_(bytes) { return bytes.map(function (b) { return ("0" + ((b + 256) % 256).toString(16)).slice(-2); }).join(""); }
function sha256_(s) {
  return hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s || ""), Utilities.Charset.UTF_8));
}
function hashCorto_(s) { return sha256_(s).slice(0, 12); }
function normalizarRecuperacion_(s) { return String(s || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase(); }
function hashRecuperacion_(s) { return sha256_(normalizarRecuperacion_(s)); }
function nuevaRecuperacion_() {
  var crudo = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, "").toUpperCase().slice(0, 20);
  return crudo.replace(/(.{4})(?=.)/g, "$1-");
}
function igual_(a, b) {                     // comparación en tiempo constante
  a = String(a || ""); b = String(b || "");
  if (a.length !== b.length) return false;
  var d = 0;
  for (var i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
function celda_(v) {                        // guardia contra inyección de fórmulas
  var s = String(v === undefined || v === null ? "" : v);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}
function texto_(v, max) { return String(v === undefined || v === null ? "" : v).replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max); }
function correoValido_(c) { return /^[^\s@<>"']{1,64}@[^\s@<>"']{1,190}\.[A-Za-z]{2,24}$/.test(c); }
function codigoValido_(c) { return new RegExp("^" + app_() + "-\\d{4,7}$").test(String(c || "")); }
function isoValido_(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(s)) return null;
  var d = new Date(s);
  if (!isFinite(d.getTime())) return null;
  var iso = d.toISOString();
  return iso === s || iso === s.replace(/Z$/, ".000Z") ? iso : null;
}

function hoja_(nombre, encabezados) {
  var ss = ss_(), sh = ss.getSheetByName(nombre);
  if (!sh) sh = ss.insertSheet(nombre);
  if (sh.getLastRow() === 0 && encabezados) {
    sh.appendRow(encabezados);
    sh.getRange(1, 1, 1, encabezados.length).setFontWeight("bold").setBackground("#13243B").setFontColor("#FFFFFF");
    sh.setFrozenRows(1);
  }
  return sh;
}
function columna_(sh, etiqueta) {
  var enc = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0];
  for (var i = 0; i < enc.length; i++) if (enc[i] === etiqueta) return i + 1;
  return -1;
}
function esquemaOk_(sh, columnas) {
  var enc = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0];
  for (var i = 0; i < columnas.length; i++) if (enc[i] !== columnas[i]) return false;
  return true;
}
function filaDe_(sh, codigo) {
  var ultima = sh.getLastRow();
  if (ultima < 2) return -1;
  var ids = sh.getRange(2, 1, ultima - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) if (String(ids[i][0]).trim().toUpperCase() === codigo) return i + 2;
  return -1;
}
function rechazo_(motivo, referencia) {
  try { hoja_(HOJA_RECHAZOS, COL_RECHAZOS).appendRow([ahora_(), motivo, referencia ? hashCorto_(referencia) : ""]); } catch (e) {}
}
function siguienteCodigo_() {               // contador: no se repite aunque se borren filas
  var n = Number(props_().getProperty("contador") || 0) + 1;
  props_().setProperty("contador", String(n));
  return app_() + "-" + ("000" + n).slice(-Math.max(4, String(n).length));
}
function correoPermitido_() {
  if (!CONFIG_SERVIDOR.CORREO_ACTIVO) return false;
  var clave = "correo_" + hoy_(), n = Number(props_().getProperty(clave) || 0);
  if (n >= CONFIG_SERVIDOR.CORREO_TOPE_DIARIO) return false;
  try { if (MailApp.getRemainingDailyQuota() < 1) return false; } catch (e) {}
  props_().setProperty(clave, String(n + 1));
  return true;
}
function limitePorMinuto_(clave, tope) {    // true = se puede continuar
  var c = cache_(), k = "rl_" + clave + "_" + Math.floor(Date.now() / 60000), n = Number(c.get(k) || 0);
  if (n >= tope) return false;
  c.put(k, String(n + 1), 120);
  return true;
}

/* ------------------------------------------------------------------ fusión (igual que en progreso.js) */
// elementos: { id: { h: 1, p: 0..1 (opcional), f: "ISO de la primera vez" } }
// estado:    { clave: { t: milisegundos, v: valor JSON pequeño } }
function validarElementos_(obj) {
  if (!plano_(obj)) return null;
  var ids = Object.keys(obj), out = {};
  if (ids.length > CONFIG_SERVIDOR.MAX_ELEMENTOS) return null;
  for (var i = 0; i < ids.length; i++) {
    var id = ids[i], e = obj[id];
    if (!RX_ID.test(id) || !plano_(e)) return null;
    var limpio = { h: e.h === 1 || e.h === true ? 1 : 0 };
    if (e.p !== undefined && e.p !== null) {
      if (typeof e.p !== "number" || !isFinite(e.p) || e.p < 0 || e.p > 1) return null;
      limpio.p = Math.round(e.p * 10000) / 10000;
    }
    if (e.f !== undefined && e.f !== null) { var f = isoValido_(e.f); if (!f) return null; limpio.f = f; }
    out[id] = limpio;
  }
  return out;
}
function validarEstado_(obj) {
  if (!plano_(obj)) return null;
  var claves = Object.keys(obj), out = {}, tope = Date.now() + 86400000;
  if (claves.length > CONFIG_SERVIDOR.MAX_CLAVES_ESTADO) return null;
  for (var i = 0; i < claves.length; i++) {
    var k = claves[i], e = obj[k];
    if (!RX_ID.test(k) || !plano_(e)) return null;
    if (typeof e.t !== "number" || !isFinite(e.t) || e.t <= 0 || e.t > tope) return null;
    var json;
    try { json = JSON.stringify(e.v === undefined ? null : e.v); } catch (err) { return null; }
    if (typeof json !== "string" || json.length > CONFIG_SERVIDOR.MAX_ESTADO_VALOR) return null;
    out[k] = { t: Math.floor(e.t), v: JSON.parse(json) };
  }
  return out;
}
function fusionarElementos_(a, b) {
  var out = JSON.parse(JSON.stringify(a || {})), id;
  for (id in (b || {})) {
    var x = out[id], y = b[id];
    if (!x) { out[id] = JSON.parse(JSON.stringify(y)); continue; }
    var m = { h: Math.max(x.h || 0, y.h || 0) };
    if (typeof x.p === "number" || typeof y.p === "number")
      m.p = Math.max(typeof x.p === "number" ? x.p : -1, typeof y.p === "number" ? y.p : -1);
    if (x.f && y.f) m.f = x.f < y.f ? x.f : y.f; else if (x.f || y.f) m.f = x.f || y.f;
    out[id] = m;
  }
  return out;
}
function fusionarEstado_(a, b) {
  var out = JSON.parse(JSON.stringify(a || {})), k;
  for (k in (b || {})) if (!out[k] || b[k].t > out[k].t) out[k] = JSON.parse(JSON.stringify(b[k]));
  return out;
}
function leerFilaAvance_(sh, fila) {
  var vals = sh.getRange(fila, 1, 1, COL_AVANCE.length).getValues()[0], el = {}, es = {};
  try { el = validarElementos_(JSON.parse(String(vals[2] || "{}"))) || {}; } catch (e) { el = {}; }
  try { es = validarEstado_(JSON.parse(String(vals[3] || "{}"))) || {}; } catch (e) { es = {}; }
  var act = vals[1] instanceof Date ? Utilities.formatDate(vals[1], CONFIG_SERVIDOR.ZONA, "yyyy-MM-dd HH:mm:ss") : String(vals[1] || "");
  return { elementos: el, estado: es, actualizado: act };
}

/* ------------------------------------------------------------------ autenticación */
function autenticar_(codigo, recuperacion) {
  codigo = String(codigo || "").trim().toUpperCase();
  if (!codigoValido_(codigo) || normalizarRecuperacion_(recuperacion).length !== 20) return null;
  var c = cache_(), kf = "fallos_" + codigo;
  if (Number(c.get(kf) || 0) >= 10) return null;            // bloqueo temporal tras 10 intentos fallidos
  var sh = hoja_(HOJA_REGISTRO, COL_REGISTRO), fila = filaDe_(sh, codigo);
  var ok = false;
  if (fila > 0) {
    var cHash = columna_(sh, "Recuperación (hash)");
    ok = cHash > 0 && igual_(String(sh.getRange(fila, cHash).getValue()), hashRecuperacion_(recuperacion));
  }
  if (!ok) { c.put(kf, String(Number(c.get(kf) || 0) + 1), 600); return null; }
  return { codigo: codigo, fila: fila, hoja: sh };
}
function campos_(data, permitidos) {
  return Object.keys(data).every(function (k) { return permitidos.indexOf(k) !== -1; });
}

/* ------------------------------------------------------------------ punto de entrada */
function doPost(e) {
  try {
    var raw = e && e.postData && e.postData.contents;
    if (!raw || raw.length > 120000) return salida_({ ok: false, error: "validacion" });
    var data;
    try { data = JSON.parse(raw); } catch (perr) { return salida_({ ok: false, error: "validacion" }); }
    if (!plano_(data)) return salida_({ ok: false, error: "validacion" });
    if (data._t !== CONFIG_SERVIDOR.TOKEN) { rechazo_("token", ""); return salida_({ ok: false, error: "token" }); }
    switch (data.accion) {
      case "registrar": return registrar_(data);
      case "guardar": return guardar_(data);
      case "leer": return leer_(data);
      case "actividad": return actividad_(data);
      case "olvide": return olvide_(data);
      case "reiniciar": return reiniciar_(data);
      default: return salida_({ ok: false, error: "accion" });
    }
  } catch (err) {
    return salida_({ ok: false, error: "servidor" });
  }
}
function doGet() { return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT); }

/* ------------------------------------------------------------------ acciones */
function registrar_(data) {
  if (!campos_(data, ["_t", "accion", "nombre", "correo", "consentimiento", "lang", "website"])) return salida_({ ok: false, error: "validacion" });
  if (data.website) { rechazo_("honeypot", ""); return salida_({ ok: false, error: "validacion" }); }
  if (String(data.consentimiento).toLowerCase() !== "si") return salida_({ ok: false, error: "validacion" });
  var nombre = texto_(data.nombre, 80), correo = texto_(data.correo, 254).toLowerCase(), lang = data.lang === "en" ? "en" : "es";
  if (correo && !correoValido_(correo)) { rechazo_("correo", correo); return salida_({ ok: false, error: "validacion" }); }
  if (!limitePorMinuto_("registro", CONFIG_SERVIDOR.REGISTROS_POR_MINUTO)) return salida_({ ok: false, error: "ocupado" });
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  var codigo, recuperacion, fila, sh;
  try {
    sh = hoja_(HOJA_REGISTRO, COL_REGISTRO);
    if (!esquemaOk_(sh, COL_REGISTRO)) { rechazo_("esquema", ""); return salida_({ ok: false, error: "servidor" }); }
    codigo = siguienteCodigo_();
    recuperacion = nuevaRecuperacion_();
    sh.appendRow([codigo]);
    fila = sh.getLastRow();
    sh.getRange(fila, 1, 1, COL_REGISTRO.length).setNumberFormat("@");
    sh.getRange(fila, 2).setNumberFormat("yyyy-mm-dd hh:mm:ss");
    sh.getRange(fila, 8).setNumberFormat("yyyy-mm-dd hh:mm:ss");
    sh.getRange(fila, 1, 1, COL_REGISTRO.length).setValues([[codigo, new Date(), celda_(nombre), celda_(correo), "sí",
      hashRecuperacion_(recuperacion), "", "", lang]]);
    SpreadsheetApp.flush();
  } finally { lock.releaseLock(); }
  var estadoCorreo = "";
  if (correo) {
    try { estadoCorreo = correoPermitido_() ? (enviarCodigo_(correo, nombre, codigo, recuperacion, lang, false), "OK") : "OMITIDO: tope o correo desactivado"; }
    catch (err) { estadoCorreo = "ERROR: " + String(err).slice(0, 120); }
    sh.getRange(fila, columna_(sh, "Correo enviado")).setValue(estadoCorreo);
  }
  return salida_({ ok: true, codigo: codigo, recuperacion: recuperacion, correo: estadoCorreo === "OK" });
}

function guardar_(data) {
  if (!campos_(data, ["_t", "accion", "codigo", "recuperacion", "elementos", "estado", "app_version", "lang"])) return salida_({ ok: false, error: "validacion" });
  var a = autenticar_(data.codigo, data.recuperacion);
  if (!a) return salida_({ ok: false, error: "auth" });
  var el = validarElementos_(data.elementos || {}), es = validarEstado_(data.estado || {});
  if (!el || !es) { rechazo_("datos", a.codigo); return salida_({ ok: false, error: "validacion" }); }
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var sh = hoja_(HOJA_AVANCE, COL_AVANCE), fila = filaDe_(sh, a.codigo), actual = { elementos: {}, estado: {} };
    if (fila > 0) actual = leerFilaAvance_(sh, fila);
    var elementos = fusionarElementos_(actual.elementos, el), estado = fusionarEstado_(actual.estado, es);
    var jE = JSON.stringify(elementos), jS = JSON.stringify(estado);
    if (jE.length > CONFIG_SERVIDOR.MAX_JSON || jS.length > CONFIG_SERVIDOR.MAX_JSON) return salida_({ ok: false, error: "lleno" });
    var hechos = 0, suma = 0, n = 0;
    for (var id in elementos) { if (elementos[id].h) hechos++; if (typeof elementos[id].p === "number") { suma += elementos[id].p; n++; } }
    var fecha = ahora_();
    var filaVals = [a.codigo, fecha, jE, jS, celda_(texto_(data.app_version, 20)), data.lang === "en" ? "en" : "es", hechos, n ? Math.round(suma / n * 1000) / 1000 : ""];
    if (fila < 0) { sh.appendRow([a.codigo]); fila = sh.getLastRow(); }
    sh.getRange(fila, 1, 1, 6).setNumberFormat("@");
    sh.getRange(fila, 1, 1, filaVals.length).setValues([filaVals]);
    var cU = columna_(a.hoja, "Último guardado");
    if (cU > 0) a.hoja.getRange(a.fila, cU).setValue(new Date());
    SpreadsheetApp.flush();
    return salida_({ ok: true, elementos: elementos, estado: estado, actualizado: fecha });
  } finally { lock.releaseLock(); }
}

function leer_(data) {
  if (!campos_(data, ["_t", "accion", "codigo", "recuperacion"])) return salida_({ ok: false, error: "validacion" });
  var a = autenticar_(data.codigo, data.recuperacion);
  if (!a) return salida_({ ok: false, error: "auth" });
  var nombre = String(a.hoja.getRange(a.fila, columna_(a.hoja, "Nombre")).getValue() || "").replace(/^'/, "");
  var sh = ss_().getSheetByName(HOJA_AVANCE), fila = sh ? filaDe_(sh, a.codigo) : -1;
  if (fila < 0) return salida_({ ok: true, codigo: a.codigo, nombre: nombre, elementos: {}, estado: {}, vacio: true });
  var r = leerFilaAvance_(sh, fila);
  return salida_({ ok: true, codigo: a.codigo, nombre: nombre, elementos: r.elementos, estado: r.estado, actualizado: r.actualizado });
}

function actividad_(data) {
  if (!campos_(data, ["_t", "accion", "codigo", "recuperacion", "eventos"])) return salida_({ ok: false, error: "validacion" });
  var a = autenticar_(data.codigo, data.recuperacion);
  if (!a) return salida_({ ok: false, error: "auth" });
  if (!Array.isArray(data.eventos) || !data.eventos.length) return salida_({ ok: false, error: "validacion" });
  var ev = data.eventos.slice(0, CONFIG_SERVIDOR.MAX_EVENTOS_LOTE), servidor = new Date().toISOString(), filas = [];
  ev.forEach(function (x) {
    x = plano_(x) ? x : {};
    var det = x.detalle;
    if (det !== undefined && det !== null && typeof det !== "string") { try { det = JSON.stringify(det); } catch (err) { det = ""; } }
    filas.push([a.codigo, servidor, celda_(texto_(x.t, 30)), celda_(texto_(x.evento, 40)), celda_(texto_(x.elemento, 64)), celda_(texto_(det, CONFIG_SERVIDOR.MAX_DETALLE))]);
  });
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var sh = hoja_(HOJA_ACTIVIDAD, COL_ACTIVIDAD);
    if (sh.getLastRow() + filas.length > CONFIG_SERVIDOR.MAX_FILAS_ACTIVIDAD) return salida_({ ok: false, error: "lleno" });
    sh.getRange(sh.getLastRow() + 1, 1, filas.length, COL_ACTIVIDAD.length).setNumberFormat("@").setValues(filas);
    SpreadsheetApp.flush();
    return salida_({ ok: true, guardados: filas.length });
  } finally { lock.releaseLock(); }
}

// «Olvidé mi código»: si el correo está registrado, se emite un código privado NUEVO y se envía a ESE correo.
// La respuesta es siempre la misma, exista o no el correo, para no revelar quién está registrado.
function olvide_(data) {
  if (!campos_(data, ["_t", "accion", "correo", "lang"])) return salida_({ ok: false, error: "validacion" });
  var correo = texto_(data.correo, 254).toLowerCase(), lang = data.lang === "en" ? "en" : "es";
  var respuesta = salida_({ ok: true, enviado: "si-existe" });
  if (!correoValido_(correo) || !CONFIG_SERVIDOR.CORREO_ACTIVO) return respuesta;
  var c = cache_(), k = "olvide_" + hashCorto_(correo);
  if (c.get(k)) return respuesta;                            // una solicitud cada 10 minutos por correo
  c.put(k, "1", 600);
  if (!limitePorMinuto_("olvide", 10)) return respuesta;
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  var codigo = "", nombre = "", recuperacion = "";
  try {
    var sh = hoja_(HOJA_REGISTRO, COL_REGISTRO), cC = columna_(sh, "Correo"), cH = columna_(sh, "Recuperación (hash)"), cN = columna_(sh, "Nombre");
    if (sh.getLastRow() < 2) return respuesta;
    var vals = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
    for (var i = vals.length - 1; i >= 0; i--) {             // el registro más reciente con ese correo
      if (String(vals[i][cC - 1]).replace(/^'/, "").trim().toLowerCase() === correo) {
        codigo = String(vals[i][0]); nombre = String(vals[i][cN - 1] || "").replace(/^'/, "");
        if (!correoPermitido_()) return respuesta;
        recuperacion = nuevaRecuperacion_();
        sh.getRange(i + 2, cH).setValue(hashRecuperacion_(recuperacion));
        SpreadsheetApp.flush();
        break;
      }
    }
  } finally { lock.releaseLock(); }
  if (codigo) {
    var estado = "OK";
    try { enviarCodigo_(correo, nombre, codigo, recuperacion, lang, true); } catch (err) { estado = "ERROR: " + String(err).slice(0, 120); }
    hoja_(HOJA_CODIGOS, COL_CODIGOS).appendRow([ahora_(), codigo, "olvidé mi código", estado]);
  }
  return respuesta;
}

// La persona reinicia su propio avance. Se conserva una copia en «Reinicios» por si fue un error.
function reiniciar_(data) {
  if (!campos_(data, ["_t", "accion", "codigo", "recuperacion", "confirmar"])) return salida_({ ok: false, error: "validacion" });
  if (data.confirmar !== true) return salida_({ ok: false, error: "validacion" });
  var a = autenticar_(data.codigo, data.recuperacion);
  if (!a) return salida_({ ok: false, error: "auth" });
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var sh = ss_().getSheetByName(HOJA_AVANCE), fila = sh ? filaDe_(sh, a.codigo) : -1;
    if (fila < 0) return salida_({ ok: true, vacio: true });
    var vals = sh.getRange(fila, 1, 1, COL_AVANCE.length).getValues()[0];
    hoja_(HOJA_REINICIOS, COL_REINICIOS).appendRow([ahora_(), a.codigo, String(vals[2] || "{}"), String(vals[3] || "{}")]);
    sh.getRange(fila, 2, 1, 3).setValues([[ahora_(), "{}", "{}"]]);
    sh.getRange(fila, 7, 1, 2).setValues([[0, ""]]);
    SpreadsheetApp.flush();
    return salida_({ ok: true });
  } finally { lock.releaseLock(); }
}

function enviarCodigo_(correo, nombre, codigo, recuperacion, lang, esNuevo) {
  var app = CONFIG_SERVIDOR.NOMBRE_APP, saludo = nombre ? " " + nombre : "";
  var asunto = lang === "en" ? (esNuevo ? "New private code — " : "Your progress code — ") + app
                             : (esNuevo ? "Nuevo código privado — " : "Su código de avance — ") + app;
  var cuerpo = lang === "en"
    ? "Hello" + saludo + ",\n\n" + (esNuevo ? "You asked for a new private recovery code. The previous one no longer works.\n\n" : "Your progress in " + app + " is now saved.\n\n") +
      "Your code: " + codigo + "\nYour private recovery code: " + recuperacion + "\n\n" +
      "Keep both. With them you can recover your progress on any device. Do not share the private code.\n\n" + app
    : "Estimado/a" + saludo + ":\n\n" + (esNuevo ? "Usted pidió un código privado de recuperación nuevo. El anterior ya no funciona.\n\n" : "Su avance en " + app + " ya se está guardando.\n\n") +
      "Su código: " + codigo + "\nSu código privado de recuperación: " + recuperacion + "\n\n" +
      "Guarde ambos datos. Con ellos puede recuperar su avance en cualquier dispositivo. No comparta el código privado.\n\n" + app;
  MailApp.sendEmail(correo, asunto, cuerpo, { name: app });
}

/* ------------------------------------------------------------------ funciones del docente (se ejecutan desde el editor) */
function configurarInicial() {
  if (!/^[A-Z0-9]{2,8}$/.test(app_())) throw new Error("APP debe tener de 2 a 8 letras mayúsculas o números.");
  if (CONFIG_SERVIDOR.TOKEN === "cambie-esta-palabra") throw new Error("Cambie el TOKEN antes de configurar.");
  [[HOJA_REGISTRO, COL_REGISTRO], [HOJA_AVANCE, COL_AVANCE], [HOJA_ACTIVIDAD, COL_ACTIVIDAD], [HOJA_RECHAZOS, COL_RECHAZOS],
   [HOJA_REINICIOS, COL_REINICIOS], [HOJA_CODIGOS, COL_CODIGOS]].forEach(function (p) { hoja_(p[0], p[1]); });
  construirResumen_();
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === "respaldoDiario_") ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger("respaldoDiario_").timeBased().everyDays(1).atHour(23).create();
  if (!props_().getProperty("contador")) props_().setProperty("contador", "0");
  return "Listo: hojas creadas, Resumen construido y respaldo diario programado a las 23:00.";
}

function construirResumen_() {
  var ss = ss_(), rs = ss.getSheetByName(HOJA_RESUMEN) || ss.insertSheet(HOJA_RESUMEN);
  rs.clear();
  var R = "'" + HOJA_REGISTRO + "'", A = "'" + HOJA_AVANCE + "'";
  var filas = [
    ["RESUMEN — " + CONFIG_SERVIDOR.NOMBRE_APP, ""],
    ["Personas registradas", "=MAX(0,COUNTA(" + R + "!A2:A))"],
    ["Con avance guardado", "=MAX(0,COUNTA(" + A + "!A2:A))"],
    ["Guardaron en los últimos 7 días", "=COUNTIF(" + R + "!H2:H,\">=\"&(TODAY()-7))"],
    ["Elementos hechos (promedio)", "=IFERROR(AVERAGE(" + A + "!G2:G),0)"],
    ["Puntaje medio general", "=IFERROR(AVERAGE(" + A + "!H2:H),\"—\")"],
    ["Correos con error", "=COUNTIF(" + R + "!G2:G,\"ERROR*\")"],
    ["Rechazos registrados", "=MAX(0,COUNTA('" + HOJA_RECHAZOS + "'!A2:A))"]
  ];
  rs.getRange(1, 1, filas.length, 2).setValues(filas);
  rs.getRange(1, 1).setFontWeight("bold").setFontSize(14);
  rs.setFrozenRows(1);
}

function respaldoDiario_() {
  var nombre = CONFIG_SERVIDOR.CARPETA_RESPALDOS || ("Respaldos de avance — " + app_() + " (restringido)");
  var it = DriveApp.getFoldersByName(nombre), carpeta = it.hasNext() ? it.next() : DriveApp.createFolder(nombre);
  DriveApp.getFileById(CONFIG_SERVIDOR.SHEET_ID).makeCopy("Respaldo_" + hoy_() + " — " + CONFIG_SERVIDOR.NOMBRE_APP, carpeta);
  var archivos = [], fit = carpeta.getFiles();
  while (fit.hasNext()) archivos.push(fit.next());
  archivos.sort(function (a, b) { return a.getDateCreated() - b.getDateCreated(); });
  while (archivos.length > CONFIG_SERVIDOR.RESPALDOS_A_CONSERVAR) archivos.shift().setTrashed(true);
}

// El docente emite un código privado nuevo para una persona (por ejemplo, la atiende en persona).
// El código aparece en el registro de ejecución y se envía al correo registrado, si existe.
function emitirNuevoCodigo(codigo) {
  codigo = String(codigo || "").trim().toUpperCase();
  if (!codigoValido_(codigo)) throw new Error("Escriba el código, por ejemplo emitirNuevoCodigo(\"" + app_() + "-0007\").");
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  var recuperacion, correo, nombre, lang;
  try {
    var sh = hoja_(HOJA_REGISTRO, COL_REGISTRO), fila = filaDe_(sh, codigo);
    if (fila < 0) throw new Error("No existe el código " + codigo + ".");
    recuperacion = nuevaRecuperacion_();
    sh.getRange(fila, columna_(sh, "Recuperación (hash)")).setValue(hashRecuperacion_(recuperacion));
    correo = String(sh.getRange(fila, columna_(sh, "Correo")).getValue() || "").replace(/^'/, "");
    nombre = String(sh.getRange(fila, columna_(sh, "Nombre")).getValue() || "").replace(/^'/, "");
    lang = String(sh.getRange(fila, columna_(sh, "Idioma")).getValue() || "es");
    SpreadsheetApp.flush();
  } finally { lock.releaseLock(); }
  var estado = "sin correo";
  if (correo && correoPermitido_()) { try { enviarCodigo_(correo, nombre, codigo, recuperacion, lang, true); estado = "OK"; } catch (err) { estado = "ERROR: " + String(err).slice(0, 120); } }
  hoja_(HOJA_CODIGOS, COL_CODIGOS).appendRow([ahora_(), codigo, "emitido por el docente", estado]);
  Logger.log("Código " + codigo + " · código privado nuevo: " + recuperacion + " · correo: " + estado);
  return recuperacion;
}

// Copia en el registro de ejecución el avance de una persona (para revisarlo o entregárselo).
function exportarAvance(codigo) {
  codigo = String(codigo || "").trim().toUpperCase();
  var sh = ss_().getSheetByName(HOJA_AVANCE), fila = sh ? filaDe_(sh, codigo) : -1;
  if (fila < 0) throw new Error("No hay avance guardado para " + codigo + ".");
  var r = leerFilaAvance_(sh, fila), texto = JSON.stringify({ codigo: codigo, actualizado: r.actualizado, elementos: r.elementos, estado: r.estado }, null, 2);
  Logger.log(texto);
  return texto;
}

// Borrado de datos de prueba en dos pasos: armarBorradoDePrueba() y luego borrarDatosDePrueba() antes de cinco minutos.
// El contador de códigos se conserva: ningún código se vuelve a usar.
function armarBorradoDePrueba() {
  props_().setProperty("borrado_armado_hasta", String(Date.now() + 5 * 60 * 1000));
  return "Borrado armado por cinco minutos. Ejecute borrarDatosDePrueba() ahora.";
}
function borrarDatosDePrueba() {
  var hasta = Number(props_().getProperty("borrado_armado_hasta") || 0);
  props_().deleteProperty("borrado_armado_hasta");
  if (!hasta || Date.now() > hasta) throw new Error("Borrado no armado. Ejecute armarBorradoDePrueba() primero.");
  var ss = ss_();
  [HOJA_REGISTRO, HOJA_AVANCE, HOJA_ACTIVIDAD, HOJA_RECHAZOS, HOJA_REINICIOS, HOJA_CODIGOS].forEach(function (n) {
    var sh = ss.getSheetByName(n);
    if (sh && sh.getLastRow() > 1) sh.deleteRows(2, sh.getLastRow() - 1);
  });
  return "Datos de prueba borrados. El contador de códigos sigue en " + props_().getProperty("contador") + ".";
}

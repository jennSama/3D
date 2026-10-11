/* progreso.js — respaldo del avance para herramientas web estáticas (GitHub Pages, Cloudflare Pages…)
 * Skill «cedia-respaldo-avance» v1 · Vibe Coding CEDIA 2026 · sin dependencias.
 *
 * Tres capas, como en la plataforma Vibe Coding:
 *   1. Este navegador: el avance se guarda al instante (localStorage) y funciona sin conexión.
 *   2. La hoja de Google del docente: se sincroniza sola con el código de la persona y su código privado.
 *   3. La computadora de la persona: respaldos firmados (.json) y puntos de restauración automáticos.
 *
 * Modelo de datos (reglas de fusión idénticas en Codigo.gs):
 *   elementos: { id: { h: 1, p: 0..1, f: ISO } }  logros que NUNCA se pierden: hecho, mejor puntaje, primera fecha.
 *   estado:    { clave: { t: ms, v: valor } }       todo lo que puede cambiar en ambos sentidos: gana lo más reciente.
 *
 * Uso mínimo:
 *   const P = Progreso.crear({ app: 'guia-estadistica', endpoint: PROGRESO_CONFIG.endpoint, token: PROGRESO_CONFIG.token });
 *   P.completar('quiz-1', { puntaje: 0.8 });   P.guardar('ultimo-tema', 'tema-3');
 *   P.on('cambio', pintar);                    // llega avance de otro dispositivo, otra pestaña o un respaldo
 */
(function (w) {
  'use strict';
  var VERSION = 1, FORMATO = 'cedia-respaldo-avance';
  var RX_ID = /^[A-Za-z0-9][A-Za-z0-9_.:\-]{0,63}$/;
  var LIM = { elementos: 500, claves: 200, valor: 4000, eventos: 300, lote: 50, puntos: 8, keepalive: 60000, archivo: 2000000, minPunto: 600000 };

  /* ---------- utilidades puras ---------- */
  function plano(x) { return x !== null && Object.prototype.toString.call(x) === '[object Object]'; }
  function copia(x) { return x === undefined ? undefined : JSON.parse(JSON.stringify(x)); }
  function vacio() { return { elementos: {}, estado: {} }; }
  function isoValido(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(s)) return null;
    var d = new Date(s); if (!isFinite(d.getTime())) return null;
    var iso = d.toISOString(); return iso === s || iso === s.replace(/Z$/, '.000Z') ? iso : null;
  }
  function normRec(s) { return String(s || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase(); }
  function fmtRec(s) { return normRec(s).replace(/(.{4})(?=.)/g, '$1-'); }
  // Limpia sin rechazar: lo que no cumple las reglas del servidor se descarta con un aviso en la consola.
  function limpiar(d) {
    var out = vacio(), n = 0, tope = Date.now() + 86400000;
    var el = plano(d && d.elementos) ? d.elementos : {}, es = plano(d && d.estado) ? d.estado : {};
    Object.keys(el).forEach(function (id) {
      var e = el[id];
      if (n >= LIM.elementos || !RX_ID.test(id) || !plano(e)) { aviso('elemento descartado: ' + id); return; }
      var x = { h: e.h === 1 || e.h === true ? 1 : 0 };
      if (typeof e.p === 'number' && isFinite(e.p) && e.p >= 0 && e.p <= 1) x.p = Math.round(e.p * 10000) / 10000;
      var f = isoValido(e.f); if (f) x.f = f;
      out.elementos[id] = x; n++;
    });
    n = 0;
    Object.keys(es).forEach(function (k) {
      var e = es[k];
      if (n >= LIM.claves || !RX_ID.test(k) || !plano(e) || typeof e.t !== 'number' || !(e.t > 0) || e.t > tope) { aviso('estado descartado: ' + k); return; }
      var j; try { j = JSON.stringify(e.v === undefined ? null : e.v); } catch (err) { aviso('estado no serializable: ' + k); return; }
      if (j.length > LIM.valor) { aviso('estado demasiado grande: ' + k); return; }
      out.estado[k] = { t: Math.floor(e.t), v: JSON.parse(j) }; n++;
    });
    return out;
  }
  function fusionar(a, b) {
    var out = copia(a || vacio()), id, k;
    out.elementos = out.elementos || {}; out.estado = out.estado || {};
    for (id in (b && b.elementos) || {}) {
      var x = out.elementos[id], y = b.elementos[id];
      if (!x) { out.elementos[id] = copia(y); continue; }
      var m = { h: Math.max(x.h || 0, y.h || 0) };
      if (typeof x.p === 'number' || typeof y.p === 'number') m.p = Math.max(typeof x.p === 'number' ? x.p : -1, typeof y.p === 'number' ? y.p : -1);
      if (x.f && y.f) m.f = x.f < y.f ? x.f : y.f; else if (x.f || y.f) m.f = x.f || y.f;
      out.elementos[id] = m;
    }
    for (k in (b && b.estado) || {}) if (!out.estado[k] || b.estado[k].t > out.estado[k].t) out.estado[k] = copia(b.estado[k]);
    return out;
  }
  function canonico(v) {
    if (v === null || typeof v !== 'object') return JSON.stringify(v);
    if (Array.isArray(v)) return '[' + v.map(canonico).join(',') + ']';
    return '{' + Object.keys(v).sort().map(function (k) { return JSON.stringify(k) + ':' + canonico(v[k]); }).join(',') + '}';
  }
  function resumen(d) {
    var r = { elementos: 0, hechos: 0, conPuntaje: 0, puntajeMedio: null, claves: 0 }, s = 0;
    Object.keys(d.elementos || {}).forEach(function (id) { var e = d.elementos[id]; r.elementos++; if (e.h) r.hechos++; if (typeof e.p === 'number') { r.conPuntaje++; s += e.p; } });
    if (r.conPuntaje) r.puntajeMedio = Math.round(s / r.conPuntaje * 1000) / 1000;
    r.claves = Object.keys(d.estado || {}).length;
    return r;
  }
  function diferencia(local, entrante) {      // qué agregaría una fusión, para la vista previa
    var m = fusionar(local, entrante), r = { nuevos: 0, mejoras: 0, estadoMasReciente: 0, total: resumen(m) };
    Object.keys(m.elementos).forEach(function (id) {
      var a = local.elementos[id], b = m.elementos[id];
      if (!a) r.nuevos++; else if ((b.h || 0) > (a.h || 0) || (typeof b.p === 'number' && b.p > (typeof a.p === 'number' ? a.p : -1))) r.mejoras++;
    });
    Object.keys(m.estado).forEach(function (k) { if (!local.estado[k] || m.estado[k].t > local.estado[k].t) r.estadoMasReciente++; });
    r.cambia = r.nuevos + r.mejoras + r.estadoMasReciente > 0;
    return r;
  }
  function aviso(m) { try { console.warn('[progreso] ' + m); } catch (e) {} }
  function bytes(s) { return new TextEncoder().encode(s); }
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  function sha256(texto) {
    if (!(w.crypto && w.crypto.subtle)) return Promise.reject(error('no-soportado'));
    return w.crypto.subtle.digest('SHA-256', bytes(texto)).then(hex);
  }
  function hmac(texto, clave) {
    if (!(w.crypto && w.crypto.subtle)) return Promise.reject(error('no-soportado'));
    return w.crypto.subtle.importKey('raw', bytes(clave), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
      .then(function (k) { return w.crypto.subtle.sign('HMAC', k, bytes(texto)); }).then(hex);
  }
  function error(codigo, extra) { var e = new Error(codigo); e.codigo = codigo; if (extra) e.detalle = extra; return e; }

  /* ---------- instancia ---------- */
  function crear(opciones) {
    var o = Object.assign({ app: '', endpoint: '', token: '', lang: 'es', espera: 2500, version: '' }, opciones || {});
    if (!/^[a-z0-9][a-z0-9-]{1,40}$/.test(o.app)) throw new Error('Progreso: «app» debe ser un identificador corto en minúsculas, p. ej. "guia-estadistica".');
    var K = {}; ['datos', 'id', 'pendiente', 'eventos', 'puntos', 'migrado', 'dispositivo'].forEach(function (n) { K[n] = 'progreso:' + o.app + ':' + n; });
    var almacen = { leer: function (k) { try { return w.localStorage.getItem(k); } catch (e) { return null; } },
                    escribir: function (k, v) { try { w.localStorage.setItem(k, v); return true; } catch (e) { aviso('no se pudo guardar en este navegador (' + k + ')'); return false; } },
                    quitar: function (k) { try { w.localStorage.removeItem(k); } catch (e) {} } };
    function leerJSON(k, def) { try { var v = JSON.parse(almacen.leer(k) || 'null'); return v === null ? def : v; } catch (e) { return def; } }

    var datos = limpiar(leerJSON(K.datos, vacio()));
    var ident = leerIdent();
    var oyentes = {}, sync = { tipo: ident ? 'guardando' : 'local', cuando: null };
    var tEspera = null, tReintento = null, reintentoMs = 4000, enVuelo = false, cambiosLocales = 0, ultimaLectura = 0, ultimoPunto = 0;
    var dispositivo = almacen.leer(K.dispositivo);
    if (!dispositivo) { dispositivo = Math.random().toString(36).slice(2, 10); almacen.escribir(K.dispositivo, dispositivo); }
    var habilitado = /^https:\/\/|^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(o.endpoint || '') && !!o.token &&
                     !/PEGUE_AQUI/.test(o.endpoint) && o.token !== 'cambie-esta-palabra';
    if (!habilitado) aviso('sin endpoint o token: el avance queda solo en este navegador y en los respaldos.');

    function leerIdent() {
      var v = leerJSON(K.id, null);
      return v && typeof v.codigo === 'string' && normRec(v.recuperacion).length === 20 ? { codigo: v.codigo, recuperacion: fmtRec(v.recuperacion), nombre: v.nombre || '' } : null;
    }
    function emitir(ev, x) { (oyentes[ev] || []).slice().forEach(function (fn) { try { fn(x); } catch (e) { aviso('oyente ' + ev + ': ' + e.message); } }); }
    function fijarSync(tipo) { sync = { tipo: tipo, cuando: tipo === 'guardado' ? new Date() : sync.cuando }; emitir('sync', estadoSync()); }
    function estadoSync() { return { tipo: sync.tipo, cuando: sync.cuando, codigo: ident ? ident.codigo : null, pendiente: almacen.leer(K.pendiente) === '1', enLinea: habilitado }; }

    // Escribe SIEMPRE fusionando con lo que hay guardado: otra pestaña pudo avanzar mientras tanto.
    // subir: el cambio debe llegar a la hoja (todo menos lo que acaba de llegar desde la hoja).
    function persistir(nuevo, origen, opc) {
      opc = opc || {};
      var subir = opc.subir !== undefined ? opc.subir : origen !== 'servidor';
      var guardado = limpiar(leerJSON(K.datos, vacio()));
      var antes = canonico(datos);
      datos = fusionar(fusionar(guardado, datos), nuevo);
      almacen.escribir(K.datos, JSON.stringify(datos));
      var cambio = canonico(datos) !== antes;
      if (cambio) {
        if (subir) { cambiosLocales++; almacen.escribir(K.pendiente, '1'); }
        puntoAutomatico();
        if (subir) programar();
        if (origen !== 'local' && opc.emitir !== false) emitir('cambio', { origen: origen });
      }
      return cambio;
    }
    function puntoAutomatico() {
      if (Date.now() - ultimoPunto < LIM.minPunto) return;
      ultimoPunto = Date.now(); crearPunto('automático');
    }
    function crearPunto(motivo) {
      var lista = leerJSON(K.puntos, []);
      if (!Array.isArray(lista)) lista = [];
      var ult = lista[lista.length - 1];
      if (ult && canonico(ult.datos) === canonico(datos)) return;   // nada nuevo que guardar
      lista.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), creado: new Date().toISOString(), motivo: motivo, datos: copia(datos) });
      while (lista.length > LIM.puntos) lista.shift();
      while (lista.length > 1 && JSON.stringify(lista).length > 1500000) lista.shift();
      almacen.escribir(K.puntos, JSON.stringify(lista));
    }

    /* ---------- red ---------- */
    function post(cuerpo, opc) {
      if (!habilitado) return Promise.reject(error('sin-servidor'));
      var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
      var t = ctrl ? setTimeout(function () { ctrl.abort(); }, 15000) : null;
      cuerpo._t = o.token;
      return fetch(o.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(cuerpo),
                                 signal: ctrl ? ctrl.signal : undefined, keepalive: !!(opc && opc.keepalive), credentials: 'omit', redirect: 'follow' })
        .then(function (r) { return r.json().catch(function () { throw error('servidor'); }); })
        .then(function (j) { if (!j || j.ok !== true) throw error((j && j.error) || 'servidor', j); return j; })
        .catch(function (e) { if (e && e.codigo) throw e; throw error(navigator.onLine === false ? 'sin-conexion' : 'red'); })
        .finally(function () { if (t) clearTimeout(t); });
    }
    function programar(inmediato) {
      if (!ident) { fijarSync('local'); return; }
      clearTimeout(tEspera);
      if (sync.tipo !== 'auth') fijarSync('guardando');
      tEspera = setTimeout(enviar, inmediato ? 0 : o.espera);
    }
    function enviar() {
      clearTimeout(tEspera); tEspera = null;
      if (!ident || enVuelo) return Promise.resolve(false);
      if (!habilitado) { fijarSync('local'); return Promise.resolve(false); }
      if (sync.tipo === 'auth') return Promise.resolve(false);
      if (navigator.onLine === false) { fijarSync('sin-conexion'); return Promise.resolve(false); }
      enVuelo = true; var v = cambiosLocales;
      if (sync.tipo !== 'guardando') fijarSync('guardando');
      return post({ accion: 'guardar', codigo: ident.codigo, recuperacion: ident.recuperacion, elementos: datos.elementos, estado: datos.estado,
                    app_version: String(o.version || '').slice(0, 20), lang: o.lang === 'en' ? 'en' : 'es' })
        .then(function (j) {
          enVuelo = false; reintentoMs = 4000;
          if (cambiosLocales === v) almacen.quitar(K.pendiente);
          persistir(limpiar(j), 'servidor');            // trae lo que otro dispositivo guardó
          fijarSync(almacen.leer(K.pendiente) === '1' ? 'guardando' : 'guardado');
          if (almacen.leer(K.pendiente) === '1') programar();
          enviarEventos();
          return true;
        })
        .catch(function (e) {
          enVuelo = false;
          if (e.codigo === 'auth') { fijarSync('auth'); return false; }       // el código privado ya no es válido
          if (e.codigo === 'validacion' || e.codigo === 'lleno') { aviso('el servidor rechazó el avance: ' + e.codigo); fijarSync('error'); return false; }
          fijarSync(e.codigo === 'sin-conexion' ? 'sin-conexion' : 'error');
          clearTimeout(tReintento);
          if (navigator.onLine !== false) { tReintento = setTimeout(enviar, reintentoMs); reintentoMs = Math.min(reintentoMs * 2, 60000); }
          return false;
        });
    }
    function traer() {
      if (!ident || !habilitado || navigator.onLine === false) return Promise.resolve(false);
      ultimaLectura = Date.now();
      return post({ accion: 'leer', codigo: ident.codigo, recuperacion: ident.recuperacion })
        .then(function (j) {
          if (j.nombre && j.nombre !== ident.nombre) { ident.nombre = j.nombre; almacen.escribir(K.id, JSON.stringify(ident)); }
          var cambio = persistir(limpiar(j), 'servidor');
          reintentoMs = 4000;
          var falta = canonico(fusionar(limpiar(j), datos)) !== canonico(limpiar(j));
          if (falta || almacen.leer(K.pendiente) === '1') programar(true); else { almacen.quitar(K.pendiente); fijarSync('guardado'); }
          return cambio;
        })
        .catch(function (e) {
          if (e.codigo === 'auth') { fijarSync('auth'); return false; }
          fijarSync(e.codigo === 'sin-conexion' ? 'sin-conexion' : 'error');
          clearTimeout(tReintento);
          if (navigator.onLine !== false) { tReintento = setTimeout(traer, reintentoMs); reintentoMs = Math.min(reintentoMs * 2, 60000); }
          return false;
        });
    }
    function enviarEventos() {
      if (!ident || !habilitado) return Promise.resolve(0);
      var cola = leerJSON(K.eventos, []);
      if (!Array.isArray(cola) || !cola.length) return Promise.resolve(0);
      var lote = cola.slice(0, LIM.lote);
      return post({ accion: 'actividad', codigo: ident.codigo, recuperacion: ident.recuperacion, eventos: lote })
        .then(function () {
          var resto = leerJSON(K.eventos, []).slice(lote.length);
          if (resto.length) almacen.escribir(K.eventos, JSON.stringify(resto)); else almacen.quitar(K.eventos);
          return resto.length ? enviarEventos() : lote.length;
        }).catch(function () { return 0; });
    }
    function salidaRapida() {                         // al cerrar la pestaña: último intento sin esperar respuesta
      if (!ident || !habilitado || almacen.leer(K.pendiente) !== '1' || navigator.onLine === false) return;
      var cuerpo = JSON.stringify({ _t: o.token, accion: 'guardar', codigo: ident.codigo, recuperacion: ident.recuperacion, elementos: datos.elementos, estado: datos.estado,
                                    app_version: String(o.version || '').slice(0, 20), lang: o.lang === 'en' ? 'en' : 'es' });
      if (cuerpo.length > LIM.keepalive) return;
      try { fetch(o.endpoint, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: cuerpo, credentials: 'omit' }); } catch (e) {}
    }

    /* ---------- eventos del navegador ---------- */
    w.addEventListener('online', function () { if (almacen.leer(K.pendiente) === '1') programar(true); else if (ident) traer(); });
    w.addEventListener('offline', function () { if (ident) fijarSync('sin-conexion'); });
    w.addEventListener('pagehide', salidaRapida);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') salidaRapida();
      else if (ident && Date.now() - ultimaLectura > 60000) traer();
    });
    w.addEventListener('storage', function (e) {      // otra pestaña de la misma herramienta
      if (e.key === K.datos) { var antes = canonico(datos); datos = fusionar(datos, limpiar(leerJSON(K.datos, vacio()))); if (canonico(datos) !== antes) emitir('cambio', { origen: 'pestaña' }); }
      if (e.key === K.id) { ident = leerIdent(); fijarSync(ident ? 'guardado' : 'local'); emitir('cambio', { origen: 'pestaña' }); }
    });

    /* ---------- respaldos en archivo ---------- */
    function sobre() {
      var cuerpo = { formato: FORMATO, version: VERSION, app: o.app, codigo: ident ? ident.codigo : null, creado: new Date().toISOString(),
                     dispositivo: dispositivo, datos: copia(datos), resumen: resumen(datos) };
      return sha256(canonico(cuerpo)).then(function (suma) {
        cuerpo.suma = suma;
        return ident ? hmac(canonico(cuerpo), normRec(ident.recuperacion)).then(function (f) { cuerpo.firma = f; return cuerpo; }) : cuerpo;
      });
    }
    function revisarTexto(texto, origen) {
      var f;
      if (typeof texto !== 'string' || texto.length > LIM.archivo) return Promise.reject(error('archivo-invalido'));
      try { f = JSON.parse(texto); } catch (e) { return Promise.reject(error('archivo-invalido')); }
      if (!plano(f) || f.formato !== FORMATO || f.version !== VERSION || !plano(f.datos)) return Promise.reject(error('archivo-invalido'));
      if (f.app !== o.app) return Promise.reject(error('otra-herramienta', f.app));
      var firma = f.firma, suma = f.suma, cuerpo = copia(f); delete cuerpo.firma; delete cuerpo.suma;
      return sha256(canonico(cuerpo)).then(function (s) {
        if (s !== suma) throw error('archivo-alterado');
        cuerpo.suma = suma;
        var advertencia = null;
        if (f.codigo && ident && f.codigo !== ident.codigo) throw error('otro-codigo', f.codigo);
        var verificar = Promise.resolve();
        if (f.codigo && ident) verificar = hmac(canonico(cuerpo), normRec(ident.recuperacion)).then(function (h) { if (h !== firma) advertencia = 'firma-anterior'; });
        else if (f.codigo && !ident) advertencia = 'de-un-codigo';
        else advertencia = 'sin-firma';
        return verificar.then(function () {
          var entrante = limpiar(f.datos), dif = diferencia(datos, entrante);
          return { origen: origen, codigo: f.codigo || null, creado: f.creado, advertencia: advertencia, diferencia: dif, resumen: resumen(entrante),
                   aplicar: function () { crearPunto('antes de ' + origen); persistir(entrante, origen); return api.resumen(); } };
        });
      });
    }

    /* ---------- API pública ---------- */
    var api = {
      version: VERSION,
      app: o.app,
      /** Marca un elemento como hecho; con { puntaje: 0..1 } guarda el mejor puntaje. Nunca retrocede. */
      completar: function (id, opc) {
        if (!RX_ID.test(id)) throw error('id-invalido', id);
        var e = { h: 1, f: new Date().toISOString() };
        if (opc && typeof opc.puntaje === 'number') e.p = Math.min(1, Math.max(0, opc.puntaje));
        var n = {}; n[id] = e; persistir({ elementos: n, estado: {} }, 'local'); return api;
      },
      /** Guarda un puntaje sin marcar como hecho (por ejemplo, un intento previo). */
      puntuar: function (id, puntaje) {
        if (!RX_ID.test(id)) throw error('id-invalido', id);
        var n = {}; n[id] = { h: 0, p: Math.min(1, Math.max(0, Number(puntaje) || 0)) }; persistir({ elementos: n, estado: {} }, 'local'); return api;
      },
      hecho: function (id) { return !!(datos.elementos[id] && datos.elementos[id].h); },
      puntaje: function (id) { var e = datos.elementos[id]; return e && typeof e.p === 'number' ? e.p : null; },
      elementos: function () { return copia(datos.elementos); },
      /** Guarda un valor que puede cambiar en ambos sentidos (marcar y desmarcar, posición, respuestas en curso). */
      guardar: function (clave, valor) {
        if (!RX_ID.test(clave)) throw error('clave-invalida', clave);
        var j = JSON.stringify(valor === undefined ? null : valor);
        if (j.length > LIM.valor) throw error('valor-grande', clave);
        var n = {}, t = Math.max(Date.now(), datos.estado[clave] ? datos.estado[clave].t + 1 : 0);
        n[clave] = { t: t, v: JSON.parse(j) }; persistir({ elementos: {}, estado: n }, 'local'); return api;
      },
      valor: function (clave, porDefecto) { var e = datos.estado[clave]; return e && e.v !== null && e.v !== undefined ? copia(e.v) : porDefecto; },
      olvidar: function (clave) { return api.guardar(clave, null); },
      datos: function () { return copia(datos); },
      resumen: function () { return resumen(datos); },
      /** Registro de actividad opcional (se envía en lotes; queda en la hoja «Actividad»). */
      registrarEvento: function (evento, elemento, detalle) {
        var cola = leerJSON(K.eventos, []); if (!Array.isArray(cola)) cola = [];
        cola.push({ t: new Date().toISOString(), evento: String(evento || '').slice(0, 40), elemento: String(elemento || '').slice(0, 64), detalle: detalle === undefined ? '' : detalle });
        while (cola.length > LIM.eventos) cola.shift();
        almacen.escribir(K.eventos, JSON.stringify(cola));
        if (ident && !tEspera && !enVuelo) setTimeout(enviarEventos, 1500);
      },
      /** Pasa el avance que la herramienta guardaba antes a este modelo. Se ejecuta una sola vez. */
      migrar: function (fn) {
        if (almacen.leer(K.migrado) === '1') return false;
        var d; try { d = fn(); } catch (e) { aviso('migración: ' + e.message); return false; }
        if (d) persistir(limpiar(d), 'migracion');
        almacen.escribir(K.migrado, '1'); return true;
      },
      identidad: function () { return ident ? { codigo: ident.codigo, recuperacion: ident.recuperacion, nombre: ident.nombre } : null; },
      estado: estadoSync,
      on: function (ev, fn) { (oyentes[ev] = oyentes[ev] || []).push(fn); return function () { oyentes[ev] = (oyentes[ev] || []).filter(function (f) { return f !== fn; }); }; },
      servidorDisponible: function () { return habilitado; },

      /** Crea el código de la persona. consentimiento debe ser true (aviso de privacidad aceptado). */
      registrar: function (d) {
        d = d || {};
        if (d.consentimiento !== true) return Promise.reject(error('consentimiento'));
        return post({ accion: 'registrar', nombre: String(d.nombre || '').slice(0, 80), correo: String(d.correo || '').trim().slice(0, 254),
                      consentimiento: 'si', lang: o.lang === 'en' ? 'en' : 'es', website: String(d.website || '') })
          .then(function (j) {
            ident = { codigo: j.codigo, recuperacion: j.recuperacion, nombre: String(d.nombre || '') };
            almacen.escribir(K.id, JSON.stringify(ident));
            almacen.escribir(K.pendiente, '1');
            programar(true); emitir('cambio', { origen: 'registro' });
            return { codigo: j.codigo, recuperacion: j.recuperacion, correoEnviado: !!j.correo };
          });
      },
      /** Recupera el avance con el código y el código privado. sumarLocal: añade el avance de este navegador. */
      recuperar: function (codigo, recuperacion, opc) {
        codigo = String(codigo || '').trim().toUpperCase(); recuperacion = fmtRec(recuperacion);
        if (normRec(recuperacion).length !== 20 || !/^[A-Z0-9]{2,8}-\d{4,7}$/.test(codigo)) return Promise.reject(error('formato'));
        return post({ accion: 'leer', codigo: codigo, recuperacion: recuperacion }).then(function (j) {
          crearPunto('antes de recuperar ' + codigo);
          var remoto = limpiar(j), sumar = !!(opc && opc.sumarLocal);
          if (!sumar) { datos = vacio(); almacen.escribir(K.datos, JSON.stringify(datos)); }
          ident = { codigo: codigo, recuperacion: recuperacion, nombre: j.nombre || '' };
          almacen.escribir(K.id, JSON.stringify(ident));
          almacen.quitar(K.pendiente); reintentoMs = 4000; clearTimeout(tReintento);
          sync = { tipo: 'guardando', cuando: sync.cuando };   // sale del estado «auth» si venía de un código cambiado
          persistir(remoto, 'recuperacion', { subir: false, emitir: false });
          if (sumar && canonico(fusionar(remoto, datos)) !== canonico(remoto)) { almacen.escribir(K.pendiente, '1'); programar(true); }
          else { almacen.quitar(K.pendiente); fijarSync('guardado'); }
          ultimaLectura = Date.now();
          emitir('cambio', { origen: 'recuperacion' });
          return { codigo: codigo, nombre: j.nombre || '', resumen: resumen(datos) };
        });
      },
      /** «Olvidé mi código»: si el correo está registrado, llega un código privado nuevo a ese correo. */
      olvide: function (correo) { return post({ accion: 'olvide', correo: String(correo || '').trim(), lang: o.lang === 'en' ? 'en' : 'es' }); },
      /** Cierra la sesión en este navegador. borrarDatos: borra además el avance y los puntos guardados aquí. */
      salir: function (opc) {
        var pendiente = almacen.leer(K.pendiente) === '1';
        if (pendiente && !(opc && opc.forzar)) return Promise.reject(error('pendiente'));
        ident = null; almacen.quitar(K.id); almacen.quitar(K.pendiente); almacen.quitar(K.eventos);
        if (opc && opc.borrarDatos) { datos = vacio(); almacen.quitar(K.datos); almacen.quitar(K.puntos); }
        fijarSync('local'); emitir('cambio', { origen: 'salida' });
        return Promise.resolve(true);
      },
      sincronizar: function () { if (!ident) return Promise.resolve(false); return traer().then(function () { return almacen.leer(K.pendiente) === '1' ? enviar() : true; }); },
      /** Reinicia el avance propio (servidor y este navegador). Deja un punto de restauración antes. */
      reiniciar: function () {
        crearPunto('antes de reiniciar');
        var local = function () { datos = vacio(); almacen.escribir(K.datos, JSON.stringify(datos)); almacen.quitar(K.pendiente); emitir('cambio', { origen: 'reinicio' }); };
        if (!ident) { local(); return Promise.resolve(true); }
        return post({ accion: 'reiniciar', codigo: ident.codigo, recuperacion: ident.recuperacion, confirmar: true }).then(function () { local(); fijarSync('guardado'); return true; });
      },
      /** Prepara el archivo de respaldo firmado: { nombre, texto }. */
      exportar: function () {
        return sobre().then(function (c) {
          var fecha = c.creado.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
          return { nombre: 'respaldo-' + o.app + '-' + (c.codigo || 'sin-codigo') + '-' + fecha + '.json', texto: JSON.stringify(c, null, 2) };
        });
      },
      descargarRespaldo: function () {
        return api.exportar().then(function (r) {
          var url = URL.createObjectURL(new Blob([r.texto], { type: 'application/json' })), a = document.createElement('a');
          a.href = url; a.download = r.nombre; document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(url); }, 30000);
          return r.nombre;
        });
      },
      /** Revisa un archivo de respaldo y devuelve la vista previa con aplicar(). Nunca borra avance. */
      revisarArchivo: function (archivo) {
        if (!archivo || archivo.size > LIM.archivo) return Promise.reject(error('archivo-invalido'));
        return archivo.text().then(function (t) { return revisarTexto(t, 'archivo'); });
      },
      revisarTexto: function (t) { return revisarTexto(t, 'archivo'); },
      puntos: function () {
        var l = leerJSON(K.puntos, []); if (!Array.isArray(l)) return [];
        return l.slice().reverse().map(function (p) { return { id: p.id, creado: p.creado, motivo: p.motivo, resumen: resumen(limpiar(p.datos)) }; });
      },
      revisarPunto: function (id) {
        var p = (leerJSON(K.puntos, []) || []).filter(function (x) { return x.id === id; })[0];
        if (!p) return Promise.reject(error('no-encontrado'));
        var entrante = limpiar(p.datos);
        return Promise.resolve({ origen: 'punto', creado: p.creado, motivo: p.motivo, advertencia: null, diferencia: diferencia(datos, entrante), resumen: resumen(entrante),
                                 aplicar: function () { crearPunto('antes de restaurar un punto'); persistir(entrante, 'punto'); return api.resumen(); } });
      },
      crearPunto: function (motivo) { crearPunto(String(motivo || 'manual').slice(0, 60)); },
      _interno: { fusionar: fusionar, limpiar: limpiar, canonico: canonico, diferencia: diferencia }
    };

    if (ident && habilitado) setTimeout(traer, 0);
    else if (almacen.leer(K.pendiente) === '1' && ident) programar(true);
    return api;
  }

  w.Progreso = { crear: crear, version: VERSION, _fusionar: fusionar, _limpiar: limpiar };
})(window);

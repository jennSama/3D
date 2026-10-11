/* progreso-ui.js — panel «Su avance» para progreso.js (español e inglés, accesible, sin dependencias).
 * Skill «cedia-respaldo-avance» v1 · Vibe Coding CEDIA 2026.
 *
 *   ProgresoUI.montar(P, '#mi-avance', { lang: 'es', privacidad: 'privacidad.html', paginaRespaldos: 'respaldos.html' });
 *   modo 'boton' (por defecto): una píldora con el estado que abre el panel en un diálogo.
 *   modo 'pagina': el panel completo dentro del elemento (para respaldos.html).
 */
(function (w, d) {
  'use strict';
  var TXT = {
    es: {
      titulo: 'Su avance', cerrar: 'Cerrar',
      st_local: 'Solo en este navegador', st_guardando: 'Guardando…', st_guardado: 'Avance guardado', st_sin: 'Sin conexión: se guardará al volver',
      st_error: 'No se pudo guardar; se reintenta solo', st_auth: 'Su código privado cambió: ingréselo de nuevo',
      intro_local: 'Su avance se guarda en este navegador. Para no perderlo si cambia de computadora o borra los datos del navegador, cree su código: el avance se guardará también en la hoja del docente.',
      crear: 'Guardar mi avance en la nube', nombre: 'Nombre (opcional)', correo: 'Correo (opcional, para recibir su código y poder recuperarlo)',
      consent: 'Acepto que mi nombre, mi correo (si lo escribo) y mi avance se guarden en la hoja de cálculo del docente de esta herramienta, solo para respaldar mi avance.',
      consentSinNombre: 'Acepto que mi código, mi correo (si lo escribo) y mi avance se guarden en la hoja de cálculo del docente de esta herramienta, solo para respaldar mi avance.',
      verAviso: 'Leer el aviso de privacidad', crearBtn: 'Crear mi código',
      creado: 'Listo. Guarde estos dos datos: con ellos recupera su avance en cualquier dispositivo.',
      su_codigo: 'Su código', su_privado: 'Código privado de recuperación', copiar: 'Copiar', copiado: 'Copiado',
      tarjeta: 'Descargar mis códigos (.txt)', correoEnviado: 'También se los enviamos a su correo.',
      tengo: 'Ya tengo un código', recuperar: 'Recuperar mi avance', sumar: 'Sumar también el avance de este navegador',
      olvide: 'Olvidé mi código privado', olvideTxt: 'Si dejó su correo al crear el código, puede recibir un código privado nuevo. El anterior dejará de funcionar.',
      enviarNuevo: 'Enviarme un código nuevo', olvideOk: 'Si ese correo está registrado, en unos minutos recibirá un código privado nuevo. Revise también la carpeta de correo no deseado.',
      mostrar: 'Mostrar', ocultar: 'Ocultar', sincronizar: 'Guardar ahora',
      respaldos: 'Respaldos en su computadora', respaldosTxt: 'Descargue un archivo con su avance. Si algo se pierde, puede restaurarlo desde ese archivo: la restauración solo suma, nunca borra avance.',
      descargar: 'Descargar respaldo (.json)', restaurar: 'Restaurar desde un archivo', puntos: 'Puntos de restauración automáticos',
      puntosTxt: 'Este navegador guarda una copia antes de cada recuperación o restauración, y cada diez minutos mientras usted avanza.',
      ninguno: 'Todavía no hay puntos de restauración.', revisar: 'Revisar', aplicar: 'Aplicar', cancelar: 'Cancelar',
      prev_nuevos: ['elemento nuevo', 'elementos nuevos'], prev_mejoras: ['mejora de puntaje o elemento completado', 'mejoras de puntaje o elementos completados'], prev_estado: ['valor más reciente', 'valores más recientes'],
      prev_nada: 'Este respaldo no agrega nada: su avance actual ya lo incluye.', prev_total: 'Después de aplicar: ',
      hechos: 'hechos', de: 'de', aplicado: 'Respaldo aplicado.',
      adv_sin: 'Este archivo se creó sin código: no se puede confirmar a quién pertenece.',
      adv_firma: 'Este archivo se firmó con un código privado anterior: no se puede confirmar que sea suyo.',
      adv_codigo: 'Este archivo pertenece al código {c}. Para usarlo con su registro, primero recupere ese código.',
      salir: 'Cerrar en este navegador', salirTxt: 'Se cierra su código en este navegador y se borra el avance guardado aquí. Su avance sigue en la hoja del docente.',
      salirPend: 'Hay avance que todavía no llegó a la hoja. Conéctese y pulse «Guardar ahora» antes de cerrar.', salirSi: 'Sí, cerrar aquí',
      reiniciar: 'Reiniciar mi avance', reiniciarTxt: '¿Borrar todo su avance? Se guarda un punto de restauración antes.',
      e_consentimiento: 'Para crear su código, acepte el aviso de privacidad.', e_formato: 'Revise el código (por ejemplo GUIA-0007) y el código privado de 20 caracteres.',
      e_auth: 'El código o el código privado no coinciden. Tras varios intentos fallidos hay que esperar 10 minutos.',
      e_red: 'No hay conexión con el servidor. Intente de nuevo en un momento.', e_ocupado: 'El servidor está ocupado. Intente en un minuto.',
      e_archivo: 'Ese archivo no es un respaldo válido de esta herramienta.', e_alterado: 'El archivo fue modificado o está dañado. No se aplicó.',
      e_otro: 'Ese respaldo es de otro código ({c}). No se aplicó.', e_otraApp: 'Ese respaldo es de otra herramienta.',
      e_servidor: 'Esta herramienta todavía no tiene la hoja conectada. Puede usar los respaldos en archivo.', e_general: 'No se pudo completar. Intente de nuevo.',
      paginaRespaldos: 'Abrir la página de respaldos'
    },
    en: {
      titulo: 'Your progress', cerrar: 'Close',
      st_local: 'Only in this browser', st_guardando: 'Saving…', st_guardado: 'Progress saved', st_sin: 'Offline: it will be saved when you reconnect',
      st_error: 'Could not save; retrying automatically', st_auth: 'Your private code changed: please enter it again',
      intro_local: 'Your progress is saved in this browser. To keep it if you change computers or clear your browser data, create your code: your progress will also be saved in the instructor’s sheet.',
      crear: 'Save my progress in the cloud', nombre: 'Name (optional)', correo: 'Email (optional, to receive your code and recover it)',
      consent: 'I agree that my name, my email (if I enter it) and my progress are stored in this tool’s instructor spreadsheet, only to back up my progress.',
      consentSinNombre: 'I agree that my code, my email (if I enter it) and my progress are stored in this tool’s instructor spreadsheet, only to back up my progress.',
      verAviso: 'Read the privacy notice', crearBtn: 'Create my code',
      creado: 'Done. Keep these two values: with them you can recover your progress on any device.',
      su_codigo: 'Your code', su_privado: 'Private recovery code', copiar: 'Copy', copiado: 'Copied',
      tarjeta: 'Download my codes (.txt)', correoEnviado: 'We also sent them to your email.',
      tengo: 'I already have a code', recuperar: 'Recover my progress', sumar: 'Also add the progress in this browser',
      olvide: 'I forgot my private code', olvideTxt: 'If you left your email when creating the code, you can receive a new private code. The previous one will stop working.',
      enviarNuevo: 'Send me a new code', olvideOk: 'If that email is registered, you will receive a new private code in a few minutes. Check your spam folder too.',
      mostrar: 'Show', ocultar: 'Hide', sincronizar: 'Save now',
      respaldos: 'Backups on your computer', respaldosTxt: 'Download a file with your progress. If something is lost, you can restore it from that file: restoring only adds, it never deletes progress.',
      descargar: 'Download backup (.json)', restaurar: 'Restore from a file', puntos: 'Automatic restore points',
      puntosTxt: 'This browser keeps a copy before every recovery or restore, and every ten minutes while you make progress.',
      ninguno: 'No restore points yet.', revisar: 'Review', aplicar: 'Apply', cancelar: 'Cancel',
      prev_nuevos: ['new item', 'new items'], prev_mejoras: ['score improvement or completed item', 'score improvements or completed items'], prev_estado: ['more recent value', 'more recent values'],
      prev_nada: 'This backup adds nothing: your current progress already includes it.', prev_total: 'After applying: ',
      hechos: 'done', de: 'of', aplicado: 'Backup applied.',
      adv_sin: 'This file was created without a code: its owner cannot be confirmed.',
      adv_firma: 'This file was signed with a previous private code: it cannot be confirmed as yours.',
      adv_codigo: 'This file belongs to code {c}. To use it with your registration, recover that code first.',
      salir: 'Sign out in this browser', salirTxt: 'Your code is closed in this browser and the progress stored here is deleted. Your progress stays in the instructor’s sheet.',
      salirPend: 'Some progress has not reached the sheet yet. Connect and press “Save now” before signing out.', salirSi: 'Yes, sign out here',
      reiniciar: 'Reset my progress', reiniciarTxt: 'Delete all your progress? A restore point is saved first.',
      e_consentimiento: 'To create your code, please accept the privacy notice.', e_formato: 'Check the code (for example GUIA-0007) and the 20-character private code.',
      e_auth: 'The code or the private code do not match. After several failed attempts you must wait 10 minutes.',
      e_red: 'No connection to the server. Please try again shortly.', e_ocupado: 'The server is busy. Please try in a minute.',
      e_archivo: 'That file is not a valid backup of this tool.', e_alterado: 'The file was modified or is damaged. It was not applied.',
      e_otro: 'That backup belongs to another code ({c}). It was not applied.', e_otraApp: 'That backup belongs to another tool.',
      e_servidor: 'This tool does not have its sheet connected yet. You can still use file backups.', e_general: 'It could not be completed. Please try again.',
      paginaRespaldos: 'Open the backups page'
    }
  };
  var CSS = '.pgui{--pg-ac:#13243B;--pg-ac2:#E0A12C;--pg-tx:#1d2330;--pg-mu:#5b6675;--pg-bg:#fff;--pg-ln:#d9dee6;--pg-ok:#1f7a4f;--pg-er:#b0472e;font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--pg-tx)}' +
    '.pgui *{box-sizing:border-box}.pgui-pill{display:inline-flex;align-items:center;gap:.5rem;border:1px solid var(--pg-ln);background:var(--pg-bg);color:var(--pg-tx);border-radius:999px;padding:.35rem .8rem;font:inherit;font-size:13px;cursor:pointer;min-height:36px}' +
    '.pgui-pill:hover{border-color:var(--pg-ac)}.pgui-pill:focus-visible,.pgui button:focus-visible,.pgui input:focus-visible{outline:3px solid var(--pg-ac2);outline-offset:2px}' +
    '.pgui-dot{width:10px;height:10px;border-radius:50%;background:#9aa3ad;flex:none}.pgui-dot[data-t=guardado]{background:var(--pg-ok)}.pgui-dot[data-t=guardando]{background:var(--pg-ac2)}.pgui-dot[data-t=error],.pgui-dot[data-t=auth]{background:var(--pg-er)}.pgui-dot[data-t=sin-conexion]{background:#6b7280}' +
    '.pgui-flota{position:fixed;left:12px;bottom:12px;z-index:9000;box-shadow:0 6px 24px rgba(0,0,0,.18)}' +
    'dialog.pgui-dlg{border:0;border-radius:16px;padding:0;width:min(560px,calc(100vw - 24px));max-height:calc(100vh - 24px);box-shadow:0 24px 80px rgba(0,0,0,.35)}dialog.pgui-dlg::backdrop{background:rgba(10,15,25,.55)}' +
    '.pgui-panel{background:var(--pg-bg);padding:1.1rem 1.2rem 1.2rem;overflow:auto;max-height:calc(100vh - 24px)}.pgui-cab{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:.4rem}' +
    '.pgui h2{font-size:18px;margin:0;color:var(--pg-ac)}.pgui h3{font-size:15px;margin:1rem 0 .35rem;color:var(--pg-ac)}.pgui p{margin:.3rem 0 .6rem}.pgui .pgui-mu{color:var(--pg-mu);font-size:13px}' +
    '.pgui-st{display:flex;align-items:center;gap:.5rem;font-size:13px;color:var(--pg-mu);margin:.2rem 0 .6rem}.pgui-x{border:0;background:none;font-size:22px;line-height:1;cursor:pointer;color:var(--pg-mu);min-width:36px;min-height:36px}' +
    '.pgui label{display:block;font-size:13px;font-weight:600;margin:.5rem 0 .2rem}.pgui input[type=text],.pgui input[type=email]{width:100%;padding:.5rem .6rem;border:1px solid var(--pg-ln);border-radius:8px;font:inherit}' +
    '.pgui .pgui-check{display:flex;gap:.5rem;align-items:flex-start;font-weight:400}.pgui .pgui-check input{margin-top:.25rem;flex:none}' +
    '.pgui-btn{display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--pg-ac);background:var(--pg-ac);color:#fff;border-radius:999px;padding:.45rem 1rem;font:inherit;font-weight:600;cursor:pointer;min-height:38px;margin:.35rem .35rem 0 0}' +
    '.pgui-btn.sec{background:transparent;color:var(--pg-ac)}.pgui-btn.peligro{background:transparent;color:var(--pg-er);border-color:var(--pg-er)}.pgui-btn[disabled]{opacity:.55;cursor:wait}' +
    '.pgui-caja{border:1px solid var(--pg-ln);border-radius:12px;padding:.7rem .85rem;margin:.5rem 0}.pgui-cod{font:600 15px/1.4 ui-monospace,Consolas,monospace;letter-spacing:.04em;word-break:break-all}' +
    '.pgui-fila{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem .6rem}.pgui-msg{font-size:13px;margin:.4rem 0}.pgui-msg.ok{color:var(--pg-ok)}.pgui-msg.er{color:var(--pg-er)}' +
    '.pgui details{border-top:1px solid var(--pg-ln);padding:.35rem 0}.pgui summary{cursor:pointer;font-weight:600;color:var(--pg-ac);padding:.35rem 0;min-height:32px}' +
    '.pgui ul.pgui-puntos{list-style:none;padding:0;margin:.3rem 0}.pgui ul.pgui-puntos li{display:flex;justify-content:space-between;align-items:center;gap:.5rem;border-bottom:1px solid var(--pg-ln);padding:.35rem 0;font-size:13px}' +
    '.pgui-oculto{position:absolute!important;left:-9999px!important;width:1px;height:1px;overflow:hidden}' +
    '@media (prefers-reduced-motion:reduce){.pgui *{transition:none!important}}';

  function el(tag, attrs, hijos) {
    var e = d.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'texto') e.textContent = attrs[k];
      else if (k === 'clase') e.className = attrs[k];
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== false && attrs[k] !== null && attrs[k] !== undefined) e.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    });
    (hijos || []).forEach(function (h) { if (h) e.appendChild(typeof h === 'string' ? d.createTextNode(h) : h); });
    return e;
  }
  function hora(fecha, lang) { try { return fecha ? fecha.toLocaleTimeString(lang === 'en' ? 'en-US' : 'es-EC', { hour: '2-digit', minute: '2-digit' }) : ''; } catch (e) { return ''; } }
  function fecha(iso, lang) { try { return new Date(iso).toLocaleString(lang === 'en' ? 'en-US' : 'es-EC', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch (e) { return iso; } }

  function montar(P, destino, opciones) {
    var o = Object.assign({ lang: 'es', modo: 'boton', flotante: false, privacidad: '', paginaRespaldos: '', permitirReinicio: false, acento: '', pedirNombre: true }, opciones || {});
    var t = TXT[o.lang === 'en' ? 'en' : 'es'];
    var raiz = typeof destino === 'string' ? d.querySelector(destino) : destino;
    if (!raiz) throw new Error('ProgresoUI: no existe el elemento ' + destino);
    if (!d.getElementById('pgui-css')) d.head.appendChild(el('style', { id: 'pgui-css', texto: CSS }));
    var cont = el('div', { clase: 'pgui' }); if (o.acento) cont.style.setProperty('--pg-ac', o.acento);
    raiz.appendChild(cont);
    var panel = el('div', { clase: 'pgui-panel' }), dlg = null, pill = null, ultimoCreado = null, vista = null;

    function textoEstado(s) {
      var m = { local: t.st_local, guardando: t.st_guardando, guardado: t.st_guardado, 'sin-conexion': t.st_sin, error: t.st_error, auth: t.st_auth }[s.tipo] || '';
      if (s.tipo === 'guardado' && s.cuando) m += ' · ' + hora(s.cuando, o.lang);
      if (s.tipo === 'guardado' && s.codigo) m += ' · ' + s.codigo;
      return m;
    }
    function mensajeError(e) {
      var c = e && e.codigo;
      return ({ consentimiento: t.e_consentimiento, formato: t.e_formato, auth: t.e_auth, red: t.e_red, 'sin-conexion': t.e_red, ocupado: t.e_ocupado,
                'archivo-invalido': t.e_archivo, 'archivo-alterado': t.e_alterado, 'otra-herramienta': t.e_otraApp, 'sin-servidor': t.e_servidor,
                'otro-codigo': t.e_otro.replace('{c}', e.detalle || '') })[c] || t.e_general;
    }
    function ocupado(btn, si) { if (btn) { btn.disabled = si; btn.setAttribute('aria-busy', si ? 'true' : 'false'); } }
    function msg(nodo, texto, tipo) { nodo.textContent = texto || ''; nodo.className = 'pgui-msg' + (tipo ? ' ' + tipo : ''); }
    function copiarBtn(valor) {
      var b = el('button', { type: 'button', clase: 'pgui-btn sec', texto: t.copiar });
      b.addEventListener('click', function () {
        var hecho = function () { b.textContent = t.copiado; setTimeout(function () { b.textContent = t.copiar; }, 1600); };
        if (navigator.clipboard) navigator.clipboard.writeText(valor).then(hecho, function () {}); else hecho();
      });
      return b;
    }
    function descargarTarjeta(id) {
      var texto = (o.lang === 'en' ? 'Your code: ' : 'Su código: ') + id.codigo + '\n' + (o.lang === 'en' ? 'Private recovery code: ' : 'Código privado de recuperación: ') + id.recuperacion +
        '\n\n' + (o.lang === 'en' ? 'Keep this file. Do not share the private code.' : 'Guarde este archivo. No comparta el código privado.') + '\n' + location.origin + location.pathname + '\n';
      var url = URL.createObjectURL(new Blob([texto], { type: 'text/plain' })), a = el('a', { href: url, download: 'mis-codigos-' + id.codigo + '.txt' });
      d.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 30000);
    }
    function caja(id, mostrarPrivado) {
      var priv = el('span', { clase: 'pgui-cod', texto: mostrarPrivado ? id.recuperacion : '•••• •••• •••• •••• ••••' });
      var ver = el('button', { type: 'button', clase: 'pgui-btn sec', 'aria-pressed': mostrarPrivado ? 'true' : 'false', texto: mostrarPrivado ? t.ocultar : t.mostrar });
      ver.addEventListener('click', function () { var on = ver.getAttribute('aria-pressed') !== 'true'; ver.setAttribute('aria-pressed', String(on)); ver.textContent = on ? t.ocultar : t.mostrar; priv.textContent = on ? id.recuperacion : '•••• •••• •••• •••• ••••'; });
      return el('div', { clase: 'pgui-caja' }, [
        el('div', { clase: 'pgui-mu', texto: t.su_codigo }), el('div', { clase: 'pgui-fila' }, [el('span', { clase: 'pgui-cod', texto: id.codigo }), copiarBtn(id.codigo)]),
        el('div', { clase: 'pgui-mu', texto: t.su_privado }), el('div', { clase: 'pgui-fila' }, [priv, ver, copiarBtn(id.recuperacion)]),
        el('button', { type: 'button', clase: 'pgui-btn sec', texto: t.tarjeta, onclick: function () { descargarTarjeta(id); } })
      ]);
    }
    function vistaPrevia(contenedor, prev, alTerminar) {
      contenedor.textContent = '';
      var adv = prev.advertencia === 'sin-firma' ? t.adv_sin : prev.advertencia === 'firma-anterior' ? t.adv_firma : prev.advertencia === 'de-un-codigo' ? t.adv_codigo.replace('{c}', prev.codigo) : '';
      var dif = prev.diferencia, r = dif.total;
      var pl = function (n, par) { return n + ' ' + par[n === 1 ? 0 : 1]; };
      var lineas = dif.cambia ? [pl(dif.nuevos, t.prev_nuevos), pl(dif.mejoras, t.prev_mejoras), pl(dif.estadoMasReciente, t.prev_estado)] : [t.prev_nada];
      var caja2 = el('div', { clase: 'pgui-caja', role: 'group', 'aria-label': t.revisar }, [
        el('div', { clase: 'pgui-mu', texto: fecha(prev.creado, o.lang) + (prev.motivo ? ' · ' + prev.motivo : '') }),
        adv ? el('p', { clase: 'pgui-msg er', texto: adv }) : null,
        el('ul', {}, lineas.map(function (l) { return el('li', { texto: l }); })),
        dif.cambia ? el('p', { clase: 'pgui-mu', texto: t.prev_total + r.hechos + ' ' + t.hechos + ' ' + t.de + ' ' + r.elementos }) : null
      ]);
      var bAplicar = el('button', { type: 'button', clase: 'pgui-btn', texto: t.aplicar, disabled: !dif.cambia });
      var bCancelar = el('button', { type: 'button', clase: 'pgui-btn sec', texto: t.cancelar });
      bAplicar.addEventListener('click', function () { prev.aplicar(); contenedor.textContent = ''; alTerminar(t.aplicado); });
      bCancelar.addEventListener('click', function () { contenedor.textContent = ''; alTerminar(''); });
      caja2.appendChild(el('div', { clase: 'pgui-fila' }, [bAplicar, bCancelar]));
      contenedor.appendChild(caja2);
      bAplicar.focus();
    }

    function pintar() {
      var s = P.estado(), id = P.identidad();
      if (pill) { pill.querySelector('.pgui-dot').setAttribute('data-t', s.tipo); pill.querySelector('.pgui-txt').textContent = textoEstado(s); }
      panel.textContent = '';
      var cab = el('div', { clase: 'pgui-cab' }, [el('h2', { id: 'pgui-titulo-' + uid, texto: t.titulo })]);
      if (dlg) cab.appendChild(el('button', { type: 'button', clase: 'pgui-x', 'aria-label': t.cerrar, texto: '×', onclick: function () { dlg.close(); } }));
      panel.appendChild(cab);
      panel.appendChild(el('div', { clase: 'pgui-st', role: 'status', 'aria-live': 'polite' }, [el('span', { clase: 'pgui-dot', 'data-t': s.tipo }), el('span', { texto: textoEstado(s) })]));
      if (!P.servidorDisponible()) panel.appendChild(el('p', { clase: 'pgui-mu', texto: t.e_servidor }));

      if (ultimoCreado) {
        panel.appendChild(el('p', { clase: 'pgui-msg ok', texto: t.creado + (ultimoCreado.correoEnviado ? ' ' + t.correoEnviado : '') }));
        panel.appendChild(caja(ultimoCreado, true));
      } else if (id) {
        panel.appendChild(caja(id, false));
        if (s.tipo === 'auth') panel.appendChild(formRecuperar(true));
        var mS = el('p', { clase: 'pgui-msg' });
        var bS = el('button', { type: 'button', clase: 'pgui-btn sec', texto: t.sincronizar });
        bS.addEventListener('click', function () { ocupado(bS, true); P.sincronizar().then(function () { ocupado(bS, false); }, function () { ocupado(bS, false); }); });
        panel.appendChild(el('div', { clase: 'pgui-fila' }, [bS])); panel.appendChild(mS);
      } else if (P.servidorDisponible()) {
        panel.appendChild(el('p', { texto: t.intro_local }));
        panel.appendChild(formCrear());
        panel.appendChild(el('details', {}, [el('summary', { texto: t.tengo }), formRecuperar(false)]));
        panel.appendChild(el('details', {}, [el('summary', { texto: t.olvide }), formOlvide()]));
      }
      panel.appendChild(seccionRespaldos());
      if (id && !ultimoCreado) panel.appendChild(seccionSalir());
      if (o.paginaRespaldos && o.modo !== 'pagina') panel.appendChild(el('p', {}, [el('a', { href: o.paginaRespaldos, texto: t.paginaRespaldos })]));
    }
    function formCrear() {
      var f = el('form', { novalidate: true });
      var iN = el('input', { type: 'text', id: 'pg-n-' + uid, maxlength: '80', autocomplete: 'name' });
      var iC = el('input', { type: 'email', id: 'pg-c-' + uid, maxlength: '254', autocomplete: 'email', inputmode: 'email' });
      var iK = el('input', { type: 'checkbox', id: 'pg-k-' + uid });
      var iW = el('input', { type: 'text', name: 'website', tabindex: '-1', autocomplete: 'off', 'aria-hidden': 'true' });
      var m = el('p', { clase: 'pgui-msg', role: 'alert' }), b = el('button', { type: 'submit', clase: 'pgui-btn', texto: t.crearBtn });
      var lK = el('label', { clase: 'pgui-check', for: 'pg-k-' + uid }, [iK, el('span', { texto: o.pedirNombre ? t.consent : t.consentSinNombre })]);
      f.appendChild(el('h3', { texto: t.crear }));
      if (o.pedirNombre) { f.appendChild(el('label', { for: 'pg-n-' + uid, texto: t.nombre })); f.appendChild(iN); }
      f.appendChild(el('label', { for: 'pg-c-' + uid, texto: t.correo })); f.appendChild(iC);
      f.appendChild(lK);
      if (o.privacidad) f.appendChild(el('p', { clase: 'pgui-mu' }, [el('a', { href: o.privacidad, target: '_blank', rel: 'noopener', texto: t.verAviso })]));
      f.appendChild(el('div', { clase: 'pgui-oculto' }, [iW]));
      f.appendChild(b); f.appendChild(m);
      f.addEventListener('submit', function (ev) {
        ev.preventDefault(); msg(m, '');
        if (!iK.checked) { msg(m, t.e_consentimiento, 'er'); iK.focus(); return; }
        ocupado(b, true);
        P.registrar({ nombre: iN.value, correo: iC.value, consentimiento: true, website: iW.value }).then(function (r) {
          ultimoCreado = { codigo: r.codigo, recuperacion: r.recuperacion, correoEnviado: r.correoEnviado }; pintar();
        }, function (e) { ocupado(b, false); msg(m, mensajeError(e), 'er'); });
      });
      return f;
    }
    function formRecuperar(soloCodigoPrivado) {
      var id = P.identidad(), f = el('form', { novalidate: true });
      var iA = el('input', { type: 'text', id: 'pg-a-' + uid, maxlength: '20', autocomplete: 'off', placeholder: 'GUIA-0007', value: soloCodigoPrivado && id ? id.codigo : '' });
      var iB = el('input', { type: 'text', id: 'pg-b-' + uid, maxlength: '24', autocomplete: 'one-time-code', placeholder: 'AB12-CD34-EF56-7890-ABCD' });
      var tieneLocal = P.resumen().elementos + P.resumen().claves > 0;
      var iS = el('input', { type: 'checkbox', id: 'pg-s-' + uid, checked: tieneLocal });
      var m = el('p', { clase: 'pgui-msg', role: 'alert' }), b = el('button', { type: 'submit', clase: 'pgui-btn', texto: t.recuperar });
      f.appendChild(el('label', { for: 'pg-a-' + uid, texto: t.su_codigo })); f.appendChild(iA);
      f.appendChild(el('label', { for: 'pg-b-' + uid, texto: t.su_privado })); f.appendChild(iB);
      if (tieneLocal) f.appendChild(el('label', { clase: 'pgui-check', for: 'pg-s-' + uid }, [iS, el('span', { texto: t.sumar })]));
      f.appendChild(b); f.appendChild(m);
      f.addEventListener('submit', function (ev) {
        ev.preventDefault(); msg(m, ''); ocupado(b, true);
        P.recuperar(iA.value, iB.value, { sumarLocal: tieneLocal ? iS.checked : false }).then(function () { pintar(); }, function (e) { ocupado(b, false); msg(m, mensajeError(e), 'er'); });
      });
      return f;
    }
    function formOlvide() {
      var f = el('form', { novalidate: true }), iC = el('input', { type: 'email', id: 'pg-o-' + uid, maxlength: '254', autocomplete: 'email', inputmode: 'email' });
      var m = el('p', { clase: 'pgui-msg', role: 'status' }), b = el('button', { type: 'submit', clase: 'pgui-btn', texto: t.enviarNuevo });
      f.appendChild(el('p', { clase: 'pgui-mu', texto: t.olvideTxt }));
      f.appendChild(el('label', { for: 'pg-o-' + uid, texto: t.correo.split(' (')[0] })); f.appendChild(iC); f.appendChild(b); f.appendChild(m);
      f.addEventListener('submit', function (ev) {
        ev.preventDefault(); ocupado(b, true);
        P.olvide(iC.value).then(function () { ocupado(b, false); msg(m, t.olvideOk, 'ok'); }, function (e) { ocupado(b, false); msg(m, mensajeError(e), 'er'); });
      });
      return f;
    }
    function seccionRespaldos() {
      var sec = el('details', { open: o.modo === 'pagina' });
      var m = el('p', { clase: 'pgui-msg', role: 'status' }), prev = el('div');
      var bD = el('button', { type: 'button', clase: 'pgui-btn', texto: t.descargar });
      var iF = el('input', { type: 'file', accept: 'application/json,.json', clase: 'pgui-oculto', id: 'pg-f-' + uid, 'aria-hidden': 'true', tabindex: '-1' });
      var bR = el('button', { type: 'button', clase: 'pgui-btn sec', texto: t.restaurar, onclick: function () { iF.click(); } });
      bD.addEventListener('click', function () { msg(m, ''); P.descargarRespaldo().then(function (n) { msg(m, n, 'ok'); }, function (e) { msg(m, mensajeError(e), 'er'); }); });
      iF.addEventListener('change', function () {
        var f = iF.files && iF.files[0]; iF.value = ''; if (!f) return; msg(m, '');
        P.revisarArchivo(f).then(function (p) { vistaPrevia(prev, p, function (txt) { msg(m, txt, 'ok'); pintarPuntos(); }); }, function (e) { msg(m, mensajeError(e), 'er'); });
      });
      var lista = el('ul', { clase: 'pgui-puntos' });
      function pintarPuntos() {
        lista.textContent = '';
        var ps = P.puntos();
        if (!ps.length) { lista.appendChild(el('li', { texto: t.ninguno })); return; }
        ps.forEach(function (p) {
          var b = el('button', { type: 'button', clase: 'pgui-btn sec', texto: t.revisar });
          b.addEventListener('click', function () { P.revisarPunto(p.id).then(function (pr) { vistaPrevia(prev, pr, function (txt) { msg(m, txt, 'ok'); pintarPuntos(); }); }); });
          lista.appendChild(el('li', {}, [el('span', { texto: fecha(p.creado, o.lang) + ' · ' + p.motivo + ' · ' + p.resumen.hechos + ' ' + t.hechos }), b]));
        });
      }
      pintarPuntos();
      sec.appendChild(el('summary', { texto: t.respaldos }));
      sec.appendChild(el('p', { clase: 'pgui-mu', texto: t.respaldosTxt }));
      sec.appendChild(el('div', { clase: 'pgui-fila' }, [bD, bR, iF]));
      sec.appendChild(m); sec.appendChild(prev);
      sec.appendChild(el('h3', { texto: t.puntos })); sec.appendChild(el('p', { clase: 'pgui-mu', texto: t.puntosTxt })); sec.appendChild(lista);
      return sec;
    }
    function seccionSalir() {
      var sec = el('details', {}), m = el('p', { clase: 'pgui-msg', role: 'alert' });
      var bSi = el('button', { type: 'button', clase: 'pgui-btn peligro', texto: t.salirSi });
      bSi.addEventListener('click', function () {
        P.salir({ borrarDatos: true }).then(function () { ultimoCreado = null; pintar(); }, function (e) { msg(m, e.codigo === 'pendiente' ? t.salirPend : mensajeError(e), 'er'); });
      });
      sec.appendChild(el('summary', { texto: t.salir })); sec.appendChild(el('p', { clase: 'pgui-mu', texto: t.salirTxt })); sec.appendChild(bSi);
      if (o.permitirReinicio) {
        var bR = el('button', { type: 'button', clase: 'pgui-btn peligro', texto: t.reiniciar });
        bR.addEventListener('click', function () { if (w.confirm(t.reiniciarTxt)) P.reiniciar().then(pintar, function (e) { msg(m, mensajeError(e), 'er'); }); });
        sec.appendChild(bR);
      }
      sec.appendChild(m);
      return sec;
    }

    var uid = Math.random().toString(36).slice(2, 7);
    if (o.modo === 'pagina') cont.appendChild(panel);
    else {
      pill = el('button', { type: 'button', clase: 'pgui-pill' + (o.flotante ? ' pgui-flota' : ''), 'aria-haspopup': 'dialog' }, [el('span', { clase: 'pgui-dot', 'aria-hidden': 'true' }), el('span', { clase: 'pgui-txt' })]);
      dlg = el('dialog', { clase: 'pgui-dlg pgui', 'aria-labelledby': 'pgui-titulo-' + uid }); dlg.appendChild(panel);
      if (o.acento) dlg.style.setProperty('--pg-ac', o.acento);
      pill.addEventListener('click', function () { ultimoCreado = null; pintar(); if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); });
      dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
      dlg.addEventListener('close', function () { ultimoCreado = null; });
      cont.appendChild(pill); d.body.appendChild(dlg);
    }
    P.on('sync', function () {
      if (pill) { var s = P.estado(); pill.querySelector('.pgui-dot').setAttribute('data-t', s.tipo); pill.querySelector('.pgui-txt').textContent = textoEstado(s); }
      var st = panel.querySelector('.pgui-st'); if (st) { var s2 = P.estado(); st.firstChild.setAttribute('data-t', s2.tipo); st.lastChild.textContent = textoEstado(s2); }
    });
    P.on('cambio', function (x) { if (x && (x.origen === 'salida' || x.origen === 'recuperacion' || x.origen === 'pestaña')) pintar(); });
    pintar();
    return { pintar: pintar, abrir: function () { if (dlg) { pintar(); dlg.showModal(); } } };
  }

  w.ProgresoUI = { montar: montar, textos: TXT };
})(window, document);

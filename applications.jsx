// Applications — business card, letterhead, avatar, document header.
// Uses logo variants passed in as a `Logo` component.

function AppBusinessCard({ Logo, palette }) {
  return (
    <div style={{ width: '100%', height: '100%', background: palette.bg, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 28, boxSizing: 'border-box', fontFamily: palette.bodyFont || '"Archivo", sans-serif', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: palette.accent, opacity: 0.08 }} />
      <Logo variant="horizontal" />
      <div style={{ fontSize: 10, color: palette.fg, lineHeight: 1.6 }}>
        <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6 }}>Daniela Vargas M.</div>
        <div style={{ opacity: 0.7 }}>Directora de Proyectos</div>
        <div style={{ marginTop: 10, opacity: 0.6, fontFamily: '"IBM Plex Mono", monospace', fontSize: 9 }}>
          daniela@ots-sas.co<br/>
          +57 310 000 0000<br/>
          Bogotá · Colombia
        </div>
      </div>
    </div>
  );
}

function AppLetterhead({ Logo, palette }) {
  return (
    <div style={{ width: '100%', height: '100%', background: '#fff', padding: '28px 28px 24px', boxSizing: 'border-box', fontFamily: palette.bodyFont || '"Archivo", sans-serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `1px solid ${palette.fg}22`, paddingBottom: 18 }}>
        <Logo variant="horizontal" />
        <div style={{ textAlign: 'right', fontSize: 8, color: palette.fg, opacity: 0.6, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 0.5, lineHeight: 1.5 }}>
          NIT 900.000.000-0<br/>Bogotá · Colombia<br/>ots-sas.co
        </div>
      </div>
      <div style={{ marginTop: 22, fontSize: 9, color: palette.fg, lineHeight: 1.8 }}>
        <div style={{ color: palette.fg, opacity: 0.55, fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase' }}>Para</div>
        <div style={{ fontWeight: 600, marginTop: 2 }}>Corporación Autónoma Regional</div>
        <div style={{ marginTop: 14, fontSize: 9, opacity: 0.75 }}>
          Asunto: Formulación del plan de ordenamiento<br/>
          territorial municipal — fase diagnóstica.
        </div>
        <div style={{ marginTop: 12, height: 1, background: `${palette.fg}15` }} />
        <div style={{ marginTop: 8, opacity: 0.4, fontSize: 7, fontFamily: '"IBM Plex Mono", monospace' }}>
          — cuerpo del documento —
        </div>
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 7, color: palette.fg, opacity: 0.5, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1 }}>
        <span>CONSULTORÍA AMBIENTAL</span>
        <span>PÁG. 01 / 08</span>
      </div>
    </div>
  );
}

function AppAvatar({ Logo, palette, dark = false }) {
  return (
    <div style={{ width: '100%', height: '100%', background: dark ? palette.fg : palette.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Logo variant="mark" onDark={dark} />
    </div>
  );
}

function AppWebHeader({ Logo, palette }) {
  return (
    <div style={{ width: '100%', height: '100%', background: palette.bg, display: 'flex', flexDirection: 'column', fontFamily: palette.bodyFont || '"Archivo", sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: `1px solid ${palette.fg}14` }}>
        <Logo variant="horizontal" />
        <div style={{ display: 'flex', gap: 20, fontSize: 10, color: palette.fg, opacity: 0.75 }}>
          <span>Servicios</span><span>Proyectos</span><span>Nosotros</span><span style={{ color: palette.accent, fontWeight: 600 }}>Contacto</span>
        </div>
      </div>
      <div style={{ flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 9, color: palette.fg, opacity: 0.55, letterSpacing: 2, textTransform: 'uppercase', fontFamily: '"IBM Plex Mono", monospace' }}>
          Consultoría ambiental
        </div>
        <div style={{ fontSize: 24, color: palette.fg, fontWeight: 600, lineHeight: 1.15, marginTop: 10, letterSpacing: -0.5 }}>
          Formulamos, ejecutamos y evaluamos proyectos de inversión en ordenamiento territorial.
        </div>
        <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
          <div style={{ background: palette.fg, color: palette.bg, padding: '8px 14px', fontSize: 10, fontWeight: 600, borderRadius: 2 }}>Agendar reunión</div>
          <div style={{ border: `1px solid ${palette.fg}44`, color: palette.fg, padding: '8px 14px', fontSize: 10, borderRadius: 2 }}>Ver proyectos</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AppBusinessCard, AppLetterhead, AppAvatar, AppWebHeader });

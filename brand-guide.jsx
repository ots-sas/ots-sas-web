// BrandGuide — mini guía de marca (construcción, paleta, tipografía,
// espacio mínimo, usos correctos/incorrectos)

function BrandConstruction({ Logo, palette }) {
  return (
    <div style={{ width: '100%', height: '100%', background: '#fafaf6', padding: 24, boxSizing: 'border-box', fontFamily: '"IBM Plex Mono", monospace', position: 'relative', overflow: 'hidden' }}>
      <div style={{ fontSize: 8, letterSpacing: 2, opacity: 0.5, textTransform: 'uppercase' }}>01 · Construcción</div>
      <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 180, position: 'relative' }}>
        {/* grid guides */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(to right, rgba(0,0,0,.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,.04) 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
        <div style={{ position: 'relative' }}>
          <Logo variant="mark" />
          {/* corneritos */}
          {['tl','tr','bl','br'].map(p => {
            const s = { position: 'absolute', width: 8, height: 8, border: `1px solid ${palette.accent}` };
            if (p.includes('t')) s.top = -10; else s.bottom = -10;
            if (p.includes('l')) s.left = -10; else s.right = -10;
            return <div key={p} style={s} />;
          })}
        </div>
      </div>
      <div style={{ marginTop: 14, fontSize: 8, opacity: 0.6, textAlign: 'center', letterSpacing: 1 }}>
        ÁREA DE PROTECCIÓN · 1X EN TODOS LOS LADOS
      </div>
    </div>
  );
}

function BrandPalette({ palette, name }) {
  const swatches = [
    { c: palette.fg, l: 'PRIMARIO', h: palette.fg },
    { c: palette.accent, l: 'ACENTO', h: palette.accent },
    { c: palette.bg, l: 'FONDO', h: palette.bg, dark: false, border: true },
    { c: '#121212', l: 'TINTA', h: '#121212' },
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: '#fafaf6', padding: 24, boxSizing: 'border-box', fontFamily: '"IBM Plex Mono", monospace' }}>
      <div style={{ fontSize: 8, letterSpacing: 2, opacity: 0.5, textTransform: 'uppercase' }}>02 · Paleta</div>
      <div style={{ fontSize: 12, marginTop: 6, fontWeight: 600, fontFamily: '"Archivo", sans-serif' }}>{name}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
        {swatches.map((s, i) => (
          <div key={i} style={{ background: s.c, height: 74, padding: 10, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: i === 2 ? '#222' : '#fff', border: s.border ? '1px solid rgba(0,0,0,.08)' : 'none' }}>
            <div style={{ fontSize: 7, letterSpacing: 1.5, opacity: 0.8 }}>{s.l}</div>
            <div style={{ fontSize: 9, opacity: 0.9 }}>{s.h.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BrandTypography({ palette, display, body, displayName, bodyName }) {
  return (
    <div style={{ width: '100%', height: '100%', background: '#fafaf6', padding: 24, boxSizing: 'border-box' }}>
      <div style={{ fontSize: 8, letterSpacing: 2, opacity: 0.5, textTransform: 'uppercase', fontFamily: '"IBM Plex Mono", monospace' }}>03 · Tipografía</div>
      <div style={{ marginTop: 16, borderBottom: '1px solid rgba(0,0,0,.08)', paddingBottom: 14 }}>
        <div style={{ fontSize: 7, letterSpacing: 1.5, opacity: 0.5, fontFamily: '"IBM Plex Mono", monospace' }}>DISPLAY · {displayName}</div>
        <div style={{ fontFamily: display, fontSize: 38, color: palette.fg, fontWeight: 600, letterSpacing: -0.5, marginTop: 6, lineHeight: 1 }}>Aa</div>
        <div style={{ fontFamily: display, fontSize: 13, color: palette.fg, marginTop: 4 }}>
          Ordenamiento Territorial
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 7, letterSpacing: 1.5, opacity: 0.5, fontFamily: '"IBM Plex Mono", monospace' }}>CUERPO · {bodyName}</div>
        <div style={{ fontFamily: body, fontSize: 10, color: palette.fg, marginTop: 6, opacity: 0.85, lineHeight: 1.5 }}>
          Firma consultora que formula, ejecuta y evalúa proyectos de inversión en ordenamiento territorial y asuntos ambientales.
        </div>
      </div>
    </div>
  );
}

function BrandUsage({ Logo, palette }) {
  return (
    <div style={{ width: '100%', height: '100%', background: '#fafaf6', padding: 24, boxSizing: 'border-box', fontFamily: '"IBM Plex Mono", monospace' }}>
      <div style={{ fontSize: 8, letterSpacing: 2, opacity: 0.5, textTransform: 'uppercase' }}>04 · Usos</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
        <div style={{ background: palette.bg, padding: 14, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ transform: 'scale(0.65)' }}><Logo variant="horizontal" /></div>
          <div style={{ position: 'absolute', top: 4, left: 6, fontSize: 7, color: '#2a8a4f' }}>✓ CORRECTO</div>
        </div>
        <div style={{ background: palette.fg, padding: 14, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ transform: 'scale(0.65)' }}><Logo variant="horizontal" onDark /></div>
          <div style={{ position: 'absolute', top: 4, left: 6, fontSize: 7, color: '#7adba3' }}>✓ INVERTIDO</div>
        </div>
        <div style={{ background: '#ff00aa', padding: 14, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ transform: 'scale(0.65)', opacity: 0.5, filter: 'saturate(0.3)' }}><Logo variant="horizontal" /></div>
          <div style={{ position: 'absolute', top: 4, left: 6, fontSize: 7, color: '#fff' }}>✗ FONDOS ESTRIDENTES</div>
        </div>
        <div style={{ background: palette.bg, padding: 14, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ transform: 'scale(0.65) skewX(-20deg)', opacity: 0.8 }}><Logo variant="horizontal" /></div>
          <div style={{ position: 'absolute', top: 4, left: 6, fontSize: 7, color: '#c53030' }}>✗ DEFORMAR</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BrandConstruction, BrandPalette, BrandTypography, BrandUsage });

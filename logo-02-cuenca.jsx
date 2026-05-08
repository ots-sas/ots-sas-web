// Direction 02 — "Cuenca"
// Un río/cauce abstracto atravesando una forma de territorio (cuadrícula
// catastral). Paleta azul petróleo + ocre cálido. Sans geométrica.

function Logo02Mark({ size = 120, primary = '#0B3D4F', accent = '#C47A3D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* territorio cuadrado con esquina redondeada, como un predio */}
      <rect x="14" y="14" width="72" height="72" rx="10" fill={primary} />
      {/* cuadrícula catastral sutil */}
      <g stroke="rgba(255,255,255,0.09)" strokeWidth="0.8">
        <path d="M 14 38 L 86 38 M 14 62 L 86 62 M 38 14 L 38 86 M 62 14 L 62 86" />
      </g>
      {/* río — curva meandrica */}
      <path d="M 22 30 Q 38 42, 44 50 Q 50 58, 62 62 Q 74 66, 82 74"
        stroke={accent} strokeWidth="3.2" fill="none" strokeLinecap="round" />
      {/* punto de origen */}
      <circle cx="22" cy="30" r="2.6" fill="#fff" />
    </svg>
  );
}

function Logo02({ variant = 'vertical', onDark = false }) {
  const primary = onDark ? '#E8E2D0' : '#0B3D4F';
  const muted = onDark ? 'rgba(232,226,208,.7)' : '#5A6B72';
  const accent = '#C47A3D';
  const markP = onDark ? '#E8E2D0' : '#0B3D4F';
  if (variant === 'mark') return <Logo02Mark size={96} primary={markP} accent={accent} />;
  if (variant === 'horizontal') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: '"Archivo", sans-serif' }}>
        <Logo02Mark size={56} primary={markP} accent={accent} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: primary, letterSpacing: -0.5, lineHeight: 1 }}>
            OTS<span style={{ color: accent }}>.</span>
          </div>
          <div style={{ fontSize: 9, color: muted, letterSpacing: 1.4, marginTop: 4, textTransform: 'uppercase', fontWeight: 500 }}>
            Ordenamiento Territorial Sostenible
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, fontFamily: '"Archivo", sans-serif' }}>
      <Logo02Mark size={110} primary={markP} accent={accent} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 34, fontWeight: 800, color: primary, letterSpacing: -1, lineHeight: 1 }}>
          OTS<span style={{ color: accent }}>.</span>
        </div>
        <div style={{ fontSize: 9, color: muted, letterSpacing: 2, marginTop: 10, textTransform: 'uppercase', fontWeight: 500 }}>
          Ordenamiento Territorial<br/>Sostenible S.A.S
        </div>
      </div>
    </div>
  );
}

window.Logo02 = Logo02;
window.Logo02Mark = Logo02Mark;

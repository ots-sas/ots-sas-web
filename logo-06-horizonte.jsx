// Direction 06 — "Horizonte"
// Montaña / horizonte estilizado: un triángulo con un sol que se repite
// en una línea reflejada (agua). Moderno, fresco. Paleta salvia + piedra.

function Logo06Mark({ size = 120, color = '#2F4A3E', accent = '#C9A87C' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* sol */}
      <circle cx="68" cy="32" r="7" fill={accent} />
      {/* montaña principal */}
      <path d="M 12 68 L 38 32 L 64 68 Z" fill={color} />
      {/* montaña secundaria */}
      <path d="M 46 68 L 62 44 L 78 68 Z" fill={color} opacity="0.55" />
      {/* línea de horizonte / agua */}
      <path d="M 10 76 L 90 76" stroke={color} strokeWidth="1.6" />
      <path d="M 18 82 L 34 82 M 44 82 L 72 82 M 80 82 L 88 82"
        stroke={color} strokeWidth="1.2" opacity="0.4" />
    </svg>
  );
}

function Logo06({ variant = 'vertical', onDark = false }) {
  const primary = onDark ? '#E8E4D6' : '#1F2D26';
  const muted = onDark ? 'rgba(232,228,214,.65)' : '#6B7668';
  const markC = onDark ? '#E8E4D6' : '#2F4A3E';
  const accent = '#C9A87C';
  if (variant === 'mark') return <Logo06Mark size={96} color={markC} accent={accent} />;
  if (variant === 'horizontal') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: '"Manrope", sans-serif' }}>
        <Logo06Mark size={56} color={markC} accent={accent} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: primary, letterSpacing: -0.3, lineHeight: 1 }}>
            OTS
          </div>
          <div style={{ fontSize: 10, color: muted, letterSpacing: 1.4, marginTop: 4, fontWeight: 500 }}>
            Ordenamiento Territorial Sostenible
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, fontFamily: '"Manrope", sans-serif' }}>
      <Logo06Mark size={110} color={markC} accent={accent} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: primary, letterSpacing: -0.5, lineHeight: 1 }}>OTS</div>
        <div style={{ fontSize: 10, color: muted, letterSpacing: 2, marginTop: 10, fontWeight: 500, textTransform: 'uppercase' }}>
          Ordenamiento Territorial<br/>Sostenible S.A.S
        </div>
      </div>
    </div>
  );
}

window.Logo06 = Logo06;
window.Logo06Mark = Logo06Mark;

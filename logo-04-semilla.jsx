// Direction 04 — "Semilla"
// Brote/semilla estilizado que crece desde una línea de tierra.
// Paleta verde esmeralda profundo + negro + crema. Serif de alta autoridad.

function Logo04Mark({ size = 120, color = '#0E4B3C', accent = '#D9A441' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* línea de horizonte */}
      <path d="M 14 72 L 86 72" stroke={color} strokeWidth="1.4" opacity="0.5" />
      {/* hoja izquierda */}
      <path d="M 50 72 Q 30 60, 28 40 Q 42 44, 50 58 Z" fill={color} />
      {/* hoja derecha */}
      <path d="M 50 72 Q 70 58, 72 36 Q 58 42, 50 58 Z" fill={color} opacity="0.75" />
      {/* tallo */}
      <path d="M 50 72 L 50 48" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* sol / punto dorado */}
      <circle cx="50" cy="28" r="4" fill={accent} />
    </svg>
  );
}

function Logo04({ variant = 'vertical', onDark = false }) {
  const primary = onDark ? '#F5F0E1' : '#14241D';
  const muted = onDark ? 'rgba(245,240,225,.6)' : 'rgba(20,36,29,.55)';
  const markC = onDark ? '#F5F0E1' : '#0E4B3C';
  if (variant === 'mark') return <Logo04Mark size={96} color={markC} />;
  if (variant === 'horizontal') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontFamily: 'Georgia, "Playfair Display", serif' }}>
        <Logo04Mark size={60} color={markC} />
        <div>
          <div style={{ fontSize: 20, fontWeight: 500, color: primary, letterSpacing: 0.3, lineHeight: 1, fontStyle: 'italic' }}>
            Ordenamiento
          </div>
          <div style={{ fontSize: 20, fontWeight: 500, color: primary, letterSpacing: 0.3, lineHeight: 1, marginTop: 2 }}>
            Territorial Sostenible
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, fontFamily: 'Georgia, serif' }}>
      <Logo04Mark size={110} color={markC} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 500, color: primary, letterSpacing: 0.5, lineHeight: 1.1, fontStyle: 'italic' }}>
          Ordenamiento
        </div>
        <div style={{ fontSize: 24, fontWeight: 500, color: primary, letterSpacing: 0.5, lineHeight: 1.1 }}>
          Territorial Sostenible
        </div>
        <div style={{ fontSize: 9, color: muted, letterSpacing: 4, marginTop: 12, textTransform: 'uppercase', fontFamily: '"IBM Plex Mono", monospace' }}>
          — S.A.S —
        </div>
      </div>
    </div>
  );
}

window.Logo04 = Logo04;
window.Logo04Mark = Logo04Mark;

// Direction 07 — "Fusión" (01 Topografía × 02 Cuenca)
// Curvas de nivel de 01 + paleta azul petróleo/terracota de 02 +
// tipografía sans geométrica (Archivo) + detalle cartográfico.
//
// Tres variantes: A (puras curvas), B (curvas + punto de interés),
// C (curvas dentro de un recuadro tipo plano catastral).

const F_PRIMARY = '#0B3D4F';   // azul petróleo (de 02)
const F_ACCENT  = '#C47A3D';   // terracota (de 02)
const F_INK     = '#14242C';

// Curvas de nivel concéntricas, desfasadas para sugerir un relieve real
// (no simétrico). Esta es la señal visual más fuerte del OT.
function ContourLines({ color = F_PRIMARY, accent = F_ACCENT, showDot = true }) {
  return (
    <g>
      <g stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round">
        {/* curvas de nivel — cada una ligeramente desfasada del centro */}
        <path d="M 18 52 Q 20 28, 48 26 Q 78 26, 82 50 Q 80 72, 52 74 Q 22 74, 18 52 Z" opacity="0.16" />
        <path d="M 24 52 Q 26 34, 49 32 Q 74 32, 77 50 Q 75 68, 52 70 Q 28 70, 24 52 Z" opacity="0.30" />
        <path d="M 30 52 Q 32 40, 50 38 Q 69 38, 71 50 Q 70 64, 52 66 Q 34 66, 30 52 Z" opacity="0.50" />
        <path d="M 36 52 Q 38 45, 50 44 Q 63 44, 65 51 Q 64 60, 52 61 Q 40 61, 36 52 Z" opacity="0.80" />
      </g>
      {showDot && <circle cx="50" cy="52" r="2.4" fill={accent} />}
    </g>
  );
}

// Variant A — puras curvas, sin contenedor. El más limpio.
function LogoFusionMarkA({ size = 120, color = F_PRIMARY, accent = F_ACCENT }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ContourLines color={color} accent={accent} />
    </svg>
  );
}

// Variant B — curvas + pin de coordenada + ticks cardinales sutiles.
// Esta es la recomendada. Agrega un micro-detalle cartográfico sin ruido.
function LogoFusionMarkB({ size = 120, color = F_PRIMARY, accent = F_ACCENT }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* ticks cardinales muy sutiles — a escala grande se leen como "mapa" */}
      <g stroke={color} strokeWidth="1" opacity="0.25">
        <path d="M 50 8 L 50 14" />
        <path d="M 50 86 L 50 92" />
        <path d="M 8 50 L 14 50" />
        <path d="M 86 50 L 92 50" />
      </g>
      <ContourLines color={color} accent={accent} showDot={false} />
      {/* pin/punto de interés — círculo sólido sobre aro */}
      <circle cx="50" cy="52" r="5" fill={color} />
      <circle cx="50" cy="52" r="2" fill={accent} />
    </svg>
  );
}

// Variant C — curvas DENTRO de un recuadro con esquinas recortadas,
// evocando una hoja de plano catastral. Más institucional.
function LogoFusionMarkC({ size = 120, color = F_PRIMARY, accent = F_ACCENT }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* recuadro con esquinas cortadas — tipo cartela de plano */}
      <path d="M 14 10 L 86 10 L 90 14 L 90 86 L 86 90 L 14 90 L 10 86 L 10 14 Z"
        stroke={color} strokeWidth="1.4" fill="none" opacity="0.85" />
      {/* título del plano arriba */}
      <line x1="14" y1="22" x2="86" y2="22" stroke={color} strokeWidth="0.8" opacity="0.35" />
      <ContourLines color={color} accent={accent} />
    </svg>
  );
}

// Logotype — Archivo 800, compacto, con punto acento.
// La clave aquí es "OTS" como ancla reconocible + el nombre completo
// como descriptor pequeño. La sigla es lo que la gente va a usar.
function LogoFusion({ variant = 'vertical', onDark = false, markVariant = 'B' }) {
  const primary = onDark ? '#E8E6DC' : F_PRIMARY;
  const mutedOnDark = 'rgba(232,230,220,.65)';
  const muted = onDark ? mutedOnDark : '#5A6B72';
  const markC = onDark ? '#E8E6DC' : F_PRIMARY;
  const accent = F_ACCENT;
  const Mark = { A: LogoFusionMarkA, B: LogoFusionMarkB, C: LogoFusionMarkC }[markVariant];

  if (variant === 'mark') return <Mark size={96} color={markC} accent={accent} />;

  if (variant === 'horizontal') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: '"Archivo", sans-serif' }}>
        <Mark size={56} color={markC} accent={accent} />
        <div style={{ borderLeft: `1px solid ${onDark ? 'rgba(232,230,220,.25)' : 'rgba(11,61,79,.2)'}`, paddingLeft: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: primary, letterSpacing: -0.5, lineHeight: 1 }}>
            OTS<span style={{ color: accent }}>.</span>
          </div>
          <div style={{ fontSize: 9, color: muted, letterSpacing: 1.6, marginTop: 5, textTransform: 'uppercase', fontWeight: 500 }}>
            Ordenamiento Territorial Sostenible
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, fontFamily: '"Archivo", sans-serif' }}>
      <Mark size={110} color={markC} accent={accent} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 34, fontWeight: 800, color: primary, letterSpacing: -1, lineHeight: 1 }}>
          OTS<span style={{ color: accent }}>.</span>
        </div>
        <div style={{ height: 1, width: 28, background: muted, margin: '12px auto', opacity: 0.5 }} />
        <div style={{ fontSize: 9, color: muted, letterSpacing: 2.2, textTransform: 'uppercase', fontWeight: 500 }}>
          Ordenamiento Territorial<br/>Sostenible S.A.S
        </div>
      </div>
    </div>
  );
}

window.LogoFusion = LogoFusion;
window.LogoFusionMarkA = LogoFusionMarkA;
window.LogoFusionMarkB = LogoFusionMarkB;
window.LogoFusionMarkC = LogoFusionMarkC;

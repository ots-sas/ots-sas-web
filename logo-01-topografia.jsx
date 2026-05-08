// Direction 01 — "Topografía"
// Curvas de nivel concéntricas que se abren hacia la derecha, sugiriendo
// un mapa y a la vez un crecimiento sostenible. Serif institucional.

function Logo01Mark({ size = 120, color = '#0F3D2E' }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* curvas de nivel — elipses concéntricas, desfasadas */}
      <g stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round">
        <path d="M 20 50 Q 20 30, 50 30 Q 80 30, 80 50 Q 80 70, 50 70 Q 20 70, 20 50 Z" opacity="0.18" />
        <path d="M 26 50 Q 26 35, 50 35 Q 74 35, 74 50 Q 74 65, 50 65 Q 26 65, 26 50 Z" opacity="0.35" />
        <path d="M 32 50 Q 32 40, 50 40 Q 68 40, 68 50 Q 68 60, 50 60 Q 32 60, 32 50 Z" opacity="0.55" />
        <path d="M 38 50 Q 38 45, 50 45 Q 62 45, 62 50 Q 62 55, 50 55 Q 38 55, 38 50 Z" opacity="0.85" />
      </g>
      {/* punto central — lugar */}
      <circle cx="50" cy="50" r="2.2" fill={color} />
    </svg>
  );
}

function Logo01({ variant = 'vertical', onDark = false }) {
  const primary = onDark ? '#E8E2D0' : '#0F3D2E';
  const secondary = onDark ? 'rgba(232,226,208,.65)' : 'rgba(15,61,46,.55)';
  if (variant === 'mark') return <Logo01Mark color={primary} size={96} />;
  if (variant === 'horizontal') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontFamily: '"Cormorant Garamond", "Times New Roman", serif' }}>
        <Logo01Mark color={primary} size={64} />
        <div>
          <div style={{ fontSize: 26, fontWeight: 600, color: primary, letterSpacing: 4, lineHeight: 1 }}>OTS</div>
          <div style={{ fontSize: 10, fontFamily: '"IBM Plex Mono", monospace', color: secondary, letterSpacing: 2.5, marginTop: 6, textTransform: 'uppercase' }}>
            Ordenamiento Territorial Sostenible
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, fontFamily: '"Cormorant Garamond", serif' }}>
      <Logo01Mark color={primary} size={110} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 38, fontWeight: 600, color: primary, letterSpacing: 8, lineHeight: 1 }}>OTS</div>
        <div style={{ height: 1, width: 44, background: secondary, margin: '14px auto' }} />
        <div style={{ fontSize: 10, fontFamily: '"IBM Plex Mono", monospace', color: secondary, letterSpacing: 3, textTransform: 'uppercase' }}>
          Ordenamiento Territorial<br/>Sostenible S.A.S
        </div>
      </div>
    </div>
  );
}

window.Logo01 = Logo01;
window.Logo01Mark = Logo01Mark;

// Direction 03 — "Monograma"
// Monograma OTS construido con formas modulares que evocan parcelas.
// Paleta verde oliva + crema. Tipografía sans humanista.

function Logo03Mark({ size = 120, color = '#4A5D3A' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* anillo exterior sutil */}
      <circle cx="50" cy="50" r="46" stroke={color} strokeWidth="1.2" opacity="0.25" fill="none" />
      {/* monograma O + T entrelazados */}
      <g>
        {/* O */}
        <circle cx="38" cy="52" r="18" stroke={color} strokeWidth="5.5" fill="none" />
        {/* T — barra horizontal y vertical */}
        <rect x="48" y="30" width="26" height="5.5" fill={color} rx="1" />
        <rect x="58" y="30" width="5.5" height="42" fill={color} rx="1" />
      </g>
    </svg>
  );
}

function Logo03({ variant = 'vertical', onDark = false }) {
  const primary = onDark ? '#F2EEE2' : '#3A4A2E';
  const muted = onDark ? 'rgba(242,238,226,.65)' : '#7A8468';
  const markC = onDark ? '#F2EEE2' : '#4A5D3A';
  if (variant === 'mark') return <Logo03Mark size={96} color={markC} />;
  if (variant === 'horizontal') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: '"Work Sans", sans-serif' }}>
        <Logo03Mark size={56} color={markC} />
        <div style={{ borderLeft: `1px solid ${muted}`, paddingLeft: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: primary, letterSpacing: 0.2, lineHeight: 1.1 }}>
            Ordenamiento<br/>Territorial Sostenible
          </div>
          <div style={{ fontSize: 9, color: muted, letterSpacing: 2, marginTop: 4, textTransform: 'uppercase' }}>
            Consultoría · S.A.S
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, fontFamily: '"Work Sans", sans-serif' }}>
      <Logo03Mark size={110} color={markC} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: primary, letterSpacing: 0.5, lineHeight: 1.15 }}>
          Ordenamiento Territorial<br/>Sostenible
        </div>
        <div style={{ fontSize: 9, color: muted, letterSpacing: 3, marginTop: 10, textTransform: 'uppercase' }}>
          Consultoría Ambiental · S.A.S
        </div>
      </div>
    </div>
  );
}

window.Logo03 = Logo03;
window.Logo03Mark = Logo03Mark;

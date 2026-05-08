// Direction 05 — "Sello"
// Sello circular tipo institucional/catastral. Texto curvo alrededor de
// un monograma OTS. Muy serio, pensado para documentos oficiales.
// Paleta azul profundo + terracota.

function Logo05Mark({ size = 120, color = '#1E3A52', accent = '#B84F2E' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <path id="l05-top" d="M 60 60 m -46 0 a 46 46 0 0 1 92 0" />
        <path id="l05-bot" d="M 60 60 m -46 0 a 46 46 0 0 0 92 0" />
      </defs>
      {/* doble anillo */}
      <circle cx="60" cy="60" r="52" stroke={color} strokeWidth="1" fill="none" opacity="0.35" />
      <circle cx="60" cy="60" r="46" stroke={color} strokeWidth="2" fill="none" />
      {/* cruz de puntos cardinales */}
      <g fill={color}>
        <circle cx="60" cy="11" r="1.6" />
        <circle cx="109" cy="60" r="1.6" />
        <circle cx="60" cy="109" r="1.6" />
        <circle cx="11" cy="60" r="1.6" />
      </g>
      {/* texto curvo */}
      <text fontFamily='"IBM Plex Mono", monospace' fontSize="7.5" letterSpacing="3" fill={color}>
        <textPath href="#l05-top" startOffset="50%" textAnchor="middle">ORDENAMIENTO TERRITORIAL</textPath>
      </text>
      <text fontFamily='"IBM Plex Mono", monospace' fontSize="7.5" letterSpacing="3" fill={color}>
        <textPath href="#l05-bot" startOffset="50%" textAnchor="middle">· SOSTENIBLE · S · A · S ·</textPath>
      </text>
      {/* monograma central */}
      <g transform="translate(60 60)">
        <text fontFamily="Georgia, serif" fontSize="28" fontWeight="700" textAnchor="middle"
          dominantBaseline="central" fill={color} letterSpacing="1">OTS</text>
        <line x1="-16" y1="14" x2="16" y2="14" stroke={accent} strokeWidth="1.6" />
      </g>
    </svg>
  );
}

function Logo05({ variant = 'vertical', onDark = false }) {
  const primary = onDark ? '#F0EAD8' : '#1E3A52';
  const markC = onDark ? '#F0EAD8' : '#1E3A52';
  const accent = '#B84F2E';
  if (variant === 'mark') return <Logo05Mark size={120} color={markC} accent={accent} />;
  if (variant === 'horizontal') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'Georgia, serif' }}>
        <Logo05Mark size={72} color={markC} accent={accent} />
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: primary, letterSpacing: 0.2, lineHeight: 1.15 }}>
            Ordenamiento Territorial<br/>Sostenible <span style={{ color: accent }}>S.A.S</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, fontFamily: 'Georgia, serif' }}>
      <Logo05Mark size={130} color={markC} accent={accent} />
    </div>
  );
}

window.Logo05 = Logo05;
window.Logo05Mark = Logo05Mark;

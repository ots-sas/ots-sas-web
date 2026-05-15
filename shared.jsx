// ═══════════════════════════════════════════════════════════════
// OTS — Shared components, data, and constants
// ═══════════════════════════════════════════════════════════════

const FUSION_PRIMARY = '#0B3D4F';
const FUSION_ACCENT = '#C47A3D';
const FUSION_BG = '#EEE9D8';
const FUSION_DARK = '#0B242C';
const FUSION_DARK2 = '#14242C';
const FUSION_INK_LIGHT = '#E8E6DC';

// ─── BRAND ──────────────────────────────────────────────────
function FusionMark({ size = 56, onDark = true }) {
  const color = onDark ? FUSION_INK_LIGHT : FUSION_PRIMARY;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <g stroke={color} strokeWidth="1" opacity="0.25">
        <path d="M 50 8 L 50 14" />
        <path d="M 50 86 L 50 92" />
        <path d="M 8 50 L 14 50" />
        <path d="M 86 50 L 92 50" />
      </g>
      <g stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round">
        <path d="M 18 52 Q 20 28, 48 26 Q 78 26, 82 50 Q 80 72, 52 74 Q 22 74, 18 52 Z" opacity="0.16" />
        <path d="M 24 52 Q 26 34, 49 32 Q 74 32, 77 50 Q 75 68, 52 70 Q 28 70, 24 52 Z" opacity="0.30" />
        <path d="M 30 52 Q 32 40, 50 38 Q 69 38, 71 50 Q 70 64, 52 66 Q 34 66, 30 52 Z" opacity="0.50" />
        <path d="M 36 52 Q 38 45, 50 44 Q 63 44, 65 51 Q 64 60, 52 61 Q 40 61, 36 52 Z" opacity="0.80" />
      </g>
      <circle cx="50" cy="52" r="5" fill={color} />
      <circle cx="50" cy="52" r="2" fill={FUSION_ACCENT} />
    </svg>);
}

function FusionLockup({ compact = false, onDark = true }) {
  const color = onDark ? FUSION_INK_LIGHT : FUSION_PRIMARY;
  const muted = onDark ? 'rgba(232,230,220,.65)' : '#5A6B72';
  const border = onDark ? 'rgba(232,230,220,.25)' : 'rgba(11,61,79,.2)';
  return (
    <a href="index.html" style={{ display: 'flex', alignItems: 'center', gap: compact ? 12 : 16, fontFamily: '"Archivo", sans-serif', textDecoration: 'none' }}>
      <FusionMark size={compact ? 40 : 56} onDark={onDark} />
      <div style={{ borderLeft: `1px solid ${border}`, paddingLeft: compact ? 10 : 14 }}>
        <div style={{ fontSize: compact ? 16 : 22, fontWeight: 800, color, letterSpacing: -0.5, lineHeight: 1 }}>
          OTS<span style={{ color: FUSION_ACCENT }}>.</span>
        </div>
        <div style={{ fontSize: compact ? 7.5 : 9, color: muted, letterSpacing: 1.6, marginTop: compact ? 3 : 5, textTransform: 'uppercase', fontWeight: 500 }}>
          Ordenamiento Territorial Sostenible
        </div>
      </div>
    </a>);
}

// ─── HEADER ─────────────────────────────────────────────────
function Header({ lang, setLang, current }) {
  const [open, setOpen] = React.useState(false);
  const t = lang === 'en' ?
    { services: 'Services', trayectoria: 'Track record', about: 'About', contact: 'Contact', cta: 'Get in touch' } :
    { services: 'Servicios', trayectoria: 'Trayectoria', about: 'Nosotros', contact: 'Contacto', cta: 'Hablemos' };

  const links = [
    { href: 'servicios.html', key: 'servicios', label: t.services },
    { href: 'trayectoria.html', key: 'trayectoria', label: t.trayectoria },
    { href: 'nosotros.html', key: 'nosotros', label: t.about },
    { href: 'contacto.html', key: 'contacto', label: t.contact }
  ];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(11,36,44,0.88)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(232,230,220,.08)', fontFamily: '"Archivo", sans-serif' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 40px', display: 'flex', alignItems: 'center', gap: 40 }}>
        <FusionLockup compact onDark />
        <nav style={{ marginLeft: 'auto', display: 'flex', gap: 4, alignItems: 'center', fontSize: 13 }}>
          {links.map(l => {
            const active = current === l.key;
            return (
              <a key={l.key} href={l.href} style={{
                color: active ? FUSION_INK_LIGHT : 'rgba(232,230,220,.7)',
                textDecoration: 'none', padding: '8px 14px', borderRadius: 2,
                background: active ? 'rgba(232,230,220,.07)' : 'transparent',
                position: 'relative', fontWeight: active ? 600 : 400, transition: 'color .15s'
              }}>
                {l.label}
                {active && <span style={{ position: 'absolute', left: 14, right: 14, bottom: 2, height: 2, background: FUSION_ACCENT }} />}
              </a>
            );
          })}
          <div style={{ display: 'flex', gap: 1, background: 'rgba(232,230,220,.08)', borderRadius: 2, padding: 2, marginLeft: 14 }}>
            {['es', 'en'].map((l) =>
              <button key={l} onClick={() => setLang(l)}
                style={{ border: 'none', background: lang === l ? FUSION_ACCENT : 'transparent',
                  color: lang === l ? '#fff' : 'rgba(232,230,220,.6)', padding: '4px 8px', fontSize: 10,
                  fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1, cursor: 'pointer', borderRadius: 1 }}>
                {l.toUpperCase()}
              </button>
            )}
          </div>
          <a href="contacto.html" style={{ background: FUSION_ACCENT, color: '#fff', padding: '9px 16px',
            fontSize: 12, fontWeight: 600, textDecoration: 'none', borderRadius: 2, marginLeft: 10 }}>
            {t.cta} →
          </a>
        </nav>
      </div>
    </header>);
}

// ─── FOOTER ─────────────────────────────────────────────
const SOCIAL = {
  linkedin: 'https://www.linkedin.com/company/100469055/',
  instagram: 'https://www.instagram.com/ot.sost/',
  card: 'https://truelinc.co/detail/6g23mIfPbT?truelincqrid=6g23mIfPbT'
};

function SocialIcon({ kind, size = 16 }) {
  if (kind === 'linkedin') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0z"/></svg>
  );
  if (kind === 'instagram') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r="1" fill="currentColor"/></svg>
  );
  if (kind === 'mail') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
  );
  return null;
}

function SocialBtn({ href, label, kind }) {
  return (
    <a href={href} target="_blank" rel="noopener" aria-label={label}
      style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(232,230,220,.06)', color: 'rgba(232,230,220,.75)', borderRadius: 2, transition: 'all .15s', textDecoration: 'none' }}
      onMouseEnter={(e)=>{e.currentTarget.style.background=FUSION_ACCENT;e.currentTarget.style.color='#fff';}}
      onMouseLeave={(e)=>{e.currentTarget.style.background='rgba(232,230,220,.06)';e.currentTarget.style.color='rgba(232,230,220,.75)';}}>
      <SocialIcon kind={kind} />
    </a>);
}

function Footer({ lang }) {
  const t = lang === 'en' ?
    { rights: 'All rights reserved', tag: 'Environmental & territorial planning consultancy', nav: 'Navigate', contact: 'Contact', services: 'Services', trayectoria: 'Track record', about: 'About', back: 'Back to top', legal: 'Legal', policy: 'Data protection policy', portfolio: 'Portfolio (PDF)', follow: 'Follow us' } :
    { rights: 'Todos los derechos reservados', tag: 'Consultoría ambiental y de ordenamiento territorial', nav: 'Navegar', contact: 'Contacto', services: 'Servicios', trayectoria: 'Trayectoria', about: 'Nosotros', back: 'Volver arriba', legal: 'Legal', policy: 'Política de tratamiento de datos', portfolio: 'Portafolio (PDF)', follow: 'Síguenos' };

  const linkSty = { fontSize: 13, color: 'rgba(232,230,220,.7)', textDecoration: 'none' };
  const labelSty = { fontSize: 10, color: 'rgba(232,230,220,.4)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 };

  return (
    <footer style={{ background: '#07181F', color: 'rgba(232,230,220,.55)', padding: '70px 40px 28px', fontFamily: '"Archivo", sans-serif' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, paddingBottom: 50, borderBottom: '1px solid rgba(232,230,220,.1)' }}>
          <div>
            <FusionLockup onDark />
            <div style={{ fontSize: 13, color: 'rgba(232,230,220,.55)', marginTop: 18, lineHeight: 1.6, maxWidth: 320 }}>{t.tag}</div>
            <div style={{ marginTop: 22 }}>
              <div style={labelSty}>{t.follow}</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <SocialBtn href={SOCIAL.linkedin} label="LinkedIn" kind="linkedin" />
                <SocialBtn href={SOCIAL.instagram} label="Instagram" kind="instagram" />
                <SocialBtn href="mailto:ordenamientoots@gmail.com" label="Email" kind="mail" />
              </div>
            </div>
          </div>
          <div>
            <div style={labelSty}>{t.nav}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="servicios.html" style={linkSty}>{t.services}</a>
              <a href="trayectoria.html" style={linkSty}>{t.trayectoria}</a>
              <a href="nosotros.html" style={linkSty}>{t.about}</a>
              <a href="contacto.html" style={linkSty}>{t.contact}</a>
              <a href="portafolio.html" style={linkSty}>{t.portfolio}</a>
            </div>
          </div>
          <div>
            <div style={labelSty}>{t.contact}</div>
            <a href="mailto:ordenamientoots@gmail.com" style={{ ...linkSty, display: 'block', marginBottom: 8 }}>ordenamientoots@gmail.com</a>
            <div style={{ fontSize: 13, color: 'rgba(232,230,220,.55)' }}>Bogotá · Colombia</div>
            <div style={{ fontSize: 12, color: 'rgba(232,230,220,.4)', marginTop: 10, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 0.5 }}>NIT 901.815.692-3</div>
          </div>
          <div>
            <div style={labelSty}>{t.legal}</div>
            <a href="politica-datos.html" style={{ ...linkSty, display: 'block', marginBottom: 18, lineHeight: 1.45 }}>{t.policy}</a>
            <a href="#top" onClick={(e)=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'});}}
              style={{ fontSize: 11, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1.5, color: 'rgba(232,230,220,.7)', textDecoration: 'none', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              ↑ {t.back}
            </a>
          </div>
        </div>
        <div style={{ marginTop: 24, fontSize: 11, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1, color: 'rgba(232,230,220,.4)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>© 2024–2026 Ordenamiento Territorial Sostenible S.A.S · {t.rights}</div>
          <div>NIT · 901.815.692-3</div>
        </div>
      </div>
    </footer>);
}

// ─── HOOK: lang persistence ─────────────────────────────────
function useLang() {
  const [lang, setLang] = React.useState(() => localStorage.getItem('ots-lang') || 'es');
  React.useEffect(() => {
    localStorage.setItem('ots-lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);
  return [lang, setLang];
}

// ─── PAGE HERO (reusable for inner pages) ──────────────────
function PageHero({ eyebrow, title, titleAccent, sub, kicker, height = 'medium' }) {
  const padTop = height === 'large' ? 130 : height === 'small' ? 80 : 100;
  const padBot = height === 'large' ? 100 : height === 'small' ? 60 : 80;
  return (
    <section style={{ background: FUSION_DARK, color: FUSION_INK_LIGHT, padding: `${padTop}px 40px ${padBot}px`,
      position: 'relative', overflow: 'hidden', fontFamily: '"Archivo", sans-serif' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.10, pointerEvents: 'none' }} viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
        <g stroke={FUSION_INK_LIGHT} strokeWidth="0.7" fill="none">
          <path d="M -100 300 Q 200 150, 600 220 Q 1000 290, 1400 180" />
          <path d="M -100 360 Q 200 220, 600 280 Q 1000 340, 1400 250" />
          <path d="M -100 420 Q 200 300, 600 340 Q 1000 380, 1400 320" />
          <path d="M -100 480 Q 200 380, 600 400 Q 1000 420, 1400 390" />
          <path d="M -100 240 Q 200 80, 600 160 Q 1000 240, 1400 110" />
        </g>
      </svg>
      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        {kicker && (
          <div style={{ fontSize: 10, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 2, color: 'rgba(232,230,220,.5)', marginBottom: 24, textTransform: 'uppercase' }}>
            {kicker}
          </div>
        )}
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: FUSION_ACCENT,
          fontFamily: '"IBM Plex Mono", monospace', marginBottom: 22 }}>◦ {eyebrow}</div>
        <h1 style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.04, letterSpacing: -1.8, margin: 0, maxWidth: 980 }}>
          {title}{titleAccent && <> <span style={{ fontStyle: 'italic', fontWeight: 500, color: FUSION_ACCENT }}>{titleAccent}</span></>}
        </h1>
        {sub && (
          <p style={{ fontSize: 17, lineHeight: 1.55, color: 'rgba(232,230,220,.72)', marginTop: 28, maxWidth: 680 }}>{sub}</p>
        )}
      </div>
    </section>);
}

// ─── BREADCRUMB ─────────────────────────────────────────────
function Breadcrumb({ items }) {
  return (
    <div style={{ background: FUSION_DARK2, padding: '14px 40px', borderTop: '1px solid rgba(232,230,220,.05)',
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, letterSpacing: 1, color: 'rgba(232,230,220,.45)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'center' }}>
        {items.map((it, i) => (
          <React.Fragment key={i}>
            {it.href ?
              <a href={it.href} style={{ color: 'rgba(232,230,220,.6)', textDecoration: 'none' }}>{it.label}</a> :
              <span style={{ color: FUSION_ACCENT }}>{it.label}</span>}
            {i < items.length - 1 && <span style={{ opacity: 0.4 }}>/</span>}
          </React.Fragment>
        ))}
      </div>
    </div>);
}

// ─── DATA ────────────────────────────────────────────────────
const SERVICIOS = [
  { num: '01', titulo: 'Formulación de proyectos de inversión', titulo_en: 'Investment project formulation',
    desc: 'Estructuración metodológica (MGA) y radicación en Banco de Proyectos del SGR, DNP y entes territoriales.',
    desc_en: 'Methodological structuring (MGA) and submission to Project Banks at SGR, DNP and territorial levels.',
    detalle: 'Aplicamos la Metodología General Ajustada (MGA) en cada etapa del ciclo: identificación, preparación, evaluación y programación. Radicamos directamente en bancos de proyectos del SGR, DNP, y entes territoriales con seguimiento hasta viabilización.',
    detalle_en: 'We apply the Adjusted General Methodology (MGA) at every stage of the cycle: identification, preparation, evaluation and programming. We submit directly to SGR, DNP and territorial project banks with follow-through to viability approval.' },
  { num: '02', titulo: 'Planes de Ordenamiento Territorial', titulo_en: 'Territorial Planning instruments (POT)',
    desc: 'Formulación, revisión y ajuste de POT, PBOT y EOT — con enfoque de determinantes ambientales y gestión del riesgo.',
    desc_en: 'Formulation, review and adjustment of POT, PBOT and EOT — with environmental and risk-management focus.',
    detalle: 'Acompañamos a municipios en la formulación, revisión general y ajustes excepcionales de sus instrumentos de planificación territorial, integrando determinantes ambientales, gestión del riesgo y enfoque diferencial.',
    detalle_en: 'We support municipalities in the formulation, general review and exceptional adjustments of their territorial planning instruments, integrating environmental determinants, risk management and a differential approach.' },
  { num: '03', titulo: 'Evaluación ambiental', titulo_en: 'Environmental assessment',
    desc: 'Estudios de Impacto Ambiental (EIA), Planes de Manejo (PMA) y acompañamiento en procesos de licenciamiento ante la ANLA y CARs.',
    desc_en: 'Environmental Impact Assessments (EIA), Management Plans (PMA) and licensing support before ANLA and CARs.',
    detalle: 'EIA, PMA, DAA y acompañamiento técnico en trámites de licenciamiento, modificación y seguimiento ante ANLA y Corporaciones Autónomas Regionales.',
    detalle_en: 'EIA, PMA, DAA and technical support in licensing procedures, modifications and monitoring before ANLA and Regional Autonomous Corporations.' },
  { num: '04', titulo: 'Planes de gestión del riesgo', titulo_en: 'Risk management plans',
    desc: 'Formulación de PMGRD municipales y departamentales con análisis de amenaza, vulnerabilidad y medidas de reducción.',
    desc_en: 'Municipal and departmental PMGRD with hazard, vulnerability and reduction-measures analysis.',
    detalle: 'Análisis de amenazas hidrometeorológicas, geotécnicas y antrópicas. Caracterización de vulnerabilidad y diseño de estrategias de conocimiento, reducción y manejo del desastre.',
    detalle_en: 'Analysis of hydrometeorological, geotechnical and anthropic hazards. Vulnerability characterization and design of knowledge, reduction and disaster-management strategies.' },
  { num: '05', titulo: 'Participación ciudadana', titulo_en: 'Citizen participation',
    desc: 'Diseño e implementación de procesos participativos, mesas de trabajo y consulta previa con comunidades étnicas.',
    desc_en: 'Design and implementation of participatory processes, working tables and prior consultation with ethnic communities.',
    detalle: 'Diseño metodológico, facilitación de mesas, talleres territoriales y procesos de consulta previa con comunidades indígenas, afrodescendientes y campesinas.',
    detalle_en: 'Methodological design, facilitation of working tables, territorial workshops and prior consultation processes with indigenous, Afro-descendant and peasant communities.' },
  { num: '06', titulo: 'Planes de desarrollo municipales', titulo_en: 'Municipal development plans',
    desc: 'Formulación, armonización y seguimiento de Planes de Desarrollo Municipal (PDM) alineados con instrumentos superiores.',
    desc_en: 'Formulation, harmonization and monitoring of Municipal Development Plans aligned with higher-level instruments.',
    detalle: 'Formulación de PDM en armonía con el Plan Nacional de Desarrollo, ODS, Plan Departamental y POT vigente. Tablero de indicadores y seguimiento al plan plurianual de inversiones.',
    detalle_en: 'PDM formulation aligned with the National Development Plan, SDGs, Departmental Plan and current POT. Indicator dashboards and multi-year investment-plan monitoring.' },
  { num: '07', titulo: 'Asesoría a entes territoriales', titulo_en: 'Advisory to local governments',
    desc: 'Acompañamiento técnico a alcaldías y gobernaciones en diagnóstico, priorización y gestión de recursos.',
    desc_en: 'Technical support to municipalities and departments in diagnosis, prioritization and resource management.',
    detalle: 'Asesoría continua a despachos, secretarías y oficinas de planeación. Estructuración de portafolios, búsqueda de cofinanciación y articulación con cooperación internacional.',
    detalle_en: 'Continuous advisory to mayoral offices, secretariats and planning departments. Portfolio structuring, co-financing search and articulation with international cooperation.' }];

const CRONOLOGIA = [
  { fecha: 'Marzo 2024', fecha_en: 'March 2024', estado: 'hito',
    titulo: 'Constitución de OTS S.A.S', titulo_en: 'OTS S.A.S incorporation',
    desc: 'La firma se constituye formalmente con foco en consultoría ambiental y ordenamiento territorial.',
    desc_en: 'The firm is formally incorporated with a focus on environmental and territorial-planning consulting.' },
  { fecha: '2024 · Q2–Q3', fecha_en: '2024 · Q2–Q3', estado: 'en-curso',
    titulo: 'Participación en convocatoria de Macroproyectos', titulo_en: 'First Macroprojects call participation',
    desc: 'Primera participación en convocatoria del Ministerio de Ambiente y Desarrollo Sostenible para Macroproyectos de inversión ambiental.',
    desc_en: 'First participation in the Ministry of Environment national call for environmental investment Macroprojects.' },
  { fecha: '2024 · Q4', fecha_en: '2024 · Q4', estado: 'en-curso',
    titulo: 'Propuesta técnica — Alcaldía de Mariquita (Tolima)', titulo_en: 'Technical proposal — Mariquita (Tolima)',
    desc: 'Radicación de propuesta de trabajo para instrumentos de planificación territorial en el municipio.',
    desc_en: 'Submission of a work proposal for territorial planning instruments in the municipality.' },
  { fecha: '2025 · Q1', fecha_en: '2025 · Q1', estado: 'en-curso',
    titulo: 'Propuestas — Prado, Campoalegre, Paicol, San Agustín', titulo_en: 'Proposals — Prado, Campoalegre, Paicol, San Agustín',
    desc: 'Presentación de propuestas técnicas a cuatro alcaldías del Tolima y Huila para formulación de instrumentos de OT y PMGRD.',
    desc_en: 'Technical proposals submitted to four municipalities across Tolima and Huila for OT and PMGRD instruments.' },
  { fecha: '2025 · Q3', fecha_en: '2025 · Q3', estado: 'en-curso',
    titulo: 'Segunda convocatoria — Macroproyectos MinAmbiente', titulo_en: 'Second Macroprojects call — MinAmbiente',
    desc: 'Segunda participación en convocatoria nacional, consolidando capacidad técnica y portafolio institucional.',
    desc_en: 'Second participation in the national call, consolidating technical capacity and institutional portfolio.' },
  { fecha: 'Hoy', fecha_en: 'Today', estado: 'presente',
    titulo: 'Pipeline activo', titulo_en: 'Active pipeline',
    desc: 'Varias propuestas en evaluación y gestiones comerciales en curso. Abiertos a nuevas convocatorias y alianzas.',
    desc_en: 'Several proposals under evaluation and commercial engagements in progress. Open to new calls and partnerships.' }];

const METODOLOGIA = [
  { fase: '01', nombre: 'Diagnóstico', nombre_en: 'Diagnosis',
    desc: 'Caracterización biofísica, socioeconómica e institucional del territorio. Análisis de instrumentos vigentes.',
    desc_en: 'Biophysical, socioeconomic and institutional characterization. Review of existing instruments.' },
  { fase: '02', nombre: 'Formulación', nombre_en: 'Formulation',
    desc: 'Construcción participativa de objetivos, estrategias, programas y proyectos con enfoque diferencial.',
    desc_en: 'Participatory construction of objectives, strategies, programs and projects with a differential approach.' },
  { fase: '03', nombre: 'Estructuración', nombre_en: 'Structuring',
    desc: 'Diseño técnico, financiero y jurídico. Radicación en bancos de proyectos y gestión de recursos.',
    desc_en: 'Technical, financial and legal design. Submission to project banks and resource mobilization.' },
  { fase: '04', nombre: 'Ejecución y evaluación', nombre_en: 'Execution & evaluation',
    desc: 'Acompañamiento en la implementación, seguimiento a indicadores y evaluación ex-post de resultados.',
    desc_en: 'Implementation support, indicator monitoring and ex-post evaluation of results.' }];

const PRINCIPIOS = [
  { t: 'Rigor técnico', t_en: 'Technical rigor',
    d: 'Metodologías oficiales (MGA, DNP, MinAmbiente) y estándares académicos verificables.',
    d_en: 'Official methodologies (MGA, DNP, MinAmbiente) and verifiable academic standards.' },
  { t: 'Enfoque territorial', t_en: 'Territorial focus',
    d: 'Cada territorio es único. Diagnósticos construidos en campo, no en escritorio.',
    d_en: 'Each territory is unique. Field-built diagnoses, not desk-built.' },
  { t: 'Sostenibilidad', t_en: 'Sustainability',
    d: 'Los proyectos que formulamos integran las determinantes ambientales como punto de partida.',
    d_en: 'Every project we formulate integrates environmental determinants as its starting point.' },
  { t: 'Transparencia', t_en: 'Transparency',
    d: 'Productos trazables, documentados y entregados en plazos acordados.',
    d_en: 'Traceable, documented outputs delivered on agreed timelines.' }];

// ─── EXPORT TO WINDOW ───────────────────────────────────────
Object.assign(window, {
  FUSION_PRIMARY, FUSION_ACCENT, FUSION_BG, FUSION_DARK, FUSION_DARK2, FUSION_INK_LIGHT,
  FusionMark, FusionLockup, Header, Footer, useLang, PageHero, Breadcrumb,
  SERVICIOS, CRONOLOGIA, METODOLOGIA, PRINCIPIOS
});

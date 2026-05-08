
// ===== design-canvas.jsx =====

// DesignCanvas.jsx — Figma-ish design canvas wrapper
// Warm gray grid bg + Sections + Artboards + PostIt notes.
// Artboards are reorderable (grip-drag), labels/titles are inline-editable,
// and any artboard can be opened in a fullscreen focus overlay (←/→/Esc).
// State persists to a .design-canvas.state.json sidecar via the host
// bridge. No assets, no deps.
//
// Usage:
//   <DesignCanvas>
//     <DCSection id="onboarding" title="Onboarding" subtitle="First-run variants">
//       <DCArtboard id="a" label="A · Dusk" width={260} height={480}>…</DCArtboard>
//       <DCArtboard id="b" label="B · Minimal" width={260} height={480}>…</DCArtboard>
//     </DCSection>
//   </DesignCanvas>

const DC = {
  bg: '#f0eee9',
  grid: 'rgba(0,0,0,0.06)',
  label: 'rgba(60,50,40,0.7)',
  title: 'rgba(40,30,20,0.85)',
  subtitle: 'rgba(60,50,40,0.6)',
  postitBg: '#fef4a8',
  postitText: '#5a4a2a',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
};

// One-time CSS injection (classes are dc-prefixed so they don't collide with
// the hosted design's own styles).
if (typeof document !== 'undefined' && !document.getElementById('dc-styles')) {
  const s = document.createElement('style');
  s.id = 'dc-styles';
  s.textContent = [
    '.dc-editable{cursor:text;outline:none;white-space:nowrap;border-radius:3px;padding:0 2px;margin:0 -2px}',
    '.dc-editable:focus{background:#fff;box-shadow:0 0 0 1.5px #c96442}',
    '[data-dc-slot]{transition:transform .18s cubic-bezier(.2,.7,.3,1)}',
    '[data-dc-slot].dc-dragging{transition:none;z-index:10;pointer-events:none}',
    '[data-dc-slot].dc-dragging .dc-card{box-shadow:0 12px 40px rgba(0,0,0,.25),0 0 0 2px #c96442;transform:scale(1.02)}',
    '.dc-card{transition:box-shadow .15s,transform .15s}',
    '.dc-card *{scrollbar-width:none}',
    '.dc-card *::-webkit-scrollbar{display:none}',
    '.dc-labelrow{display:flex;align-items:center;gap:4px;height:24px}',
    '.dc-grip{cursor:grab;display:flex;align-items:center;padding:5px 4px;border-radius:4px;transition:background .12s}',
    '.dc-grip:hover{background:rgba(0,0,0,.08)}',
    '.dc-grip:active{cursor:grabbing}',
    '.dc-labeltext{cursor:pointer;border-radius:4px;padding:3px 6px;display:flex;align-items:center;transition:background .12s}',
    '.dc-labeltext:hover{background:rgba(0,0,0,.05)}',
    '.dc-expand{position:absolute;bottom:100%;right:0;margin-bottom:5px;z-index:2;opacity:0;transition:opacity .12s,background .12s;',
    '  width:22px;height:22px;border-radius:5px;border:none;cursor:pointer;padding:0;',
    '  background:transparent;color:rgba(60,50,40,.7);display:flex;align-items:center;justify-content:center}',
    '.dc-expand:hover{background:rgba(0,0,0,.06);color:#2a251f}',
    '[data-dc-slot]:hover .dc-expand{opacity:1}',
  ].join('\n');
  document.head.appendChild(s);
}

const DCCtx = React.createContext(null);

// ─────────────────────────────────────────────────────────────
// DesignCanvas — stateful wrapper around the pan/zoom viewport.
// Owns runtime state (per-section order, renamed titles/labels, focused
// artboard). Order/titles/labels persist to a .design-canvas.state.json
// sidecar next to the HTML. Reads go via plain fetch() so the saved
// arrangement is visible anywhere the HTML + sidecar are served together
// (omelette preview, direct link, downloaded zip). Writes go through the
// host's window.omelette bridge — editing requires the omelette runtime.
// Focus is ephemeral.
// ─────────────────────────────────────────────────────────────
const DC_STATE_FILE = '.design-canvas.state.json';

function DesignCanvas({ children, minScale, maxScale, style }) {
  const [state, setState] = React.useState({ sections: {}, focus: null });
  // Hold rendering until the sidecar read settles so the saved order/titles
  // appear on first paint (no source-order flash). didRead gates writes until
  // the read settles so the empty initial state can't clobber a slow read;
  // skipNextWrite suppresses the one echo-write that would otherwise follow
  // hydration.
  const [ready, setReady] = React.useState(false);
  const didRead = React.useRef(false);
  const skipNextWrite = React.useRef(false);

  React.useEffect(() => {
    let off = false;
    fetch('./' + DC_STATE_FILE)
      .then((r) => (r.ok ? r.json() : null))
      .then((saved) => {
        if (off || !saved || !saved.sections) return;
        skipNextWrite.current = true;
        setState((s) => ({ ...s, sections: saved.sections }));
      })
      .catch(() => {})
      .finally(() => { didRead.current = true; if (!off) setReady(true); });
    const t = setTimeout(() => { if (!off) setReady(true); }, 150);
    return () => { off = true; clearTimeout(t); };
  }, []);

  React.useEffect(() => {
    if (!didRead.current) return;
    if (skipNextWrite.current) { skipNextWrite.current = false; return; }
    const t = setTimeout(() => {
      window.omelette?.writeFile(DC_STATE_FILE, JSON.stringify({ sections: state.sections })).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [state.sections]);

  // Build registries synchronously from children so FocusOverlay can read
  // them in the same render. Only direct DCSection > DCArtboard children are
  // walked — wrapping them in other elements opts out of focus/reorder.
  const registry = {};     // slotId -> { sectionId, artboard }
  const sectionMeta = {};  // sectionId -> { title, subtitle, slotIds[] }
  const sectionOrder = [];
  React.Children.forEach(children, (sec) => {
    if (!sec || sec.type !== DCSection) return;
    const sid = sec.props.id ?? sec.props.title;
    if (!sid) return;
    sectionOrder.push(sid);
    const persisted = state.sections[sid] || {};
    const srcIds = [];
    React.Children.forEach(sec.props.children, (ab) => {
      if (!ab || ab.type !== DCArtboard) return;
      const aid = ab.props.id ?? ab.props.label;
      if (!aid) return;
      registry[`${sid}/${aid}`] = { sectionId: sid, artboard: ab };
      srcIds.push(aid);
    });
    const kept = (persisted.order || []).filter((k) => srcIds.includes(k));
    sectionMeta[sid] = {
      title: persisted.title ?? sec.props.title,
      subtitle: sec.props.subtitle,
      slotIds: [...kept, ...srcIds.filter((k) => !kept.includes(k))],
    };
  });

  const api = React.useMemo(() => ({
    state,
    section: (id) => state.sections[id] || {},
    patchSection: (id, p) => setState((s) => ({
      ...s,
      sections: { ...s.sections, [id]: { ...s.sections[id], ...(typeof p === 'function' ? p(s.sections[id] || {}) : p) } },
    })),
    setFocus: (slotId) => setState((s) => ({ ...s, focus: slotId })),
  }), [state]);

  // Esc exits focus; any outside pointerdown commits an in-progress rename.
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') api.setFocus(null); };
    const onPd = (e) => {
      const ae = document.activeElement;
      if (ae && ae.isContentEditable && !ae.contains(e.target)) ae.blur();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPd, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPd, true);
    };
  }, [api]);

  return (
    <DCCtx.Provider value={api}>
      <DCViewport minScale={minScale} maxScale={maxScale} style={style}>{ready && children}</DCViewport>
      {state.focus && registry[state.focus] && (
        <DCFocusOverlay entry={registry[state.focus]} sectionMeta={sectionMeta} sectionOrder={sectionOrder} />
      )}
    </DCCtx.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
// DCViewport — transform-based pan/zoom (internal)
//
// Input mapping (Figma-style):
//   • trackpad pinch  → zoom   (ctrlKey wheel; Safari gesture* events)
//   • trackpad scroll → pan    (two-finger)
//   • mouse wheel     → zoom   (notched; distinguished from trackpad scroll)
//   • middle-drag / primary-drag-on-bg → pan
//
// Transform state lives in a ref and is written straight to the DOM
// (translate3d + will-change) so wheel ticks don't go through React —
// keeps pans at 60fps on dense canvases.
// ─────────────────────────────────────────────────────────────
function DCViewport({ children, minScale = 0.1, maxScale = 8, style = {} }) {
  const vpRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const tf = React.useRef({ x: 0, y: 0, scale: 1 });

  const apply = React.useCallback(() => {
    const { x, y, scale } = tf.current;
    const el = worldRef.current;
    if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }, []);

  React.useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;

    const zoomAt = (cx, cy, factor) => {
      const r = vp.getBoundingClientRect();
      const px = cx - r.left, py = cy - r.top;
      const t = tf.current;
      const next = Math.min(maxScale, Math.max(minScale, t.scale * factor));
      const k = next / t.scale;
      // keep the world point under the cursor fixed
      t.x = px - (px - t.x) * k;
      t.y = py - (py - t.y) * k;
      t.scale = next;
      apply();
    };

    // Mouse-wheel vs trackpad-scroll heuristic. A physical wheel sends
    // line-mode deltas (Firefox) or large integer pixel deltas with no X
    // component (Chrome/Safari, typically multiples of 100/120). Trackpad
    // two-finger scroll sends small/fractional pixel deltas, often with
    // non-zero deltaX. ctrlKey is set by the browser for trackpad pinch.
    const isMouseWheel = (e) =>
      e.deltaMode !== 0 ||
      (e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40);

    const onWheel = (e) => {
      e.preventDefault();
      if (isGesturing) return; // Safari: gesture* owns the pinch — discard concurrent wheels
      if (e.ctrlKey) {
        // trackpad pinch (or explicit ctrl+wheel)
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else if (isMouseWheel(e)) {
        // notched mouse wheel — fixed-ratio step per click
        zoomAt(e.clientX, e.clientY, Math.exp(-Math.sign(e.deltaY) * 0.18));
      } else {
        // trackpad two-finger scroll — pan
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
    };

    // Safari sends native gesture* events for trackpad pinch with a smooth
    // e.scale; preferring these over the ctrl+wheel fallback gives a much
    // better feel there. No-ops on other browsers. Safari also fires
    // ctrlKey wheel events during the same pinch — isGesturing makes
    // onWheel drop those entirely so they neither zoom nor pan.
    let gsBase = 1;
    let isGesturing = false;
    const onGestureStart = (e) => { e.preventDefault(); isGesturing = true; gsBase = tf.current.scale; };
    const onGestureChange = (e) => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, (gsBase * e.scale) / tf.current.scale);
    };
    const onGestureEnd = (e) => { e.preventDefault(); isGesturing = false; };

    // Drag-pan: middle button anywhere, or primary button on canvas
    // background (anything that isn't an artboard or an inline editor).
    let drag = null;
    const onPointerDown = (e) => {
      const onBg = !e.target.closest('[data-dc-slot], .dc-editable');
      if (!(e.button === 1 || (e.button === 0 && onBg))) return;
      e.preventDefault();
      vp.setPointerCapture(e.pointerId);
      drag = { id: e.pointerId, lx: e.clientX, ly: e.clientY };
      vp.style.cursor = 'grabbing';
    };
    const onPointerMove = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      tf.current.x += e.clientX - drag.lx;
      tf.current.y += e.clientY - drag.ly;
      drag.lx = e.clientX; drag.ly = e.clientY;
      apply();
    };
    const onPointerUp = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      vp.releasePointerCapture(e.pointerId);
      drag = null;
      vp.style.cursor = '';
    };

    vp.addEventListener('wheel', onWheel, { passive: false });
    vp.addEventListener('gesturestart', onGestureStart, { passive: false });
    vp.addEventListener('gesturechange', onGestureChange, { passive: false });
    vp.addEventListener('gestureend', onGestureEnd, { passive: false });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('gesturestart', onGestureStart);
      vp.removeEventListener('gesturechange', onGestureChange);
      vp.removeEventListener('gestureend', onGestureEnd);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
    };
  }, [apply, minScale, maxScale]);

  const gridSvg = `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M120 0H0v120' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='1'/%3E%3C/svg%3E")`;
  return (
    <div
      ref={vpRef}
      className="design-canvas"
      style={{
        height: '100vh', width: '100vw',
        background: DC.bg,
        overflow: 'hidden',
        overscrollBehavior: 'none',
        touchAction: 'none',
        position: 'relative',
        fontFamily: DC.font,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <div
        ref={worldRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          transformOrigin: '0 0',
          willChange: 'transform',
          width: 'max-content', minWidth: '100%',
          minHeight: '100%',
          padding: '60px 0 80px',
        }}
      >
        <div style={{ position: 'absolute', inset: -6000, backgroundImage: gridSvg, backgroundSize: '120px 120px', pointerEvents: 'none', zIndex: -1 }} />
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DCSection — editable title + h-row of artboards in persisted order
// ─────────────────────────────────────────────────────────────
function DCSection({ id, title, subtitle, children, gap = 48 }) {
  const ctx = React.useContext(DCCtx);
  const sid = id ?? title;
  const all = React.Children.toArray(children);
  const artboards = all.filter((c) => c && c.type === DCArtboard);
  const rest = all.filter((c) => !(c && c.type === DCArtboard));
  const srcOrder = artboards.map((a) => a.props.id ?? a.props.label);
  const sec = (ctx && sid && ctx.section(sid)) || {};

  const order = React.useMemo(() => {
    const kept = (sec.order || []).filter((k) => srcOrder.includes(k));
    return [...kept, ...srcOrder.filter((k) => !kept.includes(k))];
  }, [sec.order, srcOrder.join('|')]);

  const byId = Object.fromEntries(artboards.map((a) => [a.props.id ?? a.props.label, a]));

  return (
    <div data-dc-section={sid} style={{ marginBottom: 80, position: 'relative' }}>
      <div style={{ padding: '0 60px 56px' }}>
        <DCEditable tag="div" value={sec.title ?? title}
          onChange={(v) => ctx && sid && ctx.patchSection(sid, { title: v })}
          style={{ fontSize: 28, fontWeight: 600, color: DC.title, letterSpacing: -0.4, marginBottom: 6, display: 'inline-block' }} />
        {subtitle && <div style={{ fontSize: 16, color: DC.subtitle }}>{subtitle}</div>}
      </div>
      <div style={{ display: 'flex', gap, padding: '0 60px', alignItems: 'flex-start', width: 'max-content' }}>
        {order.map((k) => (
          <DCArtboardFrame key={k} sectionId={sid} artboard={byId[k]} order={order}
            label={(sec.labels || {})[k] ?? byId[k].props.label}
            onRename={(v) => ctx && ctx.patchSection(sid, (x) => ({ labels: { ...x.labels, [k]: v } }))}
            onReorder={(next) => ctx && ctx.patchSection(sid, { order: next })}
            onFocus={() => ctx && ctx.setFocus(`${sid}/${k}`)} />
        ))}
      </div>
      {rest}
    </div>
  );
}

// DCArtboard — marker; rendered by DCArtboardFrame via DCSection.
function DCArtboard() { return null; }

function DCArtboardFrame({ sectionId, artboard, label, order, onRename, onReorder, onFocus }) {
  const { id: rawId, label: rawLabel, width = 260, height = 480, children, style = {} } = artboard.props;
  const id = rawId ?? rawLabel;
  const ref = React.useRef(null);

  // Live drag-reorder: dragged card sticks to cursor; siblings slide into
  // their would-be slots in real time via transforms. DOM order only
  // changes on drop.
  const onGripDown = (e) => {
    e.preventDefault(); e.stopPropagation();
    const me = ref.current;
    // translateX is applied in local (pre-scale) space but pointer deltas and
    // getBoundingClientRect().left are screen-space — divide by the viewport's
    // current scale so the dragged card tracks the cursor at any zoom level.
    const scale = me.getBoundingClientRect().width / me.offsetWidth || 1;
    const peers = Array.from(document.querySelectorAll(`[data-dc-section="${sectionId}"] [data-dc-slot]`));
    const homes = peers.map((el) => ({ el, id: el.dataset.dcSlot, x: el.getBoundingClientRect().left }));
    const slotXs = homes.map((h) => h.x);
    const startIdx = order.indexOf(id);
    const startX = e.clientX;
    let liveOrder = order.slice();
    me.classList.add('dc-dragging');

    const layout = () => {
      for (const h of homes) {
        if (h.id === id) continue;
        const slot = liveOrder.indexOf(h.id);
        h.el.style.transform = `translateX(${(slotXs[slot] - h.x) / scale}px)`;
      }
    };

    const move = (ev) => {
      const dx = ev.clientX - startX;
      me.style.transform = `translateX(${dx / scale}px)`;
      const cur = homes[startIdx].x + dx;
      let nearest = 0, best = Infinity;
      for (let i = 0; i < slotXs.length; i++) {
        const d = Math.abs(slotXs[i] - cur);
        if (d < best) { best = d; nearest = i; }
      }
      if (liveOrder.indexOf(id) !== nearest) {
        liveOrder = order.filter((k) => k !== id);
        liveOrder.splice(nearest, 0, id);
        layout();
      }
    };

    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      const finalSlot = liveOrder.indexOf(id);
      me.classList.remove('dc-dragging');
      me.style.transform = `translateX(${(slotXs[finalSlot] - homes[startIdx].x) / scale}px)`;
      // After the settle transition, kill transitions + clear transforms +
      // commit the reorder in the same frame so there's no visual snap-back.
      setTimeout(() => {
        for (const h of homes) { h.el.style.transition = 'none'; h.el.style.transform = ''; }
        if (liveOrder.join('|') !== order.join('|')) onReorder(liveOrder);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          for (const h of homes) h.el.style.transition = '';
        }));
      }, 180);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };

  return (
    <div ref={ref} data-dc-slot={id} style={{ position: 'relative', flexShrink: 0 }}>
      <div className="dc-labelrow" style={{ position: 'absolute', bottom: '100%', left: -4, marginBottom: 4, color: DC.label }}>
        <div className="dc-grip" onPointerDown={onGripDown} title="Drag to reorder">
          <svg width="9" height="13" viewBox="0 0 9 13" fill="currentColor"><circle cx="2" cy="2" r="1.1"/><circle cx="7" cy="2" r="1.1"/><circle cx="2" cy="6.5" r="1.1"/><circle cx="7" cy="6.5" r="1.1"/><circle cx="2" cy="11" r="1.1"/><circle cx="7" cy="11" r="1.1"/></svg>
        </div>
        <div className="dc-labeltext" onClick={onFocus} title="Click to focus">
          <DCEditable value={label} onChange={onRename} onClick={(e) => e.stopPropagation()}
            style={{ fontSize: 15, fontWeight: 500, color: DC.label, lineHeight: 1 }} />
        </div>
      </div>
      <button className="dc-expand" onClick={onFocus} onPointerDown={(e) => e.stopPropagation()} title="Focus">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M7 1h4v4M5 11H1V7M11 1L7.5 4.5M1 11l3.5-3.5"/></svg>
      </button>
      <div className="dc-card"
        style={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)', overflow: 'hidden', width, height, background: '#fff', ...style }}>
        {children || <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 13, fontFamily: DC.font }}>{id}</div>}
      </div>
    </div>
  );
}

// Inline rename — commits on blur or Enter.
function DCEditable({ value, onChange, style, tag = 'span', onClick }) {
  const T = tag;
  return (
    <T className="dc-editable" contentEditable suppressContentEditableWarning
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      onBlur={(e) => onChange && onChange(e.currentTarget.textContent)}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
      style={style}>{value}</T>
  );
}

// ─────────────────────────────────────────────────────────────
// Focus mode — overlay one artboard; ←/→ within section, ↑/↓ across
// sections, Esc or backdrop click to exit.
// ─────────────────────────────────────────────────────────────
function DCFocusOverlay({ entry, sectionMeta, sectionOrder }) {
  const ctx = React.useContext(DCCtx);
  const { sectionId, artboard } = entry;
  const sec = ctx.section(sectionId);
  const meta = sectionMeta[sectionId];
  const peers = meta.slotIds;
  const aid = artboard.props.id ?? artboard.props.label;
  const idx = peers.indexOf(aid);
  const secIdx = sectionOrder.indexOf(sectionId);

  const go = (d) => { const n = peers[(idx + d + peers.length) % peers.length]; if (n) ctx.setFocus(`${sectionId}/${n}`); };
  const goSection = (d) => {
    const ns = sectionOrder[(secIdx + d + sectionOrder.length) % sectionOrder.length];
    const first = sectionMeta[ns] && sectionMeta[ns].slotIds[0];
    if (first) ctx.setFocus(`${ns}/${first}`);
  };

  React.useEffect(() => {
    const k = (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); goSection(-1); }
      if (e.key === 'ArrowDown') { e.preventDefault(); goSection(1); }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  });

  const { width = 260, height = 480, children } = artboard.props;
  const [vp, setVp] = React.useState({ w: window.innerWidth, h: window.innerHeight });
  React.useEffect(() => { const r = () => setVp({ w: window.innerWidth, h: window.innerHeight }); window.addEventListener('resize', r); return () => window.removeEventListener('resize', r); }, []);
  const scale = Math.max(0.1, Math.min((vp.w - 200) / width, (vp.h - 260) / height, 2));

  const [ddOpen, setDd] = React.useState(false);
  const Arrow = ({ dir, onClick }) => (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{ position: 'absolute', top: '50%', [dir]: 28, transform: 'translateY(-50%)',
        border: 'none', background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.9)',
        width: 44, height: 44, borderRadius: 22, fontSize: 18, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.18)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.08)')}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d={dir === 'left' ? 'M11 3L5 9l6 6' : 'M7 3l6 6-6 6'} /></svg>
    </button>
  );

  // Portal to body so position:fixed is the real viewport regardless of any
  // transform on DesignCanvas's ancestors (including the canvas zoom itself).
  return ReactDOM.createPortal(
    <div onClick={() => ctx.setFocus(null)}
      onWheel={(e) => e.preventDefault()}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(24,20,16,.6)', backdropFilter: 'blur(14px)',
        fontFamily: DC.font, color: '#fff' }}>

      {/* top bar: section dropdown (left) · close (right) */}
      <div onClick={(e) => e.stopPropagation()}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 72, display: 'flex', alignItems: 'flex-start', padding: '16px 20px 0', gap: 16 }}>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setDd((o) => !o)}
            style={{ border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', padding: '6px 8px',
              borderRadius: 6, textAlign: 'left', fontFamily: 'inherit' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.3 }}>{meta.title}</span>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ opacity: .7 }}><path d="M2 4l3.5 3.5L9 4"/></svg>
            </span>
            {meta.subtitle && <span style={{ display: 'block', fontSize: 13, opacity: .6, fontWeight: 400, marginTop: 2 }}>{meta.subtitle}</span>}
          </button>
          {ddOpen && (
            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#2a251f', borderRadius: 8,
              boxShadow: '0 8px 32px rgba(0,0,0,.4)', padding: 4, minWidth: 200, zIndex: 10 }}>
              {sectionOrder.map((sid) => (
                <button key={sid} onClick={() => { setDd(false); const f = sectionMeta[sid].slotIds[0]; if (f) ctx.setFocus(`${sid}/${f}`); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                    background: sid === sectionId ? 'rgba(255,255,255,.1)' : 'transparent', color: '#fff',
                    padding: '8px 12px', borderRadius: 5, fontSize: 14, fontWeight: sid === sectionId ? 600 : 400, fontFamily: 'inherit' }}>
                  {sectionMeta[sid].title}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={() => ctx.setFocus(null)}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.12)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          style={{ border: 'none', background: 'transparent', color: 'rgba(255,255,255,.7)', width: 32, height: 32,
            borderRadius: 16, fontSize: 20, cursor: 'pointer', lineHeight: 1, transition: 'background .12s' }}>×</button>
      </div>

      {/* card centered, label + index below — only the card itself stops
          propagation so any backdrop click (including the margins around
          the card) exits focus */}
      <div
        style={{ position: 'absolute', top: 64, bottom: 56, left: 100, right: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: width * scale, height: height * scale, position: 'relative' }}>
          <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left', background: '#fff', borderRadius: 2, overflow: 'hidden',
            boxShadow: '0 20px 80px rgba(0,0,0,.4)' }}>
            {children || <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb' }}>{aid}</div>}
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()} style={{ fontSize: 14, fontWeight: 500, opacity: .85, textAlign: 'center' }}>
          {(sec.labels || {})[aid] ?? artboard.props.label}
          <span style={{ opacity: .5, marginLeft: 10, fontVariantNumeric: 'tabular-nums' }}>{idx + 1} / {peers.length}</span>
        </div>
      </div>

      <Arrow dir="left" onClick={() => go(-1)} />
      <Arrow dir="right" onClick={() => go(1)} />

      {/* dots */}
      <div onClick={(e) => e.stopPropagation()}
        style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
        {peers.map((p, i) => (
          <button key={p} onClick={() => ctx.setFocus(`${sectionId}/${p}`)}
            style={{ border: 'none', padding: 0, cursor: 'pointer', width: 6, height: 6, borderRadius: 3,
              background: i === idx ? '#fff' : 'rgba(255,255,255,.3)' }} />
        ))}
      </div>
    </div>,
    document.body,
  );
}

// ─────────────────────────────────────────────────────────────
// Post-it — absolute-positioned sticky note
// ─────────────────────────────────────────────────────────────
function DCPostIt({ children, top, left, right, bottom, rotate = -2, width = 180 }) {
  return (
    <div style={{
      position: 'absolute', top, left, right, bottom, width,
      background: DC.postitBg, padding: '14px 16px',
      fontFamily: '"Comic Sans MS", "Marker Felt", "Segoe Print", cursive',
      fontSize: 14, lineHeight: 1.4, color: DC.postitText,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      transform: `rotate(${rotate}deg)`,
      zIndex: 5,
    }}>{children}</div>
  );
}

Object.assign(window, { DesignCanvas, DCSection, DCArtboard, DCPostIt });



// ===== logos/logo-01-topografia.jsx =====
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


// ===== logos/logo-02-cuenca.jsx =====
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


// ===== logos/logo-03-monograma.jsx =====
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


// ===== logos/logo-04-semilla.jsx =====
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


// ===== logos/logo-05-sello.jsx =====
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


// ===== logos/logo-06-horizonte.jsx =====
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


// ===== logos/applications.jsx =====
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


// ===== logos/brand-guide.jsx =====
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


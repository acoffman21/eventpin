// darp3d-mobile.jsx — mobile home page

function DARPMobile({ tweaks, cart, addToCart, openCart }) {
  const t = tweaks;
  const [hero, setHero] = React.useState(0);
  const heroProducts = DARP_PRODUCTS.slice(0, 3);
  const current = heroProducts[hero];
  const [heroColor, setHeroColor] = React.useState(current.colors[0]);
  React.useEffect(() => setHeroColor(heroProducts[hero].colors[0]), [hero]);

  const cartCount = cart.reduce((n, i) => n + i.qty, 0);

  return (
    <div style={{
      width: '100%', minHeight: '100%',
      background: t.bgColor, color: '#1A1A2E',
      fontFamily: '"DM Sans", system-ui, sans-serif',
      position: 'relative', overflow: 'hidden',
      paddingBottom: 100,
    }}>
      <BgBlob color={t.accentA} size={300} top={-80} left={-80} blur={70} opacity={0.55} />
      <BgBlob color={t.accentB} size={240} top={420} left={200} blur={70} opacity={0.5} />

      {/* Top bar */}
      <div style={{ position: 'relative', zIndex: 5, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: `linear-gradient(135deg, ${t.accentA}, ${t.accentB} 60%, ${t.accentC})`,
            position: 'relative',
            boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.4)',
          }}>
            <div style={{ position: 'absolute', inset: 6, borderRadius: 5, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 10, fontFamily: '"Bricolage Grotesque", sans-serif' }}>3D</div>
          </div>
          <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>DARP3D</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={mobIconBtn}><Icon.search s={16} /></button>
          <button onClick={openCart} style={{ ...mobIconBtn, background: t.accentA, color: '#fff', position: 'relative' }}>
            <Icon.cart s={16} />
            {cartCount > 0 && <span style={{
              position: 'absolute', top: -4, right: -4,
              background: t.accentB, color: '#1A1A2E',
              minWidth: 18, height: 18, padding: '0 4px',
              borderRadius: 999, fontSize: 11, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `2px solid ${t.bgColor}`,
            }}>{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 2, padding: '14px 20px 20px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 999,
          background: '#fff', boxShadow: '0 2px 0 rgba(0,0,0,0.08)',
          fontSize: 11, fontWeight: 700,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.accentD }} />
          New drop · Spring '26
        </div>
        <h1 style={{
          fontFamily: '"Bricolage Grotesque", sans-serif',
          fontSize: 52, lineHeight: 0.92, fontWeight: 800, letterSpacing: -1.5,
          margin: '12px 0 0',
        }}>
          Print joy.<br/>
          <span style={{ color: t.accentA }}>Squish</span> the<br/>
          internet.
        </h1>
        <p style={{ marginTop: 14, fontSize: 14, lineHeight: 1.45, color: '#3A3A52', textWrap: 'pretty' }}>
          Bouncy, candy-colored objects printed on demand. Pick a shape, mash a color, get it in 48 hours.
        </p>

        {/* Hero stage */}
        <div style={{
          marginTop: 18, height: 280, borderRadius: 28,
          background: `linear-gradient(160deg, ${lighten(heroColor, 0.55)}, #fff)`,
          position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 24px rgba(58,134,255,0.12)',
        }}>
          <div style={{
            position: 'absolute', width: 220, height: 220, borderRadius: '50%',
            border: `2px dashed ${t.accentA}55`, animation: 'darpRotateRing 30s linear infinite',
          }} />
          <ThreeDObject shape={heroProducts[hero].shape} color={heroColor} size={170} speed={t.spinSpeed} />
          {/* shape switcher */}
          <div style={{
            position: 'absolute', top: 14, left: 14,
            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)',
            borderRadius: 999, padding: 4, display: 'flex', gap: 4,
          }}>
            {[0, 1, 2].map(i => (
              <button key={i} onClick={() => setHero(i)} style={{
                width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: i === hero ? '#1A1A2E' : 'transparent',
                color: i === hero ? '#fff' : '#1A1A2E', fontWeight: 700, fontSize: 12,
              }}>{i + 1}</button>
            ))}
          </div>
        </div>

        {/* Color chips */}
        <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
          {heroProducts[hero].colors.map(c => (
            <button key={c} onClick={() => setHeroColor(c)} style={{
              width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: c,
              boxShadow: c === heroColor
                ? `0 0 0 3px ${t.bgColor}, 0 0 0 5px #1A1A2E`
                : 'inset 0 -3px 5px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.5)',
              transition: 'all .2s',
            }} />
          ))}
        </div>

        <button onClick={() => addToCart({ ...heroProducts[hero], color: heroColor, material: heroProducts[hero].materials[0] })} style={{
          marginTop: 16, width: '100%',
          padding: '16px', borderRadius: 999, border: 'none', cursor: 'pointer',
          background: '#1A1A2E', color: '#fff',
          fontFamily: 'inherit', fontWeight: 700, fontSize: 15,
          boxShadow: '0 5px 0 rgba(0,0,0,0.18), 0 8px 18px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          Add to cart — ${heroProducts[hero].price}
          <Icon.arrow s={16} />
        </button>
      </div>

      {/* Marquee strip */}
      <div style={{
        position: 'relative', zIndex: 2,
        background: '#1A1A2E', color: '#fff',
        padding: '12px 0', overflow: 'hidden',
        transform: 'rotate(-1.5deg)', margin: '8px -10px',
        borderTop: `3px solid ${t.accentB}`, borderBottom: `3px solid ${t.accentB}`,
      }}>
        <div style={{ display: 'flex', gap: 28, animation: 'darpMarquee 18s linear infinite', whiteSpace: 'nowrap',
          fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 15, fontWeight: 700 }}>
          {Array.from({ length: 3 }, (_, k) => ['● 48h ship', '● Made in BK', '● Plant PLA', '● Free returns', '● Squishy'].map((it, i) => (
            <span key={`${k}-${i}`} style={{ color: i % 3 === 1 ? t.accentB : i % 3 === 2 ? t.accentD : '#fff' }}>{it}</span>
          ))).flat()}
        </div>
      </div>

      {/* Section header */}
      <div style={{ position: 'relative', zIndex: 2, padding: '24px 20px 8px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: t.accentA, textTransform: 'uppercase', letterSpacing: 1 }}>Bestsellers</div>
        <h2 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 30, fontWeight: 800, letterSpacing: -0.8, margin: '4px 0 0' }}>
          Squishy, chunky, <em style={{ fontStyle: 'italic', color: t.accentB }}>yours</em>.
        </h2>
      </div>

      {/* Mobile grid */}
      <div style={{ position: 'relative', zIndex: 2, padding: '14px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {DARP_PRODUCTS.map(p => <MobileCard key={p.id} product={p} addToCart={addToCart} t={t} />)}
      </div>

      {/* Process tile */}
      <div style={{ position: 'relative', zIndex: 2, padding: '20px 20px 0' }}>
        <div style={{
          background: '#1A1A2E', borderRadius: 28, padding: 22, color: '#fff',
          position: 'relative', overflow: 'hidden',
        }}>
          <BgBlob color={t.accentA} size={180} top={-60} left={-30} blur={50} opacity={0.55} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.accentD, textTransform: 'uppercase', letterSpacing: 1.1 }}>How it works</div>
            <h3 style={{
              fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 24, fontWeight: 800,
              letterSpacing: -0.5, margin: '4px 0 16px',
            }}>Pixel to plop in three squishy steps.</h3>
            {[['Pick', 'Shape, hue, finish.', t.accentA, <Icon.sparkle s={16} />],
              ['Print', '48h. Plant PLA.', t.accentB, <Icon.printer s={16} />],
              ['Plop', 'Carbon-neutral.', t.accentD, <Icon.truck s={16} />]].map(([n, txt, c, ic], i) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: c,
                  color: i === 1 ? '#1A1A2E' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{ic}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 18, fontWeight: 800 }}>{n}</div>
                  <div style={{ fontSize: 13, opacity: 0.78 }}>{txt}</div>
                </div>
                <div style={{ fontSize: 11, opacity: 0.5, fontWeight: 700 }}>0{i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const mobIconBtn = {
  width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer',
  background: '#fff', color: '#1A1A2E',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 3px 0 rgba(0,0,0,0.1)',
};

function MobileCard({ product, addToCart, t }) {
  const [color, setColor] = React.useState(product.colors[0]);
  const [adding, setAdding] = React.useState(false);
  const onAdd = (e) => {
    e.stopPropagation();
    setAdding(true);
    addToCart({ ...product, color, material: product.materials[0] });
    setTimeout(() => setAdding(false), 700);
  };
  return (
    <div style={{
      background: '#fff', borderRadius: 20, padding: 12,
      boxShadow: '0 4px 12px rgba(58,134,255,0.08)',
    }}>
      <div style={{
        height: 120, borderRadius: 14,
        background: `linear-gradient(160deg, ${lighten(color, 0.6)}, ${t.bgColor})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <ThreeDObject shape={product.shape} color={color} size={86} speed={20} />
        <div style={{
          position: 'absolute', top: 6, left: 6,
          background: t.accentD, color: '#1A1A2E',
          padding: '2px 8px', borderRadius: 999,
          fontSize: 9, fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase',
        }}>{product.tag}</div>
      </div>
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 15, fontWeight: 700, letterSpacing: -0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
          <div style={{ fontSize: 12, fontWeight: 800, marginTop: 2 }}>${product.price}</div>
        </div>
      </div>
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {product.colors.slice(0, 3).map(c => (
            <button key={c} onClick={(e) => { e.stopPropagation(); setColor(c); }} style={{
              width: 16, height: 16, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: c,
              boxShadow: c === color ? `0 0 0 1.5px #fff, 0 0 0 3px #1A1A2E` : 'inset 0 -1px 2px rgba(0,0,0,0.2)',
            }} />
          ))}
        </div>
        <button onClick={onAdd} style={{
          width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: adding ? t.accentD : '#1A1A2E', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 0 rgba(0,0,0,0.18)',
        }}>{adding ? '✓' : <Icon.plus s={14} />}</button>
      </div>
    </div>
  );
}

Object.assign(window, { DARPMobile });

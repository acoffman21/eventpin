// darp3d-desktop.jsx — desktop home page

const DESKTOP_W = 1280;

function DARPDesktop({ tweaks, cart, addToCart, openCart }) {
  const t = tweaks;
  const [hero, setHero] = React.useState(0);
  const heroProducts = DARP_PRODUCTS.slice(0, 3);
  const current = heroProducts[hero];
  const [heroColor, setHeroColor] = React.useState(current.colors[0]);
  const [heroMat, setHeroMat] = React.useState(current.materials[0]);

  React.useEffect(() => {
    setHeroColor(heroProducts[hero].colors[0]);
    setHeroMat(heroProducts[hero].materials[0]);
  }, [hero]);

  return (
    <div style={{
      width: DESKTOP_W,
      background: t.bgColor,
      color: '#1A1A2E',
      fontFamily: '"DM Sans", system-ui, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative blobs */}
      <BgBlob color={t.accentA} size={520} top={-180} left={-120} blur={90} opacity={0.55} />
      <BgBlob color={t.accentB} size={420} top={520} left={DESKTOP_W - 280} blur={100} opacity={0.5} />
      <BgBlob color={t.accentC} size={360} top={1180} left={-100} blur={90} opacity={0.45} />

      {/* Top nav */}
      <DesktopNav cartCount={cart.reduce((n, i) => n + i.qty, 0)} openCart={openCart} t={t} />

      {/* Hero */}
      <DesktopHero
        product={heroProducts[hero]}
        heroColor={heroColor}
        setHeroColor={setHeroColor}
        heroMat={heroMat}
        setHeroMat={setHeroMat}
        hero={hero}
        setHero={setHero}
        heroCount={heroProducts.length}
        addToCart={addToCart}
        t={t} />
      

      {/* Marquee */}
      <Marquee t={t} />

      {/* Featured grid */}
      <FeaturedGrid addToCart={addToCart} t={t} />

      {/* Process / why */}
      <ProcessStrip t={t} />

      {/* Footer */}
      <DesktopFooter t={t} />
    </div>);

}

// ── Top nav ──────────────────────────────────────────────
function DesktopNav({ cartCount, openCart, t }) {
  const [hover, setHover] = React.useState(null);
  const navItems = ['Shop', 'Custom', 'Lookbook', 'About'];
  return (
    <div style={{
      position: 'relative', zIndex: 5,
      padding: '24px 56px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <Logo t={t} />
      <nav style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(14px)',
        padding: 6, borderRadius: 999, border: '1px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 24px rgba(58,134,255,0.08)' }}>
        {navItems.map((n, i) =>
        <a key={n} href="#"
        onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
        style={{
          padding: '10px 22px', borderRadius: 999,
          fontSize: 15, fontWeight: 600, color: hover === i ? '#fff' : '#1A1A2E',
          background: hover === i ? t.accentA : 'transparent',
          textDecoration: 'none', transition: 'all .25s cubic-bezier(.34,1.4,.64,1)',
          transform: hover === i ? 'translateY(-1px)' : 'translateY(0)'
        }}>{n}</a>
        )}
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <SquishyIcon><Icon.search /></SquishyIcon>
        <SquishyIcon><Icon.heart /></SquishyIcon>
        <button onClick={openCart} style={{
          ...squishyBase, position: 'relative',
          background: t.accentA, color: '#fff',
          paddingRight: 18
        }}>
          <Icon.cart /> <span style={{ marginLeft: 6, fontSize: 14, fontWeight: 700 }}>Cart</span>
          {cartCount > 0 && <span style={{
            position: 'absolute', top: -4, right: -4,
            background: t.accentB, color: '#1A1A2E',
            width: 22, height: 22, borderRadius: '50%',
            fontSize: 12, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid ' + t.bgColor
          }}>{cartCount}</span>}
        </button>
      </div>
    </div>);

}

const squishyBase = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  border: 'none', cursor: 'pointer',
  padding: '12px 16px', borderRadius: 999,
  fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
  boxShadow: '0 4px 0 rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08)',
  transition: 'all .15s cubic-bezier(.34,1.6,.64,1)'
};

function SquishyIcon({ children, onClick }) {
  const [press, setPress] = React.useState(false);
  return (
    <button onClick={onClick}
    onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)} onMouseLeave={() => setPress(false)}
    style={{
      ...squishyBase, background: '#fff',
      width: 44, height: 44, padding: 0, justifyContent: 'center',
      color: '#1A1A2E',
      transform: press ? 'translateY(2px) scale(0.96)' : 'translateY(0)',
      boxShadow: press ? '0 1px 0 rgba(0,0,0,0.12)' : squishyBase.boxShadow
    }}>{children}</button>);

}

function Logo({ t }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: `linear-gradient(135deg, ${t.accentA}, ${t.accentB} 60%, ${t.accentC})`,
        boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.18), inset 0 3px 6px rgba(255,255,255,0.4), 0 4px 10px rgba(58,134,255,0.18)',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', inset: 8, borderRadius: 6, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, fontFamily: '"Bricolage Grotesque", sans-serif' }}>3D</div>
      </div>
      <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800, fontSize: 22, letterSpacing: -0.5 }}>DARP3D</div>
    </div>);

}

// ── Hero ─────────────────────────────────────────────────
function DesktopHero({ product, heroColor, setHeroColor, heroMat, setHeroMat, hero, setHero, heroCount, addToCart, t }) {
  const [adding, setAdding] = React.useState(false);
  const onAdd = () => {
    setAdding(true);
    addToCart({ ...product, color: heroColor, material: heroMat });
    setTimeout(() => setAdding(false), 700);
  };
  return (
    <div style={{
      position: 'relative', zIndex: 2,
      padding: '28px 56px 56px',
      display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 40,
      alignItems: 'center'
    }}>
      {/* Left copy */}
      <div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', borderRadius: 999,
          background: '#fff', boxShadow: '0 3px 0 rgba(0,0,0,0.08)',
          fontSize: 13, fontWeight: 600
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.accentD, boxShadow: `0 0 0 4px ${t.accentD}33` }} />
          New drop · Spring '26
        </div>
        <h1 style={{
          fontFamily: '"Bricolage Grotesque", sans-serif',
          fontSize: 96, lineHeight: 0.92,
          fontWeight: 800, letterSpacing: -3,
          margin: '20px 0 0',
          textWrap: 'balance'
        }}>
          Tiny Business<br />
          <span style={{ color: t.accentA }}>EPIC </span> Prints<br />
          <span style={{ color: 'rgb(27, 46, 26)' }}><span style={{ color: 'rgb(96, 183, 91)', fontSize: 50 }}>You dream it, we make it</span></span>
        </h1>
        <p style={{
          marginTop: 22, fontSize: 19, lineHeight: 1.45, maxWidth: 480,
          color: '#3A3A52', textWrap: 'pretty'
        }}>Small 


        </p>
        <div style={{ marginTop: 32, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={onAdd} style={{
            ...squishyBase,
            background: '#1A1A2E', color: '#fff',
            padding: '18px 28px', fontSize: 16,
            transform: adding ? 'translateY(2px) scale(0.97)' : 'translateY(0)',
            boxShadow: adding ? '0 1px 0 rgba(0,0,0,0.12)' : '0 6px 0 rgba(0,0,0,0.18), 0 12px 24px rgba(0,0,0,0.12)'
          }}>
            ✓ Added!
          </button>
          <button style={{
            ...squishyBase, background: '#fff', color: '#1A1A2E',
            padding: '18px 28px', fontSize: 16
          }}>
            Add to cart — $
          </button>
        </div>
        {/* Stats row */}
        <div style={{ marginTop: 40, display: 'flex', gap: 36 }}>
          {[['48h', 'Avg ship time'], ['12k', 'Happy printers'], ['100%', 'Plant-based PLA']].map(([n, l]) =>
          <div key={l}>
              <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800, fontSize: 28, letterSpacing: -0.5 }}>{n}</div>
              <div style={{ fontSize: 13, color: '#5A5A72', fontWeight: 500 }}>{l}</div>
            </div>
          )}
        </div>
      </div>

      {/* Right hero stage */}
      <div style={{ position: 'relative', height: 580, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Concentric rings */}
        <div style={{
          position: 'absolute', width: 480, height: 480, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255,255,255,0.7), rgba(255,255,255,0) 70%)`
        }} />
        <div style={{
          position: 'absolute', width: 380, height: 380, borderRadius: '50%',
          border: `2px dashed ${t.accentA}55`,
          animation: 'darpRotateRing 40s linear infinite'
        }} />
        {/* Floating chips */}
        <FloatingChip text="🚀 48h ship" top={20} left={20} bg="#fff" delay={0} />
        <FloatingChip text="6 colors" top={80} right={10} bg={t.accentB} delay={1.2} />
        <FloatingChip text="Free returns" bottom={120} left={0} bg={t.accentD} delay={0.6} />
        <FloatingChip text="Made by humans + bots" bottom={50} right={20} bg="#fff" delay={1.8} />

        {/* Object */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <ThreeDObject shape={product.shape} color={heroColor} size={300} speed={t.spinSpeed} material={heroMat} />
        </div>

        {/* Picker card */}
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          background: '#fff', borderRadius: 28, padding: 18,
          boxShadow: '0 10px 30px rgba(58,134,255,0.18)',
          display: 'flex', alignItems: 'center', gap: 16,
          minWidth: 460
        }}>
          {/* Hero switcher */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#5A5A72', textTransform: 'uppercase', letterSpacing: 0.6 }}>Shape</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 1, 2].map((i) =>
              <button key={i} onClick={() => setHero(i)} style={{
                width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: i === hero ? '#1A1A2E' : '#F5F5F0',
                color: i === hero ? '#fff' : '#1A1A2E',
                fontWeight: 700, fontSize: 13
              }}>{i + 1}</button>
              )}
            </div>
          </div>
          <div style={{ width: 1, height: 40, background: '#E5E5DD' }} />
          {/* Colors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#5A5A72', textTransform: 'uppercase', letterSpacing: 0.6 }}>Color</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {product.colors.map((c) =>
              <button key={c} onClick={() => setHeroColor(c)} style={{
                width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: c,
                boxShadow: c === heroColor ?
                `0 0 0 3px ${t.bgColor}, 0 0 0 5px #1A1A2E` :
                'inset 0 -3px 5px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.5)',
                transition: 'all .2s',
                transform: c === heroColor ? 'scale(1.05)' : 'scale(1)'
              }} />
              )}
            </div>
          </div>
          <div style={{ width: 1, height: 40, background: '#E5E5DD' }} />
          {/* Material */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#5A5A72', textTransform: 'uppercase', letterSpacing: 0.6 }}>Finish</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {product.materials.map((m) =>
              <button key={m} onClick={() => setHeroMat(m)} style={{
                padding: '6px 10px', borderRadius: 999, border: 'none', cursor: 'pointer',
                background: m === heroMat ? '#1A1A2E' : '#F5F5F0',
                color: m === heroMat ? '#fff' : '#1A1A2E',
                fontWeight: 600, fontSize: 12
              }}>{m}</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>);

}

function FloatingChip({ text, top, left, right, bottom, bg, delay = 0 }) {
  return (
    <div style={{
      position: 'absolute',
      top, left, right, bottom,
      background: bg, color: '#1A1A2E',
      padding: '8px 14px', borderRadius: 999,
      fontSize: 13, fontWeight: 700,
      boxShadow: '0 4px 0 rgba(0,0,0,0.1), 0 6px 14px rgba(0,0,0,0.06)',
      animation: `darpFloat 4s ease-in-out ${delay}s infinite`,
      zIndex: 3
    }}>{text}</div>);

}

// ── Marquee ──────────────────────────────────────────────
function Marquee({ t }) {
  const items = ['● Free shipping over $80', '● Made in Brooklyn', '● 48h turnaround', '● 100% recyclable PLA', '● Custom prints', '● Hug shape included'];
  const all = [...items, ...items, ...items];
  return (
    <div style={{
      position: 'relative', zIndex: 2,
      background: '#1A1A2E', color: '#fff',
      padding: '18px 0', overflow: 'hidden',
      transform: 'rotate(-1.5deg)',
      margin: '20px -30px',
      borderTop: `4px solid ${t.accentB}`, borderBottom: `4px solid ${t.accentB}`
    }}>
      <div style={{ display: 'flex', gap: 40, animation: 'darpMarquee 30s linear infinite', whiteSpace: 'nowrap',
        fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>
        {all.map((it, i) =>
        <span key={i} style={{ color: i % 3 === 1 ? t.accentB : i % 3 === 2 ? t.accentD : '#fff' }}>{it}</span>
        )}
      </div>
    </div>);

}

// ── Featured grid ────────────────────────────────────────
function FeaturedGrid({ addToCart, t }) {
  return (
    <div style={{ position: 'relative', zIndex: 2, padding: '48px 56px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.accentA, textTransform: 'uppercase', letterSpacing: 1.2 }}>Bestsellers</div>
          <h2 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 56, fontWeight: 800, letterSpacing: -1.5, margin: '6px 0 0' }}>
            Squishy, chunky, <em style={{ fontStyle: 'italic', color: t.accentB }}>yours</em>.
          </h2>
        </div>
        <a href="#" style={{
          ...squishyBase, background: '#fff', color: '#1A1A2E',
          textDecoration: 'none', padding: '14px 22px'
        }}>
          See all 124 <Icon.arrow />
        </a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {DARP_PRODUCTS.map((p) => <ProductCard key={p.id} product={p} addToCart={addToCart} t={t} />)}
      </div>
    </div>);

}

function ProductCard({ product, addToCart, t }) {
  const [color, setColor] = React.useState(product.colors[0]);
  const [hover, setHover] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const onAdd = (e) => {
    e.stopPropagation();
    setAdding(true);
    addToCart({ ...product, color, material: product.materials[0] });
    setTimeout(() => setAdding(false), 700);
  };
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      position: 'relative',
      background: '#fff', borderRadius: 28, padding: 22,
      boxShadow: hover ? '0 16px 32px rgba(58,134,255,0.18)' : '0 6px 16px rgba(58,134,255,0.08)',
      transition: 'all .3s cubic-bezier(.34,1.4,.64,1)',
      transform: hover ? 'translateY(-4px)' : 'translateY(0)',
      cursor: 'pointer'
    }}>
      {/* Stage */}
      <div style={{
        height: 220, borderRadius: 20,
        background: `linear-gradient(160deg, ${lighten(color, 0.6)}, ${t.bgColor})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden'
      }}>
        <ThreeDObject shape={product.shape} color={color} size={150} speed={hover ? 6 : 24} paused={false} />
        <button onClick={(e) => e.stopPropagation()} style={{
          position: 'absolute', top: 12, right: 12,
          width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: '#fff', color: '#1A1A2E',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 3px 0 rgba(0,0,0,0.08)'
        }}><Icon.heart s={16} /></button>
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: t.accentD, color: '#1A1A2E',
          padding: '4px 10px', borderRadius: 999,
          fontSize: 11, fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase'
        }}>{product.tag}</div>
      </div>
      {/* Body */}
      <div style={{ marginTop: 18, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>{product.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, color: '#5A5A72', fontSize: 12, fontWeight: 600 }}>
            <span style={{ color: t.accentA }}><Icon.star s={12} /></span>
            <span>4.9 · 312 reviews</span>
          </div>
        </div>
        <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 24, fontWeight: 800 }}>${product.price}</div>
      </div>
      {/* Colors + add */}
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {product.colors.map((c) =>
          <button key={c} onClick={(e) => {e.stopPropagation();setColor(c);}} style={{
            width: 22, height: 22, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: c,
            boxShadow: c === color ? `0 0 0 2px #fff, 0 0 0 4px #1A1A2E` : 'inset 0 -2px 3px rgba(0,0,0,0.2)',
            transition: 'all .2s'
          }} />
          )}
        </div>
        <button onClick={onAdd} style={{
          width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: adding ? t.accentD : '#1A1A2E',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: adding ? '0 2px 0 rgba(0,0,0,0.12)' : '0 4px 0 rgba(0,0,0,0.18)',
          transform: adding ? 'translateY(2px) scale(0.94)' : 'translateY(0)',
          transition: 'all .2s cubic-bezier(.34,1.6,.64,1)'
        }}>{adding ? '✓' : <Icon.plus s={18} />}</button>
      </div>
    </div>);

}

// ── Process strip ────────────────────────────────────────
function ProcessStrip({ t }) {
  const steps = [
  { ic: <Icon.sparkle s={22} />, title: 'Pick', text: 'Choose a shape, hue and finish.' },
  { ic: <Icon.printer s={22} />, title: 'Print', text: 'Plant-based PLA. 48-hour turnaround.' },
  { ic: <Icon.truck s={22} />, title: 'Plop', text: 'Carbon-neutral shipping in compostable foam.' }];

  return (
    <div style={{ position: 'relative', zIndex: 2, padding: '40px 56px 60px' }}>
      <div style={{
        background: '#1A1A2E', borderRadius: 36, padding: '40px 44px',
        position: 'relative', overflow: 'hidden'
      }}>
        <BgBlob color={t.accentA} size={300} top={-100} left={-50} blur={70} opacity={0.6} />
        <BgBlob color={t.accentB} size={260} top={100} left={900} blur={70} opacity={0.5} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.accentD, textTransform: 'uppercase', letterSpacing: 1.2 }}>How it works</div>
          <h3 style={{
            fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 44, fontWeight: 800, letterSpacing: -1,
            color: '#fff', margin: '4px 0 28px', textWrap: 'balance', maxWidth: 600
          }}>From pixel to plop in three squishy steps.</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {steps.map((s, i) =>
            <div key={i} style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 24, padding: 24,
              color: '#fff'
            }}>
                <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: i === 0 ? t.accentA : i === 1 ? t.accentB : t.accentD,
                color: i === 1 ? '#1A1A2E' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 14
              }}>{s.ic}</div>
                <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7, letterSpacing: 1, textTransform: 'uppercase' }}>0{i + 1}</div>
                <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginTop: 4 }}>{s.title}</div>
                <div style={{ fontSize: 14, opacity: 0.78, marginTop: 8, lineHeight: 1.5 }}>{s.text}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>);

}

// ── Footer ───────────────────────────────────────────────
function DesktopFooter({ t }) {
  return (
    <div style={{
      position: 'relative', zIndex: 2,
      padding: '40px 56px 56px',
      display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 30
    }}>
      <div>
        <Logo t={t} />
        <p style={{ marginTop: 14, fontSize: 14, color: '#3A3A52', maxWidth: 320, lineHeight: 1.5 }}>
          Tiny print farm in Brooklyn making big squishy things since 2023. We ship worldwide and hug each box before it leaves.
        </p>
      </div>
      {[
      ['Shop', ['Lamps', 'Vases', 'Toys', 'Tableware', 'Sale']],
      ['Make', ['Configurator', 'Custom prints', 'Bulk orders', 'Designer program']],
      ['Hello', ['Help center', 'Returns', 'Shipping', 'Contact']]].
      map(([h, items]) =>
      <div key={h}>
          <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800, fontSize: 16, marginBottom: 12 }}>{h}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((it) => <a key={it} href="#" style={{ fontSize: 14, color: '#3A3A52', textDecoration: 'none' }}>{it}</a>)}
          </div>
        </div>
      )}
    </div>);

}

Object.assign(window, { DARPDesktop });
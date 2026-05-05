// darp3d-app.jsx — root app, wires everything together

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "bgColor": "#F5F5F0",
  "accentA": "#3A86FF",
  "accentB": "#FB5607",
  "accentC": "#F15BB5",
  "accentD": "#FFBE0B",
  "spinSpeed": 18,
  "showMobile": true
}/*EDITMODE-END*/;

const PALETTES = {
  Candy:   { bgColor: '#F5F5F0', accentA: '#3A86FF', accentB: '#FB5607', accentC: '#F15BB5', accentD: '#FFBE0B' },
  Sherbet: { bgColor: '#FFE8D6', accentA: '#FF6B6B', accentB: '#A2D2FF', accentC: '#FFBE0B', accentD: '#06D6A0' },
  Mint:    { bgColor: '#EAF7EF', accentA: '#06D6A0', accentB: '#F15BB5', accentC: '#3A86FF', accentD: '#FFBE0B' },
  Midnight:{ bgColor: '#1A1A2E', accentA: '#F15BB5', accentB: '#06D6A0', accentC: '#3A86FF', accentD: '#FFBE0B' },
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [cart, setCart] = React.useState([]);
  const [cartOpen, setCartOpen] = React.useState(false);

  const addToCart = React.useCallback((item) => {
    setCart(prev => {
      const found = prev.find(i => i.id === item.id && i.color === item.color);
      if (found) {
        return prev.map(i => i === found ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const tweakProps = t;

  const applyPalette = (name) => {
    const p = PALETTES[name];
    setTweak(p);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#E8E5DA', padding: '40px 24px', boxSizing: 'border-box' }}>
      {/* Stage with desktop + mobile side by side */}
      <div style={{
        display: 'flex', gap: 36, alignItems: 'flex-start', justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        {/* Desktop frame */}
        <div style={{ flexShrink: 0 }}>
          <ChromeWindow
            tabs={[{ title: 'DARP3D — Print joy.' }, { title: 'Cart' }]}
            activeIndex={0}
            url="darp3d.shop"
            width={1280}
            height={1900}
          >
            <div style={{ position: 'relative', width: 1280, height: 1900, overflow: 'auto', background: t.bgColor }}>
              <DARPDesktop tweaks={tweakProps} cart={cart} addToCart={addToCart} openCart={() => setCartOpen(true)} />
              <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} setCart={setCart} t={tweakProps} />
            </div>
          </ChromeWindow>
        </div>

        {/* Mobile frame */}
        {t.showMobile && (
          <div style={{ flexShrink: 0, position: 'sticky', top: 40 }}>
            <IOSDevice width={390} height={844}>
              <div style={{ width: 390, height: 844, overflowY: 'auto', overflowX: 'hidden', background: t.bgColor, position: 'relative' }}>
                <DARPMobile tweaks={tweakProps} cart={cart} addToCart={addToCart} openCart={() => setCartOpen(true)} />
                {/* Mobile cart drawer (lives inside phone) */}
                <MobileCartSheet open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} setCart={setCart} t={tweakProps} />
              </div>
            </IOSDevice>
          </div>
        )}
      </div>

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Palette">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: '0 4px' }}>
            {Object.keys(PALETTES).map(name => (
              <button key={name} onClick={() => applyPalette(name)} style={{
                padding: '8px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: PALETTES[name].bgColor,
                color: name === 'Midnight' ? '#fff' : '#1A1A2E',
                fontWeight: 700, fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
              }}>
                <span>{name}</span>
                <span style={{ display: 'flex', gap: 2 }}>
                  {[PALETTES[name].accentA, PALETTES[name].accentB, PALETTES[name].accentD].map(c => (
                    <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                  ))}
                </span>
              </button>
            ))}
          </div>
        </TweakSection>
        <TweakSection label="Colors">
          <TweakColor label="Background" value={t.bgColor} onChange={(v) => setTweak('bgColor', v)} />
          <TweakColor label="Primary" value={t.accentA} onChange={(v) => setTweak('accentA', v)} />
          <TweakColor label="Secondary" value={t.accentB} onChange={(v) => setTweak('accentB', v)} />
          <TweakColor label="Tertiary" value={t.accentC} onChange={(v) => setTweak('accentC', v)} />
          <TweakColor label="Highlight" value={t.accentD} onChange={(v) => setTweak('accentD', v)} />
        </TweakSection>
        <TweakSection label="3D">
          <TweakSlider label="Spin speed (s)" value={t.spinSpeed} min={4} max={40} step={1} onChange={(v) => setTweak('spinSpeed', v)} />
        </TweakSection>
        <TweakSection label="Layout">
          <TweakToggle label="Show mobile" value={t.showMobile} onChange={(v) => setTweak('showMobile', v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

// Mobile cart sheet — slides up from bottom inside the phone
function MobileCartSheet({ open, onClose, cart, setCart, t }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const updateQty = (id, color, delta) => {
    setCart(prev => prev.flatMap(i => {
      if (i.id === id && i.color === color) {
        const q = i.qty + delta;
        return q <= 0 ? [] : [{ ...i, qty: q }];
      }
      return [i];
    }));
  };
  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, zIndex: 90,
        background: 'rgba(20,20,40,0.4)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity .3s',
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        maxHeight: '85%',
        background: t.bgColor,
        borderRadius: '28px 28px 0 0',
        zIndex: 100,
        transform: open ? 'translateY(0)' : 'translateY(110%)',
        transition: 'transform .35s cubic-bezier(.34,1.3,.64,1)',
        display: 'flex', flexDirection: 'column',
        fontFamily: '"DM Sans", system-ui, sans-serif',
        boxShadow: '0 -10px 30px rgba(20,20,40,0.18)',
      }}>
        <div style={{ padding: '12px 0 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 38, height: 4, borderRadius: 2, background: '#D5D2C8' }} />
        </div>
        <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
            Bag <span style={{ color: t.accentA }}>({cart.length})</span>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: '#fff', boxShadow: '0 2px 0 rgba(0,0,0,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Icon.close s={16} /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 12px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 12px', color: '#5A5A72' }}>
              <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 18, fontWeight: 800, color: '#1A1A2E' }}>Empty bag.</div>
              <div style={{ marginTop: 4, fontSize: 13 }}>Add some squishy stuff!</div>
            </div>
          ) : cart.map(item => (
            <div key={item.id + item.color} style={{
              background: '#fff', borderRadius: 18, padding: 10, marginBottom: 8,
              display: 'flex', gap: 10, alignItems: 'center',
              animation: 'darpPop .35s cubic-bezier(.34,1.6,.64,1)',
            }}>
              <div style={{
                width: 56, height: 56, flexShrink: 0, borderRadius: 12,
                background: `linear-gradient(160deg, ${lighten(item.color, 0.55)}, ${t.bgColor})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ThreeDObject shape={item.shape} color={item.color} size={42} speed={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 14, fontWeight: 700 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: '#5A5A72', marginTop: 1 }}>{item.material}</div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: t.bgColor, borderRadius: 999, padding: 2 }}>
                    <button onClick={() => updateQty(item.id, item.color, -1)} style={{ width: 20, height: 20, borderRadius: '50%', border: 'none', cursor: 'pointer', background: '#fff' }}><Icon.minus s={10} /></button>
                    <div style={{ width: 18, textAlign: 'center', fontSize: 12, fontWeight: 700 }}>{item.qty}</div>
                    <button onClick={() => updateQty(item.id, item.color, 1)} style={{ width: 20, height: 20, borderRadius: '50%', border: 'none', cursor: 'pointer', background: '#fff' }}><Icon.plus s={10} /></button>
                  </div>
                  <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 14, fontWeight: 800 }}>${item.price * item.qty}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div style={{ padding: '12px 16px 20px', background: '#fff', borderRadius: '20px 20px 0 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Total</span>
              <span style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 22, fontWeight: 800 }}>${total + (total >= 80 ? 0 : 8)}</span>
            </div>
            <button style={{
              width: '100%', padding: '14px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: t.accentA, color: '#fff',
              fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
              boxShadow: '0 4px 0 rgba(0,0,0,0.18)',
            }}>Checkout</button>
          </div>
        )}
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

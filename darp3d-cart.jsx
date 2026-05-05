// darp3d-cart.jsx — cart drawer

function CartDrawer({ open, onClose, cart, setCart, t }) {
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const updateQty = (id, color, delta) => {
    setCart(prev => prev.flatMap(i => {
      if (i.id === id && i.color === color) {
        const q = i.qty + delta;
        return q <= 0 ? [] : [{ ...i, qty: q }];
      }
      return [i];
    }));
  };
  const remove = (id, color) => setCart(prev => prev.filter(i => !(i.id === id && i.color === color)));

  return (
    <>
      {/* Scrim */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 90,
        background: 'rgba(20,20,40,0.4)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity .3s',
      }} />
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 420, maxWidth: '92vw', zIndex: 100,
        background: t.bgColor,
        transform: open ? 'translateX(0)' : 'translateX(110%)',
        transition: 'transform .35s cubic-bezier(.34,1.3,.64,1)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-20px 0 40px rgba(20,20,40,0.18)',
        fontFamily: '"DM Sans", system-ui, sans-serif',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 26, fontWeight: 800, letterSpacing: -0.6 }}>
            Your bag <span style={{ color: t.accentA }}>({cart.length})</span>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: '#fff', color: '#1A1A2E',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 0 rgba(0,0,0,0.08)',
          }}><Icon.close /></button>
        </div>
        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 22px 16px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#5A5A72' }}>
              <div style={{ width: 88, height: 88, margin: '0 auto 14px', borderRadius: '50%', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.accentA }}>
                <Icon.cart s={36} />
              </div>
              <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 22, fontWeight: 800, color: '#1A1A2E' }}>Empty bag.</div>
              <div style={{ marginTop: 6, fontSize: 14 }}>Add some squishy stuff!</div>
            </div>
          ) : cart.map(item => (
            <div key={item.id + item.color} style={{
              background: '#fff', borderRadius: 22, padding: 14, marginBottom: 10,
              display: 'flex', gap: 12, alignItems: 'center',
              boxShadow: '0 4px 10px rgba(58,134,255,0.06)',
              animation: 'darpPop .35s cubic-bezier(.34,1.6,.64,1)',
            }}>
              <div style={{
                width: 80, height: 80, flexShrink: 0, borderRadius: 16,
                background: `linear-gradient(160deg, ${lighten(item.color, 0.55)}, ${t.bgColor})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              }}>
                <ThreeDObject shape={item.shape} color={item.color} size={56} speed={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 16, fontWeight: 700, letterSpacing: -0.3 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: '#5A5A72', marginTop: 2, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.2)' }} />
                  {item.material}
                </div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: t.bgColor, borderRadius: 999, padding: 3 }}>
                    <button onClick={() => updateQty(item.id, item.color, -1)} style={qtyBtn}><Icon.minus s={12} /></button>
                    <div style={{ width: 22, textAlign: 'center', fontWeight: 700, fontSize: 13 }}>{item.qty}</div>
                    <button onClick={() => updateQty(item.id, item.color, 1)} style={qtyBtn}><Icon.plus s={12} /></button>
                  </div>
                  <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 16, fontWeight: 800 }}>${item.price * item.qty}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: '16px 22px 20px', background: '#fff', borderRadius: '24px 24px 0 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#5A5A72', marginBottom: 6 }}>
              <span>Subtotal</span><span>${total}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#5A5A72', marginBottom: 10 }}>
              <span>Shipping</span><span style={{ color: t.accentD === '#FFBE0B' ? '#1A1A2E' : t.accentD }}>{total >= 80 ? 'Free!' : '$8'}</span>
            </div>
            <div style={{ height: 1, background: '#F0EFE8', marginBottom: 12 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Total</span>
              <span style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 28, fontWeight: 800 }}>${total + (total >= 80 ? 0 : 8)}</span>
            </div>
            <button style={{
              width: '100%', padding: '16px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: t.accentA, color: '#fff',
              fontFamily: 'inherit', fontWeight: 700, fontSize: 15,
              boxShadow: '0 5px 0 rgba(0,0,0,0.18), 0 8px 18px rgba(58,134,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              Checkout <Icon.arrow s={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

const qtyBtn = {
  width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer',
  background: '#fff', color: '#1A1A2E',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 1px 0 rgba(0,0,0,0.1)',
};

Object.assign(window, { CartDrawer });

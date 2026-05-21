import API_URL from '../config.js';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Leaf, ShoppingBag, CheckCircle, CreditCard, Smartphone, Banknote, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const { cartItems, removeFromCart, updateQty, clearCart, totalItems, totalPrice } = useCart();
    const [isOrdering, setIsOrdering] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    
    // Payment States
    const [checkoutStep, setCheckoutStep] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [paymentDetails, setPaymentDetails] = useState({ cardNum: '', cardName: '', upiId: '' });
    const [addressDetails, setAddressDetails] = useState({ fullName: '', phone: '', address: '', city: '', pinCode: '' });
    
    const navigate = useNavigate();

    const handlePlaceOrder = async () => {
        // Validate Address
        if (!addressDetails.fullName || !addressDetails.phone || !addressDetails.address || !addressDetails.city || !addressDetails.pinCode) {
            alert('Please fill in all shipping address fields.');
            return;
        }

        // Validation based on payment method
        if (paymentMethod === 'card' && (!paymentDetails.cardNum || !paymentDetails.cardName)) {
            alert('Please enter your card details.');
            return;
        }
        if (paymentMethod === 'upi' && !paymentDetails.upiId) {
            alert('Please enter your UPI ID.');
            return;
        }

        setIsOrdering(true);
        try {
            const storedUser = localStorage.getItem('herbal_user');
            const user = storedUser ? JSON.parse(storedUser) : null;

            const payload = {
                userId: user ? user.id : null,
                items: JSON.stringify(cartItems),
                totalPrice: Math.round(totalPrice * 1.05),
                address: JSON.stringify(addressDetails),
                paymentMethod: paymentMethod
            };

            const res = await fetch('https://vhg-backend.onrender.com/place-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                setOrderSuccess(true);
                clearCart();
                setTimeout(() => navigate('/login'), 2500); // Redirect to profile to track order
            } else {
                alert('Order failed: ' + data.message);
            }
        } catch (err) {
            alert('Failed to connect to server. Ensure backend is running.');
        } finally {
            setIsOrdering(false);
        }
    };

    if (orderSuccess) {
        return (
            <div style={S.emptyWrap}>
                <div style={S.successIcon}><CheckCircle size={60} color="white" /></div>
                <h2 style={S.emptyTitle}>Order Placed Successfully!</h2>
                <p style={S.emptyMsg}>Redirecting you to track your order...</p>
                <button className="btn btn-outline" style={{ marginTop: '1rem', padding: '0.8rem 2rem' }} onClick={() => navigate('/login')}>
                    Track Order Now
                </button>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div style={S.emptyWrap}>
                <div style={S.emptyIcon}><ShoppingBag size={60} color="var(--primary)" /></div>
                <h2 style={S.emptyTitle}>Your cart is empty</h2>
                <p style={S.emptyMsg}>Browse our botanical library and add plants to your cart.</p>
                <Link to="/" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
                    <Leaf size={18} /> Explore Plants
                </Link>
            </div>
        );
    }

    if (checkoutStep && !orderSuccess) {
        return (
            <div style={S.page}>
                <div style={S.header}>
                    <button style={S.backBtn} onClick={() => setCheckoutStep(false)}>
                        <ArrowLeft size={18} /> Back to Cart
                    </button>
                    <h1 style={S.title}><ShieldCheck size={28} color="var(--primary)" /> Secure Checkout</h1>
                </div>

                <div style={S.grid}>
                    <div style={S.itemsCol}>
                        {/* Shipping Address */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem', margin: 0 }}>Shipping Address</h2>
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={S.inputLabel}>Full Name</label>
                                        <input type="text" placeholder="John Doe" value={addressDetails.fullName} onChange={e => setAddressDetails({...addressDetails, fullName: e.target.value})} style={S.inputField} />
                                    </div>
                                    <div>
                                        <label style={S.inputLabel}>Phone Number</label>
                                        <input type="tel" placeholder="+91 98765 43210" value={addressDetails.phone} onChange={e => setAddressDetails({...addressDetails, phone: e.target.value})} style={S.inputField} />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={S.inputLabel}>Street Address / Flat No.</label>
                                    <input type="text" placeholder="123 Botanist Street, Green Tower" value={addressDetails.address} onChange={e => setAddressDetails({...addressDetails, address: e.target.value})} style={S.inputField} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={S.inputLabel}>City</label>
                                        <input type="text" placeholder="Mumbai" value={addressDetails.city} onChange={e => setAddressDetails({...addressDetails, city: e.target.value})} style={S.inputField} />
                                    </div>
                                    <div>
                                        <label style={S.inputLabel}>PIN Code</label>
                                        <input type="text" placeholder="400001" value={addressDetails.pinCode} onChange={e => setAddressDetails({...addressDetails, pinCode: e.target.value})} style={S.inputField} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Select Payment Method</h2>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" style={{height: '20px', objectFit: 'contain', opacity: 0.8}} />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" style={{height: '20px', objectFit: 'contain', opacity: 0.8}} />
                            </div>
                        </div>
                        
                        {/* Card Payment */}
                        <div style={{ ...S.paymentMethodCard, border: paymentMethod === 'card' ? '2px solid var(--primary)' : '1px solid rgba(0,0,0,0.1)', boxShadow: paymentMethod === 'card' ? '0 8px 25px rgba(43,147,72,0.15)' : 'none' }} onClick={() => setPaymentMethod('card')}>
                            <div style={S.pmHeader}>
                                <div style={S.pmTitleWrap}>
                                    <div style={{ background: paymentMethod === 'card' ? 'rgba(43,147,72,0.1)' : 'rgba(0,0,0,0.04)', padding: '0.6rem', borderRadius: '10px' }}>
                                        <CreditCard size={24} color={paymentMethod === 'card' ? 'var(--primary)' : 'var(--text-muted)'} />
                                    </div>
                                    <div>
                                        <span style={{ fontWeight: 700, fontSize: '1.1rem', display: 'block' }}>Credit / Debit Card</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pay securely with your bank card</span>
                                    </div>
                                </div>
                                <div style={S.radioWrap}>
                                    <div style={{ ...S.radioInner, background: paymentMethod === 'card' ? 'var(--primary)' : 'transparent' }}></div>
                                </div>
                            </div>
                            {paymentMethod === 'card' && (
                                <div style={S.pmBody} onClick={(e) => e.stopPropagation()}>
                                    <div style={{ marginBottom: '1.25rem' }}>
                                        <label style={S.inputLabel}>Card Number</label>
                                        <div style={{ position: 'relative' }}>
                                            <input type="text" placeholder="0000 0000 0000 0000" maxLength="19" value={paymentDetails.cardNum} onChange={e => setPaymentDetails({...paymentDetails, cardNum: e.target.value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim()})} style={S.inputField} />
                                            <CreditCard size={18} color="#aaa" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',  marginBottom: '1.25rem' }}>
                                        <div>
                                            <label style={S.inputLabel}>Expiry Date</label>
                                            <input type="text" placeholder="MM/YY" maxLength="5" style={S.inputField} />
                                        </div>
                                        <div>
                                            <label style={S.inputLabel}>CVV</label>
                                            <input type="password" placeholder="•••" maxLength="3" style={S.inputField} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={S.inputLabel}>Name on Card</label>
                                        <input type="text" placeholder="John Doe" value={paymentDetails.cardName} onChange={e => setPaymentDetails({...paymentDetails, cardName: e.target.value})} style={S.inputField} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* UPI Payment */}
                        <div style={{ ...S.paymentMethodCard, border: paymentMethod === 'upi' ? '2px solid var(--primary)' : '1px solid rgba(0,0,0,0.1)', boxShadow: paymentMethod === 'upi' ? '0 8px 25px rgba(43,147,72,0.15)' : 'none' }} onClick={() => setPaymentMethod('upi')}>
                            <div style={S.pmHeader}>
                                <div style={S.pmTitleWrap}>
                                    <div style={{ background: paymentMethod === 'upi' ? 'rgba(43,147,72,0.1)' : 'rgba(0,0,0,0.04)', padding: '0.6rem', borderRadius: '10px' }}>
                                        <Smartphone size={24} color={paymentMethod === 'upi' ? 'var(--primary)' : 'var(--text-muted)'} />
                                    </div>
                                    <div>
                                        <span style={{ fontWeight: 700, fontSize: '1.1rem', display: 'block' }}>UPI (GPay, PhonePe, Paytm)</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Instant payment via UPI App</span>
                                    </div>
                                </div>
                                <div style={S.radioWrap}>
                                    <div style={{ ...S.radioInner, background: paymentMethod === 'upi' ? 'var(--primary)' : 'transparent' }}></div>
                                </div>
                            </div>
                            {paymentMethod === 'upi' && (
                                <div style={S.pmBody} onClick={(e) => e.stopPropagation()}>
                                    <div>
                                        <label style={S.inputLabel}>Enter your UPI ID</label>
                                        <div style={{ position: 'relative' }}>
                                            <input type="text" placeholder="username@upi" value={paymentDetails.upiId} onChange={e => setPaymentDetails({...paymentDetails, upiId: e.target.value})} style={{ ...S.inputField, paddingLeft: '2.5rem' }} />
                                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--primary)' }}>@</span>
                                        </div>
                                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>A payment request will be sent to your UPI app.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* COD */}
                        <div style={{ ...S.paymentMethodCard, border: paymentMethod === 'cod' ? '2px solid var(--primary)' : '1px solid rgba(0,0,0,0.1)', boxShadow: paymentMethod === 'cod' ? '0 8px 25px rgba(43,147,72,0.15)' : 'none' }} onClick={() => setPaymentMethod('cod')}>
                            <div style={S.pmHeader}>
                                <div style={S.pmTitleWrap}>
                                    <div style={{ background: paymentMethod === 'cod' ? 'rgba(43,147,72,0.1)' : 'rgba(0,0,0,0.04)', padding: '0.6rem', borderRadius: '10px' }}>
                                        <Banknote size={24} color={paymentMethod === 'cod' ? 'var(--primary)' : 'var(--text-muted)'} />
                                    </div>
                                    <div>
                                        <span style={{ fontWeight: 700, fontSize: '1.1rem', display: 'block' }}>Cash on Delivery (COD)</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pay when your order arrives</span>
                                    </div>
                                </div>
                                <div style={S.radioWrap}>
                                    <div style={{ ...S.radioInner, background: paymentMethod === 'cod' ? 'var(--primary)' : 'transparent' }}></div>
                                </div>
                            </div>
                            {paymentMethod === 'cod' && (
                                <div style={S.pmBody} onClick={(e) => e.stopPropagation()}>
                                    <div style={{ background: 'rgba(247, 127, 0, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(247, 127, 0, 0.2)' }}>
                                        <p style={{ color: '#d97706', margin: 0, fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <CheckCircle size={18} /> No extra fee. Please keep exact change ready.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Summary Checkout View */}
                    <div className="glass-card" style={S.summary}>
                        <h2 style={S.summaryTitle}>Payment Summary</h2>
                        <div style={S.summaryRow}>
                            <span>Subtotal</span>
                            <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                        </div>
                        <div style={S.summaryRow}>
                            <span>GST (5%)</span>
                            <span>₹{Math.round(totalPrice * 0.05).toLocaleString('en-IN')}</span>
                        </div>
                        <hr style={{ margin: '1rem 0', borderColor: 'rgba(0,0,0,0.08)' }} />
                        <div style={{ ...S.summaryRow, fontWeight: 800, fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                            <span>Amount to Pay</span>
                            <span style={{ color: 'var(--primary)' }}>₹{Math.round(totalPrice * 1.05).toLocaleString('en-IN')}</span>
                        </div>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', justifyContent: 'center' }}
                            onClick={handlePlaceOrder}
                            disabled={isOrdering}
                        >
                            {isOrdering ? <div className="loader" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : 
                                <><ShieldCheck size={20} /> {paymentMethod === 'cod' ? 'Confirm Order' : 'Pay Now'}</>}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={S.page}>
            <div style={S.header}>
                <Link to="/" style={S.back}><ArrowLeft size={18} /> Continue Shopping</Link>
                <h1 style={S.title}><ShoppingCart size={28} /> Your Cart ({totalItems} items)</h1>
            </div>

            <div style={S.grid}>
                {/* Items List */}
                <div style={S.itemsCol}>
                    {cartItems.map(item => (
                        <div key={item.id} className="glass-card" style={S.card}>
                            <img
                                src={item.image_url || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=200'}
                                alt={item.name}
                                style={S.img}
                                onError={e => e.target.src = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=200'}
                            />
                            <div style={S.info}>
                                <h3 style={S.plantName}>{item.name}</h3>
                                <p style={S.scientific}>{item.scientific}</p>
                                <span className="badge">{item.category}</span>
                            </div>
                            <div style={S.controls}>
                                <div style={S.qtyRow}>
                                    <button style={S.qtyBtn} onClick={() => updateQty(item.id, item.qty - 1)}>
                                        <Minus size={14} />
                                    </button>
                                    <span style={S.qty}>{item.qty}</span>
                                    <button style={S.qtyBtn} onClick={() => updateQty(item.id, item.qty + 1)}>
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <p style={S.price}>₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                                <button style={S.del} onClick={() => removeFromCart(item.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    <button style={S.clearBtn} onClick={clearCart}>Clear All</button>
                </div>

                {/* Order Summary */}
                <div className="glass-card" style={S.summary}>
                    <h2 style={S.summaryTitle}>Order Summary</h2>
                    <div style={S.summaryRow}>
                        <span>Items ({totalItems})</span>
                        <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={S.summaryRow}>
                        <span>Delivery</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>FREE</span>
                    </div>
                    <div style={S.summaryRow}>
                        <span>GST (5%)</span>
                        <span>₹{Math.round(totalPrice * 0.05).toLocaleString('en-IN')}</span>
                    </div>
                    <hr style={{ margin: '1rem 0', borderColor: 'rgba(0,0,0,0.08)' }} />
                    <div style={{ ...S.summaryRow, fontWeight: 800, fontSize: '1.2rem' }}>
                        <span>Total</span>
                        <span style={{ color: 'var(--primary)' }}>₹{Math.round(totalPrice * 1.05).toLocaleString('en-IN')}</span>
                    </div>
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1.1rem', justifyContent: 'center' }}
                        onClick={() => setCheckoutStep(true)}
                    >
                        <ShoppingCart size={20} /> Proceed to Checkout
                    </button>
                    {!localStorage.getItem('herbal_user') && (
                        <p style={{ textAlign: 'center', color: '#f77f00', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>
                            Tip: Sign in first to track your order
                        </p>
                    )}
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
                        🔒 Secure checkout • Free delivery across India
                    </p>
                </div>
            </div>
        </div>
    );
};

const S = {
    page: { maxWidth: '1100px', margin: '0 auto', padding: '0 0 3rem' },
    header: { marginBottom: '2rem' },
    back: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1rem', fontWeight: 600 },
    title: { display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem', fontWeight: 800 },
    grid: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' },
    itemsCol: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    card: { display: 'grid', gridTemplateColumns: '90px 1fr auto', gap: '1.5rem', alignItems: 'center', padding: '1.25rem' },
    img: { width: '90px', height: '90px', borderRadius: '12px', objectFit: 'cover' },
    info: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
    plantName: { margin: 0, fontSize: '1.15rem', fontWeight: 700 },
    scientific: { margin: 0, color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' },
    controls: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' },
    qtyRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(0,0,0,0.04)', borderRadius: '30px', padding: '0.3rem 0.75rem' },
    qtyBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '0.2rem', display: 'flex' },
    qty: { fontWeight: 700, fontSize: '1rem', minWidth: '20px', textAlign: 'center' },
    price: { margin: 0, fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' },
    del: { background: 'rgba(239,71,111,0.1)', border: 'none', borderRadius: '8px', padding: '0.4rem 0.6rem', cursor: 'pointer', color: 'var(--error)', display: 'flex' },
    clearBtn: { alignSelf: 'flex-end', background: 'none', border: '1px solid rgba(239,71,111,0.4)', borderRadius: '8px', padding: '0.5rem 1rem', color: 'var(--error)', cursor: 'pointer', fontWeight: 600 },
    summary: { padding: '2rem', position: 'sticky', top: '100px' },
    summaryTitle: { fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem' },
    summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '1rem' },
    emptyWrap: { textAlign: 'center', padding: '6rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
    emptyIcon: { background: 'rgba(43,147,72,0.1)', borderRadius: '50%', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    successIcon: { background: 'var(--primary)', borderRadius: '50%', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(43,147,72,0.3)' },
    emptyTitle: { fontSize: '2rem', fontWeight: 800, margin: 0 },
    emptyMsg: { color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 },
    
    // Payment UI styles
    backBtn: { background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', padding: 0 },
    paymentMethodCard: { background: 'white', borderRadius: '16px', marginBottom: '1.25rem', cursor: 'pointer', overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
    pmHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem' },
    pmTitleWrap: { display: 'flex', alignItems: 'center', gap: '1rem' },
    radioWrap: { width: '24px', height: '24px', borderRadius: '50%', border: '2px solid rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3px', transition: 'all 0.2s' },
    radioInner: { width: '100%', height: '100%', borderRadius: '50%', transition: 'background 0.2s cubic-bezier(0.4, 0, 0.2, 1)' },
    pmBody: { padding: '0 1.5rem 1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', marginTop: '0', paddingTop: '1.5rem', cursor: 'default', background: '#fafafa' },
    inputLabel: { display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.4rem' },
    inputField: { width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', background: 'white', fontFamily: 'inherit' }
};

export default Cart;

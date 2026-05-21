import API_URL from '../config.js';
import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, LogIn, UserPlus, LogOut, Leaf, Search, Heart, ShoppingBag, Star, ArrowRight, PackageOpen, Clock, Droplets, Sprout } from 'lucide-react';

const Login = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ searches: 0, saves: 0 });
    const [orders, setOrders] = useState([]); // NEW: State for track orders
    const [showForm, setShowForm] = useState(false);
    const [isLoginView, setIsLoginView] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    // Plant Care State
    const [wateringData, setWateringData] = useState(() => {
        const saved = localStorage.getItem('herbal_watering');
        return saved ? JSON.parse(saved) : {};
    });

    const handleWaterPlant = (plantName) => {
        const newData = { ...wateringData, [plantName]: new Date().toISOString() };
        setWateringData(newData);
        localStorage.setItem('herbal_watering', JSON.stringify(newData));
    };

    // Calculate unique bought plants
    const boughtPlantsMap = new Map();
    orders.forEach(order => {
        try {
            const items = JSON.parse(order.items);
            items.forEach(item => {
                if (!boughtPlantsMap.has(item.name)) {
                    boughtPlantsMap.set(item.name, item);
                }
            });
        } catch (e) {} // skip invalid
    });
    const uniqueBoughtPlants = Array.from(boughtPlantsMap.values());

    useEffect(() => {
        const storedUser = localStorage.getItem('herbal_user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    useEffect(() => {
        if (user && user.id) {
            // Fetch stats
            fetch(`https://vhg-backend.onrender.com/user/stats/${user.id}`)
                .then(res => res.json())
                .then(data => { if (data.success) setStats({ searches: data.searches, saves: data.saves }); })
                .catch(err => console.error("Error fetching stats:", err));

            // Fetch orders
            fetch(`https://vhg-backend.onrender.com/user/orders/${user.id}`)
                .then(res => res.json())
                .then(data => { if (data.success) setOrders(data.orders); })
                .catch(err => console.error("Error fetching orders:", err));
        }
    }, [user]);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const endpoint = isLoginView ? '/login' : '/register';
        try {
            const response = await fetch(`https://vhg-backend.onrender.com${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {
                localStorage.setItem('herbal_user', JSON.stringify(data.user));
                window.dispatchEvent(new Event('herbal_user_changed'));
                setUser(data.user);
                setShowForm(false);
                setFormData({ name: '', email: '', password: '' });
            } else {
                setError(data.message || 'Authentication failed');
            }
        } catch (err) {
            setError('Could not connect to the server. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('herbal_user');
        window.dispatchEvent(new Event('herbal_user_changed'));
        setUser(null);
        setShowForm(false);
    };

    // ─── LOGGED IN: Full Profile ───────────────────────────────────────────────
    if (user) {
        return (
            <div style={S.page}>
                <div style={S.heroBanner}>
                    <div style={S.heroLeafBg}>🌿</div>
                    <div style={S.avatarWrap}>
                        <div style={S.avatar}>{user.name?.[0]?.toUpperCase() || <User size={36} />}</div>
                    </div>
                    <h2 style={S.heroName}>Welcome back, {user.name}! 👋</h2>
                    <p style={S.heroEmail}>{user.email}</p>
                    <span style={S.memberBadge}>🌱 Herbal Garden Member</span>
                </div>

                <div style={S.statsGrid}>
                    <div className="glass-card" style={S.statItem}>
                        <Search size={28} color="#f77f00" />
                        <div style={S.statNum}>{stats.searches}</div>
                        <div style={S.statLabel}>Total Searches</div>
                    </div>
                    <div className="glass-card" style={S.statItem}>
                        <Heart size={28} color="#ef476f" />
                        <div style={S.statNum}>{stats.saves}</div>
                        <div style={S.statLabel}>Saved Plants</div>
                    </div>
                    <div className="glass-card" style={S.statItem}>
                        <PackageOpen size={28} color="#3a86ff" />
                        <div style={S.statNum}>{orders.length}</div>
                        <div style={S.statLabel}>Total Orders</div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>Your Herbal Journey</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        You've explored <strong style={{ color: 'var(--primary)' }}>{stats.searches}</strong> plants and saved <strong style={{ color: '#ef476f' }}>{stats.saves}</strong> to your collection!
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="/" style={{ textDecoration: 'none' }}>
                            <button className="btn btn-primary" style={{ gap: '0.5rem' }}>
                                <Leaf size={18} /> Explore Library
                            </button>
                        </a>
                        <a href="/cart" style={{ textDecoration: 'none' }}>
                            <button className="btn btn-outline" style={{ gap: '0.5rem' }}>
                                <ShoppingBag size={18} /> View Cart
                            </button>
                        </a>
                    </div>
                </div>

                {/* ─── MY DIGITAL GARDEN (CARE TRACKER) ─────────────────────────────────────────────── */}
                {uniqueBoughtPlants.length > 0 && (
                    <div className="glass-card animate-slide-up" style={{ padding: '2rem', marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <Sprout size={24} color="var(--primary)" /> 
                            My Digital Garden
                        </h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Track and care for the magnificent botanicals you have purchased!</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                            {uniqueBoughtPlants.map((plant, idx) => {
                                const lastWatered = wateringData[plant.name];
                                const msSinceWatered = lastWatered ? (new Date() - new Date(lastWatered)) : null;
                                const needsWater = msSinceWatered === null || msSinceWatered > (24 * 60 * 60 * 1000); // 24 hours
                                
                                return (
                                    <div key={idx} style={{ padding: '1.25rem', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', background: 'white', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <img src={plant.image_url} alt={plant.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.05rem' }}>{plant.name}</h4>
                                            <div style={{ fontSize: '0.8rem', color: needsWater ? '#f77f00' : 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                <Droplets size={14} /> 
                                                {needsWater ? (lastWatered ? 'Needs Water Soon' : 'Never Watered') : 'Hydrated Well!'}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleWaterPlant(plant.name)}
                                            style={{ background: needsWater ? '#3a86ff' : 'var(--success)', border: 'none', color: 'white', padding: '0.6rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', transition: 'transform 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                                            title="Water this plant"
                                        >
                                            <Droplets size={18} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ─── TRACK YOUR ORDERS ─────────────────────────────────────────────── */}
                <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PackageOpen size={24} color="var(--primary)" /> Track Your Orders
                    </h3>

                    {orders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                            <ShoppingBag size={40} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.05rem' }}>You haven't placed any orders yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {orders.map(order => {
                                const items = JSON.parse(order.items);
                                const addressObj = order.address ? JSON.parse(order.address) : null;
                                const paymentLabel = order.payment_method === 'card' ? 'Credit / Debit Card' : 
                                                     order.payment_method === 'upi' ? 'UPI / App' : 
                                                     order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment';
                                const date = new Date(order.created_at).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                });
                                return (
                                    <div key={order.id} style={{ padding: '1.25rem', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', background: 'white' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontWeight: 800 }}>Order #{1000 + order.id}</span>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                    <Clock size={12} /> {date}
                                                </span>
                                            </div>
                                            <span style={{ background: 'rgba(43,147,72,0.1)', color: 'var(--primary)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
                                                {order.status}
                                            </span>
                                        </div>

                                        <div style={{ borderTop: '1px dashed rgba(0,0,0,0.1)', borderBottom: '1px dashed rgba(0,0,0,0.1)', padding: '1rem 0', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {items.map((item, idx) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                                    <span>{item.qty}x <span style={{ fontWeight: 600 }}>{item.name}</span></span>
                                                    <span>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {addressObj && (
                                            <div style={{ marginBottom: '1rem', background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '8px' }}>
                                                <p style={{ margin: '0 0 0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Delivery To:</p>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                                                    {addressObj.fullName} ({addressObj.phone})<br/>
                                                    {addressObj.address}, {addressObj.city} - {addressObj.pinCode}
                                                </p>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.03)', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
                                                <strong>Payment:</strong> {paymentLabel}
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginRight: '0.5rem' }}>Total</span>
                                                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>₹{order.total_price.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div style={{ textAlign: 'center' }}>
                    <button className="btn btn-outline" style={{ gap: '0.5rem', color: 'var(--error)', borderColor: 'var(--error)' }} onClick={handleLogout}>
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </div>
        );
    }

    // ─── NOT LOGGED IN: Profile Landing + Form ────────────────────────────────
    return (
        <div style={S.page}>
            {/* Hero Profile Preview Banner */}
            <div style={S.heroBanner}>
                <div style={S.heroLeafBg}>🌿</div>
                <div style={{ ...S.avatar, background: 'rgba(255,255,255,0.15)', border: '3px dashed rgba(255,255,255,0.5)' }}>
                    <User size={40} color="white" />
                </div>
                <h2 style={S.heroName}>Your Profile</h2>
                <p style={{ color: 'rgba(255,255,255,0.85)', margin: '0 0 1.5rem', fontSize: '1.05rem' }}>
                    Sign in to access your personalized herbal journey
                </p>

                {/* Preview Stats (blurred/locked) */}
                <div style={S.lockedStatsRow}>
                    <div style={S.lockedStat}>
                        <Search size={20} color="white" />
                        <span>?? Searches</span>
                    </div>
                    <div style={S.lockedStat}>
                        <Heart size={20} color="white" />
                        <span>?? Saved Plants</span>
                    </div>
                    <div style={S.lockedStat}>
                        <ShoppingBag size={20} color="white" />
                        <span>?? Cart Items</span>
                    </div>
                </div>
            </div>

            {/* Feature highlights */}
            <div style={S.featuresRow}>
                {[
                    { icon: <Leaf size={24} color="var(--primary)" />, title: 'Save Plants', desc: 'Bookmark your favourite herbs' },
                    { icon: <Search size={24} color="#f77f00" />, title: 'Track History', desc: 'See all your past searches' },
                    { icon: <ShoppingBag size={24} color="#3a86ff" />, title: 'Shop Plants', desc: 'Buy plants with home delivery' },
                ].map((f, i) => (
                    <div key={i} className="glass-card" style={S.featureCard}>
                        <div style={S.featureIcon}>{f.icon}</div>
                        <h4 style={{ margin: '0.5rem 0 0.25rem', fontSize: '1rem' }}>{f.title}</h4>
                        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>{f.desc}</p>
                    </div>
                ))}
            </div>

            {/* Auth Form or CTA Buttons */}
            {!showForm ? (
                <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Get Started</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Join thousands of herbal enthusiasts</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button className="btn btn-primary" style={{ width: '100%', height: '52px', fontSize: '1.05rem', gap: '0.5rem' }}
                            onClick={() => { setIsLoginView(true); setShowForm(true); }}>
                            <LogIn size={20} /> Sign In to Your Account
                        </button>
                        <button className="btn btn-outline" style={{ width: '100%', height: '52px', fontSize: '1.05rem', gap: '0.5rem' }}
                            onClick={() => { setIsLoginView(false); setShowForm(true); }}>
                            <UserPlus size={20} /> Create New Account
                        </button>
                    </div>
                </div>
            ) : (
                <div className="glass-card animate-slide-up" style={{ maxWidth: '480px', margin: '0 auto', padding: '2.5rem', textAlign: 'center' }}>
                    <button onClick={() => { setShowForm(false); setError(''); }} style={S.backBtn}>← Back</button>
                    <h2 style={{ fontSize: '1.9rem', marginBottom: '0.5rem' }}>{isLoginView ? 'Welcome Back' : 'Create Account'}</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        {isLoginView ? 'Sign in to access your saved plants and history.' : 'Join us to save your favourite herbs and track your discoveries.'}
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {!isLoginView && (
                            <div style={S.inputGroup}>
                                <User size={18} style={S.inputIcon} />
                                <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} className="input-field" style={S.inputPad} required />
                            </div>
                        )}
                        <div style={S.inputGroup}>
                            <Mail size={18} style={S.inputIcon} />
                            <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} className="input-field" style={S.inputPad} required />
                        </div>
                        <div style={S.inputGroup}>
                            <Lock size={18} style={S.inputIcon} />
                            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} className="input-field" style={S.inputPad} required />
                        </div>

                        {error && <div style={S.errorBox}>{error}</div>}

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '52px', justifyContent: 'center', fontSize: '1.05rem', gap: '0.5rem' }} disabled={loading}>
                            {loading
                                ? <div className="loader" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                                : (isLoginView ? <><LogIn size={18} /> Sign In</> : <><UserPlus size={18} /> Register</>)
                            }
                        </button>
                    </form>

                    <div style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        {isLoginView ? "Don't have an account? " : "Already have an account? "}
                        <button style={S.toggleBtn} onClick={() => { setIsLoginView(!isLoginView); setError(''); setFormData({ name: '', email: '', password: '' }); }} type="button">
                            {isLoginView ? 'Sign Up' : 'Log In'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const S = {
    page: { maxWidth: '900px', margin: '0 auto', padding: '0 0 4rem' },
    heroBanner: {
        background: 'linear-gradient(135deg, var(--primary) 0%, #55a630 100%)',
        borderRadius: '20px',
        padding: '3rem 2rem',
        textAlign: 'center',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden'
    },
    heroLeafBg: { position: 'absolute', top: '-20px', right: '-10px', fontSize: '8rem', opacity: 0.1, pointerEvents: 'none' },
    avatar: {
        width: '90px', height: '90px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1rem',
        fontSize: '2.5rem', fontWeight: 900, color: 'white',
        border: '3px solid rgba(255,255,255,0.5)'
    },
    heroName: { color: 'white', fontSize: '2rem', fontWeight: 800, margin: '0 0 0.4rem' },
    heroEmail: { color: 'rgba(255,255,255,0.8)', margin: '0 0 1rem', fontSize: '1rem' },
    memberBadge: { background: 'rgba(255,255,255,0.2)', color: 'white', padding: '0.4rem 1.2rem', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 600 },
    lockedStatsRow: { display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' },
    lockedStat: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', color: 'white', padding: '0.5rem 1.25rem', borderRadius: '30px', fontWeight: 600, fontSize: '0.95rem', backdropFilter: 'blur(8px)' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
    statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem 1rem', textAlign: 'center' },
    statNum: { fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-main)' },
    statLabel: { fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' },
    featuresRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' },
    featureCard: { padding: '1.5rem', textAlign: 'center' },
    featureIcon: { width: '50px', height: '50px', borderRadius: '12px', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', boxShadow: 'var(--shadow-sm)' },
    inputGroup: { position: 'relative', display: 'flex', alignItems: 'center' },
    inputIcon: { position: 'absolute', left: '1rem', color: 'var(--text-muted)' },
    inputPad: { width: '100%', paddingLeft: '3rem', height: '50px' },
    errorBox: { backgroundColor: 'rgba(239,71,111,0.1)', color: 'var(--error)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', borderLeft: '4px solid var(--error)', textAlign: 'left' },
    toggleBtn: { background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', padding: 0 },
    backBtn: { display: 'block', marginBottom: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, textAlign: 'left' },
    avatarWrap: { marginBottom: '0' },
};

export default Login;

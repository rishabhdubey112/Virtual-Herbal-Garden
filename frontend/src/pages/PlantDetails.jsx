import API_URL from '../config.js';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Info, ShieldCheck, Sparkles, Droplets, ShoppingCart, Check, SunDim, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

const PlantDetails = () => {
    const { name } = useParams();
    const [plant, setPlant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [cartAdded, setCartAdded] = useState(false);
    const { addToCart } = useCart();
    
    // Review State
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchPlant = async () => {
            try {
                const res = await fetch(`https://vhg-backend.onrender.com/plant/${name}`);
                const data = await res.json();
                if (data.success) {
                    setPlant(data.plant);
                }
            } catch (err) {
                console.error('Error fetching plant details:', err);
            } finally {
                setTimeout(() => setLoading(false), 300);
            }
        };

        const fetchReviews = async () => {
            try {
                const res = await fetch(`https://vhg-backend.onrender.com/reviews/${name}`);
                const data = await res.json();
                if (data.success) setReviews(data.reviews);
            } catch (err) {
                console.error('Error fetching reviews:', err);
            }
        };

        fetchPlant();
        fetchReviews();
    }, [name]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const storedUser = localStorage.getItem('herbal_user');
        if (!storedUser) return alert("Please log in to submit a review.");
        const user = JSON.parse(storedUser);
        
        setIsSubmittingReview(true);
        try {
            const res = await fetch('https://vhg-backend.onrender.com/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plantName: plant.name, userName: user.name, rating, comment })
            });
            const data = await res.json();
            if (data.success) {
                alert("Review submitted!");
                setComment('');
                setReviews([{ user_name: user.name, rating, comment, created_at: new Date().toISOString() }, ...reviews]);
            } else alert(data.message);
        } catch (err) { 
            alert("Server error"); 
        } finally { 
            setIsSubmittingReview(false); 
        }
    };

    const handleSave = async () => {
        const storedUser = localStorage.getItem('herbal_user');
        if (!storedUser) {
            alert("Please log in to save plants to your profile.");
            return;
        }

        const user = JSON.parse(storedUser);
        setIsSaving(true);

        try {
            const res = await fetch('https://vhg-backend.onrender.com/user/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, plantName: plant.name })
            });
            const data = await res.json();
            if (data.success) {
                setIsSaved(true);
            } else {
                alert(data.message || "Failed to save plant.");
            }
        } catch (err) {
            alert("Could not connect to the server.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="loader" style={{ marginTop: '5rem' }}></div>;

    if (!plant) return (
        <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
            <div style={{ background: 'rgba(239, 71, 111, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                <Info size={40} color="var(--error)" />
            </div>
            <h2>Plant Profiler Not Found</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>The botanical record you are looking for does not exist in our database.</p>
            <Link to="/" className="btn btn-primary animate-slide-up">Return to Garden</Link>
        </div>
    );

    return (
        <div className="container animate-fade-in" style={styles.container}>
            <Link to="/" style={styles.backBtn} className="btn-outline">
                <ArrowLeft size={18} />
                Back to Garden
            </Link>

            <div className="glass-card" style={styles.card}>
                <div style={styles.imageSection}>
                    <img
                        src={plant.image_url || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800'}
                        alt={plant.name}
                        style={styles.image}
                    />
                    <div style={styles.imageGradient}></div>
                    <button
                        style={{ ...styles.favoriteBtn, ...(isSaved ? { background: 'var(--error)' } : {}) }}
                        title={isSaved ? "Saved to profile!" : "Save to favorites"}
                        onClick={handleSave}
                        disabled={isSaving || isSaved}
                    >
                        <Heart size={24} color={isSaved ? "white" : "var(--error)"} fill={isSaved ? "white" : "none"} />
                    </button>
                    <div style={styles.imageLabel}>
                        <Sparkles size={16} /> Verified Botanical Record
                    </div>
                </div>

                <div style={styles.contentSection}>
                    <div style={styles.header}>
                        <span className="badge">{plant.category}</span>
                        <h1 style={styles.title}>{plant.name}</h1>
                        <p style={styles.scientific}><em>{plant.scientific}</em></p>
                        {/* Price + Cart Row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                            {plant.price && (
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>
                                    ₹{plant.price}
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '6px' }}>per unit</span>
                                </div>
                            )}
                            <button
                                onClick={() => { addToCart(plant); setCartAdded(true); setTimeout(() => setCartAdded(false), 2500); }}
                                className="btn btn-primary"
                                style={{ padding: '0.7rem 1.6rem', fontSize: '1rem', gap: '0.5rem' }}
                            >
                                {cartAdded ? <Check size={18} /> : <ShoppingCart size={18} />}
                                {cartAdded ? 'Added to Cart!' : 'Add to Cart'}
                            </button>
                        </div>
                    </div>

                    <div style={styles.infoBlocksGrid}>
                        <div style={styles.infoBlock} className="card shadow-sm stagger-1 animate-slide-up">
                            <div style={styles.iconWrapperNeutral}>
                                <Info size={22} color="var(--primary-dark)" />
                            </div>
                            <div>
                                <h3 style={styles.blockTitle}>Overview</h3>
                                <p style={{ margin: 0, color: 'var(--text-muted)' }}>{plant.description}</p>
                            </div>
                        </div>

                        <div style={styles.infoBlock} className="card shadow-sm stagger-2 animate-slide-up">
                            <div style={styles.iconWrapperSuccess}>
                                <ShieldCheck size={22} color="var(--success)" />
                            </div>
                            <div>
                                <h3 style={styles.blockTitle}>Health Benefits</h3>
                                <p style={{ margin: 0, color: 'var(--text-muted)' }}>{plant.benefits}</p>
                            </div>
                        </div>

                        <div style={{ ...styles.infoBlock, gridColumn: '1 / -1' }} className="card shadow-sm stagger-3 animate-slide-up">
                            <div style={styles.iconWrapperWarning}>
                                <SunDim size={22} color="#ff9f1c" />
                            </div>
                            <div>
                                <h3 style={styles.blockTitle}>Growing Season</h3>
                                <p style={{ margin: 0, color: 'var(--text-muted)' }}>{plant.season || 'All Seasons'}</p>
                            </div>
                        </div>

                        <div style={{ gridColumn: '1 / -1', ...styles.infoBlock }} className="card shadow-sm stagger-3 animate-slide-up">
                            <div style={styles.iconWrapperPrimary}>
                                <Droplets size={22} color="var(--primary)" />
                            </div>
                            <div>
                                <h3 style={styles.blockTitle}>Traditional & Medicinal Uses</h3>
                                <p style={{ margin: 0, color: 'var(--text-muted)' }}>{plant.uses}</p>
                            </div>
                        </div>
                    </div>

                    {/* REVIEWS SECTION */}
                    <div className="card shadow-sm animate-slide-up" style={{ padding: '2.5rem', marginTop: '1rem', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 'var(--radius-lg)' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', fontSize: '1.6rem', fontWeight: 800 }}>
                            <Star size={24} color="#f5b700" fill="#f5b700" /> Community Reviews ({reviews.length})
                        </h2>
                        
                        {localStorage.getItem('herbal_user') ? (
                            <form onSubmit={handleReviewSubmit} style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '2rem', borderBottom: '1px solid #eee' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Your Rating</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {[1,2,3,4,5].map(star => (
                                            <button key={star} type="button" onClick={() => setRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'transform 0.2s' }}>
                                                <Star size={32} color={star <= rating ? "#f5b700" : "#ddd"} fill={star <= rating ? "#f5b700" : "none"} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <textarea 
                                    value={comment} 
                                    onChange={e => setComment(e.target.value)} 
                                    placeholder="Share your experience and results with this botanical..." 
                                    style={{ padding: '1rem', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.08)', backgroundColor: 'var(--surface)', minHeight: '100px', fontFamily: 'inherit', fontSize: '1rem', outline: 'none', resize: 'vertical' }} 
                                    required 
                                />
                                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '0.7rem 1.5rem' }} disabled={isSubmittingReview}>
                                    {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                                </button>
                            </form>
                        ) : (
                            <div style={{ padding: '1.5rem', background: 'rgba(58, 134, 255, 0.05)', borderRadius: '12px', marginBottom: '2.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Info size={18} color="var(--primary)" /> 
                                <span>Please <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>log in</Link> to share your experience.</span>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {reviews.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>No reviews yet. Be the first to share your herbal wisdom!</p>
                            ) : reviews.map((rev, i) => (
                                <div key={i} style={{ paddingBottom: '1.5rem', borderBottom: i !== reviews.length - 1 ? '1px solid #eee' : 'none' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <strong style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                                                {rev.user_name.charAt(0).toUpperCase()}
                                            </div>
                                            {rev.user_name}
                                        </strong>
                                        <div style={{ display: 'flex', gap: '2px' }}>
                                            {[...Array(5)].map((_, j) => <Star key={j} size={16} color={j < rev.rating ? "#f5b700" : "#ddd"} fill={j < rev.rating ? "#f5b700" : "none"} />)}
                                        </div>
                                    </div>
                                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', lineHeight: 1.6 }}>{rev.comment}</p>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(rev.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 0 2rem 0'
    },
    backBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '2rem',
        padding: '0.5rem 1rem',
        borderRadius: 'var(--radius-full)',
        border: '1px solid rgba(0,0,0,0.1)',
        transition: 'var(--transition)',
        fontWeight: 600,
        background: 'var(--surface)'
    },
    card: {
        display: 'grid',
        gridTemplateColumns: 'minmax(350px, 1fr) 1.5fr',
        gap: '3rem',
        padding: '2.5rem',
        alignItems: 'start'
    },
    imageSection: {
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        height: '100%',
        minHeight: '450px',
        boxShadow: 'var(--shadow-md)'
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        position: 'absolute',
        top: 0,
        left: 0
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
        pointerEvents: 'none'
    },
    favoriteBtn: {
        position: 'absolute',
        top: '1.5rem',
        right: '1.5rem',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(4px)',
        border: 'none',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
    },
    imageLabel: {
        position: 'absolute',
        bottom: '1.5rem',
        left: '1.5rem',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: 600,
        letterSpacing: '0.5px'
    },
    contentSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
    },
    header: {
        borderBottom: '2px solid rgba(0,0,0,0.05)',
        paddingBottom: '1.5rem'
    },
    title: {
        fontSize: '3rem',
        margin: '1rem 0 0.25rem 0',
        lineHeight: 1.1,
        letterSpacing: '-1px'
    },
    scientific: {
        fontSize: '1.4rem',
        color: 'var(--primary)',
        margin: 0,
        fontWeight: 500
    },
    infoBlocksGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
    },
    infoBlock: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1.5rem',
        border: '1px solid rgba(0,0,0,0.03)'
    },
    iconWrapperNeutral: {
        background: 'rgba(0,0,0,0.05)',
        width: '45px',
        height: '45px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconWrapperSuccess: {
        background: 'rgba(6, 214, 160, 0.15)',
        width: '45px',
        height: '45px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconWrapperPrimary: {
        background: 'rgba(43, 147, 72, 0.1)',
        width: '45px',
        height: '45px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconWrapperWarning: {
        background: 'rgba(255, 159, 28, 0.1)',
        width: '45px',
        height: '45px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    blockTitle: {
        fontSize: '1.2rem',
        marginBottom: '0.5rem',
        color: 'var(--text-main)',
        fontWeight: 700
    }
};

// Add responsive layout adjustment for smaller screens
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @media (max-width: 900px) {
    div[style*="minmax(350px, 1fr) 1.5fr"] {
      grid-template-columns: 1fr !important;
      gap: 2rem !important;
      padding: 1.5rem !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default PlantDetails;

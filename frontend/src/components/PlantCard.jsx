import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Check, SunDim } from 'lucide-react';
import { useCart } from '../context/CartContext';

const PlantCard = ({ plant, index = 0 }) => {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(plant);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div
            className={`card plant-card animate-slide-up stagger-${(index % 4) + 1}`}
            style={styles.cardContainer}
        >
            <div style={styles.imageContainer}>
                <img
                    src={plant.image_url || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=400'}
                    alt={plant.name}
                    style={styles.image}
                />
                <div style={styles.imageOverlay}></div>
                <span className="badge" style={styles.badge}>{plant.category}</span>
                {/* Price Tag */}
                {plant.price && (
                    <div style={styles.priceTag}>₹{plant.price}</div>
                )}
            </div>

            <div style={styles.content}>
                <div style={styles.header}>
                    <h3 style={styles.title}>{plant.name}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                        <p style={styles.scientific}><em>{plant.scientific}</em></p>
                        {plant.season && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#ff9f1c', fontWeight: 800, background: 'rgba(255, 159, 28, 0.12)', padding: '0.2rem 0.6rem', borderRadius: '20px', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
                                <SunDim size={12} /> {plant.season}
                            </span>
                        )}
                    </div>
                </div>

                <p style={styles.benefits}>{plant.benefits}</p>

                <div style={styles.foot}>
                    <Link
                        to={`/plant/${encodeURIComponent(plant.name)}`}
                        style={styles.btn}
                        className="link-hover"
                    >
                        <span style={styles.btnText}>Explore Details</span>
                        <div style={styles.btnIconWrapper}>
                            <ArrowRight size={16} color="white" />
                        </div>
                    </Link>

                    <button
                        style={{ ...styles.cartBtn, ...(added ? styles.cartBtnAdded : {}) }}
                        onClick={handleAddToCart}
                        title="Add to Cart"
                    >
                        {added ? <Check size={15} /> : <ShoppingCart size={15} />}
                        {added ? 'Added!' : 'Add'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    cardContainer: {
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        border: '1px solid rgba(0,0,0,0.04)'
    },
    imageContainer: {
        position: 'relative',
        height: '220px',
        width: '100%',
        overflow: 'hidden'
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
        background: 'linear-gradient(to top, var(--surface) 0%, transparent 100%)',
        pointerEvents: 'none'
    },
    badge: {
        position: 'absolute',
        top: '1.25rem',
        right: '1.25rem',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(255,255,255,0.9)',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
    },
    priceTag: {
        position: 'absolute',
        bottom: '1rem',
        left: '1rem',
        background: 'linear-gradient(135deg, #2b9348, #55a630)',
        color: 'white',
        fontWeight: 800,
        fontSize: '1rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '30px',
        boxShadow: '0 4px 12px rgba(43,147,72,0.4)',
        letterSpacing: '0.5px'
    },
    content: {
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        gap: '0.75rem'
    },
    header: { marginBottom: '0.25rem' },
    title: {
        margin: 0,
        fontSize: '1.4rem',
        fontWeight: 700,
        letterSpacing: '-0.5px',
        display: '-webkit-box',
        WebkitLineClamp: 1,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
    },
    scientific: {
        color: 'var(--primary)',
        fontSize: '0.95rem',
        margin: '0.2rem 0 0 0',
        fontWeight: 500
    },
    benefits: {
        fontSize: '0.95rem',
        color: 'var(--text-muted)',
        lineHeight: 1.5,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        flexGrow: 1
    },
    foot: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '1rem',
        borderTop: '1px solid rgba(0,0,0,0.05)',
        gap: '0.5rem'
    },
    btn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontWeight: 600,
        color: 'var(--text-main)',
        textDecoration: 'none',
        transition: 'var(--transition)'
    },
    btnText: { fontSize: '1rem' },
    btnIconWrapper: {
        background: 'var(--primary)',
        borderRadius: '50%',
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(43, 147, 72, 0.4)'
    },
    cartBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        background: 'rgba(43,147,72,0.1)',
        border: '1.5px solid var(--primary)',
        borderRadius: '30px',
        padding: '0.35rem 0.85rem',
        color: 'var(--primary)',
        fontWeight: 700,
        fontSize: '0.88rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        whiteSpace: 'nowrap'
    },
    cartBtnAdded: {
        background: 'var(--primary)',
        color: 'white'
    }
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `
  .plant-card:hover img { transform: scale(1.08); }
  .plant-card:hover .link-hover > div { transform: translateX(4px); background: var(--primary-light); }
  .plant-card:hover .link-hover span { color: var(--primary); }
`;
document.head.appendChild(styleSheet);

export default PlantCard;

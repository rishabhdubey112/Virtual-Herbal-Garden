import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, User, ScanLine, BookOpen, Shield, ShoppingCart, Activity } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState(null);
    const location = useLocation();
    const { totalItems } = useCart();

    useEffect(() => {
        const storedUser = localStorage.getItem('herbal_user');
        if (storedUser) setUser(JSON.parse(storedUser));

        const handleUserChange = () => {
            const updatedUser = localStorage.getItem('herbal_user');
            setUser(updatedUser ? JSON.parse(updatedUser) : null);
        };

        window.addEventListener('herbal_user_changed', handleUserChange);
        return () => window.removeEventListener('herbal_user_changed', handleUserChange);
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path) => location.pathname === path;

    return (
        <nav style={{ ...styles.nav, ...(scrolled ? styles.navScrolled : {}) }} className="glass">
            <div className="container" style={styles.container}>

                {/* Logo */}
                <Link to="/" style={styles.logo}>
                    <div style={styles.iconWrap}>
                        <Leaf size={22} color="white" />
                    </div>
                    <span style={styles.logoText}>Herbal Garden</span>
                </Link>

                {/* Links */}
                <div style={styles.links}>
                    <Link to="/" style={{ ...styles.link, ...(isActive('/') ? styles.activeLink : {}) }}>
                        <BookOpen size={16} /> Library
                    </Link>
                    <Link to="/identify" style={{ ...styles.link, ...(isActive('/identify') ? styles.activeLink : {}) }}>
                        <ScanLine size={16} /> Identify
                    </Link>
                    <Link to="/consult" style={{ ...styles.link, ...(isActive('/consult') ? styles.activeLink : {}) }}>
                        <Activity size={16} /> AI Doctor
                    </Link>
                    <Link to="/admin" style={{ ...styles.link, ...(isActive('/admin') ? styles.activeLink : {}) }}>
                        <Shield size={16} /> Admin
                    </Link>

                    {/* Cart Icon with Badge */}
                    <Link to="/cart" style={{ ...styles.link, ...(isActive('/cart') ? styles.activeLink : {}), position: 'relative' }}>
                        <ShoppingCart size={18} />
                        Cart
                        {totalItems > 0 && (
                            <span style={styles.badge}>{totalItems}</span>
                        )}
                    </Link>

                    <Link to="/login" className="btn btn-primary" style={styles.loginBtn}>
                        <User size={17} /> {user?.name ? `Hi, ${user.name}` : 'Sign In'}
                    </Link>
                </div>
            </div>

            <style>{`
        nav a { transition: var(--transition); }
        @media (max-width: 640px) {
          .nav-links { gap: 0.75rem !important; font-size: 0.9rem; }
        }
      `}</style>
        </nav>
    );
};

const styles = {
    nav: {
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '1rem 0',
        transition: 'all 0.3s ease'
    },
    navScrolled: {
        padding: '0.7rem 0',
        boxShadow: 'var(--shadow-sm)'
    },
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        textDecoration: 'none'
    },
    iconWrap: {
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
        padding: '0.5rem',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(43, 147, 72, 0.35)'
    },
    logoText: {
        fontWeight: 800,
        fontSize: '1.35rem',
        letterSpacing: '-0.5px',
        color: 'var(--primary-dark)'
    },
    links: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem'
    },
    link: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontWeight: 600,
        color: 'var(--text-muted)',
        textDecoration: 'none',
        fontSize: '1rem',
        padding: '0.3rem 0',
        borderBottom: '2px solid transparent'
    },
    activeLink: {
        color: 'var(--primary)',
        borderBottomColor: 'var(--primary)'
    },
    loginBtn: {
        padding: '0.55rem 1.4rem',
        gap: '0.4rem',
        fontSize: '1rem'
    },
    badge: {
        position: 'absolute',
        top: '-8px',
        right: '-14px',
        background: '#ef476f',
        color: 'white',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        fontSize: '0.72rem',
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(239,71,111,0.5)'
    }
};

export default Navbar;

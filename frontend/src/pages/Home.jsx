import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Mic, ScanLine } from 'lucide-react';
import PlantCard from '../components/PlantCard';

const CATEGORIES = ['All', 'Immunity', 'Digestion', 'Skin Care', 'Stress Relief'];

const Home = () => {
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');

    // Initial load
    useEffect(() => {
        fetchPlants('', '');
    }, []);

    // Refetch when category changes
    useEffect(() => {
        fetchPlants(searchTerm, category);
    }, [category]);

    // Debounced search
    useEffect(() => {
        const t = setTimeout(() => fetchPlants(searchTerm, category), 500);
        return () => clearTimeout(t);
    }, [searchTerm]);

    const fetchPlants = async (search = '', cat = '') => {
        setLoading(true);
        setFetchError('');
        try {
            const params = new URLSearchParams();
            if (cat && cat !== 'All') params.append('category', cat);
            if (search.trim()) params.append('search', search.trim());

            const url = `http://localhost:5000/plants${params.toString() ? '?' + params.toString() : ''}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Server error');
            const data = await res.json();
            if (data.success) setPlants(data.plants);
            else throw new Error(data.message);
        } catch (err) {
            setFetchError('Could not reach the Flask backend. Make sure it is running on port 5000.');
            setPlants([]);
        } finally {
            setLoading(false);
        }
    };

    const handleVoiceSearch = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return alert('Voice search is not supported in your browser.');
        const rec = new SR();
        rec.lang = 'en-US';
        rec.onresult = (e) => setSearchTerm(e.results[0][0].transcript);
        rec.start();
    };

    return (
        <div style={styles.page}>
            {/* ===== Hero ===== */}
            <section style={styles.hero} className="animate-fade-in">
                <div style={styles.heroDots} aria-hidden="true" />
                <div style={styles.heroInner}>
                    <p className="animate-slide-up stagger-1" style={styles.heroPill}>🌿 Your Digital Botanical Companion</p>
                    <h1 className="animate-slide-up stagger-2" style={styles.heroH1}>
                        Discover Nature's<br />
                        <span style={styles.gradient}>Healing Secrets</span>
                    </h1>
                    <p className="animate-slide-up stagger-3" style={styles.heroSub}>
                        Browse hundreds of medicinal herbs, identify plants with AI, and unlock centuries of herbal wisdom.
                    </p>
                    <div className="animate-slide-up stagger-4" style={styles.heroBtns}>
                        <Link to="/identify" className="btn btn-primary" style={{ padding: '0.9rem 2.2rem', fontSize: '1.1rem' }}>
                            <ScanLine size={20} /> Try AI Identifier
                        </Link>
                        <a href="#library" className="btn btn-outline" style={{ padding: '0.9rem 2.2rem', fontSize: '1.1rem' }}>
                            Explore Library
                        </a>
                    </div>
                </div>
            </section>

            {/* ===== Library ===== */}
            <section id="library" style={styles.library}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }} className="animate-slide-up">
                    <h2 style={{ fontSize: '2.5rem', letterSpacing: '-1px' }}>Botanical Library</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Explore our curated catalog of natural remedies</p>
                </div>

                {/* Search */}
                <div style={styles.searchRow} className="animate-slide-up stagger-1">
                    <div style={styles.searchWrap}>
                        <Search style={styles.searchIcon} />
                        <input
                            className="input-field"
                            style={styles.searchInput}
                            type="text"
                            placeholder="Search herbs by name, use, or benefit…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button style={styles.micBtn} onClick={handleVoiceSearch} title="Voice search">
                            <Mic size={18} color="var(--primary)" />
                        </button>
                    </div>
                </div>

                {/* Category Filter */}
                <div style={styles.filterRow} className="animate-slide-up stagger-2 scrollbar-hide">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`btn ${(category === cat || (!category && cat === 'All')) ? 'btn-primary' : 'btn-outline'}`}
                            style={{ padding: '0.5rem 1.2rem', fontSize: '0.95rem', whiteSpace: 'nowrap' }}
                            onClick={() => setCategory(cat === 'All' ? '' : cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Error */}
                {fetchError && (
                    <div style={styles.errorBox}>{fetchError}</div>
                )}

                {/* Grid */}
                {loading ? (
                    <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="loader"></div>
                    </div>
                ) : plants.length > 0 ? (
                    <div style={styles.grid}>
                        {plants.map((plant, idx) => <PlantCard key={plant.id} plant={plant} index={idx} />)}
                    </div>
                ) : !fetchError ? (
                    <div className="glass-card" style={styles.empty}>
                        <span style={{ fontSize: '3rem' }}>🔍</span>
                        <h3>No plants found</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or category filter.</p>
                        <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => { setSearchTerm(''); setCategory(''); }}>
                            Clear Filters
                        </button>
                    </div>
                ) : null}
            </section>
        </div>
    );
};

const styles = {
    page: { display: 'flex', flexDirection: 'column', gap: '5rem' },
    // Hero
    hero: { position: 'relative', textAlign: 'center', padding: '5rem 2rem', background: 'var(--hero-gradient)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' },
    heroDots: { position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(var(--primary-light) 1px, transparent 1px)', backgroundSize: '30px 30px', opacity: 0.12, pointerEvents: 'none' },
    heroInner: { position: 'relative', maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', zIndex: 1 },
    heroPill: { display: 'inline-block', padding: '0.5rem 1.25rem', background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--primary-dark)' },
    heroH1: { fontSize: 'clamp(2.8rem, 6vw, 4.5rem)', lineHeight: 1.1, letterSpacing: '-2px', margin: 0, color: 'var(--text-main)' },
    gradient: { background: 'linear-gradient(135deg, var(--primary) 0%, #007f5f 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' },
    heroSub: { fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '550px', lineHeight: 1.6, margin: 0 },
    heroBtns: { display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' },
    // Library
    library: {},
    searchRow: { maxWidth: '620px', margin: '0 auto 1.5rem auto', width: '100%' },
    searchWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
    searchIcon: { position: 'absolute', left: '1.25rem', color: 'var(--text-muted)', width: 20, height: 20 },
    searchInput: { paddingLeft: '3.25rem', paddingRight: '3.5rem', borderRadius: 'var(--radius-full)', height: '56px', fontSize: '1.05rem', boxShadow: 'var(--shadow-sm)' },
    micBtn: { position: 'absolute', right: '1rem', background: 'transparent', display: 'flex' },
    filterRow: { display: 'flex', gap: '0.75rem', overflowX: 'auto', padding: '0.5rem 0 1.5rem 0', justifyContent: 'center', flexWrap: 'wrap' },
    errorBox: { padding: '1rem 1.5rem', background: 'rgba(239,71,111,0.08)', borderLeft: '4px solid var(--error)', borderRadius: '8px', color: 'var(--error)', marginBottom: '1.5rem', fontWeight: 500 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' },
    empty: { textAlign: 'center', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }
};

export default Home;

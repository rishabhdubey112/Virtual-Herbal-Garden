import React, { useState } from 'react';
import { Send, Activity, Sparkles, AlertCircle, ArrowRight, HeartPulse, Stethoscope, Droplets, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Consult = () => {
    const [symptoms, setSymptoms] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState([]);
    const [searched, setSearched] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!symptoms.trim()) return;
        
        setLoading(true);
        setError('');
        setSearched(false);
        setResults([]);

        try {
            const res = await fetch('http://localhost:5000/consult', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symptoms })
            });
            const data = await res.json();
            
            if (data.success) {
                setResults(data.recommendations || []);
                setSearched(true);
            } else {
                setError(data.message || 'Failed to analyze symptoms.');
            }
        } catch (err) {
            setError('Could not connect to the AI server. Please make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={S.page}>
            {/* Header / Hero Section */}
            <div style={S.heroBanner} className="animate-fade-in">
                <div style={S.heroIconWrapper}>
                    <Stethoscope size={40} color="var(--primary-dark)" />
                </div>
                <h1 style={S.title}>AI Herbal Consultant</h1>
                <p style={S.subtitle}>Describe your symptoms, and our Ayurvedic AI will recommend<br/>the best botanical remedies from our garden.</p>
            </div>

            {/* Input Form */}
            <div className="glass-card animate-slide-up" style={S.formCard}>
                <form onSubmit={handleSubmit} style={S.form}>
                    <div style={S.inputArea}>
                        <Activity size={20} style={S.inputIcon} />
                        <textarea
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            placeholder="E.g., I have a mild headache, feeling nauseous, and my throat is a bit scratchy..."
                            style={S.textarea}
                            rows={3}
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={S.submitBtn} disabled={loading || !symptoms.trim()}>
                        {loading ? (
                            <><div className="loader" style={{ width: 18, height: 18, borderWidth: '2px', borderColor: 'white', borderTopColor: 'transparent' }}></div> Analyzing...</>
                        ) : (
                            <><Send size={18} /> Find Remedy</>
                        )}
                    </button>
                </form>

                <div style={S.disclaimerRow}>
                    <AlertCircle size={14} />
                    <span><strong>Disclaimer:</strong> This AI provides herbal suggestions for minor ailments. It is not a substitute for professional medical advice.</span>
                </div>
                
                {error && <div style={S.errorBox}>{error}</div>}
            </div>

            {/* Loading State */}
            {loading && (
                <div style={S.loadingSection} className="animate-fade-in">
                    <div style={S.pulsingIcon}><HeartPulse size={40} color="var(--primary)" /></div>
                    <h3 style={{ margin: '1rem 0 0.5rem' }}>Consulting the Ayurvedic Texts...</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Analyzing your symptoms against our botanical library</p>
                </div>
            )}

            {/* Results Section */}
            {searched && !loading && (
                <div style={S.resultsSection} className="animate-slide-up">
                    <div style={S.resultsHeader}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                            <Sparkles size={24} color="#f77f00" /> Recommended Remedies
                        </h2>
                        {results.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>Could not find a perfect match in our current library.</p>
                        ) : (
                            <p style={{ color: 'var(--text-muted)' }}>Based on your symptoms, here are {results.length} targeted recommendations from our garden.</p>
                        )}
                    </div>

                    <div style={S.remedyGrid}>
                        {results.map((rec, idx) => {
                            const plant = rec.plant_details;
                            const hasDetails = Boolean(plant);
                            const plantName = hasDetails ? plant.name : rec.plant_name || 'Herbal Recommendation';
                            const plantScientific = hasDetails ? plant.scientific : 'Herbal suggestion from AI';

                            return (
                                <div key={idx} className="glass-card stagger-1" style={S.remedyCard}>
                                    <div style={S.remedyMain}>
                                        {hasDetails ? (
                                            <div style={S.remedyImageWrap}>
                                                <img src={plant.image_url} alt={plant.name} style={S.remedyImage} />
                                                <span style={S.categoryBadge}>{plant.category}</span>
                                            </div>
                                        ) : (
                                            <div style={S.remedyFallbackImage}>
                                                <div style={S.noImageText}>{plantName}</div>
                                            </div>
                                        )}

                                        <div style={S.remedyContent}>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <h3 style={S.remedyName}>{plantName}</h3>
                                                <span style={S.remedyScientific}>{plantScientific}</span>
                                            </div>
                                            
                                            <div style={S.aiAnalysis}>
                                                <div style={S.aiHeader}><Sparkles size={14} color="var(--primary-dark)" /> AI Analysis</div>
                                                <p style={S.aiReason}>{rec.reason}</p>
                                            </div>

                                            <div style={S.usageBlock}>
                                                <div style={S.usageHeader}><Droplets size={14} color="#3a86ff" /> Recommended Usage</div>
                                                <p style={S.usageText}>{rec.usage}</p>
                                            </div>

                                            <div style={S.actionRow}>
                                                {hasDetails ? (
                                                    <>
                                                        <div style={S.priceText}>₹{plant.price} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ unit</span></div>
                                                        <Link to={`/plant/${encodeURIComponent(plant.name)}`} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                                                            View details <ArrowUpRight size={16} />
                                                        </Link>
                                                    </>
                                                ) : (
                                                    <div style={S.priceText}>No matching item in inventory</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const S = {
    page: { maxWidth: '1000px', margin: '0 auto', padding: '1rem 0 5rem' },
    heroBanner: {
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(85, 166, 48, 0.1) 0%, rgba(43, 147, 72, 0.02) 100%)',
        padding: '3rem 2rem',
        borderRadius: '24px',
        marginBottom: '2rem',
        border: '1px solid rgba(43, 147, 72, 0.1)'
    },
    heroIconWrapper: {
        width: '80px', height: '80px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.5rem',
        boxShadow: '0 8px 32px rgba(43,147,72,0.15)'
    },
    title: { fontSize: '2.5rem', fontWeight: 800, margin: '0 0 1rem', letterSpacing: '-1px', color: 'var(--text-main)' },
    subtitle: { fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 },
    
    formCard: { padding: '2rem', maxWidth: '800px', margin: '0 auto 3rem', zIndex: 10, position: 'relative' },
    form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    inputArea: { position: 'relative' },
    inputIcon: { position: 'absolute', top: '1.2rem', left: '1.2rem', color: 'var(--primary)', opacity: 0.7 },
    textarea: {
        width: '100%', padding: '1.2rem 1.2rem 1.2rem 3.5rem', borderRadius: '16px',
        border: '2px solid rgba(0,0,0,0.08)', backgroundColor: 'var(--surface)',
        fontSize: '1.05rem', fontFamily: 'inherit', resize: 'vertical',
        minHeight: '120px', transition: 'all 0.3s ease', outline: 'none'
    },
    submitBtn: { height: '56px', fontSize: '1.1rem', justifyContent: 'center', gap: '0.5rem', borderRadius: '12px' },
    
    disclaimerRow: { display: 'flex', gap: '0.5rem', alignItems: 'flex-start', color: '#888', fontSize: '0.8rem', marginTop: '1.2rem', padding: '0.75rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px' },
    errorBox: { padding: '1rem', background: 'rgba(239,71,111,0.1)', color: 'var(--error)', borderRadius: '8px', marginTop: '1rem', fontSize: '0.95rem' },
    
    loadingSection: { textAlign: 'center', padding: '3rem 0' },
    pulsingIcon: {
        width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(43,147,72,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
        animation: 'pulse 2s infinite'
    },
    
    resultsSection: { padding: '1rem 0' },
    resultsHeader: { marginBottom: '2rem', textAlign: 'center' },
    remedyGrid: { display: 'flex', flexDirection: 'column', gap: '2rem' },
    
    remedyCard: { padding: 0, overflow: 'hidden' },
    remedyMain: { display: 'flex', flexDirection: 'row', minHeight: '300px' },
    remedyImageWrap: { width: '35%', position: 'relative', minHeight: '100%' },
    remedyImage: { width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 },
    remedyFallbackImage: { width: '35%', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.04)', borderRadius: '0 0 0 0', padding: '1rem' },
    noImageText: { color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center', padding: '1rem' },
    categoryBadge: { position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(255,255,255,0.9)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, backdropFilter: 'blur(4px)' },
    
    remedyContent: { width: '65%', padding: '2rem', display: 'flex', flexDirection: 'column' },
    remedyName: { fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.25rem', letterSpacing: '-0.5px' },
    remedyScientific: { color: 'var(--primary)', fontStyle: 'italic', fontSize: '1rem' },
    
    aiAnalysis: { background: 'linear-gradient(to right, rgba(247, 127, 0, 0.08), transparent)', padding: '1rem 1.2rem', borderRadius: '12px', borderLeft: '4px solid #f77f00', marginBottom: '1rem' },
    aiHeader: { display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 800, color: '#f77f00', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' },
    aiReason: { margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.5, fontWeight: 500 },
    
    usageBlock: { background: 'rgba(58, 134, 255, 0.05)', padding: '1rem 1.2rem', borderRadius: '12px', marginBottom: '2rem' },
    usageHeader: { display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 800, color: '#3a86ff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' },
    usageText: { margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 },
    
    actionRow: { marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' },
    priceText: { fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }
};

// Add styles
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @media (max-width: 768px) {
    div[style*="flex-direction: row"] {
      flex-direction: column !important;
    }
    div[style*="width: 35%"] { width: 100% !important; height: 250px !important; position: relative !important; }
    div[style*="width: 65%"] { width: 100% !important; }
  }
  @keyframes pulse {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(43, 147, 72, 0.4); }
    70% { transform: scale(1); box-shadow: 0 0 0 30px rgba(43, 147, 72, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(43, 147, 72, 0); }
  }
`;
document.head.appendChild(styleSheet);

export default Consult;

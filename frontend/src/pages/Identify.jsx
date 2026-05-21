import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Upload, Type, Sparkles, ArrowRight, CheckCircle,
    Leaf, ScanLine, X, ShieldCheck, FlaskConical, MapPin, Eye,
    Camera as CameraIcon, Mic, StopCircle, RefreshCw
} from 'lucide-react';

const Identify = () => {
    const [mode, setMode] = useState('image');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [textInput, setTextInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [isDragActive, setDrag] = useState(false);

    // WebRTC & Speech State
    const videoRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    const [stream, setStream] = useState(null);
    const [isListening, setIsListening] = useState(false);

    // Stop camera when switching out of camera mode
    React.useEffect(() => {
        if (mode !== 'camera' && stream) {
            stream.getTracks().forEach(t => t.stop());
            setStream(null);
        }
    }, [mode]);

    // Cleanup camera on unmount
    React.useEffect(() => {
        return () => {
            if (stream) stream.getTracks().forEach(t => t.stop());
        };
    }, [stream]);

    const startCamera = async () => {
        setResult(null); setError(''); setFile(null); setPreview(null);
        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setStream(s);
            if (videoRef.current) videoRef.current.srcObject = s;
        } catch (err) {
            setError("Could not access camera. Please ensure permissions are granted.");
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const v = videoRef.current;
        const c = canvasRef.current;
        c.width = v.videoWidth || 640;
        c.height = v.videoHeight || 480;
        const ctx = c.getContext('2d');
        ctx.drawImage(v, 0, 0, c.width, c.height);

        c.toBlob((blob) => {
            const f = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
            pickFile(f);
            setMode('image'); // Switch to preview
        }, 'image/jpeg', 0.9);
    };

    const toggleListening = () => {
        if (isListening) return; // Speech API auto-stops on end

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError("Voice Search isn't supported securely on this browser. Try Chrome or Edge.");
            return;
        }
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;

        rec.onstart = () => setIsListening(true);
        rec.onresult = (e) => {
            const transcript = Array.from(e.results)
                .map(r => r[0].transcript).join('');
            setTextInput(transcript);
        };
        rec.onerror = (e) => {
            setIsListening(false);
            if (e.error !== 'no-speech') setError("Microphone error: " + e.error);
        };
        rec.onend = () => setIsListening(false);
        rec.start();
    };

    const onDrag = (e) => {
        e.preventDefault();
        setDrag(e.type === 'dragenter' || e.type === 'dragover');
    };
    const onDrop = (e) => {
        e.preventDefault(); setDrag(false);
        const f = e.dataTransfer.files[0];
        if (f?.type.startsWith('image/')) pickFile(f);
    };
    const pickFile = (f) => {
        setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); setError('');
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        setLoading(true); setError(''); setResult(null);

        try {
            let res;
            const storedUser = localStorage.getItem('herbal_user');
            const userId = storedUser ? JSON.parse(storedUser).id : null;

            if (mode === 'image' && file) {
                const fd = new FormData();
                fd.append('image', file);
                if (userId) fd.append('userId', userId);
                res = await fetch('http://localhost:5000/predict', { method: 'POST', body: fd });
            } else if (mode === 'text' && textInput.trim()) {
                res = await fetch('http://localhost:5000/predict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: textInput.trim(), userId })
                });
            } else {
                setError(mode === 'image' ? 'Please upload an image first.' : 'Please type a plant name or description.');
                setLoading(false);
                return;
            }

            let data;
            try {
                data = await res.json();
            } catch (_) {
                throw new Error(`Server returned ${res.status}`);
            }
            if (!res.ok) {
                throw new Error(data?.message || `Server returned ${res.status}`);
            }

            if (data.success && data.prediction) {
                const failedNames = ['Identification Failed', 'Identification Offline', 'Not a Herbal Plant', 'Unknown Plant'];
                if (data.prediction.is_herbal === false || failedNames.includes(data.prediction.plant) || data.prediction.method === 'System Error') {
                    setError(data.message || data.prediction.analysis_note || 'This plant could not be identified. Try another image.');
                } else {
                    setResult(data.prediction);
                }
            } else {
                setError(data.message || 'Identification failed. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'Cannot connect to the backend on port 5000. Make sure Flask is running.');
        } finally {
            setLoading(false);
        }
    };

    const confColor = (c) =>
        c >= 80 ? 'linear-gradient(90deg,#55a630,#2b9348)'
            : c >= 55 ? 'linear-gradient(90deg,#f4a261,#e76f51)'
                : 'linear-gradient(90deg,#ef476f,#c1121f)';

    const confLabel = (c) =>
        c >= 80 ? '✅ High confidence — strong botanical match.'
            : c >= 55 ? '⚠️ Moderate confidence — verify with a second source.'
                : '❗ Low confidence — try a clearer image or more specific name.';

    return (
        <div style={S.page}>

            {/* ── Header ── */}
            <div style={S.header} className="animate-slide-up">
                <div style={S.hIcon}><Leaf size={30} color="white" /></div>
                <div>
                    <h1 style={S.hTitle}>AI Plant Identifier</h1>
                    <p style={S.hSub}>
                        Powered by <strong>Advanced AI Vision</strong> — upload a photo or describe a plant
                        for accurate botanical identification.
                    </p>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div style={S.tabs} className="animate-slide-up stagger-1">
                {[
                    { key: 'image', icon: <Upload size={17} />, label: 'Upload Image' },
                    { key: 'camera', icon: <CameraIcon size={17} />, label: 'Live Camera' },
                    { key: 'text', icon: <Type size={17} />, label: 'Describe in Text' }
                ].map(t => (
                    <button key={t.key}
                        style={{ ...S.tab, ...(mode === t.key ? S.tabOn : {}) }}
                        onClick={() => {
                            setMode(t.key); setResult(null); setError('');
                            if (t.key === 'camera') setTimeout(startCamera, 100);
                        }}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* ── Two-column grid ── */}
            <div style={S.grid} className="animate-slide-up stagger-2">

                {/* Left — Input */}
                <div className="glass-card" style={S.inputPanel}>
                    <h3 style={S.panelH}>
                        {mode === 'image' && <><ScanLine size={20} /> Upload Plant Photo</>}
                        {mode === 'camera' && <><CameraIcon size={20} /> Camera Capture</>}
                        {mode === 'text' && <><Type size={20} /> Describe the Plant</>}
                    </h3>

                    {mode === 'image' && (
                        !preview ? (
                            <div
                                style={{ ...S.drop, ...(isDragActive ? S.dropOn : {}) }}
                                onDragEnter={onDrag} onDragLeave={onDrag} onDragOver={onDrag} onDrop={onDrop}
                                onClick={() => document.getElementById('fi').click()}>
                                <div style={S.uploadCircle}><Upload size={34} color="#00FF87" /></div>
                                <h4 style={{ margin: '1rem 0 0.4rem', color: '#fff' }}>Drag & drop or click to upload</h4>
                                <p style={S.hint}>JPG, PNG, WEBP — clear leaf on plain background for best results</p>
                                <input id="fi" type="file" accept="image/*" style={{ display: 'none' }}
                                    onChange={(e) => { if (e.target.files[0]) pickFile(e.target.files[0]); }} />
                            </div>
                        ) : (
                            <div style={S.prevWrap}>
                                <button style={S.clearBtn} onClick={() => { setFile(null); setPreview(null); setResult(null); }}>
                                    <X size={15} />
                                </button>
                                <img src={preview} alt="preview" style={S.prevImg} />
                                {loading && (
                                    <div style={S.scanOv}>
                                        <div style={S.beam}></div>
                                        <p style={S.scanTxt}>🤖 AI is analysing…</p>
                                    </div>
                                )}
                            </div>
                        )
                    )}

                    {mode === 'camera' && (
                        <div style={S.camWrap}>
                            <video ref={videoRef} autoPlay playsInline style={S.vidStream} />
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                            {!stream && !error && (
                                <div style={S.camLoader}><RefreshCw className="spin" size={24} color="var(--primary)" /> Accessing Camera…</div>
                            )}
                            <button className="btn btn-primary" style={S.captureBtn} onClick={capturePhoto}>
                                <CameraIcon size={20} /> Snap Photo
                            </button>
                        </div>
                    )}

                    {mode === 'text' && (
                        <div style={{ position: 'relative' }}>
                            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                                Type the plant's <strong>common name</strong>, <strong>scientific name</strong>, or describe its features. Or use your voice!
                            </p>
                            <div style={{ position: 'relative' }}>
                                <textarea
                                    className="input-field"
                                    style={{ minHeight: '180px', resize: 'vertical', lineHeight: 1.7, paddingBottom: '3.5rem' }}
                                    placeholder='e.g. "tulsi", "Aloe vera", "plant with thick spiky green leaves that stores water and gel"…'
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                />
                                <button
                                    style={{ ...S.micBtn, ...(isListening ? S.micBtnActive : {}) }}
                                    onClick={toggleListening}
                                    title="Search by Voice">
                                    {isListening ? <StopCircle size={22} className="pulse" /> : <Mic size={22} />}
                                    {isListening && <span style={S.micText}>Listening...</span>}
                                </button>
                            </div>
                            <div style={S.chips}>
                                <span style={S.chipLabel}>Quick try:</span>
                                {['Tulsi', 'Aloe Vera', 'Neem', 'Ginger', 'Ashwagandha', 'Turmeric', 'Moringa', 'Brahmi'].map(k => (
                                    <button key={k} className="badge" style={S.chip} onClick={() => setTextInput(k)}>{k}</button>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && <div style={S.errBox}>{error}</div>}

                    {mode !== 'camera' && (
                        <button className="btn btn-primary" style={S.analyzeBtn} onClick={handleSubmit} disabled={loading}>
                            {loading
                                ? <><div className="loader" style={{ width: '20px', height: '20px', margin: 0, borderWidth: '2px' }}></div> Analysing with AI…</>
                                : <><Sparkles size={19} /> Identify Plant</>}
                        </button>
                    )}

                    <p style={S.poweredBy}>⚡ Powered by NVIDIA AI Vision</p>
                </div>

                {/* Right — Results */}
                <div style={S.resultCol}>

                    {!result && !loading && (
                        <div className="glass-card" style={S.placeholder}>
                            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🌿</span>
                            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                Results will appear here
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                                Upload a plant image or type a name, then click <strong>Identify Plant</strong>.
                            </p>
                        </div>
                    )}

                    {loading && (
                        <div className="glass-card" style={S.placeholder}>
                            <div className="loader" style={{ marginBottom: '1rem' }}></div>
                            <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>AI Vision is thinking…</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.5rem' }}>This may take 2–5 seconds</p>
                        </div>
                    )}

                    {result && !loading && (
                        <div className="glass-card animate-slide-up" style={S.resCard}>

                            {/* Status */}
                            <div style={S.statusRow}>
                                <div style={S.matchBadge}><CheckCircle size={17} color="var(--success)" /> Identified</div>
                                <span style={S.methodPill}>{result.method}</span>
                            </div>

                            {/* Auto-Add Banner */}
                            {result.added_to_library && (
                                <div style={S.discoveryBanner}>
                                    <Sparkles size={16} color="var(--success)" />
                                    <span><strong>New Discovery!</strong> This unique plant was just saved to your Library!</span>
                                </div>
                            )}

                            {/* Name block */}
                            <div style={S.nameBlock}>
                                <h2 style={S.plantName}>{result.plant}</h2>
                                <div style={S.sciRow}>
                                    <Leaf size={16} color="var(--primary)" />
                                    <em style={S.sci}>{result.scientific_name}</em>
                                </div>
                            </div>

                            {/* Confidence */}
                            <div style={S.confBlock}>
                                <div style={S.confRow}>
                                    <span style={{ fontWeight: 600 }}>AI Confidence Score</span>
                                    <span style={S.confNum}>{result.confidence}%</span>
                                </div>
                                <div style={S.track}>
                                    <div style={{ ...S.fill, width: `${Math.min(result.confidence, 100)}%`, background: confColor(result.confidence) }}></div>
                                </div>
                                <p style={S.confNote}>{confLabel(result.confidence)}</p>
                            </div>

                            {/* Benefits */}
                            {result.benefits && (
                                <div style={S.infoBlock}>
                                    <div style={S.infoHead}><ShieldCheck size={18} color="var(--success)" /><h4 style={S.infoTitle}>Medicinal Benefits</h4></div>
                                    <p style={S.infoText}>{result.benefits}</p>
                                </div>
                            )}

                            {/* Habitat */}
                            {result.habitat && result.habitat !== 'Not determined' && (
                                <div style={{ ...S.infoBlock, background: 'rgba(85,166,48,0.06)', borderLeft: '3px solid var(--primary-light)' }}>
                                    <div style={S.infoHead}><MapPin size={18} color="var(--primary)" /><h4 style={S.infoTitle}>Native Habitat</h4></div>
                                    <p style={S.infoText}>{result.habitat}</p>
                                </div>
                            )}

                            {/* Key Visual Features */}
                            {result.key_features && result.key_features !== 'Not determined' && (
                                <div style={{ ...S.infoBlock, background: 'rgba(0,127,95,0.05)', borderLeft: '3px solid #007f5f' }}>
                                    <div style={S.infoHead}><Eye size={18} color="#007f5f" /><h4 style={S.infoTitle}>Key Identifying Features</h4></div>
                                    <p style={S.infoText}>{result.key_features}</p>
                                </div>
                            )}

                            {/* Analysis Note */}
                            {result.analysis_note && (
                                <div style={{ ...S.infoBlock, background: 'rgba(43,147,72,0.04)', borderLeft: '3px solid var(--primary)' }}>
                                    <div style={S.infoHead}><FlaskConical size={18} color="var(--primary)" /><h4 style={S.infoTitle}>AI Analysis Note</h4></div>
                                    <p style={S.infoText}>{result.analysis_note}</p>
                                </div>
                            )}

                            {/* CTA */}
                            <div style={S.ctaCol}>
                                <Link
                                    to={`/plant/${encodeURIComponent(result.plant)}`}
                                    className="btn btn-primary" style={{ justifyContent: 'center' }}>
                                    Full Medicinal Profile <ArrowRight size={17} />
                                </Link>
                                <Link to="/" className="btn btn-outline" style={{ justifyContent: 'center' }}>
                                    Explore Full Library
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const S = {
    page: { display: 'flex', flexDirection: 'column', gap: '2rem', minHeight: '80vh', position: 'relative', background: 'radial-gradient(circle at top center, #112a1a, #050a07)', padding: '2rem', borderRadius: '30px', boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)' },
    header: { position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '3.5rem 2.5rem', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(13, 27, 17, 0.8), rgba(26, 54, 34, 0.8))', backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.05)' },
    hIcon: { background: 'linear-gradient(135deg, #00FF87, #60EFFF)', padding: '1.2rem', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(0, 255, 135, 0.4)', flexShrink: 0, position: 'relative', zIndex: 1 },
    hTitle: { fontSize: 'clamp(2rem, 5vw, 3.2rem)', margin: 0, letterSpacing: '-1.5px', color: '#fff', fontWeight: 800, textShadow: '0 2px 10px rgba(0,0,0,0.5)', position: 'relative', zIndex: 1 },
    hSub: { color: 'rgba(255,255,255,0.7)', margin: '0.6rem 0 0', fontSize: '1.15rem', position: 'relative', zIndex: 1, fontWeight: 400 },
    tabs: { display: 'flex', gap: '1rem', background: 'rgba(10, 15, 12, 0.6)', padding: '0.5rem', borderRadius: 'var(--radius-full)', width: 'fit-content', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' },
    tab: { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.75rem', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '1rem', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all .4s cubic-bezier(0.16, 1, 0.3, 1)' },
    tabOn: { background: 'linear-gradient(135deg, #00FF87, #60EFFF)', color: '#000', boxShadow: '0 5px 20px rgba(0, 255, 135, 0.4)' },
    grid: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '3rem', alignItems: 'start' },
    inputPanel: { display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(15, 20, 17, 0.7)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '2.5rem', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' },
    panelH: { display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem', margin: 0, color: '#fff', fontWeight: 700 },
    drop: { border: '2px dashed rgba(0, 255, 135, 0.3)', borderRadius: '20px', padding: '3.5rem 1.5rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(0, 255, 135, 0.02)', transition: 'all .4s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' },
    dropOn: { borderColor: '#00FF87', background: 'rgba(0, 255, 135, 0.1)', transform: 'scale(1.02)' },
    uploadCircle: { background: 'linear-gradient(135deg, #2b2b2b, #111)', padding: '1.25rem', borderRadius: '50%', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)' },
    hint: { color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginTop: '0.5rem' },
    prevWrap: { position: 'relative', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', background: '#000' },
    prevImg: { width: '100%', maxHeight: '350px', objectFit: 'cover', display: 'block', opacity: 0.9 },
    clearBtn: { position: 'absolute', top: 15, right: 15, zIndex: 10, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(10px)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' },
    camWrap: { position: 'relative', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(0,255,135,0.3)', boxShadow: '0 0 40px rgba(0, 255, 135, 0.15)', background: '#000', minHeight: '350px', display: 'flex', flexDirection: 'column' },
    vidStream: { width: '100%', maxHeight: '420px', objectFit: 'cover' },
    camLoader: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#00FF87', gap: '0.75rem', fontWeight: 600, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' },
    captureBtn: { position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', borderRadius: 'var(--radius-full)', padding: '1rem 2rem', fontSize: '1.1rem', fontWeight: 700, background: 'linear-gradient(135deg, #00FF87, #60EFFF)', color: '#000', border: 'none', boxShadow: '0 10px 30px rgba(0,255,135,0.4)', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'transform 0.2s' },
    micBtn: { position: 'absolute', bottom: '1.5rem', right: '1.5rem', background: '#111', border: '1px solid rgba(255,255,255,0.1)', color: '#00FF87', padding: '0.8rem', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', zIndex: 5 },
    micBtnActive: { background: '#ef476f', borderColor: '#ef476f', color: '#fff', boxShadow: '0 0 0 0 rgba(239, 71, 111, 0.7)', animation: 'pulse 1.5s infinite' },
    micText: { position: 'absolute', right: '100%', marginRight: '1rem', whiteSpace: 'nowrap', fontWeight: 600, fontSize: '0.9rem', color: '#ef476f', background: 'rgba(239,71,111,0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px' },
    scanOv: { position: 'absolute', inset: 0, background: 'rgba(0, 255, 135, 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' },
    beam: { position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: '#00FF87', boxShadow: '0 0 20px 5px rgba(0,255,135,0.5)', animation: 'scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite' },
    scanTxt: { color: '#00FF87', fontWeight: 800, letterSpacing: '2px', zIndex: 2, marginTop: '2rem', textShadow: '0 2px 10px rgba(0,0,0,0.8)', fontSize: '1.1rem', textTransform: 'uppercase' },
    chips: { display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.5rem' },
    chipLabel: { color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.9rem' },
    chip: { cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '20px', transition: 'all 0.2s' },
    errBox: { padding: '1rem 1.25rem', background: 'rgba(239,71,111,.1)', borderLeft: '4px solid #ef476f', borderRadius: '8px', color: '#ef476f', fontWeight: 500, fontSize: '0.95rem', backdropFilter: 'blur(10px)' },
    analyzeBtn: { width: '100%', height: '60px', fontSize: '1.15rem', gap: '0.75rem', background: 'linear-gradient(135deg, #00FF87, #60EFFF)', color: '#000', borderRadius: '16px', fontWeight: 800, border: 'none', boxShadow: '0 10px 25px rgba(0,255,135,0.3)', textTransform: 'uppercase', letterSpacing: '1px' },
    poweredBy: { textAlign: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', margin: 0, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 },
    resultCol: { display: 'flex', flexDirection: 'column', gap: '2rem' },
    placeholder: { textAlign: 'center', padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(25, 25, 25, 0.6)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' },
    resCard: { display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(15, 15, 15, 0.95)', backdropFilter: 'blur(30px)', border: '1px solid rgba(0,255,135,0.2)', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 30px 60px rgba(0,0,0,0.4), 0 0 40px rgba(0,255,135,0.05)' },
    statusRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' },
    matchBadge: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#00FF87', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' },
    methodPill: { background: 'rgba(255,255,255,0.05)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' },
    discoveryBanner: { background: 'linear-gradient(90deg, rgba(0,255,135,0.15), rgba(96,239,255,0.15))', border: '1px solid rgba(0,255,135,0.4)', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: '#00FF87', marginTop: '-0.5rem', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' },
    nameBlock: { borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem' },
    plantName: { fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', letterSpacing: '-1px', margin: '0 0 0.5rem', color: '#00FF87', textShadow: '0 2px 15px rgba(0, 255, 135, 0.4)', fontWeight: 800 },
    sciRow: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
    sci: { fontSize: '1.2rem', color: '#60EFFF', fontWeight: 500, letterSpacing: '0.5px' },
    confBlock: { background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' },
    confRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    confNum: { fontSize: '2rem', fontWeight: 800, color: '#00FF87', textShadow: '0 0 20px rgba(0,255,135,0.4)' },
    track: { height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-full)', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)' },
    fill: { height: '100%', borderRadius: 'var(--radius-full)', transition: 'width 1.5s cubic-bezier(0.22, 1, 0.36, 1)' },
    confNote: { margin: '1rem 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 },
    infoBlock: { background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2), 0 5px 15px rgba(0,0,0,0.1)' },
    infoHead: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
    infoTitle: { margin: 0, fontSize: '1.05rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#fff' },
    infoText: { margin: 0, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontSize: '0.95rem' },
    ctaCol: { display: 'flex', gap: '1rem', marginTop: '1rem' }
};

const ss = document.createElement('style');
ss.textContent = `
  @keyframes scan {
    0%   { top: -10%; opacity: 0; }
    15%  { opacity: 1; }
    85%  { opacity: 1; }
    100% { top: 110%; opacity: 0; }
  }
  @keyframes pulse {
    0%   { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 71, 111, 0.4); }
    70%  { transform: scale(1.1); box-shadow: 0 0 0 15px rgba(239, 71, 111, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 71, 111, 0); }
  }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { 100% { transform: rotate(360deg); } }
  
  /* Additional Miracle UI overrides */
  textarea.input-field {
      background: rgba(0,0,0,0.3) !important;
      border: 1px solid rgba(255,255,255,0.1) !important;
      color: #fff !important;
      box-shadow: inset 0 2px 10px rgba(0,0,0,0.5) !important;
  }
  textarea.input-field:focus {
      border-color: #00FF87 !important;
      box-shadow: inset 0 2px 10px rgba(0,0,0,0.5), 0 0 15px rgba(0,255,135,0.2) !important;
  }
  button.btn-outline {
      background: rgba(255,255,255,0.05);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.2);
  }
  button.btn-outline:hover {
      background: rgba(255,255,255,0.1);
      border-color: #fff;
  }
  @media (max-width: 900px) {
    div.glass-card { padding: 1.5rem !important; }
    div[style*="minmax"] { grid-template-columns: 1fr !important; gap: 2rem !important; }
    div[style*="ctaCol"] { flex-direction: column !important; }
  }
`;
document.head.appendChild(ss);

export default Identify;

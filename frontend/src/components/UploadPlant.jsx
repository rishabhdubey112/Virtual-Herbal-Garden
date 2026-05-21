import React, { useState, useRef } from 'react';
import { UploadCloud, X, Check, ScanLine } from 'lucide-react';

const UploadPlant = ({ onIdentify }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const processFile = (selectedFile) => {
        if (selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setError('');
            // Auto-identify upon uploading
            identifyPlant(selectedFile);
        } else {
            setError('Please select a valid image file. (JPG, PNG)');
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const clearSelection = () => {
        setFile(null);
        setPreview(null);
        setError('');
    };

    const identifyPlant = async (imageFile) => {
        setLoading(true);
        setError('');

        // Clear previous result in parent component to trigger CSS animation block
        onIdentify(null);

        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const response = await fetch('https://vhg-backend.onrender.com/predict', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                onIdentify(data.prediction);
            } else {
                setError(data.message || 'Error identifying plant.');
            }
        } catch (err) {
            console.error('Identification error:', err);
            setError('Failed to connect to AI Tensor service.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card" style={styles.container}>
            <div style={styles.header}>
                <div style={styles.iconWrapper}>
                    <ScanLine size={24} color="white" />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.4rem' }}>AI Scan</h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Upload photo for deep analysis</p>
                </div>
            </div>

            {!preview ? (
                <div
                    style={{
                        ...styles.uploadBox,
                        ...(isDragActive ? styles.uploadBoxActive : {})
                    }}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={handleUploadClick}
                >
                    <div style={styles.pulseRing}>
                        <UploadCloud size={40} color={isDragActive ? "var(--primary-dark)" : "var(--primary)"} />
                    </div>
                    <h4 style={{ margin: '1rem 0 0.25rem 0', fontSize: '1.1rem' }}>
                        Click to upload or drag & drop
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Supports JPG, PNG, WEBP (Max 5MB)
                    </p>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </div>
            ) : (
                <div style={styles.previewContainer}>
                    <button style={styles.closeBtn} onClick={clearSelection} title="Remove image">
                        <X size={18} />
                    </button>

                    <div style={styles.imageWrapper}>
                        <img src={preview} alt="Scanning" style={styles.previewImage} />
                        {loading && (
                            <div style={styles.scanOverlay}>
                                <div style={styles.scanLine}></div>
                                <span style={styles.analyzingText}>Analyzing tensors...</span>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginTop: '1rem', fontWeight: 600 }}>
                            <div className="loader" style={{ width: '20px', height: '20px', margin: 0, borderWidth: '2px' }}></div>
                            Processing via MobileNetV2...
                        </div>
                    ) : (
                        <div style={styles.successBlock}>
                            <Check size={20} color="var(--success)" /> Image Processed Completely
                        </div>
                    )}
                </div>
            )}

            {error && <div style={styles.errorBox}>{error}</div>}
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid rgba(0,0,0,0.05)'
    },
    iconWrapper: {
        background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(43, 147, 72, 0.2)'
    },
    uploadBox: {
        border: '2px dashed rgba(43, 147, 72, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: 'rgba(43, 147, 72, 0.03)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    uploadBoxActive: {
        borderColor: 'var(--primary)',
        backgroundColor: 'rgba(43, 147, 72, 0.08)',
        transform: 'scale(1.02)'
    },
    pulseRing: {
        background: 'white',
        padding: '1rem',
        borderRadius: '50%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        transition: 'transform 0.3s ease'
    },
    previewContainer: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    imageWrapper: {
        position: 'relative',
        width: '100%',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
        border: '4px solid white'
    },
    previewImage: {
        width: '100%',
        maxHeight: '320px',
        objectFit: 'cover',
        display: 'block'
    },
    scanOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    scanLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        background: 'var(--success)',
        boxShadow: '0 0 10px var(--success), 0 0 20px var(--success)',
        animation: 'scan 2s linear infinite'
    },
    analyzingText: {
        color: 'white',
        fontWeight: 600,
        letterSpacing: '1px',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
        zIndex: 10,
        marginTop: '2rem'
    },
    closeBtn: {
        position: 'absolute',
        top: '-10px',
        right: '-10px',
        background: 'var(--surface)',
        color: 'var(--text-main)',
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 20,
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform 0.2s'
    },
    successBlock: {
        marginTop: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
        fontWeight: 500,
        backgroundColor: 'rgba(6, 214, 160, 0.1)',
        padding: '0.5rem 1rem',
        borderRadius: 'var(--radius-full)'
    },
    errorBox: {
        marginTop: '1.5rem',
        padding: '0.8rem 1rem',
        backgroundColor: 'rgba(239, 71, 111, 0.1)',
        borderLeft: '4px solid var(--error)',
        color: 'var(--error)',
        borderRadius: '4px',
        fontSize: '0.9rem',
        fontWeight: 500
    }
};

// Insert keyframes for the cool scanner line animation
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes scan {
    0% { top: 0%; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }
  .uploadBox:hover .pulseRing {
    transform: scale(1.1);
  }
  .closeBtn:hover {
    transform: scale(1.1);
    background: var(--error);
    color: white;
  }
`;
document.head.appendChild(styleSheet);

export default UploadPlant;

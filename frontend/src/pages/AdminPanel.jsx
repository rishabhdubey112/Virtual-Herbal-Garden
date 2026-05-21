import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit, Save, X, Settings, Search, Package, Leaf, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const CATEGORIES = ['Immunity', 'Digestion', 'Skin Care', 'Stress Relief', 'Heart Health', 'Metabolic Health', 'Digestive Health', 'Newly Discovered'];

function initialFormState() {
    return { name: '', scientific: '', description: '', uses: '', benefits: '', category: 'Immunity', image_url: '', price: 200 };
}

const AdminPanel = () => {
    const [plants, setPlants] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(initialFormState());
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('All');
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => { fetchPlants(); }, []);

    useEffect(() => {
        let result = plants;
        if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.scientific || '').toLowerCase().includes(search.toLowerCase()));
        if (catFilter !== 'All') result = result.filter(p => p.category === catFilter);
        setFiltered(result);
    }, [plants, search, catFilter]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchPlants = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/plants');
            const data = await res.json();
            if (data.success) setPlants(data.plants);
        } catch (err) {
            showToast('Failed to connect to backend', 'error');
        } finally {
            setTimeout(() => setLoading(false), 300);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'price' ? Number(value) : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const url = editingId ? `http://localhost:5000/update-plant/${editingId}` : 'http://localhost:5000/add-plant';
        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setIsAdding(false);
                setEditingId(null);
                setFormData(initialFormState());
                fetchPlants();
                showToast(editingId ? 'Plant updated successfully!' : 'Plant added successfully!');
            } else {
                showToast(data.message, 'error');
            }
        } catch (err) {
            showToast('Server connection failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (plant) => {
        setFormData({
            name: plant.name, scientific: plant.scientific || '',
            description: plant.description || '', uses: plant.uses || '',
            benefits: plant.benefits || '', category: plant.category || 'Immunity',
            image_url: plant.image_url || '', price: plant.price || 200
        });
        setEditingId(plant.id);
        setIsAdding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/delete-plant/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                fetchPlants();
                setDeleteConfirmId(null);
                showToast('Plant deleted successfully!');
            }
        } catch (err) {
            showToast('Delete failed', 'error');
        }
    };

    const cancelEdit = () => { setIsAdding(false); setEditingId(null); setFormData(initialFormState()); };

    // Stats
    const categories = [...new Set(plants.map(p => p.category))];
    const newlyDiscovered = plants.filter(p => p.category === 'Newly Discovered').length;

    return (
        <div style={S.page}>
            {/* Toast Notification */}
            {toast && (
                <div style={{ ...S.toast, ...(toast.type === 'error' ? S.toastError : S.toastSuccess) }}>
                    {toast.type === 'error' ? <AlertTriangle size={16} /> : <Leaf size={16} />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={S.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={S.headerIcon}><Settings color="var(--primary)" size={32} /></div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '2.2rem', letterSpacing: '-1px' }}>Admin Control Center</h2>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage your botanical database records</p>
                    </div>
                </div>
                {!isAdding && (
                    <button className="btn btn-primary" onClick={() => setIsAdding(true)} style={{ padding: '0.8rem 1.6rem' }}>
                        <PlusCircle size={20} /> Add New Plant
                    </button>
                )}
            </div>

            {/* Stats Row */}
            <div style={S.statsRow}>
                <div className="glass-card" style={S.statCard}>
                    <Package size={28} color="var(--primary)" />
                    <div>
                        <div style={S.statNum}>{plants.length}</div>
                        <div style={S.statLabel}>Total Plants</div>
                    </div>
                </div>
                <div className="glass-card" style={S.statCard}>
                    <Leaf size={28} color="#55a630" />
                    <div>
                        <div style={S.statNum}>{categories.length}</div>
                        <div style={S.statLabel}>Categories</div>
                    </div>
                </div>
                <div className="glass-card" style={S.statCard}>
                    <Search size={28} color="#f77f00" />
                    <div>
                        <div style={S.statNum}>{newlyDiscovered}</div>
                        <div style={S.statLabel}>Newly Discovered</div>
                    </div>
                </div>
                <div className="glass-card" style={S.statCard}>
                    <Settings size={28} color="#3a86ff" />
                    <div>
                        <div style={S.statNum}>{filtered.length}</div>
                        <div style={S.statLabel}>Showing</div>
                    </div>
                </div>
            </div>

            {/* Add / Edit Form */}
            {isAdding && (
                <div className="glass-card animate-slide-up" style={{ marginBottom: '2.5rem', borderTop: '4px solid var(--primary)' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {editingId ? <><Edit size={22} /> Editing: {formData.name || 'Plant'}</> : <><PlusCircle size={22} /> Add New Plant</>}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div style={S.formGrid}>
                            <div className="input-group">
                                <label className="input-label">Common Name *</label>
                                <input required type="text" name="name" className="input-field" value={formData.name} onChange={handleInputChange} placeholder="e.g. Aloe Vera" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Scientific Name</label>
                                <input type="text" name="scientific" className="input-field" value={formData.scientific} onChange={handleInputChange} placeholder="e.g. Aloe barbadensis" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Category</label>
                                <select name="category" className="input-field" value={formData.category} onChange={handleInputChange}>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Price (₹)</label>
                                <input type="number" name="price" className="input-field" value={formData.price} onChange={handleInputChange} min="0" placeholder="e.g. 299" />
                            </div>
                        </div>

                        <div className="input-group" style={{ marginTop: '1rem' }}>
                            <label className="input-label">Image URL</label>
                            <input type="text" name="image_url" className="input-field" value={formData.image_url} onChange={handleInputChange} placeholder="https://... or /plants/filename.jpg" />
                            {formData.image_url && (
                                <img src={formData.image_url} alt="Preview" style={{ marginTop: '0.5rem', height: '80px', borderRadius: '8px', objectFit: 'cover' }}
                                    onError={e => e.target.style.display = 'none'} />
                            )}
                        </div>

                        <div className="input-group" style={{ marginTop: '1rem' }}>
                            <label className="input-label">Description</label>
                            <textarea name="description" className="input-field" rows="3" value={formData.description} onChange={handleInputChange} placeholder="Physical characteristics, habitat, history..." />
                        </div>

                        <div style={S.formGrid}>
                            <div className="input-group">
                                <label className="input-label">Medicinal Uses</label>
                                <textarea name="uses" className="input-field" rows="3" value={formData.uses} onChange={handleInputChange} placeholder="How it's consumed or applied..." />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Health Benefits</label>
                                <textarea name="benefits" className="input-field" rows="3" value={formData.benefits} onChange={handleInputChange} placeholder="Key health benefits, comma separated..." />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }} disabled={saving}>
                                <Save size={18} /> {saving ? 'Saving...' : (editingId ? 'Update Plant' : 'Add to Library')}
                            </button>
                            <button type="button" className="btn btn-outline" onClick={cancelEdit}>
                                <X size={18} /> Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search & Filter Bar */}
            <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Search plants by name or scientific name..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: '2.5rem', margin: 0 }}
                        />
                    </div>
                    <select className="input-field" value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ width: 'auto', margin: 0, minWidth: '160px' }}>
                        <option value="All">All Categories</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {(search || catFilter !== 'All') && (
                        <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }} onClick={() => { setSearch(''); setCatFilter('All'); }}>
                            <X size={14} /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Plants Table */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 1.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Plant Library <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '1rem' }}>({filtered.length} plants)</span></h3>
                </div>

                {loading ? (
                    <div style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="loader"></div>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={S.table}>
                            <thead>
                                <tr>
                                    <th style={S.th}>Plant</th>
                                    <th style={S.th}>Category</th>
                                    <th style={S.th}>Scientific Name</th>
                                    <th style={S.th}>Price</th>
                                    <th style={S.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p, idx) => (
                                    <tr key={p.id} style={S.tr} className="admin-row">
                                        <td style={S.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <img
                                                    src={p.image_url || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=60'}
                                                    alt={p.name}
                                                    style={S.thumb}
                                                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=60'}
                                                />
                                                <strong style={{ fontSize: '1rem' }}>{p.name}</strong>
                                            </div>
                                        </td>
                                        <td style={S.td}><span className="badge">{p.category}</span></td>
                                        <td style={S.td}><em style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{p.scientific}</em></td>
                                        <td style={S.td}><strong style={{ color: 'var(--primary)' }}>₹{p.price || 200}</strong></td>
                                        <td style={S.td}>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                {/* Edit Button */}
                                                <button
                                                    style={S.editBtn}
                                                    onClick={() => handleEdit(p)}
                                                    title="Edit this plant"
                                                >
                                                    <Edit size={15} /> Edit
                                                </button>

                                                {/* Delete: show confirm inline */}
                                                {deleteConfirmId === p.id ? (
                                                    <div style={S.confirmRow}>
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--error)', fontWeight: 600 }}>Delete?</span>
                                                        <button style={S.confirmYes} onClick={() => handleDelete(p.id)}>Yes</button>
                                                        <button style={S.confirmNo} onClick={() => setDeleteConfirmId(null)}>No</button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        style={S.deleteBtn}
                                                        onClick={() => setDeleteConfirmId(p.id)}
                                                        title="Delete this plant"
                                                    >
                                                        <Trash2 size={15} /> Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                                            <Leaf size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                            <p>No plants found matching your search.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const S = {
    page: { maxWidth: '1200px', margin: '0 auto', padding: '0 0 4rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
    headerIcon: { background: 'var(--surface)', padding: '0.8rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' },
    statCard: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem' },
    statNum: { fontSize: '2rem', fontWeight: 900, lineHeight: 1 },
    statLabel: { color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '0.5rem' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    th: { padding: '1rem 1.25rem', borderBottom: '2px solid rgba(0,0,0,0.05)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.8rem', background: 'var(--surface)', whiteSpace: 'nowrap' },
    td: { padding: '0.9rem 1.25rem', borderBottom: '1px solid rgba(0,0,0,0.04)', verticalAlign: 'middle' },
    tr: { transition: 'background 0.15s' },
    thumb: { width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 },
    editBtn: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(43,147,72,0.1)', border: '1.5px solid var(--primary)', borderRadius: '8px', padding: '0.4rem 0.8rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' },
    deleteBtn: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(239,71,111,0.08)', border: '1.5px solid rgba(239,71,111,0.5)', borderRadius: '8px', padding: '0.4rem 0.8rem', color: '#ef476f', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' },
    confirmRow: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
    confirmYes: { background: '#ef476f', color: 'white', border: 'none', borderRadius: '6px', padding: '0.3rem 0.7rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' },
    confirmNo: { background: 'rgba(0,0,0,0.07)', color: 'var(--text-muted)', border: 'none', borderRadius: '6px', padding: '0.3rem 0.7rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' },
    toast: { position: 'fixed', top: '80px', right: '24px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 1.5rem', borderRadius: '12px', fontWeight: 600, boxShadow: '0 8px 30px rgba(0,0,0,0.15)', animation: 'slideInRight 0.3s ease' },
    toastSuccess: { background: 'var(--primary)', color: 'white' },
    toastError: { background: '#ef476f', color: 'white' },
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `.admin-row:hover { background-color: rgba(43,147,72,0.04) !important; } @keyframes slideInRight { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
document.head.appendChild(styleSheet);

export default AdminPanel;

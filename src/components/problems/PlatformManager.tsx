import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, X, Check, Globe, Link, Loader2 } from 'lucide-react';
import platformService from '../../services/platformService';
import type { Platform } from '../../types/platform';
import styles from '../../pages/Problems.module.css';

const PlatformManager: React.FC = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Edit/Create State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Platform>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [newPlatform, setNewPlatform] = useState({ name: '', slug: '', base_url: '' });

  const fetchPlatforms = async () => {
    setLoading(true);
    try {
      const response = await platformService.getPlatforms();
      setPlatforms(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch platforms.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlatform.name || !newPlatform.slug || !newPlatform.base_url) return;

    try {
      await platformService.createPlatform(newPlatform);
      setNewPlatform({ name: '', slug: '', base_url: '' });
      setIsCreating(false);
      fetchPlatforms();
    } catch (err) {
      alert('Failed to create platform');
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      await platformService.updatePlatform(id, editForm);
      setEditingId(null);
      fetchPlatforms();
    } catch (err) {
      alert('Failed to update platform');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this platform?')) return;
    try {
      await platformService.deletePlatform(id);
      fetchPlatforms();
    } catch (err) {
      alert('Failed to delete platform');
    }
  };

  const startEdit = (p: Platform) => {
    setEditingId(p.id);
    setEditForm({ name: p.name, slug: p.slug, base_url: p.base_url });
  };

  const filteredPlatforms = platforms.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableToolbar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search platforms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsCreating(true)} 
          className={`${styles.btn} ${styles.btnPrimary}`}
          style={{ gap: '8px' }}
        >
          <Plus size={18} /> New Platform
        </button>
      </div>

      {isCreating && (
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', background: 'var(--surface-color)', animation: 'slideDown 0.2s ease-out' }}>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Platform Name</label>
              <input 
                autoFocus
                className={styles.searchInput} 
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)' }}
                placeholder="LeetCode"
                value={newPlatform.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewPlatform(prev => ({ 
                    ...prev, 
                    name: val,
                    slug: prev.slug || val.toLowerCase().replace(/\s+/g, '-')
                  }));
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Slug</label>
              <input 
                className={styles.searchInput} 
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)' }}
                placeholder="leetcode"
                value={newPlatform.slug}
                onChange={(e) => setNewPlatform(prev => ({ ...prev, slug: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Base URL</label>
              <input 
                className={styles.searchInput} 
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)' }}
                placeholder="https://leetcode.com"
                value={newPlatform.base_url}
                onChange={(e) => setNewPlatform(prev => ({ ...prev, base_url: e.target.value }))}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className={styles.btn} style={{ background: 'var(--success)', color: 'white', border: 'none' }}>
                <Check size={18} />
              </button>
              <button type="button" onClick={() => setIsCreating(false)} className={styles.btnOutline}>
                <X size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.tableContainer} style={{ minHeight: '200px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: '12px' }}>
            <Loader2 className="spin" size={32} color="var(--primary)" />
            <span style={{ color: 'var(--text-muted)' }}>Loading platforms...</span>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Platform</th>
                <th>Base URL</th>
                <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlatforms.length > 0 ? (
                filteredPlatforms.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>#{p.id}</span>
                    </td>
                    <td>
                      {editingId === p.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <input 
                            className={styles.searchInput} 
                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: '32px' }}
                            value={editForm.name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          />
                          <input 
                            className={styles.searchInput} 
                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: '32px', fontSize: '0.75rem' }}
                            value={editForm.slug}
                            onChange={(e) => setEditForm(prev => ({ ...prev, slug: e.target.value }))}
                          />
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <Globe size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-h)' }}>{p.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.slug}</div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      {editingId === p.id ? (
                        <input 
                          className={styles.searchInput} 
                          style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: '32px' }}
                          value={editForm.base_url}
                          onChange={(e) => setEditForm(prev => ({ ...prev, base_url: e.target.value }))}
                        />
                      ) : (
                        <a 
                          href={p.base_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                        >
                          <Link size={14} />
                          {p.base_url.replace('https://', '').replace(/\/$/, '')}
                        </a>
                      )}
                    </td>
                    <td className={styles.rowActions}>
                      {editingId === p.id ? (
                        <>
                          <button onClick={() => handleUpdate(p.id)} className={`${styles.iconBtn}`} title="Save Changes" style={{ color: 'var(--success)' }}>
                            <Check size={18} />
                          </button>
                          <button onClick={() => setEditingId(null)} className={styles.iconBtn} title="Cancel">
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(p)} className={styles.iconBtn} title="Edit Platform">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Delete Platform">
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    No platforms found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PlatformManager;

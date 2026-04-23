import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Trash2, Edit2, X, Check, ChevronLeft, ChevronRight, Hash, Loader2 } from 'lucide-react';
import tagService from '../../services/tagService';
import type { Tag, TagResponse } from '../../types/tag';
import styles from '../../pages/Problems.module.css';

const TagManager: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 45;

  // Edit/Create State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const response = await tagService.getTags(page, limit);
      setTags(response.data);
      setTotal(response.paging.total);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tags. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSlug.trim()) return;

    try {
      await tagService.createTag({ name: newName, slug: newSlug });
      setNewName('');
      setNewSlug('');
      setIsCreating(false);
      fetchTags();
    } catch (err) {
      alert('Failed to create tag');
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return;
    try {
      await tagService.updateTag(id, { name: editName });
      setEditingId(null);
      fetchTags();
    } catch (err) {
      alert('Failed to update tag');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) return;
    try {
      await tagService.deleteTag(id);
      fetchTags();
    } catch (err) {
      alert('Failed to delete tag');
    }
  };

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
  };

  const filteredTags = tags.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableToolbar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsCreating(true)} 
          className={`${styles.btn} ${styles.btnPrimary}`}
          style={{ gap: '8px' }}
        >
          <Plus size={18} /> New Tag
        </button>
      </div>

      {isCreating && (
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', background: 'var(--surface-color)', animation: 'slideDown 0.2s ease-out' }}>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Tag Name</label>
              <input 
                autoFocus
                className={styles.searchInput} 
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)' }}
                placeholder="e.g. Dynamic Programming"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (!newSlug) setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Slug</label>
              <input 
                className={styles.searchInput} 
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)' }}
                placeholder="e.g. dp"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
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

      <div className={styles.tableContainer} style={{ minHeight: '300px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column', gap: '12px' }}>
            <Loader2 className="spin" size={32} color="var(--primary)" />
            <span style={{ color: 'var(--text-muted)' }}>Fetching tags...</span>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Tag Name</th>
                <th>Slug</th>
                <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => (
                  <tr key={tag.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-dim)', fontWeight: 500 }}>
                        <Hash size={14} />
                        {tag.id}
                      </div>
                    </td>
                    <td>
                      {editingId === tag.id ? (
                        <input 
                          autoFocus
                          className={styles.searchInput} 
                          style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: '32px' }}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdate(tag.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                      ) : (
                        <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>{tag.name}</span>
                      )}
                    </td>
                    <td>
                      <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85rem' }}>
                        {tag.slug}
                      </code>
                    </td>
                    <td className={styles.rowActions}>
                      {editingId === tag.id ? (
                        <>
                          <button onClick={() => handleUpdate(tag.id)} className={`${styles.iconBtn}`} title="Save Changes" style={{ color: 'var(--success)' }}>
                            <Check size={18} />
                          </button>
                          <button onClick={() => setEditingId(null)} className={styles.iconBtn} title="Cancel">
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(tag)} className={styles.iconBtn} title="Edit Tag">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(tag.id)} className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Delete Tag">
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
                    No tags found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {total > limit && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing {filteredTags.length} of {total} tags
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className={styles.btnOutline}
              style={{ padding: '6px' }}
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              disabled={page * limit >= total} 
              onClick={() => setPage(p => p + 1)}
              className={styles.btnOutline}
              style={{ padding: '6px' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManager;

import React, { useRef, useState, useEffect } from 'react';
import { Settings, X, Plus, Search, Check, Loader2 } from 'lucide-react';
import { useStudio } from './StudioContext';
import styles from '../../pages/ProblemStudio.module.css';
import tagService from '../../services/tagService';
import platformService from '../../services/platformService';
import divisionService from '../../services/divisionService';
import type { Tag } from '../../types/tag';
import type { Platform } from '../../types/platform';
import type { Division } from '../../types/curriculum';

const GeneralInfoPanel: React.FC = () => {
  const { state, dispatch } = useStudio();
  
  // Data State
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(true);

  // Tag Selector State
  const [tagSearch, setTagSearch] = useState('');
  const [isTagListOpen, setIsTagListOpen] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [tagsRes, platformsRes, divisionsRes] = await Promise.all([
          tagService.getTags(1, 100),
          platformService.getPlatforms(),
          divisionService.getDivisions()
        ]);
        setAvailableTags(tagsRes.data);
        setPlatforms(platformsRes.data);
        setDivisions(divisionsRes);
      } catch (err) {
        console.error('Failed to fetch metadata', err);
      } finally {
        setLoadingMetadata(false);
      }
    };
    fetchMetadata();
  }, []);

  // Sync/Resolve tags if they were loaded as objects/strings but IDs haven't been resolved yet
  useEffect(() => {
    if (!loadingMetadata && availableTags.length > 0 && state.meta.tags.length === 0) {
      // If we have tags in the problem object but no IDs in meta, it means mapping failed (likely string tags)
      // This is a bit tricky as GeneralInfoPanel doesn't have the original 'problem' object, only the 'state'
    }
  }, [loadingMetadata, availableTags]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    if (type === 'number') {
      processedValue = value === '' ? null : parseFloat(value);
    } else if (name === 'platform_id' || name === 'division_id') {
      processedValue = value === '' ? null : parseInt(value);
    }

    dispatch({
      type: 'SET_META',
      payload: { [name]: processedValue },
    });
  };

  const toggleTag = (tagId: number) => {
    const currentTags = state.meta.tags || [];
    if (currentTags.includes(tagId)) {
      dispatch({ type: 'SET_META', payload: { tags: currentTags.filter(id => id !== tagId) } });
    } else {
      dispatch({ type: 'SET_META', payload: { tags: [...currentTags, tagId] } });
    }
  };

  const filteredTags = availableTags.filter(t => 
    t.name.toLowerCase().includes(tagSearch.toLowerCase()) &&
    !(state.meta.tags || []).includes(t.id)
  );

  if (loadingMetadata) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column', gap: '12px' }}>
        <Loader2 className="spin" size={32} color="var(--primary)" />
        <span style={{ color: 'var(--text-muted)' }}>Loading problem data...</span>
      </div>
    );
  }

  return (
    <div className={styles.fadeIn}>
      <div className={styles.sectionTitle}>
        <div className="icon"><Settings size={20} /></div>
        <h2>General Information</h2>
      </div>
      <p className={styles.sectionDescription}>
        Configure the problem metadata, difficulty settings, and taxonomy tags for synchronization.
      </p>

      <div className={styles.card}>
        <div className={styles.formGrid}>
          {/* Title */}
          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label className={styles.label}>Problem Title</label>
            <input
              type="text" name="title" value={state.meta.title}
              onChange={handleChange} className={styles.input}
              placeholder="e.g. Mickey Mouse Constructive"
            />
          </div>

          {/* Slug + Difficulty */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Slug (URL Identifier)</label>
            <input
              type="text" name="slug" value={state.meta.slug}
              onChange={handleChange} className={styles.input}
              placeholder="mickey-mouse-constructive"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Difficulty Rating (Elo)</label>
            <input
              type="number" name="difficulty" value={state.meta.difficulty}
              onChange={handleChange} className={styles.input}
            />
          </div>

          {/* Time & Memory Limits */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Time Limit (Seconds)</label>
            <input
              type="number" step="0.1" name="time_limit" 
              value={state.meta.time_limit ?? ''}
              onChange={handleChange} className={styles.input}
              placeholder="1.5"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Memory Limit (MB)</label>
            <input
              type="number" name="memory_limit" 
              value={state.meta.memory_limit ?? ''}
              onChange={handleChange} className={styles.input}
              placeholder="256"
            />
          </div>

          {/* Platform + Division */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Origin Platform</label>
            <select name="platform_id" value={state.meta.platform_id ?? ''} onChange={handleChange} className={styles.select}>
              <option value="">Select Platform...</option>
              {platforms.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Target Division</label>
            <select name="division_id" value={state.meta.division_id ?? ''} onChange={handleChange} className={styles.select}>
              <option value="">Select Division...</option>
              {divisions.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Problem Status</label>
            <select name="status" value={state.meta.status} onChange={handleChange} className={styles.select}>
              <option value="draft">Draft</option>
              <option value="under_preview">Under Preview</option>
              <option value="ready">Ready</option>
              <option value="archived">Archived</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          {/* External ID */}
          <div className={styles.formGroup}>
            <label className={styles.label}>External Sync ID</label>
            <input
              type="text" name="external_id" value={state.meta.external_id}
              onChange={handleChange} className={styles.input}
              placeholder="2211B"
            />
          </div>

          {/* Original URL */}
          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label className={styles.label}>Original Problem URL</label>
            <input
              type="text" name="original_url" value={state.meta.original_url}
              onChange={handleChange} className={styles.input}
              placeholder="https://codeforces.com/problemset/problem/2211/B"
            />
          </div>

          {/* Tags Section */}
          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label className={styles.label}>Taxonomy Tags</label>
            
            {/* Selected Tags */}
            <div className={styles.tagWrapper} style={{ marginBottom: '12px' }}>
              {(state.meta.tags || []).map(id => {
                const tag = availableTags.find(t => t.id === id);
                return (
                  <span key={id} className={styles.tag}>
                    {tag?.name || `ID: ${id}`}
                    <button type="button" onClick={() => toggleTag(id)} className={styles.tagRemove}>
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
              {state.meta.tags?.length === 0 && (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>No tags selected.</span>
              )}
            </div>

            {/* Tag Selection Dropdown */}
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className={styles.input}
                    style={{ paddingLeft: '36px' }}
                    placeholder="Search tags to add..."
                    value={tagSearch}
                    onChange={(e) => {
                      setTagSearch(e.target.value);
                      setIsTagListOpen(true);
                    }}
                    onFocus={() => setIsTagListOpen(true)}
                  />
                </div>
                {isTagListOpen && (
                  <button 
                    type="button" 
                    className={styles.btnSmall} 
                    onClick={() => setIsTagListOpen(false)}
                    style={{ padding: '0 12px' }}
                  >
                    Close
                  </button>
                )}
              </div>

              {isTagListOpen && (
                <div style={{ 
                  position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, 
                  background: 'var(--surface-color)', border: '1px solid var(--border-color)', 
                  borderRadius: '8px', zIndex: 10, maxHeight: '250px', overflowY: 'auto',
                  boxShadow: 'var(--shadow-lg)', animation: 'slideDown 0.2s ease-out'
                }}>
                  {filteredTags.length > 0 ? (
                    filteredTags.map(tag => (
                      <div 
                        key={tag.id} 
                        onClick={() => toggleTag(tag.id)}
                        style={{ 
                          padding: '10px 16px', cursor: 'pointer', display: 'flex', 
                          justifyContent: 'space-between', alignItems: 'center',
                          borderBottom: '1px solid rgba(255,255,255,0.05)'
                        }}
                        className={styles.tagOption}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{tag.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tag.slug}</div>
                        </div>
                        <Plus size={16} color="var(--text-muted)" />
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {tagSearch ? 'No matching tags found.' : 'All tags are selected.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoPanel;

import React, { useState, useEffect } from 'react';
import styles from '../../pages/Curriculum.module.css';
import { X, Save } from 'lucide-react';
import type { Module } from '../../types/curriculum';

interface ModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Module>) => void;
  initialData?: Module | null;
}

const ModuleModal: React.FC<ModuleModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<Module>>({
    title: '',
    order_index: 0
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: '',
        order_index: 0
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} style={{ width: 450 }} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{initialData ? 'Edit Module' : 'Add New Module'}</h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup} style={{ marginBottom: 20 }}>
              <label className={styles.formLabel}>Module Title</label>
              <input 
                type="text" 
                className={styles.formInput} 
                placeholder="e.g. Introduction to Logic"
                value={formData.title || ''} 
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required 
                autoFocus
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Order Index (Sort Priority)</label>
              <input 
                type="number" 
                className={styles.formInput} 
                value={formData.order_index ?? 0} 
                onChange={e => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                placeholder="Lower numbers appear first"
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--frappe-text-muted)', marginTop: 4 }}>
                Lower values will be shown at the top of the list.
              </p>
            </div>
          </div>
          
          <div className={styles.modalHeader} style={{ borderTop: '1px solid var(--frappe-border)', borderBottom: 'none', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>Cancel</button>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
              <Save size={16} /> {initialData ? 'Update Module' : 'Create Module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModuleModal;

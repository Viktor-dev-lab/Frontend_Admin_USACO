import React, { useState, useEffect } from 'react';
import styles from '../../pages/Curriculum.module.css';
import { X, Save } from 'lucide-react';
import type { Division } from '../../types/curriculum';

interface DivisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (division: Division) => void;
  initialData?: Division | null;
}

const DivisionModal: React.FC<DivisionModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<Division>>({
    name: '',
    min_rating: 0,
    max_rating: 1200,
    description: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        min_rating: 0,
        max_rating: 1200,
        description: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Division);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} style={{ width: 500 }} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{initialData ? 'Edit Division' : 'Create New Division'}</h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSave}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup} style={{ marginBottom: 16 }}>
              <label className={styles.formLabel}>Division Name</label>
              <input 
                type="text" 
                className={styles.formInput} 
                placeholder="e.g. Bronze Division"
                value={formData.name || ''} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required 
              />
            </div>
            
            <div className={styles.formGrid} style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 16 }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Min Rating</label>
                <input 
                  type="number" 
                  className={styles.formInput} 
                  value={formData.min_rating || 0} 
                  onChange={e => setFormData({ ...formData, min_rating: parseInt(e.target.value) })}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Max Rating</label>
                <input 
                  type="number" 
                  className={styles.formInput} 
                  value={formData.max_rating || 0} 
                  onChange={e => setFormData({ ...formData, max_rating: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description</label>
              <textarea 
                className={styles.formTextarea} 
                rows={3}
                placeholder="Briefly describe this division..."
                value={formData.description || ''} 
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <div className={styles.modalHeader} style={{ borderTop: '1px solid var(--frappe-border)', borderBottom: 'none', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>Cancel</button>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
              <Save size={16} /> Save Division
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DivisionModal;

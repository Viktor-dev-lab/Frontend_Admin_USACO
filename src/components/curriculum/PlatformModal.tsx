import React from 'react';
import styles from '../../pages/Curriculum.module.css';
import { X, Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';
import type { Platform } from '../../types/curriculum';

interface PlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_PLATFORMS: Platform[] = [
  { id: 1, name: "Codeforces", slug: "codeforces", base_url: "https://codeforces.com/problemset/problem/" },
  { id: 2, name: "LeetCode", slug: "leetcode", base_url: "https://leetcode.com/problems/" },
  { id: 3, name: "AtCoder", slug: "atcoder", base_url: "https://atcoder.jp/contests/" }
];

const PlatformModal: React.FC<PlatformModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Platforms Management</h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>
        <div className={styles.modalBody}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className={`${styles.btn} ${styles.btnPrimary}`}>
              <Plus size={16} /> Add Platform
            </button>
          </div>
          
          <table className={styles.table} style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Base URL</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PLATFORMS.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>{p.name}</td>
                  <td style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{p.slug}</td>
                  <td style={{ color: 'var(--accent)', fontSize: '0.85rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <a href={p.base_url || '#'} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', color: 'inherit' }}>
                      {p.base_url} <ExternalLink size={12} />
                    </a>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className={styles.closeBtn} style={{ marginRight: 8, color: '#3b82f6' }}><Edit2 size={16} /></button>
                    <button className={styles.closeBtn} style={{ color: '#ef4444' }}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlatformModal;

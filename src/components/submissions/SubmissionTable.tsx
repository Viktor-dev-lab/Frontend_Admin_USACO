import React from 'react';
import styles from '../../pages/Submissions.module.css';
import { UserCircle2, ShieldAlert, ShieldCheck, ChevronRight, AlertTriangle } from 'lucide-react';
import type { Submission } from '../../types/submission';

interface SubmissionTableProps {
  submissions: Submission[];
  onViewDetails: (submission: Submission) => void;
}

const SubmissionTable: React.FC<SubmissionTableProps> = ({ submissions, onViewDetails }) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Time</th>
            <th>User</th>
            <th>Problem</th>
            <th>Status</th>
            <th>Runtime</th>
            <th>Lang</th>
            <th>Integrity</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {submissions.length > 0 ? (
            submissions.map((sub) => (
              <tr key={sub.id}>
                <td>
                  <span className={styles.linkText} onClick={() => onViewDetails(sub)}>
                    #{sub.id}
                  </span>
                </td>
                <td style={{ color: 'var(--text)', fontSize: '0.9rem' }}>
                  {sub.timestamp}
                </td>
                <td>
                  <div className={styles.userInfo}>
                    {sub.user.avatarUrl ? (
                      <img src={sub.user.avatarUrl} alt="avatar" className={styles.avatar} />
                    ) : (
                      <div className={styles.avatar}>
                        <UserCircle2 size={16} />
                      </div>
                    )}
                    <span style={{ fontWeight: 500, color: 'var(--text-h)', fontSize: '0.9rem' }}>
                      {sub.user.username}
                    </span>
                  </div>
                </td>
                <td>
                  <span className={styles.linkText} style={{ color: 'var(--text-h)', fontWeight: 500 }}>
                    {sub.problem.title}
                  </span>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${
                    sub.status.code === 'AC' ? styles.statusAC :
                    sub.status.code === 'WA' ? styles.statusWA :
                    sub.status.code === 'TLE' ? styles.statusTLE : styles.statusErr
                  }`}>
                    {sub.status.label}
                  </span>
                </td>
                <td style={{ color: 'var(--text)', fontSize: '0.85rem' }}>
                  {sub.runtime} ms
                  <span style={{ opacity: 0.5, margin: '0 4px' }}>|</span>
                  {sub.memory.toFixed(1)} MB
                </td>
                <td>
                  <span style={{ background: 'var(--bg)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid var(--border)', color: 'var(--text)' }}>
                    {sub.language}
                  </span>
                </td>
                <td>
                  {sub.integrity.flag === 'Safe' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22c55e', fontSize: '0.85rem', fontWeight: 500 }}>
                      <ShieldCheck size={16} /> Safe
                    </div>
                  ) : sub.integrity.flag === 'Malware_Blocked' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
                      <AlertTriangle size={16} style={{ animation: 'pulse 2s infinite' }} /> Malware
                    </div>
                  ) : sub.integrity.flag === 'AI_Flagged' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a855f7', fontSize: '0.85rem', fontWeight: 600 }}>
                      <AlertTriangle size={16} /> AI Flag
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontSize: '0.85rem', fontWeight: 600 }}>
                      <ShieldAlert size={16} /> {sub.integrity.flag}
                    </div>
                  )}
                </td>
                <td>
                  <button 
                    onClick={() => onViewDetails(sub)}
                    className={styles.btnOutline} 
                    style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}
                  >
                    Details <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text)' }}>
                No submissions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SubmissionTable;

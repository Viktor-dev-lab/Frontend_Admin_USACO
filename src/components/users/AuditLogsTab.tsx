import React from 'react';
import styles from '../../pages/Users.module.css';
import { Search, Filter } from 'lucide-react';

const MOCK_AUDIT_LOGS = [
  { id: 'log_001', time: '2026-04-17 12:45:10', admin: 'Lam Nguyen (SuperAdmin)', action: 'ROLE_CHANGED', target: 'User #usr_02', details: 'Promoted from User to ProblemModerator.' },
  { id: 'log_002', time: '2026-04-17 10:12:05', admin: 'System Auto-Ban', action: 'USER_SUSPENDED', target: 'User #usr_03', details: 'Account temporarily suspended. Reason: Invalid payment method for Premium.' },
  { id: 'log_003', time: '2026-04-16 23:01:44', admin: 'Minh Tran (ProblemModerator)', action: 'SUBMISSION_DELETED', target: 'Submission #sub_9921', details: 'Deleted abusive content in submission code block.' },
  { id: 'log_004', time: '2026-04-16 14:20:00', admin: 'System Monitor', action: 'FORCE_LOGOUT', target: 'User #usr_05', details: 'Revoked all active JWTs. Reason: Suspected compromised account.' },
  { id: 'log_005', time: '2026-04-15 09:30:11', admin: 'Lam Nguyen (SuperAdmin)', action: 'SYSTEM_CONFIG_UPDATED', target: 'Global Rate Limiter', maxAllowed: '50 req/min' },
];

const AuditLogsTab = () => {
  return (
    <div className={styles.tabContent}>
      
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={18} color="var(--text-dim)" />
          <input type="text" placeholder="Search by Admin ID, Action, or Target..." />
        </div>
        <div className={styles.filters}>
          <button className={`${styles.btnSmall} ${styles.btnOutline}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px' }}>
            <Filter size={14} /> Filter Range
          </button>
          <button className={`${styles.btnSmall} ${styles.btnOutline}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px' }}>
            Export CSV
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor (Admin/System)</th>
              <th>Action Category</th>
              <th>Target Resource</th>
              <th>Event Details (Payload)</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_AUDIT_LOGS.map((log) => (
              <tr key={log.id}>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <span className={styles.mono}>{log.time}</span>
                </td>
                <td style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                  {log.admin}
                </td>
                <td>
                  <span className={styles.mono} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>
                  {log.target}
                </td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-dim)', maxWidth: '300px' }}>
                  {log.details || JSON.stringify(log, null, 2).substring(0, 50) + '...'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default AuditLogsTab;

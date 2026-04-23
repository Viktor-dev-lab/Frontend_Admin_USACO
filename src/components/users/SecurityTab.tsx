import React from 'react';
import styles from '../../pages/Users.module.css';
import { AlertTriangle, MapPin, Monitor, Smartphone, Globe, Shield, Activity, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const MOCK_ALERTS = [
  { id: 'al_01', type: 'high', title: 'Multiple Geographic Locations', desc: 'Account khang.le123@example.com logged in from Vietnam and USA within 5 minutes.', time: '10 mins ago' },
  { id: 'al_02', type: 'warning', title: 'API Origin Anomaly', desc: 'Spam API authentication requests (100 req/min) detected from IP 14.241.12.89', time: '1 hour ago' },
  { id: 'al_03', type: 'high', title: 'Brute Force Attempt', desc: '15 failed login attempts for admin@usaco.org from IP 104.28.32.11', time: '2 hours ago' },
];

const MOCK_SESSIONS = [
  { id: 'ses_01', user: 'khang.le123@example.com', ip: '14.241.12.89', loc: 'Ho Chi Minh, VN', device: 'Chrome / Windows', time: '10 mins ago', type: 'desktop' },
  { id: 'ses_02', user: 'khang.le123@example.com', ip: '104.28.32.11', loc: 'California, US', device: 'Safari / iOS', time: '12 mins ago', type: 'mobile' },
  { id: 'ses_03', user: 'lam.nguyen@example.com', ip: '113.161.44.20', loc: 'Ha Noi, VN', device: 'Edge / Windows', time: '2 hours ago', type: 'desktop' },
  { id: 'ses_04', user: 'bao.pham09@example.com', ip: '118.69.248.51', loc: 'Da Nang, VN', device: 'Firefox / Linux', time: '5 hours ago', type: 'desktop' },
];

import LiveThreatMap from './LiveThreatMap';

const SecurityTab = () => {
  return (
    <div className={`${styles.tabContent} ${styles.dashboardGrid}`}>
      
      {/* Top Summary Row */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}><Users size={14}/> 24h Login Volume</div>
          <div className={styles.summaryValue}>1,402</div>
          <div className={`${styles.summaryTrend} ${styles.trendUp}`}><ArrowUpRight size={14}/> 12% vs yesterday</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}><Shield size={14}/> Blocked IPs</div>
          <div className={styles.summaryValue}>85</div>
          <div className={`${styles.summaryTrend} ${styles.trendDown}`}><ArrowDownRight size={14}/> 5% vs yesterday</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}><AlertTriangle size={14} color="#ef4444"/> Active Anomalies</div>
          <div className={styles.summaryValue} style={{ color: '#ef4444' }}>3</div>
          <div className={`${styles.summaryTrend} ${styles.trendUp}`} style={{ color: '#ef4444' }}><ArrowUpRight size={14}/> Action Required</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}><Activity size={14}/> System Threat Level</div>
          <div className={styles.summaryValue} style={{ color: '#f59e0b' }}>ELEVATED</div>
          <div className={styles.summaryTrend} style={{ color: 'var(--text-dim)' }}>Due to recent brute force</div>
        </div>
      </div>

      {/* Live Global Threat Map */}
      <div className={styles.panelCard} style={{ padding: '4px', overflow: 'hidden' }}>
        <LiveThreatMap />
      </div>

      <div className={styles.mainDashboardLayout}>
        {/* Left Column: Alerts */}
        <div className={styles.panelCard}>
          <h3 className={styles.panelTitle}>
            <AlertTriangle size={20} color="#ef4444" />
            Threat Intelligence Feed
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: 'var(--space-md)' }}>
            Real-time security alerts requiring administrative intervention.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {MOCK_ALERTS.map(alert => (
              <div key={alert.id} className={`${styles.alertCard} ${alert.type === 'high' ? styles.alertHigh : styles.alertWarning}`}>
                <div className={styles.alertIcon}>
                  <AlertTriangle size={20} />
                </div>
                <div className={styles.alertContent}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className={styles.alertTitle}>{alert.title}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{alert.time}</span>
                  </div>
                  <div className={styles.alertDesc}>{alert.desc}</div>
                  <div className={styles.alertActions}>
                    {alert.type === 'high' && <button className={`${styles.btnSmall} ${styles.btnDanger}`}>Revoke & Ban</button>}
                    <button className={`${styles.btnSmall} ${styles.btnOutline}`}>Investigate</button>
                    <button className={`${styles.btnSmall} ${styles.btnOutline}`}>Dismiss</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Sessions */}
        <div className={styles.panelCard}>
          <h3 className={styles.panelTitle}>
            <MapPin size={20} color="#3b82f6" />
            Live Login Activity Stream
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: 'var(--space-md)' }}>
            Geographic and device footprint of active sessions.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.dataTable} style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Account / IP</th>
                  <th>Location / Device</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SESSIONS.map((session) => (
                  <tr key={session.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{session.user}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                        <Globe size={12}/> <span className={styles.mono}>{session.ip}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ color: 'var(--text-main)' }}>{session.loc}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-dim)' }}>
                        {session.type === 'desktop' ? <Monitor size={12} /> : <Smartphone size={12} />}
                        {session.device}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-dim)' }}>
                      {session.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SecurityTab;

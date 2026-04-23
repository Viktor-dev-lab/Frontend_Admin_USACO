import React, { useState, useEffect } from 'react';
import styles from './System.module.css';
import { Server, Activity, Database, ListOrdered, Globe, AlertTriangle, ShieldAlert } from 'lucide-react';

const WORKER_NODES = [
  { id: 'worker-us-pool-1', status: 'Alive', cpu: 45, mem: 60 },
  { id: 'worker-us-pool-2', status: 'Busy', cpu: 92, mem: 85 },
  { id: 'worker-eu-pool-1', status: 'Alive', cpu: 12, mem: 30 },
  { id: 'worker-sea-pool-1', status: 'Dead', cpu: 0, mem: 0 },
];

const DEAD_LETTERS = [
  { id: 'sub_a81hf', user: 'khang.le123', error: 'OOM Killed', time: '10m ago' },
  { id: 'sub_z92kq', user: 'lam.nguyen', error: 'Orphaned Sandbox', time: '1h ago' },
];

const System = () => {
  // Simulate realtime chart bars jumping
  const [bars, setBars] = useState(Array(15).fill(20));

  useEffect(() => {
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.floor(Math.random() * 80) + 10));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getBarColor = (val: number) => {
    if (val < 60) return styles.barGreen;
    if (val < 85) return styles.barYellow;
    return styles.barRed;
  };

  return (
    <div className="fade-in">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <Activity size={28} /> System & Infrastructure Monitor
        </h1>
        <p className={styles.pageSubtitle}>
          Real-time metrics for Judge backend, message queues, and worker nodes.
        </p>
      </div>

      {/* Top Zone: DB, Cache, active general stats */}
      <div className={styles.topMetricsGrid}>
        <div className={styles.metricCard}>
          <div className={`${styles.liveIndicator}`}><div className={`${styles.pulseDot} ${styles.healthy}`}></div></div>
          <div className={styles.metricLabel}><Database size={14} style={{ display: 'inline', marginRight: '4px' }}/> PgSQL Connections</div>
          <div className={styles.metricValue}>114<span className={styles.metricUnit}>/ 500</span></div>
        </div>
        <div className={styles.metricCard}>
          <div className={`${styles.liveIndicator}`}><div className={`${styles.pulseDot} ${styles.healthy}`}></div></div>
          <div className={styles.metricLabel}><Server size={14} style={{ display: 'inline', marginRight: '4px' }}/> Redis Load</div>
          <div className={styles.metricValue}>45.2<span className={styles.metricUnit}>k ops/s</span></div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}><ListOrdered size={14} style={{ display: 'inline', marginRight: '4px' }}/> HTTP Error Rate</div>
          <div className={styles.metricValue} style={{ color: '#10b981' }}>0.04<span className={styles.metricUnit}>%</span></div>
        </div>
        <div className={styles.metricCard}>
          <div className={`${styles.liveIndicator}`}><div className={`${styles.pulseDot} ${styles.healthy}`}></div></div>
          <div className={styles.metricLabel}><Globe size={14} style={{ display: 'inline', marginRight: '4px' }}/> Active WebSockets</div>
          <div className={styles.metricValue}>1,042</div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Left Column: Queues and Traffic */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Message Queue Status</h3>
            <div style={{ display: 'flex', gap: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
              <div>
                <div className={styles.metricLabel}>Pending Submissions (Queue Length)</div>
                <div className={styles.metricValue} style={{ color: '#f59e0b' }}>124</div>
              </div>
              <div>
                <div className={styles.metricLabel}>Processing Rate</div>
                <div className={styles.metricValue}>18<span className={styles.metricUnit}>req/sec</span></div>
              </div>
            </div>

            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Dead Letter Queue (Failed to Judge)</h4>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Submission ID</th>
                  <th>User</th>
                  <th>Error</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {DEAD_LETTERS.map(dlq => (
                  <tr key={dlq.id}>
                    <td><span className={styles.mono}>{dlq.id}</span></td>
                    <td>{dlq.user}</td>
                    <td style={{ color: '#ef4444', fontSize: '0.8rem' }}>{dlq.error}</td>
                    <td><button className={styles.btnSmall}>Requeue</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>API Latency & Traffic</h3>
            <div className={styles.chartPlaceholder}>
              {bars.map((height, i) => (
                <div key={i} className={styles.barChartCol} style={{ height: `${height}%` }}></div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              <span>Time (last 30s)</span>
              <span>Avg Latency: <strong style={{ color: 'var(--text-main)' }}>45ms</strong></span>
            </div>
          </div>

        </div>

        {/* Right Column: Worker Nodes Health */}
        <div className={styles.panel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
            <h3 className={styles.panelTitle}>Judge Worker Nodes</h3>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sandbox Crash Rate</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={14} /> 2.4%
              </div>
            </div>
          </div>

          <div className={styles.workerList}>
            {WORKER_NODES.map(node => (
              <div key={node.id} className={styles.workerNode}>
                <div className={styles.workerHeader}>
                  <div className={styles.workerName}>
                    <Server size={14} color="var(--text-dim)"/> 
                    <span className={styles.mono}>{node.id}</span>
                  </div>
                  <span className={`${styles.badge} ${
                    node.status === 'Alive' ? styles.badgeAlive :
                    node.status === 'Busy' ? styles.badgeBusy : styles.badgeDead
                  }`}>
                    {node.status}
                  </span>
                </div>
                
                <div className={styles.resourceBlock}>
                  <div className={styles.resourceHeader}>
                    <span>CPU Usage</span>
                    <span className={styles.mono}>{node.cpu}%</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div className={`${styles.barFill} ${getBarColor(node.cpu)}`} style={{ width: `${node.cpu}%` }}></div>
                  </div>
                </div>

                <div className={styles.resourceBlock}>
                  <div className={styles.resourceHeader}>
                    <span>Memory Usage</span>
                    <span className={styles.mono}>{node.mem}%</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div className={`${styles.barFill} ${getBarColor(node.mem)}`} style={{ width: `${node.mem}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'var(--space-xl)', padding: '12px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>
              <ShieldAlert size={16} /> Cluster Warning
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Node <span className={styles.mono}>worker-sea-pool-1</span> is unresponsive. Auto-scaling policy has triggered a replacement.</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default System;

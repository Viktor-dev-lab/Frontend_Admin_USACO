import React, { useState } from 'react';
import styles from './Users.module.css';
import { Shield, Users as UsersIcon, Activity, Key, Search, MoreVertical } from 'lucide-react';
import IAMTab from '../components/users/IAMTab';
import SecurityTab from '../components/users/SecurityTab';

import AuditLogsTab from '../components/users/AuditLogsTab';

type TabId = 'iam' | 'security' | 'audit';

const Users = () => {
  const [activeTab, setActiveTab] = useState<TabId>('iam');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'iam':
        return <IAMTab />;
      case 'security':
        return <SecurityTab />;

      case 'audit':
        return <AuditLogsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="fade-in">
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderTop}>
          <div>
            <h1 className={styles.pageTitle}>User Management</h1>
            <p className={styles.pageSubtitle}>
              Control identity, access, security, and platform integrity across the ecosystem.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.tabsContainer}>
        <div className={styles.tabsList}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'iam' ? styles.active : ''}`}
            onClick={() => setActiveTab('iam')}
          >
            <UsersIcon size={18} />
            Identity & Access
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'security' ? styles.active : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={18} />
            Security & Activity
          </button>

          <button 
            className={`${styles.tabButton} ${activeTab === 'audit' ? styles.active : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <Key size={18} />
            Audit Logs
          </button>
        </div>
      </div>

      <div className={styles.tabContent}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Users;

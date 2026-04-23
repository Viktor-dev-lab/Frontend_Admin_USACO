import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import styles from './DashboardLayout.module.css';
import { Bell, Search, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<Props> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <header className={`${styles.header} glass`}>
          <div className={styles.searchBar}>
            <Search size={18} className={styles.searchIcon} />
            <input type="text" placeholder="Search for problems, students..." />
          </div>
          <div className={styles.headerActions}>
            <button className={styles.actionBtn} title="Notifications">
              <Bell size={20} />
              <span className={styles.badge} />
            </button>
            <div className={styles.userProfile}>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user ? `${user.firstName} ${user.lastName}` : 'Admin'}</span>
                <span className={styles.userRole}>{user?.role || 'Super Admin'}</span>
              </div>
              <div className={styles.avatar}>
                {user?.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" className={styles.avatarImg} /> : <UserIcon size={20} />}
              </div>
              <button 
                className={styles.logoutBtn} 
                onClick={logout} 
                title="Logout"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '8px',
                  borderRadius: '8px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

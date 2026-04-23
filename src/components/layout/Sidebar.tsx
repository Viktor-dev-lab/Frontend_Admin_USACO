import React from 'react';
import styles from './Sidebar.module.css';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Code2, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  History,
  Terminal,
  TrendingUp,
  Activity
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <TrendingUp size={20} />, label: 'Revenue', path: '/revenue' },
    { icon: <Users size={20} />, label: 'Users', path: '/users' },
    { icon: <Code2 size={20} />, label: 'Problems', path: '/problems' },
    { icon: <BookOpen size={20} />, label: 'Curriculum', path: '/content' },
    { icon: <History size={20} />, label: 'Submissions', path: '/submissions' },
    { icon: <Activity size={20} />, label: 'System', path: '/system' },
  ];

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} glass`}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}><Terminal size={24} color="var(--primary)" /></div>
          {!isCollapsed && <span className={styles.logoText}>USACO<span className={styles.logoSub}>Admin</span></span>}
        </div>
        <button 
          className={styles.toggleBtn} 
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronLeft size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
          >
            <div className={styles.icon}>{item.icon}</div>
            {!isCollapsed && <span className={styles.label}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.navLink}>
          <div className={styles.icon}><Settings size={20} /></div>
          {!isCollapsed && <span className={styles.label}>Settings</span>}
        </div>
        <div className={`${styles.navLink} ${styles.logout}`}>
          <div className={styles.icon}><LogOut size={20} /></div>
          {!isCollapsed && <span className={styles.label}>Logout</span>}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

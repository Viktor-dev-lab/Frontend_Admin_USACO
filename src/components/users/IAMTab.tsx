import React, { useState } from 'react';
import styles from '../../pages/Users.module.css';
import { Search, MoreVertical, Shield, Ban, Lock, RefreshCw, LogOut } from 'lucide-react';

const MOCK_USERS = [
  { id: 'usr_01', name: 'Lam Nguyen', email: 'lam.nguyen@example.com', role: 'SuperAdmin', status: 'Active', lastLogin: '2 mins ago', avatar: 'LN' },
  { id: 'usr_02', name: 'Minh Tran', email: 'minh.tran@example.com', role: 'ProblemModerator', status: 'Active', lastLogin: '1 hour ago', avatar: 'MT' },
  { id: 'usr_03', name: 'Khang Le', email: 'khang.le123@example.com', role: 'PremiumUser', status: 'Suspended', lastLogin: '2 days ago', avatar: 'KL' },
  { id: 'usr_04', name: 'Ha Vu', email: 'ha.vu.dev@example.com', role: 'User', status: 'Active', lastLogin: '5 hours ago', avatar: 'HV' },
  { id: 'usr_05', name: 'Bao Pham', email: 'bao.pham09@example.com', role: 'User', status: 'Banned', lastLogin: '1 week ago', avatar: 'BP' },
];

const IAMTab = () => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const toggleDropdown = (id: string) => {
    if (openDropdownId === id) {
      setOpenDropdownId(null);
    } else {
      setOpenDropdownId(id);
    }
  };

  // Close dropdown when clicking outside could be added here later

  return (
    <div className={styles.tabContent}>
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={18} color="var(--text-dim)" />
          <input type="text" placeholder="Search by ID, email, or username..." />
        </div>
        <div className={styles.filters}>
          <select className={styles.filterSelect}>
            <option value="">All Roles</option>
            <option value="SuperAdmin">SuperAdmin</option>
            <option value="ProblemModerator">ProblemModerator</option>
            <option value="PremiumUser">PremiumUser</option>
            <option value="User">User</option>
          </select>
          <select className={styles.filterSelect}>
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Banned">Banned</option>
          </select>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_USERS.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className={styles.userCell}>
                    <div className={styles.avatar}>{user.avatar}</div>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{user.name} <span className={styles.mono}>#{user.id}</span></span>
                      <span className={styles.userEmail}>{user.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`${styles.badge} ${
                    user.role === 'SuperAdmin' ? styles.badgeSuperAdmin :
                    user.role === 'ProblemModerator' ? styles.badgeModerator :
                    user.role === 'PremiumUser' ? styles.badgePremium : styles.badgeUser
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${
                    user.status === 'Active' ? styles.statusActive :
                    user.status === 'Suspended' ? styles.statusSuspended : styles.statusBanned
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                  {user.lastLogin}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button className={styles.actionBtn} title="Manage Role">
                      <Shield size={16} />
                    </button>
                    <div className={styles.actionMenuWrapper}>
                      <button 
                        className={styles.actionBtn} 
                        title="More Actions"
                        onClick={() => toggleDropdown(user.id)}
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {openDropdownId === user.id && (
                        <div className={styles.dropdownMenu}>
                          <button className={styles.dropdownItem}>
                            <Lock size={14} /> Suspend Account
                          </button>
                          <button className={styles.dropdownItem}>
                            <RefreshCw size={14} /> Reset Password
                          </button>
                          <button className={styles.dropdownItem}>
                            <LogOut size={14} /> Force Logout
                          </button>
                          <div className={styles.dropdownDivider}></div>
                          <button className={`${styles.dropdownItem} ${styles.danger}`}>
                            <Ban size={14} /> Ban User
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IAMTab;

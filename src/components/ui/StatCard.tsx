import React from 'react';
import styles from './StatCard.module.css';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color = 'var(--primary)' }) => {
  return (
    <div className={`${styles.card} glass`}>
      <div className={styles.header}>
        <div className={styles.iconWrapper} style={{ backgroundColor: `rgba(${color}, 0.1)`, color: color }}>
          {icon}
        </div>
        {trend && (
          <div className={`${styles.trend} ${trend.isUp ? styles.up : styles.down}`}>
            {trend.isUp ? '+' : '-'}{Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.value}>{value}</p>
      </div>
    </div>
  );
};

export default StatCard;

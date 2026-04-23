import React, { useState, useMemo } from 'react';
import styles from './Dashboard.module.css';
import {
  Users, UserPlus, Activity, Wifi,
  Send, CheckCircle2, XCircle, Clock, AlertTriangle,
  TrendingUp, ArrowUpRight, ArrowDownRight, Zap, ChevronLeft, ChevronRight, Calendar
} from 'lucide-react';
import {
  AreaChart, Area,
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

// ─── Helper: generate deterministic-ish data per month ────────────────────────

function seeded(seed: number, min: number, max: number) {
  const x = Math.sin(seed) * 10000;
  const r = x - Math.floor(x);
  return Math.round(min + r * (max - min));
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Generate daily submission data for a given month/year
function genDailySubmissions(year: number, month: number) {
  const days = daysInMonth(year, month);
  return Array.from({ length: days }, (_, i) => {
    const seed = year * 100 + month * 10 + i;
    const dayLabel = `${i + 1}/${month + 1}`;
    const s = seeded(seed, 80, 620);
    return { day: dayLabel, submissions: s };
  });
}

// Generate user stats for a given month/year
function genUserStats(year: number, month: number) {
  const seed = year * 12 + month;
  const base = 10000 + seed * 87;
  const prevBase = 10000 + (seed - 1) * 87;
  const newThisMonth = seeded(seed + 1, 400, 1800);
  const prevNewMonth = seeded(seed, 400, 1800);

  const dau = seeded(seed + 2, 2400, 5000);
  const mau = seeded(seed + 3, 7000, 14000);
  const online = seeded(seed + 4, 200, 800);

  const growthMonth = prevBase > 0 ? (((newThisMonth - prevNewMonth) / prevNewMonth) * 100) : 5;

  return {
    totalUsers: base + newThisMonth,
    newUsersThisMonth: newThisMonth,
    prevNewUsersMonth: prevNewMonth,
    growthMonth: parseFloat(growthMonth.toFixed(1)),
    dau,
    mau,
    currentlyOnline: online,
  };
}

// Generate submission status data for a given month/year
function genStatusData(year: number, month: number) {
  const seed = year * 12 + month;
  const ac = seeded(seed + 10, 3000, 8000);
  const wa = seeded(seed + 11, 2000, 5500);
  const tle = seeded(seed + 12, 800, 2500);
  const ce = seeded(seed + 13, 400, 1200);
  const re = seeded(seed + 14, 200, 800);
  return [
    { name: 'Accepted (AC)', value: ac, color: '#10b981' },
    { name: 'Wrong Answer (WA)', value: wa, color: '#ef4444' },
    { name: 'Time Limit Exceeded (TLE)', value: tle, color: '#f59e0b' },
    { name: 'Compilation Error (CE)', value: ce, color: '#8b5cf6' },
    { name: 'Runtime Error (RE)', value: re, color: '#ec4899' },
  ];
}

// Generate language data for a given month/year
function genLanguageData(year: number, month: number) {
  const seed = year * 12 + month;
  return [
    { language: 'C++',    count: seeded(seed + 20, 3000, 9000), color: '#3b82f6' },
    { language: 'Python', count: seeded(seed + 21, 2000, 6500), color: '#10b981' },
    { language: 'Java',   count: seeded(seed + 22, 1200, 4000), color: '#f59e0b' },
    { language: 'C#',     count: seeded(seed + 23, 400, 1800),  color: '#a855f7' },
    { language: 'Go',     count: seeded(seed + 24, 200, 1200),  color: '#06b6d4' },
    { language: 'Rust',   count: seeded(seed + 25, 100, 800),   color: '#ef4444' },
  ];
}

// Generate monthly new-user trend for the year (12 months in a year)
function genMonthlyUserTrend(year: number) {
  return SHORT_MONTHS.map((label, m) => {
    const seed = year * 12 + m;
    return { month: label, newUsers: seeded(seed + 1, 400, 1800) };
  });
}

// ─── Custom Tooltips ──────────────────────────────────────────────────────────

const DailyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>Day {label}</p>
        <p className={styles.tooltipValue}>{payload[0].value.toLocaleString()} submissions</p>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload, total }: any) => {
  if (active && payload && payload.length) {
    const percent = ((payload[0].value / total) * 100).toFixed(1);
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{payload[0].name}</p>
        <p className={styles.tooltipValue}>{payload[0].value.toLocaleString()} ({percent}%)</p>
      </div>
    );
  }
  return null;
};

const UserTrendTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        <p className={styles.tooltipValue}>+{payload[0].value.toLocaleString()} new users</p>
      </div>
    );
  }
  return null;
};

// ─── Month/Year Picker ────────────────────────────────────────────────────────

interface MonthPickerProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

const MonthPicker: React.FC<MonthPickerProps> = ({ year, month, onChange }) => {
  const now = new Date();
  const isMax = year === now.getFullYear() && month === now.getMonth();

  const prev = () => {
    if (month === 0) onChange(year - 1, 11);
    else onChange(year, month - 1);
  };

  const next = () => {
    if (isMax) return;
    if (month === 11) onChange(year + 1, 0);
    else onChange(year, month + 1);
  };

  return (
    <div className={styles.monthPicker}>
      <button className={styles.monthNavBtn} onClick={prev}>
        <ChevronLeft size={16} />
      </button>
      <div className={styles.monthDisplay}>
        <Calendar size={14} />
        <span>{MONTH_NAMES[month]} {year}</span>
      </div>
      <button className={styles.monthNavBtn} onClick={next} disabled={isMax}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

// ─── Dashboard Component ──────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const userStats = useMemo(() => genUserStats(year, month), [year, month]);
  const dailySubmissions = useMemo(() => genDailySubmissions(year, month), [year, month]);
  const statusData = useMemo(() => genStatusData(year, month), [year, month]);
  const languageData = useMemo(() => genLanguageData(year, month), [year, month]);
  const monthlyTrend = useMemo(() => genMonthlyUserTrend(year), [year]);

  const totalStatusSubmissions = useMemo(() =>
    statusData.reduce((sum, d) => sum + d.value, 0), [statusData]);
  const totalDailySubmissions = useMemo(() =>
    dailySubmissions.reduce((sum, d) => sum + d.submissions, 0), [dailySubmissions]);
  const peakDay = useMemo(() =>
    dailySubmissions.reduce((max, d) => d.submissions > max.submissions ? d : max, dailySubmissions[0]),
    [dailySubmissions]);
  const maxLangCount = useMemo(() =>
    Math.max(...languageData.map(d => d.count)), [languageData]);
  const totalLangSubmissions = useMemo(() =>
    languageData.reduce((sum, d) => sum + d.count, 0), [languageData]);

  const growthPositive = userStats.growthMonth >= 0;

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderTop}>
          <div>
            <h1 className={styles.pageTitle}>Dashboard Analytics</h1>
            <p className={styles.pageSubtitle}>
              Platform insights for <strong>{MONTH_NAMES[month]} {year}</strong>
            </p>
          </div>
          <MonthPicker year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1: USER ANALYTICS
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <Users size={20} />
          </div>
          <div>
            <h2 className={styles.sectionTitle}>User Analytics</h2>
            <p className={styles.sectionSubtitle}>Community growth and engagement — {MONTH_NAMES[month]} {year}</p>
          </div>
        </div>

        <div className={styles.statsGrid}>
          {/* Total Users */}
          <div className={`${styles.miniStatCard} glass`}>
            <div className={styles.cardTop}>
              <div className={styles.cardIconWrap} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                <Users size={20} />
              </div>
              <span className={styles.cardBadgeSmall}>ALL TIME</span>
            </div>
            <div className={styles.cardValue}>{userStats.totalUsers.toLocaleString()}</div>
            <div className={styles.cardLabel}>Total Users</div>
            <div className={styles.cardBottom}>
              <span className={styles.cardMeta}>Cumulative up to {SHORT_MONTHS[month]} {year}</span>
            </div>
          </div>

          {/* New Users This Month */}
          <div className={`${styles.miniStatCard} glass`}>
            <div className={styles.cardTop}>
              <div className={styles.cardIconWrap} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <UserPlus size={20} />
              </div>
              <span className={styles.cardBadgeSmall}>THIS MONTH</span>
            </div>
            <div className={styles.cardValue}>{userStats.newUsersThisMonth.toLocaleString()}</div>
            <div className={styles.cardLabel}>New Registrations</div>
            <div className={styles.cardBottom}>
              <span className={`${styles.trendBadge} ${growthPositive ? styles.trendUp : styles.trendDown}`}>
                {growthPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {growthPositive ? '+' : ''}{userStats.growthMonth}%
              </span>
              <span className={styles.cardMeta}>vs last month</span>
            </div>
          </div>

          {/* DAU & MAU */}
          <div className={`${styles.miniStatCard} glass`}>
            <div className={styles.cardTop}>
              <div className={styles.cardIconWrap} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                <Activity size={20} />
              </div>
              <span className={styles.cardBadgeSmall}>ACTIVE</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
              <span className={styles.cardValue}>{userStats.dau.toLocaleString()}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>/</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {userStats.mau.toLocaleString()}
              </span>
            </div>
            <div className={styles.cardLabel}>DAU / MAU</div>
            <div className={styles.cardBottom}>
              <span style={{ fontSize: '0.72rem', color: '#a855f7', fontWeight: 600 }}>
                Stickiness: {((userStats.dau / userStats.mau) * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Currently Online */}
          <div className={`${styles.miniStatCard} glass`}>
            <div className={styles.cardTop}>
              <div className={styles.cardIconWrap} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <Wifi size={20} />
              </div>
              <span className={styles.cardBadgeSmall}>LIVE</span>
            </div>
            <div className={styles.cardValue}>{userStats.currentlyOnline}</div>
            <div className={styles.cardLabel}>Online Now</div>
            <div className={styles.cardBottom}>
              <div className={styles.onlinePulse}>
                <div className={styles.pulseDot} />
                <span className={styles.onlineText}>Active sessions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly New User Trend for the Year */}
        <div className={`${styles.chartCard} glass`}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Monthly New User Registrations</h3>
            <span className={styles.chartBadge}>Year {year}</span>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<UserTrendTooltip />} />
                {/* Highlight current month */}
                <Area
                  type="monotone"
                  dataKey="newUsers"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#userGrad)"
                  dot={(props: any) => {
                    const { cx, cy, index } = props;
                    if (index === month) {
                      return <circle key={index} cx={cx} cy={cy} r={6} fill="#3b82f6" stroke="#0f1115" strokeWidth={2} />;
                    }
                    return <circle key={index} cx={cx} cy={cy} r={0} fill="none" />;
                  }}
                  activeDot={{ r: 5, fill: '#3b82f6', stroke: '#0f1115', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2: SUBMISSION METRICS
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <Send size={20} />
          </div>
          <div>
            <h2 className={styles.sectionTitle}>Submission Metrics</h2>
            <p className={styles.sectionSubtitle}>Submission activity and result analysis — {MONTH_NAMES[month]} {year}</p>
          </div>
        </div>

        {/* Submission Quick Stats */}
        <div className={styles.submissionStatsRow}>
          <div className={`${styles.submissionMiniCard} glass`}>
            <div className={styles.submissionMiniIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <Send size={16} />
            </div>
            <div>
              <div className={styles.submissionMiniLabel}>Total This Month</div>
              <div className={styles.submissionMiniValue}>{totalDailySubmissions.toLocaleString()}</div>
            </div>
          </div>
          <div className={`${styles.submissionMiniCard} glass`}>
            <div className={styles.submissionMiniIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <CheckCircle2 size={16} />
            </div>
            <div>
              <div className={styles.submissionMiniLabel}>Accepted (AC)</div>
              <div className={styles.submissionMiniValue}>{statusData[0].value.toLocaleString()}</div>
            </div>
          </div>
          <div className={`${styles.submissionMiniCard} glass`}>
            <div className={styles.submissionMiniIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <Zap size={16} />
            </div>
            <div>
              <div className={styles.submissionMiniLabel}>Peak Day</div>
              <div className={styles.submissionMiniValue}>{peakDay?.day || '—'}</div>
            </div>
          </div>
          <div className={`${styles.submissionMiniCard} glass`}>
            <div className={styles.submissionMiniIcon} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
              <TrendingUp size={16} />
            </div>
            <div>
              <div className={styles.submissionMiniLabel}>AC Rate</div>
              <div className={styles.submissionMiniValue}>
                {((statusData[0].value / totalStatusSubmissions) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Row 1: Daily Area Chart + Status Pie Chart */}
        <div className={styles.chartsRow}>
          {/* Daily Submissions Chart */}
          <div className={`${styles.chartCard} glass`}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Daily Submissions</h3>
              <span className={styles.chartBadge}>{MONTH_NAMES[month]} {year}</span>
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySubmissions} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="submissionGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    interval={4}
                    tickFormatter={(val) => val.split('/')[0]}
                  />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<DailyTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="submissions"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#submissionGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#10b981', stroke: '#0f1115', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Pie Chart */}
          <div className={`${styles.chartCard} glass`}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Status Breakdown</h3>
              <span className={styles.chartBadge}>{MONTH_NAMES[month]} {year}</span>
            </div>
            <div className={styles.pieContainer}>
              <div className={styles.pieChart}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip total={totalStatusSubmissions} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.pieLegend}>
                {statusData.map((entry, i) => (
                  <div key={i} className={styles.legendItem}>
                    <div className={styles.legendDot} style={{ backgroundColor: entry.color }} />
                    <span className={styles.legendLabel}>{entry.name.split(' (')[0]}</span>
                    <span className={styles.legendValue}>{entry.value.toLocaleString()}</span>
                    <span className={styles.legendPercent}>
                      {((entry.value / totalStatusSubmissions) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Submissions by Language */}
        <div className={styles.chartsRowThird}>
          <div className={`${styles.chartCard} glass`}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Submissions by Language</h3>
              <span className={styles.chartBadge}>{totalLangSubmissions.toLocaleString()} total · {MONTH_NAMES[month]} {year}</span>
            </div>
            <div className={styles.langBarContainer}>
              {[...languageData]
                .sort((a, b) => b.count - a.count)
                .map((lang, i) => (
                  <div key={i} className={styles.langBarItem}>
                    <span className={styles.langBarLabel}>{lang.language}</span>
                    <div className={styles.langBarTrack}>
                      <div
                        className={styles.langBarFill}
                        style={{
                          width: `${(lang.count / maxLangCount) * 100}%`,
                          background: `linear-gradient(90deg, ${lang.color}, ${lang.color}dd)`,
                        }}
                      >
                        <span className={styles.langBarCount}>{lang.count.toLocaleString()}</span>
                      </div>
                    </div>
                    <span className={styles.langBarPercent}>
                      {((lang.count / totalLangSubmissions) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useMemo } from 'react';
import styles from './Revenue.module.css';
import {
  DollarSign, TrendingUp, TrendingDown, ShoppingCart, Users, UserPlus,
  RefreshCw, Star, BookOpen, BarChart2, ArrowUpRight, ArrowDownRight,
  ChevronLeft, ChevronRight, Calendar, Target, Award, Repeat2, Layers
} from 'lucide-react';
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ComposedChart
} from 'recharts';

// ─── Seeded random helper ─────────────────────────────────────────────────────

function seeded(seed: number, min: number, max: number) {
  const x = Math.sin(seed + 1) * 10000;
  const r = x - Math.floor(x);
  return Math.round(min + r * (max - min));
}

function seededFloat(seed: number, min: number, max: number) {
  const x = Math.sin(seed + 7) * 10000;
  const r = x - Math.floor(x);
  return parseFloat((min + r * (max - min)).toFixed(2));
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// ─── Data Generators ──────────────────────────────────────────────────────────

function genRevenueStats(year: number, month: number) {
  const seed = year * 12 + month;
  const grossRevenue = seeded(seed + 100, 85_000_000, 320_000_000);
  const refunds = seeded(seed + 101, 2_000_000, 12_000_000);
  const discounts = seeded(seed + 102, 4_000_000, 18_000_000);
  const netRevenue = grossRevenue - refunds - discounts;
  const totalOrders = seeded(seed + 103, 1200, 5800);
  const aov = Math.round(grossRevenue / totalOrders);

  const prevSeed = seed - 1;
  const prevGross = seeded(prevSeed + 100, 85_000_000, 320_000_000);
  const prevNet = prevGross - seeded(prevSeed + 101, 2_000_000, 12_000_000) - seeded(prevSeed + 102, 4_000_000, 18_000_000);
  const prevOrders = seeded(prevSeed + 103, 1200, 5800);
  const prevAov = Math.round(prevGross / prevOrders);

  const todayRev = seeded(seed + 104, 2_000_000, 12_000_000);
  const yesterdayRev = seeded(seed + 105, 2_000_000, 12_000_000);
  const thisMonthSoFar = seeded(seed + 106, 40_000_000, 180_000_000);

  return {
    grossRevenue, refunds, discounts, netRevenue, totalOrders, aov,
    prevGross, prevNet, prevOrders, prevAov,
    todayRev, yesterdayRev, thisMonthSoFar,
    grossGrowth: parseFloat((((grossRevenue - prevGross) / prevGross) * 100).toFixed(1)),
    netGrowth: parseFloat((((netRevenue - prevNet) / prevNet) * 100).toFixed(1)),
    ordersGrowth: parseFloat((((totalOrders - prevOrders) / prevOrders) * 100).toFixed(1)),
    aovGrowth: parseFloat((((aov - prevAov) / prevAov) * 100).toFixed(1)),
  };
}

function genCustomerStats(year: number, month: number) {
  const seed = year * 12 + month;
  const newCustomers = seeded(seed + 200, 800, 3500);
  const prevNew = seeded(seed - 1 + 200, 800, 3500);
  const totalVisitors = seeded(seed + 201, 80_000, 350_000);
  const courseViewers = seeded(seed + 202, 40_000, 150_000);
  const buyers = seeded(seed + 203, 1200, 5800);
  const conversionRate = parseFloat(((buyers / courseViewers) * 100).toFixed(2));
  const totalCustomersEver = 10_000 + seed * 150 + newCustomers;
  const returningCustomers = seeded(seed + 204, 400, 2400);
  const retentionRate = parseFloat(((returningCustomers / (totalCustomersEver / 10)) * 100).toFixed(1));
  const ltv = seeded(seed + 205, 850_000, 4_200_000);

  return {
    newCustomers, prevNew,
    newGrowth: parseFloat((((newCustomers - prevNew) / prevNew) * 100).toFixed(1)),
    totalVisitors, courseViewers, buyers,
    conversionRate, returningCustomers, retentionRate, ltv
  };
}

function genTopCourses(year: number, month: number) {
  const seed = year * 12 + month;
  const courses = [
    { name: 'Lập trình C++ Nâng Cao', category: 'C++', color: '#3b82f6' },
    { name: 'Giải thuật & CTDL Pro', category: 'Algorithms', color: '#10b981' },
    { name: 'Python cho Khoa học Dữ liệu', category: 'Python', color: '#f59e0b' },
    { name: 'Competitive Programming Bootcamp', category: 'CP', color: '#a855f7' },
    { name: 'Dynamic Programming Masterclass', category: 'Algorithms', color: '#ec4899' },
    { name: 'Đồ thị & BFS/DFS Toàn Tập', category: 'Graphs', color: '#06b6d4' },
    { name: 'Java Backend Developer Path', category: 'Java', color: '#f97316' },
    { name: 'Frontend React Thực Chiến', category: 'Frontend', color: '#84cc16' },
  ];
  return courses.map((c, i) => ({
    ...c,
    orders: seeded(seed + 300 + i, 80, 900),
    revenue: seeded(seed + 310 + i, 8_000_000, 95_000_000),
    completionRate: seededFloat(seed + 320 + i, 28, 87),
    rating: seededFloat(seed + 330 + i, 3.5, 5.0),
  })).sort((a, b) => b.revenue - a.revenue);
}

function genDailyRevenue(year: number, month: number) {
  const days = daysInMonth(year, month);
  return Array.from({ length: days }, (_, i) => {
    const seed = year * 100 + month * 10 + i;
    const gross = seeded(seed + 400, 1_000_000, 15_000_000);
    const net = gross - seeded(seed + 401, 100_000, 1_500_000);
    return { day: `${i + 1}`, gross, net };
  });
}

function genMonthlyRevenueTrend(year: number) {
  return SHORT_MONTHS.map((label, m) => {
    const seed = year * 12 + m;
    const gross = seeded(seed + 500, 60_000_000, 320_000_000);
    const net = gross - seeded(seed + 501, 5_000_000, 25_000_000);
    const orders = seeded(seed + 502, 1000, 6000);
    return { month: label, gross, net, orders };
  });
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtVND(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function fmtFullVND(value: number) {
  return value.toLocaleString('vi-VN') + ' ₫';
}

// ─── Custom Tooltips ──────────────────────────────────────────────────────────

const RevenueTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>Ngày {label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className={styles.tooltipValue} style={{ color: p.color }}>
            {p.name}: {fmtVND(p.value)} ₫
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MonthTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className={styles.tooltipValue} style={{ color: p.color }}>
            {p.name === 'orders' ? `${p.value.toLocaleString()} đơn` : `${fmtVND(p.value)} ₫`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Month Picker ─────────────────────────────────────────────────────────────

interface MonthPickerProps {
  year: number;
  month: number;
  onChange: (y: number, m: number) => void;
}

const MonthPicker: React.FC<MonthPickerProps> = ({ year, month, onChange }) => {
  const now = new Date();
  const isMax = year === now.getFullYear() && month === now.getMonth();
  const prev = () => { if (month === 0) onChange(year - 1, 11); else onChange(year, month - 1); };
  const next = () => { if (isMax) return; if (month === 11) onChange(year + 1, 0); else onChange(year, month + 1); };
  return (
    <div className={styles.monthPicker}>
      <button className={styles.monthNavBtn} onClick={prev}><ChevronLeft size={16} /></button>
      <div className={styles.monthDisplay}>
        <Calendar size={14} />
        <span>{MONTH_NAMES[month]} {year}</span>
      </div>
      <button className={styles.monthNavBtn} onClick={next} disabled={isMax}><ChevronRight size={16} /></button>
    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  badge: string;
  value: string;
  label: string;
  growth?: number;
  subValue?: string;
  subLabel?: string;
  accentColor?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  icon, iconBg, iconColor, badge, value, label,
  growth, subValue, subLabel, accentColor
}) => {
  const up = growth !== undefined && growth >= 0;
  return (
    <div className={`${styles.kpiCard} glass`} style={{ '--accent': accentColor || '#3b82f6' } as React.CSSProperties}>
      <div className={styles.kpiTop}>
        <div className={styles.kpiIconWrap} style={{ background: iconBg, color: iconColor }}>{icon}</div>
        <span className={styles.kpiBadge}>{badge}</span>
      </div>
      <div className={styles.kpiValue}>{value}</div>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiBottom}>
        {growth !== undefined && (
          <span className={`${styles.trendBadge} ${up ? styles.trendUp : styles.trendDown}`}>
            {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {up ? '+' : ''}{growth}%
          </span>
        )}
        {subValue && subLabel && (
          <span className={styles.kpiMeta}>{subLabel}: <strong>{subValue}</strong></span>
        )}
      </div>
    </div>
  );
};

// ─── Revenue Page ─────────────────────────────────────────────────────────────

const Revenue: React.FC = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [courseSort, setCourseSort] = useState<'revenue' | 'orders'>('revenue');

  const rev = useMemo(() => genRevenueStats(year, month), [year, month]);
  const cust = useMemo(() => genCustomerStats(year, month), [year, month]);
  const topCourses = useMemo(() => genTopCourses(year, month), [year, month]);
  const dailyRev = useMemo(() => genDailyRevenue(year, month), [year, month]);
  const monthlyTrend = useMemo(() => genMonthlyRevenueTrend(year), [year]);

  const sortedCourses = useMemo(() =>
    [...topCourses].sort((a, b) => b[courseSort] - a[courseSort]),
    [topCourses, courseSort]
  );

  const maxCourseRevenue = useMemo(() => Math.max(...topCourses.map(c => c.revenue)), [topCourses]);

  return (
    <div className="fade-in">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderTop}>
          <div>
            <h1 className={styles.pageTitle}>Revenue Analytics</h1>
            <p className={styles.pageSubtitle}>
              Doanh thu & Khách hàng — <strong>{MONTH_NAMES[month]} {year}</strong>
            </p>
          </div>
          <MonthPicker year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
        </div>

        {/* Today vs Yesterday quick strip */}
        <div className={styles.quickStrip}>
          <div className={styles.quickItem}>
            <span className={styles.quickLabel}>Hôm nay</span>
            <span className={styles.quickVal}>{fmtVND(rev.todayRev)} ₫</span>
            {rev.todayRev >= rev.yesterdayRev
              ? <span className={`${styles.quickBadge} ${styles.qUp}`}><ArrowUpRight size={11} />+{(((rev.todayRev - rev.yesterdayRev) / rev.yesterdayRev) * 100).toFixed(1)}%</span>
              : <span className={`${styles.quickBadge} ${styles.qDown}`}><ArrowDownRight size={11} />{(((rev.todayRev - rev.yesterdayRev) / rev.yesterdayRev) * 100).toFixed(1)}%</span>
            }
          </div>
          <div className={styles.quickDivider} />
          <div className={styles.quickItem}>
            <span className={styles.quickLabel}>Hôm qua</span>
            <span className={styles.quickVal}>{fmtVND(rev.yesterdayRev)} ₫</span>
          </div>
          <div className={styles.quickDivider} />
          <div className={styles.quickItem}>
            <span className={styles.quickLabel}>Tháng này (tích lũy)</span>
            <span className={styles.quickVal}>{fmtVND(rev.thisMonthSoFar)} ₫</span>
          </div>
          <div className={styles.quickDivider} />
          <div className={styles.quickItem}>
            <span className={styles.quickLabel}>Hoàn tiền tháng này</span>
            <span className={styles.quickVal} style={{ color: '#ef4444' }}>{fmtVND(rev.refunds)} ₫</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1: FINANCIAL METRICS
          ══════════════════════════════════════════════════════════════════ */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <DollarSign size={20} />
          </div>
          <div>
            <h2 className={styles.sectionTitle}>Chỉ số Tài chính</h2>
            <p className={styles.sectionSubtitle}>Revenue Metrics — {MONTH_NAMES[month]} {year}</p>
          </div>
        </div>

        <div className={styles.kpiGrid}>
          <KpiCard
            icon={<DollarSign size={20} />}
            iconBg="rgba(245, 158, 11, 0.12)" iconColor="#f59e0b"
            badge="GROSS" accentColor="#f59e0b"
            value={`${fmtVND(rev.grossRevenue)} ₫`}
            label="Tổng doanh thu (Gross)"
            growth={rev.grossGrowth}
            subValue={`${fmtVND(rev.prevGross)} ₫`} subLabel="Tháng trước"
          />
          <KpiCard
            icon={<TrendingUp size={20} />}
            iconBg="rgba(16, 185, 129, 0.12)" iconColor="#10b981"
            badge="NET" accentColor="#10b981"
            value={`${fmtVND(rev.netRevenue)} ₫`}
            label="Doanh thu thuần (Net)"
            growth={rev.netGrowth}
            subValue={`${fmtVND(rev.refunds + rev.discounts)} ₫`} subLabel="Đã trừ"
          />
          <KpiCard
            icon={<ShoppingCart size={20} />}
            iconBg="rgba(59, 130, 246, 0.12)" iconColor="#3b82f6"
            badge="AOV" accentColor="#3b82f6"
            value={`${fmtVND(rev.aov)} ₫`}
            label="Giá trị đơn hàng TB (AOV)"
            growth={rev.aovGrowth}
            subValue={`${fmtVND(rev.prevAov)} ₫`} subLabel="Tháng trước"
          />
          <KpiCard
            icon={<BarChart2 size={20} />}
            iconBg="rgba(168, 85, 247, 0.12)" iconColor="#a855f7"
            badge="ORDERS" accentColor="#a855f7"
            value={rev.totalOrders.toLocaleString()}
            label="Tổng đơn hàng thành công"
            growth={rev.ordersGrowth}
            subValue={rev.prevOrders.toLocaleString()} subLabel="Tháng trước"
          />
        </div>

        {/* Revenue breakdown mini-bar */}
        <div className={`${styles.revenueBreakdown} glass`}>
          <div className={styles.breakdownTitle}>Phân tích doanh thu tháng {month + 1}/{year}</div>
          <div className={styles.breakdownRow}>
            <span className={styles.breakdownLabel}>Gross Revenue</span>
            <div className={styles.breakdownBar}>
              <div className={styles.bBarFill} style={{ width: '100%', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
            </div>
            <span className={styles.breakdownVal}>{fmtVND(rev.grossRevenue)} ₫</span>
          </div>
          <div className={styles.breakdownRow}>
            <span className={styles.breakdownLabel}>- Hoàn tiền</span>
            <div className={styles.breakdownBar}>
              <div className={styles.bBarFill} style={{ width: `${(rev.refunds / rev.grossRevenue) * 100}%`, background: 'linear-gradient(90deg, #ef4444, #f87171)' }} />
            </div>
            <span className={styles.breakdownVal} style={{ color: '#ef4444' }}>- {fmtVND(rev.refunds)} ₫</span>
          </div>
          <div className={styles.breakdownRow}>
            <span className={styles.breakdownLabel}>- Chiết khấu</span>
            <div className={styles.breakdownBar}>
              <div className={styles.bBarFill} style={{ width: `${(rev.discounts / rev.grossRevenue) * 100}%`, background: 'linear-gradient(90deg, #f97316, #fb923c)' }} />
            </div>
            <span className={styles.breakdownVal} style={{ color: '#f97316' }}>- {fmtVND(rev.discounts)} ₫</span>
          </div>
          <div className={`${styles.breakdownRow} ${styles.breakdownNet}`}>
            <span className={styles.breakdownLabel}>= Net Revenue</span>
            <div className={styles.breakdownBar}>
              <div className={styles.bBarFill} style={{ width: `${(rev.netRevenue / rev.grossRevenue) * 100}%`, background: 'linear-gradient(90deg, #10b981, #34d399)' }} />
            </div>
            <span className={styles.breakdownVal} style={{ color: '#10b981' }}>{fmtVND(rev.netRevenue)} ₫</span>
          </div>
        </div>

        {/* Daily revenue chart */}
        <div className={`${styles.chartCard} glass`}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Doanh thu theo ngày</h3>
            <div className={styles.chartLegendRow}>
              <span className={styles.legendDot2} style={{ background: '#f59e0b' }} />
              <span className={styles.legendTxt}>Gross</span>
              <span className={styles.legendDot2} style={{ background: '#10b981' }} />
              <span className={styles.legendTxt}>Net</span>
              <span className={styles.chartBadge}>{MONTH_NAMES[month]} {year}</span>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyRev} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} interval={4} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => fmtVND(v)} width={60} />
                <Tooltip content={<RevenueTooltip />} />
                <Area type="monotone" dataKey="gross" name="Gross" stroke="#f59e0b" strokeWidth={2} fill="url(#grossGrad)" dot={false} activeDot={{ r: 4, fill: '#f59e0b' }} />
                <Area type="monotone" dataKey="net" name="Net" stroke="#10b981" strokeWidth={2} fill="url(#netGrad)" dot={false} activeDot={{ r: 4, fill: '#10b981' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly trend for the year */}
        <div className={`${styles.chartCard} glass`}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Xu hướng doanh thu theo tháng</h3>
            <span className={styles.chartBadge}>Năm {year}</span>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="monthlyGrossGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis yAxisId="rev" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => fmtVND(v)} width={60} />
                <YAxis yAxisId="ord" orientation="right" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<MonthTooltip />} />
                <Area yAxisId="rev" type="monotone" dataKey="gross" name="Gross" stroke="#f59e0b" strokeWidth={2.5} fill="url(#monthlyGrossGrad)" dot={(props: any) => {
                  const { cx, cy, index } = props;
                  if (index === month) return <circle key={index} cx={cx} cy={cy} r={6} fill="#f59e0b" stroke="#0f1115" strokeWidth={2} />;
                  return <circle key={index} cx={cx} cy={cy} r={0} fill="none" />;
                }} activeDot={{ r: 5, fill: '#f59e0b', stroke: '#0f1115', strokeWidth: 2 }} />
                <Line yAxisId="rev" type="monotone" dataKey="net" name="Net" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#10b981' }} />
                <Bar yAxisId="ord" dataKey="orders" name="orders" fill="rgba(59,130,246,0.2)" radius={[3, 3, 0, 0]} maxBarSize={18} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 2: CUSTOMER & CONVERSION METRICS
          ══════════════════════════════════════════════════════════════════ */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <Users size={20} />
          </div>
          <div>
            <h2 className={styles.sectionTitle}>Khách hàng & Chuyển đổi</h2>
            <p className={styles.sectionSubtitle}>Customer & Conversion Metrics — {MONTH_NAMES[month]} {year}</p>
          </div>
        </div>

        <div className={styles.kpiGrid}>
          <KpiCard
            icon={<UserPlus size={20} />}
            iconBg="rgba(16, 185, 129, 0.12)" iconColor="#10b981"
            badge="NEW" accentColor="#10b981"
            value={cust.newCustomers.toLocaleString()}
            label="Khách hàng mới (New Customers)"
            growth={cust.newGrowth}
            subValue={cust.prevNew.toLocaleString()} subLabel="Tháng trước"
          />
          <KpiCard
            icon={<Target size={20} />}
            iconBg="rgba(59, 130, 246, 0.12)" iconColor="#3b82f6"
            badge="CVR" accentColor="#3b82f6"
            value={`${cust.conversionRate}%`}
            label="Tỷ lệ chuyển đổi (Conversion Rate)"
            subValue={`${cust.buyers.toLocaleString()} / ${cust.courseViewers.toLocaleString()}`}
            subLabel="Mua / Xem"
          />
          <KpiCard
            icon={<Repeat2 size={20} />}
            iconBg="rgba(168, 85, 247, 0.12)" iconColor="#a855f7"
            badge="RETENTION" accentColor="#a855f7"
            value={`${cust.retentionRate}%`}
            label="Tỷ lệ khách quay lại (Retention)"
            subValue={cust.returningCustomers.toLocaleString()} subLabel="Khách quay lại"
          />
          <KpiCard
            icon={<Award size={20} />}
            iconBg="rgba(236, 72, 153, 0.12)" iconColor="#ec4899"
            badge="LTV" accentColor="#ec4899"
            value={`${fmtVND(cust.ltv)} ₫`}
            label="Lifetime Value (LTV / khách)"
            subValue={cust.totalVisitors.toLocaleString()} subLabel="Lượt truy cập"
          />
        </div>

        {/* Funnel visualization */}
        <div className={`${styles.funnelCard} glass`}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Phễu chuyển đổi (Conversion Funnel)</h3>
            <span className={styles.chartBadge}>{MONTH_NAMES[month]} {year}</span>
          </div>
          <div className={styles.funnelContainer}>
            {[
              { label: 'Lượt truy cập', value: cust.totalVisitors, icon: <Users size={16} />, color: '#3b82f6', width: '100%' },
              { label: 'Xem khóa học', value: cust.courseViewers, icon: <BookOpen size={16} />, color: '#a855f7', width: `${(cust.courseViewers / cust.totalVisitors * 100).toFixed(0)}%` },
              { label: 'Đã mua', value: cust.buyers, icon: <ShoppingCart size={16} />, color: '#10b981', width: `${(cust.buyers / cust.totalVisitors * 100).toFixed(0)}%` },
              { label: 'Mua lại', value: cust.returningCustomers, icon: <Repeat2 size={16} />, color: '#ec4899', width: `${(cust.returningCustomers / cust.totalVisitors * 100).toFixed(0)}%` },
            ].map((step, i) => (
              <div key={i} className={styles.funnelStep}>
                <div className={styles.funnelMeta}>
                  <span className={styles.funnelIcon} style={{ color: step.color }}>{step.icon}</span>
                  <span className={styles.funnelLabel}>{step.label}</span>
                  <span className={styles.funnelValue}>{step.value.toLocaleString()}</span>
                  <span className={styles.funnelRate} style={{ color: step.color }}>
                    {(step.value / cust.totalVisitors * 100).toFixed(1)}%
                  </span>
                </div>
                <div className={styles.funnelBarTrack}>
                  <div
                    className={styles.funnelBarFill}
                    style={{ width: step.width, background: `linear-gradient(90deg, ${step.color}dd, ${step.color}88)` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 3: PRODUCT ANALYTICS
          ══════════════════════════════════════════════════════════════════ */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon} style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
            <Layers size={20} />
          </div>
          <div>
            <h2 className={styles.sectionTitle}>Phân tích Sản phẩm (Khóa học)</h2>
            <p className={styles.sectionSubtitle}>Product Analytics — Top khóa học & hiệu suất nội dung</p>
          </div>
        </div>

        {/* Sort toggle */}
        <div className={styles.sortToggle}>
          <button
            className={`${styles.sortBtn} ${courseSort === 'revenue' ? styles.sortActive : ''}`}
            onClick={() => setCourseSort('revenue')}
          >
            <DollarSign size={14} /> Theo doanh thu
          </button>
          <button
            className={`${styles.sortBtn} ${courseSort === 'orders' ? styles.sortActive : ''}`}
            onClick={() => setCourseSort('orders')}
          >
            <ShoppingCart size={14} /> Theo đơn hàng
          </button>
        </div>

        {/* Top Courses Table */}
        <div className={`${styles.courseTable} glass`}>
          <div className={styles.courseTableHeader}>
            <span className={styles.colRank}>#</span>
            <span className={styles.colName}>Khóa học</span>
            <span className={styles.colOrders}>Đơn hàng</span>
            <span className={styles.colRevenue}>Doanh thu</span>
            <span className={styles.colComplete}>Hoàn thành</span>
            <span className={styles.colRating}>Rating</span>
            <span className={styles.colBar}>Tỷ lệ DT</span>
          </div>
          {sortedCourses.map((course, i) => (
            <div key={i} className={styles.courseRow}>
              <span className={styles.colRank}>
                <span className={i < 3 ? styles.topBadge : styles.rankNum}
                  style={i === 0 ? { color: '#f59e0b' } : i === 1 ? { color: '#94a3b8' } : i === 2 ? { color: '#cd7c2f' } : {}}>
                  {i < 3 ? <Star size={14} fill="currentColor" /> : null}
                  {i + 1}
                </span>
              </span>
              <div className={styles.colName}>
                <div className={styles.courseColorDot} style={{ background: course.color }} />
                <div>
                  <div className={styles.courseName}>{course.name}</div>
                  <div className={styles.courseCategory}>{course.category}</div>
                </div>
              </div>
              <span className={styles.colOrders}>{course.orders.toLocaleString()}</span>
              <span className={styles.colRevenue} style={{ color: '#f59e0b' }}>{fmtVND(course.revenue)} ₫</span>
              <span className={styles.colComplete}>
                <span className={styles.completionBadge}
                  style={{ color: course.completionRate >= 65 ? '#10b981' : course.completionRate >= 45 ? '#f59e0b' : '#ef4444' }}>
                  {course.completionRate}%
                </span>
              </span>
              <span className={styles.colRating}>
                <Star size={12} fill="#f59e0b" color="#f59e0b" style={{ marginRight: 3 }} />
                {course.rating}
              </span>
              <div className={styles.colBar}>
                <div className={styles.courseBarTrack}>
                  <div
                    className={styles.courseBarFill}
                    style={{
                      width: `${(course.revenue / maxCourseRevenue) * 100}%`,
                      background: `linear-gradient(90deg, ${course.color}cc, ${course.color}44)`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Completion vs Revenue scatter insight */}
        <div className={`${styles.chartCard} glass`}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Doanh thu vs Tỷ lệ hoàn thành khóa học</h3>
            <span className={styles.chartBadge}>Insight: Nội dung & Doanh thu</span>
          </div>
          <div className={styles.completionGrid}>
            {[...topCourses]
              .sort((a, b) => b.revenue - a.revenue)
              .map((c, i) => (
                <div key={i} className={styles.completionItem}>
                  <div className={styles.completionHeader}>
                    <div className={styles.completionDot} style={{ background: c.color }} />
                    <span className={styles.completionName}>{c.name}</span>
                    <span className={styles.completionRevLabel} style={{ color: '#f59e0b' }}>{fmtVND(c.revenue)} ₫</span>
                  </div>
                  <div className={styles.completionBarRow}>
                    <div className={styles.completionTrack}>
                      <div
                        className={styles.completionFill}
                        style={{ width: `${c.completionRate}%`, background: c.completionRate >= 65 ? '#10b981' : c.completionRate >= 45 ? '#f59e0b' : '#ef4444' }}
                      />
                    </div>
                    <span className={styles.completionPct}>{c.completionRate}%</span>
                    {c.completionRate < 45 && (
                      <span className={styles.completionWarn}>⚠ Cần cải thiện</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Revenue;

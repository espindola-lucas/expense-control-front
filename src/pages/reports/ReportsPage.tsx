import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLanguage } from '../../context/LanguageContext';
import { Card, Select } from '../../components/ui';
import { Account, ReportCategoryBreakdown, ReportSummary, ReportTimeseriesPoint } from '../../types';
import { fetchReportByCategory, fetchReportSummary, fetchReportTimeseries } from '../../api/reports';
import { fetchAccounts } from '../../api/accounts';

const INCOME_COLOR = '#34d399';
const EXPENSE_COLOR = '#f4667d';
const CATEGORY_COLORS = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'];

const TOOLTIP_STYLE = {
  backgroundColor: '#0f0f0f',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#fff',
};

function isoDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function ReportsPage() {
  const { language, t } = useLanguage();

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5, 1);
    return isoDate(d);
  });
  const [endDate, setEndDate] = useState(() => isoDate(new Date()));
  const [accountId, setAccountId] = useState<string>('');
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [timeseries, setTimeseries] = useState<ReportTimeseriesPoint[]>([]);
  const [byCategory, setByCategory] = useState<ReportCategoryBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAccounts().then(setAccounts).catch(() => {});
  }, []);

  useEffect(() => {
    const filters = {
      start_date: startDate,
      end_date: endDate,
      account_id: accountId ? Number(accountId) : undefined,
    };

    setIsLoading(true);
    Promise.all([
      fetchReportSummary(filters),
      fetchReportTimeseries({ ...filters, group_by: 'month' }),
      fetchReportByCategory({ ...filters, type: 'expense' }),
    ])
      .then(([summaryData, timeseriesData, byCategoryData]) => {
        setSummary(summaryData);
        setTimeseries(timeseriesData);
        setByCategory(byCategoryData);
      })
      .catch(() => {
        /* ignore */
      })
      .finally(() => setIsLoading(false));
  }, [startDate, endDate, accountId]);

  // The backend sends plain calendar dates (no time zone). Format them in UTC so the
  // displayed month always matches what was sent, regardless of the browser's local time zone.
  const monthFormatter = (period: string) =>
    new Date(period).toLocaleDateString(language === 'es' ? 'es-AR' : 'en-US', { month: 'short', timeZone: 'UTC' });

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-serif italic tracking-tight mb-2">{t.reports}</h2>
          <p className="text-neutral-500 font-medium">{t.reportsSubtitle}</p>
        </div>
      </header>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.startDate}</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.endDate}</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white transition-colors"
          />
        </div>
        <div className="space-y-2 min-w-[180px]">
          <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.accounts}</label>
          <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            <option value="">{t.allAccounts}</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2">{t.reportIncome}</p>
          <p className="text-3xl font-serif italic text-income">${(summary?.income ?? 0).toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2">{t.reportExpense}</p>
          <p className="text-3xl font-serif italic text-expense">${(summary?.expense ?? 0).toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2">{t.reportBalance}</p>
          <p className={`text-3xl font-serif italic ${(summary?.balance ?? 0) < 0 ? 'text-expense' : 'text-income'}`}>
            ${(summary?.balance ?? 0).toLocaleString()}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-lg font-serif italic mb-6">{t.reportTimeseries}</h3>
          {!isLoading && timeseries.length === 0 ? (
            <p className="text-neutral-500 text-sm py-10 text-center">{t.noReportData}</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={timeseries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis
                  dataKey="period"
                  tickFormatter={monthFormatter}
                  stroke="#737373"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis stroke="#737373" fontSize={12} tickLine={false} axisLine={false} width={56} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={monthFormatter} formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#a3a3a3' }} formatter={(value) => (value === 'income' ? t.reportIncome : t.reportExpense)} />
                <Bar dataKey="income" name="income" fill={INCOME_COLOR} radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="expense" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h3 className="text-lg font-serif italic mb-6">{t.reportByCategory}</h3>
          {!isLoading && byCategory.length === 0 ? (
            <p className="text-neutral-500 text-sm py-10 text-center">{t.noReportData}</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="total"
                  nameKey="category_name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={byCategory.length > 1 ? 2 : 0}
                  stroke="#0f0f0f"
                  strokeWidth={2}
                >
                  {byCategory.map((entry, index) => (
                    <Cell key={entry.category_id} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#a3a3a3' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </>
  );
}

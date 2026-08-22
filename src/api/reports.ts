import { apiFetch, buildQuery } from './client';
import { ReportCategoryBreakdown, ReportSummary, ReportTimeseriesPoint } from '../types';

interface ReportFilters {
  start_date: string;
  end_date: string;
  account_id?: number;
  [key: string]: string | number | boolean | undefined;
}

export function fetchReportSummary(filters: ReportFilters) {
  return apiFetch<ReportSummary>(`/reports/summary${buildQuery(filters)}`);
}

export function fetchReportTimeseries(filters: ReportFilters & { group_by?: 'day' | 'month' }) {
  return apiFetch<ReportTimeseriesPoint[]>(`/reports/timeseries${buildQuery(filters)}`);
}

export function fetchReportByCategory(filters: ReportFilters & { type?: 'expense' | 'income' }) {
  return apiFetch<ReportCategoryBreakdown[]>(`/reports/by-category${buildQuery(filters)}`);
}

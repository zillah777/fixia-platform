import api from './api';
import { 
  ApiResponse, 
  PaginatedResponse,
  UserReport,
  CreateReportData,
  ReportStats,
  ReportType
} from '@/types';

export const reportsService = {
  // Create report
  async createReport(data: CreateReportData): Promise<UserReport> {
    const response = await api.post<ApiResponse<UserReport>>('/api/reports/user', data);
    return response.data.data;
  },

  // Get my reports (reports I've made)
  async getMyReports(status?: string, page: number = 1, limit: number = 10): Promise<{
    reports: UserReport[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      params.append('status', status);
    }

    const response = await api.get<PaginatedResponse<UserReport[]>>(
      `/api/reports/my-reports?${params.toString()}`
    );
    return response.data.data;
  },

  // Get reports against me
  async getReportsAgainstMe(status?: string, page: number = 1, limit: number = 10): Promise<{
    reports: UserReport[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      params.append('status', status);
    }

    const response = await api.get<PaginatedResponse<UserReport[]>>(
      `/api/reports/against-me?${params.toString()}`
    );
    return response.data.data;
  },

  // Get report types
  async getReportTypes(): Promise<Array<{
    value: ReportType;
    label: string;
    description: string;
  }>> {
    const response = await api.get<ApiResponse<Array<{
      value: ReportType;
      label: string;
      description: string;
    }>>>('/api/reports/types');
    return response.data.data;
  },

  // Respond to a report
  async respondToReport(reportId: number, response: string): Promise<void> {
    await api.put(`/api/reports/${reportId}/response`, { response });
  },

  // Get report statistics
  async getStats(): Promise<ReportStats> {
    const response = await api.get<ApiResponse<ReportStats>>('/api/reports/stats');
    return response.data.data;
  },
};
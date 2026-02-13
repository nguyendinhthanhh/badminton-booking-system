import axiosClient from '../axiosConfig/axiosConfig';

const adminReportService = {
  getDashboardReport: async ({ reportType = 'overview', fromDate, toDate } = {}) => {
    const params = { reportType };
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    const response = await axiosClient.get('/admin/reports/dashboard', { params });
    return response.data;
  }
};

export default adminReportService;

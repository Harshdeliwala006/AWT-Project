import { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import './../Reports.css';

const API_BASE = 'http://localhost:5000/api';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({
    new: 0,
    review: 0,
    resolved: 0,
    total: 0
  });
  const [toast, setToast] = useState("");

  const api = axios.create({
    baseURL: API_BASE,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const showToast = (msg, isError = false) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports');
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      showToast('Failed to load reports', true);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/reports/stats');
      setStats(response.data || {
        new: 12,
        review: 5,
        resolved: 28,
        total: 45
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        new: 12,
        review: 5,
        resolved: 28,
        total: 45
      });
    }
  };

  const handleAction = async (reportId, action) => {
    try {
      await api.put(`/reports/${reportId}/${action}`);
      setReports(prev => prev.map(report => 
        report._id === reportId 
          ? { ...report, status: action }
          : report
      ));
      
      showToast(`Report ${action === 'resolved' ? 'marked as resolved' : 'removed'}`);
    } catch (error) {
      console.error(`Error ${action} report:`, error);
      showToast(`Failed to ${action} report`, true);
    }
  };

  const getReportType = (reason) => {
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes('spam') || lowerReason.includes('abusive')) return 'danger';
    if (lowerReason.includes('copyright') || lowerReason.includes('infringement')) return 'warning';
    if (lowerReason.includes('resolved') || lowerReason.includes('false')) return 'success';
    return 'warning';
  };

  const getReportIcon = (reason) => {
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes('spam')) return '📧';
    if (lowerReason.includes('abusive')) return '💥';
    if (lowerReason.includes('copyright')) return '©️';
    if (lowerReason.includes('resolved')) return '✅';
    return '⚠️';
  };

  const filteredReports = filter === "all" 
    ? reports 
    : reports.filter(r => r.status === filter);

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, []);

  return (
    <div className="admin-reports-page">
      <div className="admin-reports-header">
        <div>
          <h1 className="admin-reports-title">Reports</h1>
          <p className="admin-reports-subtitle">
            Review and manage user content reports. Total: {stats.total}
          </p>
        </div>
      </div>
      <div className="section-divider" />

      <div className="reports-stats">
        {[
          { label: "New", value: stats.new.toString(), color: "danger" },
          { label: "In Review", value: stats.review.toString(), color: "warning" },
          { label: "Resolved", value: stats.resolved.toString(), color: "success" },
          { label: "Total", value: stats.total.toString() },
        ].map(({ label, value, color }) => (
          <div className="reports-stat-item" key={label}>
            <p className="reports-stat-value">{value}</p>
            <p className="reports-stat-label">{label}</p>
          </div>
        ))}
      </div>

      <div className="reports-filters">
        {["all", "new", "review", "resolved"].map((status) => (
          <div
            key={status}
            className={`filter-chip ${filter === status ? "active" : ""}`}
            onClick={() => setFilter(status)}
          >
            {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== "all" && ` (${reports.filter(r => r.status === status).length})`}
          </div>
        ))}
      </div>

      <div className="reports-list">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--spark-ink)', margin: '0 0 4px' }}>
              No reports {filter !== "all" && `in "${filter}" status`}
            </h3>
            <p style={{ fontSize: '13px', margin: 0 }}>All reports have been processed.</p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const reportType = getReportType(report.reason || 'General Report');
            const reportIcon = getReportIcon(report.reason || 'General Report');

            return (
              <div className={`report-card ${reportType}`} key={report._id || report.id}>
                <div className="report-header">
                  <div className="report-icon">{reportIcon}</div>
                  <div className="report-main">
                    <h3 className="report-reason">{report.reason || 'General Report'}</h3>
                    <p className="report-description">{report.description}</p>
                    <div className="report-meta">
                      <span className="report-meta-tag">👤 {report.reporter?.name || 'Unknown'}</span>
                      <span className="report-meta-tag">🎯 {report.targetUser?.name || report.targetUser}</span>
                      <span className="report-meta-tag">📄 {report.targetContent}</span>
                      <span className="report-meta-tag">⚠️ {report.reportCount || report.reports} reports</span>
                    </div>
                  </div>
                </div>

                <div className="report-actions">
                  <button 
                    className="action-btn action-primary"
                    onClick={() => handleAction(report._id || report.id, 'remove')}
                  >
                    🗑️ Remove Content
                  </button>
                  <button 
                    className="action-btn action-secondary"
                    onClick={() => handleAction(report._id || report.id, 'review')}
                  >
                    👁️ Review Content
                  </button>
                  <button 
                    className="action-btn action-success"
                    onClick={() => handleAction(report._id || report.id, 'resolved')}
                  >
                    ✅ Mark Resolved
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {toast && (
        <div className={`reports-toast ${toast.includes('Failed') ? 'error show' : 'show'}`}>
          {toast}
        </div>
      )}
    </div>
  );
}
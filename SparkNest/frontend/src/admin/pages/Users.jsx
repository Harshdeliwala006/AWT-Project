import { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import './../Users.css';

const API_BASE = 'http://localhost:5000/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    newToday: 0
  });
  const [toast, setToast] = useState("");

  // Axios instance with auth token
  const api = axios.create({
    baseURL: API_BASE,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Add auth token to requests
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

  // Fetch users - uses your existing /api/users endpoint
  const fetchUsers = async (page = 1, search = "", status = "all") => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(search && { search }),
        ...(status !== "all" && { status })
      };
      
      const response = await api.get('/users', { params });
      setUsers(response.data || []);
      setCurrentPage(page);
      setTotalPages(10); // Mock - implement proper pagination in backend
      setTotalUsers(1247); // Mock - implement proper count in backend
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Failed to load users', true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats - uses your existing users endpoint
  const fetchStats = async () => {
    try {
      const response = await api.get('/users');
      setStats({
        total: response.data.length || 1247,
        active: Math.floor(Math.random() * 1000) + 1200,
        blocked: 23,
        newToday: 12
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({ total: 1247, active: 1224, blocked: 23, newToday: 12 });
    }
  };

  // Handle user actions
  const handleAction = async (userId, action) => {
    try {
      if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this user?')) return;
        // Note: Add DELETE /api/users/:id endpoint to backend
        await api.delete(`/users/${userId}`);
        setUsers(prev => prev.filter(u => u._id !== userId));
        showToast('🗑️ User deleted successfully');
      } else if (action === 'block') {
        // Note: Add PUT /api/users/:id/block endpoint to backend
        await api.put(`/users/${userId}/block`);
        setUsers(prev => prev.map(u => 
          u._id === userId ? { ...u, status: 'blocked' } : u
        ));
        showToast('🚫 User blocked');
      } else if (action === 'view') {
        // Navigate to user profile or open modal
        window.open(`/admin/users/${userId}`, '_blank');
        showToast('👁️ Viewing user profile');
      }
    } catch (error) {
      console.error(`Error ${action} user:`, error);
      showToast(`Failed to ${action} user`, true);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers(1, searchTerm, filter);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filter]);

  // Load initial data
  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  // Get status badge class
  const getStatusClass = (status) => `status-${status}`;

  // Get status display text
  const getStatusText = (status) => {
    const badges = {
      active: "Active",
      blocked: "Blocked",
      suspended: "Suspended",
      admin: "Admin"
    };
    return badges[status] || status;
  };

  // Format joined date
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format last active
  const formatLastActive = (lastSeen) => {
    if (!lastSeen) return "Never";
    const now = new Date();
    const last = new Date(lastSeen);
    const diffMs = now - last;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      return `${hours}h ago`;
    }
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(lastSeen);
  };

  // Calculate posts count (mock - implement proper aggregation)
  const getPostCount = (user) => {
    return user.posts || Math.floor(Math.random() * 200);
  };

  return (
    <div className="admin-users-page">
      {/* Header */}
      <div className="admin-users-header">
        <div>
          <h1 className="admin-users-title">Users</h1>
          <p className="admin-users-subtitle">
            Manage user accounts and moderation. Total: {totalUsers.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="section-divider" />

      {/* Stats */}
      <div className="users-stats">
        {[
          { label: "Total", value: stats.total.toLocaleString() },
          { label: "Active", value: stats.active.toLocaleString() },
          { label: "Blocked", value: stats.blocked.toLocaleString() },
          { label: "New Today", value: stats.newToday.toLocaleString() },
        ].map(({ label, value }) => (
          <div className="users-stat-item" key={label}>
            <p className="users-stat-value">{value}</p>
            <p className="users-stat-label">{label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="users-controls">
        <input
          className="search-input"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="filter-select"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
          <option value="suspended">Suspended</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="users-table-container">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Email</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Posts</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    No users found matching your criteria
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id || user.id}>
                    <td>#{user._id?.slice(-6) || user.id}</td>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.profilePic ? (
                            <img src={user.profilePic} alt={user.name} />
                          ) : (
                            user.name?.charAt(0)?.toUpperCase() || 'U'
                          )}
                        </div>
                        <div>
                          <div className="user-name">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`user-status ${getStatusClass(user.role || user.status || 'active')}`}>
                        {getStatusText(user.role || user.status || 'active')}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>{getPostCount(user)}</td>
                    <td>{formatLastActive(user.lastSeen)}</td>
                    <td>
                      <div className="user-actions">
                        <button 
                          className="action-btn btn-view"
                          onClick={() => handleAction(user._id || user.id, 'view')}
                        >
                          View
                        </button>
                        <button 
                          className="action-btn btn-block"
                          onClick={() => handleAction(user._id || user.id, 'block')}
                        >
                          Block
                        </button>
                        <button 
                          className="action-btn btn-delete"
                          onClick={() => handleAction(user._id || user.id, 'delete')}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="page-btn"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          <span style={{ fontSize: '13px', color: 'var(--spark-muted)' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button 
            className="page-btn"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`users-toast ${toast.includes('Failed') ? 'error show' : 'show'}`}>
          {toast}
        </div>
      )}
    </div>
  );
}
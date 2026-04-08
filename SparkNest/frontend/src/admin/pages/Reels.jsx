import { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import './../Reels.css';

const API_BASE = 'http://localhost:5000/api';

export default function Reels() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReels, setTotalReels] = useState(0);
  const [selectedReels, setSelectedReels] = useState([]);
  const [toast, setToast] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    viewsToday: 0,
    pendingReview: 0
  });

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

  const fetchReels = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get('/reels', {
        params: { page, limit: 12 }
      });
      
      setReels(response.data.reels || []);
      setCurrentPage(response.data.page);
      setTotalPages(response.data.pages);
      setTotalReels(response.data.total);
    } catch (error) {
      console.error('Error fetching reels:', error);
      showToast('Failed to load reels', true);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/reels', { params: { limit: 1 } });
      setStats({
        total: response.data.total || 0,
        viewsToday: '12.4K',
        pendingReview: '2'
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async (reelId) => {
    if (!confirm('Are you sure you want to delete this reel?')) return;

    try {
      await api.delete(`/reels/${reelId}`);
      setReels(prev => prev.filter(r => r._id !== reelId));
      showToast('🗑️ Reel deleted successfully');
    } catch (error) {
      console.error('Error deleting reel:', error);
      showToast('Failed to delete reel', true);
    }
  };

  const toggleSelection = (reelId) => {
    setSelectedReels(prev => 
      prev.includes(reelId)
        ? prev.filter(id => id !== reelId)
        : [...prev, reelId]
    );
  };

  const bulkDelete = async () => {
    if (selectedReels.length === 0) {
      showToast('No reels selected');
      return;
    }

    if (!confirm(`Delete ${selectedReels.length} selected reels?`)) return;

    try {
      await Promise.all(
        selectedReels.map(id => api.delete(`/reels/${id}`))
      );
      setReels(prev => prev.filter(r => !selectedReels.includes(r._id)));
      setSelectedReels([]);
      showToast(`🗑️ ${selectedReels.length} reels deleted`);
    } catch (error) {
      console.error('Bulk delete error:', error);
      showToast('Failed to delete selected reels', true);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchReels(page);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      return `${hours}h ago`;
    }
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString();
  };

  useEffect(() => {
    fetchReels();
    fetchStats();
  }, [fetchReels]);

  return (
    <>
      <div className="admin-reels-page">
        <div className="admin-reels-header">
          <div>
            <h1 className="admin-reels-title">Reels</h1>
            <p className="admin-reels-subtitle">
              Manage short video content and moderation. 
              Showing {totalReels.toLocaleString()} total reels.
            </p>
          </div>
        </div>
        <div className="section-divider" />

        <div className="reels-stats">
          {[
            { label: "Total Reels", value: stats.total.toLocaleString() },
            { label: "Views Today", value: stats.viewsToday },
            { label: "Pending Review", value: stats.pendingReview },
          ].map(({ label, value }) => (
            <div className="reels-stat-item" key={label}>
              <p className="reels-stat-value">{value}</p>
              <p className="reels-stat-label">{label}</p>
            </div>
          ))}
        </div>

        <div className="bulk-actions">
          <button 
            className="bulk-btn"
            onClick={() => setSelectedReels(
              selectedReels.length === reels.length ? [] : reels.map(r => r._id)
            )}
          >
            {selectedReels.length === reels.length ? 'Deselect All' : 'Select All'}
            ({selectedReels.length})
          </button>
          <button 
            className="bulk-btn"
            onClick={bulkDelete}
            disabled={selectedReels.length === 0}
          >
            Delete Selected
          </button>
          <button className="bulk-btn" disabled>
            Approve All
          </button>
        </div>

        <div className="reels-grid">
          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Loading reels...</p>
            </div>
          ) : reels.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎥</div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--spark-ink)', margin: '0 0 4px' }}>
                No reels yet
              </h3>
              <p style={{ fontSize: '13px', margin: 0 }}>
                Reels will appear here when users start creating short videos.
              </p>
            </div>
          ) : (
            reels.map((reel) => (
              <div className="reel-card" key={reel._id}>
                <input
                  type="checkbox"
                  className="reel-checkbox"
                  checked={selectedReels.includes(reel._id)}
                  onChange={() => toggleSelection(reel._id)}
                />
                
                <div 
                  className="reel-thumbnail" 
                  style={{
                    backgroundImage: `url(${reel.thumbnail || reel.video})`
                  }}
                />
                
                <div className="reel-actions">
                  <button 
                    className="reel-action-btn danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(reel._id);
                    }}
                    title="Delete reel"
                  >
                    🗑️
                  </button>
                  <button 
                    className="reel-action-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(reel.video, '_blank');
                    }}
                    title="Preview"
                  >
                    👁️
                  </button>
                </div>

                <div className="reel-info">
                  <h3 className="reel-title">{reel.title}</h3>
                  <div className="reel-meta">
                    <span className="reel-user">
                      {reel.user?.name || 'Unknown User'}
                    </span>
                    <span>{reel.likeCount || 0} likes</span>
                    <span>{formatDate(reel.createdAt)}</span>
                  </div>
                  <div className="reel-stats">
                    <span className="reel-stat">👀 {reel.views?.toLocaleString() || 0}</span>
                    <span className="reel-stat">❤️ {reel.likeCount || 0}</span>
                    <span className="reel-stat">💬 {reel.commentCount || 0}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="page-btn"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            
            <span style={{ fontSize: '13px', color: 'var(--spark-muted)' }}>
              Page {currentPage} of {totalPages}
            </span>
            
            <button 
              className="page-btn"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {toast && (
        <div className={`reels-toast ${toast.includes('Failed') || toast.includes('failed') ? 'error show' : 'show'}`}>
          {toast}
        </div>
      )}
    </>
  );
}
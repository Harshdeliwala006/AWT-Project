// Posts.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import './../Posts.css';
import './../Admin.css';

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "" });
  const { token } = useAuth();
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const postsData = response.data.posts || [];
      setPosts(postsData);
      
      const today = postsData.filter(post => 
        new Date(post.createdAt).toDateString() === new Date().toDateString()
      ).length;
      
      setStats({
        total: postsData.length,
        today,
        pending: Math.floor(Math.random() * 5)
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      showToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const handleDelete = async (postId) => {
    if (!token || !confirm('Are you sure you want to delete this post?')) return;

    try {
      await axios.delete(`${API_BASE}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPosts(posts.filter(p => p._id !== postId));
      showToast('Post deleted successfully', 'success');
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Failed to delete post', 'error');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="admin-posts-page">
        <div className="admin-posts-header">
          <div>
            <div className="loading-skeleton" style={{ width: '200px', height: '28px' }}></div>
            <div className="loading-skeleton" style={{ width: '250px', height: '16px', marginTop: '8px' }}></div>
          </div>
        </div>
        <div className="posts-stats">
          {Array(3).fill().map((_, i) => (
            <div key={i} className="loading-skeleton posts-stat-item" style={{ height: '80px' }}></div>
          ))}
        </div>
        <div className="posts-grid">
          {Array(3).fill().map((_, i) => (
            <div key={i} className="loading-skeleton post-card" style={{ height: '220px' }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-posts-page">
      <div className="admin-posts-header">
        <div>
          <h1 className="admin-posts-title">Posts</h1>
          <p className="admin-posts-subtitle">
            Manage user posts • {stats.total} total posts
          </p>
        </div>
        <button 
          onClick={fetchPosts}
          className="post-action-btn"
          style={{ height: 'auto', padding: '8px 16px' }}
        >
          🔄 Refresh
        </button>
      </div>
      
      <div className="section-divider" />

      <div className="posts-stats">
        {[
          { label: "Total Posts", value: stats.total.toLocaleString() },
          { label: "Active Today", value: stats.today.toLocaleString() },
          { label: "Pending Review", value: stats.pending.toLocaleString() },
        ].map(({ label, value }, i) => (
          <div className="posts-stat-item" key={label}>
            <p className="posts-stat-value">{value}</p>
            <p className="posts-stat-label">{label}</p>
          </div>
        ))}
      </div>

      <div className="posts-grid">
        {posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3>No posts yet</h3>
            <p>Posts will appear here when users start sharing content.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div className="post-card" key={post._id}>
              <div className="post-header">
                <div className="post-avatar">
                  {post.user?.name?.[0] || post.user?.email?.[0] || 'U'}
                </div>
                <div className="post-user-info">
                  <h3>{post.user?.name || 'Unknown User'}</h3>
                  <p className="post-user-meta">{formatDate(post.createdAt)}</p>
                </div>
              </div>

              <div className="post-content">
                {post.image && (
                  <div 
                    className="post-image" 
                    style={{ 
                      backgroundImage: `url(${post.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: 'transparent'
                    }}
                  />
                )}
                <p className="post-caption">{post.caption}</p>
                <div className="post-meta">
                  <span>💬 {post.commentCount || post.comments?.length || 0}</span>
                  <span>❤️ {post.likeCount || post.likes?.length || 0}</span>
                  {post.tags?.length > 0 && (
                    <span>🏷️ {post.tags.length}</span>
                  )}
                </div>
              </div>

              <div className="post-actions">
                <button 
                  className="post-action-btn"
                  onClick={() => handleDelete(post._id)}
                  title="Delete post"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {toast.message && (
        <div className={`posts-toast show ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
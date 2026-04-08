// Analytics.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext"; // Adjust path to your auth hook
import axios from "axios";
import './../Analytics.css';
import './../Admin.css'

// ── Sparkline Component ─────────────────────────────────────
function Sparkline({ data, color = "#FF6B6B", w = 100, h = 36 }) {
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline 
        points={pts} 
        fill="none" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinejoin="round" 
        strokeLinecap="round" 
      />
      <circle 
        cx={pts.split(" ").pop().split(",")[0]} 
        cy={pts.split(" ").pop().split(",")[1]} 
        r="3" 
        fill={color} 
      />
    </svg>
  );
}

function buildDonut(data, r = 52, cx = 64, cy = 64, stroke = 20) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let offset = -90;
  return data.map((d) => {
    const pct = d.value / total;
    const deg = pct * 360;
    const rad = (a) => (a * Math.PI) / 180;
    const x1 = cx + r * Math.cos(rad(offset));
    const y1 = cy + r * Math.sin(rad(offset));
    const x2 = cx + r * Math.cos(rad(offset + deg));
    const y2 = cy + r * Math.sin(rad(offset + deg));
    const large = deg > 180 ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    offset += deg;
    return { ...d, path, pct: Math.round(pct * 100) };
  });
}

export default function Analytics() {
  const [range, setRange] = useState("14d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    users: [],
    posts: [],
    reels: [],
    boards: [],
    notifications: 0,
    totalUsers: 0,
    totalPosts: 0,
    totalReels: 0,
    totalBoards: 0,
    totalLikes: 0,
    totalComments: 0,
    totalViews: 0
  });

  const { token } = useAuth(); // Get token from your auth context
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) {
        setError('Please login to view analytics');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [
          usersRes,
          postsRes,
          reelsRes,
          boardsRes,
          notificationsRes
        ] = await Promise.all([
          axios.get(`${API_BASE}/users`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: [] })),
          
          axios.get(`${API_BASE}/posts`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: { posts: [] } })),
          
          axios.get(`${API_BASE}/reels`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: { reels: [] } })),
          
          axios.get(`${API_BASE}/boards`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: [] })),
          
          axios.get(`${API_BASE}/notifications/unread-count`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: { count: 0 } }))
        ]);

        const users = Array.isArray(usersRes.data) ? usersRes.data : [];
        const posts = postsRes.data.posts || [];
        const reels = reelsRes.data.reels || [];
        const boards = boardsRes.data || [];

        const totalLikes = posts.reduce((sum, post) => sum + (post.likeCount || post.likes?.length || 0), 0) +
                          reels.reduce((sum, reel) => sum + (reel.likeCount || reel.likes?.length || 0), 0);
        
        const totalComments = posts.reduce((sum, post) => sum + (post.commentCount || post.comments?.length || 0), 0) +
                             reels.reduce((sum, reel) => sum + (reel.commentCount || reel.comments?.length || 0), 0);
        
        const totalViews = reels.reduce((sum, reel) => sum + (reel.views || 0), 0);

        setAnalyticsData({
          users,
          posts,
          reels,
          boards,
          notifications: notificationsRes.data.count || 0,
          totalUsers: users.length,
          totalPosts: posts.length,
          totalReels: reels.length,
          totalBoards: boards.length,
          totalLikes,
          totalComments,
          totalViews
        });

      } catch (err) {
        console.error('Analytics fetch error:', err);
        setError(err.response?.data?.error || 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  const engagementData = [
    { label: "Likes", value: analyticsData.totalLikes, color: "#FF6B6B" },
    { label: "Comments", value: analyticsData.totalComments, color: "#1D9E75" },
    { label: "Reel Views", value: analyticsData.totalViews, color: "#378ADD" },
    { label: "Boards", value: analyticsData.totalBoards, color: "#EF9F27" },
  ];

  const dailyUsers = [120, 145, 165, 140, 200, 188, 220, 195, 230, 210, 245, 260];
  const labels14 = ["M","T","W","T","F","S","S","M","T","W","T","F","S","S"];

  const topPosts = analyticsData.posts
    .slice(0, 5)
    .map(post => ({
      title: (post.caption || 'Untitled post').substring(0, 40) + ((post.caption || '').length > 40 ? '...' : ''),
      likes: post.likeCount || post.likes?.length || 0,
      comments: post.commentCount || post.comments?.length || 0
    }));

  const kpiCards = [
    { 
      icon: "👥", 
      label: "Total Users", 
      value: analyticsData.totalUsers.toLocaleString(), 
      change: "+12%", 
      dir: "up", 
      color: "coral" 
    },
    { 
      icon: "📝", 
      label: "Total Posts", 
      value: analyticsData.totalPosts.toLocaleString(), 
      change: "+5%", 
      dir: "up", 
      color: "teal" 
    },
    { 
      icon: "🎬", 
      label: "Reel Views", 
      value: (analyticsData.totalViews / 1000).toFixed(1) + 'K', 
      change: "+18%", 
      dir: "up", 
      color: "blue" 
    },
    { 
      icon: "⭐", 
      label: "Total Likes", 
      value: analyticsData.totalLikes.toLocaleString(), 
      change: "+9%", 
      dir: "up", 
      color: "amber" 
    },
  ];

  const donutSegs = buildDonut(engagementData);
  const engTotal = engagementData.reduce((s, d) => s + d.value, 0);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">
          <div>
            <div className="loading-skeleton" style={{ width: '200px', height: '28px' }}></div>
            <div className="loading-skeleton" style={{ width: '150px', height: '16px', marginTop: '8px' }}></div>
          </div>
        </div>
        <div className="kpi-grid">
          {Array(4).fill().map((_, i) => (
            <div key={i} className="loading-skeleton kpi-card" style={{ height: '140px' }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h1 className="analytics-title">Analytics</h1>
          <p className="analytics-subtitle">
            Platform performance overview • {analyticsData.totalUsers.toLocaleString()} total users
          </p>
        </div>
        <div className="range-tabs">
          {["7d","14d","30d","90d"].map((r) => (
            <button 
              key={r} 
              className={`range-tab ${range === r ? "active" : ""}`} 
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <div className="section-divider" />

      <div className="kpi-grid">
        {kpiCards.map(({ icon, label, value, change, dir, color }) => (
          <div key={label} className={`kpi-card ${color}`}>
            <div className="kpi-icon">{icon}</div>
            <p className="kpi-value">{value}</p>
            <p className="kpi-label">{label}</p>
            <span className={`kpi-change ${dir}`}>
              {dir === "up" ? "▲" : dir === "down" ? "▼" : "—"} {change} vs last period
            </span>
          </div>
        ))}
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <p className="chart-title">Daily Active Users</p>
          <p className="chart-sub">Last 14 days</p>
          <div className="bar-chart">
            {dailyUsers.map((v, i) => (
              <div className="bar-col" key={i}>
                <div
                  className="bar"
                  style={{
                    height: `${(v / Math.max(...dailyUsers)) * 100}%`,
                    background: i === dailyUsers.length - 1
                      ? "var(--spark-coral)"
                      : `rgba(255,107,107,${0.25 + (v / Math.max(...dailyUsers)) * 0.55})`,
                  }}
                >
                  <span className="bar-tooltip">{v.toLocaleString()}</span>
                </div>
                <span className="bar-label">{labels14[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <p className="chart-title">Engagement Breakdown</p>
          <p className="chart-sub">Total interactions</p>
          <div className="donut-wrap">
            <svg width="128" height="128" className="donut-svg">
              {donutSegs.map((seg) => (
                <path key={seg.label} d={seg.path} fill={seg.color} opacity="0.92" />
              ))}
              <circle cx="64" cy="64" r="34" fill="var(--spark-white)" />
              <text 
                x="64" 
                y="60" 
                textAnchor="middle" 
                fontSize="13" 
                fontWeight="600" 
                fill="var(--spark-ink)" 
                fontFamily="'Playfair Display', serif"
              >
                {(engTotal / 1000).toFixed(1)}K
              </text>
              <text 
                x="64" 
                y="74" 
                textAnchor="middle" 
                fontSize="9" 
                fill="var(--spark-muted)" 
                fontFamily="'DM Sans', sans-serif"
              >
                total
              </text>
            </svg>
            <div className="donut-legend">
              {donutSegs.map((seg) => (
                <div className="legend-item" key={seg.label}>
                  <div className="legend-dot" style={{ background: seg.color }} />
                  <span className="legend-label">{seg.label}</span>
                  <span className="legend-value">{seg.value.toLocaleString()}</span>
                  <span className="legend-pct">{seg.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="chart-card chart-card-full">
          <p className="chart-title">Trend Indicators</p>
          <p className="chart-sub">Recent activity trends</p>
          <div className="sparkline-row">
            {[
              { label: "New Users", value: analyticsData.totalUsers, data: [28,35,42,38,45,52,60], color: "#1D9E75" },
              { label: "Posts", value: analyticsData.totalPosts, data: [40,48,55,62,58,70,75], color: "#FF6B6B" },
              { label: "Reels", value: analyticsData.totalReels, data: [15,22,28,35,42,48,55], color: "#378ADD" },
              { label: "Boards", value: analyticsData.totalBoards, data: [10,14,18,22,25,28,32], color: "#EF9F27" },
            ].map(({ label, value, data, color }) => (
              <div className="sparkline-item" key={label}>
                <p className="sparkline-label">{label}</p>
                <p className="sparkline-value">{value.toLocaleString()}</p>
                <Sparkline data={data} color={color} />
              </div>
            ))}
          </div>
        </div>
        <div className="chart-card chart-card-full">
          <p className="chart-title">Top Performing Posts</p>
          <p className="chart-sub">Ranked by total likes</p>
          <table className="top-table">
            <thead>
              <tr>
                <th style={{ width: 28 }}>#</th>
                <th>Post</th>
                <th>Likes</th>
                <th>Comments</th>
                <th style={{ width: 110 }}>Engagement</th>
              </tr>
            </thead>
            <tbody>
              {topPosts.length > 0 ? topPosts.map((post, i) => (
                <tr key={i}>
                  <td className="top-table-rank">{i + 1}</td>
                  <td style={{ fontWeight: 500 }}>{post.title}</td>
                  <td>❤ {post.likes.toLocaleString()}</td>
                  <td>💬 {post.comments}</td>
                  <td>
                    <div className="top-table-bar-wrap">
                      <div
                        className="top-table-bar"
                        style={{ 
                          width: `${(post.likes / Math.max(...topPosts.map(p => p.likes))) * 100}%` 
                        }}
                      />
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--spark-muted)', padding: '40px' }}>
                    No posts yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
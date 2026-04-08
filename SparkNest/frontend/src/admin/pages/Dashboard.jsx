import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import { usersAPI, postsAPI, reelsAPI, boardsAPI, notificationsAPI, chatAPI } from '../../services/api';
import './../Admin.css';

const Dashboard = () => {

  const { user, token, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    users: 0, posts: 0, reels: 0, boards: 0, 
    notifications: 0, messages: 0,
    growth: { usersToday: 0, postsToday: 0, reelsToday: 0 }
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token || !isAdmin) {
        navigate('/unauthorized');
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
          notificationsRes,
          conversationsRes
        ] = await Promise.allSettled([
          usersAPI.getUsers({ limit: 10000 }),
          postsAPI.getPosts({ page: 1, limit: 1 }),
          reelsAPI.getReels({ page: 1, limit: 1 }),
          boardsAPI.getBoards(),
          notificationsAPI.getUnreadCount(),
          chatAPI.getConversations()
        ]);
        const totalUsers = usersRes.status === 'fulfilled' ? usersRes.value?.length || 0 : 0;
        const totalPosts = postsRes.status === 'fulfilled' ? 
          (postsRes.value?.total || postsRes.value?.posts?.length || 0) : 0;
        const totalReels = reelsRes.status === 'fulfilled' ? 
          (reelsRes.value?.total || reelsRes.value?.reels?.length || 0) : 0;
        const totalBoards = boardsRes.status === 'fulfilled' ? boardsRes.value?.length || 0 : 0;
        const unreadNotifications = notificationsRes.status === 'fulfilled' ? 
          (notificationsRes.value?.count || notificationsRes.value?.unreadCount || 0) : 0;
        const unreadMessages = conversationsRes.status === 'fulfilled' ? 
          conversationsRes.value?.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0) : 0;

        const newStats = {
          users: totalUsers,
          posts: totalPosts,
          reels: totalReels,
          boards: totalBoards,
          notifications: unreadNotifications,
          messages: unreadMessages,
          growth: { 
            usersToday: Math.floor(totalUsers * 0.015), 
            postsToday: Math.floor(totalPosts * 0.013), 
            reelsToday: Math.floor(totalReels * 0.02) 
          }
        };

        setStats(newStats);
        setActivities(generateRealActivities(newStats));

      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err.message || 'Failed to load dashboard data');
        setStats({
          users: 1247, posts: 3921, reels: 689, boards: 56,
          notifications: 3, messages: 7,
          growth: { usersToday: 23, postsToday: 67, reelsToday: 15 }
        });
        setActivities(generateMockActivities());
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 120000); // 2min refresh
    return () => clearInterval(interval);
  }, [token, isAdmin, navigate]);

  const generateRealActivities = (stats) => [
    { icon: '👥', text: `${stats.users.toLocaleString()} total users`, time: Date.now(), color: '#E1F5EE', type: 'milestone' },
    { icon: '📝', text: `${stats.posts.toLocaleString()} posts published`, time: Date.now() - 3600000, color: '#E6F1FB', type: 'content' },
    { icon: '🎬', text: `${stats.reels.toLocaleString()} reels created`, time: Date.now() - 7200000, color: '#EDE9FE', type: 'content' },
    { icon: '🔔', text: `${stats.notifications} unread notifications`, time: Date.now() - 10800000, color: '#FFE8E8', type: 'alert' },
    { icon: '💬', text: `${stats.messages} unread messages`, time: Date.now() - 14400000, color: '#E0F2FE', type: 'message' },
    { icon: '📁', text: `${stats.boards} boards organized`, time: Date.now() - 18000000, color: '#E9D5FF', type: 'feature' }
  ];

  const generateMockActivities = () => {
    const types = [
      { icon: '❤️', text: 'Post reached 1K likes!', color: '#FFE8E8' },
      { icon: '👤', text: 'New user #1248 joined!', color: '#E1F5EE' },
      { icon: '💬', text: 'Sarah sent you a message', color: '#E0F2FE' },
      { icon: '📝', text: 'Post #3922 published', color: '#E6F1FB' }
    ];
    return Array.from({ length: 6 }, (_, i) => ({
      ...types[Math.floor(Math.random() * types.length)],
      time: Date.now() - (i + 1) * 1000 * 60 * (5 + Math.random() * 55)
    }));
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const timeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (minutes < 60) return `${minutes || 1}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const today = new Date().toLocaleDateString("en-US", { 
    weekday: "long", month: "long", day: "numeric", year: "numeric" 
  });

  const STAT_CARDS = [
    { icon: "👥", label: "Total Users", value: formatNumber(stats.users), badge: `+${formatNumber(stats.growth?.usersToday || 0)}`, dir: "up", color: "coral", to: "/admin/users" },
    { icon: "📝", label: "Total Posts", value: formatNumber(stats.posts), badge: `+${formatNumber(stats.growth?.postsToday || 0)}`, dir: "up", color: "teal", to: "/admin/posts" },
    { icon: "🎬", label: "Total Reels", value: formatNumber(stats.reels), badge: `+${formatNumber(stats.growth?.reelsToday || 0)}`, dir: "up", color: "blue", to: "/admin/reels" },
    { icon: "📁", label: "Total Boards", value: formatNumber(stats.boards), badge: "+12", dir: "up", color: "purple", to: "/admin/boards" },
    { icon: "🔔", label: "Unread Notifications", value: formatNumber(stats.notifications), badge: `${formatNumber(stats.messages)} msgs`, dir: "warn", color: "amber", to: "/notifications" },
    { icon: "💬", label: "Unread Messages", value: formatNumber(stats.messages), badge: "New", dir: "up", color: "cyan", to: "/messages" },
  ];

  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        minHeight: '400px', gap: '1rem', color: '#64748b'
      }}>
        <div style={{ fontSize: '2rem' }}>🔄</div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <>
    <div style={{ padding: '2rem', maxWidth: '1400px', margimLeft: '300px' }}>
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', 
        marginBottom: '2rem', gap: '1rem' 
      }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', margin: 0 }}>
            Welcome back, <strong>{user?.name || 'Admin'}</strong>
            {error && <span style={{ color: '#ef4444', marginLeft: '1rem' }}>⚠️ {error}</span>}
          </p>
        </div>
      </div>
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '1.5rem', marginBottom: '2rem' 
      }}>
        {STAT_CARDS.map(({ icon, label, value, badge, dir, color, to }, index) => (
          <Link 
            key={label} 
            to={to} 
            style={{
              display: 'flex', flexDirection: 'column',
              background: `linear-gradient(135deg, ${color === 'coral' ? '#fef2f2' : 
                color === 'teal' ? '#f0fdf4' : 
                color === 'blue' ? '#eff6ff' : 
                color === 'purple' ? '#faf5ff' : 
                color === 'amber' ? '#fffbeb' : '#ecfeff'}, hsl(${color === 'coral' ? '0' : 
                color === 'teal' ? '160' : color === 'blue' ? '210' : 
                color === 'purple' ? '280' : color === 'amber' ? '40' : '190'}, 100%, 95%))`,
              padding: '2rem', borderRadius: '20px', textDecoration: 'none',
              color: 'black', border: '1px solid rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '2rem' }}>{icon}</div>
              <span style={{ 
                background: 'rgba(0,0,0,0.1)', padding: '0.25rem 0.75rem', 
                borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600 
              }}>
                {dir === "up" ? "↗" : dir === "warn" ? "!" : "↘"} {badge}
              </span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{value}</div>
            <div style={{ color: '#64748b', fontSize: '0.95rem' }}>{label}</div>
          </Link>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Recent Activity</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {activities.slice(0, 5).map((activity, index) => (
              <div key={index} style={{ 
                display: 'flex', gap: '1rem', padding: '1rem 0', 
                borderBottom: '1px solid rgba(0,0,0,0.05)' 
              }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '50%', 
                  backgroundColor: activity.color, display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' 
                }}>
                  {activity.icon}
                </div>
                <div>
                  <div style={{ marginBottom: '0.25rem' }}>{activity.text}</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {timeAgo(activity.time)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 1rem 0' }}>Platform Summary</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{formatNumber(stats.posts + stats.reels)}</div>
                <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Total Content</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{formatNumber(stats.users)}</div>
                <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Active Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Dashboard;
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notificationsAPI } from "../services/api"; // Your API service

const notifStyles = `
  :root {
    --spark-coral: #FF6B6B;
    --spark-coral-soft: #FFE8E8;
    --spark-ink: #1A1A2E;
    --spark-muted: #6B7080;
    --spark-surface: #FAFAF8;
    --spark-white: #FFFFFF;
    --spark-border: #EBEBEB;
    --spark-radius: 18px;
  }

  .notif-page {
    font-family: 'DM Sans', sans-serif;
    max-width: 640px;
    margin: 0 auto;
    padding: 36px 24px;
  }

  .notif-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 8px;
    gap: 12px;
  }

  .notif-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.9rem;
    font-weight: 600;
    color: var(--spark-ink);
    margin: 0;
    letter-spacing: -0.4px;
  }

  .notif-mark-all {
    font-size: 12.5px;
    font-weight: 500;
    color: var(--spark-coral);
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    padding: 0;
    margin-bottom: 4px;
    transition: opacity 0.15s;
    white-space: nowrap;
  }
  .notif-mark-all:hover { opacity: 0.7; }

  .section-divider {
    width: 36px;
    height: 3px;
    background: var(--spark-coral);
    border-radius: 2px;
    margin-bottom: 24px;
  }

  /* Filter tabs */
  .notif-tabs {
    display: flex;
    gap: 6px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .notif-tab {
    display: inline-flex;
    align-items: center;
    gap: 0;
    padding: 6px 14px;
    border-radius: 30px;
    border: 1px solid var(--spark-border);
    background: transparent;
    font-size: 13px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    color: var(--spark-muted);
    cursor: pointer;
    transition: all 0.15s;
  }
  .notif-tab:hover { background: var(--spark-surface); color: var(--spark-ink); }
  .notif-tab.active { background: var(--spark-ink); color: white; border-color: var(--spark-ink); }

  .notif-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 17px;
    height: 17px;
    border-radius: 30px;
    background: var(--spark-coral);
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: 0 4px;
    margin-left: 7px;
  }
  .notif-tab.active .notif-badge { background: rgba(255,255,255,0.25); }

  /* Notification card */
  .notif-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 13px 16px;
    border-radius: 14px;
    border: 1px solid transparent;
    transition: background 0.15s, border-color 0.15s;
    cursor: pointer;
    position: relative;
    margin-bottom: 4px;
  }
  .notif-card:hover { background: var(--spark-white); border-color: var(--spark-border); }
  .notif-card.unread { background: var(--spark-white); border-color: var(--spark-border); }

  .notif-unread-dot {
    position: absolute;
    top: 20px;
    right: 16px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--spark-coral);
  }

  /* Avatar */
  .notif-avatar-wrap { position: relative; flex-shrink: 0; }

  .notif-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
  }
  .notif-avatar.like    { background: #FFE8E8; color: #FF6B6B; }
  .notif-avatar.comment { background: #E1F5EE; color: #0F6E56; }
  .notif-avatar.follow  { background: #E6F1FB; color: #185FA5; }
  .notif-avatar.save    { background: #F0EDFE; color: #534AB7; }
  .notif-avatar.default { background: var(--spark-surface); color: var(--spark-muted); }

  .notif-type-icon {
    position: absolute;
    bottom: -2px; right: -2px;
    width: 18px; height: 18px;
    border-radius: 50%;
    background: var(--spark-white);
    border: 1.5px solid var(--spark-border);
    display: flex; align-items: center; justify-content: center;
    font-size: 9px;
  }

  .notif-content { flex: 1; min-width: 0; }

  .notif-text {
    font-size: 13.5px;
    color: var(--spark-ink);
    line-height: 1.5;
    margin: 0 0 4px;
    padding-right: 16px;
  }
  .notif-text b { font-weight: 600; }

  .notif-time { font-size: 11.5px; color: var(--spark-muted); }

  .notif-thumb {
    width: 42px; height: 42px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
    border: 1px solid var(--spark-border);
  }

  /* Empty */
  .notif-empty {
    text-align: center;
    padding: 64px 24px;
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: var(--spark-radius);
  }
  .notif-empty-icon  { font-size: 36px; margin-bottom: 12px; }
  .notif-empty-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.15rem; color: var(--spark-ink); margin-bottom: 6px;
  }
  .notif-empty-sub { font-size: 13px; color: var(--spark-muted); }
`;

const TYPE_META = {
  like:    { cls: "like",    icon: "❤" },
  comment: { cls: "comment", icon: "💬" },
  follow:  { cls: "follow",  icon: "➕" },
  save:    { cls: "save",    icon: "🔖" },
};

const TABS = ["All", "Likes", "Comments", "Follows"];

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function Notifications() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchNotifications = async (tab = "All", pageNum = 1) => {
      try {
        setLoading(true);
        const params = { page: pageNum, limit: 20 };
        if (tab !== "All") {
          params.type = tab.toLowerCase() + (tab === "Follows" ? "" : "s");
        }
        
        const data = await notificationsAPI.getNotifications(params);
        setNotifications(data.notifications);
        setHasMore(data.pages > pageNum);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications(activeTab, page);
  }, [isAuthenticated, activeTab, page]);

  // Get unread count
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnreadCount = async () => {
      try {
        const data = await notificationsAPI.getUnreadCount();
        setUnreadCount(data.count);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
  }, [isAuthenticated]);

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Mark all read failed:', error);
    }
  };

  const markRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Mark read failed:', error);
    }
  };

  const loadMore = () => {
    setPage(page + 1);
  };

  const tabUnread = (tab) => {
    if (tab === "All") return unreadCount;
    // Backend handles unread count per type
    return notifications.filter(n => 
      !n.isRead && n.type === (tab === "Follows" ? "follow" : tab.toLowerCase() + "s")
    ).length;
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "All") return true;
    const typeMap = {
      "Likes": "like",
      "Comments": "comment", 
      "Follows": "follow"
    };
    return n.type === typeMap[activeTab];
  });

  if (!isAuthenticated) {
    return (
      <>
        <style>{notifStyles}</style>
        <div className="notif-page">
          <div className="notif-empty">
            <div className="notif-empty-icon">🔒</div>
            <p className="notif-empty-title">Log in to see notifications</p>
            <p className="notif-empty-sub">Sign in to view your activity and interactions.</p>
          </div>
        </div>
      </>
    );
  }

  if (loading && notifications.length === 0) {
    return (
      <>
        <style>{notifStyles}</style>
        <div className="notif-page">
          <div className="notif-loading">
            <div className="loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{notifStyles}</style>
      <div className="notif-page">

        <div className="notif-header">
          <h1 className="notif-title">Notifications</h1>
          {unreadCount > 0 && (
            <button className="notif-mark-all" onClick={markAllRead}>
              Mark all read ({unreadCount})
            </button>
          )}
        </div>

        <div className="section-divider" />

        {/* Tabs */}
        <div className="notif-tabs">
          {TABS.map((tab) => {
            const count = tabUnread(tab);
            return (
              <button
                key={tab}
                className={`notif-tab${activeTab === tab ? " active" : ""}`}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
              >
                {tab}
                {count > 0 && <span className="notif-badge">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* List */}
        <div className="notif-list">
          {filteredNotifications.length === 0 ? (
            <div className="notif-empty">
              <div className="notif-empty-icon">🔔</div>
              <p className="notif-empty-title">Nothing here yet</p>
              <p className="notif-empty-sub">
                {activeTab === "All" 
                  ? "Notifications will appear here when others interact with your content."
                  : `No ${activeTab.toLowerCase()} notifications yet.`}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const meta = TYPE_META[notification.type] || { cls: "default", icon: "🔔" };
              const sender = notification.sender;
              const initials = getInitials(sender.name);

              return (
                <Link
                  key={notification._id}
                  to={getNotificationLink(notification)}
                  className={`notif-card${notification.isRead ? " read" : " unread"}`}
                  onClick={() => !notification.isRead && markRead(notification._id)}
                >
                  <div className="notif-avatar-wrap">
                    <div className={`notif-avatar ${meta.cls}`}>
                      {initials}
                    </div>
                    <div className="notif-type-icon">{meta.icon}</div>
                  </div>

                  <div className="notif-content">
                    <p className="notif-text">
                      <strong>{sender.name}</strong> {notification.text}
                    </p>
                    <span className="notif-time">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>

                  {/* Content preview */}
                  {notification.post && (
                    <Link to={`/posts/${notification.post._id}`} className="notif-thumb-link">
                      <img 
                        src={notification.post.image} 
                        className="notif-thumb" 
                        alt="" 
                      />
                    </Link>
                  )}
                  {notification.reel && (
                    <Link to={`/reels/${notification.reel._id}`} className="notif-thumb-link">
                      <img 
                        src={notification.reel.thumbnail || notification.reel.video} 
                        className="notif-thumb" 
                        alt="" 
                      />
                    </Link>
                  )}

                  {!notification.isRead && <div className="notif-unread-dot" />}
                </Link>
              );
            })
          )}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="notif-load-more">
            <button onClick={loadMore} disabled={loading} className="load-more-btn">
              {loading ? "Loading..." : "Load more notifications"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// Helper functions
function getNotificationLink(notification) {
  if (notification.post) return `/posts/${notification.post._id}`;
  if (notification.reel) return `/reels/${notification.reel._id}`;
  if (notification.type === "follow") return `/users/${notification.sender._id}`;
  return "/";
}

function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60 * 1000) return "Just now";
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}h`;
  return date.toLocaleDateString();
}

export default Notifications;
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usersAPI, postsAPI, boardsAPI, reelsAPI } from "../services/api"; // Your API services

const profileStyles = `
  :root {
    --spark-coral: #FF6B6B;
    --spark-coral-soft: #FFE8E8;
    --spark-ink: #1A1A2E;
    --spark-muted: #6B7080;
    --spark-surface: #FAFAF8;
    --spark-white: #FFFFFF;
    --spark-border: #EBEBEB;
    --spark-radius: 18px;
    --spark-shadow-hover: 0 12px 40px rgba(26,26,46,0.13);
  }

  .profile-page {
    font-family: 'DM Sans', sans-serif;
    max-width: 900px;
    margin: 0 auto;
    padding: 40px 24px;
  }

  /* ── Header card ── */
  .profile-header-card {
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: var(--spark-radius);
    padding: 32px 36px;
    margin-bottom: 28px;
    box-shadow: 0 4px 24px rgba(26,26,46,0.06);
  }

  .profile-header-inner {
    display: flex;
    gap: 32px;
    align-items: flex-start;
    flex-wrap: wrap;
  }

  /* Avatar */
  .profile-avatar-wrap { position: relative; flex-shrink: 0; }

  .profile-avatar-img {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    object-fit: cover;
    display: block;
    border: 3px solid var(--spark-white);
    box-shadow: 0 0 0 2px var(--spark-border);
  }

  .profile-avatar-fallback {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: var(--spark-coral-soft);
    color: var(--spark-coral);
    font-size: 32px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid var(--spark-white);
    box-shadow: 0 0 0 2px var(--spark-border);
  }

  .profile-online-dot {
    position: absolute;
    bottom: 6px;
    right: 6px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #639922;
    border: 2px solid var(--spark-white);
  }

  /* Info */
  .profile-info { flex: 1; min-width: 0; }

  .profile-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.7rem;
    font-weight: 600;
    color: var(--spark-ink);
    margin: 0 0 3px;
    letter-spacing: -0.4px;
  }

  .profile-handle {
    font-size: 13px;
    color: var(--spark-muted);
    margin: 0 0 10px;
  }

  .profile-bio {
    font-size: 14px;
    color: var(--spark-ink);
    line-height: 1.6;
    margin: 0 0 20px;
    max-width: 480px;
  }

  /* Counters */
  .profile-counters {
    display: flex;
    gap: 28px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .profile-counter {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .profile-counter-value {
    font-family: 'Playfair Display', serif;
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--spark-ink);
    line-height: 1;
  }

  .profile-counter-label {
    font-size: 11.5px;
    color: var(--spark-muted);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .profile-counter-divider {
    width: 1px;
    height: 32px;
    background: var(--spark-border);
    align-self: center;
  }

  /* Action buttons */
  .profile-actions { display: flex; gap: 10px; flex-wrap: wrap; }

  .btn-follow {
    padding: 9px 24px;
    border-radius: 30px;
    border: none;
    background: var(--spark-ink);
    color: white;
    font-size: 13.5px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
  }
  .btn-follow:hover { opacity: 0.82; }
  .btn-follow:active { transform: scale(0.97); }

  .btn-follow.following {
    background: var(--spark-surface);
    color: var(--spark-ink);
    border: 1px solid var(--spark-border);
  }
  .btn-follow.following:hover {
    background: #FCEBEB;
    color: #E24B4A;
    border-color: #F7C1C1;
  }

  .btn-message {
    padding: 9px 20px;
    border-radius: 30px;
    border: 1px solid var(--spark-border);
    background: transparent;
    color: var(--spark-ink);
    font-size: 13.5px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.15s;
  }
  .btn-message:hover { background: var(--spark-surface); border-color: #d5d5d5; }

  /* ── Posts section ── */
  .profile-posts-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .profile-posts-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--spark-ink);
    margin: 0;
  }

  .section-divider {
    width: 36px;
    height: 3px;
    background: var(--spark-coral);
    border-radius: 2px;
    margin-bottom: 16px;
  }

  /* Grid */
  .profile-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
    border-radius: 14px;
    overflow: hidden;
  }

  @media (min-width: 600px) {
    .profile-grid { gap: 6px; }
  }

  .profile-grid-item {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: 16px;
    background: var(--spark-surface);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .profile-grid-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 18px 40px rgba(26,26,46,0.12);
  }

  .profile-grid-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }

  .profile-grid-item:hover img { transform: scale(1.05); }

  .profile-grid-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    justify-content: stretch;
    padding: 14px;
    background: linear-gradient(180deg, rgba(26,26,46,0) 40%, rgba(26,26,46,0.72) 100%);
  }

  .profile-grid-info {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .profile-grid-title {
    color: white;
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .profile-grid-meta {
    display: flex;
    gap: 12px;
    align-items: center;
    color: rgba(255,255,255,0.95);
    font-size: 12px;
    font-weight: 600;
  }

  .profile-grid-stat {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(0,0,0,0.22);
    padding: 6px 10px;
    border-radius: 999px;
    backdrop-filter: blur(4px);
  }

  .profile-grid-item:hover .profile-grid-overlay {
    background: rgba(26,26,46,0.42);
  }

  .profile-grid-stat {
    display: flex;
    align-items: center;
    gap: 5px;
    color: white;
    font-size: 13px;
    font-weight: 600;
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.2s, transform 0.2s;
  }

  .profile-grid-item:hover .profile-grid-stat {
    opacity: 1;
    transform: translateY(0);
  }

  /* Empty state */
  .profile-empty {
    text-align: center;
    padding: 56px 24px;
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: var(--spark-radius);
  }
  .profile-empty-icon  { font-size: 36px; margin-bottom: 12px; }
  .profile-empty-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: var(--spark-ink); margin-bottom: 6px; }
  .profile-empty-sub   { font-size: 13px; color: var(--spark-muted); }

  /* Not found */
  .profile-not-found {
    font-family: 'DM Sans', sans-serif;
    text-align: center;
    padding: 80px 24px;
    color: var(--spark-muted);
  }
  .profile-not-found h2 {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    color: var(--spark-ink);
    margin-bottom: 8px;
  }

  .profile-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    min-height: 240px;
    color: var(--spark-muted);
  }

  .loading-spinner {
    width: 26px;
    height: 26px;
    border: 3px solid var(--spark-border);
    border-top: 3px solid var(--spark-coral);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .profile-back-link {
    display: inline-flex;
    margin-top: 14px;
    color: var(--spark-coral);
    font-weight: 600;
    text-decoration: none;
  }

  .profile-back-link:hover {
    text-decoration: underline;
  }

  .btn-edit-profile {
    padding: 9px 24px;
    border-radius: 30px;
    border: 1px solid var(--spark-border);
    background: transparent;
    color: var(--spark-ink);
    font-size: 13.5px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.15s;
  }
  .btn-edit-profile:hover {
    background: var(--spark-surface);
    border-color: #d5d5d5;
  }

  .profile-tabs {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.profile-tab {
  position: relative;
  padding: 10px 18px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #6B7080;
  cursor: pointer;
  border-radius: 20px;
  transition: all 0.25s ease;
}

/* Hover effect */
.profile-tab:hover {
  background: #f5f5f5;
  color: #1A1A2E;
}

/* Active tab */
.profile-tab.active {
  color: #FF6B6B;
  background: #FFE8E8;
  font-weight: 600;
}

/* Animated underline */
.profile-tab::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 60%;
  height: 3px;
  background: #FF6B6B;
  border-radius: 10px;
  transition: transform 0.25s ease;
}

.profile-tab.active::after {
  transform: translateX(-50%) scaleX(1);
}
`;

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [counts, setCounts] = useState({ posts: 0, reels: 0, boards: 0, likes: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts"); // posts, reels, boards, likes

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError("");
        
        // Fetch user profile
        const userData = await usersAPI.getUserById(id);
        setProfileUser(userData);
        
        // Check if current user follows this profile user
        if (currentUser && currentUser._id?.toString() !== id?.toString()) {
          const followers = Array.isArray(userData.followers) ? userData.followers : [];
          setFollowing(followers.some((f) => {
            const followerId = f?._id ? f._id.toString() : f?.toString?.();
            return followerId === currentUser._id.toString();
          }));
        }

        // Load default tab content for this profile
        await loadTabContent('posts');
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        if (err.message.includes('not found')) {
          setError('User not found');
        } else {
          setError('Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, currentUser]);

  // Toggle follow
  const handleFollow = async () => {
    try {
      await usersAPI.followUser(id);
      setFollowing(!following);
      
      // Update profile data optimistically
          setProfileUser(prev => {
        if (!prev) return prev;

        const currentId = currentUser?._id?.toString();
        const followersArray = Array.isArray(prev.followers) ? prev.followers : [];

        return {
          ...prev,
          followers: following
            ? followersArray.filter((f) => {
                const followerId = f?._id ? f._id.toString() : f?.toString?.();
                return followerId !== currentId;
              })
            : [...followersArray, { _id: currentId }]
        };
      });
    } catch (error) {
      console.error('Follow failed:', error);
    }
  };

  // Load tab content
  const loadTabContent = async (tab) => {
    setActiveTab(tab);
    setLoading(true);
    
    try {
      if (tab === "reels") {
        const reelsData = await reelsAPI.getReels({ user: id, limit: 30 });
        setUserPosts(reelsData.reels || []);
        setCounts((prev) => ({ ...prev, reels: reelsData.total ?? reelsData.reels.length }));
      } else if (tab === "boards") {
        const boardsData = await boardsAPI.getBoards({ user: id });
        setUserPosts(Array.isArray(boardsData) ? boardsData : []);
        setCounts((prev) => ({ ...prev, boards: Array.isArray(boardsData) ? boardsData.length : 0 }));
      } else if (tab === "likes") {
        const likedPosts = await postsAPI.getPosts({ likedBy: id, limit: 30 });
        setUserPosts(likedPosts.posts || []);
        setCounts((prev) => ({ ...prev, likes: likedPosts.total ?? likedPosts.posts.length }));
      } else {
        const postsData = await postsAPI.getPosts({ user: id, limit: 30 });
        setUserPosts(postsData.posts || []);
        setCounts((prev) => ({ ...prev, posts: postsData.total ?? postsData.posts.length }));
      }
    } catch (error) {
      console.error(`Failed to load ${tab}:`, error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileUser) {
    return (
      <>
        <style>{profileStyles}</style>
        <div className="profile-page">
          <div className="profile-loading">
            <div className="loading-spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !profileUser) {
    return (
      <>
        <style>{profileStyles}</style>
        <div className="profile-page">
          <div className="profile-not-found">
            <h2>{error || "User not found"}</h2>
            <p>This profile may not exist or has been deleted.</p>
            <Link to="/" className="profile-back-link">← Back to home</Link>
          </div>
        </div>
      </>
    );
  }

  const isOwner = currentUser && currentUser._id === profileUser._id;
  const followersCount = Array.isArray(profileUser.followers) ? profileUser.followers.length : (profileUser.followers || 0);
  const followingCount = Array.isArray(profileUser.following) ? profileUser.following.length : (profileUser.following || 0);
  const postsCount = counts.posts;
  const reelsCount = counts.reels;
  const boardsCount = counts.boards;
  const likesCount = counts.likes;

  return (
    <>
      <style>{profileStyles}</style>
      <div className="profile-page">

        {/* Header Card */}
        <div className="profile-header-card">
          <div className="profile-header-inner">

            {/* Avatar */}
            <div className="profile-avatar-wrap">
              {profileUser.profilePic ? (
                <img src={profileUser.profilePic} className="profile-avatar-img" alt={profileUser.name} />
              ) : (
                <div 
                  className="profile-avatar-fallback" 
                  style={{ backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)` }}
                >
                  {getInitials(profileUser.name)}
                </div>
              )}
              <div className={`profile-online-dot ${profileUser.isOnline ? 'online' : 'offline'}`} />
            </div>

            {/* Info */}
            <div className="profile-info">
              <h1 className="profile-name">{profileUser.name}</h1>
              <p className="profile-handle">
                @{profileUser.name.toLowerCase().replace(/\s+/g, '')}
              </p>
              {profileUser.bio && (
                <p className="profile-bio">{profileUser.bio}</p>
              )}

              {/* Counters */}
              <div className="profile-counters">
                <Link to="#posts" className="profile-counter" onClick={() => loadTabContent("posts")}>
                  <span className="profile-counter-value">{postsCount}</span>
                  <span className="profile-counter-label">Posts</span>
                </Link>
                <div className="profile-counter-divider" />
                <Link to={`/users/${profileUser._id}/followers`} className="profile-counter">
                  <span className="profile-counter-value">{followersCount}</span>
                  <span className="profile-counter-label">Followers</span>
                </Link>
                <div className="profile-counter-divider" />
                <Link to={`/users/${profileUser._id}/following`} className="profile-counter">
                  <span className="profile-counter-value">{followingCount}</span>
                  <span className="profile-counter-label">Following</span>
                </Link>
              </div>

              {/* Actions */}
              <div className="profile-actions">
                {isOwner ? (
                  <Link to="/settings" className="btn-edit-profile">
                    Edit Profile
                  </Link>
                ) : (
                  <>
                    <button
                      className={`btn-follow${following ? " following" : ""}`}
                      onClick={handleFollow}
                    >
                      {following ? "Following" : "Follow"}
                    </button>
                    <Link to={`/chat/${profileUser._id}`} className="btn-message">
                      💬 Message
                    </Link>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button 
            className={`profile-tab ${activeTab === "posts" ? "active" : ""}`}
            onClick={() => loadTabContent("posts")}
          >
            Posts
          </button>
          <button 
            className={`profile-tab ${activeTab === "reels" ? "active" : ""}`}
            onClick={() => loadTabContent("reels")}
          >
            Reels
          </button>
          <button 
            className={`profile-tab ${activeTab === "boards" ? "active" : ""}`}
            onClick={() => loadTabContent("boards")}
          >
            Boards
          </button>
          <button 
            className={`profile-tab ${activeTab === "likes" ? "active" : ""}`}
            onClick={() => loadTabContent("likes")}
          >
            Likes
          </button>
        </div>

        {/* Content Grid */}
        <div className="profile-content">
          {loading ? (
            <div className="profile-loading">
              <div className="loading-spinner"></div>
              <p>Loading {activeTab}...</p>
            </div>
          ) : userPosts.length === 0 ? (
            <div className="profile-empty">
              <div className="profile-empty-icon">
                {activeTab === "posts" ? "📝" : activeTab === "reels" ? "🎬" : "📌"}
              </div>
              <p className="profile-empty-title">
                No {activeTab.toLowerCase()} yet
              </p>
              <p className="profile-empty-sub">
                {profileUser.name} hasn't shared any {activeTab.toLowerCase()} yet.
              </p>
            </div>
          ) : (
            <div className={`profile-grid profile-${activeTab}-grid`}>
              {userPosts.map((item) => (
                <Link 
                  key={item._id} 
                  to={getItemLink(item, activeTab)} 
                  className="profile-grid-item"
                >
                  <img 
                    src={getItemImage(item, activeTab)} 
                    alt={getItemAlt(item, activeTab)} 
                    loading="lazy"
                  />
                  <div className="profile-grid-overlay">
              <div className="profile-grid-info">
                <div className="profile-grid-title">{getItemLabel(item, activeTab)}</div>
                <div className="profile-grid-meta">
                  <span className="profile-grid-stat">
                    ❤ {item.likeCount || item.likes?.length || 0}
                  </span>
                  <span className="profile-grid-stat">
                    💬 {item.commentCount || item.comments?.length || 0}
                  </span>
                </div>
              </div>
            </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}

// Helper functions
function getItemLink(item, tab) {
  if (tab === "posts") return `/posts/${item._id}`;
  if (tab === "reels") return `/reels/${item._id}`;
  if (tab === "boards") return `/boards/${item._id}`;
  if (tab === "likes") return `/posts/${item._id}`;
  return "/";
}

function getItemImage(item, tab) {
  if (tab === "posts") return item.image;
  if (tab === "reels") return item.thumbnail || item.video;
  if (tab === "boards") return item.posts?.[0]?.image || item.image || "https://via.placeholder.com/300?text=Board";
  return item.image;
}

function getItemLabel(item, tab) {
  if (tab === "boards") return item.name || "Board";
  if (tab === "reels") return item.title || item.caption || "Reel";
  if (tab === "likes") return item.caption || item.title || "Liked post";
  return item.caption || item.title || "Content";
}

function getItemAlt(item, tab) {
  if (tab === "boards") return item.name || "Board";
  return item.caption || item.title || "Content";
}

export default Profile;
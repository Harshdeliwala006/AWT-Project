import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { searchAPI, usersAPI } from "../services/api"; // Your API services

const searchStyles = `
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

  .search-page {
    font-family: 'DM Sans', sans-serif;
    max-width: 820px;
    margin: 0 auto;
    padding: 36px 24px;
  }

  /* Search bar */
  .search-bar-wrap {
    position: relative;
    margin-bottom: 32px;
  }

  .search-icon {
    position: absolute;
    left: 18px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
    color: var(--spark-muted);
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: 30px;
    padding: 13px 20px 13px 48px;
    font-size: 15px;
    font-family: 'DM Sans', sans-serif;
    color: var(--spark-ink);
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-shadow: 0 2px 12px rgba(26,26,46,0.06);
  }
  .search-input:focus {
    border-color: var(--spark-coral);
    box-shadow: 0 0 0 3px rgba(255,107,107,0.12);
  }
  .search-input::placeholder { color: #C0BFBD; }

  .search-clear-btn {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    background: var(--spark-surface);
    border: none;
    border-radius: 50%;
    width: 26px;
    height: 26px;
    font-size: 12px;
    color: var(--spark-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }
  .search-clear-btn:hover { background: var(--spark-border); }

  /* Filter tabs */
  .search-tabs {
    display: flex;
    gap: 6px;
    margin-bottom: 28px;
    flex-wrap: wrap;
  }

  .search-tab {
    padding: 6px 16px;
    border-radius: 30px;
    border: 1px solid var(--spark-border);
    background: transparent;
    font-size: 13px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    color: var(--spark-muted);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.15s;
  }
  .search-tab:hover { background: var(--spark-surface); color: var(--spark-ink); }
  .search-tab.active { background: var(--spark-ink); color: white; border-color: var(--spark-ink); }

  .search-tab-count {
    font-size: 11px;
    font-weight: 600;
    background: rgba(255,255,255,0.2);
    padding: 1px 6px;
    border-radius: 30px;
  }
  .search-tab:not(.active) .search-tab-count {
    background: var(--spark-surface);
    color: var(--spark-muted);
  }

  /* Section */
  .search-section { margin-bottom: 36px; }

  .search-section-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--spark-ink);
    margin: 0 0 4px;
    letter-spacing: -0.2px;
  }

  .section-divider {
    width: 32px;
    height: 3px;
    background: var(--spark-coral);
    border-radius: 2px;
    margin-bottom: 16px;
  }

  /* Empty state */
  .search-empty {
    font-size: 13px;
    color: var(--spark-muted);
    font-style: italic;
    padding: 16px 0;
  }

  /* ── Users ── */
  .users-list { display: flex; flex-direction: column; gap: 6px; }

  .user-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: 14px;
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .user-row:hover { box-shadow: var(--spark-shadow-hover); transform: translateY(-1px); }

  .user-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--spark-coral-soft);
    color: var(--spark-coral);
    font-size: 15px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    text-decoration: none;
  }

  .user-info { flex: 1; min-width: 0; }

  .user-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--spark-ink);
    text-decoration: none;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .user-name:hover { color: var(--spark-coral); }

  .user-handle {
    font-size: 12px;
    color: var(--spark-muted);
    margin-top: 1px;
  }

  .btn-follow {
    padding: 7px 18px;
    border-radius: 30px;
    border: none;
    background: var(--spark-ink);
    color: white;
    font-size: 12.5px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 0.15s;
    flex-shrink: 0;
  }
  .btn-follow:hover { opacity: 0.82; }
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

  /* ── Posts grid ── */
  .posts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 10px;
  }

  .post-grid-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid var(--spark-border);
    text-decoration: none;
    display: block;
  }
  .post-grid-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }
  .post-grid-item:hover img { transform: scale(1.06); }

  .post-grid-overlay {
    position: absolute;
    inset: 0;
    background: rgba(26,26,46,0);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 10px;
    transition: background 0.2s;
  }
  .post-grid-item:hover .post-grid-overlay { background: rgba(26,26,46,0.45); }

  .post-grid-caption {
    font-size: 12px;
    color: white;
    line-height: 1.4;
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.2s, transform 0.2s;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .post-grid-item:hover .post-grid-caption { opacity: 1; transform: translateY(0); }

  /* ── Boards ── */
  .boards-list { display: flex; flex-direction: column; gap: 6px; }

  .board-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 13px 16px;
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: 14px;
    text-decoration: none;
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .board-row:hover { box-shadow: var(--spark-shadow-hover); transform: translateY(-1px); }

  .board-icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    background: #E6F1FB;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }

  .board-info { flex: 1; min-width: 0; }

  .board-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--spark-ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .board-meta { font-size: 12px; color: var(--spark-muted); margin-top: 1px; }

  .board-arrow { color: var(--spark-muted); font-size: 14px; flex-shrink: 0; transition: transform 0.15s; }
  .board-row:hover .board-arrow { transform: translateX(3px); color: var(--spark-coral); }

  /* Prompt (no query) */
  .search-prompt {
    text-align: center;
    padding: 64px 24px;
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: var(--spark-radius);
  }
  .search-prompt-icon  { font-size: 36px; margin-bottom: 12px; }
  .search-prompt-title { font-family: 'Playfair Display', serif; font-size: 1.2rem; color: var(--spark-ink); margin-bottom: 6px; }
  .search-prompt-sub   { font-size: 13px; color: var(--spark-muted); }
`;

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function Search() {
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [results, setResults] = useState({
    users: [],
    posts: [],
    boards: [],
    reels: []
  });
  const [loading, setLoading] = useState(false);
  const [followedUsers, setFollowedUsers] = useState([]);

  const TABS = ["All", "People", "Posts", "Reels", "Boards"];

  // Keep query in sync with URL search param
  useEffect(() => {
    const q = searchParams.get('q') || "";
    setQuery(q);
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const normalizedTab = tabParam.charAt(0).toUpperCase() + tabParam.slice(1).toLowerCase();
      setActiveTab(["All", "People", "Posts", "Reels", "Boards"].includes(normalizedTab) ? normalizedTab : "All");
    }
  }, [searchParams]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], posts: [], boards: [], reels: [] });
      return;
    }

    const search = async () => {
      try {
        setLoading(true);
        
        // Backend search API
        const searchData = await searchAPI.search(query, {
          tab: activeTab === "All" ? null : activeTab.toLowerCase(),
          limit: 20
        });
        
        setResults({
          users: searchData.users || [],
          posts: searchData.posts || [],
          boards: searchData.boards || [],
          reels: searchData.reels || []
        });
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(search, 300);
    return () => clearTimeout(timeoutId);
  }, [query, activeTab]);

  // Toggle follow
  const toggleFollow = async (userId) => {
    try {
      await usersAPI.followUser(userId);
      
      setFollowedUsers(prev => 
        prev.includes(userId) 
          ? prev.filter(id => id !== userId)
          : [...prev, userId]
      );
    } catch (error) {
      console.error('Follow failed:', error);
    }
  };

  const tabCounts = {
    All:    results.users.length + results.posts.length + results.reels.length + results.boards.length,
    People: results.users.length,
    Posts:  results.posts.length,
    Reels:  results.reels.length,
    Boards: results.boards.length,
  };

  const showUsers  = activeTab === "All" || activeTab === "People";
  const showPosts  = activeTab === "All" || activeTab === "Posts";
  const showReels  = activeTab === "All" || activeTab === "Reels";
  const showBoards = activeTab === "All" || activeTab === "Boards";

  const handleClear = () => {
    setQuery("");
    setResults({ users: [], posts: [], boards: [], reels: [] });
    setActiveTab("All");
  };

  return (
    <>
      <style>{searchStyles}</style>
      <div className="search-page">

        {/* Search bar */}
        <div className="search-bar-wrap">
          <span className="search-icon">🔍</span>
          <input
            className={`search-input${loading ? " loading" : ""}`}
            type="text"
            placeholder="Search people, posts, reels, boards…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button 
              className="search-clear-btn" 
              onClick={handleClear} 
              title="Clear search"
              disabled={loading}
            >
              ✕
            </button>
          )}
          {loading && (
            <div className="search-loading">
              <div className="loading-spinner-small"></div>
            </div>
          )}
        </div>

        {/* Tabs */}
        {query && (
          <div className="search-tabs">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`search-tab${activeTab === tab ? " active" : ""}${loading ? " disabled" : ""}`}
                onClick={() => !loading && setActiveTab(tab)}
                disabled={loading}
              >
                {tab}
                {tabCounts[tab] > 0 && (
                  <span className="search-tab-count">{tabCounts[tab]}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* No query prompt */}
        {!query ? (
          <div className="search-prompt">
            <div className="search-prompt-icon">🔍</div>
            <p className="search-prompt-title">Discover SparkNest</p>
            <p className="search-prompt-sub">
              Search for people, posts, reels, or boards to explore.
            </p>
          </div>
        ) : loading ? (
          <div className="search-loading-full">
            <div className="loading-spinner"></div>
            <p>Searching for "{query}"...</p>
          </div>
        ) : (
          <>
            {/* Users */}
            {showUsers && results.users.length > 0 && (
              <div className="search-section">
                <p className="search-section-title">People ({results.users.length})</p>
                <div className="section-divider" />
                <div className="users-list">
                  {results.users.map((user) => {
                    const isFollowing = followedUsers.includes(user._id);
                    const isCurrentUser = currentUser && currentUser._id === user._id;
                    
                    return (
                      <div className="user-row" key={user._id}>
                        <Link to={`/users/${user._id}`} className="user-avatar">
                          {getInitials(user.name)}
                        </Link>
                        <div className="user-info">
                          <Link to={`/users/${user._id}`} className="user-name">
                            {user.name}
                          </Link>
                          <p className="user-handle">
                            @{user.name.toLowerCase().replace(/\s+/g, '')} · {user.postCount} posts
                          </p>
                        </div>
                        {!isCurrentUser && (
                          <button
                            className={`btn-follow${isFollowing ? " following" : ""}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFollow(user._id);
                            }}
                          >
                            {isFollowing ? "Following" : "Follow"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Posts */}
            {showPosts && results.posts.length > 0 && (
              <div className="search-section">
                <p className="search-section-title">Posts ({results.posts.length})</p>
                <div className="section-divider" />
                <div className="posts-grid">
                  {results.posts.map((post) => (
                    <Link 
                      key={post._id} 
                      to={`/posts/${post._id}`} 
                      className="post-grid-item"
                    >
                      <img src={post.image} alt={post.caption} loading="lazy" />
                      <div className="post-grid-overlay">
                        <p className="post-grid-caption">{post.caption}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Reels */}
            {showReels && results.reels.length > 0 && (
              <div className="search-section">
                <p className="search-section-title">Reels ({results.reels.length})</p>
                <div className="section-divider" />
                <div className="posts-grid">
                  {results.reels.map((reel) => (
                    <Link 
                      key={reel._id} 
                      to={`/reels/${reel._id}`} 
                      className="post-grid-item"
                    >
                      <img 
                        src={reel.thumbnail || reel.video} 
                        alt={reel.title || "Reel"} 
                        loading="lazy"
                      />
                      <div className="post-grid-overlay">
                        <p className="post-grid-caption">
                          {reel.title || `${reel.user?.name}'s reel`}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Boards */}
            {showBoards && results.boards.length > 0 && (
              <div className="search-section">
                <p className="search-section-title">Boards ({results.boards.length})</p>
                <div className="section-divider" />
                <div className="boards-list">
                  {results.boards.map((board) => (
                    <Link 
                      key={board._id} 
                      to={`/boards/${board._id}`} 
                      className="board-row"
                    >
                      <div className="board-icon">📌</div>
                      <div className="board-info">
                        <p className="board-name">{board.name}</p>
                        <p className="board-meta">
                          {board.postCount || board.posts?.length || 0} posts ·{' '}
                          {board.isPrivate ? "🔒 Private" : "🌐 Public"}
                        </p>
                      </div>
                      <span className="board-arrow">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {Object.values(results).every(arr => arr.length === 0) && (
              <div className="search-empty-full">
                <div className="search-empty-icon">🔍</div>
                <p className="search-empty-title">No results found</p>
                <p className="search-empty-sub">
                  Try searching for people, posts, reels, or boards.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default Search;
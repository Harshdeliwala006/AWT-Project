import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postsAPI, reelsAPI, boardsAPI } from "../services/api"; // Your API services

// Add to your index.html <head>:
// <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
// <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">

const HomeStyles = `
  :root {
    --spark-coral: #FF6B6B;
    --spark-coral-soft: #FFE8E8;
    --spark-ink: #1A1A2E;
    --spark-muted: #6B7080;
    --spark-surface: #FAFAF8;
    --spark-white: #FFFFFF;
    --spark-border: #EBEBEB;
    --spark-radius: 18px;
    --spark-shadow-hover: 0 12px 40px rgba(26,26,46,0.15);
  }

  body {
    background: var(--spark-surface);
    font-family: 'DM Sans', sans-serif;
    color: var(--spark-ink);
  }

  .spark-logo {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    color: var(--spark-ink);
    letter-spacing: -0.5px;
    text-decoration: none;
  }
  .spark-logo span { color: var(--spark-coral); }

  /* Navbar */
  .spark-nav {
    background: rgba(255,255,255,0.88);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--spark-border);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  /* Reels */
  .reels-track {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding: 0.25rem 0 0.75rem;
    scrollbar-width: none;
  }
  .reels-track::-webkit-scrollbar { display: none; }

  .reel-wrapper {
    flex: 0 0 130px;
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  .reel-wrapper:hover { transform: scale(1.03); }
  .reel-wrapper video {
    width: 130px;
    height: 220px;
    object-fit: cover;
    display: block;
  }
  .reel-overlay {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 28px 10px 10px;
    background: linear-gradient(transparent, rgba(0,0,0,0.55));
  }
  .reel-label { color: white; font-size: 11px; font-weight: 500; }

  /* Section heading */
  .section-heading {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--spark-ink);
    margin-bottom: 4px;
  }
  .section-divider {
    width: 32px; height: 3px;
    background: var(--spark-coral);
    border-radius: 2px;
    margin-bottom: 1.25rem;
  }

  /* Masonry */
  .masonry-grid { columns: 2; column-gap: 14px; }
  @media (min-width: 768px)  { .masonry-grid { columns: 3; } }
  @media (min-width: 1200px) { .masonry-grid { columns: 4; } }

  .post-card {
    break-inside: avoid;
    margin-bottom: 14px;
    background: var(--spark-white);
    border-radius: var(--spark-radius);
    border: 1px solid var(--spark-border);
    overflow: hidden;
    transition: box-shadow 0.25s ease, transform 0.25s ease;
  }
  .post-card:hover {
    box-shadow: var(--spark-shadow-hover);
    transform: translateY(-3px);
  }
  .post-card img { width: 100%; display: block; object-fit: cover; }

  .post-body { padding: 10px 12px 12px; }
  .post-caption { font-size: 13px; line-height: 1.5; margin-bottom: 6px; color: var(--spark-ink); }
  .post-author { font-size: 12px; font-weight: 500; color: var(--spark-muted); margin-bottom: 8px; }

  .post-actions { display: flex; gap: 6px; margin-bottom: 10px; }

  .btn-like {
    display: flex; align-items: center; gap: 5px;
    background: var(--spark-coral-soft); color: var(--spark-coral);
    border: none; border-radius: 30px; padding: 5px 12px;
    font-size: 12px; font-weight: 500; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.15s;
  }
  .btn-like:hover { background: #ffd5d5; }

  .btn-save {
    display: flex; align-items: center; gap: 5px;
    background: transparent; color: var(--spark-muted);
    border: 1px solid var(--spark-border); border-radius: 30px; padding: 5px 12px;
    font-size: 12px; font-weight: 500; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
  }
  .btn-save:hover { background: var(--spark-ink); color: white; border-color: var(--spark-ink); }

  /* Comments */
  .comments-section { border-top: 1px solid var(--spark-border); padding-top: 10px; margin-top: 4px; }

  .comment-row { display: flex; gap: 6px; align-items: flex-start; margin-bottom: 6px; }

  .comment-avatar {
    width: 24px; height: 24px; border-radius: 50%;
    background: var(--spark-coral-soft); color: var(--spark-coral);
    font-size: 10px; font-weight: 600;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .comment-text { font-size: 12px; color: var(--spark-ink); line-height: 1.4; }
  .comment-author-name { font-weight: 600; font-size: 11px; }

  .comment-input-row { display: flex; gap: 6px; margin-top: 8px; }

  .comment-input {
    flex: 1; border: 1px solid var(--spark-border); border-radius: 30px;
    padding: 5px 12px; font-size: 12px; font-family: 'DM Sans', sans-serif;
    outline: none; background: var(--spark-surface);
    transition: border-color 0.15s;
  }
  .comment-input:focus { border-color: var(--spark-coral); }

  .btn-comment-send {
    background: var(--spark-ink); color: white; border: none;
    border-radius: 30px; padding: 5px 14px;
    font-size: 12px; font-weight: 500; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: opacity 0.15s;
  }
  .btn-comment-send:hover { opacity: 0.82; }

  /* Boards modal */
  .boards-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.35);
    backdrop-filter: blur(4px);
    z-index: 200;
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

  .boards-modal {
    background: var(--spark-white);
    border-radius: 24px; padding: 28px; width: 320px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.18);
    animation: slideUp 0.22s ease;
  }
  @keyframes slideUp {
    from { transform: translateY(18px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  .boards-modal h5 {
    font-family: 'Playfair Display', serif;
    font-size: 1.15rem; margin-bottom: 18px; color: var(--spark-ink);
  }

  .board-btn {
    width: 100%; text-align: left;
    background: var(--spark-surface); border: 1px solid var(--spark-border);
    border-radius: 14px; padding: 12px 16px;
    font-size: 14px; font-family: 'DM Sans', sans-serif; font-weight: 500;
    color: var(--spark-ink); cursor: pointer; margin-bottom: 8px;
    display: flex; align-items: center; gap: 10px;
    transition: all 0.15s;
  }
  .board-btn:hover { background: var(--spark-coral-soft); border-color: var(--spark-coral); color: var(--spark-coral); }

  .btn-close-modal {
    width: 100%; margin-top: 4px;
    background: transparent; border: 1px solid var(--spark-border);
    border-radius: 14px; padding: 10px;
    font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: var(--spark-muted); cursor: pointer;
    transition: background 0.15s;
  }
  .btn-close-modal:hover { background: var(--spark-surface); }
`;

function Home() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [boards, setBoards] = useState([]);
  const [commentTexts, setCommentTexts] = useState({});
  const [showBoards, setShowBoards] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Fetch initial data
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch posts feed
        const postsData = await postsAPI.getPosts({ page: 1, limit: 12 });
        setPosts(postsData.posts);

        // Fetch reels
        const reelsData = await reelsAPI.getReels({ page: 1, limit: 5 });
        setReels(reelsData.reels);

        // Fetch user's boards for save modal
        const boardsData = await boardsAPI.getMyBoards();
        setBoards(boardsData);
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  // Like post
  const handleLike = async (postId) => {
    try {
      await postsAPI.likePost(postId);
      
      // Optimistically update UI
      setPosts(posts.map((post) =>
        post._id === postId
          ? { 
              ...post, 
              likes: post.likes.includes(currentUser._id) 
                ? post.likes.length - 1 
                : post.likes.length + 1 
            }
          : post
      ));
    } catch (error) {
      console.error('Like failed:', error);
    }
  };

  // Comment on post
  const handleComment = async (postId) => {
    const text = (commentTexts[postId] || "").trim();
    if (!text) return;

    try {
      await postsAPI.commentOnPost(postId, { text });
      
      // Clear input
      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
      
      // Refetch post or optimistically update (refetch for simplicity)
      const updatedPosts = await postsAPI.getPostById(postId);
      setPosts(posts.map((p) => p._id === postId ? updatedPosts : p));
    } catch (error) {
      console.error('Comment failed:', error);
    }
  };

  // Save post modal
  const handleSaveClick = (postId) => { 
    setSelectedPost(postId); 
    setShowBoards(true); 
  };

  const saveToBoard = async (boardId) => {
    try {
      await boardsAPI.addPostToBoard(boardId, selectedPost);
      
      // Refresh boards
      const updatedBoards = await boardsAPI.getMyBoards();
      setBoards(updatedBoards);
      
      setShowBoards(false);
    } catch (error) {
      console.error('Save to board failed:', error);
    }
  };

  // Load more posts
  const loadMorePosts = async () => {
    try {
      const newPosts = await postsAPI.getPosts({ page: page + 1, limit: 12 });
      if (newPosts.posts.length > 0) {
        setPosts(prev => [...prev, ...newPosts.posts]);
        setPage(page + 1);
      }
    } catch (error) {
      console.error('Load more failed:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <style>{HomeStyles}</style>
        <div className="home-container">
          <div className="home-hero">
            <h1>Welcome to SparkNest</h1>
            <p>Join the conversation and share your moments</p>
            <div className="home-hero-actions">
              <Link to="/register" className="btn-primary">Get Started</Link>
              <Link to="/login" className="btn-secondary">Log In</Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <style>{HomeStyles}</style>
        <div className="home-container">
          <div className="home-loading">
            <div className="loading-spinner"></div>
            <p>Loading your feed...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{HomeStyles}</style>
      <div className="home-container">

        {/* Reels Section */}
        <div className="section mb-4">
          <div className="section-header">
            <h2 className="section-heading">Reels</h2>
            <Link to="/reels" className="section-link">See all</Link>
          </div>
          <div className="section-divider" />
          <div className="reels-track">
            {reels.slice(0, 5).map((reel) => (
              <Link to={`/reels`} className="reel-wrapper" key={reel._id}>
                <video 
                  src={reel.video} 
                  muted 
                  loop 
                  playsInline 
                  poster={reel.thumbnail}
                  className="reel-video"
                />
                <div className="reel-overlay">
                  <div className="reel-stats">
                    <span>❤ {reel.likeCount}</span>
                    <span>👀 {reel.views}</span>
                  </div>
                  <span className="reel-label">▶ Watch</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Posts Feed */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-heading">For You</h2>
          </div>
          <div className="section-divider" />

          <div className="masonry-grid">
            {posts.map((post) => {
              const postUser = post.user;
              const initials = postUser?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2) || "?";

              return (
                <div className="post-card" key={post._id}>
                  <Link to={`/posts/${post._id}`} className="post-image-link">
                    <img src={post.image} alt={post.caption} loading="lazy" />
                  </Link>

                  <div className="post-body">
                    <p className="post-caption">{post.caption}</p>

                    <div className="post-author-row">
                      <div 
                        className="post-avatar" 
                        style={{ backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)` }}
                      >
                        {initials}
                      </div>
                      <div>
                        <Link to={`/users/${postUser._id}`} className="post-author">
                          {postUser.name}
                        </Link>
                        {post.tags?.length > 0 && (
                          <div className="post-tags">
                            {post.tags.slice(0, 3).map((tag) => (
                              <Link key={tag} to={`/search?q=${tag}`} className="post-tag">
                                #{tag}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="post-actions">
                      <button 
                        className="btn-like" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleLike(post._id);
                        }}
                      >
                        ❤ {post.likeCount}
                      </button>
                      <button 
                        className="btn-save" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSaveClick(post._id);
                        }}
                      >
                        🔖 Save
                      </button>
                    </div>

                    {/* Comments Preview */}
                    {post.comments?.length > 0 && (
                      <div className="comments-preview">
                        {post.comments.slice(0, 2).map((comment) => {
                          const cu = comment.user;
                          const ci = cu?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "?";
                          return (
                            <div className="comment-row" key={comment._id}>
                              <div className="comment-avatar">{ci}</div>
                              <div className="comment-text">
                                <span className="comment-author">{cu?.name}</span>
                                <span>{comment.text}</span>
                              </div>
                            </div>
                          );
                        })}
                        {post.comments.length > 2 && (
                          <div className="more-comments">
                            +{post.comments.length - 2} more
                          </div>
                        )}
                      </div>
                    )}

                    {/* Comment Input */}
                    <div className="comment-input-row">
                      <input
                        className="comment-input"
                        placeholder="Add a comment…"
                        value={commentTexts[post._id] || ""}
                        onChange={(e) =>
                          setCommentTexts((prev) => ({ 
                            ...prev, 
                            [post._id]: e.target.value 
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleComment(post._id);
                          }
                        }}
                      />
                      <button 
                        className="btn-comment-send" 
                        onClick={() => handleComment(post._id)}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Save to Boards Modal */}
      {showBoards && selectedPost && (
        <div className="boards-backdrop" onClick={() => setShowBoards(false)}>
          <div className="boards-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Save post to board</h5>
              <button 
                className="btn-close-modal" 
                onClick={() => setShowBoards(false)}
              >
                ×
              </button>
            </div>
            <div className="boards-list">
              {boards.map((board) => (
                <button 
                  key={board._id} 
                  className="board-btn" 
                  onClick={() => saveToBoard(board._id)}
                  disabled={board.posts.some(p => p._id === selectedPost)}
                >
                  <span>📌</span> 
                  {board.name} 
                  <span className="board-post-count">
                    {board.postCount || board.posts.length} posts
                  </span>
                </button>
              ))}
            </div>
            <Link to="/boards/new" className="btn-new-board-modal">
              + Create new board
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;
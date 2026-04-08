import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postsAPI, boardsAPI } from "../services/api"; // Your API services

const postsStyles = `
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

  .posts-page {
    font-family: 'DM Sans', sans-serif;
    max-width: 680px;
    margin: 0 auto;
    padding: 36px 24px;
  }

  /* Header */
  .posts-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 8px;
    gap: 12px;
  }

  .posts-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.9rem;
    font-weight: 600;
    color: var(--spark-ink);
    margin: 0;
    letter-spacing: -0.4px;
  }

  .posts-count {
    font-size: 13px;
    color: var(--spark-muted);
    margin: 4px 0 0;
  }

  .section-divider {
    width: 36px;
    height: 3px;
    background: var(--spark-coral);
    border-radius: 2px;
    margin-bottom: 28px;
  }

  /* Post card */
  .post-card {
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: var(--spark-radius);
    overflow: hidden;
    margin-bottom: 20px;
    transition: box-shadow 0.25s ease, transform 0.25s ease;
  }
  .post-card:hover {
    box-shadow: var(--spark-shadow-hover);
    transform: translateY(-2px);
  }

  /* Author row */
  .post-author-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 16px;
    border-bottom: 1px solid var(--spark-border);
  }

  .post-author-left {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }

  .post-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--spark-coral-soft);
    color: var(--spark-coral);
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .post-author-name {
    font-size: 13.5px;
    font-weight: 500;
    color: var(--spark-ink);
    margin: 0;
  }

  .post-author-handle {
    font-size: 11.5px;
    color: var(--spark-muted);
    margin: 0;
  }

  /* Delete btn - top-right of author row */
  .post-delete-btn {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #FCEBEB;
    border: none;
    cursor: pointer;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #E24B4A;
    transition: background 0.15s;
    flex-shrink: 0;
  }
  .post-delete-btn:hover { background: #F7C1C1; }

  /* Image */
  .post-card img {
    width: 100%;
    display: block;
    object-fit: cover;
    max-height: 480px;
  }

  /* Caption */
  .post-caption-area {
    padding: 12px 16px 10px;
  }

  .post-caption {
    font-size: 13.5px;
    line-height: 1.55;
    color: var(--spark-ink);
    margin: 0 0 6px;
  }
  .post-caption b { font-weight: 600; }

  /* Actions */
  .post-actions {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 8px 16px 12px;
  }

  .btn-like {
    display: flex;
    align-items: center;
    gap: 5px;
    background: var(--spark-coral-soft);
    color: var(--spark-coral);
    border: none;
    border-radius: 30px;
    padding: 6px 13px;
    font-size: 12.5px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: background 0.15s;
  }
  .btn-like:hover { background: #ffd5d5; }
  .btn-like.liked { background: var(--spark-coral); color: white; }

  .btn-action {
    display: flex;
    align-items: center;
    gap: 5px;
    background: transparent;
    color: var(--spark-muted);
    border: 1px solid var(--spark-border);
    border-radius: 30px;
    padding: 6px 13px;
    font-size: 12.5px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-action:hover { background: var(--spark-ink); color: white; border-color: var(--spark-ink); }
  .btn-action.saved { background: var(--spark-ink); color: white; border-color: var(--spark-ink); }

  /* Comments */
  .post-comments {
    border-top: 1px solid var(--spark-border);
    padding: 12px 16px 14px;
  }

  .comments-label {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--spark-muted);
    margin-bottom: 10px;
  }

  .comment-row {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    margin-bottom: 9px;
  }

  .comment-avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--spark-surface);
    border: 1px solid var(--spark-border);
    color: var(--spark-muted);
    font-size: 9px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .comment-bubble {
    background: var(--spark-surface);
    border-radius: 0 12px 12px 12px;
    padding: 7px 11px;
    flex: 1;
  }

  .comment-author { font-size: 11px; font-weight: 600; color: var(--spark-ink); margin-bottom: 2px; }
  .comment-text   { font-size: 12.5px; color: var(--spark-ink); line-height: 1.45; }

  .no-comments {
    font-size: 12.5px;
    color: var(--spark-muted);
    font-style: italic;
    margin-bottom: 10px;
  }

  .comment-input-row {
    display: flex;
    gap: 8px;
    margin-top: 10px;
    align-items: center;
  }

  .comment-my-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--spark-coral-soft);
    color: var(--spark-coral);
    font-size: 9px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .comment-input {
    flex: 1;
    background: var(--spark-surface);
    border: 1px solid var(--spark-border);
    border-radius: 30px;
    padding: 7px 14px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    color: var(--spark-ink);
    outline: none;
    transition: border-color 0.15s;
  }
  .comment-input:focus { border-color: var(--spark-coral); }
  .comment-input::placeholder { color: #BEBDBA; }

  .comment-send-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--spark-ink);
    color: white;
    border: none;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: opacity 0.15s, transform 0.1s;
  }
  .comment-send-btn:hover:not(:disabled) { opacity: 0.82; }
  .comment-send-btn:active:not(:disabled) { transform: scale(0.92); }
  .comment-send-btn:disabled { opacity: 0.3; cursor: default; }

  /* Empty feed */
  .posts-empty {
    text-align: center;
    padding: 72px 24px;
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: var(--spark-radius);
  }
  .posts-empty-icon  { font-size: 36px; margin-bottom: 12px; }
  .posts-empty-title { font-family: 'Playfair Display', serif; font-size: 1.2rem; color: var(--spark-ink); margin-bottom: 6px; }
  .posts-empty-sub   { font-size: 13px; color: var(--spark-muted); }

  /* Boards modal */
  .boards-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.35);
    backdrop-filter: blur(4px);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

  .boards-modal {
    background: var(--spark-white);
    border-radius: 24px;
    padding: 28px;
    width: 320px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.18);
    animation: slideUp 0.22s ease;
  }
  @keyframes slideUp {
    from { transform: translateY(18px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  .boards-modal h5 {
    font-family: 'Playfair Display', serif;
    font-size: 1.15rem;
    margin: 0 0 18px;
    color: var(--spark-ink);
  }

  .board-btn {
    width: 100%;
    text-align: left;
    background: var(--spark-surface);
    border: 1px solid var(--spark-border);
    border-radius: 14px;
    padding: 12px 16px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    color: var(--spark-ink);
    cursor: pointer;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.15s;
  }
  .board-btn:hover { background: var(--spark-coral-soft); border-color: var(--spark-coral); color: var(--spark-coral); }

  .btn-close-modal {
    width: 100%;
    margin-top: 4px;
    background: transparent;
    border: 1px solid var(--spark-border);
    border-radius: 14px;
    padding: 10px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    color: var(--spark-muted);
    cursor: pointer;
    transition: background 0.15s;
  }
  .btn-close-modal:hover { background: var(--spark-surface); }

  /* Toast */
  .posts-toast {
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%) translateY(80px);
    background: var(--spark-ink);
    color: white;
    padding: 11px 20px;
    border-radius: 30px;
    font-size: 13.5px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 8px 28px rgba(26,26,46,0.22);
    z-index: 300;
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s;
    opacity: 0;
    pointer-events: none;
  }
  .posts-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
`;

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function Posts() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [boards, setBoards] = useState([]);
  const [showBoards, setShowBoards] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentTexts, setCommentTexts] = useState({});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "" });

  // Fetch posts
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await postsAPI.getPosts({ page: 1, limit: 20 });
        setPosts(data.posts);
        setHasMore(data.pages > 1);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [isAuthenticated]);

  // Fetch boards for save modal
  const fetchBoards = useCallback(async () => {
    if (!currentUser) return;
    try {
      const data = await boardsAPI.getMyBoards();
      setBoards(data);
    } catch (error) {
      console.error('Failed to fetch boards:', error);
    }
  }, [currentUser]);

  // Like post
  const handleLike = async (postId) => {
    try {
      await postsAPI.likePost(postId);
      
      // Optimistically update
      setPosts(posts.map((post) =>
        post._id === postId
          ? {
              ...post,
              likeCount: post.likes.includes(currentUser._id)
                ? post.likeCount - 1
                : post.likeCount + 1
            }
          : post
      ));
    } catch (error) {
      console.error('Like failed:', error);
    }
  };

  // Delete post (owner only)
  const handleDelete = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await postsAPI.deletePost(postId);
      setPosts(posts.filter((p) => p._id !== postId));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete post');
    }
  };

  // Save post modal
  const handleSaveClick = async (postId) => {
    if (!currentUser) {
      showToast("⚠️ Please log in to save posts");
      return;
    }
    
    try {
      await fetchBoards();
      setSelectedPost(postId);
      setShowBoards(true);
    } catch (error) {
      showToast("Failed to load boards");
    }
  };

  const saveToBoard = async (boardId) => {
    try {
      await boardsAPI.addPostToBoard(boardId, selectedPost);
      showToast("✓ Saved to board!");
      setShowBoards(false);
    } catch (error) {
      console.error('Save to board failed:', error);
      showToast("Failed to save to board");
    }
  };

  // Comment
  const handleComment = async (postId) => {
    const text = (commentTexts[postId] || "").trim();
    if (!text) return;
    
    if (!currentUser) {
      showToast("⚠️ Please log in to comment");
      return;
    }

    try {
      await postsAPI.commentOnPost(postId, { text });
      
      // Clear input
      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
      
      // Refresh post comments
      const updatedPost = await postsAPI.getPostById(postId);
      setPosts(posts.map((p) => p._id === postId ? updatedPost : p));
      
    } catch (error) {
      console.error('Comment failed:', error);
      showToast("Failed to post comment");
    }
  };

  // Load more posts
  const loadMore = async () => {
    try {
      setLoading(true);
      const data = await postsAPI.getPosts({ page: page + 1, limit: 20 });
      if (data.posts.length > 0) {
        setPosts(prev => [...prev, ...data.posts]);
        setPage(page + 1);
        setHasMore(data.pages > page + 1);
      }
    } catch (error) {
      console.error('Load more failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 2500);
  };

  if (!isAuthenticated) {
    return (
      <>
        <style>{postsStyles}</style>
        <div className="posts-page">
          <div className="posts-empty">
            <div className="posts-empty-icon">🔒</div>
            <p className="posts-empty-title">Log in to view posts</p>
            <p className="posts-empty-sub">Sign in to see and interact with posts.</p>
            <Link to="/login" className="posts-login-btn">Log In</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{postsStyles}</style>
      <div className="posts-page">

        {/* Header */}
        <div className="posts-header">
          <div>
            <h1 className="posts-title">All Posts</h1>
            <p className="posts-count">{posts.length} posts</p>
          </div>
          <Link to="/create/post" className="posts-new-btn">
            + New Post
          </Link>
        </div>

        <div className="section-divider" />

        {/* Loading */}
        {loading && posts.length === 0 && (
          <div className="posts-loading">
            <div className="loading-spinner"></div>
            <p>Loading posts...</p>
          </div>
        )}

        {/* Empty */}
        {posts.length === 0 && !loading ? (
          <div className="posts-empty">
            <div className="posts-empty-icon">📝</div>
            <p className="posts-empty-title">No posts yet</p>
            <p className="posts-empty-sub">Be the first to share something!</p>
            <Link to="/create/post" className="posts-new-btn">Create Post</Link>
          </div>
        ) : (
          <>
            {/* Posts Grid */}
            <div className="posts-grid">
              {posts.map((post) => {
                const postUser = post.user;
                const initials = getInitials(postUser.name);
                const isOwner = currentUser && post.user._id === currentUser._id;

                return (
                  <div className="post-card" key={post._id}>

                    {/* Author Header */}
                    <div className="post-author-row">
                      <Link to={`/users/${postUser._id}`} className="post-author-left">
                        <div 
                          className="post-avatar" 
                          style={{ backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)` }}
                        >
                          {initials}
                        </div>
                        <div>
                          <p className="post-author-name">{postUser.name}</p>
                          <p className="post-author-handle">
                            {post.likeCount} likes · {post.commentCount} comments
                          </p>
                        </div>
                      </Link>
                      {isOwner && (
                        <button
                          className="post-delete-btn"
                          onClick={() => handleDelete(post._id)}
                          title="Delete post"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Image */}
                    <Link to={`/posts/${post._id}`} className="post-image-link">
                      <img src={post.image} alt={post.caption} loading="lazy" />
                    </Link>

                    {/* Caption */}
                    <div className="post-caption-area">
                      <p className="post-caption">
                        <strong>{postUser.name}</strong> {post.caption}
                      </p>
                      {post.tags?.length > 0 && (
                        <div className="post-tags">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Link 
                              key={tag} 
                              to={`/search?q=${tag}`} 
                              className="post-tag"
                            >
                              #{tag}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
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
                      <Link
                        to={`/posts/${post._id}`}
                        className="btn-comment"
                      >
                        💬 {post.commentCount}
                      </Link>
                    </div>

                    {/* Comments Preview */}
                    <div className="post-comments-preview">
                      <p className="comments-label">Comments</p>
                      
                      {post.comments?.length === 0 ? (
                        <p className="no-comments">No comments yet</p>
                      ) : (
                        post.comments.slice(0, 2).map((comment) => {
                          const cu = comment.user;
                          const ci = getInitials(cu.name);
                          return (
                            <div className="comment-row" key={comment._id}>
                              <div 
                                className="comment-avatar" 
                                style={{ backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)` }}
                              >
                                {ci}
                              </div>
                              <div className="comment-bubble">
                                <p className="comment-author">{cu.name}</p>
                                <p className="comment-text">{comment.text}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                      
                      {post.comments?.length > 2 && (
                        <p className="more-comments">
                          +{post.comments.length - 2} more
                        </p>
                      )}

                      {/* Comment Input */}
                      <div className="comment-input-row">
                        {currentUser && (
                          <div 
                            className="comment-my-avatar"
                            style={{ backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)` }}
                          >
                            {getInitials(currentUser.name)}
                          </div>
                        )}
                        <input
                          className="comment-input"
                          placeholder={currentUser ? "Add a comment…" : "Log in to comment"}
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
                          disabled={!currentUser}
                        />
                        <button
                          className="comment-send-btn"
                          onClick={() => handleComment(post._id)}
                          disabled={!currentUser || !(commentTexts[post._id] || "").trim()}
                        >
                          ↑
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="posts-load-more">
                <button 
                  onClick={loadMore} 
                  disabled={loading}
                  className="load-more-btn"
                >
                  {loading ? "Loading..." : "Load more posts"}
                </button>
              </div>
            )}
          </>
        )}

        {/* Boards Modal */}
        {showBoards && selectedPost && (
          <div className="boards-backdrop" onClick={() => setShowBoards(false)}>
            <div className="boards-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h5>Save post to board</h5>
                <button 
                  className="close-modal" 
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
                  >
                    📌 {board.name} 
                    <span>({board.postCount || board.posts.length})</span>
                  </button>
                ))}
              </div>
              <Link to="/boards/new" className="new-board-btn">
                + Create new board
              </Link>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast.show && (
          <div className={`posts-toast ${toast.show ? "show" : ""}`}>
            {toast.message}
          </div>
        )}
      </div>
    </>
  );
}

export default Posts;
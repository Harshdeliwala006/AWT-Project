import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postsAPI, boardsAPI, usersAPI } from "../services/api"; // Your API services

const postDetailsStyles = `
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

  .pd-page {
    font-family: 'DM Sans', sans-serif;
    min-height: calc(100vh - 62px);
    background: var(--spark-surface);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 40px 24px;
  }

  .pd-card {
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: var(--spark-radius);
    width: 100%;
    max-width: 620px;
    overflow: hidden;
    box-shadow: 0 4px 32px rgba(26,26,46,0.07);
  }

  /* Author header */
  .pd-author-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid var(--spark-border);
  }

  .pd-author-left {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }

  .pd-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--spark-coral-soft);
    color: var(--spark-coral);
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .pd-author-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--spark-ink);
    margin: 0;
  }

  .pd-author-handle {
    font-size: 12px;
    color: var(--spark-muted);
    margin: 0;
  }

  .pd-follow-btn {
    font-size: 12.5px;
    font-weight: 500;
    color: var(--spark-coral);
    background: var(--spark-coral-soft);
    border: none;
    border-radius: 30px;
    padding: 6px 14px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: opacity 0.15s;
  }
  .pd-follow-btn:hover { opacity: 0.82; }

  /* Image */
  .pd-image {
    width: 100%;
    max-height: 520px;
    object-fit: cover;
    display: block;
  }

  /* Actions bar */
  .pd-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 18px;
    border-bottom: 1px solid var(--spark-border);
  }

  .pd-action-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    background: transparent;
    border: 1px solid var(--spark-border);
    border-radius: 30px;
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    color: var(--spark-muted);
    transition: all 0.15s;
  }
  .pd-action-btn:hover {
    background: var(--spark-surface);
    color: var(--spark-ink);
  }

  .pd-like-btn {
    background: var(--spark-coral-soft);
    color: var(--spark-coral);
    border-color: transparent;
  }
  .pd-like-btn:hover { background: #ffd5d5; color: var(--spark-coral); }

  .pd-save-btn:hover {
    background: var(--spark-ink);
    color: white;
    border-color: var(--spark-ink);
  }

  /* Caption */
  .pd-caption-area {
    padding: 14px 18px 10px;
    border-bottom: 1px solid var(--spark-border);
  }

  .pd-caption {
    font-size: 14px;
    line-height: 1.6;
    color: var(--spark-ink);
    margin: 0 0 8px;
  }

  .pd-caption b { font-weight: 600; }

  .pd-meta {
    font-size: 12px;
    color: var(--spark-muted);
  }

  /* Comments section */
  .pd-comments {
    padding: 0 18px;
    max-height: 320px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--spark-border) transparent;
  }

  .pd-comments-label {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--spark-muted);
    padding: 14px 0 10px;
    position: sticky;
    top: 0;
    background: var(--spark-white);
  }

  .pd-comment-row {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    margin-bottom: 14px;
  }

  .pd-comment-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--spark-surface);
    border: 1px solid var(--spark-border);
    color: var(--spark-muted);
    font-size: 10px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .pd-comment-bubble {
    background: var(--spark-surface);
    border-radius: 0 14px 14px 14px;
    padding: 9px 13px;
    flex: 1;
  }

  .pd-comment-author {
    font-size: 11.5px;
    font-weight: 600;
    color: var(--spark-ink);
    margin-bottom: 3px;
  }

  .pd-comment-text {
    font-size: 13px;
    color: var(--spark-ink);
    line-height: 1.5;
  }

  .pd-no-comments {
    font-size: 13px;
    color: var(--spark-muted);
    text-align: center;
    padding: 24px 0;
    font-style: italic;
  }

  /* Input */
  .pd-input-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    border-top: 1px solid var(--spark-border);
  }

  .pd-my-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--spark-coral-soft);
    color: var(--spark-coral);
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .pd-comment-input {
    flex: 1;
    background: var(--spark-surface);
    border: 1px solid var(--spark-border);
    border-radius: 30px;
    padding: 9px 16px;
    font-size: 13.5px;
    font-family: 'DM Sans', sans-serif;
    color: var(--spark-ink);
    outline: none;
    transition: border-color 0.15s;
  }
  .pd-comment-input:focus { border-color: var(--spark-coral); }
  .pd-comment-input::placeholder { color: #BEBDBA; }

  .pd-send-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--spark-ink);
    color: white;
    border: none;
    font-size: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: opacity 0.15s, transform 0.1s;
  }
  .pd-send-btn:hover:not(:disabled) { opacity: 0.82; }
  .pd-send-btn:active:not(:disabled) { transform: scale(0.92); }
  .pd-send-btn:disabled { opacity: 0.35; cursor: default; }

  /* Not found */
  .pd-not-found {
    font-family: 'DM Sans', sans-serif;
    text-align: center;
    padding: 80px 24px;
    color: var(--spark-muted);
  }
  .pd-not-found h2 {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    color: var(--spark-ink);
    margin-bottom: 8px;
  }
`;

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function PostDetails() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [following, setFollowing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showBoards, setShowBoards] = useState(false);
  const [boards, setBoards] = useState([]);
  const commentRef = useRef(null);

  // Fetch post details
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch post with populated data
        const postData = await postsAPI.getPostById(id);
        setPost(postData);
        
        // Check if current user follows post author
        if (currentUser && postData.user._id !== currentUser._id) {
          const userProfile = await usersAPI.getUserById(postData.user._id);
          setFollowing(userProfile.following?.includes(currentUser._id) || false);
        }
        
        // Check if current user liked post
        if (currentUser) {
          setLiked(postData.likes.includes(currentUser._id));
        }
        
      } catch (err) {
        console.error('Failed to fetch post:', err);
        if (err.message.includes('not found')) {
          setError('Post not found');
        } else {
          setError('Failed to load post. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, currentUser]);

  // Toggle like
  const handleLike = async () => {
    try {
      await postsAPI.likePost(id);
      setLiked(!liked);
    } catch (error) {
      console.error('Like failed:', error);
    }
  };

  // Toggle follow
  const handleFollow = async () => {
    try {
      await usersAPI.followUser(post.user._id);
      setFollowing(!following);
    } catch (error) {
      console.error('Follow failed:', error);
    }
  };

  // Add comment
  const handleComment = async () => {
    const text = commentText.trim();
    if (!text) return;

    try {
      await postsAPI.commentOnPost(id, { text });
      setCommentText("");
      
      // Refresh post data
      const updatedPost = await postsAPI.getPostById(id);
      setPost(updatedPost);
      
      commentRef.current?.focus();
    } catch (error) {
      console.error('Comment failed:', error);
    }
  };

  // Save modal
  const handleSaveClick = async () => {
    try {
      const userBoards = await boardsAPI.getMyBoards();
      setBoards(userBoards);
      setShowBoards(true);
    } catch (error) {
      console.error('Failed to fetch boards:', error);
    }
  };

  const saveToBoard = async (boardId) => {
    try {
      await boardsAPI.addPostToBoard(boardId, id);
      setShowBoards(false);
    } catch (error) {
      console.error('Save to board failed:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleComment();
    }
  };

  if (loading) {
    return (
      <>
        <style>{postDetailsStyles}</style>
        <div className="pd-page">
          <div className="pd-loading">
            <div className="loading-spinner"></div>
            <p>Loading post...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <style>{postDetailsStyles}</style>
        <div className="pd-page">
          <div className="pd-not-found">
            <h2>{error || "Post not found"}</h2>
            <p>This post may have been removed or the link is incorrect.</p>
            <Link to="/" className="pd-back-link">← Back to home</Link>
          </div>
        </div>
      </>
    );
  }

  const postUser = post.user;
  const initials = getInitials(postUser.name);
  const myInitials = getInitials(currentUser?.name);

  return (
    <>
      <style>{postDetailsStyles}</style>
      <div className="pd-page">
        <div className="pd-card">

          {/* Author Header */}
          <div className="pd-author-row">
            <Link to={`/users/${postUser._id}`} className="pd-author-left">
              <div className="pd-avatar" style={{ 
                backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)` 
              }}>
                {initials}
              </div>
              <div>
                <p className="pd-author-name">{postUser.name}</p>
                <p className="pd-author-handle">
                  {post.likeCount} likes · {post.commentCount} comments
                </p>
              </div>
            </Link>
            {currentUser?._id !== postUser._id && (
              <button 
                className={`pd-follow-btn ${following ? "following" : ""}`}
                onClick={handleFollow}
              >
                {following ? "Following" : "+ Follow"}
              </button>
            )}
          </div>

          {/* Image */}
          <Link to={post.image} className="pd-image-link">
            <img src={post.image} alt={post.caption} className="pd-image" />
          </Link>

          {/* Actions Bar */}
          <div className="pd-actions">
            <button
              className={`pd-action-btn pd-like-btn ${liked ? "liked" : ""}`}
              onClick={handleLike}
            >
              {liked ? "❤" : "🤍"} {post.likeCount}
            </button>
            <button className="pd-action-btn" disabled title="Share">
              📤 Share
            </button>
            <button 
              className={`pd-action-btn pd-save-btn ${saved ? "saved" : ""}`}
              onClick={handleSaveClick}
            >
              {saved ? "🔖 Saved" : "🔖 Save"}
            </button>
          </div>

          {/* Caption & Tags */}
          <div className="pd-caption-area">
            <p className="pd-caption">
              <strong>{postUser.name}</strong> {post.caption}
            </p>
            {post.tags?.length > 0 && (
              <div className="pd-tags">
                {post.tags.map((tag) => (
                  <Link 
                    key={tag} 
                    to={`/search?q=${tag}`} 
                    className="pd-tag"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
            <span className="pd-meta">
              {post.commentCount} comment{post.commentCount !== 1 ? 's' : ''} · {post.likeCount} like{post.likeCount !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Comments Section */}
          <div className="pd-comments">
            <p className="pd-comments-label">
              Comments ({post.commentCount})
            </p>

            {post.comments.length === 0 ? (
              <p className="pd-no-comments">No comments yet — be the first to comment!</p>
            ) : (
              post.comments.map((comment) => {
                const cu = comment.user;
                const ci = getInitials(cu.name);
                return (
                  <div className="pd-comment-row" key={comment._id}>
                    <div 
                      className="pd-comment-avatar" 
                      style={{ 
                        backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)` 
                      }}
                    >
                      {ci}
                    </div>
                    <div className="pd-comment-bubble">
                      <p className="pd-comment-author">{cu.name}</p>
                      <p className="pd-comment-text">{comment.text}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Comment Input */}
          <div className="pd-input-row">
            <div 
              className="pd-my-avatar" 
              style={{ 
                backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)` 
              }}
            >
              {myInitials}
            </div>
            <input
              ref={commentRef}
              className="pd-comment-input"
              placeholder="Add a comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="pd-send-btn"
              onClick={handleComment}
              disabled={!commentText.trim() || loading}
            >
              ↑
            </button>
          </div>

        </div>
      </div>

      {/* Save to Boards Modal */}
      {showBoards && (
        <div className="pd-boards-backdrop" onClick={() => setShowBoards(false)}>
          <div className="pd-boards-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pd-modal-header">
              <h5>Save to board</h5>
              <button 
                className="pd-close-modal" 
                onClick={() => setShowBoards(false)}
              >
                ×
              </button>
            </div>
            <div className="pd-boards-list">
              {boards.map((board) => (
                <button 
                  key={board._id} 
                  className="pd-board-btn" 
                  onClick={() => saveToBoard(board._id)}
                >
                  <span>📌</span> 
                  {board.name} 
                  <span>({board.postCount || board.posts.length})</span>
                </button>
              ))}
            </div>
            <Link to="/boards/new" className="pd-new-board-btn">
              + Create new board
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default PostDetails;
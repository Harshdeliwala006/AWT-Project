import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { boardsAPI } from '../services/api'; // Your API service
import { useAuth } from '../context/AuthContext';

const boardStyles = `
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

  .board-page {
    font-family: 'DM Sans', sans-serif;
    padding: 36px 28px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .board-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 32px;
    gap: 16px;
    flex-wrap: wrap;
  }

  .board-title {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 600;
    color: var(--spark-ink);
    margin: 0 0 6px;
    letter-spacing: -0.5px;
  }

  .board-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 500;
    padding: 4px 12px;
    border-radius: 30px;
  }
  .board-badge.private {
    background: #F0EDFE;
    color: #534AB7;
  }
  .board-badge.public {
    background: #E1F5EE;
    color: #0F6E56;
  }

  .board-post-count {
    font-size: 13px;
    color: var(--spark-muted);
    margin-top: 4px;
  }

  .board-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    color: var(--spark-muted);
    padding: 7px 14px;
    border-radius: 30px;
    border: 1px solid var(--spark-border);
    transition: all 0.15s;
    white-space: nowrap;
  }
  .board-back-btn:hover {
    background: var(--spark-surface);
    color: var(--spark-ink);
  }

  .section-divider {
    width: 36px;
    height: 3px;
    background: var(--spark-coral);
    border-radius: 2px;
    margin-bottom: 1.5rem;
  }

  .board-empty {
    text-align: center;
    padding: 64px 24px;
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: var(--spark-radius);
  }
  .board-empty-icon { font-size: 40px; margin-bottom: 12px; }
  .board-empty-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem;
    color: var(--spark-ink);
    margin-bottom: 6px;
  }
  .board-empty-sub { font-size: 13px; color: var(--spark-muted); }

  .board-masonry { columns: 2; column-gap: 14px; }
  @media (min-width: 640px)  { .board-masonry { columns: 2; } }
  @media (min-width: 900px)  { .board-masonry { columns: 3; } }
  @media (min-width: 1200px) { .board-masonry { columns: 4; } }

  .board-post-card {
    break-inside: avoid;
    margin-bottom: 14px;
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: var(--spark-radius);
    overflow: hidden;
    transition: box-shadow 0.25s ease, transform 0.25s ease;
  }
  .board-post-card:hover {
    box-shadow: var(--spark-shadow-hover);
    transform: translateY(-3px);
  }

  .board-post-card img {
    width: 100%;
    display: block;
    object-fit: cover;
  }

  .board-post-body { padding: 10px 12px 12px; }

  .post-author-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .post-avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--spark-coral-soft);
    color: var(--spark-coral);
    font-size: 10px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .post-author-name {
    font-size: 12.5px;
    font-weight: 500;
    color: var(--spark-ink);
  }

  .post-caption {
    font-size: 13px;
    color: var(--spark-ink);
    line-height: 1.5;
    margin-bottom: 8px;
  }

  .post-likes {
    font-size: 12px;
    color: var(--spark-muted);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .btn-remove {
    display: flex;
    align-items: center;
    gap: 5px;
    background: transparent;
    color: #E24B4A;
    border: 1px solid #F7C1C1;
    border-radius: 30px;
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.15s;
    width: 100%;
    justify-content: center;
    margin-bottom: 10px;
  }
  .btn-remove:hover {
    background: #FCEBEB;
    border-color: #E24B4A;
  }

  .comments-section {
    border-top: 1px solid var(--spark-border);
    padding-top: 10px;
  }

  .comments-label {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--spark-muted);
    margin-bottom: 8px;
  }

  .comment-row {
    display: flex;
    gap: 6px;
    align-items: flex-start;
    margin-bottom: 6px;
  }

  .comment-avatar {
    width: 22px;
    height: 22px;
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

  .comment-body {
    font-size: 12px;
    color: var(--spark-ink);
    line-height: 1.4;
  }

  .comment-author {
    font-weight: 600;
    font-size: 11px;
  }

  .no-comments {
    font-size: 12px;
    color: var(--spark-muted);
    font-style: italic;
  }

  .board-not-found {
    font-family: 'DM Sans', sans-serif;
    text-align: center;
    padding: 80px 24px;
    color: var(--spark-muted);
  }
  .board-not-found h2 {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    color: var(--spark-ink);
    margin-bottom: 8px;
  }
`;

function BoardDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingPost, setRemovingPost] = useState(null);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        setLoading(true);
        setError('');
        
        const boardData = await boardsAPI.getBoardById(id);
        setBoard(boardData);
      } catch (err) {
        console.error('Error fetching board:', err);
        if (err.message.includes('404') || err.message.includes('not found')) {
          setError('Board not found');
        } else if (err.message.includes('403') || err.message.includes('private')) {
          setError('This board is private and you don\'t have access');
        } else {
          setError('Failed to load board. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [id]);

  const removePost = async (postId) => {
    if (!user) {
      setError('Please login to modify this board');
      return;
    }

    try {
      setRemovingPost(postId);
      setError('');
      
      await boardsAPI.removePostFromBoard(id, postId);

      setBoard(prev => ({
        ...prev,
        posts: prev.posts.filter(p => p._id !== postId)
      }));

    } catch (err) {
      console.error('Error removing post:', err);
      setError(err.message || 'Failed to remove post from board');
    } finally {
      setRemovingPost(null);
    }
  };

  if (loading) {
    return (
      <>
        <style>{boardStyles}</style>
        <div className="board-page">
          <div className="board-loading">
            <div className="loading-spinner"></div>
            <p>Loading board...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !board) {
    return (
      <>
        <style>{boardStyles}</style>
        <div className="board-page">
          <div className="board-not-found">
            <div className="board-not-found-icon">📋</div>
            <h2>{error || 'Board not found'}</h2>
            <p>This board may have been deleted or the link is incorrect.</p>
            <Link to="/boards" className="board-back-btn">
              ← Back to Boards
            </Link>
          </div>
        </div>
      </>
    );
  }

  const isOwner = user && board.user._id === user._id;

  return (
    <>
      <style>{boardStyles}</style>
      <div className="board-page">
        <div className="board-header">
          <div className="board-header-content">
            <h1 className="board-title">{board.name}</h1>
            <div className="board-meta">
              <span className={`board-badge ${board.isPrivate ? "private" : "public"}`}>
                {board.isPrivate ? "🔒 Private" : "🌐 Public"}
              </span>
              <span className="board-owner">
                by {board.user.name}
              </span>
              {board.description && (
                <p className="board-description">{board.description}</p>
              )}
            </div>
            <p className="board-post-count">
              {board.postCount || board.posts.length} post{board.postCount === 1 ? '' : 's'} saved
              {isOwner && <span className="board-owner-badge"> • 👑 Owner</span>}
            </p>
          </div>
          <div className="board-header-actions">
            <Link to="/boards" className="board-back-btn">
              ← All Boards
            </Link>
            {isOwner && (
              <Link to={`/boards/${id}/edit`} className="board-edit-btn">
                ✏️ Edit Board
              </Link>
            )}
          </div>
        </div>

        <div className="section-divider" />

        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')} className="close-error">
              ×
            </button>
          </div>
        )}

        {(!board.posts || board.posts.length === 0) ? (
          <div className="board-empty">
            <div className="board-empty-icon">📌</div>
            <h3 className="board-empty-title">Nothing saved here yet</h3>
            {isOwner ? (
              <>
                <p className="board-empty-sub">
                  Browse posts and save them to this board.
                </p>
                <Link to="/posts" className="board-empty-action">
                  Find Posts to Save →
                </Link>
              </>
            ) : (
              <p className="board-empty-sub">
                This board is empty. Ask the owner to add some posts.
              </p>
            )}
          </div>
        ) : (
          <div className="board-masonry">
            {board.posts.map((post) => {
              const postUser = post.user;
              const initials = postUser?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2) || "?";

              return (
                <article className="board-post-card" key={post._id}>
                  <div className="board-post-image-wrapper">
                    <img 
                      src={post.image} 
                      alt={post.caption} 
                      className="board-post-image"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x600/667eea/ffffff?text=No+Image';
                      }}
                    />
                  </div>

                  <div className="board-post-body">
                    <header className="post-author-row">
                      <div 
                        className="post-avatar" 
                        style={{ 
                          background: `hsl(${Math.random() * 360}, 70%, 50%)` 
                        }}
                      >
                      </div>
                      <div>
                        <h4 className="post-author-name">{postUser?.name}</h4>
                        {post.likeCount && (
                          <span className="post-likes-count">
                            ❤ {post.likeCount} like{post.likeCount === 1 ? '' : 's'}
                          </span>
                        )}
                      </div>
                    </header>
                    {post.caption && (
                      <p className="post-caption">{post.caption}</p>
                    )}
                    <div className="board-post-actions">
                      {isOwner && (
                        <button 
                          className={`btn-remove ${removingPost === post._id ? 'loading' : ''}`}
                          onClick={() => removePost(post._id)}
                          disabled={removingPost === post._id}
                          title="Remove from this board"
                        >
                          {removingPost === post._id ? (
                            <>
                              <span className="spinner"></span>
                              Removing...
                            </>
                          ) : (
                            <>
                              ✕ Remove
                            </>
                          )}
                        </button>
                      )}
                      <a 
                        href={`/posts/${post._id}`} 
                        className="btn-view-post"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        👁️ View Post
                      </a>
                    </div>

                    {post.comments?.length > 0 && (
                      <div className="comments-preview">
                        <div className="comments-header">
                          <span className="comments-label">
                            💬 {post.commentCount || post.comments.length} comment
                            {post.commentCount === 1 ? '' : 's'}
                          </span>
                        </div>
                        <div className="comments-list">
                          {post.comments.slice(0, 2).map((comment) => {
                            const cu = comment.user;
                            const ci = cu?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2) || "?";
                            return (
                              <div className="comment-row" key={comment._id}>
                                <div 
                                  className="comment-avatar"
                                  style={{ 
                                    background: `hsl(${Math.random() * 360}, 70%, 50%)` 
                                  }}
                                >
                                  {ci}
                                </div>
                                <div className="comment-body">
                                  <span className="comment-author">{cu?.name}</span>
                                  <span className="comment-text">{comment.text}</span>
                                </div>
                              </div>
                            );
                          })}
                          {post.comments.length > 2 && (
                            <div className="more-comments">
                              +{post.comments.length - 2} more...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default BoardDetails;
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { boardsAPI } from "../services/api"; // Your API service

const boardsStyles = `
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

  .boards-page {
    font-family: 'DM Sans', sans-serif;
    padding: 36px 28px;
    max-width: 1100px;
    margin: 0 auto;
  }

  .boards-page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 8px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .boards-page-title {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 600;
    color: var(--spark-ink);
    margin: 0;
    letter-spacing: -0.5px;
  }

  .boards-page-count {
    font-size: 13px;
    color: var(--spark-muted);
    margin: 4px 0 0;
  }

  .btn-new-board {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--spark-ink);
    color: white;
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    padding: 8px 18px;
    border-radius: 30px;
    border: none;
    cursor: pointer;
    transition: opacity 0.15s;
    white-space: nowrap;
  }
  .btn-new-board:hover { opacity: 0.82; color: white; }

  .section-divider {
    width: 36px;
    height: 3px;
    background: var(--spark-coral);
    border-radius: 2px;
    margin-bottom: 1.75rem;
  }

  .boards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
  }

  .board-card {
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: var(--spark-radius);
    overflow: hidden;
    transition: box-shadow 0.25s ease, transform 0.25s ease;
    display: flex;
    flex-direction: column;
  }
  .board-card:hover {
    box-shadow: var(--spark-shadow-hover);
    transform: translateY(-3px);
  }

  .board-preview {
    height: 140px;
    background: var(--spark-surface);
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 2px;
    overflow: hidden;
  }

  .board-preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .board-preview-placeholder {
    background: var(--spark-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    color: var(--spark-border);
  }

  .board-preview-empty {
    grid-column: 1 / -1;
    grid-row: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .board-preview-empty-icon { font-size: 28px; }
  .board-preview-empty-text {
    font-size: 12px;
    color: var(--spark-muted);
  }

  .board-card-body {
    padding: 14px 16px 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .board-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }

  .board-card-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--spark-ink);
    margin: 0;
    line-height: 1.3;
  }

  .board-badge {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 500;
    padding: 3px 10px;
    border-radius: 30px;
    white-space: nowrap;
  }
  .board-badge.private { background: #F0EDFE; color: #534AB7; }
  .board-badge.public  { background: #E1F5EE; color: #0F6E56; }

  .board-card-meta {
    font-size: 12px;
    color: var(--spark-muted);
  }

  .board-view-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    color: var(--spark-coral);
    padding: 7px 0;
    transition: gap 0.15s;
    margin-top: auto;
  }
  .board-view-link:hover { gap: 8px; color: var(--spark-coral); }
  .board-view-link-arrow { transition: transform 0.15s; }
  .board-view-link:hover .board-view-link-arrow { transform: translateX(3px); }

  .boards-empty {
    text-align: center;
    padding: 72px 24px;
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: var(--spark-radius);
  }
  .boards-empty-icon { font-size: 40px; margin-bottom: 12px; }
  .boards-empty-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem;
    color: var(--spark-ink);
    margin-bottom: 6px;
  }
  .boards-empty-sub { font-size: 13px; color: var(--spark-muted); }
`;

function Boards() {
  const { user, isAuthenticated } = useAuth();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBoards = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        const data = await boardsAPI.getMyBoards();
        setBoards(data);
      } catch (err) {
        console.error('Error fetching boards:', err);
        setError('Failed to load boards. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, [isAuthenticated]);

  const getBoardPreviews = (board) => {
    if (!board.posts?.length) return [];
    
    return board.posts
      .slice(0, 4)
      .map((post) => post.image)
      .filter(Boolean);
  };

  if (loading) {
    return (
      <>
        <style>{boardsStyles}</style>
        <div className="boards-page">
          <div className="boards-loading">
            <div className="loading-spinner"></div>
            <p>Loading your boards...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{boardsStyles}</style>
      <div className="boards-page">

        <div className="boards-page-header">
          <div>
            <h1 className="boards-page-title">
              {user ? `Hi ${user.name.split(' ')[0]}!` : 'My Boards'}
            </h1>
            <p className="boards-page-count">
              {boards.length} {boards.length === 1 ? "board" : "boards"}
            </p>
          </div>
          
          {isAuthenticated && (
            <Link to="/boards/new" className="btn-new-board">
              + New Board
            </Link>
          )}
        </div>

        <div className="section-divider" />

        {error && (
          <div className="boards-error">
            <span>⚠️ {error}</span>
            <button 
              onClick={() => setError('')} 
              className="close-error"
            >
              ×
            </button>
          </div>
        )}

        {boards.length === 0 ? (
          <div className="boards-empty">
            <div className="boards-empty-icon">📌</div>
            {isAuthenticated ? (
              <>
                <p className="boards-empty-title">No boards yet</p>
                <p className="boards-empty-sub">
                  Create your first board to start saving posts.
                </p>
                <Link to="/boards/new" className="boards-empty-action">
                  Create First Board →
                </Link>
              </>
            ) : (
              <>
                <p className="boards-empty-title">Log in to see your boards</p>
                <p className="boards-empty-sub">
                  Sign in to create and view your personal boards.
                </p>
                <Link to="/login" className="boards-empty-action">
                  Log In →
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="boards-grid">
            {boards.map((board) => {
              const previews = getBoardPreviews(board);
              const postCount = board.postCount || board.posts.length;

              return (
                <div className="board-card" key={board._id}>
                  <BoardPreview images={previews} />

                  <div className="board-card-body">
                    <div className="board-card-top">
                      <h3 className="board-card-name">{board.name}</h3>
                      <span className={`board-badge ${board.isPrivate ? "private" : "public"}`}>
                        {board.isPrivate ? "🔒 Private" : "🌐 Public"}
                      </span>
                    </div>

                    <p className="board-card-meta">
                      {postCount} {postCount === 1 ? "post" : "posts"} saved
                      {board.description && (
                        <span> • {board.description}</span>
                      )}
                    </p>

                    <Link to={`/boards/${board._id}`} className="board-view-link">
                      View board
                      <span className="board-view-link-arrow">→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function BoardPreview({ images }) {
  if (images.length === 0) {
    return (
      <div className="board-preview">
        <div className="board-preview-placeholder board-preview-empty">
          <span className="board-preview-empty-icon">📌</span>
          <span className="board-preview-empty-text">No posts yet</span>
        </div>
      </div>
    );
  }

  const slots = [...images, null, null, null].slice(0, 4);

  return (
    <div className="board-preview">
      {slots.map((src, i) =>
        src ? (
          <img 
            key={i} 
            src={src} 
            className="board-preview-img" 
            alt="" 
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/130x70/FAFAF8/CCCCCC?text=Post';
            }}
          />
        ) : (
          <div key={i} className="board-preview-placeholder" />
        )
      )}
    </div>
  );
}

export default Boards;
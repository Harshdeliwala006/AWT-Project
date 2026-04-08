import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { reelsAPI } from "../services/api"; // Your API service

const reelsStyles = `
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

  .reels-page {
    font-family: 'DM Sans', sans-serif;
    min-height: calc(100vh - 62px);
    background: #0D0D14;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
  }

  .reels-layout {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    width: 100%;
    max-width: 780px;
  }

  /* ── Video column ── */
  .reel-player-wrap {
    position: relative;
    width: 340px;
    flex-shrink: 0;
    border-radius: 20px;
    overflow: hidden;
    background: #000;
    aspect-ratio: 9/16;
    box-shadow: 0 24px 64px rgba(0,0,0,0.5);
  }

  .reel-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Gradient overlays */
  .reel-gradient-top {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 120px;
    background: linear-gradient(to bottom, rgba(0,0,0,0.55), transparent);
    pointer-events: none;
  }

  .reel-gradient-bottom {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 180px;
    background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
    pointer-events: none;
  }

  /* Nav counter pill */
  .reel-counter {
    position: absolute;
    top: 14px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(8px);
    color: white;
    font-size: 12px;
    font-weight: 500;
    padding: 4px 14px;
    border-radius: 30px;
    pointer-events: none;
  }

  /* Bottom info */
  .reel-info {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 16px;
    pointer-events: none;
  }

  .reel-title {
    font-family: 'Playfair Display', serif;
    font-size: 1rem;
    font-weight: 600;
    color: white;
    margin: 0 0 4px;
    text-shadow: 0 1px 4px rgba(0,0,0,0.4);
  }

  .reel-author {
    font-size: 12px;
    color: rgba(255,255,255,0.75);
    margin: 0;
  }

  /* Mute / play tap zone */
  .reel-tap-zone {
    position: absolute;
    inset: 0;
    cursor: pointer;
    z-index: 1;
  }

  /* Paused overlay */
  .reel-paused-icon {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 52px;
    opacity: 0;
    transition: opacity 0.15s;
    pointer-events: none;
    z-index: 2;
  }
  .reel-paused-icon.show { opacity: 1; }

  /* ── Side actions ── */
  .reel-side-actions {
    position: absolute;
    right: 12px;
    bottom: 90px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    z-index: 3;
  }

  .reel-action {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .reel-action-icon {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: background 0.15s, transform 0.1s;
    color: white;
  }
  .reel-action:hover .reel-action-icon { background: rgba(255,255,255,0.25); }
  .reel-action:active .reel-action-icon { transform: scale(0.88); }
  .reel-action.liked .reel-action-icon { background: rgba(255,107,107,0.35); }

  .reel-action-count {
    font-size: 11px;
    font-weight: 500;
    color: rgba(255,255,255,0.85);
  }

  /* ── Nav arrows ── */
  .reel-nav {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 3;
  }

  .reel-nav-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(8px);
    border: none;
    color: white;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s, opacity 0.15s;
  }
  .reel-nav-btn:hover { background: rgba(255,255,255,0.28); }
  .reel-nav-btn:disabled { opacity: 0.25; cursor: default; }

  /* ── Comments panel ── */
  .reel-comments-panel {
    flex: 1;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: calc(340px * (16/9));
    max-height: 610px;
    min-height: 400px;
  }

  .reel-panel-header {
    padding: 18px 18px 14px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .reel-panel-title {
    font-family: 'Playfair Display', serif;
    font-size: 1rem;
    font-weight: 600;
    color: white;
    margin: 0 0 4px;
  }

  .reel-panel-sub {
    font-size: 12px;
    color: rgba(255,255,255,0.45);
    margin: 0;
  }

  .reel-comments-list {
    flex: 1;
    overflow-y: auto;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.1) transparent;
  }

  .reel-no-comments {
    text-align: center;
    color: rgba(255,255,255,0.3);
    font-size: 13px;
    font-style: italic;
    padding: 24px 0;
  }

  .reel-comment-row {
    display: flex;
    gap: 9px;
    align-items: flex-start;
  }

  .reel-comment-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(255,107,107,0.25);
    color: var(--spark-coral);
    font-size: 10px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .reel-comment-bubble {
    background: rgba(255,255,255,0.07);
    border-radius: 0 12px 12px 12px;
    padding: 8px 12px;
    flex: 1;
  }

  .reel-comment-name {
    font-size: 11px;
    font-weight: 600;
    color: rgba(255,255,255,0.6);
    margin-bottom: 3px;
  }

  .reel-comment-text {
    font-size: 13px;
    color: rgba(255,255,255,0.9);
    line-height: 1.45;
  }

  /* Input */
  .reel-input-row {
    display: flex;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid rgba(255,255,255,0.08);
    align-items: center;
  }

  .reel-comment-input {
    flex: 1;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 30px;
    padding: 9px 16px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    color: white;
    outline: none;
    transition: border-color 0.15s;
  }
  .reel-comment-input::placeholder { color: rgba(255,255,255,0.3); }
  .reel-comment-input:focus { border-color: var(--spark-coral); }

  .reel-send-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--spark-coral);
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
  .reel-send-btn:hover:not(:disabled) { opacity: 0.82; }
  .reel-send-btn:active:not(:disabled) { transform: scale(0.92); }
  .reel-send-btn:disabled { opacity: 0.3; cursor: default; }

  /* Progress dots */
  .reel-dots {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin-top: 14px;
  }

  .reel-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    transition: background 0.2s, width 0.2s;
  }
  .reel-dot.active {
    background: var(--spark-coral);
    width: 20px;
    border-radius: 4px;
  }

  @media (max-width: 640px) {
    .reel-comments-panel { display: none; }
    .reels-layout { justify-content: center; }
    .reel-player-wrap { width: min(340px, 90vw); }
  }
`;

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function Reels() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [index, setIndex] = useState(0);
  const [reels, setReels] = useState([]);
  const [likedReels, setLikedReels] = useState({});
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState("");
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);

  // Fetch reels
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchReels = async () => {
      try {
        setLoading(true);
        const data = await reelsAPI.getReels({ page: 1, limit: 50 });
        setReels(data.reels);
        
        // Check which reels current user liked
        if (currentUser) {
          const liked = {};
          data.reels.forEach((reel, idx) => {
            liked[idx] = reel.likes.includes(currentUser._id);
          });
          setLikedReels(liked);
        }
      } catch (error) {
        console.error('Failed to fetch reels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, [isAuthenticated, currentUser]);

  // Auto-play on index change
  useEffect(() => {
    if (!reels[index] || !videoRef.current) return;
    
    const video = videoRef.current;
    video.load();
    video.play().catch(() => {});
    setPaused(false);
  }, [index, reels]);

  const currentReel = reels[index];

  const togglePlay = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    if (video.paused) {
      video.play();
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  };

  const goNext = () => { 
    if (index < reels.length - 1) setIndex(index + 1); 
  };

  const goPrev = () => { 
    if (index > 0) setIndex(index - 1); 
  };

  // Like reel
  const handleLike = async () => {
    if (!currentUser) return;
    
    try {
      await reelsAPI.likeReel(currentReel._id);
      
      // Optimistically update
      setLikedReels(prev => ({
        ...prev,
        [index]: !prev[index]
      }));
      
      setReels(prev => prev.map((r, i) => 
        i === index 
          ? { ...r, likeCount: prev[index].likes.includes(currentUser._id) ? r.likeCount - 1 : r.likeCount + 1 }
          : r
      ));
    } catch (error) {
      console.error('Like failed:', error);
    }
  };

  // Add comment
  const handleComment = async () => {
    const text = commentText.trim();
    if (!text || !currentUser) return;

    try {
      await reelsAPI.commentOnReel(currentReel._id, { text });
      
      // Add optimistic comment
      const newComment = {
        _id: Date.now().toString(),
        text,
        user: currentUser,
        createdAt: new Date().toISOString()
      };
      
      setComments(prev => ({
        ...prev,
        [index]: [...(prev[index] || []), newComment]
      }));
      
      setCommentText("");
      
    } catch (error) {
      console.error('Comment failed:', error);
    }
  };

  const currentComments = comments[index] || [];

  if (!isAuthenticated) {
    return (
      <div className="reels-page">
        <div className="reels-empty">
          <div className="reels-empty-icon">🔒</div>
          <p className="reels-empty-title">Log in to watch reels</p>
          <p className="reels-empty-sub">Sign in to enjoy SparkNest reels.</p>
        </div>
      </div>
    );
  }

  if (loading && reels.length === 0) {
    return (
      <div className="reels-page">
        <div className="reels-loading">
          <div className="loading-spinner"></div>
          <p>Loading reels...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{reelsStyles}</style>
      <div className="reels-page">
        <div style={{ width: "100%", maxWidth: 780 }}>
          <div className="reels-layout">

            {/* ── Video player ── */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div className="reel-player-wrap">
                {currentReel ? (
                  <>
                    <video
                      ref={videoRef}
                      src={currentReel.video}
                      poster={currentReel.thumbnail}
                      className="reel-video"
                      loop
                      playsInline
                      muted={currentReel.muted || false}
                      preload="metadata"
                    />

                    <div className="reel-gradient-top" />
                    <div className="reel-gradient-bottom" />

                    {/* Tap to pause */}
                    <div className="reel-tap-zone" onClick={togglePlay} />

                    {/* Paused icon */}
                    <div className={`reel-paused-icon${paused ? " show" : ""}`}>▶</div>

                    {/* Counter */}
                    <div className="reel-counter">
                      {index + 1} / {reels.length}
                    </div>

                    {/* Bottom info */}
                    <div className="reel-info">
                      <Link to={`/users/${currentReel.user._id}`} className="reel-author-link">
                        <p className="reel-author">{currentReel.user.name}</p>
                      </Link>
                      {currentReel.title && (
                        <p className="reel-title">{currentReel.title}</p>
                      )}
                    </div>

                    {/* Side actions */}
                    <div className="reel-side-actions">
                      <button
                        className={`reel-action${likedReels[index] ? " liked" : ""}`}
                        onClick={handleLike}
                        disabled={!currentUser}
                        title={currentUser ? "Like reel" : "Log in to like"}
                      >
                        <div className="reel-action-icon">
                          {likedReels[index] ? "❤" : "🤍"}
                        </div>
                        <span className="reel-action-count">{currentReel.likeCount}</span>
                      </button>

                      <button 
                        className="reel-action" 
                        onClick={() => document.getElementById("reel-input")?.focus()}
                        disabled={!currentUser}
                        title={currentUser ? "Comment" : "Log in to comment"}
                      >
                        <div className="reel-action-icon">💬</div>
                        <span className="reel-action-count">
                          {currentReel.commentCount}
                        </span>
                      </button>

                      <Link 
                        to={`/reels/${currentReel._id}`} 
                        className="reel-action"
                      >
                        <div className="reel-action-icon">↗</div>
                        <span className="reel-action-count">Share</span>
                      </Link>
                    </div>

                    {/* Nav arrows */}
                    <div className="reel-nav">
                      <button 
                        className="reel-nav-btn prev" 
                        onClick={goPrev} 
                        disabled={index === 0}
                        title="Previous reel"
                      >
                        ▲
                      </button>
                      <button 
                        className="reel-nav-btn next" 
                        onClick={goNext} 
                        disabled={index === reels.length - 1}
                        title="Next reel"
                      >
                        ▼
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="reel-empty">
                    <div className="reel-empty-icon">🎬</div>
                    <p>No reels available</p>
                  </div>
                )}
              </div>

              {/* Progress dots */}
              <div className="reel-dots">
                {reels.map((_, i) => (
                  <div
                    key={i}
                    className={`reel-dot${i === index ? " active" : ""}`}
                    onClick={() => setIndex(i)}
                    title={`Reel ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* ── Comments panel ── */}
            <div className="reel-comments-panel">
              <div className="reel-panel-header">
                <Link to={`/reels/${currentReel?._id}`} className="reel-panel-title">
                  {currentReel?.title || `Reel ${index + 1}`}
                </Link>
                <p className="reel-panel-sub">
                  {currentReel?.user?.name} · {currentReel?.viewCount || 0} views
                </p>
              </div>

              <div className="reel-comments-list">
                {currentComments.length === 0 ? (
                  <p className="reel-no-comments">
                    {currentUser ? "No comments yet — start the conversation!" : "Log in to comment"}
                  </p>
                ) : (
                  currentComments.map((comment) => (
                    <div className="reel-comment-row" key={comment._id}>
                      <div 
                        className="reel-comment-avatar"
                        style={{ backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)` }}
                      >
                        {getInitials(comment.user.name)}
                      </div>
                      <div className="reel-comment-bubble">
                        <p className="reel-comment-name">{comment.user.name}</p>
                        <p className="reel-comment-text">{comment.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="reel-input-row">
                <input
                  id="reel-input"
                  className="reel-comment-input"
                  placeholder={currentUser ? "Add a comment…" : "Log in to comment"}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleComment();
                    }
                  }}
                  disabled={!currentUser}
                />
                <button
                  className="reel-send-btn"
                  onClick={handleComment}
                  disabled={!currentUser || !commentText.trim()}
                  title={currentUser ? "Post comment" : "Log in to comment"}
                >
                  ↑
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default Reels;
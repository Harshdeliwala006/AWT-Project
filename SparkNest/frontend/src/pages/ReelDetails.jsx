import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { reelsAPI } from "../services/api";

const reelDetailsStyles = `
  :root {
    --spark-coral: #FF6B6B;
    --spark-ink: #1A1A2E;
    --spark-muted: #6B7080;
    --spark-surface: #F8F7F4;
    --spark-white: #FFFFFF;
    --spark-border: #E8E8E8;
    --spark-radius: 20px;
  }

  .rd-page {
    min-height: calc(100vh - 62px);
    background: var(--spark-surface);
    padding: 32px 20px;
    display: flex;
    justify-content: center;
  }

  .rd-card {
    width: min(980px, 100%);
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 24px;
  }

  .rd-panel,
  .rd-comments {
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: var(--spark-radius);
    box-shadow: 0 18px 40px rgba(17, 23, 36, 0.06);
    overflow: hidden;
  }

  .rd-panel {
    padding: 24px;
  }

  .rd-back {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--spark-ink);
    font-weight: 600;
    margin-bottom: 18px;
    text-decoration: none;
  }

  .rd-video-wrap {
    border-radius: 20px;
    overflow: hidden;
    background: #000;
  }

  .rd-video {
    width: 100%;
    height: auto;
    max-height: 640px;
    display: block;
  }

  .rd-meta {
    margin-top: 20px;
  }

  .rd-title {
    font-size: 1.8rem;
    margin: 0 0 10px;
    color: var(--spark-ink);
  }

  .rd-description {
    margin: 18px 0 0;
    line-height: 1.7;
    color: var(--spark-muted);
  }

  .rd-author-row {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 18px 0;
  }

  .rd-author-avatar {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: var(--spark-coral);
    color: var(--spark-white);
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: 0.95rem;
  }

  .rd-author-info {
    display: grid;
    gap: 4px;
  }

  .rd-author-name {
    font-weight: 700;
    color: var(--spark-ink);
    margin: 0;
  }

  .rd-author-meta {
    font-size: 13px;
    color: var(--spark-muted);
    margin: 0;
  }

  .rd-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 14px;
    color: var(--spark-muted);
    font-size: 13px;
  }

  .rd-comments {
    display: flex;
    flex-direction: column;
    min-height: 400px;
  }

  .rd-comments-header {
    padding: 22px 24px 16px;
    border-bottom: 1px solid var(--spark-border);
  }

  .rd-comments-title {
    margin: 0;
    font-size: 1.1rem;
    color: var(--spark-ink);
  }

  .rd-comments-body {
    padding: 16px 24px 24px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .rd-comment-row {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 12px;
    align-items: start;
  }

  .rd-comment-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--spark-coral);
    color: white;
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: 0.85rem;
  }

  .rd-comment-content {
    background: #F8F7F4;
    border-radius: 16px;
    padding: 12px 14px;
  }

  .rd-comment-name {
    font-weight: 700;
    margin: 0 0 6px;
    color: var(--spark-ink);
  }

  .rd-comment-text {
    margin: 0;
    color: var(--spark-muted);
    line-height: 1.6;
  }

  .rd-comment-input-row {
    display: grid;
    gap: 10px;
  }

  .rd-comment-input {
    width: 100%;
    min-height: 60px;
    padding: 14px 16px;
    border-radius: 16px;
    border: 1px solid var(--spark-border);
    resize: vertical;
    font-family: inherit;
    font-size: 14px;
    color: var(--spark-ink);
    background: var(--spark-surface);
    outline: none;
  }

  .rd-comment-submit {
    width: fit-content;
    padding: 12px 18px;
    border-radius: 14px;
    border: none;
    background: var(--spark-ink);
    color: white;
    cursor: pointer;
    font-weight: 600;
  }

  .rd-empty {
    padding: 36px 24px;
    text-align: center;
    color: var(--spark-muted);
  }

  .rd-error {
    padding: 26px 24px;
    color: #B00020;
    background: #FCE8E8;
    border-radius: 16px;
    border: 1px solid #F4C2C2;
  }

  @media (max-width: 900px) {
    .rd-card {
      grid-template-columns: 1fr;
    }
  }
`;

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ReelDetails() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [reel, setReel] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReel = async () => {
      if (!id) return;
      setLoading(true);
      setError("");

      try {
        const data = await reelsAPI.getReelById(id);
        setReel(data);
      } catch (err) {
        console.error("Failed to load reel:", err);
        setError(err.message || "Unable to load this reel.");
      } finally {
        setLoading(false);
      }
    };

    loadReel();
  }, [id]);

  const handleComment = async () => {
    const text = commentText.trim();
    if (!text || !user) return;

    try {
      const updatedReel = await reelsAPI.commentOnReel(id, { text });
      setReel(updatedReel);
      setCommentText("");
    } catch (err) {
      console.error("Comment failed:", err);
      setError(err.message || "Unable to add comment.");
    }
  };

  if (loading) {
    return (
      <div className="rd-page">
        <div className="rd-card">
          <div className="rd-panel">
            <div className="rd-empty">Loading reel...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rd-page">
        <div className="rd-card">
          <div className="rd-panel rd-error">{error}</div>
        </div>
      </div>
    );
  }

  if (!reel) {
    return (
      <div className="rd-page">
        <div className="rd-card">
          <div className="rd-panel rd-empty">Reel not found.</div>
        </div>
      </div>
    );
  }

  const commentCount = reel.comments?.length || 0;
  const createdAt = new Date(reel.createdAt).toLocaleDateString();

  return (
    <>
      <style>{reelDetailsStyles}</style>
      <div className="rd-page">
        <div className="rd-card">
          <div className="rd-panel">
            <Link to="/reels" className="rd-back">
              ← Back to reels
            </Link>

            <div className="rd-video-wrap">
              <video
                className="rd-video"
                controls
                src={reel.video}
                poster={reel.thumbnail}
              />
            </div>

            <div className="rd-meta">
              <h1 className="rd-title">{reel.title || "Untitled Reel"}</h1>
              <div className="rd-author-row">
                {reel.user?.profilePic ? (
                  <img
                    src={reel.user.profilePic}
                    alt={reel.user.name}
                    className="rd-author-avatar"
                  />
                ) : (
                  <div className="rd-author-avatar">
                    {getInitials(reel.user?.name)}
                  </div>
                )}
                <div className="rd-author-info">
                  <p className="rd-author-name">{reel.user?.name || "Unknown"}</p>
                  <p className="rd-author-meta">
                    {reel.user?.email || "No email"} · {createdAt}
                  </p>
                </div>
              </div>

              <div className="rd-stats">
                <span>{reel.views || 0} views</span>
                <span>{reel.likes?.length || 0} likes</span>
                <span>{commentCount} comments</span>
              </div>

              <p className="rd-description">{reel.caption || "No description provided."}</p>
            </div>
          </div>

          <div className="rd-comments">
            <div className="rd-comments-header">
              <h2 className="rd-comments-title">Comments</h2>
            </div>
            <div className="rd-comments-body">
              {commentCount === 0 ? (
                <div className="rd-empty">No comments yet. Be the first to comment.</div>
              ) : (
                reel.comments.map((comment) => (
                  <div key={comment._id || comment.createdAt} className="rd-comment-row">
                    <div className="rd-comment-avatar">
                      {getInitials(comment.user?.name || comment.user?.email || "U")}
                    </div>
                    <div className="rd-comment-content">
                      <p className="rd-comment-name">{comment.user?.name || comment.user?.email}</p>
                      <p className="rd-comment-text">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}

              {!isAuthenticated ? (
                <div className="rd-empty">
                  Log in to add a comment and interact with this reel.
                </div>
              ) : (
                <div className="rd-comment-input-row">
                  <textarea
                    className="rd-comment-input"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                  />
                  <button
                    className="rd-comment-submit"
                    onClick={handleComment}
                    disabled={!commentText.trim()}
                  >
                    Post comment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ReelDetails;

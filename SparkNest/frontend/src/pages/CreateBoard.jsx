import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { boardsAPI } from "../services/api"; // Your API service

const createBoardStyles = `
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

  .cb-page {
    font-family: 'DM Sans', sans-serif;
    min-height: calc(100vh - 62px);
    background: var(--spark-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
  }

  .cb-card {
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: var(--spark-radius);
    padding: 40px 36px;
    width: 100%;
    max-width: 460px;
    box-shadow: 0 4px 32px rgba(26,26,46,0.07);
  }

  .cb-icon-wrap {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: var(--spark-coral-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: 18px;
  }

  .cb-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--spark-ink);
    margin: 0 0 6px;
    letter-spacing: -0.4px;
  }

  .cb-subtitle {
    font-size: 13.5px;
    color: var(--spark-muted);
    margin: 0 0 28px;
    line-height: 1.5;
  }

  .cb-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: var(--spark-ink);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 7px;
  }

  .cb-input {
    width: 100%;
    background: var(--spark-surface);
    border: 1px solid var(--spark-border);
    border-radius: 12px;
    padding: 11px 16px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    color: var(--spark-ink);
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.15s, box-shadow 0.15s;
    margin-bottom: 6px;
  }
  .cb-input:focus {
    border-color: var(--spark-coral);
    box-shadow: 0 0 0 3px rgba(255,107,107,0.12);
  }
  .cb-input::placeholder { color: #BEBDBA; }

  .cb-char-count {
    font-size: 11.5px;
    color: var(--spark-muted);
    text-align: right;
    margin-bottom: 20px;
  }
  .cb-char-count.over { color: #E24B4A; }

  .cb-privacy-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--spark-surface);
    border: 1px solid var(--spark-border);
    border-radius: 12px;
    padding: 13px 16px;
    margin-bottom: 28px;
    cursor: pointer;
    transition: border-color 0.15s;
  }
  .cb-privacy-row:hover { border-color: #d5d5d5; }

  .cb-privacy-label-wrap { display: flex; flex-direction: column; gap: 2px; }
  .cb-privacy-label { font-size: 14px; font-weight: 500; color: var(--spark-ink); }
  .cb-privacy-desc { font-size: 12px; color: var(--spark-muted); }

  .cb-toggle {
    width: 42px;
    height: 24px;
    border-radius: 30px;
    background: var(--spark-border);
    position: relative;
    transition: background 0.2s;
    flex-shrink: 0;
  }
  .cb-toggle.on { background: var(--spark-ink); }

  .cb-toggle-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: white;
    position: absolute;
    top: 3px;
    left: 3px;
    transition: transform 0.2s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  }
  .cb-toggle.on .cb-toggle-thumb { transform: translateX(18px); }

  .cb-divider { height: 1px; background: var(--spark-border); margin-bottom: 24px; }

  .cb-actions { display: flex; gap: 10px; }

  .cb-cancel-btn {
    flex: 1;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid var(--spark-border);
    background: transparent;
    font-size: 14px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    color: var(--spark-muted);
    cursor: pointer;
    transition: all 0.15s;
  }
  .cb-cancel-btn:hover {
    background: var(--spark-surface);
    color: var(--spark-ink);
    border-color: #d5d5d5;
  }

  .cb-submit-btn {
    flex: 2;
    padding: 12px;
    border-radius: 12px;
    border: none;
    background: var(--spark-ink);
    color: white;
    font-size: 14px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
  }
  .cb-submit-btn:hover:not(:disabled) { opacity: 0.82; }
  .cb-submit-btn:active:not(:disabled) { transform: scale(0.98); }
  .cb-submit-btn:disabled { opacity: 0.38; cursor: default; }

  .cb-toast {
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%) translateY(80px);
    background: var(--spark-ink);
    color: white;
    padding: 12px 22px;
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
  .cb-toast.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
`;

const MAX_LENGTH = 40;

function CreateBoard() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const charOver = name.length > MAX_LENGTH;
  const canSubmit = name.trim().length > 0 && !charOver && !loading;

  const createBoard = async () => {
    if (!canSubmit) return;

    try {
      setLoading(true);
      setError("");
      
      // Use your backend API
      const newBoard = await boardsAPI.createBoard({
        name: name.trim(),
        description: description.trim(),
        isPrivate
      });

      setShowToast(true);
      
      // Success - redirect after toast
      setTimeout(() => {
        setShowToast(false);
        navigate("/boards");
      }, 2000);

      // Reset form
      setName("");
      setDescription("");
      setIsPrivate(false);

    } catch (err) {
      console.error('Create board failed:', err);
      setError(err.message || 'Failed to create board. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && canSubmit) {
      e.preventDefault();
      createBoard();
    }
  };

  return (
    <>
      <style>{createBoardStyles}</style>
      <div className="cb-page">
        <div className="cb-card">

          <div className="cb-icon-wrap">📌</div>

          <h1 className="cb-title">New Board</h1>
          <p className="cb-subtitle">
            Organise and curate posts you love into a collection.
          </p>

          {/* Error Message */}
          {error && (
            <div className="cb-error">
              <span>⚠️ {error}</span>
              <button 
                onClick={() => setError("")} 
                className="cb-error-close"
              >
                ×
              </button>
            </div>
          )}

          {/* Name Field */}
          <label className="cb-label" htmlFor="board-name">
            Board name <span className="cb-required">*</span>
          </label>
          <input
            id="board-name"
            className="cb-input"
            placeholder="e.g. Design Inspiration"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={MAX_LENGTH}
            disabled={loading}
            autoFocus
          />
          <p className={`cb-char-count${charOver ? " over" : ""}`}>
            {name.length}/{MAX_LENGTH}
          </p>

          {/* Description Field */}
          <label className="cb-label" htmlFor="board-desc">Description (optional)</label>
          <textarea
            id="board-desc"
            className="cb-input"
            placeholder="A short description of what this board is about..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            disabled={loading}
            style={{ resize: 'vertical', minHeight: '80px' }}
          />

          {/* Privacy Toggle */}
          <div 
            className="cb-privacy-row" 
            onClick={() => !loading && setIsPrivate((v) => !v)}
            title={loading ? "Creating board..." : "Toggle privacy"}
          >
            <div className="cb-privacy-label-wrap">
              <span className="cb-privacy-label">
                {isPrivate ? "🔒 Private" : "🌐 Public"}
              </span>
              <span className="cb-privacy-desc">
                {isPrivate
                  ? "Only you can see this board"
                  : "Anyone on SparkNest can see this board"}
              </span>
            </div>
            <div className={`cb-toggle${isPrivate ? " on" : ""}`}>
              <div className="cb-toggle-thumb" />
            </div>
          </div>

          <div className="cb-divider" />

          {/* Actions */}
          <div className="cb-actions">
            <button 
              className="cb-cancel-btn" 
              onClick={() => navigate("/boards")}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="cb-submit-btn"
              onClick={createBoard}
              disabled={!canSubmit}
            >
              {loading ? (
                <>
                  <span className="cb-spinner"></span>
                  Creating...
                </>
              ) : (
                "Create Board"
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Success Toast */}
      <div className={`cb-toast${showToast ? " show" : ""}`}>
        ✓ Board "{name}" created successfully!
      </div>
    </>
  );
}

export default CreateBoard;
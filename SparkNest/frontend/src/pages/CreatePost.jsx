import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postsAPI } from "../services/api"; // Your API service

const createPostStyles = `
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

  .cp-page {
    font-family: 'DM Sans', sans-serif;
    min-height: calc(100vh - 62px);
    background: var(--spark-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
  }

  .cp-card {
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: var(--spark-radius);
    padding: 40px 36px;
    width: 100%;
    max-width: 520px;
    box-shadow: 0 4px 32px rgba(26,26,46,0.07);
  }

  .cp-icon-wrap {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: #F0EDFE;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: 18px;
  }

  .cp-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--spark-ink);
    margin: 0 0 6px;
    letter-spacing: -0.4px;
  }

  .cp-subtitle {
    font-size: 13.5px;
    color: var(--spark-muted);
    margin: 0 0 28px;
    line-height: 1.5;
  }

  /* Image attachment zone */
  .cp-attach-zone {
    border: 2px dashed var(--spark-border);
    border-radius: 14px;
    padding: 22px;
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    background: var(--spark-surface);
    margin-bottom: 20px;
    position: relative;
  }
  .cp-attach-zone:hover,
  .cp-attach-zone.dragging {
    border-color: var(--spark-coral);
    background: var(--spark-coral-soft);
  }
  .cp-attach-zone input[type="file"] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }

  .cp-attach-icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    pointer-events: none;
  }

  .cp-attach-text { pointer-events: none; }
  .cp-attach-label { font-size: 13.5px; font-weight: 500; color: var(--spark-ink); margin: 0 0 2px; }
  .cp-attach-sub   { font-size: 12px; color: var(--spark-muted); margin: 0; }

  /* Image preview strip */
  .cp-image-preview {
    position: relative;
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 20px;
    border: 1px solid var(--spark-border);
  }
  .cp-image-preview img {
    width: 100%;
    max-height: 240px;
    object-fit: cover;
    display: block;
  }
  .cp-remove-img {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: rgba(26,26,46,0.7);
    color: white;
    border: none;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }
  .cp-remove-img:hover { background: rgba(26,26,46,0.9); }

  /* Label */
  .cp-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: var(--spark-ink);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 7px;
  }

  /* Textarea */
  .cp-textarea {
    width: 100%;
    background: var(--spark-surface);
    border: 1px solid var(--spark-border);
    border-radius: 12px;
    padding: 13px 16px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    color: var(--spark-ink);
    outline: none;
    box-sizing: border-box;
    resize: none;
    line-height: 1.6;
    transition: border-color 0.15s, box-shadow 0.15s;
    margin-bottom: 6px;
  }
  .cp-textarea:focus {
    border-color: var(--spark-coral);
    box-shadow: 0 0 0 3px rgba(255,107,107,0.12);
  }
  .cp-textarea::placeholder { color: #BEBDBA; }

  .cp-char-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .cp-char-count { font-size: 11.5px; color: var(--spark-muted); }
  .cp-char-count.over { color: #E24B4A; }

  /* Tags */
  .cp-tags-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-bottom: 20px;
  }

  .cp-tag-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: var(--spark-surface);
    border: 1px solid var(--spark-border);
    border-radius: 30px;
    padding: 5px 12px;
    font-size: 12.5px;
    font-weight: 500;
    color: var(--spark-muted);
    cursor: pointer;
    transition: all 0.15s;
  }
  .cp-tag-pill:hover,
  .cp-tag-pill.selected {
    background: var(--spark-coral-soft);
    border-color: var(--spark-coral);
    color: var(--spark-coral);
  }

  .cp-divider { height: 1px; background: var(--spark-border); margin-bottom: 24px; }

  .cp-actions { display: flex; gap: 10px; }

  .cp-cancel-btn {
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
  .cp-cancel-btn:hover {
    background: var(--spark-surface);
    color: var(--spark-ink);
    border-color: #d5d5d5;
  }

  .cp-submit-btn {
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
  .cp-submit-btn:hover:not(:disabled) { opacity: 0.82; }
  .cp-submit-btn:active:not(:disabled) { transform: scale(0.98); }
  .cp-submit-btn:disabled { opacity: 0.38; cursor: default; }

  .cp-toast {
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
  .cp-toast.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
`;

const MAX_LENGTH = 280;
const SUGGESTED_TAGS = ["Design", "Photography", "Travel", "Food", "Art", "Tech", "Fashion", "Nature"];

function CreatePost() {
  const { user } = useAuth();
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const charOver = caption.length > MAX_LENGTH;
  const canSubmit = caption.trim().length > 0 && !charOver && image && !loading;

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP)");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  }, []);

  const handleChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const toggleTag = (tag) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;

    try {
      setLoading(true);
      setError("");

      // Handle image if present
      let imageUrl = "";
      if (image) {
        const reader = new FileReader();
        await new Promise((resolve) => {
          reader.onloadend = () => {
            imageUrl = reader.result; // Keep full data:image/...;base64,... string
            resolve(null);
          };
          reader.readAsDataURL(image);
        });
      }

      // Use your backend Posts API
      const newPost = await postsAPI.createPost({
        caption: caption.trim(),
        image: imageUrl,
        tags: selectedTags
      });

      setShowToast(true);
      
      // Success - cleanup & redirect
      setTimeout(() => {
        setShowToast(false);
        if (preview) URL.revokeObjectURL(preview);
        navigate(`/posts/${newPost._id}`); // Go to new post
      }, 2000);

      // Reset form
      setCaption("");
      setImage(null);
      setPreview(null);
      setSelectedTags([]);

    } catch (err) {
      console.error('Post creation failed:', err);
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && canSubmit) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      <style>{createPostStyles}</style>
      <div className="cp-page">
        <div className="cp-card">

          <div className="cp-icon-wrap">✏️</div>
          <h1 className="cp-title">Create Post</h1>
          <p className="cp-subtitle">Share a thought, story, or moment with your followers.</p>

          {/* Error Message */}
          {error && (
            <div className="cp-error">
              <span>{error}</span>
              <button 
                onClick={() => setError("")} 
                className="cp-error-close"
              >
                ×
              </button>
            </div>
          )}

          {/* Image attachment (required) */}
          {!preview ? (
            <div
              className={`cp-attach-zone${dragging ? " dragging" : ""}`}
              onDragOver={(e) => { 
                e.preventDefault(); 
                setDragging(true); 
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                disabled={loading}
              />
              <div className="cp-attach-icon">📎</div>
              <div className="cp-attach-text">
                <p className="cp-attach-label">Attach an image (required)</p>
                <p className="cp-attach-sub">Drag & drop or click to browse</p>
              </div>
            </div>
          ) : (
            <div className="cp-image-preview">
              <img src={preview} alt="Attached" />
              <button
                className="cp-remove-img"
                onClick={removeImage}
                title="Remove image"
                disabled={loading}
              >
                ✕
              </button>
            </div>
          )}

          {/* Caption */}
          <label className="cp-label" htmlFor="cp-caption">
            Caption <span className="cp-required">*</span>
          </label>
          <textarea
            id="cp-caption"
            className="cp-textarea"
            placeholder="What's on your mind?"
            value={caption}
            rows={5}
            onChange={(e) => setCaption(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={MAX_LENGTH}
            disabled={loading}
            autoFocus={!preview}
          />
          <div className="cp-char-row">
            <span />
            <span className={`cp-char-count${charOver ? " over" : ""}`}>
              {caption.length}/{MAX_LENGTH}
            </span>
          </div>

          {/* Tags */}
          <label className="cp-label">Tags</label>
          <div className="cp-tags-wrap">
            {SUGGESTED_TAGS.map((tag) => (
              <button
                key={tag}
                className={`cp-tag-pill${selectedTags.includes(tag) ? " selected" : ""}`}
                onClick={() => toggleTag(tag)}
                disabled={loading}
              >
                {selectedTags.includes(tag) ? "✓" : "#"} {tag}
              </button>
            ))}
          </div>

          <div className="cp-divider" />

          <div className="cp-actions">
            <button 
              className="cp-cancel-btn" 
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="cp-submit-btn"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {loading ? (
                <>
                  <span className="cp-spinner"></span>
                  Publishing...
                </>
              ) : (
                `Publish Post${selectedTags.length > 0 ? ` + ${selectedTags.length} tag${selectedTags.length === 1 ? '' : 's'}` : ''}`
              )}
            </button>
          </div>

        </div>
      </div>

      <div className={`cp-toast${showToast ? " show" : ""}`}>
        ✓ Post published successfully!
      </div>
    </>
  );
}

export default CreatePost;
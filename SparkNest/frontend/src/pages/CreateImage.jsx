import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postsAPI } from "../services/api"; // Your API service

const createImageStyles = `
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

  .ci-page {
    font-family: 'DM Sans', sans-serif;
    min-height: calc(100vh - 62px);
    background: var(--spark-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
  }

  .ci-card {
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: var(--spark-radius);
    padding: 40px 36px;
    width: 100%;
    max-width: 520px;
    box-shadow: 0 4px 32px rgba(26,26,46,0.07);
  }

  .ci-icon-wrap {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: #E1F5EE;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: 18px;
  }

  .ci-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--spark-ink);
    margin: 0 0 6px;
    letter-spacing: -0.4px;
  }

  .ci-subtitle {
    font-size: 13.5px;
    color: var(--spark-muted);
    margin: 0 0 28px;
    line-height: 1.5;
  }

  /* Drop zone */
  .ci-dropzone {
    border: 2px dashed var(--spark-border);
    border-radius: 14px;
    padding: 36px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    background: var(--spark-surface);
    text-align: center;
    margin-bottom: 20px;
    position: relative;
  }
  .ci-dropzone:hover,
  .ci-dropzone.dragging {
    border-color: var(--spark-coral);
    background: var(--spark-coral-soft);
  }
  .ci-dropzone input[type="file"] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }

  .ci-drop-icon { font-size: 32px; }

  .ci-drop-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--spark-ink);
    margin: 0;
  }

  .ci-drop-sub {
    font-size: 12px;
    color: var(--spark-muted);
    margin: 0;
  }

  .ci-drop-btn {
    display: inline-block;
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: 30px;
    padding: 6px 16px;
    font-size: 12.5px;
    font-weight: 500;
    color: var(--spark-ink);
    margin-top: 4px;
    pointer-events: none;
  }

  /* Preview */
  .ci-preview {
    position: relative;
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 20px;
    border: 1px solid var(--spark-border);
  }

  .ci-preview img {
    width: 100%;
    max-height: 280px;
    object-fit: cover;
    display: block;
  }

  .ci-preview-overlay {
    position: absolute;
    inset: 0;
    background: rgba(26,26,46,0);
    transition: background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ci-preview:hover .ci-preview-overlay { background: rgba(26,26,46,0.35); }

  .ci-change-btn {
    opacity: 0;
    background: white;
    border: none;
    border-radius: 30px;
    padding: 8px 18px;
    font-size: 13px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: opacity 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .ci-preview:hover .ci-change-btn { opacity: 1; }

  .ci-file-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--spark-surface);
    border: 1px solid var(--spark-border);
    border-radius: 10px;
    padding: 10px 14px;
    margin-bottom: 20px;
  }

  .ci-file-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--spark-ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 260px;
  }

  .ci-file-size {
    font-size: 12px;
    color: var(--spark-muted);
    flex-shrink: 0;
  }

  /* Label */
  .ci-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: var(--spark-ink);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 7px;
  }
  .ci-required { color: #E24B4A; }

  .ci-input {
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
    margin-bottom: 20px;
  }
  .ci-input:focus {
    border-color: var(--spark-coral);
    box-shadow: 0 0 0 3px rgba(255,107,107,0.12);
  }
  .ci-input::placeholder { color: #BEBDBA; }

  .ci-divider { height: 1px; background: var(--spark-border); margin-bottom: 24px; }

  .ci-actions { display: flex; gap: 10px; }

  .ci-cancel-btn {
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
  .ci-cancel-btn:hover {
    background: var(--spark-surface);
    color: var(--spark-ink);
    border-color: #d5d5d5;
  }

  .ci-submit-btn {
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
  .ci-submit-btn:hover:not(:disabled) { opacity: 0.82; }
  .ci-submit-btn:active:not(:disabled) { transform: scale(0.98); }
  .ci-submit-btn:disabled { opacity: 0.38; cursor: default; }

  .ci-toast {
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
  .ci-toast.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
`;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function CreateImage() {
  const { user } = useAuth();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleFile = (file) => {
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
  };

  const handleChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!image || loading) return;

    try {
      setLoading(true);
      setError("");
      
      // Convert image to full data URI for backend
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageDataUrl = reader.result; // Keep full data:image/...;base64,... string
        
        // Use your backend Posts API
        const newPost = await postsAPI.createPost({
          caption: caption.trim(),
          image: imageDataUrl,
          tags: tags.filter(tag => tag.trim())
        });

        setShowToast(true);
        
        // Success - cleanup & redirect
        setTimeout(() => {
          setShowToast(false);
          URL.revokeObjectURL(preview);
          navigate(`/posts/${newPost._id}`); // Go to new post
        }, 2000);

        // Reset form
        setImage(null);
        setPreview(null);
        setCaption("");
        setTags([]);
      };
      
      reader.readAsDataURL(image);
      
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const addTag = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      const newTag = e.target.value.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      e.target.value = "";
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const canSubmit = image && caption.trim().length > 0 && !loading;

  return (
    <>
      <style>{createImageStyles}</style>
      <div className="ci-page">
        <div className="ci-card">

          <div className="ci-icon-wrap">🖼️</div>
          <h1 className="ci-title">Upload Image</h1>
          <p className="ci-subtitle">
            Share a photo or artwork with your SparkNest followers.
          </p>

          {/* Error Message */}
          {error && (
            <div className="ci-error">
              <span>{error}</span>
              <button 
                onClick={() => setError("")} 
                className="ci-error-close"
              >
                ×
              </button>
            </div>
          )}

          {/* Drop zone — hidden once image selected */}
          {!preview ? (
            <div
              className={`ci-dropzone${dragging ? " dragging" : ""}`}
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
              />
              <span className="ci-drop-icon">🖼️</span>
              <p className="ci-drop-label">Drag & drop your image here</p>
              <p className="ci-drop-sub">PNG, JPG, WEBP · Max 10 MB</p>
              <span className="ci-drop-btn" onClick={() => inputRef.current?.click()}>
                Browse files
              </span>
            </div>
          ) : (
            <>
              {/* Preview */}
              <div className="ci-preview">
                <img src={preview} alt="Preview" />
                <div className="ci-preview-overlay">
                  <button
                    className="ci-change-btn"
                    onClick={() => inputRef.current?.click()}
                    disabled={loading}
                  >
                    ✎ Change image
                  </button>
                  <button
                    className="ci-remove-btn"
                    onClick={removeImage}
                    disabled={loading}
                  >
                    × Remove
                  </button>
                </div>
                {/* Hidden input for re-selecting */}
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  style={{ display: "none" }}
                  disabled={loading}
                />
              </div>

              {/* File meta */}
              <div className="ci-file-meta">
                <span className="ci-file-name">{image.name}</span>
                <span className="ci-file-size">{formatBytes(image.size)}</span>
              </div>
            </>
          )}

          {/* Caption */}
          <label className="ci-label" htmlFor="ci-caption">
            Caption <span className="ci-required">*</span>
          </label>
          <textarea
            id="ci-caption"
            className="ci-input"
            placeholder="Write a caption for your image..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows="3"
            maxLength={280}
            disabled={loading}
          />

          {/* Tags */}
          <label className="ci-label" htmlFor="ci-tags">Tags (optional)</label>
          <div className="ci-tags-input-wrap">
            <input
              id="ci-tags"
              className="ci-input ci-tags-input"
              placeholder="Press Enter to add #tags (e.g. #design #art)"
              onKeyDown={addTag}
              disabled={loading}
            />
            {tags.length > 0 && (
              <div className="ci-tags-list">
                {tags.map((tag) => (
                  <span key={tag} className="ci-tag">
                    #{tag}
                    <button 
                      onClick={() => removeTag(tag)}
                      className="ci-tag-remove"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="ci-divider" />

          <div className="ci-actions">
            <button 
              className="ci-cancel-btn" 
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="ci-submit-btn"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {loading ? (
                <>
                  <span className="ci-spinner"></span>
                  Uploading...
                </>
              ) : (
                `Share Image${tags.length > 0 ? ` + ${tags.length} tag${tags.length === 1 ? '' : 's'}` : ''}`
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Success Toast */}
      <div className={`ci-toast${showToast ? " show" : ""}`}>
        ✓ Image posted successfully!
      </div>
    </>
  );
}

export default CreateImage;
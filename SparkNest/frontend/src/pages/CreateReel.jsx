import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { reelsAPI } from "../services/api"; // Your API service

const createReelStyles = `
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

  .cr-page {
    font-family: 'DM Sans', sans-serif;
    min-height: calc(100vh - 62px);
    background: var(--spark-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
  }

  .cr-card {
    background: var(--spark-white);
    border: 1px solid var(--spark-border);
    border-radius: var(--spark-radius);
    padding: 40px 36px;
    width: 100%;
    max-width: 520px;
    box-shadow: 0 4px 32px rgba(26,26,46,0.07);
  }

  .cr-icon-wrap {
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

  .cr-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--spark-ink);
    margin: 0 0 6px;
    letter-spacing: -0.4px;
  }

  .cr-subtitle {
    font-size: 13.5px;
    color: var(--spark-muted);
    margin: 0 0 28px;
    line-height: 1.5;
  }

  /* Drop zone */
  .cr-dropzone {
    border: 2px dashed var(--spark-border);
    border-radius: 14px;
    padding: 42px 24px;
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
  .cr-dropzone:hover,
  .cr-dropzone.dragging {
    border-color: var(--spark-coral);
    background: var(--spark-coral-soft);
  }
  .cr-dropzone input[type="file"] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }

  .cr-drop-icon { font-size: 36px; }
  .cr-drop-label { font-size: 14px; font-weight: 500; color: var(--spark-ink); margin: 0; }
  .cr-drop-sub   { font-size: 12px; color: var(--spark-muted); margin: 0; }
  .cr-drop-btn {
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

  /* Video preview */
  .cr-preview {
    position: relative;
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 20px;
    border: 1px solid var(--spark-border);
    background: #000;
  }
  .cr-preview video {
    width: 100%;
    max-height: 300px;
    display: block;
    object-fit: cover;
  }
  .cr-preview-actions {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 6px;
  }
  .cr-preview-btn {
    height: 30px;
    border-radius: 30px;
    background: rgba(26,26,46,0.7);
    color: white;
    border: none;
    font-size: 12px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0 12px;
    transition: background 0.15s;
  }
  .cr-preview-btn:hover { background: rgba(26,26,46,0.92); }

  /* File meta */
  .cr-file-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--spark-surface);
    border: 1px solid var(--spark-border);
    border-radius: 10px;
    padding: 10px 14px;
    margin-bottom: 20px;
  }
  .cr-file-left { display: flex; align-items: center; gap: 10px; }
  .cr-file-icon {
    width: 32px; height: 32px;
    border-radius: 8px;
    background: #F0EDFE;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px;
  }
  .cr-file-name {
    font-size: 13px; font-weight: 500; color: var(--spark-ink);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    max-width: 240px;
  }
  .cr-file-size { font-size: 12px; color: var(--spark-muted); flex-shrink: 0; }

  /* Label */
  .cr-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: var(--spark-ink);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 7px;
  }
  .cr-required { color: #E24B4A; }

  .cr-input {
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
  .cr-input:focus {
    border-color: var(--spark-coral);
    box-shadow: 0 0 0 3px rgba(255,107,107,0.12);
  }
  .cr-input::placeholder { color: #BEBDBA; }

  /* Audio toggle row */
  .cr-toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--spark-surface);
    border: 1px solid var(--spark-border);
    border-radius: 12px;
    padding: 13px 16px;
    margin-bottom: 20px;
    cursor: pointer;
    transition: border-color 0.15s;
  }
  .cr-toggle-row:hover { border-color: #d5d5d5; }
  .cr-toggle-label-wrap { display: flex; flex-direction: column; gap: 2px; }
  .cr-toggle-label { font-size: 14px; font-weight: 500; color: var(--spark-ink); }
  .cr-toggle-desc  { font-size: 12px; color: var(--spark-muted); }

  .cr-toggle {
    width: 42px; height: 24px;
    border-radius: 30px;
    background: var(--spark-border);
    position: relative;
    transition: background 0.2s;
    flex-shrink: 0;
  }
  .cr-toggle.on { background: var(--spark-ink); }
  .cr-toggle-thumb {
    width: 18px; height: 18px;
    border-radius: 50%;
    background: white;
    position: absolute;
    top: 3px; left: 3px;
    transition: transform 0.2s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  }
  .cr-toggle.on .cr-toggle-thumb { transform: translateX(18px); }

  .cr-divider { height: 1px; background: var(--spark-border); margin-bottom: 24px; }

  /* Error message */
  .cr-error {
    background: #FFE8E8;
    border: 1px solid #FF6B6B;
    border-radius: 12px;
    padding: 12px 16px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13.5px;
    color: var(--spark-ink);
  }
  .cr-error-close {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: var(--spark-ink);
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Textarea */
  .cr-textarea {
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
    resize: vertical;
  }
  .cr-textarea:focus {
    border-color: var(--spark-coral);
    box-shadow: 0 0 0 3px rgba(255,107,107,0.12);
  }
  .cr-textarea::placeholder { color: #BEBDBA; }

  /* Thumbnail section */
  .cr-thumbnail-section {
    margin-bottom: 20px;
  }
  .cr-thumbnail-preview {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--spark-border);
    margin-bottom: 20px;
  }
  .cr-thumbnail-preview img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
  }
  .cr-thumb-remove {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(26,26,46,0.7);
    color: white;
    border: none;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }
  .cr-thumb-remove:hover { background: rgba(26,26,46,0.92); }

  .cr-thumbnail-placeholder {
    border: 2px dashed var(--spark-border);
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    background: var(--spark-surface);
  }
  .cr-thumbnail-placeholder:hover {
    border-color: var(--spark-coral);
    background: var(--spark-coral-soft);
  }
  .cr-thumbnail-placeholder input {
    display: none;
  }
  .cr-thumb-icon { font-size: 28px; display: block; margin-bottom: 8px; }
  .cr-thumbnail-placeholder p { margin: 0; font-size: 13px; color: var(--spark-ink); }
  .cr-gen-thumb-btn {
    background: none;
    border: none;
    color: var(--spark-coral);
    cursor: pointer;
    font-weight: 500;
    text-decoration: underline;
    font-size: 13px;
    padding: 0;
  }

  /* Loading spinner */
  .cr-spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    margin-right: 6px;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .cr-actions { display: flex; gap: 10px; }

  .cr-cancel-btn {
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
  .cr-cancel-btn:hover {
    background: var(--spark-surface);
    color: var(--spark-ink);
    border-color: #d5d5d5;
  }

  .cr-submit-btn {
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
  .cr-submit-btn:hover:not(:disabled) { opacity: 0.82; }
  .cr-submit-btn:active:not(:disabled) { transform: scale(0.98); }
  .cr-submit-btn:disabled { opacity: 0.38; cursor: default; }

  .cr-toast {
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
  .cr-toast.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
`;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function CreateReel() {
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [muted, setMuted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const thumbnailRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("video/")) {
      setError("Please select a valid video file (MP4, MOV, WEBM)");
      return;
    }
    
    if (file.size > 100 * 1024 * 1024) {
      setError("Video size must be less than 100MB");
      return;
    }

    setVideo(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  }, []);

  const handleVideoChange = (e) => handleFile(e.target.files[0]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Thumbnail size must be less than 5MB");
        return;
      }
      setThumbnail(file);
      setError("");
    }
  };

  const generateThumbnail = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = 320;
    canvas.height = 180;
    
    video.currentTime = 1; // Capture at 1 second
    video.onseeked = () => {
      canvas.getContext('2d').drawImage(video, 0, 0, 320, 180);
      canvas.toBlob((blob) => {
        const file = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
        setThumbnail(file);
      });
    };
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!video || loading) return;

    try {
      setLoading(true);
      setError("");

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('caption', caption.trim());
      formData.append('video', video);
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }
      formData.append('muted', muted);

      // Use your backend Reels API
      const newReel = await reelsAPI.createReel(formData);

      setShowToast(true);
      
      // Success - cleanup & redirect
      setTimeout(() => {
        setShowToast(false);
        if (preview) URL.revokeObjectURL(preview);
        navigate(`/reels/${newReel._id}`);
      }, 2000);

      // Reset form
      setVideo(null);
      setThumbnail(null);
      setPreview(null);
      setTitle("");
      setCaption("");

    } catch (err) {
      console.error('Reel creation failed:', err);
      setError(err.message || 'Failed to upload reel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeVideo = () => {
    setVideo(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const canSubmit = video && title.trim().length > 0 && !loading;

  return (
    <>
      <style>{createReelStyles}</style>
      <div className="cr-page">
        <div className="cr-card">

          <div className="cr-icon-wrap">🎬</div>
          <h1 className="cr-title">Upload Reel</h1>
          <p className="cr-subtitle">Share a short video clip with your SparkNest followers.</p>

          {/* Error Message */}
          {error && (
            <div className="cr-error">
              <span>{error}</span>
              <button 
                onClick={() => setError("")} 
                className="cr-error-close"
              >
                ×
              </button>
            </div>
          )}

          {/* Drop zone */}
          {!preview ? (
            <div
              className={`cr-dropzone${dragging ? " dragging" : ""}`}
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
                accept="video/*"
                onChange={handleVideoChange}
                disabled={loading}
              />
              <span className="cr-drop-icon">🎬</span>
              <p className="cr-drop-label">Drag & drop your video here</p>
              <p className="cr-drop-sub">MP4, MOV, WEBM · Max 100 MB</p>
              <span className="cr-drop-btn" onClick={() => inputRef.current?.click()}>
                Browse files
              </span>
            </div>
          ) : (
            <>
              {/* Video preview */}
              <div className="cr-preview">
                <video 
                  ref={videoRef}
                  src={preview} 
                  controls 
                  muted={muted}
                  disablePictureInPicture
                  playsInline
                  className="cr-preview-video"
                />
                <div className="cr-preview-actions">
                  <button
                    className="cr-preview-btn"
                    onClick={() => inputRef.current?.click()}
                    disabled={loading}
                  >
                    ✎ Change video
                  </button>
                  <button
                    className="cr-preview-btn secondary"
                    onClick={removeVideo}
                    disabled={loading}
                  >
                    ✕ Remove
                  </button>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  style={{ display: "none" }}
                  disabled={loading}
                />
              </div>

              {/* File meta */}
              <div className="cr-file-meta">
                <div className="cr-file-left">
                  <div className="cr-file-icon">🎬</div>
                  <span className="cr-file-name">{video.name}</span>
                </div>
                <span className="cr-file-size">{formatBytes(video.size)}</span>
              </div>

              {/* Thumbnail */}
              <label className="cr-label" htmlFor="cr-thumbnail">
                Thumbnail (optional)
              </label>
              <div className="cr-thumbnail-section">
                {thumbnail ? (
                  <div className="cr-thumbnail-preview">
                    <img src={URL.createObjectURL(thumbnail)} alt="Thumbnail" />
                    <button 
                      className="cr-thumb-remove" 
                      onClick={() => setThumbnail(null)}
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="cr-thumbnail-placeholder">
                    <input
                      id="cr-thumbnail"
                      ref={thumbnailRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      disabled={loading}
                    />
                    <span className="cr-thumb-icon">🖼️</span>
                    <p>Add thumbnail or <button 
                      className="cr-gen-thumb-btn" 
                      onClick={generateThumbnail}
                      disabled={!videoRef.current || loading}
                    >
                      Generate from video
                    </button></p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Title */}
          <label className="cr-label" htmlFor="cr-title">
            Title <span className="cr-required">*</span>
          </label>
          <input
            id="cr-title"
            className="cr-input"
            placeholder="Give your reel a catchy title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />

          {/* Caption */}
          <label className="cr-label" htmlFor="cr-caption">Caption</label>
          <textarea
            id="cr-caption"
            className="cr-textarea"
            placeholder="Describe your reel..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows="3"
            maxLength={280}
            disabled={loading}
          />

          {/* Mute audio toggle */}
          <div 
            className="cr-toggle-row" 
            onClick={() => !loading && setMuted((v) => !v)}
            title={loading ? "Uploading..." : "Toggle audio"}
          >
            <div className="cr-toggle-label-wrap">
              <span className="cr-toggle-label">
                {muted ? "🔇 Mute audio" : "🔊 Include audio"}
              </span>
              <span className="cr-toggle-desc">
                {muted 
                  ? "Upload without original audio track" 
                  : "Preserve original audio from your video"
                }
              </span>
            </div>
            <div className={`cr-toggle${muted ? " on" : ""}`}>
              <div className="cr-toggle-thumb" />
            </div>
          </div>

          <div className="cr-divider" />

          <div className="cr-actions">
            <button 
              className="cr-cancel-btn" 
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="cr-submit-btn"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {loading ? (
                <>
                  <span className="cr-spinner"></span>
                  Uploading...
                </>
              ) : (
                `Publish Reel${thumbnail ? " + Thumbnail" : ""}`
              )}
            </button>
          </div>

        </div>
      </div>

      <div className={`cr-toast${showToast ? " show" : ""}`}>
        ✓ Reel published successfully!
      </div>
    </>
  );
}

export default CreateReel;
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { chatAPI } from "../services/api"; // Your API service

const chatStyles = `
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

  .chat-root {
    font-family: 'DM Sans', sans-serif;
    display: flex;
    height: calc(100vh - 62px);
    background: var(--spark-surface);
    overflow: hidden;
  }

  .chat-sidebar {
    width: 280px;
    flex-shrink: 0;
    background: var(--spark-white);
    border-right: 1px solid var(--spark-border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .chat-sidebar-header {
    padding: 20px 18px 14px;
    border-bottom: 1px solid var(--spark-border);
  }

  .chat-sidebar-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--spark-ink);
    margin: 0 0 14px;
    letter-spacing: -0.3px;
  }

  .chat-search {
    width: 100%;
    background: var(--spark-surface);
    border: 1px solid var(--spark-border);
    border-radius: 30px;
    padding: 7px 14px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    color: var(--spark-ink);
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.15s;
  }
  .chat-search:focus { border-color: var(--spark-coral); }

  .chat-user-list {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow-y: auto;
    padding: 8px 10px;
    scrollbar-width: thin;
    scrollbar-color: var(--spark-border) transparent;
  }

  .chat-user-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 9px 10px;
    border-radius: 14px;
    cursor: pointer;
    transition: background 0.15s, transform 0.15s;
  }
  .chat-user-item:hover { background: var(--spark-surface); transform: translateX(1px); }
  .chat-user-item.active { background: var(--spark-coral-soft); }

  .chat-user-avatar {
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
  .chat-user-item.active .chat-user-avatar {
    background: var(--spark-coral);
    color: white;
  }

  .chat-user-info { flex: 1; min-width: 0; }

  .chat-user-name {
    font-size: 13.5px;
    font-weight: 500;
    color: var(--spark-ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .chat-user-item.active .chat-user-name { color: var(--spark-coral); }

  .chat-user-preview {
    font-size: 12px;
    color: var(--spark-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chat-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--spark-surface);
  }

  .chat-header {
    background: var(--spark-white);
    border-bottom: 1px solid var(--spark-border);
    padding: 14px 22px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .chat-header-avatar {
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

  .chat-header-name {
    font-size: 15px;
    font-weight: 500;
    color: var(--spark-ink);
    margin: 0;
  }

  .chat-header-status {
    font-size: 12px;
    color: var(--spark-muted);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #639922;
    display: inline-block;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px 22px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    scrollbar-width: thin;
    scrollbar-color: var(--spark-border) transparent;
  }

  .chat-date-divider {
    text-align: center;
    margin: 8px 0;
  }
  .chat-date-label {
    font-size: 11px;
    color: var(--spark-muted);
    background: var(--spark-surface);
    padding: 3px 12px;
    border-radius: 30px;
    border: 1px solid var(--spark-border);
    display: inline-block;
  }

  .chat-bubble-row {
    display: flex;
    align-items: flex-end;
    gap: 7px;
  }
  .chat-bubble-row.mine { flex-direction: row-reverse; }

  .bubble-avatar {
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
    margin-bottom: 2px;
  }

  .chat-bubble {
    max-width: 62%;
    padding: 10px 14px;
    font-size: 13.5px;
    line-height: 1.5;
    border-radius: 18px;
    word-break: break-word;
    transition: opacity 0.15s;
    position: relative;
  }

  .chat-bubble.theirs {
    background: var(--spark-white);
    color: var(--spark-ink);
    border: 1px solid var(--spark-border);
    border-bottom-left-radius: 4px;
  }

  .chat-bubble.mine {
    background: var(--spark-ink);
    color: white;
    border-bottom-right-radius: 4px;
  }

  .message-time {
    font-size: 10px;
    opacity: 0.7;
    margin-left: 8px;
    display: inline-block;
  }

  .chat-bubble.mine .message-time {
    color: rgba(255, 255, 255, 0.7);
  }

  .chat-bubble.theirs .message-time {
    color: var(--spark-muted);
  }

  /* Error messages */
  .chat-error {
    background: #FEE2E2;
    border: 1px solid #FECACA;
    border-radius: 8px;
    padding: 8px 12px;
    margin: 8px 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    color: #DC2626;
  }
  .chat-error-close {
    background: none;
    border: none;
    font-size: 16px;
    color: #DC2626;
    cursor: pointer;
    padding: 0;
    margin-left: 8px;
  }

  .chat-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--spark-muted);
  }
  .chat-empty-icon { font-size: 36px; }
  .chat-empty-text { font-size: 13px; }

  .chat-input-area {
    background: var(--spark-white);
    border-top: 1px solid var(--spark-border);
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .chat-input {
    flex: 1;
    background: var(--spark-surface);
    border: 1px solid var(--spark-border);
    border-radius: 30px;
    padding: 10px 18px;
    font-size: 13.5px;
    font-family: 'DM Sans', sans-serif;
    color: var(--spark-ink);
    outline: none;
    transition: border-color 0.15s;
  }
  .chat-input:focus { border-color: var(--spark-coral); }

  .chat-send-btn {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: var(--spark-ink);
    color: white;
    border: none;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: opacity 0.15s, transform 0.1s;
  }
  .chat-send-btn:hover { opacity: 0.82; }
  .chat-send-btn:active { transform: scale(0.93); }
  .chat-send-btn:disabled { opacity: 0.35; cursor: default; }

  /* Unread badge */
  .chat-unread-badge {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--spark-coral);
    color: white;
    font-size: 10px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  /* Empty states */
  .chat-empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--spark-muted);
    text-align: center;
  }
  .chat-empty-icon { font-size: 48px; }
  .chat-empty-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--spark-ink);
    margin: 0;
  }
  .chat-empty-sub {
    font-size: 13px;
    color: var(--spark-muted);
    margin: 0;
  }

  /* Status indicators */
  .status-dot.online { background: #10B981; }
  .status-dot.offline { background: var(--spark-muted); }
  .unread-indicator {
    color: var(--spark-coral);
    font-weight: 500;
  }

  /* Loading states */
  .chat-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--spark-muted);
    flex: 1;
  }
  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--spark-border);
    border-top: 2px solid var(--spark-coral);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  .send-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  /* Message read status */
  .read-status {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.7);
    margin-left: 4px;
    display: inline-block;
  }

  /* Animations */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .chat-root { flex-direction: column; height: 100vh; }
    .chat-sidebar {
      width: 100%;
      height: 200px;
      border-right: none;
      border-bottom: 1px solid var(--spark-border);
    }
    .chat-user-list {
    
      flex-direction: row;
      overflow-x: auto;
      padding: 8px;
    }
    .chat-user-item {
      flex-shrink: 0;
      width: 120px;
      min-width: 120px;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 6px;
      padding: 12px 8px;
    }
    .chat-user-avatar { width: 32px; height: 32px; }
    .chat-user-info { display: none; }
    .chat-unread-badge {
      position: absolute;
      top: 10px;
      right: 10px;
    }
  }

  @media (max-width: 480px) {
    .chat-sidebar { height: 160px; }
    .chat-user-item { width: 100px; }
    .chat-header { padding: 12px 16px; }
    .chat-messages { padding: 16px; }
    .chat-input-area { padding: 12px 16px; }
  }
`;

function Chat() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchConversations = async () => {
      try {
        setError("");
        const data = await chatAPI.getConversations();
        setConversations(data);
        
        if (data.length > 0 && !selectedUser) {
          setSelectedUser(data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
        setError('Failed to load conversations');
      }
    };

    fetchConversations();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!selectedUser?.user?._id) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await chatAPI.getMessages(selectedUser.user._id, {
          page: 1,
          limit: 50
        });
        setMessages(data.messages || []);
        
        // Mark messages as read
        if (selectedUser.unreadCount > 0) {
          try {
            await chatAPI.markMessagesAsRead(selectedUser.user._id);
            // Update conversation list to reflect read status
            setConversations(prev => 
              prev.map(conv => 
                conv.user._id === selectedUser.user._id 
                  ? { ...conv, unreadCount: 0 }
                  : conv
              )
            );
            setSelectedUser(prev => prev ? { ...prev, unreadCount: 0 } : null);
          } catch (error) {
            console.error('Failed to mark messages as read:', error);
          }
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!message.trim() || !selectedUser?.user?._id || sending) return;

    const messageText = message.trim();
    setMessage("");

    try {
      setSending(true);
      setError("");
      
      const newMessage = await chatAPI.sendMessage({
        userId: selectedUser.user._id,
        text: messageText
      });

      setMessages(prev => [...prev, newMessage]);
      
      // Update conversation list
      setConversations(prev => 
        prev.map(conv => 
          conv.user._id === selectedUser.user._id 
            ? { ...conv, lastMessage: newMessage, unreadCount: 0 }
            : conv
        )
      );
      
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
      setMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  const filteredConversations = conversations.filter(conv => 
    conv.user.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <>
        <style>{chatStyles}</style>
        <div className="chat-root">
          <div className="chat-empty-state">
            <span className="chat-empty-icon">🔒</span>
            <p className="chat-empty-title">Log in to chat</p>
            <p className="chat-empty-sub">Sign in to start messaging with others.</p>
          </div>
        </div>
      </>
    );
  }

  const selectedInitials = selectedUser?.user 
    ? getInitials(selectedUser.user.name) 
    : "U";

  const unreadCount = selectedUser?.unreadCount || 0;
  const isOnline = selectedUser?.user?.isOnline || false;

  return (
    <>
      <style>{chatStyles}</style>
      <div className="chat-root">

        {/* Sidebar */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h2 className="chat-sidebar-title">Messages</h2>
            <input
              className="chat-search"
              placeholder="Search people…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="chat-user-list">
            {filteredConversations.map((conv) => {
              const activeUserId = selectedUser?.user?._id || selectedUser?.user;
              const convUserId = conv.user?._id || conv.user;
              const isActive = activeUserId && convUserId && activeUserId.toString() === convUserId.toString();
              const preview = conv.lastMessage?.text || "No messages yet";
              const previewSnippet = preview.length > 40 
                ? preview.slice(0, 40) + "..." 
                : preview;

              return (
                <div
                  key={conv.user._id}
                  className={`chat-user-item${isActive ? " active" : ""}`}
                  onClick={() => setSelectedUser(conv)}
                >
                  <div className="chat-user-avatar">
                    {getInitials(conv.user.name)}
                  </div>
                  <div className="chat-user-info">
                    <p className="chat-user-name">{conv.user.name}</p>
                    <p className="chat-user-preview">{previewSnippet}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="chat-unread-badge">
                      {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                    </div>
                  )}
                </div>
              );
            })}
            {filteredConversations.length === 0 && (
              <div className="chat-empty-state" style={{ padding: '40px 20px' }}>
                <span className="chat-empty-icon">👥</span>
                <p className="chat-empty-title">No conversations</p>
                <p className="chat-empty-sub">Start chatting with other users</p>
              </div>
            )}
          </div>
        </aside>

        <div className="chat-main">
          {selectedUser ? (
            <>
              <div className="chat-header">
                <div className="chat-header-avatar">{selectedInitials}</div>
                <div>
                  <p className="chat-header-name">{selectedUser.user.name}</p>
                  <p className="chat-header-status">
                    <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
                    {isOnline ? 'Online' : 'Offline'}
                    {unreadCount > 0 && (
                      <span className="unread-indicator"> • {unreadCount} unread</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="chat-messages">
                {error && (
                  <div className="chat-error">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError("")} className="chat-error-close">×</button>
                  </div>
                )}
                
                {loading ? (
                  <div className="chat-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="chat-empty">
                    <span className="chat-empty-icon">💬</span>
                    <span className="chat-empty-text">
                      No messages yet — say hello!
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="chat-date-divider">
                      <span className="chat-date-label">Today</span>
                    </div>
                    {messages.map((msg) => {
                      const senderId = msg.sender?._id || msg.sender;
                      const currentUserId = currentUser?._id || currentUser?.id;
                      const isMine = senderId && currentUserId && senderId.toString() === currentUserId.toString();
                      const timeString = new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                      
                      return (
                        <div key={msg._id} className={`chat-bubble-row${isMine ? " mine" : ""}`}>
                          {!isMine && (
                            <div className="bubble-avatar">
                              {getInitials(msg.sender.name)}
                            </div>
                          )}
                          <div className={`chat-bubble ${isMine ? "mine" : "theirs"}`}>
                            {msg.text}
                            <span className="message-time">{timeString}</span>
                            {!msg.isRead && isMine && (
                              <span className="read-status">✓</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-area">
                <input
                  className="chat-input"
                  placeholder="Type a message…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                />
                <button
                  className="chat-send-btn"
                  onClick={handleSend}
                  disabled={!message.trim() || sending}
                  title={sending ? "Sending..." : "Send"}
                >
                  {sending ? (
                    <span className="send-spinner"></span>
                  ) : (
                    "↑"
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="chat-empty-state">
              <span className="chat-empty-icon">📱</span>
              <p className="chat-empty-title">Select a conversation</p>
              <p className="chat-empty-sub">Choose a user from the left to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default Chat;
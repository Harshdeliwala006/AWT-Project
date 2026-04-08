const API_BASE_URL = 'http://localhost:5000/api';

// ✅ FIXED: Get token from localStorage (not user object)
const getAuthToken = () => localStorage.getItem('token');

// ✅ FIXED: Main apiRequest function with AUTO token injection
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }), // ✅ AUTO ADD TOKEN
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // ✅ Handle 401 - clear token & redirect
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Session expired. Redirecting to login...');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// ✅ ADMIN API - NOW WORKS!
export const adminApi = {
  getStats: () => apiRequest('/admin/dashboard/stats'),
  getActivity: () => apiRequest('/admin/dashboard/activity'),
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users?${query}`);
  },
  getPosts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/posts?${query}`);
  },
};

// Auth API
export const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  login: async (credentials) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // ✅ CRITICAL: Save token after login!
    localStorage.setItem('token', response.token);
    return response;
  },

  getCurrentUser: () => apiRequest('/auth/me'),

  logout: () => {
    localStorage.removeItem('token');
    return apiRequest('/auth/logout', { method: 'POST' });
  },
};

// Users API
export const usersAPI = {
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/users?${query}`);
  },

  getUserById: (id) => apiRequest(`/users/${id}`),

  updateProfile: (userData) => apiRequest('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),

  updatePreferences: (preferences) => apiRequest('/users/preferences', {
    method: 'PUT',
    body: JSON.stringify(preferences),
  }),

  changePassword: (password) => apiRequest('/users/password', {
    method: 'PUT',
    body: JSON.stringify({ password }),
  }),

  followUser: (id) => apiRequest(`/users/${id}/follow`, {
    method: 'POST',
  }),

  getFollowers: (id) => apiRequest(`/users/${id}/followers`),

  getFollowing: (id) => apiRequest(`/users/${id}/following`),
};

// Posts API
export const postsAPI = {
  getPosts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/posts?${query}`);
  },

  getPostById: (id) => apiRequest(`/posts/${id}`),

  createPost: (postData) => apiRequest('/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  }),

  updatePost: (id, postData) => apiRequest(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(postData),
  }),

  deletePost: (id) => apiRequest(`/posts/${id}`, {
    method: 'DELETE',
  }),

  likePost: (id) => apiRequest(`/posts/${id}/like`, {
    method: 'POST',
  }),

  commentOnPost: (id, commentData) => apiRequest(`/posts/${id}/comment`, {
    method: 'POST',
    body: JSON.stringify(commentData),
  }),

  deleteComment: (postId, commentId) => apiRequest(`/posts/${postId}/comment/${commentId}`, {
    method: 'DELETE',
  }),
};

// Boards API
export const boardsAPI = {
  getBoards: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/boards?${query}`);
  },

  getMyBoards: () => apiRequest('/boards/my'),

  getBoardById: (id) => apiRequest(`/boards/${id}`),

  createBoard: (boardData) => apiRequest('/boards', {
    method: 'POST',
    body: JSON.stringify(boardData),
  }),

  updateBoard: (id, boardData) => apiRequest(`/boards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(boardData),
  }),

  deleteBoard: (id) => apiRequest(`/boards/${id}`, {
    method: 'DELETE',
  }),

  addPostToBoard: (boardId, postId) => apiRequest(`/boards/${boardId}/posts/${postId}`, {
    method: 'POST',
  }),

  removePostFromBoard: (boardId, postId) => apiRequest(`/boards/${boardId}/posts/${postId}`, {
    method: 'DELETE',
  }),
};

// Reels API
export const reelsAPI = {
  getReels: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/reels?${query}`);
  },

  getReelById: (id) => apiRequest(`/reels/${id}`),

  createReel: (reelData) => {
    const url = `${API_BASE_URL}/reels`;
    const token = getAuthToken();
    
    return fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: reelData, // FormData
    }).then(res => {
      if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Session expired');
      }
      return res.json().then(data => {
        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
        return data;
      });
    }).catch(error => {
      console.error('Reel creation error:', error);
      throw error;
    });
  },

  updateReel: (id, reelData) => apiRequest(`/reels/${id}`, {
    method: 'PUT',
    body: JSON.stringify(reelData),
  }),

  deleteReel: (id) => apiRequest(`/reels/${id}`, {
    method: 'DELETE',
  }),

  likeReel: (id) => apiRequest(`/reels/${id}/like`, {
    method: 'POST',
  }),

  commentOnReel: (id, commentData) => apiRequest(`/reels/${id}/comment`, {
    method: 'POST',
    body: JSON.stringify(commentData),
  }),

  deleteReelComment: (reelId, commentId) => apiRequest(`/reels/${reelId}/comment/${commentId}`, {
    method: 'DELETE',
  }),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/notifications?${query}`);
  },

  getUnreadCount: () => apiRequest('/notifications/unread-count'),

  markAsRead: (id) => apiRequest(`/notifications/${id}/read`, {
    method: 'PUT',
  }),
};

// Chat API
export const chatAPI = {
  getConversations: () => apiRequest('/chat/conversations'),
  getMessages: (userId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/chat/${userId}?${query}`);
  },
  sendMessage: ({ userId, text }) => apiRequest(`/chat/${userId}`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  }),
  markMessagesAsRead: (userId) => apiRequest(`/chat/mark-read/${userId}`, {
    method: 'PUT',
  }),
};

// Search API
export const searchAPI = {
  search: (query, params = {}) => {
    const searchParams = new URLSearchParams({ q: query, ...params });
    return apiRequest(`/search?${searchParams}`);
  },
};
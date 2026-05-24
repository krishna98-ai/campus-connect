import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/posts', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch posts');
  }
});

export const createPost = createAsyncThunk('posts/createPost', async (formData, { rejectWithValue }) => {
  try {
    const res = await api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.post;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create post');
  }
});

export const deletePost = createAsyncThunk('posts/deletePost', async (postId, { rejectWithValue }) => {
  try {
    await api.delete(`/posts/${postId}`);
    return postId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete post');
  }
});

export const toggleLike = createAsyncThunk('posts/toggleLike', async ({ postId, userId }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/posts/${postId}/like`);
    return { postId, ...res.data };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    pagination: null,
    loading: false,
    error: null,
    page: 1,
    hasMore: true,
  },
  reducers: {
    resetPosts: (state) => {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
      state.error = null;
    },
    addPostLocally: (state, action) => {
      state.posts.unshift(action.payload);
    },
    updatePostLocally: (state, action) => {
      const idx = state.posts.findIndex((p) => p._id === action.payload._id);
      if (idx !== -1) state.posts[idx] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        const { data, pagination } = action.payload;
        if (pagination.page === 1) {
          state.posts = data;
        } else {
          state.posts = [...state.posts, ...data];
        }
        state.pagination = pagination;
        state.page = pagination.page;
        state.hasMore = pagination.hasNext;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      });

    builder
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p._id !== action.payload);
      });

    builder
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, liked, likeCount } = action.payload;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          post.likeCount = likeCount;
          post._liked = liked;
        }
      });
  },
});

export const { resetPosts, addPostLocally, updatePostLocally } = postsSlice.actions;
export default postsSlice.reducer;

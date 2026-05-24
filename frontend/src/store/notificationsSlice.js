import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

export const fetchUnreadCount = createAsyncThunk('notifications/fetchUnreadCount', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/notifications/unread-count');
    return res.data.count;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    unreadCount: 0,
    notifications: [],
    loading: false,
  },
  reducers: {
    incrementUnread: (state) => { state.unreadCount += 1; },
    resetUnread: (state) => { state.unreadCount = 0; },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });
  },
});

export const { incrementUnread, resetUnread, addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;

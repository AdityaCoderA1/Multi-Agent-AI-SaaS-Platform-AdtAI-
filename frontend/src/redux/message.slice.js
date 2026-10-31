import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  messages: [],
  isLoading: false,
  artifacts: [],
  activeMessageId: null,
  resubmitPrompt: null,
  chatInputDraft: null
}

export const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
      if (action.payload && action.payload.length > 0) {
        state.activeMessageId = action.payload[action.payload.length - 1]._id;
      } else {
        state.activeMessageId = null;
      }
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      if (action.payload._id) {
        state.activeMessageId = action.payload._id;
      }
    },
    appendMessageContent: (state, action) => {
      const { messageId, content } = action.payload;
      const message = state.messages.find(m => m._id === messageId);
      if (message) {
        message.content += content;
      }
    },
    updateMessageState: (state, action) => {
      const { messageId, updates } = action.payload;
      const index = state.messages.findIndex(m => m._id === messageId);
      if (index !== -1) {
        state.messages[index] = { ...state.messages[index], ...updates };
        if (state.activeMessageId === messageId && updates._id) {
          state.activeMessageId = updates._id;
        }
      }
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setArtifacts: (state, action) => {
      state.artifacts = action.payload;
    },
    setActiveMessageId: (state, action) => {
      state.activeMessageId = action.payload;
    },
    setResubmitPrompt: (state, action) => {
      state.resubmitPrompt = action.payload;
    },
    setChatInputDraft: (state, action) => {
      state.chatInputDraft = action.payload;
    },
    removeTempMessages: (state) => {
      state.messages = state.messages.filter(m => !String(m._id).startsWith("temp-"));
      if (state.messages.length > 0) {
        state.activeMessageId = state.messages[state.messages.length - 1]._id;
      } else {
        state.activeMessageId = null;
      }
    }
  },
})

// Action creators are generated for each case reducer function
export const {
  setMessages,
  addMessage,
  appendMessageContent,
  updateMessageState,
  setIsLoading,
  setArtifacts,
  setActiveMessageId,
  setResubmitPrompt,
  setChatInputDraft,
  removeTempMessages
} = messageSlice.actions

export default messageSlice.reducer
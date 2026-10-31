import { createSlice } from '@reduxjs/toolkit'
import { act } from 'react'

const initialState = {
  userData:null,
  preferredModel: "auto",
  theme: "system"
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData:(state,action)=>{
        state.userData=action.payload
    },
    setPreferredModel: (state, action) => {
        state.preferredModel = action.payload
    },
    setTheme: (state, action) => {
        state.theme = action.payload
    }
  },
})

// Action creators are generated for each case reducer function
export const {setUserData, setPreferredModel, setTheme} = userSlice.actions

export default userSlice.reducer
import React, { useEffect } from 'react'
import {BrowserRouter, Route, Routes} from "react-router-dom"
import Home from './pages/Home'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Chat from './pages/Chat'
import useCurrentUser from './hooks/useCurrentUser'
import ThemeProvider from './components/ThemeProvider'

function App() {
  useCurrentUser()
 
  return (
   <ThemeProvider>
     <BrowserRouter>
     <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/chat' element={<Chat/>}/>
      <Route path='/terms' element={<Terms/>}/>
      <Route path='/privacy' element={<Privacy/>}/>
     </Routes>
     </BrowserRouter>
   </ThemeProvider>
  )
}

export default App

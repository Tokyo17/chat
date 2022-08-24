import { useState } from "react"
import { BrowserRouter,Routes,Route } from "react-router-dom"
import Example from "./Component/Example"

import Home from "./Component/Home"
import Login from "./Component/Login"
import Windows from "./Component/Windows"


function App(){
  const[username,setUsername]=useState("")
  const handleUsername=(e)=>{
    setUsername(e.target.value)
}

  return(
    <BrowserRouter>
    <Routes>
      <Route path="/home" element={<Windows username={username}/>}/>
      <Route path="/example" element={<Example username={username}/>}/>
      <Route path="/login" element={<Login   handleUsername={handleUsername}  username={username}/>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App
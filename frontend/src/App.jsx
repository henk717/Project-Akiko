import './App.css'
import { BrowserRouter as Router, Routes, Route}
    from 'react-router-dom';
import FrontNav from './assets/components/NavBar'
import Home from './pages'
import Chat from './pages/chat'
import Characters from './pages/characters'
import Settings from './pages/settings'
import DiscordBot from './pages/discordbot'
import AdvancedCharacter from './pages/advancedcharacter'
function App() {

  return (
      <Router>
      <FrontNav />
      <Routes>
        <Route exact path='/' element={<Home/>} />
        <Route path='/chat' element={<Chat/>} />
        <Route path='/characters' element={<Characters/>} />
        <Route path='/settings' element={<Settings/>} />
        <Route path='/discordbot' element={<DiscordBot/>} />
        <Route path='/advcharacter' element={<AdvancedCharacter/>} />
      </Routes>
      </Router>
  )
}

export default App

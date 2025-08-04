// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Contact from './pages/Contact';
import CPTopics from './pages/CPTopics';
import TopicDetail from './pages/TopicDetail';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Contests from './pages/Contests';
import Problems from './pages/Problems';
import Profile from './pages/Profile';
import Settings from './pages/Settings';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/topics" element={<CPTopics />} />
        <Route path="/topics/:slug" element={<TopicDetail />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/contests"  element={<Contests />} />
        <Route path="/problems"  element={<Problems />} />
        <Route path="/profile"   element={<Profile />} />
        <Route path="/settings"  element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;

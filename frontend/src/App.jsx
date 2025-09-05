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
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Practice from './pages/Practice';
import CFRunner from './pages/CFRunner';


// ✅ Use the full Problems page (tabs/filters), not the small dashboard widget
import ProblemsPage from './pages/ProblemsPage';
import PracticeSolve from './pages/PracticeSolve';

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
        <Route path="/contests" element={<Contests />} />
        {/* ✅ Route /problems to the new ProblemsPage */}
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/practice/cf/:contestId/:index" element={<PracticeSolve/>} />

        
      </Routes>
    </Router>
  );
}

export default App;

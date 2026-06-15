import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Details } from './pages/Details';
import { Reader } from './pages/Reader';
import { Browse } from './pages/Browse';
import { Bookmarks } from './pages/Bookmarks';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/manhwa/:id" element={<Details />} />
        <Route path="/read/:manhwaId/:chapterId" element={<Reader />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/updates" element={<Browse />} /> {/* Reusing browse with updates filter logic */}
        <Route path="/search" element={<Browse />} />
      </Routes>
    </Router>
  );
}

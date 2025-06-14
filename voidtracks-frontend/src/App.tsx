import { Routes, Route } from 'react-router-dom';
import TrackList from './pages/TrackList';
import TrackDetail from './pages/TrackDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<TrackList />} />
      <Route path="/track/:music_path" element={<TrackDetail />} />
    </Routes>
  );
}

export default App;
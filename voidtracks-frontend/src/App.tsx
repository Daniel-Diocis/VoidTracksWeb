// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import TrackList from './pages/TrackList';
import TrackDetail from './pages/TrackDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import TracksMarket from './pages/TracksMarket';
import DownloadPage from './pages/DownloadPage';
import MyPurchases from './pages/MyPurchases';
import PopularTracks from './pages/PopularTracks';


function App() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<TrackList />} />
          <Route path="/market" element={<TracksMarket />} />
          <Route path="/download/:download_token" element={<DownloadPage />} />
          <Route path="/track/:music_path" element={<TrackDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-purchases" element={<MyPurchases />} />
          <Route path="/popular" element={<PopularTracks />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
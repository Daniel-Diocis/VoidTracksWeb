import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'; // supponendo che AdminRoute sia nello stesso file
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import TrackList from './pages/TrackList';
import TrackDetail from './pages/TrackDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import TracksMarket from './pages/TracksMarket';
import DownloadPage from './pages/DownloadPage';
import MyPurchases from './pages/MyPurchases';
import PopularTracks from './pages/PopularTracks';
import PlaylistsPage from './pages/PlaylistsPage';
import AdminPanel from './pages/AdminPanel';
import NotAuthorized from './pages/NotAuthorized';

function App() {
  const auth = useContext(AuthContext);

  if (!auth) return <div>Errore: contesto Auth non disponibile</div>;
  if (auth.isInitializing) return <div>Caricamento...</div>;

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          {/* Rotte pubbliche */}
          <Route path="/" element={<TrackList />} />
          <Route path="/market" element={<TracksMarket />} />
          <Route path="/download/:download_token" element={<DownloadPage />} />
          <Route path="/track/:music_path" element={<TrackDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/popular" element={<PopularTracks />} />
          <Route path="/not-authorized" element={<NotAuthorized />} />

          {/* Rotte protette - solo utenti loggati */}
          <Route element={<ProtectedRoute />}>
            <Route path="/my-purchases" element={<MyPurchases />} />
            <Route path="/playlists" element={<PlaylistsPage />} />
          </Route>

          {/* Rotte admin */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
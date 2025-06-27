/**
 * App.tsx
 *
 * Entry point principale dell'applicazione VoidTracks.
 * Gestisce il routing, la visualizzazione della barra di navigazione,
 * il caricamento condizionale in base allo stato di autenticazione
 * e il player globale visibile in ogni pagina.
 */

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
import ArtistDetail from './pages/ArtistDetail';
import UserRequests from "./pages/UserRequests";
import AdminRequests from './pages/AdminRequests';
import GlobalPlayer from './components/GlobalPlayer';

/**
 * Componente principale dell'app.
 * Carica il contesto di autenticazione e gestisce le rotte.
 */
function App() {
  const auth = useContext(AuthContext);

  // In caso di errore nel caricamento del contesto
  if (!auth) return <div>Errore: contesto Auth non disponibile</div>;
  // Mostra un messaggio durante l'inizializzazione
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
          <Route path="/artist/:nome" element={<ArtistDetail />} />
          {/* Rotte protette - solo utenti loggati */}
          <Route path="/not-authorized" element={<NotAuthorized />} />

          {/* Rotte protette - solo utenti loggati */}
          <Route element={<ProtectedRoute />}>
            <Route path="/my-purchases" element={<MyPurchases />} />
            <Route path="/playlists" element={<PlaylistsPage />} />
            <Route path="/requests" element={<UserRequests />} />
          </Route>

          {/* Rotte admin */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/requests" element={<AdminRequests />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <GlobalPlayer />
      </main>
    </>
  );
}

export default App;
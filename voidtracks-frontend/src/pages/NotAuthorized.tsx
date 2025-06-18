import { Link } from 'react-router-dom';

function NotAuthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">Accesso Negato</h1>
      <p className="mb-6">Non hai i permessi necessari per accedere a questa pagina.</p>
      <Link to="/" className="text-cyan-600 underline">
        Torna alla Home
      </Link>
    </div>
  );
}

export default NotAuthorized;
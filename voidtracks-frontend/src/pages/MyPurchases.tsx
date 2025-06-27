/**
 * Pagina per la visualizzazione degli acquisti effettuati dall’utente autenticato.
 *
 * Funzionalità:
 * - Recupera gli acquisti dal backend tramite la rotta protetta `/purchase`
 * - Permette di filtrare gli acquisti per intervallo di date (`fromDate` / `toDate`)
 * - Mostra i dettagli del brano acquistato: copertina, titolo, artista, album e data di acquisto
 * - Gestisce lo stato di caricamento e le eventuali notifiche d’errore
 *
 * Stato interno:
 * - `fromDate`, `toDate`: intervallo di date per il filtro
 * - `purchases`: lista degli acquisti ricevuti dal backend
 * - `loading`: stato booleano per mostrare il caricamento
 *
 * Dipendenze:
 * - `toastManager` per le notifiche
 * - `localStorage` per recuperare il token JWT salvato
 *
 * UI:
 * - Form di filtro con date selezionabili
 * - Lista responsive con immagine e dettagli dei brani acquistati
 * - Messaggi informativi se non ci sono risultati o se si verifica un errore
 */

import { useEffect, useState } from 'react';
import { notify } from '../utils/toastManager';

interface Purchase {
  id: number;
  purchased_at: string;
  Track: {
    titolo: string;
    artista: string;
    album: string;
    cover_path: string;
  };
}

function MyPurchases() {
  const token = localStorage.getItem('token');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);

    const fetchPurchases = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (fromDate) query.append('fromDate', fromDate);
            if (toDate) query.append('toDate', toDate);

            const response = await fetch(`http://localhost:3000/purchase?${query.toString()}`, {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            const purchasesData = Array.isArray(data.data) ? data.data : data;
            setPurchases(purchasesData);
            
        } catch (error) {
        notify.error('Errore nel recupero degli acquisti:');
        console.error('Errore nel recupero acquisti:', error);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchPurchases();
    }, []);

    return (
        <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">I tuoi acquisti</h2>

        <div className="flex gap-4 mb-6">
            <div>
            <label className="block text-sm font-medium">Da:</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border p-1 rounded" />
            </div>
            <div>
            <label className="block text-sm font-medium">A:</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border p-1 rounded" />
            </div>
            <button onClick={fetchPurchases} className="bg-blue-600 text-white px-4 py-1 rounded self-end">
            Filtra
            </button>
        </div>

        {loading ? (
            <p>Caricamento in corso...</p>
        ) : (
            <ul className="space-y-4">
            {purchases.length === 0 ? (
                <p>Nessun acquisto trovato.</p>
            ) : (
                purchases.map((p) => (
                <li key={p.id} className="border p-4 rounded shadow-sm flex gap-4">
                    {p.Track.cover_path && (
                    <img src={`https://igohvppfcsipbmzpckei.supabase.co/storage/v1/object/public/cover/${p.Track.cover_path}`} alt="cover" className="w-20 h-20 object-cover rounded" />
                    )}
                    <div>
                    <h3 className="text-lg font-semibold">{p.Track.titolo}</h3>
                    <p className="text-sm text-gray-600">
                        {p.Track.artista} – {p.Track.album}
                    </p>
                    <p className="text-xs mt-1">Acquistato il: {new Date(p.purchased_at).toLocaleDateString()}</p>
                    </div>
                </li>
                ))
            )}
            </ul>
        )}
        </div>
    );
}

export default MyPurchases;
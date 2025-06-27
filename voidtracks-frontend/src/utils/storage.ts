/**
 * storage.ts
 *
 * Utility per salvare e caricare i timestamp `updated_at` dei brani nel localStorage,
 * utilizzati per rilevare eventuali aggiornamenti rispetto alla versione remota.
 */

/**
 * Carica i timestamp salvati localmente per ciascun brano.
 *
 * @returns Un oggetto con ID del brano come chiave e stringa `updated_at` come valore.
 * Se non esiste nulla in localStorage, restituisce un oggetto vuoto.
 */
export const loadLocalTimestamps = (): Record<string, string> => {
  const data = localStorage.getItem('trackTimestamps');
  return data ? JSON.parse(data) : {};
};

/**
 * Salva nel localStorage i timestamp `updated_at` associati ai brani.
 *
 * @param timestamps Oggetto con chiavi corrispondenti agli ID dei brani
 *                  e valori con il relativo timestamp `updated_at`.
 */
export const saveLocalTimestamps = (timestamps: Record<string, string>) => {
  localStorage.setItem('trackTimestamps', JSON.stringify(timestamps));
};
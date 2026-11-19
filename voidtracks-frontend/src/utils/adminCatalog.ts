export const catalogApiUrl = `${import.meta.env.VITE_API_URL || "/api"}/admin/catalog`;
export const catalogInputClass = "mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white";
export const catalogImageTypes = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

export function publicationId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export async function checkCatalogResponse(response: Response, fallback: string) {
  if (response.ok) return;
  if (response.status === 413) throw new Error("I file superano il limite di caricamento.");
  const body = await response.json().catch(() => null);
  throw new Error(body?.error || body?.message || fallback);
}

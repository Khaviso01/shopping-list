// Wraps the Unsplash Search Photos endpoint so users can pick a real product
// photo for a shopping list item instead of pasting an image URL by hand.
// Docs: https://unsplash.com/documentation#search-photos

const UNSPLASH_ACCESS_KEY: string | undefined = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = 'https://api.unsplash.com';

export interface UnsplashImageResult {
  id: string;
  description: string;
  thumbUrl: string;
  fullUrl: string;
  photographerName: string;
  photographerUrl: string;
  /** Endpoint Unsplash asks apps to ping when a photo is actually used (their attribution guideline). */
  downloadLocation: string;
}

export class UnsplashConfigError extends Error {}

/**
 * Searches Unsplash for images matching `query` and returns a small,
 * UI-friendly result set the user can pick from.
 */
export const searchUnsplashImages = async (
  query: string,
  perPage: number = 9
): Promise<UnsplashImageResult[]> => {
  if (!UNSPLASH_ACCESS_KEY) {
    throw new UnsplashConfigError(
      'Unsplash is not configured. Add VITE_UNSPLASH_ACCESS_KEY to your .env file.'
    );
  }

  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const url = `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(
    trimmedQuery
  )}&per_page=${perPage}&content_filter=high`;

  const response = await fetch(url, {
    headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
  });

  if (!response.ok) {
    // Read the response body for diagnostics — Unsplash includes helpful
    // detail here (e.g. "Invalid access token"), logged for debugging but
    // not shown verbatim to the user.
    const body = await response.text().catch(() => '');
    if (body) console.error('Unsplash search error response:', body);

    if (response.status === 401) {
      throw new Error(
        'Unsplash rejected the access key (401). Double-check VITE_UNSPLASH_ACCESS_KEY in .env is your Access Key, not your Secret Key, then restart the dev server.'
      );
    }
    if (response.status === 403) {
      throw new Error(
        'Unsplash blocked this request (403) — likely the demo-app hourly rate limit (50 requests/hour) has been hit. Wait an hour, or apply for production access on your Unsplash app.'
      );
    }
    if (response.status === 404) {
      throw new Error('Unsplash search endpoint not found (404) — check the app is calling api.unsplash.com correctly.');
    }
    throw new Error(`Unsplash search failed with status ${response.status}.`);
  }

  const data = await response.json();

  return (data.results || []).map(
    (photo: any): UnsplashImageResult => ({
      id: photo.id,
      description: photo.alt_description || photo.description || trimmedQuery,
      thumbUrl: photo.urls.small,
      fullUrl: photo.urls.regular,
      photographerName: photo.user?.name || 'Unknown',
      photographerUrl: photo.user?.links?.html || 'https://unsplash.com',
      downloadLocation: photo.links?.download_location || '',
    })
  );
};

/**
 * Unsplash's API guidelines ask that apps ping this endpoint whenever a photo
 * is actually selected/used, separately from the search request itself.
 * Safe to "fire and forget" — a failure here shouldn't block the user.
 */
export const triggerUnsplashDownload = async (downloadLocation: string): Promise<void> => {
  if (!downloadLocation || !UNSPLASH_ACCESS_KEY) return;
  try {
    await fetch(downloadLocation, {
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
    });
  } catch {
    // Non-critical — ignore network errors here.
  }
};
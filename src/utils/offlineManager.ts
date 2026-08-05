// In-App Offline Video Manager & Standalone App Mode Detector

export interface OfflineVideo {
  id: string; // unique video key: courseId_videoIdx_title
  courseId: string;
  courseTitle: string;
  title: string;
  chapterTitle?: string;
  duration: string;
  videoUrl: string;
  downloadedAt: number;
  offlineReady: boolean;
  notes?: string;
}

const DB_NAME = 'AiClipzoneOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_videos';

// Detect if running in App Mode (Installed PWA / Standalone WebApp)
export function isAppMode(): boolean {
  if (typeof window === 'undefined') return false;

  const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = (window.navigator as any).standalone === true;
  const isAndroidApp = document.referrer.includes('android-app://');
  const isAppUrlParam = window.location.search.includes('app_mode=true') || window.location.search.includes('display=standalone');

  return isStandaloneMedia || isIOSStandalone || isAndroidApp || isAppUrlParam;
}

// Open IndexedDB database
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this browser environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result as IDBDatabase);
    };

    request.onerror = (event: any) => {
      reject(event.target.error);
    };
  });
}

// Save video meta/data into In-App IndexedDB
export async function saveVideoOffline(video: OfflineVideo): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(video);

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save offline video in IndexedDB:', err);
    // Fallback to LocalStorage
    try {
      const existing = getLocalStorageOfflineVideos();
      existing[video.id] = video;
      localStorage.setItem('clipzone_offline_videos_v2', JSON.stringify(existing));
      return true;
    } catch (e) {
      return false;
    }
  }
}

// Get all offline videos saved inside the App
export async function getOfflineVideos(): Promise<OfflineVideo[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const results: OfflineVideo[] = req.result || [];
        resolve(results.sort((a, b) => b.downloadedAt - a.downloadedAt));
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    const fallbackMap = getLocalStorageOfflineVideos();
    return Object.values(fallbackMap).sort((a, b) => b.downloadedAt - a.downloadedAt);
  }
}

// Check if a specific video is downloaded in app
export async function isVideoDownloaded(id: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => resolve(!!req.result);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    const fallbackMap = getLocalStorageOfflineVideos();
    return !!fallbackMap[id];
  }
}

// Delete offline video from app
export async function deleteOfflineVideo(id: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => {
        // Also clean up fallback localStorage if present
        const fallback = getLocalStorageOfflineVideos();
        if (fallback[id]) {
          delete fallback[id];
          localStorage.setItem('clipzone_offline_videos_v2', JSON.stringify(fallback));
        }
        resolve(true);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    const fallback = getLocalStorageOfflineVideos();
    if (fallback[id]) {
      delete fallback[id];
      localStorage.setItem('clipzone_offline_videos_v2', JSON.stringify(fallback));
    }
    return true;
  }
}

function getLocalStorageOfflineVideos(): Record<string, OfflineVideo> {
  try {
    return JSON.parse(localStorage.getItem('clipzone_offline_videos_v2') || '{}');
  } catch (e) {
    return {};
  }
}

import type { Asset, Project } from '../types';

const DB_NAME = 'IsoForgeDB';
const DB_VERSION = 1;
const ASSET_STORE = 'assets';
const PROJECT_STORE = 'projects';
const META_STORE = 'metadata';

interface StoredProjectData {
  projects: Project[];
  activeProjectId: string | null;
  sessionAssets: Asset[];
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => {
            console.error("IndexedDB error:", request.error);
            reject(new Error("Failed to open IndexedDB"));
        };
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(ASSET_STORE)) {
                db.createObjectStore(ASSET_STORE, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(PROJECT_STORE)) {
                db.createObjectStore(PROJECT_STORE, { keyPath: 'id' });
            }
             if (!db.objectStoreNames.contains(META_STORE)) {
                db.createObjectStore(META_STORE, { keyPath: 'key' });
            }
        };
    });
    return dbPromise;
}

export async function saveProjects(data: StoredProjectData): Promise<void> {
  try {
    const db = await getDb();
    const transaction = db.transaction([ASSET_STORE, PROJECT_STORE, META_STORE], 'readwrite');
    const assetStore = transaction.objectStore(ASSET_STORE);
    const projectStore = transaction.objectStore(PROJECT_STORE);
    const metaStore = transaction.objectStore(META_STORE);

    // Collect all unique asset IDs
    const allAssetIds = new Set<string>();
    const allAssets: Asset[] = [...data.sessionAssets];
    data.projects.forEach(p => allAssets.push(...p.assets));

    // Clear old assets that are no longer referenced
    const currentAssetKeys = await new Promise<string[]>(resolve => {
        const req = assetStore.getAllKeys();
        req.onsuccess = () => resolve(req.result as string[]);
    });

    for(const asset of allAssets) {
        allAssetIds.add(asset.id);
        assetStore.put(asset);
    }
    
    for (const key of currentAssetKeys) {
        if(!allAssetIds.has(key)) {
            assetStore.delete(key);
        }
    }
    
    // Dehydrate projects and save them
    const dehydratedProjects = data.projects.map(p => ({
        ...p,
        assets: p.assets.map(a => a.id),
    }));

    dehydratedProjects.forEach(p => projectStore.put(p));
    
    // Save metadata
    metaStore.put({ key: 'activeProjectId', value: data.activeProjectId });
    metaStore.put({ key: 'sessionAssetIds', value: data.sessionAssets.map(a => a.id) });

    await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });

  } catch (error) {
    console.error("Failed to save projects to IndexedDB:", error);
  }
}

export async function loadProjects(): Promise<StoredProjectData> {
  const defaultData: StoredProjectData = {
    projects: [],
    activeProjectId: null,
    sessionAssets: [],
  };

  try {
    const db = await getDb();
    const transaction = db.transaction([ASSET_STORE, PROJECT_STORE, META_STORE], 'readonly');
    const assetStore = transaction.objectStore(ASSET_STORE);
    const projectStore = transaction.objectStore(PROJECT_STORE);
    const metaStore = transaction.objectStore(META_STORE);

    const [allAssets, dehydratedProjects, activeId, sessionAssetIds] = await Promise.all([
      new Promise<Asset[]>(res => { const r = assetStore.getAll(); r.onsuccess = () => res(r.result); }),
      new Promise<any[]>(res => { const r = projectStore.getAll(); r.onsuccess = () => res(r.result); }),
      new Promise<{value: string} | undefined>(res => { const r = metaStore.get('activeProjectId'); r.onsuccess = () => res(r.result); }),
      new Promise<{value: string[]} | undefined>(res => { const r = metaStore.get('sessionAssetIds'); r.onsuccess = () => res(r.result); }),
    ]);

    const assetMap = new Map<string, Asset>(allAssets.map(a => [a.id, a]));

    const projects: Project[] = dehydratedProjects.map(p => ({
        ...p,
        assets: p.assets.map((id: string) => assetMap.get(id)).filter(Boolean),
    }));

    const sessionAssets: Asset[] = (sessionAssetIds?.value || []).map(id => assetMap.get(id)).filter(Boolean) as Asset[];
    
    return {
        projects,
        activeProjectId: activeId?.value || null,
        sessionAssets,
    };
  } catch (error) {
    console.error("Failed to load project data from IndexedDB:", error);
    return defaultData;
  }
}
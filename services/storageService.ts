import type { Asset, Project } from '../types';

const DB_NAME = 'IsoForgeDB';
const DB_VERSION = 1;
const PROJECT_STORE = 'projects';
const ASSET_STORE = 'assets';
const META_STORE = 'metadata';

interface StoredProjectData {
  projects: Project[];
  activeProjectId: string | null;
  sessionAssets: Asset[];
}

// --- DB Initialization ---
let dbPromise: Promise<IDBDatabase> | null = null;
function getDb(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(new Error(`IndexedDB error: ${request.error}`));
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(PROJECT_STORE)) {
                db.createObjectStore(PROJECT_STORE, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(ASSET_STORE)) {
                db.createObjectStore(ASSET_STORE, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(META_STORE)) {
                db.createObjectStore(META_STORE, { keyPath: 'key' });
            }
        };
    });
    return dbPromise;
}

// --- Promisified Helpers ---
function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function promisifyTransaction(tx: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

// --- Public API ---

/**
 * Saves all project data, including session assets, to IndexedDB.
 * This function is designed to be robust and handle large amounts of asset data
 * without hitting browser storage limits.
 */
export async function saveProjects(data: StoredProjectData): Promise<void> {
  try {
    const db = await getDb();
    const tx = db.transaction([PROJECT_STORE, ASSET_STORE, META_STORE], 'readwrite');
    const projectStore = tx.objectStore(PROJECT_STORE);
    const assetStore = tx.objectStore(ASSET_STORE);
    const metaStore = tx.objectStore(META_STORE);
    
    const allAssets = new Map<string, Asset>();
    data.sessionAssets.forEach(asset => allAssets.set(asset.id, asset));
    data.projects.forEach(project => project.assets.forEach(asset => allAssets.set(asset.id, asset)));

    // Save all unique assets
    for (const asset of allAssets.values()) {
        assetStore.put(asset);
    }
    
    // Clean up assets that are no longer referenced anywhere
    const currentAssetKeys = await promisifyRequest(assetStore.getAllKeys());
    for (const key of currentAssetKeys) {
        if (!allAssets.has(key as string)) {
            assetStore.delete(key);
        }
    }
    
    // Save dehydrated projects (storing only asset IDs)
    for (const project of data.projects) {
        const dehydratedProject = {
            ...project,
            assets: project.assets.map(a => a.id),
        };
        projectStore.put(dehydratedProject);
    }

    // Save metadata
    metaStore.put({ key: 'activeProjectId', value: data.activeProjectId });
    metaStore.put({ key: 'sessionAssetIds', value: data.sessionAssets.map(a => a.id) });

    await promisifyTransaction(tx);
  } catch (error) {
    console.error("Failed to save projects to IndexedDB:", error);
    throw new Error("Failed to save data. Your changes might not be persisted.");
  }
}

/**
 * Loads all project data from IndexedDB.
 * Returns a default structure if no data is found.
 */
export async function loadProjects(): Promise<StoredProjectData> {
  const defaultData: StoredProjectData = {
    projects: [],
    activeProjectId: null,
    sessionAssets: [],
  };

  try {
    const db = await getDb();
    const tx = db.transaction([PROJECT_STORE, ASSET_STORE, META_STORE], 'readonly');
    const projectStore = tx.objectStore(PROJECT_STORE);
    const assetStore = tx.objectStore(ASSET_STORE);
    const metaStore = tx.objectStore(META_STORE);

    const [allAssets, dehydratedProjects, activeIdMeta, sessionIdsMeta] = await Promise.all([
        promisifyRequest(assetStore.getAll()),
        promisifyRequest(projectStore.getAll()),
        promisifyRequest(metaStore.get('activeProjectId') as IDBRequest<{value: string}>),
        promisifyRequest(metaStore.get('sessionAssetIds') as IDBRequest<{value: string[]}>),
    ]);
    
    const assetMap = new Map<string, Asset>(allAssets.map(a => [a.id, a]));
    
    // Rehydrate projects by replacing asset IDs with full asset objects
    const projects: Project[] = dehydratedProjects.map(p => ({
        ...p,
        assets: (p.assets as string[]).map(id => assetMap.get(id)).filter((a): a is Asset => !!a),
    }));

    const sessionAssetIds = sessionIdsMeta?.value || [];
    const sessionAssets: Asset[] = sessionAssetIds.map((id: string) => assetMap.get(id)).filter((a: Asset | undefined): a is Asset => !!a);
    
    return {
        projects,
        activeProjectId: activeIdMeta?.value || null,
        sessionAssets,
    };

  } catch (error) {
    console.error("Failed to load project data from IndexedDB:", error);
    // Return default data so the app can still start
    return defaultData;
  }
}
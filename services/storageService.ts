import type { Asset, Project } from '../types';

const PROJECTS_KEY = 'iso-forge-projects';
const ACTIVE_PROJECT_ID_KEY = 'iso-forge-active-project-id';
const SESSION_ASSETS_KEY = 'iso-forge-session-assets';

interface StoredProjectData {
  projects: Project[];
  activeProjectId: string | null;
  sessionAssets: Asset[];
}

export function saveProjects(data: StoredProjectData): void {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(data.projects));
    if(data.activeProjectId) {
        localStorage.setItem(ACTIVE_PROJECT_ID_KEY, data.activeProjectId);
    }
    localStorage.setItem(SESSION_ASSETS_KEY, JSON.stringify(data.sessionAssets));
  } catch (error) {
    console.error("Failed to save projects to local storage:", error);
  }
}

export function loadProjects(): StoredProjectData {
  const storedData: StoredProjectData = {
    projects: [],
    activeProjectId: null,
    sessionAssets: [],
  };
  
  try {
    const projectsData = localStorage.getItem(PROJECTS_KEY);
    if (projectsData) {
      storedData.projects = JSON.parse(projectsData);
    }
    const activeId = localStorage.getItem(ACTIVE_PROJECT_ID_KEY);
    if(activeId) {
        storedData.activeProjectId = activeId;
    }
    const sessionData = localStorage.getItem(SESSION_ASSETS_KEY);
    if(sessionData) {
        storedData.sessionAssets = JSON.parse(sessionData);
    }
  } catch (error) {
    console.error("Failed to load project data:", error);
    // Clear potentially corrupted data
    localStorage.removeItem(PROJECTS_KEY);
    localStorage.removeItem(ACTIVE_PROJECT_ID_KEY);
    localStorage.removeItem(SESSION_ASSETS_KEY);
  }
  
  return storedData;
}

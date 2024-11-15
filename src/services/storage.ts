import { v4 as uuidv4 } from 'uuid';

export interface Project {
  id: string;
  name: string;
  description: string;
  local: {
    url: string;
    status: string;
    lastCheck: Date;
  };
  cloud: {
    url: string;
    status: string;
    lastCheck: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class LocalStorageService {
  private STORAGE_KEY = 'projects';

  constructor() {
    // 添加客户端检查
    if (typeof window !== 'undefined') {
      if (!window.localStorage.getItem(this.STORAGE_KEY)) {
        window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
      }
    }
  }

  getProjects() {
    if (typeof window === 'undefined') return [];
    const projects = window.localStorage.getItem(this.STORAGE_KEY);
    return projects ? JSON.parse(projects) : [];
  }

  addProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const projects = this.getProjects();
    const now = new Date();
    
    const newProject: Project = {
      ...projectData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    projects.push(newProject);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
    
    return newProject;
  }

  updateProject(id: string, updates: Partial<Project>): Project {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Project not found');
    }

    const updatedProject = {
      ...projects[index],
      ...updates,
      updatedAt: new Date(),
    };

    projects[index] = updatedProject;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));

    return updatedProject;
  }

  deleteProject(id: string): void {
    const projects = this.getProjects();
    const filteredProjects = projects.filter(p => p.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredProjects));
  }
} 
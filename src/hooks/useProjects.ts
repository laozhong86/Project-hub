import { useState, useEffect } from 'react';
import { LocalStorageService, Project } from '../services/storage';
import { StatusChecker } from '../services/status-checker';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const storageService = new LocalStorageService();
  const statusChecker = new StatusChecker();

  useEffect(() => {
    // 确保在客户端执行
    setProjects(storageService.getProjects());
    setLoading(false);

    // 启动定期检查
    statusChecker.startPeriodicCheck();

    return () => {
      statusChecker.stopPeriodicCheck();
    };
  }, []);

  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject = storageService.addProject(projectData);
    await statusChecker.checkProject(newProject);
    setProjects(storageService.getProjects());
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    const updatedProject = storageService.updateProject(id, updates);
    setProjects(storageService.getProjects());
    return updatedProject;
  };

  const deleteProject = (id: string) => {
    storageService.deleteProject(id);
    setProjects(storageService.getProjects());
  };

  const refreshProjectStatus = async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      await statusChecker.checkProject(project);
      setProjects(storageService.getProjects());
    }
  };

  return {
    projects,
    loading,
    addProject,
    updateProject,
    deleteProject,
    refreshProjectStatus,
  };
} 
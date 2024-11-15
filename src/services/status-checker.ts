import { LocalStorageService, Project } from './storage';

export class StatusChecker {
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly INTERVAL_TIME = 60000; // 60秒检查一次

  async checkUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async checkProject(project: Project): Promise<void> {
    const storageService = new LocalStorageService();
    const updates: Partial<Project> = {
      local: { ...project.local },
      cloud: { ...project.cloud }
    };

    // 检查本地环境
    if (project.local.url) {
      const isLocalOnline = await this.checkUrl(project.local.url);
      updates.local = {
        ...updates.local,
        status: isLocalOnline ? 'online' : 'offline',
        lastCheck: new Date()
      };
    }

    // 检查云端环境
    if (project.cloud.url) {
      const isCloudOnline = await this.checkUrl(project.cloud.url);
      updates.cloud = {
        ...updates.cloud,
        status: isCloudOnline ? 'online' : 'offline',
        lastCheck: new Date()
      };
    }

    // 更新项目状态
    storageService.updateProject(project.id, updates);
  }

  startPeriodicCheck(): void {
    if (this.checkInterval) {
      return;
    }

    const storageService = new LocalStorageService();
    
    this.checkInterval = setInterval(async () => {
      const projects = storageService.getProjects();
      for (const project of projects) {
        await this.checkProject(project);
      }
    }, this.INTERVAL_TIME);
  }

  stopPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
} 
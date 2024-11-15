"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, RefreshCw, Trash2, ExternalLink, Search, Filter } from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ProjectHub() {
  const { projects, loading, addProject, deleteProject, refreshProjectStatus } = useProjects()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    local: { url: '' },
    cloud: { url: '' }
  })

  // 添加刷新状态
  const [refreshingStates, setRefreshingStates] = useState<Record<string, boolean>>({})

  // 新增状态
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')

  // 筛选项目
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus.length === 0 || (
      (project.local.url && selectedStatus.includes(project.local.status)) ||
      (project.cloud.url && selectedStatus.includes(project.cloud.status))
    )

    return matchesSearch && matchesStatus
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 验证至少填写了一个 URL
    if (!formData.local.url && !formData.cloud.url) {
      alert('请至少填写本地环境或云端环境的 URL')
      return
    }

    await addProject({
      name: formData.name,
      description: formData.description,
      local: {
        url: formData.local.url,
        status: formData.local.url ? 'pending' : 'disabled',
        lastCheck: formData.local.url ? new Date() : null
      },
      cloud: {
        url: formData.cloud.url,
        status: formData.cloud.url ? 'pending' : 'disabled',
        lastCheck: formData.cloud.url ? new Date() : null
      }
    })
    setOpen(false)
    setFormData({
      name: '',
      description: '',
      local: { url: '' },
      cloud: { url: '' }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'offline':
        return 'bg-red-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'disabled':
        return 'bg-gray-300'
      default:
        return 'bg-gray-500'
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '从未检查'
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // 修改刷新函数
  const handleRefresh = async (projectId: string) => {
    setRefreshingStates(prev => ({ ...prev, [projectId]: true }))
    await refreshProjectStatus(projectId)
    setRefreshingStates(prev => ({ ...prev, [projectId]: false }))
  }

  // 批量刷新
  const handleBulkRefresh = async () => {
    const projectsToRefresh = selectedProjects.length > 0 ? selectedProjects : filteredProjects.map(p => p.id)
    setRefreshingStates(prev => {
      const newState = { ...prev }
      projectsToRefresh.forEach(id => { newState[id] = true })
      return newState
    })

    for (const id of projectsToRefresh) {
      await refreshProjectStatus(id)
    }

    setRefreshingStates(prev => {
      const newState = { ...prev }
      projectsToRefresh.forEach(id => { newState[id] = false })
      return newState
    })
  }

  // 批量删除
  const handleBulkDelete = () => {
    if (!selectedProjects.length) return
    if (confirm(`确定要删除选中的 ${selectedProjects.length} 个项目吗？`)) {
      selectedProjects.forEach(id => deleteProject(id))
      setSelectedProjects([])
    }
  }

  // 显示通知
  const showNotificationMessage = (message: string) => {
    setNotificationMessage(message)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={20} />
                新增项目
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增项目</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">项目名称</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">项目描述</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="localUrl">本地环境URL</Label>
                  <Input
                    id="localUrl"
                    value={formData.local.url}
                    onChange={e => setFormData(prev => ({ 
                      ...prev, 
                      local: { ...prev.local, url: e.target.value }
                    }))}
                    placeholder="可选"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cloudUrl">云端环境URL</Label>
                  <Input
                    id="cloudUrl"
                    value={formData.cloud.url}
                    onChange={e => setFormData(prev => ({ 
                      ...prev, 
                      cloud: { ...prev.cloud, url: e.target.value }
                    }))}
                    placeholder="可选"
                  />
                </div>
                <div className="text-sm text-gray-500">
                  注：本地环境和云端环境URL至少填一个
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    取消
                  </Button>
                  <Button type="submit">确认</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {selectedProjects.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={handleBulkRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw size={16} />
                刷新��中 ({selectedProjects.length})
              </Button>
              <Button
                variant="outline"
                onClick={handleBulkDelete}
                className="flex items-center gap-2 text-red-500"
              >
                <Trash2 size={16} />
                删除选中
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="搜索项目..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                状态筛选
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {['online', 'offline', 'pending', 'disabled'].map(status => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={selectedStatus.includes(status)}
                  onCheckedChange={(checked) => {
                    setSelectedStatus(prev =>
                      checked
                        ? [...prev, status]
                        : prev.filter(s => s !== status)
                    )
                  }}
                >
                  {status === 'online' && '在线'}
                  {status === 'offline' && '离线'}
                  {status === 'pending' && '检查中'}
                  {status === 'disabled' && '已禁用'}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 项目列表 */}
      <div className="mt-6 space-y-4">
        {filteredProjects.map(project => (
          <div 
            key={project.id} 
            className={`p-4 border rounded-lg shadow-sm ${
              selectedProjects.includes(project.id) ? 'border-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => {
              setSelectedProjects(prev =>
                prev.includes(project.id)
                  ? prev.filter(id => id !== project.id)
                  : [...prev, project.id]
              )
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium">{project.name}</h3>
                <p className="text-sm text-gray-500">{project.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleRefresh(project.id)}
                  title="刷新状态"
                  disabled={refreshingStates[project.id]}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshingStates[project.id] ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (confirm('确定要删除该项目吗？')) {
                      deleteProject(project.id)
                    }
                  }}
                  title="删除项目"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              {/* 本地环境 */}
              {project.local.url && (
                <div className="p-3 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">本地环境</span>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(project.local.status)}`} />
                      <a
                        href={project.local.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    最后检查: {formatDate(project.local.lastCheck)}
                  </div>
                  <div className="text-xs text-gray-500 truncate" title={project.local.url}>
                    URL: {project.local.url}
                  </div>
                </div>
              )}

              {/* 云端环境 */}
              {project.cloud.url && (
                <div className="p-3 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">云端环境</span>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(project.cloud.status)}`} />
                      <a
                        href={project.cloud.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    最后检查: {formatDate(project.cloud.lastCheck)}
                  </div>
                  <div className="text-xs text-gray-500 truncate" title={project.cloud.url}>
                    URL: {project.cloud.url}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 通知 */}
      {showNotification && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-md shadow-lg">
          {notificationMessage}
        </div>
      )}
    </div>
  )
} 
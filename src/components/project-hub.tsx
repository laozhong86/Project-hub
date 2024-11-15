"use client"

import React from 'react'
import { ProjectHub as ProjectHubComponent } from './ProjectHub'

// 使用命名导入和导出，避免循环引用
const ProjectHub = ProjectHubComponent

// 导出默认组件
export default ProjectHub
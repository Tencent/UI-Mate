import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import TopNav from './TopNav'
import Sidebar from './Sidebar'
import { getSidebarKey } from './Sidebar'

const SERVICE_NAMES = {
  ecs: '云服务器 ECS',
  oss: '对象存储 OSS',
  rds: '云数据库 RDS',
  vpc: '专有网络 VPC',
  slb: '负载均衡 SLB',
  billing: '费用中心',
  monitor: '云监控',
  tickets: '工单管理',
  account: '账号与安全'
}

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const sidebarKey = getSidebarKey(location.pathname)
  const serviceName = SERVICE_NAMES[sidebarKey]

  return (
    <>
      <TopNav
        serviceName={serviceName}
        sidebarCollapsed={collapsed}
        onToggleSidebar={() => setCollapsed(c => !c)}
      />
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        sidebarKey={sidebarKey}
      />
      <main className={`main-content${collapsed ? ' sidebar-collapsed' : ''}`}>
        {children}
      </main>
    </>
  )
}

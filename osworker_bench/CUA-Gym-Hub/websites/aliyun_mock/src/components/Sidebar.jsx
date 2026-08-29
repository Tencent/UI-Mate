import React from 'react'
import { NavLink, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SIDEBAR_CONFIGS = {
  home: [
    { label: '概览', path: '/' },
    { label: '收藏产品', path: '/' },
    { label: '最近访问', path: '/' }
  ],
  ecs: [
    { label: '实例', path: '/ecs/instances' },
    { label: '云盘', path: '/ecs/disks' },
    { label: '镜像', path: '/ecs/images' },
    { label: '安全组', path: '/ecs/security-groups' },
    { label: '密钥对', path: '/ecs/key-pairs' }
  ],
  oss: [
    { label: 'Bucket 列表', path: '/oss/buckets' }
  ],
  rds: [
    { label: '实例列表', path: '/rds/instances' }
  ],
  vpc: [
    { label: '专有网络', path: '/vpc/list' },
    { label: '交换机', path: '/vpc/vswitches' }
  ],
  slb: [
    { label: '实例管理', path: '/slb/instances' }
  ],
  billing: [
    { label: '费用概览', path: '/billing/overview' },
    { label: '账单管理', path: '/billing/bills' }
  ],
  monitor: [
    { label: '报警规则', path: '/monitor/alarms' }
  ],
  tickets: [
    { label: '工单列表', path: '/tickets' },
    { label: '提交工单', path: '/tickets/create' }
  ],
  account: [
    { label: '账号设置', path: '/account/settings' },
    { label: '安全设置', path: '/account/security' }
  ]
}

export function getSidebarKey(pathname) {
  if (pathname.startsWith('/ecs')) return 'ecs'
  if (pathname.startsWith('/oss')) return 'oss'
  if (pathname.startsWith('/rds')) return 'rds'
  if (pathname.startsWith('/vpc')) return 'vpc'
  if (pathname.startsWith('/slb')) return 'slb'
  if (pathname.startsWith('/billing')) return 'billing'
  if (pathname.startsWith('/monitor')) return 'monitor'
  if (pathname.startsWith('/tickets')) return 'tickets'
  if (pathname.startsWith('/account')) return 'account'
  return 'home'
}

export default function Sidebar({ collapsed, onToggle, sidebarKey }) {
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const items = SIDEBAR_CONFIGS[sidebarKey] || SIDEBAR_CONFIGS.home

  const buildPath = (path) => sid ? `${path}?sid=${sid}` : path

  return (
    <div className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      {!collapsed && items.map(item => (
        <NavLink
          key={item.path + item.label}
          to={buildPath(item.path)}
          className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
          end={item.path === '/'}
        >
          {item.label}
        </NavLink>
      ))}
      {collapsed && (
        <div style={{ padding: '8px 0' }}>
          {items.map(item => (
            <NavLink
              key={item.path + item.label}
              to={buildPath(item.path)}
              className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
              title={item.label}
              end={item.path === '/'}
              style={{ justifyContent: 'center', padding: '0 12px' }}
            >
              <span style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label[0]}</span>
            </NavLink>
          ))}
        </div>
      )}
      <div className="sidebar-collapse-btn" onClick={onToggle} title={collapsed ? '展开' : '收起'}>
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </div>
    </div>
  )
}

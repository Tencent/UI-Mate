import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useApp } from '../context/AppContext'

const CATALOG = [
  {
    category: '计算',
    items: [
      { id: 'ecs', name: '云服务器 ECS', path: '/ecs' },
      { id: 'auto-scaling', name: '弹性伸缩', path: '/ecs' },
      { id: 'container', name: '容器服务 ACK', path: '/ecs' },
      { id: 'fc', name: '函数计算 FC', path: '/ecs' },
      { id: 'simple-server', name: '轻量应用服务器', path: '/ecs' }
    ]
  },
  {
    category: '存储',
    items: [
      { id: 'oss', name: '对象存储 OSS', path: '/oss' },
      { id: 'nas', name: '文件存储 NAS', path: '/oss' },
      { id: 'tablestore', name: '表格存储', path: '/oss' },
      { id: 'hbr', name: '混合云备份', path: '/oss' }
    ]
  },
  {
    category: '数据库',
    items: [
      { id: 'rds', name: '云数据库 RDS', path: '/rds' },
      { id: 'polardb', name: 'PolarDB', path: '/rds' },
      { id: 'redis', name: '云数据库 Redis', path: '/rds' },
      { id: 'mongodb', name: '云数据库 MongoDB', path: '/rds' },
      { id: 'hbase', name: '云数据库 HBase', path: '/rds' }
    ]
  },
  {
    category: '网络',
    items: [
      { id: 'vpc', name: '专有网络 VPC', path: '/vpc' },
      { id: 'slb', name: '负载均衡 SLB', path: '/slb' },
      { id: 'nat', name: 'NAT 网关', path: '/vpc' },
      { id: 'eip', name: '弹性公网IP', path: '/vpc' },
      { id: 'cdn', name: 'CDN', path: '/vpc' },
      { id: 'dc', name: '高速通道', path: '/vpc' }
    ]
  },
  {
    category: '安全',
    items: [
      { id: 'firewall', name: '云防火墙', path: '/ecs' },
      { id: 'waf', name: 'Web应用防火墙', path: '/ecs' },
      { id: 'security-center', name: '安全中心', path: '/ecs' },
      { id: 'ddos', name: 'DDoS防护', path: '/ecs' }
    ]
  },
  {
    category: '监控与管理',
    items: [
      { id: 'cloudmonitor', name: '云监控', path: '/monitor' },
      { id: 'log', name: '日志服务 SLS', path: '/monitor' },
      { id: 'arms', name: 'ARMS', path: '/monitor' }
    ]
  },
  {
    category: '开发者工具',
    items: [
      { id: 'api-gw', name: 'API 网关', path: '/ecs' },
      { id: 'ros', name: '资源编排 ROS', path: '/ecs' },
      { id: 'cloud-shell', name: 'Cloud Shell', path: '/ecs' }
    ]
  }
]

export default function ProductCatalog({ onClose }) {
  const { state, updateState } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')

  const favoriteIds = state.favoriteProducts.map(f => f.id)

  const buildPath = (path) => sid ? `${path}?sid=${sid}` : path

  const toggleFavorite = (e, item) => {
    e.stopPropagation()
    const isFav = favoriteIds.includes(item.id)
    if (isFav) {
      updateState(prev => ({ ...prev, favoriteProducts: prev.favoriteProducts.filter(f => f.id !== item.id) }))
    } else {
      updateState(prev => ({ ...prev, favoriteProducts: [...prev.favoriteProducts, { id: item.id, name: item.name.split(' ')[0], nameZh: item.name, path: item.path }] }))
    }
  }

  const handleClick = (item) => {
    navigate(buildPath(item.path))
    onClose()
  }

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="product-catalog-overlay" onClick={onClose}>
      <div className="product-catalog-panel" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0 32px' }}>
          {CATALOG.map(cat => (
            <div key={cat.category} style={{ marginBottom: 24 }}>
              <div className="product-category-title">{cat.category}</div>
              <div className="product-grid">
                {cat.items.map(item => (
                  <div key={item.id} className="product-item" onClick={() => handleClick(item)}>
                    <span>{item.name}</span>
                    <span
                      className={`star-icon ${favoriteIds.includes(item.id) ? 'favorited' : ''}`}
                      onClick={e => toggleFavorite(e, item)}
                    >
                      <Star size={14} fill={favoriteIds.includes(item.id) ? '#FFA003' : 'none'} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

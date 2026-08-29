import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Server, Database, Share2, HardDrive } from 'lucide-react'
import { useApp } from '../context/AppContext'

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}小时前`
  return Math.floor(h / 24) + '天前'
}

export default function ConsoleDashboard() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const buildPath = (p) => sid ? `${p}?sid=${sid}` : p

  const ecsCount = state.ecsInstances.filter(i => i.regionId === state.currentRegion).length
  const ossCount = state.ossBuckets.length
  const rdsCount = state.rdsInstances.filter(i => i.regionId === state.currentRegion).length
  const slbCount = state.slbInstances.filter(i => i.regionId === state.currentRegion).length

  const runningEcs = state.ecsInstances.filter(i => i.regionId === state.currentRegion && i.status === 'Running').length
  const spend = state.billing.monthlySpend
  const maxSpend = Math.max(...spend.map(s => s.amount))

  const recentOps = state.operationLog.slice(0, 5)

  return (
    <div>
      {/* Welcome Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1D1D1D 0%, #333 100%)', color: 'white', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>欢迎回来，{state.user.displayName}</div>
            <div style={{ fontSize: 13, color: '#999' }}>账号：{state.user.accountName} | ID：{state.user.accountId}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>当前地域：{state.regions.find(r => r.id === state.currentRegion)?.name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>账户余额</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#FF6A00' }}>{state.billing.balance.toLocaleString('zh-CN', { minimumFractionDigits: 2 })} 元</div>
            <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => navigate(buildPath('/billing/overview'))}>充值</button>
          </div>
        </div>
      </div>

      {/* Resource Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card" onClick={() => navigate(buildPath('/ecs/instances'))}>
          <div style={{ color: '#FF6A00', marginBottom: 8 }}><Server size={32} /></div>
          <div className="summary-card-count">{ecsCount}</div>
          <div className="summary-card-label">云服务器 ECS</div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>运行中 {runningEcs}</div>
        </div>
        <div className="summary-card" onClick={() => navigate(buildPath('/oss/buckets'))}>
          <div style={{ color: '#FF6A00', marginBottom: 8 }}><HardDrive size={32} /></div>
          <div className="summary-card-count">{ossCount}</div>
          <div className="summary-card-label">对象存储 OSS</div>
        </div>
        <div className="summary-card" onClick={() => navigate(buildPath('/rds/instances'))}>
          <div style={{ color: '#FF6A00', marginBottom: 8 }}><Database size={32} /></div>
          <div className="summary-card-count">{rdsCount}</div>
          <div className="summary-card-label">云数据库 RDS</div>
        </div>
        <div className="summary-card" onClick={() => navigate(buildPath('/slb/instances'))}>
          <div style={{ color: '#FF6A00', marginBottom: 8 }}><Share2 size={32} /></div>
          <div className="summary-card-count">{slbCount}</div>
          <div className="summary-card-label">负载均衡 SLB</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Billing Snapshot */}
        <div className="card">
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
            费用概览
            <button className="btn-text" style={{ fontSize: 12 }} onClick={() => navigate(buildPath('/billing/overview'))}>查看详情</button>
          </div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>本月消费</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#FF6A00', marginBottom: 16 }}>
            {spend[0]?.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })} 元
          </div>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>近6个月趋势</div>
          {spend.map(s => (
            <div key={s.month} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#666', minWidth: 70 }}>{s.month}</span>
              <div style={{ flex: 1, height: 8, background: '#F0F0F0', borderRadius: 2 }}>
                <div style={{ width: `${(s.amount / maxSpend) * 100}%`, height: '100%', background: '#FF6A00', borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 12, color: '#333', minWidth: 80, textAlign: 'right' }}>{s.amount.toFixed(2)}元</span>
            </div>
          ))}
        </div>

        <div>
          {/* Quick Actions */}
          <div className="card">
            <div className="card-title">快捷操作</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button className="btn-normal" onClick={() => navigate(buildPath('/ecs/instances'))}>创建ECS实例</button>
              <button className="btn-normal" onClick={() => navigate(buildPath('/oss/buckets'))}>创建OSS Bucket</button>
              <button className="btn-normal" onClick={() => navigate(buildPath('/rds/instances'))}>创建RDS实例</button>
              <button className="btn-normal" onClick={() => navigate(buildPath('/vpc/list'))}>创建VPC</button>
              <button className="btn-normal" onClick={() => navigate(buildPath('/tickets/create'))}>提交工单</button>
            </div>
          </div>

          {/* Favorites */}
          <div className="card">
            <div className="card-title">收藏产品</div>
            {state.favoriteProducts.length === 0 && (
              <div style={{ color: '#999', fontSize: 13 }}>暂无收藏。点击产品菜单中的星标图标添加。</div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {state.favoriteProducts.map(p => (
                <button
                  key={p.id}
                  className="btn-normal"
                  style={{ fontSize: 13 }}
                  onClick={() => navigate(buildPath(p.path))}
                >
                  {p.nameZh || p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Operations */}
          <div className="card">
            <div className="card-title">最近操作</div>
            {recentOps.length === 0 && <div style={{ color: '#999', fontSize: 13 }}>暂无操作记录</div>}
            {recentOps.map(op => (
              <div
                key={op.id}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #F0F0F0' }}
              >
                <div>
                  <span style={{ fontSize: 12, color: '#0070CC', marginRight: 8 }}>{op.serviceName}</span>
                  <span style={{ fontSize: 13 }}>{op.eventName}</span>
                  <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>{op.resourceName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: op.result === '成功' ? '#1DC11D' : '#FF3333' }}>{op.result}</span>
                  <span style={{ fontSize: 11, color: '#999' }}>{relativeTime(op.eventTime)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

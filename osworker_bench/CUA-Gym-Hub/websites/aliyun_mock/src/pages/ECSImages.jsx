import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'

export default function ECSImages() {
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const buildPath = (p) => sid ? `${p}?sid=${sid}` : p

  const images = [
    { id: 'aliyun_3_x64_20G_alibase_20230727', name: 'Alibaba Cloud Linux 3.2104 LTS 64位', type: '公共镜像', size: '20 GiB', os: 'linux' },
    { id: 'centos_7_9_x64_20G_alibase_20230901', name: 'CentOS 7.9 64位', type: '公共镜像', size: '20 GiB', os: 'linux' },
    { id: 'ubuntu_22_04_x64_20G_alibase_20230901', name: 'Ubuntu 22.04 64位', type: '公共镜像', size: '20 GiB', os: 'linux' },
    { id: 'win2022_dc_x64_20G_alibase_20230901', name: 'Windows Server 2022 数据中心版 64位', type: '公共镜像', size: '40 GiB', os: 'windows' },
    { id: 'win2019_dc_x64_20G_alibase_20230901', name: 'Windows Server 2019 数据中心版 64位', type: '公共镜像', size: '40 GiB', os: 'windows' }
  ]

  return (
    <div>
      <div className="breadcrumb">
        <Link to={buildPath('/')} className="link">控制台首页</Link>
        <span className="sep">&gt;</span>
        <Link to={buildPath('/ecs/instances')} className="link">云服务器 ECS</Link>
        <span className="sep">&gt;</span>
        <span>镜像</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">镜像列表</h1>
      </div>
      <table className="data-table">
        <thead><tr><th>镜像ID</th><th>名称</th><th>类型</th><th>操作系统</th><th>大小</th></tr></thead>
        <tbody>
          {images.map(img => (
            <tr key={img.id}>
              <td><span className="mono">{img.id}</span></td>
              <td>{img.name}</td>
              <td>{img.type}</td>
              <td>{img.os === 'linux' ? 'Linux' : 'Windows'}</td>
              <td>{img.size}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

import React, { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { ChevronRight } from 'lucide-react'

export default function SettingsPage() {
  const { tab } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const { state, setState } = useApp()
  const [mainTab, setMainTab] = useState(tab || 'org')

  function navTo(path) {
    navigate(sid ? `${path}?sid=${sid}` : path)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{
        height: 48, display: 'flex', alignItems: 'center', padding: '0 24px',
        borderBottom: '1px solid #E4E4E8', background: '#fff', flexShrink: 0
      }}>
        <h1 style={{ fontSize: 16, fontWeight: 600, color: '#1B1B2E' }}>Settings</h1>
      </div>

      <div style={{
        display: 'flex', borderBottom: '1px solid #E4E4E8', padding: '0 24px',
        background: '#fff', flexShrink: 0, gap: 4
      }}>
        {['org', 'project', 'profile'].map(t => (
          <button key={t} onClick={() => { setMainTab(t); navTo(`/settings/${t}`) }} style={{
            padding: '10px 14px', border: 'none', background: 'none',
            borderRadius: '6px 6px 0 0', cursor: 'pointer', fontSize: 13,
            fontWeight: mainTab === t ? 600 : 400,
            color: mainTab === t ? '#4F44E0' : '#8E8EA0',
            borderBottom: mainTab === t ? '2px solid #4F44E0' : '2px solid transparent',
            marginBottom: -1, textTransform: 'capitalize'
          }}>
            {t === 'org' ? 'Organization' : t}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {mainTab === 'profile' && <ProfileSettings state={state} setState={setState} />}
        {mainTab === 'org' && <OrgSettings state={state} />}
        {mainTab === 'project' && <ProjectSettings state={state} />}
      </div>
    </div>
  )
}

function ProfileSettings({ state, setState }) {
  const profile = state?.settings?.profile || {}
  const [name, setName] = useState(profile.name || 'Sam Lee')
  const [editing, setEditing] = useState(false)

  function saveName() {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, profile: { ...prev.settings.profile, name } },
      currentUser: { ...prev.currentUser, name }
    }))
    setEditing(false)
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px', maxWidth: 600 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Your Profile</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: '#4F44E0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, color: '#fff', fontWeight: 700
        }}>
          {name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1B1B2E', marginBottom: 6 }}>Name</label>
        {editing ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input value={name} onChange={e => setName(e.target.value)} style={{
              border: '1px solid #4F44E0', borderRadius: 6, padding: '7px 12px',
              fontSize: 14, outline: 'none', width: 240
            }} />
            <button onClick={() => setEditing(false)} style={{
              padding: '7px 14px', border: '1px solid #E4E4E8', borderRadius: 6,
              background: '#fff', cursor: 'pointer', fontSize: 13
            }}>Cancel</button>
            <button onClick={saveName} style={{
              padding: '7px 14px', border: 'none', borderRadius: 6,
              background: '#4F44E0', color: '#fff', cursor: 'pointer', fontSize: 13
            }}>Save</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: '#1B1B2E' }}>{name}</span>
            <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4F44E0', fontSize: 12 }}>Edit</button>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1B1B2E', marginBottom: 6 }}>Email</label>
        <span style={{ fontSize: 14, color: '#585870' }}>{profile.email || 'samlee@example.com'}</span>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1B1B2E', marginBottom: 6 }}>Password</label>
        <span style={{ fontSize: 14, color: '#585870' }}>********</span>
      </div>
    </div>
  )
}

function OrgSettings({ state }) {
  const members = state?.settings?.orgMembers || []

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Organization</h2>
      <div style={{ fontSize: 13, color: '#8E8EA0', marginBottom: 24 }}>{state?.settings?.org?.name} -- {state?.settings?.org?.plan} Plan</div>

      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Members</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#F7F7F8' }}>
            {['Name', 'Email', 'Role', 'Date Joined', 'Last Active'].map(h => (
              <th key={h} style={{ padding: '8px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#8E8EA0', borderBottom: '1px solid #E4E4E8' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map(member => (
            <tr key={member.id} style={{ borderBottom: '1px solid #E4E4E8' }}>
              <td style={{ padding: '10px 16px', fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#4F44E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 600, flexShrink: 0 }}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  {member.name}
                </div>
              </td>
              <td style={{ padding: '10px 16px', fontSize: 13, color: '#585870' }}>{member.email}</td>
              <td style={{ padding: '10px 16px', fontSize: 13 }}>
                <span style={{
                  fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4,
                  background: member.role === 'Owner' ? '#EEEDFC' : '#F7F7F8',
                  color: member.role === 'Owner' ? '#4F44E0' : '#8E8EA0'
                }}>{member.role}</span>
              </td>
              <td style={{ padding: '10px 16px', fontSize: 13, color: '#8E8EA0' }}>{member.dateJoined}</td>
              <td style={{ padding: '10px 16px', fontSize: 13, color: '#8E8EA0' }}>{member.lastActive}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ProjectSettings({ state }) {
  const project = state?.settings?.project || {}
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px', maxWidth: 600 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Project Settings</h2>
      {[
        ['Project Name', project.name || 'Acme Analytics'],
        ['Timezone', project.timezone || 'US/Pacific'],
        ['Data Retention', project.dataRetention || '365 days'],
      ].map(([k, v]) => (
        <div key={k} style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1B1B2E', marginBottom: 6 }}>{k}</label>
          <div style={{ fontSize: 14, color: '#585870' }}>{v}</div>
        </div>
      ))}
    </div>
  )
}

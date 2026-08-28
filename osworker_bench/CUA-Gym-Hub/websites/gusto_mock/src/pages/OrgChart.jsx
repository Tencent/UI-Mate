import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { getInitials, getAvatarColor } from '../utils/helpers'

const OrgChart = () => {
  const { state } = useAppContext()
  const navigate = useNavigate()
  const employees = state?.employees || []

  const jessica = employees.find(e => e.id === 'emp_1')
  const directReports = employees.filter(e => e.managerId === 'emp_1' && e.id !== 'emp_1')

  const getReports = (managerId) => employees.filter(e => e.managerId === managerId)

  const EmpNode = ({ emp }) => (
    <div
      onClick={() => navigate(`/people/team-members/${emp.id}`)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
        padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--white)',
        width: '140px', textAlign: 'center', transition: 'box-shadow 0.15s',
        boxShadow: 'var(--shadow-card)'
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}
    >
      <div className="avatar avatar-md" style={{ background: getAvatarColor(`${emp.firstName} ${emp.lastName}`) }}>
        {getInitials(emp.firstName, emp.lastName)}
      </div>
      <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: '600', lineHeight: '1.2' }}>{emp.firstName} {emp.lastName}</div>
      <div style={{ fontSize: '11px', color: 'var(--medium-gray)', marginTop: '3px', lineHeight: '1.3' }}>{emp.jobTitle}</div>
    </div>
  )

  return (
    <div className="page-container" style={{ maxWidth: '1200px' }}>
      <div className="page-header">
        <h1 className="page-title">Org Chart</h1>
      </div>

      <div style={{ overflowX: 'auto', padding: '16px 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
          {/* Top level */}
          {jessica && (
            <div style={{ marginBottom: '0' }}>
              <EmpNode emp={jessica} />
              <div style={{ width: '2px', height: '24px', background: 'var(--border)', margin: '0 auto' }} />
            </div>
          )}

          {/* Direct reports row */}
          <div style={{ display: 'flex', gap: '20px', position: 'relative' }}>
            {/* Horizontal line */}
            <div style={{
              position: 'absolute', top: 0, left: '70px', right: '70px', height: '2px', background: 'var(--border)'
            }} />
            {directReports.map(emp => {
              const reports = getReports(emp.id)
              return (
                <div key={emp.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '2px', height: '24px', background: 'var(--border)', margin: '0 auto' }} />
                  <EmpNode emp={emp} />
                  {reports.length > 0 && (
                    <>
                      <div style={{ width: '2px', height: '16px', background: 'var(--border)', margin: '0 auto' }} />
                      <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                        {reports.length > 1 && (
                          <div style={{
                            position: 'absolute', top: 0, left: '50px', right: '50px', height: '2px', background: 'var(--border)'
                          }} />
                        )}
                        {reports.map(r => (
                          <div key={r.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {reports.length > 1 && <div style={{ width: '2px', height: '16px', background: 'var(--border)' }} />}
                            <EmpNode emp={r} />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrgChart

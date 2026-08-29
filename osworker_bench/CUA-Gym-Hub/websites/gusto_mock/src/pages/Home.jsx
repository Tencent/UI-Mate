import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { formatDate } from '../utils/helpers'

const Home = () => {
  const { state, completeTodo } = useAppContext()
  const navigate = useNavigate()

  const todoItems = (state?.todoItems || []).filter(t => t.status === 'pending')
  const payrolls = state?.payrolls || []
  const draftPayroll = payrolls.find(p => p.status === 'Draft')
  const completedPayrolls = payrolls.filter(p => p.status === 'Complete').slice(0, 3)
  const timeOffRequests = (state?.timeOffRequests || []).filter(r => r.status === 'Approved').slice(0, 2)

  const recentActivity = [
    ...completedPayrolls.map(p => ({
      id: p.id,
      text: `Payroll completed for ${formatDate(p.checkDate)} — ${p.employeeCount || 12} employees paid`,
      date: p.checkDate,
      type: 'payroll'
    })),
    ...timeOffRequests.map(r => ({
      id: r.id,
      text: `${r.employeeName}'s ${r.type.toLowerCase()} time off was approved`,
      date: r.reviewedAt,
      type: 'timeoff'
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  const typeColors = {
    payroll: 'var(--teal)',
    onboarding: 'var(--coral)',
    tax: '#1565C0',
    benefits: '#6A1B9A',
    general: 'var(--medium-gray)'
  }

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--charcoal)' }}>
          Welcome back, Jessica!
        </h1>
        <p style={{ color: 'var(--medium-gray)', marginTop: '4px' }}>
          Here's what needs your attention today.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
        {/* Left column */}
        <div>
          {/* Things to do */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Things to do</h2>
            {todoItems.length === 0 ? (
              <div style={{ color: 'var(--medium-gray)', fontSize: '14px', padding: '16px 0' }}>
                All caught up! Nothing to do right now.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {todoItems.map(todo => (
                  <div
                    key={todo.id}
                    style={{
                      borderLeft: `4px solid ${typeColors[todo.type] || 'var(--teal)'}`,
                      paddingLeft: '16px',
                      paddingTop: '4px',
                      paddingBottom: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{todo.title}</div>
                        <div style={{ color: 'var(--medium-gray)', fontSize: '13px', marginTop: '2px' }}>{todo.description}</div>
                        {todo.dueDate && (
                          <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--warning)', fontWeight: '500' }}>
                            Due {formatDate(todo.dueDate)}
                          </div>
                        )}
                      </div>
                      <button
                        className="btn-primary btn-sm"
                        onClick={() => { completeTodo(todo.id); navigate(todo.actionUrl) }}
                        style={{ whiteSpace: 'nowrap', marginTop: '2px' }}
                      >
                        Start &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Recent activity</h2>
            {recentActivity.length === 0 ? (
              <div style={{ color: 'var(--medium-gray)', fontSize: '14px' }}>No recent activity</div>
            ) : (
              <div>
                {recentActivity.map((item, i) => (
                  <div
                    key={item.id + i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 0',
                      borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border)' : 'none'
                    }}
                  >
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: item.type === 'payroll' ? 'var(--teal)' : 'var(--success)',
                      flexShrink: 0
                    }} />
                    <div style={{ fontSize: '13px', flex: 1 }}>{item.text}</div>
                    <div style={{ fontSize: '12px', color: 'var(--medium-gray)', whiteSpace: 'nowrap' }}>
                      {formatDate(item.date)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Upcoming Payroll */}
          {draftPayroll && (
            <div className="card" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--medium-gray)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                Upcoming Payroll
              </h3>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--charcoal)' }}>
                  {formatDate(draftPayroll.checkDate)}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--medium-gray)', marginTop: '2px' }}>
                  Pay period: {formatDate(draftPayroll.payPeriod.startDate)} – {formatDate(draftPayroll.payPeriod.endDate)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--warning)', marginTop: '4px', fontWeight: '500' }}>
                  Due by {formatDate(draftPayroll.deadline)}
                </div>
              </div>
              <button
                className="btn-primary"
                onClick={() => navigate('/payroll/run')}
                style={{ width: '100%' }}
              >
                Run payroll
              </button>
            </div>
          )}

          {/* Team stats */}
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--medium-gray)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
              Team Overview
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Total employees', value: (state?.employees || []).length },
                { label: 'Active', value: (state?.employees || []).filter(e => e.status === 'Active').length },
                { label: 'Onboarding', value: (state?.employees || []).filter(e => e.status === 'Onboarding').length },
                { label: 'Contractors', value: (state?.contractors || []).length }
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--medium-gray)' }}>{item.label}</span>
                  <span style={{ fontWeight: '600' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

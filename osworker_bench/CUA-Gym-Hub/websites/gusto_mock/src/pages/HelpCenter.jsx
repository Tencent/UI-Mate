import { useState } from 'react'

const helpArticles = [
  { id: 'h1', category: 'Payroll', title: 'How to run payroll', content: 'Navigate to Payroll > Run Payroll. Review employee hours, earnings, and deductions. Click "Preview Payroll" to review the summary, then "Submit Payroll" to process. Payroll is typically processed 2 business days before the pay date.' },
  { id: 'h2', category: 'Payroll', title: 'Setting up direct deposit', content: 'Go to the employee profile, select "Payment Method" and enter the bank account details including routing and account numbers. Employees can also self-service set up their direct deposit from their own Xusto account.' },
  { id: 'h3', category: 'Payroll', title: 'Off-cycle payroll', content: 'To run an off-cycle payroll, go to Payroll > Run Payroll and select "Off-cycle" as the payroll type. This is useful for bonuses, corrections, or final paychecks for terminated employees.' },
  { id: 'h4', category: 'Benefits', title: 'Adding health insurance', content: 'Navigate to Benefits and click "Add Benefit". Select your insurance provider, upload the plan details, and assign eligible employees. Open enrollment periods can be configured under Benefits > Settings.' },
  { id: 'h5', category: 'Benefits', title: 'Managing 401(k) plans', content: 'Xusto integrates with retirement plan providers. Go to Benefits > Retirement to set up employer match rules, vesting schedules, and employee contribution limits. Changes are synced automatically with each payroll run.' },
  { id: 'h6', category: 'Onboarding', title: 'Adding a new employee', content: 'Go to People > Team Members and click "Add Employee". Enter the employee\'s personal info, compensation details, and start date. The employee will receive an invitation email to complete their onboarding checklist including tax forms and direct deposit setup.' },
  { id: 'h7', category: 'Onboarding', title: 'Custom onboarding checklists', content: 'Create custom onboarding tasks under People > Settings > Onboarding. You can add document uploads, policy acknowledgments, equipment requests, and custom tasks that new hires complete during their first week.' },
  { id: 'h8', category: 'Time & Attendance', title: 'Time tracking setup', content: 'Enable time tracking under Time Tools > Time Tracking. Employees can clock in/out from their Xusto account or mobile app. Managers approve timesheets before each payroll run. Overtime rules are configured based on your state requirements.' },
  { id: 'h9', category: 'Time & Attendance', title: 'Time off policies', content: 'Configure PTO, sick leave, and other time off policies under Time Tools > Time Off. Set accrual rates, carryover limits, and waiting periods. Employees request time off through Xusto and managers approve or deny requests.' },
  { id: 'h10', category: 'Taxes', title: 'Tax filing and compliance', content: 'Xusto automatically files federal, state, and local payroll taxes. View filing status under Taxes & Compliance. Year-end forms (W-2, 1099) are generated automatically and can be reviewed before distribution to employees.' },
  { id: 'h11', category: 'Taxes', title: 'State tax registration', content: 'If you hire employees in a new state, you may need to register for state tax accounts. Go to Taxes & Compliance > State Tax Setup to see which registrations are needed and get step-by-step guidance.' },
  { id: 'h12', category: 'Reports', title: 'Generating payroll reports', content: 'Navigate to Reports to access pre-built reports including payroll summaries, tax liability, employee census, and benefits enrollment. Reports can be filtered by date range and exported to CSV or PDF.' },
]

const categories = ['All', ...new Set(helpArticles.map(a => a.category))]

const HelpCenter = () => {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [expandedArticle, setExpandedArticle] = useState(null)

  const filtered = helpArticles.filter(article => {
    const matchesSearch = !search || article.title.toLowerCase().includes(search.toLowerCase()) || article.content.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="page-container">
      <h1 className="page-title">Help Center</h1>
      <p style={{ color: 'var(--medium-gray)', fontSize: '14px', marginBottom: '24px' }}>
        Find answers to common questions about payroll, benefits, taxes, and more.
      </p>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search help articles..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '8px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
              border: selectedCategory === cat ? '1px solid var(--teal)' : '1px solid var(--border)',
              background: selectedCategory === cat ? 'var(--teal)' : 'var(--white)',
              color: selectedCategory === cat ? 'var(--white)' : 'var(--dark-gray)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map(article => (
          <div key={article.id} className="card" style={{ cursor: 'pointer', transition: 'box-shadow 0.15s' }}
            onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', background: '#E8F5E9', color: '#2E7D32', padding: '2px 8px', borderRadius: '10px', fontWeight: '500' }}>{article.category}</span>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>{article.title}</span>
                </div>
              </div>
              <span style={{ color: 'var(--medium-gray)', fontSize: '18px', transition: 'transform 0.2s', transform: expandedArticle === article.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                &#9662;
              </span>
            </div>
            {expandedArticle === article.id && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '14px', lineHeight: '1.6', color: 'var(--dark-gray)' }}>
                {article.content}
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--medium-gray)' }}>
          No articles found. Try a different search term or category.
        </div>
      )}
    </div>
  )
}

export default HelpCenter

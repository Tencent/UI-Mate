import React from 'react';
import { Shield, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

function MetricBar({ current, target, higherIsBetter = false }) {
  const pct = higherIsBetter
    ? Math.min(100, (current / target) * 100)
    : Math.min(100, (current / target) * 100);
  const isGood = higherIsBetter ? current >= target : current <= target;
  const isWarn = !isGood && (higherIsBetter ? current >= target * 0.9 : current <= target * 1.5);
  const color = isGood ? '#067d62' : isWarn ? '#b7791f' : '#d13212';
  const fillPct = higherIsBetter ? (current / target) * 100 : (1 - current / (target * 2)) * 100;
  return (
    <div style={{ marginTop: 8 }}>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: Math.min(100, Math.max(5, fillPct)) + '%', background: color }} />
      </div>
    </div>
  );
}

function MetricCard({ label, current, target, status, unit = '%', higherIsBetter = false }) {
  const statusColor = status === 'Good' ? '#067d62' : status === 'Fair' ? '#b7791f' : '#d13212';
  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>{current}{unit}</div>
      <div style={{ fontSize: 12, color: '#555' }}>Target: {higherIsBetter ? '>' : '<'}{target}{unit}</div>
      <MetricBar current={current} target={target} higherIsBetter={higherIsBetter} />
      <div style={{ marginTop: 6 }}><span className={`badge ${status === 'Good' ? 'badge-success' : status === 'Fair' ? 'badge-pending' : 'badge-error'}`}>{status}</span></div>
    </div>
  );
}

export default function AccountHealth() {
  const { state } = useApp();
  if (!state) return null;
  const { accountHealth } = state;
  const { customerServicePerformance: csp, policyCompliance: pc, shippingPerformance: sp } = accountHealth;

  const healthColor = accountHealth.overallRating === 'Good' ? '#067d62' : accountHealth.overallRating === 'At Risk' ? '#b7791f' : '#d13212';

  const policyItems = [
    { label: 'Intellectual Property Complaints', count: pc.intellectualPropertyComplaints },
    { label: 'Product Authenticity', count: pc.productAuthenticityComplaints },
    { label: 'Product Condition', count: pc.productConditionComplaints },
    { label: 'Listing Policy Violations', count: pc.listingPolicyViolations },
    { label: 'Restricted Products', count: pc.restrictedProductViolations },
    { label: 'Food Safety Issues', count: pc.foodSafetyIssues }
  ];

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 16px' }}>Account Health</h1>

      {/* Overall Banner */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: healthColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Shield size={36} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111' }}>Account Health Rating: {accountHealth.accountHealthRating}</div>
          <div style={{ fontSize: 16, color: healthColor, fontWeight: 700, marginTop: 4 }}>Your account is in {accountHealth.overallRating} standing</div>
          <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>Score above 200 is considered healthy. Maximum score is 1000.</div>
        </div>
      </div>

      {/* Customer Service Performance */}
      <div className="card">
        <div className="card-title">Customer Service Performance</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Current</th>
              <th>Target</th>
              <th>Status</th>
              <th style={{ width: 200 }}>Progress</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Order Defect Rate (ODR)</td>
              <td>{csp.orderDefectRate.current}%</td>
              <td>&lt;{csp.orderDefectRate.target}%</td>
              <td><span className={`badge ${csp.orderDefectRate.status === 'Good' ? 'badge-success' : 'badge-error'}`}>{csp.orderDefectRate.status}</span></td>
              <td><MetricBar current={csp.orderDefectRate.current} target={csp.orderDefectRate.target} /></td>
            </tr>
            <tr>
              <td>Negative Feedback Rate</td>
              <td>{csp.negativeFeedbackRate.current}%</td>
              <td>-</td>
              <td><span className="badge badge-success">Good</span></td>
              <td>-</td>
            </tr>
            <tr>
              <td>A-to-z Guarantee Claims</td>
              <td>{csp.aToZClaimRate.current}%</td>
              <td>-</td>
              <td><span className="badge badge-success">Good</span></td>
              <td>-</td>
            </tr>
            <tr>
              <td>Chargeback Rate</td>
              <td>{csp.chargebackRate.current}%</td>
              <td>-</td>
              <td><span className="badge badge-success">Good</span></td>
              <td>-</td>
            </tr>
          </tbody>
        </table>
        <div style={{ marginTop: 12, fontSize: 12, color: '#555' }}>
          ODR breakdown: {csp.orderDefectRate.orders} defective orders out of {csp.orderDefectRate.totalOrders} total orders
        </div>
      </div>

      {/* Policy Compliance */}
      <div className="card">
        <div className="card-title">Policy Compliance</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {policyItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', border: '1px solid #eee', borderRadius: 4 }}>
              {item.count === 0 ? <CheckCircle size={18} color="#067d62" /> : <AlertTriangle size={18} color="#b7791f" />}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: item.count === 0 ? '#067d62' : '#b7791f' }}>{item.count === 0 ? 'No violations' : `${item.count} issue(s)`}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Performance */}
      <div className="card">
        <div className="card-title">Shipping Performance</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <MetricCard label="Late Shipment Rate" current={sp.lateShipmentRate.current} target={sp.lateShipmentRate.target} status={sp.lateShipmentRate.status} />
          <MetricCard label="Pre-Fulfillment Cancel Rate" current={sp.preFulfillmentCancelRate.current} target={sp.preFulfillmentCancelRate.target} status={sp.preFulfillmentCancelRate.status} />
          <MetricCard label="Valid Tracking Rate" current={sp.validTrackingRate.current} target={sp.validTrackingRate.target} status={sp.validTrackingRate.status} higherIsBetter />
          <MetricCard label="On-Time Delivery Rate" current={sp.onTimeDeliveryRate.current} target={sp.onTimeDeliveryRate.target} status={sp.onTimeDeliveryRate.status} higherIsBetter />
        </div>
      </div>
    </div>
  );
}

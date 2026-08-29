import { DateRangeButton } from '../components/DateRangePicker';

export default function AdvertisingOverview() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Advertising</h1>
        <DateRangeButton />
      </div>

      <div className="card" style={{ marginBottom: 24, padding: 20 }}>
        <div className="card-title">ADVERTISING OVERVIEW</div>
        <p style={{ fontSize: 14, color: 'var(--ga-text-secondary)', lineHeight: 1.6 }}>
          Link your Google Ads account to see advertising data here. Once linked, you can view conversion paths,
          attribution models, and advertising performance metrics.
        </p>
        <div style={{ marginTop: 16 }}>
          <button className="btn btn-primary">Link Google Ads</button>
        </div>
      </div>

      <div className="card-grid-2">
        <div className="card" style={{ padding: 20 }}>
          <div className="card-title">CONVERSION PATHS</div>
          <div className="empty-state">
            <p>No conversion path data available.</p>
            <p style={{ fontSize: 12 }}>Link a Google Ads account to see attribution data.</p>
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="card-title">MODEL COMPARISON</div>
          <div className="empty-state">
            <p>No model comparison data available.</p>
            <p style={{ fontSize: 12 }}>Link a Google Ads account to compare attribution models.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

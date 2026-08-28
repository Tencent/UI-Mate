import { useAppContext } from '../context/AppContext';
import { formatNumber, formatPercent, formatDuration, formatCurrency } from '../utils/dataManager';
import { DateRangeButton } from '../components/DateRangePicker';
import SortableTable from '../components/SortableTable';

export default function TrafficAcquisition() {
  const { state } = useAppContext();

  const columns = [
    { key: 'channelGroup', label: 'Session default channel group' },
    { key: 'sessions', label: 'Sessions', numeric: true, showBar: true, format: formatNumber },
    { key: 'engagedSessions', label: 'Engaged sessions', numeric: true, format: formatNumber },
    { key: 'engagementRate', label: 'Engagement rate', numeric: true, format: formatPercent },
    { key: 'avgEngagementTime', label: 'Avg. engagement time', numeric: true, format: formatDuration },
    { key: 'eventCount', label: 'Event count', numeric: true, format: formatNumber },
    { key: 'conversions', label: 'Conversions', numeric: true, format: formatNumber },
    { key: 'totalRevenue', label: 'Total revenue', numeric: true, format: formatCurrency },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Traffic acquisition</h1>
        <DateRangeButton />
      </div>
      <div className="comparison-bar">
        <div className="comparison-pill"><span className="dot" /> All Users</div>
        <div className="add-comparison-btn">+ Add comparison</div>
      </div>
      <SortableTable columns={columns} data={state.trafficSources} searchField="channelGroup" />
    </div>
  );
}

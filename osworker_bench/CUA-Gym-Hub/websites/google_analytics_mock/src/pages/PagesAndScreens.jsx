import { useAppContext } from '../context/AppContext';
import { formatNumber, formatDuration } from '../utils/dataManager';
import { DateRangeButton } from '../components/DateRangePicker';
import SortableTable from '../components/SortableTable';

export default function PagesAndScreens() {
  const { state } = useAppContext();

  const columns = [
    { key: 'pagePath', label: 'Page path and screen class' },
    { key: 'views', label: 'Views', numeric: true, showBar: true, format: formatNumber },
    { key: 'users', label: 'Users', numeric: true, format: formatNumber },
    { key: 'viewsPerUser', label: 'Views per user', numeric: true, format: v => v.toFixed(2) },
    { key: 'avgEngagementTime', label: 'Avg. engagement time', numeric: true, format: formatDuration },
    { key: 'eventCount', label: 'Event count', numeric: true, format: formatNumber },
    { key: 'conversions', label: 'Conversions', numeric: true, format: formatNumber },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pages and screens</h1>
        <DateRangeButton />
      </div>
      <SortableTable columns={columns} data={state.pages} searchField="pagePath" />
    </div>
  );
}

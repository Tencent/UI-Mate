import { useAppContext } from '../context/AppContext';
import { formatNumber, formatCurrency } from '../utils/dataManager';
import { DateRangeButton } from '../components/DateRangePicker';
import SortableTable from '../components/SortableTable';

export default function EventsReport() {
  const { state } = useAppContext();

  const columns = [
    {
      key: 'name', label: 'Event name',
      render: (val, row) => (
        <span>
          {val}
          {row.isKeyEvent && <span className="badge-key-event" style={{ marginLeft: 8 }}>Key event</span>}
        </span>
      )
    },
    { key: 'count', label: 'Event count', numeric: true, showBar: true, format: formatNumber },
    { key: 'totalUsers', label: 'Total users', numeric: true, format: formatNumber },
    { key: 'countPerUser', label: 'Count per user', numeric: true, format: v => v.toFixed(2) },
    { key: 'revenue', label: 'Total revenue', numeric: true, format: formatCurrency },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Events</h1>
        <DateRangeButton />
      </div>
      <SortableTable columns={columns} data={state.events} searchField="name" />
    </div>
  );
}

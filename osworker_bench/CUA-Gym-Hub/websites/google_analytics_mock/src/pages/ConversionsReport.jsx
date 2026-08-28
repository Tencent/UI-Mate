import { useAppContext } from '../context/AppContext';
import { formatNumber, formatCurrency } from '../utils/dataManager';
import { DateRangeButton } from '../components/DateRangePicker';
import SortableTable from '../components/SortableTable';

export default function ConversionsReport() {
  const { state } = useAppContext();
  const keyEvents = state.events.filter(e => e.isKeyEvent);

  const columns = [
    { key: 'name', label: 'Event name' },
    { key: 'count', label: 'Conversions', numeric: true, showBar: true, format: formatNumber },
    { key: 'totalUsers', label: 'Total users', numeric: true, format: formatNumber },
    { key: 'revenue', label: 'Total revenue', numeric: true, format: formatCurrency },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Conversions (Key events)</h1>
        <DateRangeButton />
      </div>
      <SortableTable columns={columns} data={keyEvents} />
    </div>
  );
}

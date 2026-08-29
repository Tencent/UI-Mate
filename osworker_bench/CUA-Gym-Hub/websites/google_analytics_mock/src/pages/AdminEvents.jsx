import { useAppContext } from '../context/AppContext';
import { formatNumber } from '../utils/dataManager';

export default function AdminEvents() {
  const { state, updateState } = useAppContext();

  const handleToggleKeyEvent = (eventId) => {
    updateState(prev => ({
      ...prev,
      events: prev.events.map(e =>
        e.id === eventId ? { ...e, isKeyEvent: !e.isKeyEvent } : e
      )
    }));
  };

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Events</h1>

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Event name</th>
              <th className="numeric">Count (last 28 days)</th>
              <th style={{ textAlign: 'center' }}>Mark as key event</th>
            </tr>
          </thead>
          <tbody>
            {state.events.map(event => (
              <tr key={event.id}>
                <td>
                  {event.name}
                  {event.isKeyEvent && <span className="badge-key-event" style={{ marginLeft: 8 }}>Key event</span>}
                </td>
                <td className="numeric">{formatNumber(event.count)}</td>
                <td style={{ textAlign: 'center' }}>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={event.isKeyEvent}
                      onChange={() => handleToggleKeyEvent(event.id)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

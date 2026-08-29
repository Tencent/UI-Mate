import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { withCurrentSearch } from '../utils/navigation';

const TYPE_COLORS = {
  web: '#632CA6', db: '#1a73e8', cache: '#0d652d', worker: '#c17d10', custom: '#666',
};

export default function APMServiceMap() {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const toPath = (path) => withCurrentSearch(path, location.search);
  const services = state.services;

  // Build adjacency
  const serviceMap = useMemo(() => {
    const map = {};
    services.forEach(s => { map[s.id] = s; });
    return map;
  }, [services]);

  // Layout: organize by tiers
  const tiers = useMemo(() => {
    const svcById = {};
    services.forEach(s => { svcById[s.id] = s; });

    // Find root services (those not depended on by others)
    const depTargets = new Set();
    services.forEach(s => s.dependencies.forEach(d => depTargets.add(d)));
    const roots = services.filter(s => !depTargets.has(s.id));
    const tier0 = roots.length > 0 ? roots : [services[0]];

    // BFS for tiers
    const visited = new Set();
    const result = [];
    let current = tier0;
    while (current.length > 0) {
      const tier = current.filter(s => !visited.has(s.id));
      tier.forEach(s => visited.add(s.id));
      if (tier.length > 0) result.push(tier);
      const next = [];
      for (const s of tier) {
        for (const depId of s.dependencies) {
          if (!visited.has(depId) && svcById[depId]) {
            next.push(svcById[depId]);
          }
        }
      }
      current = next;
    }

    // Add unvisited
    const unvisited = services.filter(s => !visited.has(s.id));
    if (unvisited.length > 0) result.push(unvisited);

    return result;
  }, [services]);

  const NODE_W = 160;
  const NODE_H = 60;
  const TIER_GAP = 200;
  const NODE_GAP = 20;

  // Calculate positions
  const positions = useMemo(() => {
    const pos = {};
    tiers.forEach((tier, ti) => {
      const totalHeight = tier.length * NODE_H + (tier.length - 1) * NODE_GAP;
      tier.forEach((svc, si) => {
        pos[svc.id] = {
          x: 40 + ti * TIER_GAP,
          y: 40 + si * (NODE_H + NODE_GAP) + (400 - totalHeight) / 2,
        };
      });
    });
    return pos;
  }, [tiers]);

  const svgWidth = 40 + tiers.length * TIER_GAP + NODE_W;
  const svgHeight = Math.max(500, ...Object.values(positions).map(p => p.y + NODE_H + 40));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Service Map</h1>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{services.length} services</span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <svg width={svgWidth} height={svgHeight} style={{ display: 'block' }}>
          {/* Draw edges */}
          {services.map(svc =>
            svc.dependencies.map(depId => {
              const from = positions[svc.id];
              const to = positions[depId];
              if (!from || !to) return null;
              const x1 = from.x + NODE_W;
              const y1 = from.y + NODE_H / 2;
              const x2 = to.x;
              const y2 = to.y + NODE_H / 2;
              const mx = (x1 + x2) / 2;
              return (
                <g key={`${svc.id}-${depId}`}>
                  <path
                    d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                    fill="none"
                    stroke="#DCDCE0"
                    strokeWidth="2"
                  />
                  {/* Arrow */}
                  <polygon
                    points={`${x2},${y2} ${x2 - 6},${y2 - 4} ${x2 - 6},${y2 + 4}`}
                    fill="#DCDCE0"
                  />
                </g>
              );
            })
          )}

          {/* Draw nodes */}
          {services.map(svc => {
            const pos = positions[svc.id];
            if (!pos) return null;
            const statusColor = svc.status === 'ok' ? '#2ECC71' : svc.status === 'warning' ? '#F39C12' : svc.status === 'critical' ? '#E74C3C' : '#95A5A6';
            const typeColor = TYPE_COLORS[svc.type] || '#666';

            return (
              <g
                key={svc.id}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(toPath(`/apm/services/${svc.name}`))}
              >
                <rect
                  x={pos.x} y={pos.y}
                  width={NODE_W} height={NODE_H}
                  rx="6" ry="6"
                  fill="white"
                  stroke={statusColor}
                  strokeWidth="2"
                />
                {/* Type indicator */}
                <rect
                  x={pos.x} y={pos.y}
                  width="4" height={NODE_H}
                  rx="2" ry="0"
                  fill={typeColor}
                />
                {/* Status dot */}
                <circle cx={pos.x + NODE_W - 12} cy={pos.y + 12} r="4" fill={statusColor} />
                {/* Name */}
                <text x={pos.x + 14} y={pos.y + 22} fontSize="12" fontWeight="600" fill="#23232F">
                  {svc.name}
                </text>
                {/* Metrics */}
                <text x={pos.x + 14} y={pos.y + 38} fontSize="10" fill="#6C6C80">
                  {svc.requestsPerSec.toFixed(0)} req/s | {svc.avgLatencyMs.toFixed(0)}ms
                </text>
                <text x={pos.x + 14} y={pos.y + 52} fontSize="10" fill={svc.errorRate > 5 ? '#E74C3C' : '#6C6C80'}>
                  {svc.errorRate.toFixed(2)}% errors
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 24, marginTop: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: color }} />
            <span>{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import './TrainDetailPage.css';

export default function TrainDetailPage() {
  const { trainNo } = useParams();
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const handleBack = () => { if (location.key !== 'default') { navigate(-1); } else { navigate('/search'); } };

  const train = state.trains.find((t) => t.trainNo === trainNo);

  if (!train) {
    return (
      <div className="train-detail-page">
        <Header />
        <div className="container" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          未找到列车信息
          <br />
          <button style={{ marginTop: 16, padding: '8px 20px', cursor: 'pointer', background: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: 4 }} onClick={handleBack}>返回</button>
        </div>
      </div>
    );
  }

  const stops = train.stops || [];

  return (
    <div className="train-detail-page">
      <Header activePage="tickets" />
      <div className="train-detail-content container">
        {/* Header */}
        <div className="train-detail-header">
          <button className="back-btn" onClick={handleBack}>&larr; 返回</button>
          <div className="train-detail-title">
            <span className={`train-badge ${train.trainType}`}>{train.trainType}</span>
            <span className="detail-train-no">{train.trainNo}</span>
            <span className="detail-route-text">{train.departureStation} &rarr; {train.arrivalStation}</span>
          </div>
          <div className="train-detail-meta">
            <span className="detail-duration">全程 {train.duration}</span>
          </div>
        </div>

        {/* Route timeline card */}
        <div className="stops-card">
          <h3 className="stops-title">经停站信息</h3>
          <div className="stops-timeline">
            {stops.map((stopName, i) => {
              const isFirst = i === 0;
              const isLast = i === stops.length - 1;

              let dotClass = 'stop-dot-mid';
              if (isFirst) dotClass = 'stop-dot-start';
              else if (isLast) dotClass = 'stop-dot-end';

              return (
                <div key={i} className={`stop-item ${isFirst ? 'stop-first' : ''} ${isLast ? 'stop-last' : ''}`}>
                  <div className="stop-timeline-col">
                    {!isFirst && <div className="stop-line-top" />}
                    <div className={`stop-dot ${dotClass}`}>
                      {i + 1}
                    </div>
                    {!isLast && <div className="stop-line-bottom" />}
                  </div>
                  <div className="stop-info">
                    <div className={`stop-station-name ${isFirst || isLast ? 'bold' : ''}`}>
                      {stopName}
                      {isFirst && <span className="stop-tag dep-tag">出发站</span>}
                      {isLast && <span className="stop-tag arr-tag">到达站</span>}
                    </div>
                    <div className="stop-times">
                      {isFirst ? (
                        <span className="stop-time dep-time">{train.departureTime} 出发</span>
                      ) : isLast ? (
                        <span className="stop-time arr-time">{train.arrivalTime} 到达</span>
                      ) : (
                        <span className="stop-time">经停</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seat availability card */}
        <div className="avail-card">
          <h3 className="stops-title">席别余票</h3>
          <table className="avail-table">
            <thead>
              <tr>
                <th>席别</th>
                <th>余票</th>
                <th>票价</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(train.seatAvailability).filter(([, v]) => v !== '--').map(([key, value]) => {
                const NAMES = { businessSeat: '商务座', firstClassSeat: '一等座', secondClassSeat: '二等座', deluxeSoftSleeper: '高级软卧', softSleeper: '软卧', hardSleeper: '硬卧', hardSeat: '硬座', noSeat: '无座' };
                return (
                  <tr key={key}>
                    <td>{NAMES[key] || key}</td>
                    <td>
                      {value === '无' ? <span className="avail-gray">无</span> :
                       value === '候补' ? <span className="avail-orange">候补</span> :
                       value === '有' ? <span className="avail-green">有票</span> :
                       <span className="avail-green">{value}张</span>}
                    </td>
                    <td className="price-cell">{train.prices[key] ? `¥${train.prices[key]}` : '--'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

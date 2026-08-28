import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Clock, Truck, MapPin, Phone, Star, ArrowLeft, Package, HelpCircle, X, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/dataManager';
import './OrderTracking.css';

const STEPS = [
  { key: 'placed', label: 'Order Received', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: Clock },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Package }
];

const STATUS_ORDER = {
  placed: 0,
  confirmed: 0,
  preparing: 1,
  picked_up: 2,
  delivering: 2,
  out_for_delivery: 2,
  delivered: 3,
  cancelled: -1
};

export default function OrderTracking() {
  const { orderId } = useParams();
  const { state, updateOrderStatus, rateOrder } = useApp();
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpMessage, setHelpMessage] = useState('');

  const order = state.orders.find(o => o.id === orderId);

  // Simulate order status progression for newly placed orders
  useEffect(() => {
    if (!order) return;
    if (order.status === 'delivered' || order.status === 'cancelled') return;

    const statusProgression = [
      { status: 'confirmed', delay: 3000 },
      { status: 'preparing', delay: 8000 },
      { status: 'out_for_delivery', delay: 15000 },
      { status: 'delivered', delay: 25000 }
    ];

    const currentIndex = STATUS_ORDER[order.status];
    const remaining = statusProgression.filter(s => STATUS_ORDER[s.status] > currentIndex);

    const timers = [];
    remaining.forEach(step => {
      const timer = setTimeout(() => {
        updateOrderStatus(orderId, step.status);
      }, step.delay);
      timers.push(timer);
    });

    return () => timers.forEach(t => clearTimeout(t));
  }, [orderId]);

  if (!order) {
    return (
      <div className="tracking-empty">
        <h2>Order not found</h2>
        <p>We could not find an order with this ID.</p>
        <Link to="/orders" className="tracking-empty__btn">View all orders</Link>
      </div>
    );
  }

  const isActive = !['delivered', 'cancelled'].includes(order.status);
  const currentStepIndex = STATUS_ORDER[order.status] ?? -1;
  const restaurant = state.restaurants.find(r => r.id === order.restaurantId);

  const estimatedArrivalMin = order.estimatedDeliveryMin ? new Date(order.estimatedDeliveryMin) : null;
  const estimatedArrivalMax = order.estimatedDeliveryMax ? new Date(order.estimatedDeliveryMax) : null;

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const downloadReceipt = () => {
    const receipt = [
      `Xber Eats receipt ${order.id}`,
      `Restaurant: ${order.restaurantName}`,
      `Placed: ${new Date(order.placedAt).toLocaleString()}`,
      '',
      'Items:',
      ...order.items.map(item => `${item.quantity}x ${item.name} - ${formatCurrency(item.totalPrice)}`),
      '',
      `Subtotal: ${formatCurrency(order.subtotal)}`,
      `Service Fee: ${formatCurrency(order.serviceFee)}`,
      `Delivery Fee: ${order.deliveryFee === 0 ? 'Free' : formatCurrency(order.deliveryFee)}`,
      `Tax: ${formatCurrency(order.tax)}`,
      `Tip: ${formatCurrency(order.tip || 0)}`,
      order.promoDiscount > 0 ? `Promo Discount: -${formatCurrency(order.promoDiscount)}` : null,
      `Total: ${formatCurrency(order.total)}`,
      `Payment: ${order.paymentMethod}`,
    ].filter(Boolean).join('\n');
    const blob = new Blob([receipt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `uber-eats-receipt-${order.id}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleHelpOption = (label) => {
    setHelpMessage(`${label}: a local support case has been drafted for this sandbox order.`);
  };

  return (
    <div className="tracking-page">
      {/* Header */}
      <div className="tracking-header">
        <button className="tracking-header__back" onClick={() => navigate('/orders')}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="tracking-header__title">
          {isActive ? 'Track Order' : order.status === 'cancelled' ? 'Order Cancelled' : 'Order Complete'}
        </h1>
      </div>

      {/* Progress stepper */}
      {order.status !== 'cancelled' && (
        <div className="tracking-stepper">
          <div className="tracking-stepper__bar">
            {STEPS.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const StepIcon = step.icon;

              return (
                <div key={step.key} className="tracking-step">
                  <div className={`tracking-step__circle ${isCompleted ? 'tracking-step__circle--done' : ''} ${isCurrent ? 'tracking-step__circle--current' : ''}`}>
                    {isCompleted ? <CheckCircle size={20} /> : <span className="tracking-step__num">{index + 1}</span>}
                  </div>
                  <span className={`tracking-step__label ${isCompleted ? 'tracking-step__label--done' : ''} ${isCurrent ? 'tracking-step__label--current' : ''}`}>
                    {step.label}
                  </span>
                  {index < STEPS.length - 1 && (
                    <div className={`tracking-step__line ${index < currentStepIndex ? 'tracking-step__line--done' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>

          {isActive && estimatedArrivalMin && estimatedArrivalMax && (
            <p className="tracking-stepper__eta">
              Estimated arrival: <strong>{formatTime(estimatedArrivalMin)} - {formatTime(estimatedArrivalMax)}</strong>
            </p>
          )}

          {order.status === 'delivered' && order.deliveredAt && (
            <p className="tracking-stepper__eta">
              Delivered at <strong>{formatTime(new Date(order.deliveredAt))}</strong>
            </p>
          )}
        </div>
      )}

      {/* Cancelled banner */}
      {order.status === 'cancelled' && (
        <div className="tracking-cancelled">
          <p>This order was cancelled. If you were charged, a refund will be processed within 3-5 business days.</p>
        </div>
      )}

      {/* Local live tracking map */}
      {isActive && (
        <div className="tracking-map">
          <div className="tracking-map__route">
            <div className="tracking-map__pin tracking-map__pin--restaurant">R</div>
            <div className="tracking-map__road" />
            <div className="tracking-map__courier" style={{ left: `${Math.max(12, Math.min(82, currentStepIndex * 26 + 14))}%` }}>
              <Truck size={18} />
            </div>
            <div className="tracking-map__pin tracking-map__pin--home"><MapPin size={16} /></div>
          </div>
          <p className="tracking-map__text">{restaurant?.name || 'Restaurant'} to {order.deliveryAddress?.label || 'delivery address'}</p>
          <p className="tracking-map__sub">{order.status === 'placed' ? 'Waiting for restaurant confirmation' : order.status === 'preparing' ? 'Restaurant is preparing your order' : 'Courier is heading your way'}</p>
        </div>
      )}

      {/* Delivery person card */}
      {order.deliveryPerson && (currentStepIndex >= 2 || order.status === 'delivered') && (
        <div className="tracking-driver">
          <div className="tracking-driver__avatar">
            {order.deliveryPerson.name.charAt(0)}
          </div>
          <div className="tracking-driver__info">
            <strong className="tracking-driver__name">{order.deliveryPerson.name}</strong>
            <span className="tracking-driver__meta">
              {order.deliveryPerson.vehicleType === 'car' ? 'Car' : 'Bicycle'} &bull; {order.deliveryPerson.rating} ★
            </span>
          </div>
          <button className="tracking-driver__contact" onClick={() => setShowContactModal(true)}>
            <Phone size={18} />
            <span>Contact</span>
          </button>
        </div>
      )}

      {/* Order details */}
      <div className="tracking-details">
        <div className="tracking-details__header">
          <h2>Order Details</h2>
          <div className="tracking-details__actions">
            <button className="tracking-details__store-link" onClick={downloadReceipt}>
              <Download size={14} /> Receipt
            </button>
            <Link to={`/store/${order.restaurantId}`} className="tracking-details__store-link">
              View Store
            </Link>
          </div>
        </div>

        <div className="tracking-details__restaurant">
          <div className="tracking-details__rest-avatar">
            {(order.restaurantName || 'R').charAt(0)}
          </div>
          <div>
            <strong>{order.restaurantName}</strong>
            {restaurant && <p className="tracking-details__rest-addr">{restaurant.address}</p>}
          </div>
        </div>

        <div className="tracking-details__items">
          {order.items.map((item, idx) => (
            <div key={idx} className="tracking-details__item">
              <span className="tracking-details__item-qty">{item.quantity}x</span>
              <div className="tracking-details__item-info">
                <span className="tracking-details__item-name">{item.name}</span>
                {item.selectedOptions && item.selectedOptions.length > 0 && (
                  <span className="tracking-details__item-opts">{item.selectedOptions.join(', ')}</span>
                )}
                {item.specialInstructions && (
                  <span className="tracking-details__item-special">{item.specialInstructions}</span>
                )}
              </div>
              <span className="tracking-details__item-price">{formatCurrency(item.totalPrice)}</span>
            </div>
          ))}
        </div>

        {/* Price breakdown */}
        <div className="tracking-breakdown">
          <div className="tracking-breakdown__row">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="tracking-breakdown__row">
            <span>Service Fee</span>
            <span>{formatCurrency(order.serviceFee)}</span>
          </div>
          <div className="tracking-breakdown__row">
            <span>Delivery Fee</span>
            <span>{order.deliveryFee === 0 ? 'Free' : formatCurrency(order.deliveryFee)}</span>
          </div>
          <div className="tracking-breakdown__row">
            <span>Tax</span>
            <span>{formatCurrency(order.tax)}</span>
          </div>
          {order.tip > 0 && (
            <div className="tracking-breakdown__row">
              <span>Tip</span>
              <span>{formatCurrency(order.tip)}</span>
            </div>
          )}
          {order.promoDiscount > 0 && (
            <div className="tracking-breakdown__row tracking-breakdown__row--discount">
              <span>Promo Discount</span>
              <span>-{formatCurrency(order.promoDiscount)}</span>
            </div>
          )}
          <div className="tracking-breakdown__row tracking-breakdown__row--total">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
          <div className="tracking-breakdown__payment">
            Paid with {order.paymentMethod}
          </div>
        </div>
      </div>

      {/* Rating section (for delivered orders) */}
      {order.status === 'delivered' && !order.rating && (
        <RatingSection orderId={order.id} rateOrder={rateOrder} />
      )}

      {order.status === 'delivered' && order.rating && (
        <div className="tracking-rated">
          <p className="tracking-rated__label">Your Rating</p>
          <div className="tracking-rated__stars">
            {'★'.repeat(order.rating)}{'☆'.repeat(5 - order.rating)}
          </div>
          {order.review && <p className="tracking-rated__review">"{order.review}"</p>}
        </div>
      )}

      {/* Help section */}
      <div className="tracking-help">
        <HelpCircle size={18} />
        <span>Need help with your order?</span>
        <button className="tracking-help__btn" onClick={() => setShowHelpModal(true)}>Get Help</button>
      </div>

      {/* Contact Modal */}
      {showContactModal && order.deliveryPerson && (
        <div className="tracking-modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="tracking-modal" onClick={(e) => e.stopPropagation()}>
            <button className="tracking-modal__close" onClick={() => setShowContactModal(false)}><X size={20} /></button>
            <div className="tracking-modal__header">
              <div className="tracking-modal__avatar">{order.deliveryPerson.name.charAt(0)}</div>
              <strong>{order.deliveryPerson.name}</strong>
              <span>{order.deliveryPerson.vehicleType === 'car' ? 'Car' : 'Bicycle'} &bull; {order.deliveryPerson.rating} ★</span>
            </div>
            <p className="tracking-modal__body">Your delivery person is on the way. For safety, messages are handled through the Xber Eats app.</p>
            <button className="tracking-modal__btn" onClick={() => setShowContactModal(false)}>
              <Phone size={16} /> Send message
            </button>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="tracking-modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="tracking-modal" onClick={(e) => e.stopPropagation()}>
            <button className="tracking-modal__close" onClick={() => setShowHelpModal(false)}><X size={20} /></button>
            <h3 className="tracking-modal__title">Get Help</h3>
            <div className="tracking-modal__help-options">
              <button className="tracking-modal__help-option" onClick={() => handleHelpOption('Where is my order?')}>
                <span>Where is my order?</span>
              </button>
              <button className="tracking-modal__help-option" onClick={() => handleHelpOption('Report a problem with my order')}>
                <span>Report a problem with my order</span>
              </button>
              <button className="tracking-modal__help-option" onClick={() => handleHelpOption('Request a refund')}>
                <span>Request a refund</span>
              </button>
              <button className="tracking-modal__help-option" onClick={() => handleHelpOption('Cancel my order')}>
                <span>Cancel my order</span>
              </button>
              <button className="tracking-modal__help-option" onClick={() => handleHelpOption('Other issue')}>
                <span>Other issue</span>
              </button>
            </div>
            {helpMessage && (
              <div className="tracking-modal__help-message">
                {helpMessage}
                <button onClick={() => setShowHelpModal(false)}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RatingSection({ orderId, rateOrder }) {
  const [rating, setRating] = React.useState(0);
  const [review, setReview] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;
    rateOrder(orderId, rating, review);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="tracking-rating tracking-rating--done">
        <CheckCircle size={24} />
        <p>Thanks for your feedback!</p>
      </div>
    );
  }

  return (
    <div className="tracking-rating">
      <h3>How was your order?</h3>
      <div className="tracking-rating__stars">
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            className={`tracking-rating__star ${s <= rating ? 'tracking-rating__star--active' : ''}`}
            onClick={() => setRating(s)}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        className="tracking-rating__input"
        placeholder="Share your experience (optional)"
        rows={3}
        value={review}
        onChange={(e) => setReview(e.target.value)}
      />
      <button
        className="tracking-rating__submit"
        onClick={handleSubmit}
        disabled={rating === 0}
      >
        Submit Rating
      </button>
    </div>
  );
}

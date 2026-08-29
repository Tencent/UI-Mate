import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Search, Package, Truck, CheckCircle, Clock, X, MapPin } from 'lucide-react';

const STATUS_ICONS = {
  'Delivered': <CheckCircle size={16} className="text-green-600" />,
  'Shipped': <Truck size={16} className="text-blue-600" />,
  'Processing': <Clock size={16} className="text-orange-500" />,
  'Cancelled': <X size={16} className="text-red-500" />,
};

const STATUS_COLORS = {
  'Delivered': 'text-green-700',
  'Shipped': 'text-blue-700',
  'Processing': 'text-orange-600',
  'Cancelled': 'text-red-600',
};

export const Orders = () => {
  const { state, addToCart, cancelOrder } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [timeFilter, setTimeFilter] = useState('past3months');
  const [orderSearch, setOrderSearch] = useState('');
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [trackingModal, setTrackingModal] = useState(null); // { orderId, trackingNumber }
  const [addressModal, setAddressModal] = useState(null); // order shippingAddress
  const [orderDetailModal, setOrderDetailModal] = useState(null); // order
  const [returnModal, setReturnModal] = useState(null); // { order, product }
  const [returnSubmitted, setReturnSubmitted] = useState({});

  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  const getFilteredOrders = () => {
    let filtered = [...state.orders];

    if (timeFilter === 'past3months') {
      filtered = filtered.filter(o => new Date(o.date) >= threeMonthsAgo);
    } else if (timeFilter === 'past6months') {
      filtered = filtered.filter(o => new Date(o.date) >= sixMonthsAgo);
    } else if (timeFilter === 'past1year') {
      filtered = filtered.filter(o => new Date(o.date) >= oneYearAgo);
    }

    if (activeTab === 'notShipped') {
      filtered = filtered.filter(o => o.status === 'Processing' || o.status === 'Shipped');
    } else if (activeTab === 'cancelled') {
      filtered = filtered.filter(o => o.status === 'Cancelled');
    }

    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      filtered = filtered.filter(o => {
        const hasMatchingItem = o.items.some(item => {
          const p = state.products.find(pr => pr.id === item.productId);
          return p && p.title.toLowerCase().includes(q);
        });
        return o.id.toLowerCase().includes(q) || hasMatchingItem;
      });
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const filteredOrders = getFilteredOrders();

  // Unique products from all past orders for "Buy Again" tab
  const buyAgainProducts = (() => {
    const seen = new Set();
    const products = [];
    for (const order of state.orders) {
      for (const item of order.items) {
        if (!seen.has(item.productId)) {
          const prod = state.products.find(p => p.id === item.productId);
          if (prod) {
            seen.add(item.productId);
            products.push(prod);
          }
        }
      }
    }
    return products;
  })();

  const handleCancelConfirm = (orderId) => {
    cancelOrder(orderId);
    setCancelConfirm(null);
  };

  const handleBuyAgain = (product) => {
    addToCart(product, 1);
    // Brief visual feedback — navigate to cart
    navigate('/cart');
  };

  const handleReturnSubmit = (e, orderId, productId) => {
    e.preventDefault();
    setReturnSubmitted(prev => ({ ...prev, [`${orderId}-${productId}`]: true }));
    setReturnModal(null);
  };

  return (
    <div className="bg-xmazon-bg min-h-screen">
      <div className="max-w-[1000px] mx-auto p-4">
        <h1 className="text-2xl font-medium mb-4">Your Orders</h1>

        {/* Primary tab navigation */}
        <div className="bg-white border rounded-t border-b-0 flex overflow-x-auto">
          {[
            { key: 'orders', label: 'Orders' },
            { key: 'buyAgain', label: 'Buy Again' },
            { key: 'notShipped', label: 'Not Yet Shipped' },
            { key: 'cancelled', label: 'Cancelled Orders' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-xmazon-orange text-xmazon-dark'
                  : 'border-transparent text-gray-600 hover:text-xmazon-dark hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Buy Again tab content */}
        {activeTab === 'buyAgain' ? (
          <div className="bg-white border border-t-0 rounded-b p-4">
            <h2 className="text-lg font-medium mb-4">Buy Again</h2>
            {buyAgainProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No past orders to show here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {buyAgainProducts.map(prod => (
                  <div key={prod.id} className="border rounded p-3 flex flex-col gap-2 hover:shadow-md transition-shadow">
                    <Link to={`/product/${prod.id}`}>
                      <img src={prod.image} alt={prod.title} className="w-full h-32 object-contain" />
                    </Link>
                    <Link to={`/product/${prod.id}`} className="text-xs text-xmazon-blue hover:underline font-medium line-clamp-2">
                      {prod.title}
                    </Link>
                    <div className="text-sm font-bold">${prod.price.toFixed(2)}</div>
                    <button
                      onClick={() => { addToCart(prod, 1); navigate('/cart'); }}
                      className="bg-xmazon-yellow hover:bg-yellow-400 text-xmazon-dark text-xs font-medium py-1.5 px-3 rounded-full border border-yellow-500 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
        {/* Time filter tabs + search */}
        <div className="bg-white border border-t-0 p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b-0">
          <div className="flex flex-wrap gap-1">
            {[
              { key: 'past3months', label: 'past 3 months' },
              { key: 'past6months', label: 'past 6 months' },
              { key: 'past1year', label: 'past year' },
              { key: 'all', label: 'all orders' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTimeFilter(key)}
                className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                  timeFilter === key
                    ? 'bg-xmazon text-white border-xmazon'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Order search */}
          <div className="relative flex-shrink-0">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={orderSearch}
              onChange={e => setOrderSearch(e.target.value)}
              placeholder="Search your orders"
              className="pl-7 pr-3 py-1.5 border rounded text-sm focus:outline-none focus:border-xmazon-orange w-56"
            />
          </div>
        </div>

        <div className="text-sm text-gray-600 bg-white px-4 py-2 border-x border-b mb-4 rounded-b">
          {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} placed in
          {timeFilter === 'all' ? ' all time' : timeFilter === 'past3months' ? ' past 3 months' : timeFilter === 'past6months' ? ' past 6 months' : ' past year'}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white p-8 border rounded text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium mb-2">No orders found</p>
            {orderSearch ? (
              <p className="text-gray-500 text-sm mb-4">No orders match "{orderSearch}"</p>
            ) : (
              <p className="text-gray-500 text-sm mb-4">You haven't placed any orders in this time period.</p>
            )}
            <Link to="/" className="text-xmazon-blue hover:underline">Start shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="border rounded bg-white overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-100 p-4 flex flex-wrap justify-between gap-4 text-sm text-gray-600">
                  <div className="flex flex-wrap gap-8">
                    <div>
                      <div className="uppercase text-xs font-bold text-gray-500 mb-0.5">ORDER PLACED</div>
                      <div>{new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                    <div>
                      <div className="uppercase text-xs font-bold text-gray-500 mb-0.5">TOTAL</div>
                      <div className="font-bold">${order.total.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="uppercase text-xs font-bold text-gray-500 mb-0.5">SHIP TO</div>
                      <button
                        className="text-xmazon-blue hover:underline cursor-pointer"
                        onClick={() => setAddressModal(order.shippingAddress)}
                      >
                        {order.shippingAddress.fullName}
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="uppercase text-xs font-bold text-gray-500 mb-0.5">ORDER # {order.id}</div>
                    <button
                      className="text-xmazon-blue hover:underline block text-xs"
                      onClick={() => setOrderDetailModal(order)}
                    >
                      View order details
                    </button>
                    <button
                      className="text-xmazon-blue hover:underline block text-xs"
                      onClick={() => setOrderDetailModal(order)}
                    >
                      Invoice
                    </button>
                  </div>
                </div>

                {/* Order Body */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {STATUS_ICONS[order.status] || <Package size={16} />}
                    <h3 className={`font-bold text-base ${STATUS_COLORS[order.status] || ''}`}>{order.status}</h3>
                    {order.estimatedDelivery && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                      <span className="text-sm text-gray-600">
                        — Expected {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    {order.trackingNumber && order.status === 'Shipped' && (
                      <button
                        className="ml-auto text-xs text-xmazon-blue hover:underline cursor-pointer"
                        onClick={() => setTrackingModal({ orderId: order.id, trackingNumber: order.trackingNumber })}
                      >
                        Track package
                      </button>
                    )}
                  </div>

                  {order.items.map(item => {
                    const product = state.products.find(p => p.id === item.productId);
                    if (!product) return null;
                    const returnKey = `${order.id}-${product.id}`;
                    return (
                      <div key={item.productId} className="flex gap-4 py-3 border-b last:border-0">
                        <Link to={`/product/${product.id}`}>
                          <img src={product.image} alt={product.title} className="w-20 h-20 object-contain flex-shrink-0" />
                        </Link>
                        <div className="flex-1">
                          <Link to={`/product/${product.id}`} className="font-bold text-xmazon-blue hover:underline text-sm line-clamp-2">
                            {product.title}
                          </Link>
                          <div className="text-xs text-gray-500 mt-1">Sold by: {product.brand}</div>
                          {item.quantity > 1 && (
                            <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {order.status !== 'Cancelled' && (
                              <Button
                                variant="secondary"
                                className="text-xs py-1 px-3"
                                onClick={() => handleBuyAgain(product)}
                              >
                                Buy it again
                              </Button>
                            )}
                            <Button
                              variant="secondary"
                              className="text-xs py-1 px-3"
                              onClick={() => navigate(`/product/${product.id}`)}
                            >
                              View item
                            </Button>
                            {order.status === 'Delivered' && (
                              returnSubmitted[returnKey] ? (
                                <span className="text-xs text-green-700 py-1 px-3 border rounded border-green-300 bg-green-50">Return requested</span>
                              ) : (
                                <Button
                                  variant="secondary"
                                  className="text-xs py-1 px-3"
                                  onClick={() => setReturnModal({ order, product })}
                                >
                                  Return or replace items
                                </Button>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Order actions */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t">
                    {order.status === 'Processing' && (
                      <>
                        {cancelConfirm === order.id ? (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600">Cancel this order?</span>
                            <button
                              onClick={() => handleCancelConfirm(order.id)}
                              className="text-red-600 hover:underline font-bold text-xs"
                            >
                              Confirm Cancel
                            </button>
                            <button onClick={() => setCancelConfirm(null)} className="text-xmazon-blue hover:underline text-xs">
                              Keep Order
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setCancelConfirm(order.id)}
                            className="text-xmazon-blue hover:underline text-xs"
                          >
                            Cancel order
                          </button>
                        )}
                      </>
                    )}
                    {order.status === 'Shipped' && (
                      <span className="text-xs text-gray-500">
                        Tracking: <span className="font-mono text-gray-700">{order.trackingNumber}</span>
                      </span>
                    )}
                    {order.status === 'Delivered' && (
                      <div className="flex flex-wrap gap-2">
                        {order.items.map(item => {
                          const prod = state.products.find(p => p.id === item.productId);
                          if (!prod) return null;
                          return (
                            <Button
                              key={item.productId}
                              variant="secondary"
                              className="text-xs py-1 px-3"
                              onClick={() => navigate(`/product/${prod.id}#reviews`)}
                            >
                              Write a product review
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </>
        )}
      </div>

      {/* Tracking Modal */}
      {trackingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setTrackingModal(null)}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Track Your Package</h2>
              <button onClick={() => setTrackingModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded border border-blue-100">
                <Truck size={20} className="text-blue-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-blue-800">In Transit</div>
                  <div className="text-gray-600">Your package is on its way</div>
                </div>
              </div>
              <div>
                <span className="font-bold">Tracking number: </span>
                <span className="font-mono text-gray-700">{trackingModal.trackingNumber}</span>
              </div>
              <div className="space-y-2 mt-4">
                <div className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Package picked up</div>
                    <div className="text-xs text-gray-500">Carrier facility</div>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">In transit to delivery facility</div>
                    <div className="text-xs text-gray-500">Expected delivery within 2 business days</div>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={() => setTrackingModal(null)} className="mt-4 w-full bg-xmazon-yellow hover:bg-xmazon-darkYellow py-2 rounded font-bold text-sm">Close</button>
          </div>
        </div>
      )}

      {/* Shipping Address Modal */}
      {addressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setAddressModal(null)}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Shipping Address</h2>
              <button onClick={() => setAddressModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="flex gap-2 text-sm">
              <MapPin size={16} className="text-gray-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">{addressModal.fullName}</div>
                <div>{addressModal.street}</div>
                <div>{addressModal.city}, {addressModal.state} {addressModal.zip}</div>
                <div>{addressModal.country}</div>
                {addressModal.phone && <div className="text-gray-500 mt-1">{addressModal.phone}</div>}
              </div>
            </div>
            <button onClick={() => setAddressModal(null)} className="mt-4 w-full bg-xmazon-yellow hover:bg-xmazon-darkYellow py-2 rounded font-bold text-sm">Close</button>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {orderDetailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setOrderDetailModal(null)}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Order Details</h2>
              <button onClick={() => setOrderDetailModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-bold text-gray-500 text-xs uppercase">Order #</span>
                <span className="font-mono text-xs">{orderDetailModal.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-500 text-xs uppercase">Date Placed</span>
                <span>{new Date(orderDetailModal.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-500 text-xs uppercase">Status</span>
                <span className={STATUS_COLORS[orderDetailModal.status] || ''}>{orderDetailModal.status}</span>
              </div>
              <div className="border-t pt-3">
                <div className="font-bold text-xs uppercase text-gray-500 mb-2">Items Ordered</div>
                {orderDetailModal.items.map(item => {
                  const p = state.products.find(pr => pr.id === item.productId);
                  if (!p) return null;
                  return (
                    <div key={item.productId} className="flex gap-2 mb-2">
                      <img src={p.image} alt={p.title} className="w-12 h-12 object-contain flex-shrink-0" />
                      <div>
                        <div className="font-medium">{p.title}</div>
                        <div className="text-gray-500">Qty: {item.quantity} × ${p.price.toFixed(2)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t pt-3 space-y-1">
                <div className="font-bold text-xs uppercase text-gray-500 mb-2">Shipping Address</div>
                <div>{orderDetailModal.shippingAddress.fullName}</div>
                <div>{orderDetailModal.shippingAddress.street}</div>
                <div>{orderDetailModal.shippingAddress.city}, {orderDetailModal.shippingAddress.state} {orderDetailModal.shippingAddress.zip}</div>
              </div>
              <div className="border-t pt-3 space-y-1">
                <div className="font-bold text-xs uppercase text-gray-500 mb-2">Payment</div>
                <div>{orderDetailModal.paymentMethod.brand} ending in {orderDetailModal.paymentMethod.last4}</div>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-base">
                <span>Order Total</span>
                <span>${orderDetailModal.total.toFixed(2)}</span>
              </div>
            </div>
            <button onClick={() => setOrderDetailModal(null)} className="mt-4 w-full bg-xmazon-yellow hover:bg-xmazon-darkYellow py-2 rounded font-bold text-sm">Close</button>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setReturnModal(null)}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Return or Replace Item</h2>
              <button onClick={() => setReturnModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="flex gap-3 mb-4 p-3 bg-gray-50 rounded border">
              <img src={returnModal.product.image} alt={returnModal.product.title} className="w-16 h-16 object-contain flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium line-clamp-2">{returnModal.product.title}</div>
                <div className="text-gray-500 mt-1">${returnModal.product.price.toFixed(2)}</div>
              </div>
            </div>
            <form onSubmit={(e) => handleReturnSubmit(e, returnModal.order.id, returnModal.product.id)} className="space-y-3">
              <div>
                <label className="block text-sm font-bold mb-1">Reason for return</label>
                <select required className="w-full p-2 border rounded text-sm focus:outline-none focus:border-xmazon-orange">
                  <option value="">Select a reason</option>
                  <option value="defective">Defective/Doesn't work</option>
                  <option value="wrong-item">Wrong item received</option>
                  <option value="not-needed">No longer needed</option>
                  <option value="not-as-described">Not as described</option>
                  <option value="damaged">Arrived damaged</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Comments (optional)</label>
                <textarea className="w-full p-2 border rounded text-sm h-20 focus:outline-none focus:border-xmazon-orange" placeholder="Tell us more about the issue..." />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Submit Return Request</Button>
                <Button variant="secondary" type="button" onClick={() => setReturnModal(null)} className="flex-1">Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

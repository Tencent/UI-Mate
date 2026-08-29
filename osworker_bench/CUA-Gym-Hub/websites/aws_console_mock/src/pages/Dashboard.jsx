import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import {
  Clock, DollarSign, Activity, CheckCircle, AlertTriangle,
  Server, HardDrive, Zap, ArrowUpRight, ArrowDownRight, Star,
  GripVertical, Database, Shield, Globe, BarChart3, Bell,
  MessageSquare, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const SERVICE_MAP = {
  '/ec2': { name: 'EC2', icon: Server, color: '#FF9900' },
  '/s3': { name: 'S3', icon: HardDrive, color: '#3ECF8E' },
  '/lambda': { name: 'Lambda', icon: Zap, color: '#FF9900' },
  '/rds': { name: 'RDS', icon: Database, color: '#3B48CC' },
  '/iam': { name: 'IAM', icon: Shield, color: '#D13212' },
  '/billing': { name: 'Billing', icon: DollarSign, color: '#1D8102' },
  '/vpc': { name: 'VPC', icon: Globe, color: '#8C4FFF' },
  '/cloudwatch': { name: 'CloudWatch', icon: BarChart3, color: '#E7157B' },
  '/dynamodb': { name: 'DynamoDB', icon: Database, color: '#2E73B8' },
  '/sns': { name: 'SNS', icon: Bell, color: '#D13212' },
  '/sqs': { name: 'SQS', icon: MessageSquare, color: '#D13212' },
  '/cloudfront': { name: 'CloudFront', icon: Globe, color: '#8C4FFF' },
  '/route53': { name: 'Route 53', icon: Globe, color: '#8C4FFF' },
};

export default function Dashboard() {
  const { state, addFlash } = useStore();
  const [widgetMenuOpen, setWidgetMenuOpen] = useState(null);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [hiddenWidgets, setHiddenWidgets] = useState([]);
  const unreadNotifs = state.notifications.filter(n => !n.read).length;
  const lastMonth = state.billing.lastMonth;
  const currentMonth = state.billing.currentMonth;
  const costChange = currentMonth - lastMonth;
  const costPct = lastMonth > 0 ? ((costChange / lastMonth) * 100).toFixed(1) : 0;
  const removeWidget = (id) => {
    setHiddenWidgets(prev => [...new Set([...prev, id])]);
    setWidgetMenuOpen(null);
    addFlash('success', 'Widget removed from Console Home');
  };
  const addWidget = (id) => {
    setHiddenWidgets(prev => prev.filter(widget => widget !== id));
    addFlash('success', 'Widget added to Console Home');
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Console Home <span className="text-aws-blue text-sm font-normal ml-2 cursor-pointer hover:underline">Info</span>
        </h1>
        <div className="flex items-center gap-2">
          <button className="aws-btn aws-btn-secondary text-xs" onClick={() => addFlash('success', 'Dashboard layout reset to default')}>Reset to default layout</button>
          <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowWidgetLibrary(true)}>+ Add widgets</button>
        </div>
      </div>

      {/* Main grid - matches real XWS Console Home layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recently visited */}
        {!hiddenWidgets.includes('recent') && <div className="aws-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm flex items-center gap-2">
              <GripVertical size={14} className="text-aws-text-disabled cursor-grab" />
              Recently visited <span className="text-aws-blue text-xs font-normal ml-1 cursor-pointer hover:underline">Info</span>
            </h2>
            <div className="relative">
              <button className="text-aws-text-disabled hover:text-aws-text" onClick={() => setWidgetMenuOpen(widgetMenuOpen === 'recent' ? null : 'recent')}>
                <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="4" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="12" cy="8" r="1.5" fill="currentColor"/></svg>
              </button>
              {widgetMenuOpen === 'recent' && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-aws-border shadow-lg z-20" style={{ borderRadius: 8 }}>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" onClick={() => removeWidget('recent')}>Remove widget</button>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" onClick={() => { addFlash('info', 'Widget moved'); setWidgetMenuOpen(null); }}>Move to top</button>
                </div>
              )}
            </div>
          </div>
          {state.recentServices.length > 0 ? (
            <div className="space-y-0">
              {state.recentServices.slice(0, 8).map(s => {
                const svc = SERVICE_MAP[s.path];
                const Icon = svc?.icon;
                return (
                  <Link
                    key={s.id}
                    to={s.path}
                    className="flex items-center gap-3 py-2 px-1 hover:bg-gray-50 -mx-1 rounded transition-colors"
                  >
                    {Icon && (
                      <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: svc.color + '15' }}>
                        <Icon size={14} style={{ color: svc.color }} />
                      </div>
                    )}
                    <span className="text-sm text-aws-blue hover:underline font-medium">{s.name}</span>
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-gray-100 mt-2">
                <Link to="/" className="text-sm text-aws-blue hover:underline">View all services</Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-aws-text-disabled mb-2">
                <svg width="48" height="48" viewBox="0 0 48 48" className="mx-auto opacity-40"><rect x="8" y="12" width="32" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M16 20h16M16 26h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
              <p className="font-bold text-sm text-aws-text mb-1">No recently visited services</p>
              <p className="text-sm text-aws-text-secondary">Explore one of these commonly visited AWS services.</p>
              <div className="flex items-center justify-center gap-4 mt-3">
                {['IAM', 'EC2', 'S3', 'RDS', 'Lambda'].map(name => {
                  const svc = Object.values(SERVICE_MAP).find(s => s.name === name);
                  const path = Object.entries(SERVICE_MAP).find(([, v]) => v.name === name)?.[0];
                  return <Link key={name} to={path || '/'} className="text-sm text-aws-blue hover:underline">{name}</Link>;
                })}
              </div>
            </div>
          )}
        </div>}

        {/* Welcome to AWS */}
        {!hiddenWidgets.includes('welcome') && <div className="aws-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm flex items-center gap-2">
              <GripVertical size={14} className="text-aws-text-disabled cursor-grab" />
              Welcome to AWS
            </h2>
            <div className="relative">
              <button className="text-aws-text-disabled hover:text-aws-text" onClick={() => setWidgetMenuOpen(widgetMenuOpen === 'welcome' ? null : 'welcome')}>
                <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="4" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="12" cy="8" r="1.5" fill="currentColor"/></svg>
              </button>
              {widgetMenuOpen === 'welcome' && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-aws-border shadow-lg z-20" style={{ borderRadius: 8 }}>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" onClick={() => removeWidget('welcome')}>Remove widget</button>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" onClick={() => { addFlash('info', 'Widget moved'); setWidgetMenuOpen(null); }}>Move to top</button>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <WelcomeItem
              icon="🚀"
              title="Getting started with AWS"
              desc="Learn the fundamentals and find valuable information to get the most out of AWS."
            />
            <hr className="border-gray-100" />
            <WelcomeItem
              icon="🎓"
              title="Training and certification"
              desc="Learn from AWS experts and advance your skills and knowledge."
            />
            <hr className="border-gray-100" />
            <WelcomeItem
              icon="💡"
              title="What's new with AWS?"
              desc="Discover new AWS services, features, and Regions."
            />
          </div>
        </div>}
      </div>

      {/* Second row */}
      <div className="grid grid-cols-3 gap-6">
        {/* AWS Health */}
        {!hiddenWidgets.includes('health') && <div className="aws-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm flex items-center gap-2">
              <GripVertical size={14} className="text-aws-text-disabled cursor-grab" />
              AWS Health <span className="text-aws-blue text-xs font-normal ml-1 cursor-pointer hover:underline">Info</span>
            </h2>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Open issues</span>
              <span className="font-bold text-sm">0</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Scheduled changes</span>
              <span className="font-bold text-sm">0</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Other notifications</span>
              <span className="font-bold text-sm">{unreadNotifs}</span>
            </div>
          </div>
        </div>}

        {/* Cost and usage */}
        {!hiddenWidgets.includes('cost') && <div className="col-span-2 aws-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm flex items-center gap-2">
              <GripVertical size={14} className="text-aws-text-disabled cursor-grab" />
              Cost and usage <span className="text-aws-blue text-xs font-normal ml-1 cursor-pointer hover:underline">Info</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs text-aws-text-secondary mb-1">Current month</div>
              <div className="text-sm text-aws-text-secondary">Cost ($)</div>
              <div className="text-3xl font-bold mt-1">${currentMonth.toFixed(2)}</div>
              <div className={`text-xs mt-1 flex items-center gap-1 ${costChange >= 0 ? 'text-aws-error' : 'text-aws-success'}`}>
                {costChange >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(costPct)}% compared to last month for same period
              </div>
            </div>
            <div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-aws-text-secondary">Total forecasted cost for current month</div>
                  <div className="text-xl font-bold">${state.billing.forecast.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-aws-text-secondary">Last month's total cost</div>
                  <div className="text-xl font-bold">${lastMonth.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Link to="/billing" className="text-sm text-aws-blue hover:underline flex items-center gap-1">
              View bill <ExternalLink size={12} />
            </Link>
          </div>
        </div>}
      </div>

      {/* Favorites */}
      {(state.favorites || []).length > 0 && (
        <div className="aws-card">
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
            <GripVertical size={14} className="text-aws-text-disabled cursor-grab" />
            <Star size={14} className="text-aws-orange" /> Favorites
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {(state.favorites || []).map(favPath => {
              const svc = SERVICE_MAP[favPath];
              if (!svc) return null;
              const Icon = svc.icon;
              return (
                <Link
                  key={favPath}
                  to={favPath}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border border-aws-border hover:border-aws-blue hover:bg-aws-blue-light transition-colors"
                  style={{ borderRadius: 8 }}
                >
                  {Icon && <Icon size={14} style={{ color: svc.color }} />}
                  <div className="font-medium text-sm text-aws-blue">{svc.name}</div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      {showWidgetLibrary && (
        <div className="aws-modal-overlay">
          <div className="aws-modal max-w-lg">
            <div className="aws-modal-header">
              <h3 className="font-bold text-lg">Add widgets</h3>
              <button onClick={() => setShowWidgetLibrary(false)} className="text-aws-text-secondary hover:text-aws-text">×</button>
            </div>
            <div className="aws-modal-body space-y-3">
              {[
                ['recent', 'Recently visited'],
                ['welcome', 'Welcome to AWS'],
                ['health', 'AWS Health'],
                ['cost', 'Cost and usage'],
              ].map(([id, label]) => (
                <div key={id} className="flex items-center justify-between border border-aws-border rounded-md px-3 py-2">
                  <div>
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-aws-text-secondary">{hiddenWidgets.includes(id) ? 'Hidden from your dashboard' : 'Visible on your dashboard'}</div>
                  </div>
                  <button className="aws-btn aws-btn-secondary text-xs" disabled={!hiddenWidgets.includes(id)} onClick={() => addWidget(id)}>Add</button>
                </div>
              ))}
            </div>
            <div className="aws-modal-footer">
              <button className="aws-btn aws-btn-primary" onClick={() => setShowWidgetLibrary(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WelcomeItem({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div>
        <div className="text-sm text-aws-blue hover:underline cursor-pointer font-medium flex items-center gap-1">
          {title} <ExternalLink size={12} />
        </div>
        <p className="text-xs text-aws-text-secondary mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { UserAlert } from '@/lib/types';
import { AlertListItem } from './AlertListItem';
import { AlertConfigForm } from './AlertConfigForm';

// Mock alerts data
const mockAlerts: UserAlert[] = [
  {
    alertId: '1',
    userId: 'user1',
    cryptoSymbol: 'BTC',
    alertType: 'price_target',
    thresholdValue: 70000,
    status: 'active',
    direction: 'above',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    metadata: { currentPrice: 67855.23, percentageChange: 1.85 },
  },
  {
    alertId: '2',
    userId: 'user1',
    cryptoSymbol: 'ETH',
    alertType: 'trend',
    thresholdValue: 0,
    status: 'triggered',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    triggeredAt: new Date(Date.now() - 30 * 60 * 1000),
    metadata: { currentPrice: 3456.78, percentageChange: -2.51 },
  },
  {
    alertId: '3',
    userId: 'user1',
    cryptoSymbol: 'SOL',
    alertType: 'price_target',
    thresholdValue: 150,
    status: 'inactive',
    direction: 'below',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    metadata: { currentPrice: 178.45, percentageChange: 7.43 },
  },
  {
    alertId: '4',
    userId: 'user1',
    cryptoSymbol: 'ADA',
    alertType: 'price_target',
    thresholdValue: 0.5,
    status: 'active',
    direction: 'above',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    metadata: { currentPrice: 0.45, percentageChange: 3.21 },
  },
];

export function AlertsManager() {
  const [alerts, setAlerts] = useState<UserAlert[]>(mockAlerts);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'triggered' | 'inactive'>('all');

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.cryptoSymbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateAlert = (alertData: any) => {
    const newAlert: UserAlert = {
      alertId: Date.now().toString(),
      userId: 'user1',
      ...alertData,
      status: 'active' as const,
      createdAt: new Date(),
      metadata: {
        currentPrice: Math.random() * 1000 + 100,
        percentageChange: (Math.random() - 0.5) * 10,
      },
    };
    
    setAlerts(prev => [newAlert, ...prev]);
    setShowCreateForm(false);
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.alertId !== alertId));
  };

  const handleToggleStatus = (alertId: string, status: 'active' | 'inactive') => {
    setAlerts(prev => prev.map(alert => 
      alert.alertId === alertId ? { ...alert, status } : alert
    ));
  };

  const getStatusCount = (status: string) => {
    if (status === 'all') return alerts.length;
    return alerts.filter(alert => alert.status === status).length;
  };

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <AlertConfigForm
          onSubmit={handleCreateAlert}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-text">My Alerts</h1>
          <p className="text-dark-textSecondary">Manage your crypto price alerts and notifications</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          New Alert
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: getStatusCount('all'), color: 'text-dark-text' },
          { label: 'Active', value: getStatusCount('active'), color: 'text-primary' },
          { label: 'Triggered', value: getStatusCount('triggered'), color: 'text-positive' },
          { label: 'Inactive', value: getStatusCount('inactive'), color: 'text-dark-textSecondary' },
        ].map((stat) => (
          <div key={stat.label} className="metric-card text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-dark-textSecondary">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-textSecondary" />
            <input
              type="text"
              placeholder="Search by cryptocurrency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-dark-textSecondary" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="triggered">Triggered</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 bg-dark-card rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={24} className="text-dark-textSecondary" />
            </div>
            <h3 className="text-lg font-medium text-dark-text mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No alerts found' : 'No alerts yet'}
            </h3>
            <p className="text-dark-textSecondary mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first alert to start monitoring crypto prices'
              }
            </p>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Create Alert
            </button>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <AlertListItem
              key={alert.alertId}
              alert={alert}
              onDelete={handleDeleteAlert}
              onToggleStatus={handleToggleStatus}
            />
          ))
        )}
      </div>
    </div>
  );
}

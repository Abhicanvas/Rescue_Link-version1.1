import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Filter, 
  Download, 
  CheckCircle, 
  Clock,
  Search
} from 'lucide-react';
import { api } from '../utils/api';
import AlertCard from '../components/AlertCard';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const alertsData = await api.getAlerts();
        setAlerts(alertsData);
        setFilteredAlerts(alertsData);
      } catch (error) {
        console.error('Error loading alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, []);

  useEffect(() => {
    let filtered = alerts;

    // Filter by severity
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === filterSeverity);
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(alert => alert.type === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      const isResolved = filterStatus === 'resolved';
      filtered = filtered.filter(alert => alert.resolved_status === isResolved);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(alert => 
        alert.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAlerts(filtered);
  }, [alerts, filterSeverity, filterType, filterStatus, searchTerm]);

  const handleResolveAlert = async (alertId) => {
    try {
      await api.resolveAlert(alertId);
      setAlerts(prev => prev.map(alert => 
        alert.alert_id === alertId 
          ? { ...alert, resolved_status: true }
          : alert
      ));
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const exportAlerts = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Alert ID,Device ID,Type,Severity,Message,Timestamp,Status\n" +
      filteredAlerts.map(alert => 
        `${alert.alert_id},${alert.device_id},${alert.type},${alert.severity},"${alert.message}",${alert.timestamp},${alert.resolved_status ? 'Resolved' : 'Active'}`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "rescuelink_alerts.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const urgentAlerts = filteredAlerts.filter(a => !a.resolved_status && a.severity === 'High');
  const activeAlerts = filteredAlerts.filter(a => !a.resolved_status);
  const resolvedAlerts = filteredAlerts.filter(a => a.resolved_status);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alert Management</h1>
          <p className="text-gray-600">Monitor and manage all system alerts and incidents</p>
        </div>
        
        <button
          onClick={exportAlerts}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Alerts
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Urgent Alerts</p>
              <p className="text-2xl font-bold text-red-600">{urgentAlerts.length}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-orange-600">{activeAlerts.length}</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{resolvedAlerts.length}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold text-blue-600">{alerts.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Filter className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Severities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="SOS">SOS</option>
            <option value="Accident">Accident</option>
            <option value="Low Battery">Low Battery</option>
            <option value="Device Fault">Device Fault</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          <>
            {/* Urgent Alerts Section */}
            {urgentAlerts.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Urgent Alerts ({urgentAlerts.length})
                </h2>
                <div className="space-y-4">
                  {urgentAlerts.map((alert) => (
                    <AlertCard 
                      key={alert.alert_id} 
                      alert={alert} 
                      onResolve={handleResolveAlert}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Alerts Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                All Alerts ({filteredAlerts.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredAlerts.map((alert) => (
                  <AlertCard 
                    key={alert.alert_id} 
                    alert={alert} 
                    onResolve={handleResolveAlert}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
            <p className="text-gray-500">No alerts match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;

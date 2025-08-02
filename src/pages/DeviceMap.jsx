import React, { useState, useEffect } from 'react';
import { MapPin, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

import { api } from '../utils/api';
import DeviceCard from '../components/DeviceCard';
import './DeviceMap.css'; // << Add this

const DeviceMap = () => {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const devicesData = await api.getDevices();
        setDevices(devicesData);
        setFilteredDevices(devicesData);
      } catch (error) {
        console.error('Error loading devices:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDevices();
  }, []);

  useEffect(() => {
    let filtered = devices;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(device => device.device_status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(device =>
        device.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.site_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDevices(filtered);
  }, [devices, filterStatus, searchTerm]);

  const groupedBySite = filteredDevices.reduce((acc, device) => {
    const site = device.site_name || 'Unknown';
    if (!acc[site]) acc[site] = [];
    acc[site].push(device);
    return acc;
  }, {});

  const leafletIcon = new L.Icon({
    iconUrl: markerIconPng,
    shadowUrl: markerShadowPng,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-title"></div>
        <div className="loading-map"></div>
      </div>
    );
  }

  return (
    <div className="device-container">
      <div className="device-header">
        <div>
          <h1 className="device-title">Device Map</h1>
          <p className="device-subtitle">Live locations and status of RescueLink devices</p>
        </div>

        <div className="device-controls">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Disconnected">Disconnected</option>
            <option value="Faulty">Faulty</option>
          </select>
        </div>
      </div>

      <div className="map-wrapper">
        <MapContainer center={[20.5937, 78.9629]} zoom={4} style={{ height: '500px', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {Object.entries(groupedBySite).map(([site, siteDevices]) => {
            const firstDevice = siteDevices[0];
            return (
              <Marker
                key={site}
                position={[firstDevice.location.lat, firstDevice.location.long]}
                icon={leafletIcon}
                eventHandlers={{
                  click: () => {
                    const el = document.getElementById(`site-${site}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  },
                }}
              >
                <Popup>
                  <strong>{site}</strong><br />
                  Devices: {siteDevices.length}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
      <div className="device-card">
         {Object.entries(groupedBySite).map(([site, siteDevices]) => (
        <div key={site} id={`site-${site}`} className="site-section">
          <h2 className="site-title">{site} ({siteDevices.length} devices)</h2>
          <div className="device-card-grid">
            {siteDevices.map((device) => (
              <div key={device.device_id}>
                <DeviceCard
                  device={device}
                  onClick={() => setSelectedDevice(device)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      </div>

      {selectedDevice && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Device Details: {selectedDevice.device_id}</h2>
              <button
                onClick={() => setSelectedDevice(null)}
                className="modal-close"
              >
                ✕
              </button>
            </div>

            <DeviceCard device={selectedDevice} />

            <div className="modal-grid">
              <div className="modal-section">
                <h4 className="section-title">Sensor Data</h4>
                <div>Vibration: {selectedDevice.vibration_intensity.toFixed(2)}</div>
                <div>Tilt X: {selectedDevice.tilt_x.toFixed(2)}°</div>
                <div>Tilt Y: {selectedDevice.tilt_y.toFixed(2)}°</div>
                <div>Tilt Z: {selectedDevice.tilt_z.toFixed(2)}°</div>
              </div>
              <div className="modal-section">
                <h4 className="section-title">Status</h4>
                <div>Battery: {selectedDevice.battery_level}%</div>
                <div>Actuator: {selectedDevice.actuator_status ? 'Active' : 'Inactive'}</div>
                <div>SOS: {selectedDevice.SOS_triggered ? 'TRIGGERED' : 'Normal'}</div>
                <div>Accident: {selectedDevice.accident_reported ? 'DETECTED' : 'None'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceMap;


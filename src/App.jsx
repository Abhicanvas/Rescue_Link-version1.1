import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
// import DeviceMap from './pages/DeviceMap';
// import Analytics from './pages/Analytics';
// import Alerts from './pages/Alerts';
// import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {/* <Route path="/devices" element={<DeviceMap />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/admin" element={<Admin />} /> */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

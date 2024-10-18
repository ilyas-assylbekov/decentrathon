import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import Register from './components/Register';
import Login from './components/Login';
import WorkerDashboard from './components/WorkerDashboard';
import CompanyDashboard from './components/CompanyDashboard';
import JobSearch from './components/JobSearch';
import CreateJob from './components/CreateJob';
import ManageCandidates from './components/ManageCandidates';

const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

const AppRoutes = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    if (path === 'Register') {
      navigate('/register');
    } else if (path === 'Login') {
      navigate('/login');
    } else if (path === 'WorkerDashboard') {
      navigate('/worker-dashboard');
    } else if (path === 'CompanyDashboard') {
      navigate('/company-dashboard');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/worker-dashboard" element={<WorkerDashboard />} />
        <Route path="/company-dashboard" element={<CompanyDashboard />} />
        <Route path="/job-search" element={<JobSearch />} />
        <Route path="/create-job" element={<CreateJob />} />
        <Route path="/manage-candidates" element={<ManageCandidates />} />
        <Route path="/" element={<HomePage onNavigate={handleNavigate} />} />
      </Routes>
    </div>
  );
};

export default App;
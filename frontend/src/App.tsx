/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Assistant from './pages/Assistant';
import Assessment from './pages/Assessment';
import Certificate from './pages/Certificate';
import Courses from './pages/Courses';
import JobDetails from './pages/JobDetails';
import Schemes from './pages/Schemes';
import Status from './pages/Status';
import Profile from './pages/Profile';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/certificate" element={<Certificate />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/job/:id" element={<JobDetails />} />
        <Route path="/schemes" element={<Schemes />} />
        <Route path="/status" element={<Status />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </Router>
  );
}

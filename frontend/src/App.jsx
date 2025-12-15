import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.scss';
import Landing from './pages/Landing';
import SearchResults from './pages/SearchResults';
import Favorites from './pages/Favorites';
import HotelDetail from './pages/HotelDetail';
import Booking from './pages/Booking';
import BookingConfirmation from './pages/BookingConfirmation';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Account from './pages/Account';
import SocialLoginHandler from './pages/SocialLoginHandler';
import QuickActions from './components/QuickActions';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
          <Route path="/hotel/:id" element={<HotelDetail />} />
          <Route path="/hotel/:id/booking/:roomId" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/booking-confirmation" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/oauth/google" element={<SocialLoginHandler />} />
          <Route path="/oauth/kakao" element={<SocialLoginHandler />} />
        </Routes>
      </div>
      <QuickActions />
    </>
  );
}

export default App;

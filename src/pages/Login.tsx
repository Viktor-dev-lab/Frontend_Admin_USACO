import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css'; // Import file CSS riêng

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  const rawFrom = location.state?.from?.pathname;
  const from = rawFrom && rawFrom !== '/login' ? rawFrom : '/';

  if (loading) return null;

  if (isAuthenticated && isAdmin) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lc-login-container">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="lc-login-card"
      >
        <div className="lc-login-header">
          {/* Thay icon logo thành màu cam LeetCode */}
          <div className="lc-logo-box">
            <Lock size={28} className="lc-logo-icon" />
          </div>
          <h1>USACO Admin</h1>
        </div>

        <form onSubmit={handleSubmit} className="lc-login-form">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lc-error-message"
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="lc-input-group">
            <label htmlFor="email">Email Address</label>
            <div className="lc-input-wrapper">
              <Mail className="lc-field-icon" size={18} />
              <input
                id="email"
                type="email"
                placeholder="admin@usaco.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="lc-input-group">
            <label htmlFor="password">Password</label>
            <div className="lc-input-wrapper">
              <Lock className="lc-field-icon" size={18} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className={`lc-submit-btn ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="lc-spinner" size={20} />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="lc-login-footer">
          <p>Protected by reCAPTCHA and subject to the Privacy Policy and Terms of Service.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
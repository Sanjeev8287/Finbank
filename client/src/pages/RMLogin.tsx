import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './RMLogin.css'

const RMLogin = () => {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    setError('')

    if (!username.trim() || !password) {
      setError('Please enter username and password')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        'http://localhost:5000/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.message || 'Invalid username or password')
        return
      }

      localStorage.setItem('finbank_token', data.token)
      localStorage.setItem(
        'finbank_user',
        JSON.stringify(data.user)
      )

      if (
        data.user.role === 'RM' ||
        data.user.role === 'SENIOR_RM' ||
        data.user.role === 'ADMIN'
      ) {
        navigate('/rm-dashboard')
      } else {
        setError(
          'You are not authorized to access RM Portal'
        )

        localStorage.removeItem('finbank_token')
        localStorage.removeItem('finbank_user')
      }
    } catch (error) {
      console.error('Login error:', error)

      setError(
        'Unable to connect to server. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rm-login-page">

      {/* Left Branding Section */}
      <div className="rm-login-brand">

        <div className="brand-content">
          <div className="brand-logo">
            <span>F</span>
          </div>

          <h1>FinBank</h1>

          <p className="brand-title">
            Relationship Manager Portal
          </p>

          <p className="brand-description">
            Manage customers, accounts, cards, loans and
            service requests from one secure workspace.
          </p>

          <div className="brand-features">
            <div className="brand-feature">
              <div className="feature-icon">✓</div>
              <span>Customer 360° View</span>
            </div>

            <div className="brand-feature">
              <div className="feature-icon">✓</div>
              <span>Account & Loan Management</span>
            </div>

            <div className="brand-feature">
              <div className="feature-icon">✓</div>
              <span>Secure Relationship Management</span>
            </div>
          </div>
        </div>

        <div className="brand-footer">
          © 2026 FinBank • Demo Banking System
        </div>
      </div>

      {/* Login Section */}
      <div className="rm-login-section">

        <div className="rm-login-card">

          <div className="login-header">
            <div className="mobile-logo">
              <span>F</span>
            </div>

            <h2>Welcome back</h2>

            <p>
              Sign in to your RM workspace
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="rm-login-form"
          >

            <div className="form-group">
              <label htmlFor="username">
                Username
              </label>

              <div className="input-wrapper">
                <span className="input-icon">👤</span>

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  placeholder="Enter your username"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">
                <span className="input-icon">🔒</span>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="login-error">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <span className="button-arrow">→</span>
                </>
              )}
            </button>

          </form>

          <div className="secure-login">
            <span>🔐</span>
            <span>Secure FinBank Authentication</span>
          </div>

          <div className="demo-info">
            <strong>Demo RM Account</strong>
            <span>Username: rm001</span>
          </div>

        </div>

      </div>
    </div>
  )
}

export default RMLogin
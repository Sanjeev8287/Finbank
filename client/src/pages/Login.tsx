import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'


function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setError('')

    if (!username.trim() || !password) {
      setError(
        'Please enter username and password'
      )
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
        setError(
          data.message ||
            'Invalid username or password'
        )
        return
      }

      if (data.user?.role !== 'CUSTOMER') {
        setError(
          'This login is for Customer Portal only.'
        )
        return
      }

      localStorage.setItem(
        'finbank_token',
        data.token
      )

      localStorage.setItem(
        'finbank_user',
        JSON.stringify(data.user)
      )

      const from =
        (
          location.state as
            | { from?: string }
            | null
        )?.from || '/dashboard'

      navigate(from, { replace: true })
    } catch (error) {
      console.error('Customer login error:', error)

      setError(
        'Unable to connect to server. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: '#f5f7fb',
        fontFamily:
          'Inter, Arial, sans-serif',
      }}
    >
      {/* LEFT SIDE */}

      <div
        style={{
          flex: 1,
          background:
            'linear-gradient(135deg, #09203f, #123d6b)',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '16px',
              background: '#ffffff',
              color: '#123d6b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '30px',
              fontWeight: 800,
              marginBottom: '24px',
            }}
          >
            F
          </div>

          <h1
            style={{
              fontSize: '44px',
              margin: '0 0 8px',
            }}
          >
            FinBank
          </h1>

          <h2
            style={{
              fontSize: '24px',
              fontWeight: 500,
              margin: '0 0 20px',
            }}
          >
            Digital Banking
          </h2>

          <p
            style={{
              fontSize: '17px',
              lineHeight: 1.7,
              opacity: 0.85,
            }}
          >
            Access your accounts, cards, loans
            and transactions from one secure
            banking workspace.
          </p>

          <div
            style={{
              marginTop: '35px',
              lineHeight: 2.2,
              fontSize: '15px',
            }}
          >
            <div>✓ View accounts and balances</div>
            <div>✓ Track cards and loans</div>
            <div>✓ Review recent transactions</div>
            <div>✓ Manage service requests</div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}

      <div
        style={{
          width: '48%',
          minWidth: '420px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          background: '#ffffff',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '430px',
          }}
        >
          <div style={{ marginBottom: '35px' }}>
            <div
              style={{
                color: '#123d6b',
                fontSize: '14px',
                fontWeight: 700,
                marginBottom: '10px',
              }}
            >
              CUSTOMER PORTAL
            </div>

            <h2
              style={{
                fontSize: '32px',
                margin: '0 0 10px',
                color: '#101828',
              }}
            >
              Welcome back
            </h2>

            <p
              style={{
                margin: 0,
                color: '#667085',
              }}
            >
              Sign in to access your FinBank
              account.
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '22px' }}>
              <label
                htmlFor="username"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#344054',
                }}
              >
                Username
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                placeholder="Enter username"
                autoComplete="username"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '14px 15px',
                  border: '1px solid #d0d5dd',
                  borderRadius: '10px',
                  fontSize: '15px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#344054',
                }}
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter password"
                autoComplete="current-password"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '14px 15px',
                  border: '1px solid #d0d5dd',
                  borderRadius: '10px',
                  fontSize: '15px',
                  outline: 'none',
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  background: '#fff1f2',
                  color: '#b42318',
                  border: '1px solid #fecdd3',
                  padding: '12px 14px',
                  borderRadius: '9px',
                  marginBottom: '18px',
                  fontSize: '14px',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                border: 'none',
                borderRadius: '10px',
                background: '#123d6b',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 700,
                cursor: loading
                  ? 'not-allowed'
                  : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? 'Signing in...'
                : 'Sign In →'}
            </button>
          </form>

          <div
            style={{
              marginTop: '24px',
              padding: '14px',
              background: '#f8fafc',
              borderRadius: '10px',
              fontSize: '13px',
              color: '#667085',
            }}
          >
            <strong>Demo Customer</strong>
            <br />
            Username: aarav
            <br />
            Password: Aarav@123
          </div>

          <p
            style={{
              textAlign: 'center',
              marginTop: '28px',
              fontSize: '12px',
              color: '#98a2b3',
            }}
          >
            © 2026 FinBank • Demo Banking System
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
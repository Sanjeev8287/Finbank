import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiFetch from '../api'

type ProfileData = {
  customer_code: string
  full_name: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  address: string
  city: string
  state: string
  pincode: string
  status: string
  customer_type: string
  rm_name: string
  rm_email: string
  rm_phone: string
}

function Profile() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await apiFetch('/customers/me/profile')
        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || 'Failed to load profile'
          )
        }

        setProfile(data.profile)
      } catch (err) {
        console.error(err)
        setError('Unable to load profile information')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const logout = () => {
    localStorage.removeItem('finbank_token')
    localStorage.removeItem('finbank_user')
    navigate('/login')
  }

  const formatDate = (value: string) => {
    if (!value) return '—'

    return new Date(value).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const nav = [
    ['Dashboard', '/dashboard', '▣'],
    ['Accounts', '/accounts', '▤'],
    ['Transactions', '/transactions', '↕'],
    ['Cards', '/cards', '▭'],
    ['Loans', '/loans', '₹'],
    ['Service Requests', '/service-requests', '◉'],
    ['Profile', '/profile', '◯'],
  ]

  return (
    <>
      <style>{`
        .fb-profile-page {
          min-height: 100vh;
          display: flex;
          background: #f5f7fb;
          color: #101828;
        }

        .fb-profile-sidebar {
          width: 250px;
          min-height: 100vh;
          background: #fff;
          border-right: 1px solid #e4e7ec;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .fb-profile-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 10px 30px;
        }

        .fb-profile-mark {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg,#2563eb,#4f46e5);
          color: white;
          display: grid;
          place-items: center;
          font-size: 22px;
          font-weight: 800;
        }

        .fb-profile-brand h2 {
          margin: 0;
          font-size: 20px;
        }

        .fb-profile-brand span {
          font-size: 11px;
          color: #98a2b3;
        }

        .fb-profile-nav {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .fb-profile-nav button,
        .fb-profile-logout {
          border: 0;
          background: transparent;
          color: #667085;
          border-radius: 10px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
          text-align: left;
        }

        .fb-profile-nav button:hover {
          background: #f2f4f7;
        }

        .fb-profile-nav button.active {
          background: #eef4ff;
          color: #2563eb;
        }

        .fb-profile-logout {
          margin-top: auto;
          background: #fff5f5;
          color: #d92d20;
        }

        .fb-profile-main {
          flex: 1;
          min-width: 0;
          padding: 30px 36px 45px;
        }

        .fb-profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        .fb-profile-eyebrow {
          margin: 0 0 6px;
          color: #2563eb;
          font-size: 13px;
          font-weight: 700;
        }

        .fb-profile-title {
          margin: 0;
          font-size: 30px;
          font-weight: 800;
        }

        .fb-profile-subtitle {
          margin: 7px 0 0;
          color: #667085;
          font-size: 14px;
        }

        .fb-profile-user {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          border: 1px solid #eaecf0;
          padding: 9px 14px 9px 9px;
          border-radius: 14px;
        }

        .fb-profile-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #eaf2ff;
          color: #2563eb;
          display: grid;
          place-items: center;
          font-weight: 800;
          font-size: 17px;
        }

        .fb-profile-user strong,
        .fb-profile-user span {
          display: block;
        }

        .fb-profile-user strong {
          font-size: 13px;
        }

        .fb-profile-user span {
          color: #98a2b3;
          font-size: 11px;
        }

        .fb-profile-layout {
          display: grid;
          grid-template-columns: minmax(0,2fr) minmax(280px,1fr);
          gap: 22px;
        }

        .fb-profile-card {
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 18px;
          padding: 25px;
        }

        .fb-profile-card h2 {
          margin: 0;
          font-size: 18px;
        }

        .fb-profile-card-subtitle {
          color: #98a2b3;
          font-size: 12px;
          margin: 6px 0 22px;
        }

        .fb-profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .fb-profile-field {
          padding: 14px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .fb-profile-field.full {
          grid-column: 1 / -1;
        }

        .fb-profile-field span {
          display: block;
          color: #98a2b3;
          font-size: 10px;
          margin-bottom: 6px;
        }

        .fb-profile-field strong {
          font-size: 13px;
          color: #344054;
          word-break: break-word;
        }

        .fb-profile-status {
          display: inline-block;
          padding: 5px 9px;
          border-radius: 999px;
          background: #ecfdf3;
          color: #027a48;
          font-size: 10px;
          font-weight: 700;
        }

        .fb-rm-card {
          background: linear-gradient(135deg,#2563eb,#4338ca);
          color: #fff;
          border-radius: 18px;
          padding: 25px;
        }

        .fb-rm-card small {
          opacity: .75;
          font-size: 11px;
        }

        .fb-rm-card h2 {
          margin: 8px 0 22px;
          font-size: 21px;
        }

        .fb-rm-avatar {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: rgba(255,255,255,.18);
          display: grid;
          place-items: center;
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 18px;
        }

        .fb-rm-info {
          border-top: 1px solid rgba(255,255,255,.2);
          padding-top: 15px;
          margin-top: 15px;
        }

        .fb-rm-info span {
          display: block;
          opacity: .65;
          font-size: 10px;
          margin-bottom: 5px;
        }

        .fb-rm-info strong {
          font-size: 12px;
          word-break: break-word;
        }

        .fb-profile-message {
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 16px;
          padding: 35px;
          text-align: center;
          color: #667085;
        }

        @media(max-width:900px) {
          .fb-profile-layout {
            grid-template-columns: 1fr;
          }
        }

        @media(max-width:800px) {
          .fb-profile-sidebar {
            width: 205px;
          }

          .fb-profile-main {
            padding: 24px 20px;
          }

          .fb-profile-user {
            display: none;
          }
        }

        @media(max-width:600px) {
          .fb-profile-page {
            display: block;
          }

          .fb-profile-sidebar {
            width: 100%;
            min-height: auto;
          }

          .fb-profile-nav {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .fb-profile-logout {
            margin-top: 15px;
          }

          .fb-profile-main {
            padding: 20px 14px;
          }

          .fb-profile-title {
            font-size: 25px;
          }

          .fb-profile-grid {
            grid-template-columns: 1fr;
          }

          .fb-profile-field.full {
            grid-column: auto;
          }
        }
      `}</style>

      <div className="fb-profile-page">

        <aside className="fb-profile-sidebar">

          <div className="fb-profile-brand">
            <div className="fb-profile-mark">F</div>

            <div>
              <h2>FinBank</h2>
              <span>Digital Banking</span>
            </div>
          </div>

          <nav className="fb-profile-nav">
            {nav.map(([label, path, icon]) => (
              <button
                key={path}
                className={path === '/profile' ? 'active' : ''}
                onClick={() => navigate(path)}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <button
            className="fb-profile-logout"
            onClick={logout}
          >
            ↪ <span>Logout</span>
          </button>

        </aside>

        <main className="fb-profile-main">

          <header className="fb-profile-header">

            <div>
              <p className="fb-profile-eyebrow">
                Customer Portal
              </p>

              <h1 className="fb-profile-title">
                My Profile
              </h1>

              <p className="fb-profile-subtitle">
                Manage and view your personal banking information
              </p>
            </div>

            {profile && (
              <div className="fb-profile-user">
                <div className="fb-profile-avatar">
                  {profile.full_name?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <strong>{profile.full_name}</strong>
                  <span>{profile.customer_type}</span>
                </div>
              </div>
            )}

          </header>

          {loading && (
            <div className="fb-profile-message">
              Loading your profile...
            </div>
          )}

          {error && (
            <div className="fb-profile-message">
              {error}
            </div>
          )}

          {!loading && !error && profile && (
            <div className="fb-profile-layout">

              <section className="fb-profile-card">

                <h2>Personal Information</h2>

                <p className="fb-profile-card-subtitle">
                  Information associated with your FinBank account
                </p>

                <div className="fb-profile-grid">

                  <div className="fb-profile-field">
                    <span>Full Name</span>
                    <strong>{profile.full_name}</strong>
                  </div>

                  <div className="fb-profile-field">
                    <span>Customer ID</span>
                    <strong>{profile.customer_code}</strong>
                  </div>

                  <div className="fb-profile-field">
                    <span>Email Address</span>
                    <strong>{profile.email}</strong>
                  </div>

                  <div className="fb-profile-field">
                    <span>Phone Number</span>
                    <strong>{profile.phone || '—'}</strong>
                  </div>

                  <div className="fb-profile-field">
                    <span>Date of Birth</span>
                    <strong>
                      {formatDate(profile.date_of_birth)}
                    </strong>
                  </div>

                  <div className="fb-profile-field">
                    <span>Gender</span>
                    <strong>{profile.gender || '—'}</strong>
                  </div>

                  <div className="fb-profile-field full">
                    <span>Address</span>
                    <strong>
                      {profile.address || '—'}
                    </strong>
                  </div>

                  <div className="fb-profile-field">
                    <span>City</span>
                    <strong>{profile.city || '—'}</strong>
                  </div>

                  <div className="fb-profile-field">
                    <span>State</span>
                    <strong>{profile.state || '—'}</strong>
                  </div>

                  <div className="fb-profile-field">
                    <span>Pincode</span>
                    <strong>{profile.pincode || '—'}</strong>
                  </div>

                  <div className="fb-profile-field">
                    <span>Account Status</span>
                    <strong>
                      <span className="fb-profile-status">
                        {profile.status}
                      </span>
                    </strong>
                  </div>

                </div>

              </section>

              <aside className="fb-rm-card">

                <small>YOUR RELATIONSHIP MANAGER</small>

                <div className="fb-rm-avatar">
                  {profile.rm_name
                    ? profile.rm_name.charAt(0).toUpperCase()
                    : 'RM'}
                </div>

                <h2>
                  {profile.rm_name || 'Not Assigned'}
                </h2>

                <div className="fb-rm-info">
                  <span>Email</span>
                  <strong>
                    {profile.rm_email || 'Not available'}
                  </strong>
                </div>

                <div className="fb-rm-info">
                  <span>Phone</span>
                  <strong>
                    {profile.rm_phone || 'Not available'}
                  </strong>
                </div>

              </aside>

            </div>
          )}

        </main>
      </div>
    </>
  )
}

export default Profile
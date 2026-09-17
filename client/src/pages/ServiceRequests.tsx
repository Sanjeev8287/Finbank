import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiFetch from '../api'

type ServiceRequest = {
  id: number
  request_number: string
  request_type: string
  subject: string
  description: string
  priority: string
  status: string
  created_at: string
  updated_at: string
}

function ServiceRequests() {
  const navigate = useNavigate()

  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const response = await apiFetch(
          '/service-requests/me'
        )

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || 'Failed to load service requests'
          )
        }

        setRequests(data.serviceRequests || [])
      } catch (err) {
        console.error(err)
        setError('Unable to load service requests')
      } finally {
        setLoading(false)
      }
    }

    loadRequests()
  }, [])

  const formatDate = (value: string) => {
    if (!value) return '—'

    return new Date(value).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const logout = () => {
    localStorage.removeItem('finbank_token')
    localStorage.removeItem('finbank_user')
    navigate('/login')
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

  const openCount = requests.filter(
    r => !['CLOSED', 'RESOLVED'].includes(r.status)
  ).length

  const resolvedCount = requests.filter(
    r => ['CLOSED', 'RESOLVED'].includes(r.status)
  ).length

  return (
    <>
      <style>{`
        .fb-sr-page {
          min-height: 100vh;
          display: flex;
          background: #f5f7fb;
          color: #101828;
        }

        .fb-sr-sidebar {
          width: 250px;
          min-height: 100vh;
          background: #fff;
          border-right: 1px solid #e4e7ec;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .fb-sr-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 10px 30px;
        }

        .fb-sr-mark {
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

        .fb-sr-brand h2 {
          margin: 0;
          font-size: 20px;
        }

        .fb-sr-brand span {
          font-size: 11px;
          color: #98a2b3;
        }

        .fb-sr-nav {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .fb-sr-nav button,
        .fb-sr-logout {
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

        .fb-sr-nav button:hover {
          background: #f2f4f7;
        }

        .fb-sr-nav button.active {
          background: #eef4ff;
          color: #2563eb;
        }

        .fb-sr-logout {
          margin-top: auto;
          background: #fff5f5;
          color: #d92d20;
        }

        .fb-sr-main {
          flex: 1;
          min-width: 0;
          padding: 30px 36px 45px;
        }

        .fb-sr-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        .fb-sr-eyebrow {
          margin: 0 0 6px;
          color: #2563eb;
          font-size: 13px;
          font-weight: 700;
        }

        .fb-sr-title {
          margin: 0;
          font-size: 30px;
          font-weight: 800;
        }

        .fb-sr-subtitle {
          margin: 7px 0 0;
          color: #667085;
          font-size: 14px;
        }

        .fb-sr-user {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          border: 1px solid #eaecf0;
          padding: 9px 14px 9px 9px;
          border-radius: 14px;
        }

        .fb-sr-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #eaf2ff;
          color: #2563eb;
          display: grid;
          place-items: center;
          font-weight: 800;
        }

        .fb-sr-user strong,
        .fb-sr-user span {
          display: block;
        }

        .fb-sr-user strong {
          font-size: 13px;
        }

        .fb-sr-user span {
          color: #98a2b3;
          font-size: 11px;
        }

        .fb-sr-summary {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 18px;
          margin-bottom: 25px;
        }

        .fb-sr-stat {
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 16px;
          padding: 20px;
        }

        .fb-sr-stat span {
          color: #667085;
          font-size: 12px;
        }

        .fb-sr-stat strong {
          display: block;
          margin-top: 7px;
          font-size: 21px;
        }

        .fb-sr-container {
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 18px;
          padding: 24px;
        }

        .fb-sr-container h2 {
          margin: 0;
          font-size: 19px;
        }

        .fb-sr-container > p {
          color: #98a2b3;
          font-size: 13px;
          margin: 5px 0 22px;
        }

        .fb-sr-card {
          border: 1px solid #eaecf0;
          border-radius: 15px;
          padding: 19px;
          margin-bottom: 14px;
        }

        .fb-sr-card:last-child {
          margin-bottom: 0;
        }

        .fb-sr-card-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
        }

        .fb-sr-card h3 {
          margin: 0;
          font-size: 15px;
          color: #344054;
        }

        .fb-sr-number {
          margin: 5px 0 0;
          color: #98a2b3;
          font-size: 11px;
        }

        .fb-sr-status {
          padding: 6px 10px;
          border-radius: 999px;
          background: #eef4ff;
          color: #2563eb;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        .fb-sr-description {
          margin: 16px 0;
          color: #667085;
          font-size: 13px;
          line-height: 1.5;
        }

        .fb-sr-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
        }

        .fb-sr-meta div span {
          display: block;
          color: #98a2b3;
          font-size: 10px;
          margin-bottom: 4px;
        }

        .fb-sr-meta div strong {
          color: #475467;
          font-size: 12px;
        }

        .fb-sr-priority {
          padding: 4px 8px;
          border-radius: 999px;
          background: #fff4e5;
          color: #b54708;
          font-size: 10px;
          font-weight: 700;
        }

        .fb-sr-message {
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 16px;
          padding: 35px;
          text-align: center;
          color: #667085;
        }

        @media(max-width:800px) {
          .fb-sr-sidebar {
            width: 205px;
          }

          .fb-sr-main {
            padding: 24px 20px;
          }

          .fb-sr-summary {
            grid-template-columns: 1fr;
          }

          .fb-sr-user {
            display: none;
          }
        }

        @media(max-width:600px) {
          .fb-sr-page {
            display: block;
          }

          .fb-sr-sidebar {
            width: 100%;
            min-height: auto;
          }

          .fb-sr-nav {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .fb-sr-logout {
            margin-top: 15px;
          }

          .fb-sr-main {
            padding: 20px 14px;
          }

          .fb-sr-title {
            font-size: 25px;
          }
        }
      `}</style>

      <div className="fb-sr-page">

        <aside className="fb-sr-sidebar">

          <div className="fb-sr-brand">
            <div className="fb-sr-mark">F</div>

            <div>
              <h2>FinBank</h2>
              <span>Digital Banking</span>
            </div>
          </div>

          <nav className="fb-sr-nav">
            {nav.map(([label, path, icon]) => (
              <button
                key={path}
                className={
                  path === '/service-requests'
                    ? 'active'
                    : ''
                }
                onClick={() => navigate(path)}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <button
            className="fb-sr-logout"
            onClick={logout}
          >
            ↪ <span>Logout</span>
          </button>

        </aside>

        <main className="fb-sr-main">

          <header className="fb-sr-header">

            <div>
              <p className="fb-sr-eyebrow">
                Customer Portal
              </p>

              <h1 className="fb-sr-title">
                Service Requests
              </h1>

              <p className="fb-sr-subtitle">
                Track your support requests with FinBank
              </p>
            </div>

            <div className="fb-sr-user">
              <div className="fb-sr-avatar">
                A
              </div>

              <div>
                <strong>Customer</strong>
                <span>Personal Banking</span>
              </div>
            </div>

          </header>

          {loading && (
            <div className="fb-sr-message">
              Loading your service requests...
            </div>
          )}

          {error && (
            <div className="fb-sr-message">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <section className="fb-sr-summary">

                <div className="fb-sr-stat">
                  <span>Total Requests</span>
                  <strong>
                    {requests.length}
                  </strong>
                </div>

                <div className="fb-sr-stat">
                  <span>Open Requests</span>
                  <strong>
                    {openCount}
                  </strong>
                </div>

                <div className="fb-sr-stat">
                  <span>Resolved Requests</span>
                  <strong>
                    {resolvedCount}
                  </strong>
                </div>

              </section>

              <section className="fb-sr-container">

                <h2>My Requests</h2>

                <p>
                  Your support and banking service requests
                </p>

                {requests.length === 0 ? (
                  <div className="fb-sr-message">
                    No service requests found.
                  </div>
                ) : (
                  requests.map(request => (
                    <div
                      className="fb-sr-card"
                      key={request.id}
                    >

                      <div className="fb-sr-card-head">

                        <div>
                          <h3>
                            {request.subject ||
                              request.request_type}
                          </h3>

                          <p className="fb-sr-number">
                            {request.request_number}
                          </p>
                        </div>

                        <span className="fb-sr-status">
                          {request.status}
                        </span>

                      </div>

                      <p className="fb-sr-description">
                        {request.description ||
                          'No additional description available.'}
                      </p>

                      <div className="fb-sr-meta">

                        <div>
                          <span>Request Type</span>
                          <strong>
                            {request.request_type}
                          </strong>
                        </div>

                        <div>
                          <span>Priority</span>
                          <strong className="fb-sr-priority">
                            {request.priority}
                          </strong>
                        </div>

                        <div>
                          <span>Created</span>
                          <strong>
                            {formatDate(request.created_at)}
                          </strong>
                        </div>

                        <div>
                          <span>Last Updated</span>
                          <strong>
                            {formatDate(request.updated_at)}
                          </strong>
                        </div>

                      </div>

                    </div>
                  ))
                )}

              </section>
            </>
          )}

        </main>
      </div>
    </>
  )
}

export default ServiceRequests
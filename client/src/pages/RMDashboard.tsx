import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiFetch from '../api'

type Customer = {
  id: number
  customer_code: string
  full_name: string
  email: string
  phone: string
  status: string
  customer_type: string
}

type DashboardData = {
  relationshipManager: {
    full_name: string
    employee_code: string
    email: string
    role: string
  }
  stats: {
    total_customers: string
    active_customers: string
    inactive_customers: string
    total_loans: string
    total_outstanding: string
    total_requests: string
    open_requests: string
  }
  customers: Customer[]
}

function RMDashboard() {
  const navigate = useNavigate()

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await apiFetch('/rm/dashboard')
        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || 'Failed to load dashboard'
          )
        }

        setData(result)
      } catch (err) {
        console.error(err)
        setError('Unable to load RM dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const logout = () => {
    localStorage.removeItem('finbank_token')
    localStorage.removeItem('finbank_user')
    navigate('/rm-login')
  }

  const money = (value: string | number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(value || 0))

  return (
    <>
      <style>{`

        * {
          box-sizing: border-box;
        }

        .rm-page {
          min-height: 100vh;
          display: flex;
          background: #f5f7fb;
          color: #101828;
        }

        /* =========================
           SIDEBAR
        ========================== */

        .rm-sidebar {
          width: 250px;
          min-height: 100vh;
          background: #111827;
          color: white;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .rm-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 5px 10px 32px;
        }

        .rm-brand-mark {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #2563eb;
          display: grid;
          place-items: center;
          font-weight: 800;
          font-size: 21px;
        }

        .rm-brand h2 {
          margin: 0;
          font-size: 20px;
        }

        .rm-brand span {
          color: #98a2b3;
          font-size: 10px;
        }

        .rm-nav {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .rm-nav button {
          width: 100%;
          border: 0;
          background: transparent;
          color: #b8c0cc;
          border-radius: 10px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: all 0.18s ease;
          font-size: 14px;
        }

        .rm-nav button:hover {
          background: #1f2937;
          color: white;
        }

        .rm-nav button.active {
          background: #2563eb;
          color: white;
        }

        /* =========================
           AI ASSISTANT
        ========================== */

        .rm-ai-divider {
          height: 1px;
          background: #293241;
          margin: 15px 8px 10px;
        }

        .rm-ai-nav {
          border: 1px solid #373f51 !important;
          background: linear-gradient(
            135deg,
            #1e293b,
            #242b42
          ) !important;
          color: #c7d2fe !important;
          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .rm-ai-nav:hover {
          background: linear-gradient(
            135deg,
            #312e81,
            #4338ca
          ) !important;
          border-color: #4f46e5 !important;
          color: white !important;
          transform: translateY(-1px);
        }

        .rm-ai-icon {
          width: 25px;
          height: 25px;
          border-radius: 7px;
          display: grid;
          place-items: center;
          background: #4338ca;
          color: white;
          font-size: 14px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .rm-ai-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .rm-ai-text strong {
          font-size: 13px;
          font-weight: 700;
        }

        .rm-ai-text small {
          color: #94a3b8;
          font-size: 9px;
          font-weight: 500;
        }

        .rm-ai-nav:hover .rm-ai-text small {
          color: #c7d2fe;
        }

        /* =========================
           LOGOUT
        ========================== */

        .rm-logout {
          width: 100%;
          margin-top: auto;
          border: 0;
          background: #1f2937;
          color: #fda4af;
          padding: 12px;
          border-radius: 10px;
          text-align: left;
          font-weight: 600;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .rm-logout:hover {
          background: #3a2027;
        }

        /* =========================
           MAIN
        ========================== */

        .rm-main {
          flex: 1;
          min-width: 0;
          padding: 30px 36px 45px;
        }

        .rm-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .rm-eyebrow {
          margin: 0 0 6px;
          color: #2563eb;
          font-size: 13px;
          font-weight: 700;
        }

        .rm-title {
          margin: 0;
          font-size: 30px;
          font-weight: 800;
        }

        .rm-subtitle {
          margin: 7px 0 0;
          color: #667085;
          font-size: 14px;
        }

        /* =========================
           USER
        ========================== */

        .rm-user {
          background: white;
          border: 1px solid #eaecf0;
          border-radius: 14px;
          padding: 9px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .rm-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #eaf2ff;
          color: #2563eb;
          display: grid;
          place-items: center;
          font-weight: 800;
        }

        .rm-user strong,
        .rm-user span {
          display: block;
        }

        .rm-user strong {
          font-size: 13px;
        }

        .rm-user span {
          color: #98a2b3;
          font-size: 11px;
        }

        /* =========================
           STATS
        ========================== */

        .rm-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 24px;
        }

        .rm-stat {
          background: white;
          border: 1px solid #eaecf0;
          border-radius: 16px;
          padding: 21px;
          transition: 0.18s ease;
        }

        .rm-stat:hover {
          transform: translateY(-2px);
          box-shadow:
            0 8px 20px rgba(16, 24, 40, 0.06);
        }

        .rm-stat-label {
          color: #667085;
          font-size: 12px;
        }

        .rm-stat-value {
          display: block;
          margin-top: 8px;
          font-size: 23px;
          font-weight: 800;
        }

        /* =========================
           CONTENT GRID
        ========================== */

        .rm-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 22px;
        }

        .rm-panel {
          background: white;
          border: 1px solid #eaecf0;
          border-radius: 18px;
          padding: 24px;
        }

        .rm-panel h2 {
          margin: 0;
          font-size: 18px;
        }

        .rm-panel-subtitle {
          color: #98a2b3;
          font-size: 12px;
          margin: 6px 0 20px;
        }

        /* =========================
           CUSTOMERS
        ========================== */

        .rm-customer {
          display: grid;
          grid-template-columns: 45px 1.5fr 1fr 100px;
          align-items: center;
          gap: 14px;
          padding: 15px 5px;
          border-bottom: 1px solid #f2f4f7;
        }

        .rm-customer:last-child {
          border-bottom: 0;
        }

        .rm-customer-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #eef4ff;
          color: #2563eb;
          display: grid;
          place-items: center;
          font-weight: 800;
        }

        .rm-customer-name strong {
          display: block;
          font-size: 13px;
        }

        .rm-customer-name span {
          display: block;
          color: #98a2b3;
          font-size: 10px;
          margin-top: 3px;
        }

        .rm-customer-email {
          color: #667085;
          font-size: 11px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .rm-active {
          background: #ecfdf3;
          color: #027a48;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          text-align: center;
        }

        .rm-inactive {
          background: #fef3f2;
          color: #d92d20;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          text-align: center;
        }

        /* =========================
           SIDE CARDS
        ========================== */

        .rm-side-card {
          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4338ca
            );
          color: white;
          border-radius: 18px;
          padding: 24px;
          margin-bottom: 20px;
        }

        .rm-side-card:last-child {
          margin-bottom: 0;
        }

        .rm-side-card small {
          opacity: 0.7;
          font-size: 10px;
        }

        .rm-side-card strong {
          display: block;
          font-size: 24px;
          margin-top: 8px;
        }

        .rm-side-card p {
          margin: 5px 0 0;
          opacity: 0.75;
          font-size: 11px;
        }

        /* =========================
           MESSAGES
        ========================== */

        .rm-message {
          background: white;
          border: 1px solid #eaecf0;
          border-radius: 16px;
          padding: 35px;
          text-align: center;
          color: #667085;
        }

        /* =========================
           TABLET
        ========================== */

        @media(max-width: 1100px) {
          .rm-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .rm-grid {
            grid-template-columns: 1fr;
          }
        }

        /* =========================
           SMALL TABLET
        ========================== */

        @media(max-width: 750px) {
          .rm-sidebar {
            width: 205px;
          }

          .rm-main {
            padding: 22px 18px;
          }

          .rm-user {
            display: none;
          }

          .rm-customer {
            grid-template-columns:
              40px 1.5fr 80px;
          }

          .rm-customer-email {
            display: none;
          }
        }

        /* =========================
           MOBILE
        ========================== */

        @media(max-width: 600px) {
          .rm-page {
            display: block;
          }

          .rm-sidebar {
            width: 100%;
            min-height: auto;
            padding: 18px 14px;
          }

          .rm-brand {
            padding-bottom: 20px;
          }

          .rm-nav {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .rm-ai-divider {
            grid-column: 1 / -1;
          }

          .rm-ai-nav {
            grid-column: 1 / -1;
          }

          .rm-logout {
            margin-top: 15px;
          }

          .rm-main {
            padding: 22px 15px;
          }

          .rm-header {
            margin-bottom: 22px;
          }

          .rm-title {
            font-size: 25px;
          }

          .rm-stats {
            grid-template-columns: 1fr;
          }

          .rm-customer {
            grid-template-columns:
              40px 1fr 75px;
          }
        }

      `}</style>

      <div className="rm-page">

        {/* SIDEBAR */}

        <aside className="rm-sidebar">

          <div className="rm-brand">

            <div className="rm-brand-mark">
              F
            </div>

            <div>
              <h2>FinBank</h2>
              <span>RM Portal</span>
            </div>

          </div>

          <nav className="rm-nav">

            <button
              className="active"
              onClick={() =>
                navigate('/rm-dashboard')
              }
            >
              ▣
              <span>Dashboard</span>
            </button>

            <button
              onClick={() =>
                navigate('/rm-customers')
              }
            >
              ◉
              <span>Customers</span>
            </button>

            <button
              onClick={() =>
                navigate('/rm-accounts')
              }
            >
              ▤
              <span>Accounts</span>
            </button>

            <button
              onClick={() =>
                navigate('/rm-cards')
              }
            >
              ▭
              <span>Cards</span>
            </button>

            <button
              onClick={() =>
                navigate('/rm-loans')
              }
            >
              ₹
              <span>Loans</span>
            </button>

            <button
              onClick={() =>
                navigate('/rm-service-requests')
              }
            >
              ◌
              <span>Service Requests</span>
            </button>

            <button
              onClick={() =>
                navigate('/rm-activity')
              }
            >
              ↕
              <span>Activity</span>
            </button>

            <button
              onClick={() =>
                navigate('/rm-profile')
              }
            >
              ◯
              <span>My Profile</span>
            </button>

            {/* AI SECTION */}

            <div className="rm-ai-divider"></div>

            <button
              type="button"
              className="rm-ai-nav"
              onClick={() =>
                navigate('/rm-ai-assistant')
              }
            >
              <span className="rm-ai-icon">
                ✦
              </span>

              <span className="rm-ai-text">
                <strong>
                  AI Assistant
                </strong>

                <small>
                  Customer Intelligence
                </small>
              </span>
            </button>

          </nav>

          {/* LOGOUT */}

          <button
            type="button"
            className="rm-logout"
            onClick={logout}
          >
            ↪ &nbsp; Logout
          </button>

        </aside>

        {/* MAIN */}

        <main className="rm-main">

          <header className="rm-header">

            <div>

              <p className="rm-eyebrow">
                Relationship Manager Portal
              </p>

              <h1 className="rm-title">
                Dashboard
              </h1>

              <p className="rm-subtitle">
                Manage your assigned customers and banking relationships
              </p>

            </div>

            {data && (
              <div className="rm-user">

                <div className="rm-avatar">
                  {data.relationshipManager.full_name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>

                  <strong>
                    {
                      data.relationshipManager
                        .full_name
                    }
                  </strong>

                  <span>
                    {
                      data.relationshipManager
                        .employee_code
                    }
                  </span>

                </div>

              </div>
            )}

          </header>

          {/* LOADING */}

          {loading && (
            <div className="rm-message">
              Loading RM dashboard...
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="rm-message">
              {error}
            </div>
          )}

          {/* DATA */}

          {!loading &&
            !error &&
            data && (
              <>

                {/* STATS */}

                <section className="rm-stats">

                  <div className="rm-stat">

                    <span className="rm-stat-label">
                      Total Customers
                    </span>

                    <strong className="rm-stat-value">
                      {data.stats.total_customers}
                    </strong>

                  </div>

                  <div className="rm-stat">

                    <span className="rm-stat-label">
                      Active Customers
                    </span>

                    <strong className="rm-stat-value">
                      {data.stats.active_customers}
                    </strong>

                  </div>

                  <div className="rm-stat">

                    <span className="rm-stat-label">
                      Active Loans
                    </span>

                    <strong className="rm-stat-value">
                      {data.stats.total_loans}
                    </strong>

                  </div>

                  <div className="rm-stat">

                    <span className="rm-stat-label">
                      Open Service Requests
                    </span>

                    <strong className="rm-stat-value">
                      {data.stats.open_requests}
                    </strong>

                  </div>

                </section>

                {/* CONTENT */}

                <div className="rm-grid">

                  {/* CUSTOMERS */}

                  <section className="rm-panel">

                    <h2>
                      Assigned Customers
                    </h2>

                    <p className="rm-panel-subtitle">
                      Customers currently assigned to you
                    </p>

                    {data.customers.length === 0 ? (

                      <div className="rm-message">
                        No customers assigned.
                      </div>

                    ) : (

                      data.customers.map(
                        (customer) => (

                          <div
                            className="rm-customer"
                            key={customer.id}
                          >

                            <div className="rm-customer-avatar">
                              {customer.full_name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="rm-customer-name">

                              <strong>
                                {customer.full_name}
                              </strong>

                              <span>
                                {customer.customer_code}
                              </span>

                            </div>

                            <div className="rm-customer-email">
                              {customer.email}
                            </div>

                            <div
                              className={
                                customer.status ===
                                'ACTIVE'
                                  ? 'rm-active'
                                  : 'rm-inactive'
                              }
                            >
                              {customer.status}
                            </div>

                          </div>

                        )
                      )

                    )}

                  </section>

                  {/* RIGHT SIDE */}

                  <aside>

                    <div className="rm-side-card">

                      <small>
                        LOAN PORTFOLIO
                      </small>

                      <strong>
                        {money(
                          data.stats.total_outstanding
                        )}
                      </strong>

                      <p>
                        Total active loan outstanding
                      </p>

                    </div>

                    <div className="rm-side-card">

                      <small>
                        SERVICE REQUESTS
                      </small>

                      <strong>
                        {data.stats.total_requests}
                      </strong>

                      <p>
                        Total customer requests
                      </p>

                    </div>

                  </aside>

                </div>

              </>
            )}

        </main>

      </div>
    </>
  )
}

export default RMDashboard
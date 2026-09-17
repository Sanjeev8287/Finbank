import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiFetch from '../api'

type Account = {
  id: number
  customer_id: number
  account_number: string
  account_type: string
  branch_name: string
  ifsc_code: string
  balance: number | string
  currency: string
  status: string
  opened_at: string
}

function Accounts() {
  const navigate = useNavigate()

  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const response = await apiFetch('/accounts/me')
        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to load accounts')
        }

        setAccounts(data.accounts || [])
      } catch (err) {
        console.error(err)
        setError('Unable to load account information')
      } finally {
        setLoading(false)
      }
    }

    loadAccounts()
  }, [])

  const formatMoney = (amount: number | string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(Number(amount || 0))
  }

  const maskAccount = (accountNumber: string) => {
    if (!accountNumber) return 'XXXX XXXX XXXX'

    return `XXXX XXXX ${accountNumber.slice(-4)}`
  }

  const handleLogout = () => {
    localStorage.removeItem('finbank_token')
    localStorage.removeItem('finbank_user')
    navigate('/login')
  }

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '▣' },
    { label: 'Accounts', path: '/accounts', icon: '▤' },
    { label: 'Transactions', path: '/transactions', icon: '↕' },
    { label: 'Cards', path: '/cards', icon: '▭' },
    { label: 'Loans', path: '/loans', icon: '₹' },
    { label: 'Service Requests', path: '/service-requests', icon: '◉' },
    { label: 'Profile', path: '/profile', icon: '◯' },
  ]

  const totalBalance = accounts.reduce(
    (total, account) => total + Number(account.balance || 0),
    0
  )

  const activeAccounts = accounts.filter(
    (account) => account.status === 'ACTIVE'
  ).length

  return (
    <>
      <style>{`
        .fb-accounts-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          background: #f5f7fb;
          color: #101828;
        }

        .fb-accounts-sidebar {
          width: 250px;
          min-height: 100vh;
          background: #ffffff;
          border-right: 1px solid #e4e7ec;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .fb-accounts-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 10px 30px;
        }

        .fb-accounts-brand-mark {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 800;
        }

        .fb-accounts-brand h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 800;
          color: #101828;
        }

        .fb-accounts-brand span {
          display: block;
          margin-top: 2px;
          font-size: 11px;
          color: #98a2b3;
        }

        .fb-accounts-nav {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .fb-accounts-nav-item {
          width: 100%;
          border: none;
          background: transparent;
          color: #667085;
          border-radius: 10px;
          padding: 12px 13px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 600;
          text-align: left;
          transition: 0.2s ease;
        }

        .fb-accounts-nav-item:hover {
          background: #f2f4f7;
          color: #344054;
        }

        .fb-accounts-nav-item.active {
          background: #eef4ff;
          color: #2563eb;
        }

        .fb-accounts-nav-icon {
          width: 22px;
          text-align: center;
          font-size: 17px;
        }

        .fb-accounts-logout {
          margin-top: auto;
          width: 100%;
          border: none;
          background: #fff5f5;
          color: #d92d20;
          border-radius: 10px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 600;
        }

        .fb-accounts-main {
          flex: 1;
          min-width: 0;
          padding: 30px 36px 45px;
          overflow-x: hidden;
        }

        .fb-accounts-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .fb-accounts-eyebrow {
          margin: 0 0 6px;
          color: #2563eb;
          font-size: 13px;
          font-weight: 700;
        }

        .fb-accounts-title {
          margin: 0;
          font-size: 30px;
          line-height: 1.2;
          font-weight: 800;
          color: #101828;
        }

        .fb-accounts-subtitle {
          margin: 7px 0 0;
          color: #667085;
          font-size: 14px;
        }

        .fb-accounts-user {
          display: flex;
          align-items: center;
          gap: 11px;
          background: #ffffff;
          border: 1px solid #eaecf0;
          padding: 9px 14px 9px 9px;
          border-radius: 14px;
        }

        .fb-accounts-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #eaf2ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .fb-accounts-user strong {
          display: block;
          font-size: 13px;
          color: #344054;
        }

        .fb-accounts-user span {
          display: block;
          margin-top: 2px;
          font-size: 11px;
          color: #98a2b3;
        }

        .fb-accounts-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 26px;
        }

        .fb-accounts-stat {
          background: #ffffff;
          border: 1px solid #eaecf0;
          border-radius: 16px;
          padding: 21px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 2px 8px rgba(16, 24, 40, 0.03);
        }

        .fb-accounts-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 13px;
          background: #eef4ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .fb-accounts-stat-label {
          display: block;
          color: #667085;
          font-size: 12px;
          margin-bottom: 5px;
        }

        .fb-accounts-stat-value {
          display: block;
          color: #101828;
          font-size: 21px;
          font-weight: 800;
        }

        .fb-accounts-container {
          background: #ffffff;
          border: 1px solid #eaecf0;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(16, 24, 40, 0.03);
        }

        .fb-accounts-container-header {
          margin-bottom: 22px;
        }

        .fb-accounts-container-header h2 {
          margin: 0;
          font-size: 19px;
          font-weight: 750;
          color: #101828;
        }

        .fb-accounts-container-header p {
          margin: 5px 0 0;
          font-size: 13px;
          color: #98a2b3;
        }

        .fb-account-card {
          border: 1px solid #eaecf0;
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 14px;
          display: grid;
          grid-template-columns: minmax(220px, 1.5fr) minmax(130px, 1fr) minmax(130px, 1fr) minmax(170px, 1fr) auto;
          align-items: center;
          gap: 22px;
          background: #ffffff;
          transition: 0.2s ease;
        }

        .fb-account-card:last-child {
          margin-bottom: 0;
        }

        .fb-account-card:hover {
          border-color: #c7d7fe;
          box-shadow: 0 5px 18px rgba(37, 99, 235, 0.07);
        }

        .fb-account-main {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .fb-account-icon {
          width: 48px;
          height: 48px;
          border-radius: 13px;
          background: #eef4ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .fb-account-type {
          margin: 0;
          color: #101828;
          font-size: 16px;
          font-weight: 750;
        }

        .fb-account-number {
          margin: 5px 0 0;
          color: #667085;
          font-size: 13px;
          letter-spacing: 0.5px;
        }

        .fb-account-info span,
        .fb-account-balance span {
          display: block;
          color: #98a2b3;
          font-size: 11px;
          margin-bottom: 5px;
        }

        .fb-account-info strong {
          display: block;
          color: #344054;
          font-size: 13px;
          font-weight: 650;
        }

        .fb-account-balance strong {
          display: block;
          color: #101828;
          font-size: 16px;
          font-weight: 800;
        }

        .fb-account-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
        }

        .fb-account-status.active {
          background: #ecfdf3;
          color: #027a48;
        }

        .fb-account-status.inactive {
          background: #fef3f2;
          color: #b42318;
        }

        .fb-accounts-message {
          background: #ffffff;
          border: 1px solid #eaecf0;
          border-radius: 16px;
          padding: 35px;
          text-align: center;
          color: #667085;
        }

        .fb-accounts-empty-icon {
          width: 52px;
          height: 52px;
          margin: 0 auto 12px;
          border-radius: 14px;
          background: #f2f4f7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }

        .fb-accounts-message h3 {
          margin: 0 0 5px;
          color: #344054;
          font-size: 16px;
        }

        .fb-accounts-message p {
          margin: 0;
          font-size: 13px;
        }

        @media (max-width: 1100px) {
          .fb-account-card {
            grid-template-columns: 1fr 1fr;
          }

          .fb-account-main {
            grid-column: span 2;
          }
        }

        @media (max-width: 800px) {
          .fb-accounts-sidebar {
            width: 205px;
          }

          .fb-accounts-main {
            padding: 24px 20px;
          }

          .fb-accounts-summary {
            grid-template-columns: 1fr;
          }

          .fb-accounts-header {
            align-items: flex-start;
          }

          .fb-accounts-user {
            display: none;
          }
        }

        @media (max-width: 600px) {
          .fb-accounts-page {
            display: block;
          }

          .fb-accounts-sidebar {
            width: 100%;
            min-height: auto;
            border-right: none;
            border-bottom: 1px solid #eaecf0;
          }

          .fb-accounts-nav {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .fb-accounts-logout {
            margin-top: 15px;
          }

          .fb-accounts-main {
            padding: 22px 14px;
          }

          .fb-accounts-title {
            font-size: 25px;
          }

          .fb-account-card {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .fb-account-main {
            grid-column: auto;
          }
        }
      `}</style>

      <div className="fb-accounts-page">

        <aside className="fb-accounts-sidebar">

          <div className="fb-accounts-brand">
            <div className="fb-accounts-brand-mark">F</div>

            <div>
              <h2>FinBank</h2>
              <span>Digital Banking</span>
            </div>
          </div>

          <nav className="fb-accounts-nav">

            {navItems.map((item) => (
              <button
                key={item.path}
                className={`fb-accounts-nav-item ${
                  item.path === '/accounts' ? 'active' : ''
                }`}
                onClick={() => navigate(item.path)}
              >
                <span className="fb-accounts-nav-icon">
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </button>
            ))}

          </nav>

          <button
            className="fb-accounts-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            <span>Logout</span>
          </button>

        </aside>

        <main className="fb-accounts-main">

          <header className="fb-accounts-header">

            <div>
              <p className="fb-accounts-eyebrow">
                Customer Portal
              </p>

              <h1 className="fb-accounts-title">
                My Accounts
              </h1>

              <p className="fb-accounts-subtitle">
                View and manage your FinBank accounts
              </p>
            </div>

            <div className="fb-accounts-user">
              <div className="fb-accounts-avatar">
                A
              </div>

              <div>
                <strong>Customer</strong>
                <span>Personal Banking</span>
              </div>
            </div>

          </header>

          {loading && (
            <div className="fb-accounts-message">
              Loading your accounts...
            </div>
          )}

          {error && (
            <div className="fb-accounts-message">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <section className="fb-accounts-summary">

                <div className="fb-accounts-stat">
                  <div className="fb-accounts-stat-icon">
                    ▤
                  </div>

                  <div>
                    <span className="fb-accounts-stat-label">
                      Total Accounts
                    </span>

                    <strong className="fb-accounts-stat-value">
                      {accounts.length}
                    </strong>
                  </div>
                </div>

                <div className="fb-accounts-stat">
                  <div className="fb-accounts-stat-icon">
                    ₹
                  </div>

                  <div>
                    <span className="fb-accounts-stat-label">
                      Total Balance
                    </span>

                    <strong className="fb-accounts-stat-value">
                      {formatMoney(totalBalance)}
                    </strong>
                  </div>
                </div>

                <div className="fb-accounts-stat">
                  <div className="fb-accounts-stat-icon">
                    ✓
                  </div>

                  <div>
                    <span className="fb-accounts-stat-label">
                      Active Accounts
                    </span>

                    <strong className="fb-accounts-stat-value">
                      {activeAccounts}
                    </strong>
                  </div>
                </div>

              </section>

              <section className="fb-accounts-container">

                <div className="fb-accounts-container-header">
                  <h2>Account Details</h2>

                  <p>
                    Your accounts linked with FinBank
                  </p>
                </div>

                {accounts.length === 0 ? (
                  <div className="fb-accounts-message">
                    <div className="fb-accounts-empty-icon">
                      ▤
                    </div>

                    <h3>No accounts found</h3>

                    <p>
                      No bank accounts are currently linked
                      to your profile.
                    </p>
                  </div>
                ) : (
                  accounts.map((account) => (
                    <div
                      className="fb-account-card"
                      key={account.id}
                    >

                      <div className="fb-account-main">

                        <div className="fb-account-icon">
                          ₹
                        </div>

                        <div>
                          <h3 className="fb-account-type">
                            {account.account_type}
                          </h3>

                          <p className="fb-account-number">
                            {maskAccount(account.account_number)}
                          </p>
                        </div>

                      </div>

                      <div className="fb-account-info">
                        <span>Branch</span>

                        <strong>
                          {account.branch_name || 'FinBank Branch'}
                        </strong>
                      </div>

                      <div className="fb-account-info">
                        <span>IFSC</span>

                        <strong>
                          {account.ifsc_code || '—'}
                        </strong>
                      </div>

                      <div className="fb-account-balance">
                        <span>Available Balance</span>

                        <strong>
                          {formatMoney(account.balance)}
                        </strong>
                      </div>

                      <div>
                        <span
                          className={`fb-account-status ${
                            account.status === 'ACTIVE'
                              ? 'active'
                              : 'inactive'
                          }`}
                        >
                          {account.status}
                        </span>
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

export default Accounts
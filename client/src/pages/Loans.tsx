import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiFetch from '../api'

type Loan = {
  id: number
  loan_number: string
  loan_type: string
  principal_amount: number | string
  outstanding_amount: number | string
  interest_rate: number | string
  emi_amount: number | string
  next_emi_date: string
  tenure_months: number
  status: string
  start_date: string
}

function Loans() {
  const navigate = useNavigate()

  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadLoans = async () => {
      try {
        const response = await apiFetch(
          '/loans/me'
        )

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || 'Failed to load loans'
          )
        }

        setLoans(data.loans || [])
      } catch (err) {
        console.error(err)
        setError('Unable to load loan information')
      } finally {
        setLoading(false)
      }
    }

    loadLoans()
  }, [])

  const money = (value: number | string) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(Number(value || 0))

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

  const totalOutstanding = loans.reduce(
    (sum, loan) =>
      sum + Number(loan.outstanding_amount || 0),
    0
  )

  const totalEmi = loans.reduce(
    (sum, loan) =>
      sum + Number(loan.emi_amount || 0),
    0
  )

  return (
    <>
      <style>{`
        .fb-loan-page {
          min-height: 100vh;
          display: flex;
          background: #f5f7fb;
          color: #101828;
        }

        .fb-loan-sidebar {
          width: 250px;
          min-height: 100vh;
          background: #fff;
          border-right: 1px solid #e4e7ec;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .fb-loan-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 10px 30px;
        }

        .fb-loan-mark {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg,#2563eb,#4f46e5);
          color: #fff;
          display: grid;
          place-items: center;
          font-size: 22px;
          font-weight: 800;
        }

        .fb-loan-brand h2 {
          margin: 0;
          font-size: 20px;
        }

        .fb-loan-brand span {
          font-size: 11px;
          color: #98a2b3;
        }

        .fb-loan-nav {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .fb-loan-nav button,
        .fb-loan-logout {
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

        .fb-loan-nav button:hover {
          background: #f2f4f7;
        }

        .fb-loan-nav button.active {
          background: #eef4ff;
          color: #2563eb;
        }

        .fb-loan-logout {
          margin-top: auto;
          background: #fff5f5;
          color: #d92d20;
        }

        .fb-loan-main {
          flex: 1;
          min-width: 0;
          padding: 30px 36px 45px;
        }

        .fb-loan-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        .fb-loan-eyebrow {
          margin: 0 0 6px;
          color: #2563eb;
          font-size: 13px;
          font-weight: 700;
        }

        .fb-loan-title {
          margin: 0;
          font-size: 30px;
          font-weight: 800;
        }

        .fb-loan-subtitle {
          margin: 7px 0 0;
          color: #667085;
          font-size: 14px;
        }

        .fb-loan-user {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          border: 1px solid #eaecf0;
          padding: 9px 14px 9px 9px;
          border-radius: 14px;
        }

        .fb-loan-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #eaf2ff;
          color: #2563eb;
          display: grid;
          place-items: center;
          font-weight: 800;
        }

        .fb-loan-user strong,
        .fb-loan-user span {
          display: block;
        }

        .fb-loan-user strong {
          font-size: 13px;
        }

        .fb-loan-user span {
          color: #98a2b3;
          font-size: 11px;
        }

        .fb-loan-summary {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 18px;
          margin-bottom: 25px;
        }

        .fb-loan-stat {
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 16px;
          padding: 20px;
        }

        .fb-loan-stat span {
          color: #667085;
          font-size: 12px;
        }

        .fb-loan-stat strong {
          display: block;
          margin-top: 7px;
          font-size: 21px;
        }

        .fb-loan-container {
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 18px;
          padding: 24px;
        }

        .fb-loan-container h2 {
          margin: 0;
          font-size: 19px;
        }

        .fb-loan-container > p {
          color: #98a2b3;
          font-size: 13px;
          margin: 5px 0 22px;
        }

        .fb-loan-card {
          border: 1px solid #eaecf0;
          border-radius: 16px;
          padding: 21px;
          margin-bottom: 15px;
        }

        .fb-loan-card:last-child {
          margin-bottom: 0;
        }

        .fb-loan-card-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 20px;
        }

        .fb-loan-type {
          font-size: 17px;
          font-weight: 800;
          margin: 0;
        }

        .fb-loan-number {
          margin: 5px 0 0;
          color: #667085;
          font-size: 12px;
        }

        .fb-loan-status {
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          background: #ecfdf3;
          color: #027a48;
        }

        .fb-loan-grid {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 15px;
        }

        .fb-loan-info {
          background: #f8fafc;
          border-radius: 11px;
          padding: 14px;
        }

        .fb-loan-info span {
          display: block;
          color: #98a2b3;
          font-size: 10px;
          margin-bottom: 5px;
        }

        .fb-loan-info strong {
          font-size: 14px;
          color: #344054;
        }

        .fb-loan-message {
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 16px;
          padding: 35px;
          text-align: center;
          color: #667085;
        }

        @media(max-width:900px) {
          .fb-loan-grid {
            grid-template-columns: 1fr 1fr;
          }

          .fb-loan-sidebar {
            width: 205px;
          }

          .fb-loan-main {
            padding: 24px 20px;
          }
        }

        @media(max-width:700px) {
          .fb-loan-summary {
            grid-template-columns: 1fr;
          }

          .fb-loan-user {
            display: none;
          }
        }

        @media(max-width:600px) {
          .fb-loan-page {
            display: block;
          }

          .fb-loan-sidebar {
            width: 100%;
            min-height: auto;
          }

          .fb-loan-nav {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .fb-loan-logout {
            margin-top: 15px;
          }

          .fb-loan-main {
            padding: 20px 14px;
          }

          .fb-loan-title {
            font-size: 25px;
          }

          .fb-loan-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="fb-loan-page">

        <aside className="fb-loan-sidebar">

          <div className="fb-loan-brand">
            <div className="fb-loan-mark">F</div>

            <div>
              <h2>FinBank</h2>
              <span>Digital Banking</span>
            </div>
          </div>

          <nav className="fb-loan-nav">
            {nav.map(([label, path, icon]) => (
              <button
                key={path}
                className={
                  path === '/loans'
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
            className="fb-loan-logout"
            onClick={logout}
          >
            ↪ <span>Logout</span>
          </button>

        </aside>

        <main className="fb-loan-main">

          <header className="fb-loan-header">

            <div>
              <p className="fb-loan-eyebrow">
                Customer Portal
              </p>

              <h1 className="fb-loan-title">
                My Loans
              </h1>

              <p className="fb-loan-subtitle">
                Track your loans, EMI and outstanding balance
              </p>
            </div>

            <div className="fb-loan-user">
              <div className="fb-loan-avatar">
                A
              </div>

              <div>
                <strong>Customer</strong>
                <span>Personal Banking</span>
              </div>
            </div>

          </header>

          {loading && (
            <div className="fb-loan-message">
              Loading your loans...
            </div>
          )}

          {error && (
            <div className="fb-loan-message">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <section className="fb-loan-summary">

                <div className="fb-loan-stat">
                  <span>Total Loans</span>
                  <strong>
                    {loans.length}
                  </strong>
                </div>

                <div className="fb-loan-stat">
                  <span>Total Outstanding</span>
                  <strong>
                    {money(totalOutstanding)}
                  </strong>
                </div>

                <div className="fb-loan-stat">
                  <span>Total Monthly EMI</span>
                  <strong>
                    {money(totalEmi)}
                  </strong>
                </div>

              </section>

              <section className="fb-loan-container">

                <h2>Loan Details</h2>

                <p>
                  Your active and existing FinBank loans
                </p>

                {loans.length === 0 ? (
                  <div className="fb-loan-message">
                    No loans found.
                  </div>
                ) : (
                  loans.map(loan => (
                    <div
                      className="fb-loan-card"
                      key={loan.id}
                    >

                      <div className="fb-loan-card-head">

                        <div>
                          <h3 className="fb-loan-type">
                            {loan.loan_type}
                          </h3>

                          <p className="fb-loan-number">
                            Loan No: {loan.loan_number}
                          </p>
                        </div>

                        <span className="fb-loan-status">
                          {loan.status}
                        </span>

                      </div>

                      <div className="fb-loan-grid">

                        <div className="fb-loan-info">
                          <span>Principal Amount</span>
                          <strong>
                            {money(loan.principal_amount)}
                          </strong>
                        </div>

                        <div className="fb-loan-info">
                          <span>Outstanding</span>
                          <strong>
                            {money(loan.outstanding_amount)}
                          </strong>
                        </div>

                        <div className="fb-loan-info">
                          <span>Monthly EMI</span>
                          <strong>
                            {money(loan.emi_amount)}
                          </strong>
                        </div>

                        <div className="fb-loan-info">
                          <span>Interest Rate</span>
                          <strong>
                            {loan.interest_rate}%
                          </strong>
                        </div>

                        <div className="fb-loan-info">
                          <span>Next EMI</span>
                          <strong>
                            {formatDate(loan.next_emi_date)}
                          </strong>
                        </div>

                        <div className="fb-loan-info">
                          <span>Tenure</span>
                          <strong>
                            {loan.tenure_months} months
                          </strong>
                        </div>

                        <div className="fb-loan-info">
                          <span>Start Date</span>
                          <strong>
                            {formatDate(loan.start_date)}
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

export default Loans
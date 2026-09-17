import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiFetch from '../api'

type Transaction = {
  id: number
  account_id: number
  transaction_reference: string
  transaction_type: string
  category: string
  description: string
  amount: number | string
  transaction_date: string
  status: string
}

function Transactions() {
  const navigate = useNavigate()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const response = await apiFetch(
          '/transactions/me'
        )

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || 'Failed to load transactions'
          )
        }

        setTransactions(data.transactions || [])
      } catch (err) {
        console.error(err)
        setError('Unable to load transaction information')
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
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

  const isCredit = (type: string) =>
    ['CREDIT', 'DEPOSIT', 'REFUND'].includes(
      type?.toUpperCase()
    )

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

  const totalCredit = transactions
    .filter(t => isCredit(t.transaction_type))
    .reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    )

  const totalDebit = transactions
    .filter(t => !isCredit(t.transaction_type))
    .reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    )

  return (
    <>
      <style>{`
        .fb-tx-page {
          min-height: 100vh;
          display: flex;
          background: #f5f7fb;
          color: #101828;
        }

        .fb-tx-sidebar {
          width: 250px;
          min-height: 100vh;
          background: #fff;
          border-right: 1px solid #e4e7ec;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .fb-tx-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 10px 30px;
        }

        .fb-tx-mark {
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

        .fb-tx-brand h2 {
          margin: 0;
          font-size: 20px;
        }

        .fb-tx-brand span {
          font-size: 11px;
          color: #98a2b3;
        }

        .fb-tx-nav {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .fb-tx-nav button,
        .fb-tx-logout {
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

        .fb-tx-nav button:hover {
          background: #f2f4f7;
        }

        .fb-tx-nav button.active {
          background: #eef4ff;
          color: #2563eb;
        }

        .fb-tx-logout {
          margin-top: auto;
          background: #fff5f5;
          color: #d92d20;
        }

        .fb-tx-main {
          flex: 1;
          min-width: 0;
          padding: 30px 36px 45px;
        }

        .fb-tx-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        .fb-tx-eyebrow {
          margin: 0 0 6px;
          color: #2563eb;
          font-size: 13px;
          font-weight: 700;
        }

        .fb-tx-title {
          margin: 0;
          font-size: 30px;
          font-weight: 800;
        }

        .fb-tx-subtitle {
          margin: 7px 0 0;
          color: #667085;
          font-size: 14px;
        }

        .fb-tx-user {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          border: 1px solid #eaecf0;
          padding: 9px 14px 9px 9px;
          border-radius: 14px;
        }

        .fb-tx-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #eaf2ff;
          color: #2563eb;
          display: grid;
          place-items: center;
          font-weight: 800;
        }

        .fb-tx-user strong,
        .fb-tx-user span {
          display: block;
        }

        .fb-tx-user strong {
          font-size: 13px;
        }

        .fb-tx-user span {
          color: #98a2b3;
          font-size: 11px;
        }

        .fb-tx-summary {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 18px;
          margin-bottom: 25px;
        }

        .fb-tx-stat {
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 16px;
          padding: 20px;
        }

        .fb-tx-stat span {
          color: #667085;
          font-size: 12px;
        }

        .fb-tx-stat strong {
          display: block;
          margin-top: 7px;
          font-size: 21px;
        }

        .fb-tx-container {
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 18px;
          padding: 24px;
        }

        .fb-tx-container h2 {
          margin: 0;
          font-size: 19px;
        }

        .fb-tx-container > p {
          color: #98a2b3;
          font-size: 13px;
          margin: 5px 0 22px;
        }

        .fb-tx-row {
          display: grid;
          grid-template-columns: 50px minmax(180px,1.6fr) minmax(100px,1fr) minmax(120px,1fr) minmax(100px,auto) auto;
          align-items: center;
          gap: 16px;
          padding: 17px 8px;
          border-bottom: 1px solid #f2f4f7;
        }

        .fb-tx-row:last-child {
          border-bottom: 0;
        }

        .fb-tx-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #f2f4f7;
          font-weight: 800;
          font-size: 17px;
        }

        .fb-tx-icon.credit {
          background: #ecfdf3;
          color: #027a48;
        }

        .fb-tx-icon.debit {
          background: #fef3f2;
          color: #d92d20;
        }

        .fb-tx-description strong {
          display: block;
          font-size: 13px;
          color: #344054;
        }

        .fb-tx-description span {
          display: block;
          margin-top: 4px;
          font-size: 11px;
          color: #98a2b3;
        }

        .fb-tx-info span {
          display: block;
          font-size: 10px;
          color: #98a2b3;
          margin-bottom: 4px;
        }

        .fb-tx-info strong {
          font-size: 12px;
          color: #475467;
        }

        .fb-tx-amount {
          font-size: 14px;
          font-weight: 800;
          white-space: nowrap;
        }

        .fb-tx-amount.credit {
          color: #027a48;
        }

        .fb-tx-amount.debit {
          color: #344054;
        }

        .fb-tx-status {
          padding: 5px 9px;
          border-radius: 999px;
          background: #ecfdf3;
          color: #027a48;
          font-size: 10px;
          font-weight: 700;
        }

        .fb-tx-message {
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 16px;
          padding: 35px;
          text-align: center;
          color: #667085;
        }

        @media(max-width:1000px) {
          .fb-tx-row {
            grid-template-columns: 45px 1fr 1fr;
          }

          .fb-tx-info:nth-child(4) {
            display: none;
          }
        }

        @media(max-width:800px) {
          .fb-tx-sidebar {
            width: 205px;
          }

          .fb-tx-main {
            padding: 24px 20px;
          }

          .fb-tx-summary {
            grid-template-columns: 1fr;
          }

          .fb-tx-user {
            display: none;
          }
        }

        @media(max-width:600px) {
          .fb-tx-page {
            display: block;
          }

          .fb-tx-sidebar {
            width: 100%;
            min-height: auto;
          }

          .fb-tx-nav {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .fb-tx-logout {
            margin-top: 15px;
          }

          .fb-tx-main {
            padding: 20px 14px;
          }

          .fb-tx-title {
            font-size: 25px;
          }

          .fb-tx-row {
            grid-template-columns: 40px 1fr auto;
            gap: 10px;
          }

          .fb-tx-info {
            display: none;
          }
        }
      `}</style>

      <div className="fb-tx-page">

        <aside className="fb-tx-sidebar">

          <div className="fb-tx-brand">
            <div className="fb-tx-mark">F</div>

            <div>
              <h2>FinBank</h2>
              <span>Digital Banking</span>
            </div>
          </div>

          <nav className="fb-tx-nav">
            {nav.map(([label, path, icon]) => (
              <button
                key={path}
                className={
                  path === '/transactions'
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
            className="fb-tx-logout"
            onClick={logout}
          >
            ↪ <span>Logout</span>
          </button>

        </aside>

        <main className="fb-tx-main">

          <header className="fb-tx-header">

            <div>
              <p className="fb-tx-eyebrow">
                Customer Portal
              </p>

              <h1 className="fb-tx-title">
                Transactions
              </h1>

              <p className="fb-tx-subtitle">
                View your complete transaction history
              </p>
            </div>

            <div className="fb-tx-user">
              <div className="fb-tx-avatar">
                A
              </div>

              <div>
                <strong>Customer</strong>
                <span>Personal Banking</span>
              </div>
            </div>

          </header>

          {loading && (
            <div className="fb-tx-message">
              Loading your transactions...
            </div>
          )}

          {error && (
            <div className="fb-tx-message">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <section className="fb-tx-summary">

                <div className="fb-tx-stat">
                  <span>Total Transactions</span>
                  <strong>
                    {transactions.length}
                  </strong>
                </div>

                <div className="fb-tx-stat">
                  <span>Total Credits</span>
                  <strong>
                    {money(totalCredit)}
                  </strong>
                </div>

                <div className="fb-tx-stat">
                  <span>Total Debits</span>
                  <strong>
                    {money(totalDebit)}
                  </strong>
                </div>

              </section>

              <section className="fb-tx-container">

                <h2>Transaction History</h2>

                <p>
                  Recent and previous transactions from your accounts
                </p>

                {transactions.length === 0 ? (
                  <div className="fb-tx-message">
                    No transactions found.
                  </div>
                ) : (
                  transactions.map(transaction => {

                    const credit = isCredit(
                      transaction.transaction_type
                    )

                    return (
                      <div
                        className="fb-tx-row"
                        key={transaction.id}
                      >

                        <div
                          className={`fb-tx-icon ${
                            credit
                              ? 'credit'
                              : 'debit'
                          }`}
                        >
                          {credit ? '↓' : '↑'}
                        </div>

                        <div className="fb-tx-description">

                          <strong>
                            {transaction.description ||
                              transaction.category ||
                              'Transaction'}
                          </strong>

                          <span>
                            {transaction.transaction_reference}
                          </span>

                        </div>

                        <div className="fb-tx-info">

                          <span>Category</span>

                          <strong>
                            {transaction.category || '—'}
                          </strong>

                        </div>

                        <div className="fb-tx-info">

                          <span>Date</span>

                          <strong>
                            {formatDate(
                              transaction.transaction_date
                            )}
                          </strong>

                        </div>

                        <div
                          className={`fb-tx-amount ${
                            credit
                              ? 'credit'
                              : 'debit'
                          }`}
                        >
                          {credit ? '+' : '-'}
                          {money(transaction.amount)}
                        </div>

                        <span className="fb-tx-status">
                          {transaction.status}
                        </span>

                      </div>
                    )
                  })
                )}

              </section>
            </>
          )}

        </main>
      </div>
    </>
  )
}

export default Transactions
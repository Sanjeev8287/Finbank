import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import { apiFetch } from '../api'

type Customer = {
  id: number
  customer_code: string
  full_name: string
  email: string
  phone?: string
  city?: string
  state?: string
  status: string
  customer_type: string
  rm_name?: string
}

type Account = {
  id: number
  account_number: string
  account_type: string
  branch_name?: string
  ifsc_code?: string
  balance: string | number
  currency?: string
  status: string
  opened_at?: string
}

type Card = {
  id: number
  card_number: string
  card_type: string
  card_variant?: string
  expiry_date?: string
  credit_limit: string | number
  available_limit: string | number
  status: string
}

type Loan = {
  id: number
  loan_number: string
  loan_type: string
  principal_amount: string | number
  outstanding_amount: string | number
  interest_rate: string | number
  emi_amount: string | number
  next_emi_date?: string
  tenure_months?: number
  status: string
}

type Transaction = {
  id: number
  transaction_reference: string
  transaction_type: string
  category: string
  description: string
  amount: string | number
  transaction_date: string
  status: string
  account_id?: number
  account_number?: string
}

type DashboardData = {
  customer?: Customer

  summary?: {
    total_balance?: string | number
    total_loan_outstanding?: string | number
    total_card_used?: string | number
    total_credit_limit?: string | number
  }

  accounts?: Account[]
  cards?: Card[]
  loans?: Loan[]
  transactions?: Transaction[]
  serviceRequests?: unknown[]
  service_requests?: unknown[]
}

function Dashboard() {
  const navigate = useNavigate()

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const logout = () => {
    localStorage.removeItem('finbank_token')
    localStorage.removeItem('finbank_user')

    navigate('/login')
  }

  useEffect(() => {
    let mounted = true

    const fetchDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        const token =
          localStorage.getItem('finbank_token')

        if (!token) {
          navigate('/login')
          return
        }

        const response =
          await apiFetch(
            '/customers/me/dashboard'
          )

        const data =
          await response.json()

        if (!response.ok) {
          throw new Error(
            data.message ||
              'Failed to load dashboard'
          )
        }

        if (!data.success) {
          throw new Error(
            data.message ||
              'Failed to load dashboard'
          )
        }

        if (!data.customer) {
          throw new Error(
            'Customer information was not returned by the server.'
          )
        }

        if (mounted) {
          setDashboard(data)
        }
      } catch (error) {
        console.error(
          'Dashboard error:',
          error
        )

        if (mounted) {
          setError(
            error instanceof Error
              ? error.message
              : 'Failed to load dashboard'
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchDashboard()

    return () => {
      mounted = false
    }
  }, [navigate])

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f5f7fb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          color: '#101828',
        }}
      >
        Loading your dashboard...
      </div>
    )
  }

  if (error || !dashboard?.customer) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f5f7fb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            boxShadow:
              '0 10px 30px rgba(0,0,0,0.08)',
          }}
        >
          <h2
            style={{
              marginBottom: '12px',
              color: '#101828',
            }}
          >
            Unable to load dashboard
          </h2>

          <p
            style={{
              color: '#667085',
              lineHeight: 1.6,
            }}
          >
            {error ||
              'Customer dashboard data is unavailable.'}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            style={{
              marginTop: '15px',
              padding: '11px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#101828',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const customer = dashboard.customer

  const summary =
    dashboard.summary || {}

  const accounts =
    Array.isArray(
      dashboard.accounts
    )
      ? dashboard.accounts
      : []

  const cards =
    Array.isArray(
      dashboard.cards
    )
      ? dashboard.cards
      : []

  const loans =
    Array.isArray(
      dashboard.loans
    )
      ? dashboard.loans
      : []

  const transactions =
    Array.isArray(
      dashboard.transactions
    )
      ? dashboard.transactions
      : []

  const totalBalance =
    Number(
      summary.total_balance || 0
    )

  const totalCardUsed =
    Number(
      summary.total_card_used || 0
    )

  const totalCreditLimit =
    Number(
      summary.total_credit_limit || 0
    ) ||
    cards.reduce(
      (total, card) =>
        total +
        Number(
          card.credit_limit || 0
        ),
      0
    )

  const creditUtilization =
    totalCreditLimit > 0
      ? Math.round(
          (totalCardUsed /
            totalCreditLimit) *
            100
        )
      : 0

  const activeLoans =
    loans.filter(
      (loan) =>
        String(
          loan.status
        ).toUpperCase() ===
        'ACTIVE'
    )

  const nextLoan = [...activeLoans]
    .filter(
      (loan) =>
        Boolean(
          loan.next_emi_date
        )
    )
    .sort(
      (a, b) =>
        new Date(
          a.next_emi_date!
        ).getTime() -
        new Date(
          b.next_emi_date!
        ).getTime()
    )[0]

  const nextEmi = nextLoan
    ? Number(
        nextLoan.emi_amount || 0
      )
    : 0

  const monthlySpending =
    transactions
      .filter(
        (transaction) =>
          String(
            transaction.transaction_type || ''
          ).toUpperCase() ===
          'DEBIT'
      )
      .reduce(
        (total, transaction) =>
          total +
          Number(
            transaction.amount || 0
          ),
        0
      )

  const formatCurrency = (
    amount: number
  ) => {
    return `₹ ${amount.toLocaleString(
      'en-IN',
      {
        maximumFractionDigits: 2,
      }
    )}`
  }

  const formatShortCurrency = (
    amount: number
  ) => {
    return `₹ ${amount.toLocaleString(
      'en-IN',
      {
        maximumFractionDigits: 0,
      }
    )}`
  }

  const formatDate = (
    date?: string
  ) => {
    if (!date) return ''

    const parsedDate =
      new Date(date)

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return ''
    }

    return parsedDate.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
      }
    )
  }

  const getAccountLastFour = (
    accountNumber?: string
  ) => {
    if (!accountNumber) {
      return '----'
    }

    return accountNumber.slice(-4)
  }

  const getTransactionIcon = (
    category?: string
  ) => {
    const value =
      category?.toLowerCase() || ''

    if (
      value.includes('food')
    )
      return '🍔'

    if (
      value.includes('shopping')
    )
      return '🛒'

    if (
      value.includes('salary')
    )
      return '💼'

    if (
      value.includes('utility')
    )
      return '⚡'

    return '₹'
  }

  const openAI = (
    question?: string
  ) => {
    if (question) {
      sessionStorage.setItem(
        'finbank_ai_question',
        question
      )
    }

    navigate('/ai-assistant')
  }

  const firstName =
    customer.full_name
      ?.trim()
      .split(' ')[0] ||
    'Customer'

  const customerInitial =
    customer.full_name
      ?.charAt(0)
      .toUpperCase() ||
    'C'

  return (
    <div className="finbank-app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            F
          </div>

          <div className="brand-text">

            <h2>
              FinBank
            </h2>

            <span>
              Digital Banking
            </span>

          </div>

        </div>

        <nav className="sidebar-nav">

          <button
            className="nav-item active"
          >
            <span className="nav-icon">
              ⌂
            </span>

            <span>
              Dashboard
            </span>
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate('/accounts')
            }
          >
            <span className="nav-icon">
              ▣
            </span>

            <span>
              Accounts
            </span>
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate(
                '/transactions'
              )
            }
          >
            <span className="nav-icon">
              ↕
            </span>

            <span>
              Transactions
            </span>
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate('/cards')
            }
          >
            <span className="nav-icon">
              ▰
            </span>

            <span>
              Cards
            </span>
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate('/loans')
            }
          >
            <span className="nav-icon">
              ₹
            </span>

            <span>
              Loans
            </span>
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate(
                '/service-requests'
              )
            }
          >
            <span className="nav-icon">
              ◈
            </span>

            <span>
              Service Requests
            </span>
          </button>

        </nav>

        <div className="sidebar-bottom">

          <button
            className="nav-item"
            onClick={() =>
              navigate('/profile')
            }
          >
            <span className="nav-icon">
              ◯
            </span>

            <span>
              Profile
            </span>
          </button>

          <button
            className="nav-item logout-item"
            onClick={logout}
          >
            <span className="nav-icon">
              ↪
            </span>

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main className="main-content">

        {/* TOPBAR */}

        <header className="topbar">

          <div className="welcome-area">

            <p className="welcome-text">
              Welcome back,
            </p>

            <h1>
              {firstName} 👋
            </h1>

            <p className="subtitle">
              Here's your financial
              overview for today.
            </p>

          </div>

          <div className="topbar-right">

            <button
              className="notification-btn"
            >
              <span>
                ♢
              </span>

              <i></i>
            </button>

            <div className="profile-mini">

              <div className="avatar">
                {customerInitial}
              </div>

              <div className="profile-mini-text">

                <strong>
                  {customer.full_name}
                </strong>

                <small>
                  Customer
                </small>

              </div>

              <span className="profile-arrow">
                ⌄
              </span>

            </div>

          </div>

        </header>

        {/* BALANCE */}

        <section className="balance-card">

          <div className="balance-main">

            <div className="balance-heading">

              <span className="balance-icon">
                ₹
              </span>

              <div>

                <p>
                  Total Available Balance
                </p>

                <span className="balance-caption">
                  Across all your accounts
                </span>

              </div>

            </div>

            <h2>
              {formatCurrency(
                totalBalance
              )}
            </h2>

            <span className="balance-account">

              {accounts.length > 0
                ? `${accounts[0].account_type} Account •••• ${getAccountLastFour(
                    accounts[0]
                      .account_number
                  )}`
                : 'No active account'}

            </span>

          </div>

          <div className="balance-right">

            <span className="balance-label">
              Account Status
            </span>

            <span className="status-badge">

              <span>
                ●
              </span>{' '}

              {customer.status}

            </span>

            <button
              className="balance-action"
              onClick={() =>
                navigate('/accounts')
              }
            >
              View Account →
            </button>

          </div>

        </section>

        {/* STATS */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon spending-icon">
              ₹
            </div>

            <div className="stat-content">

              <p>
                Recent Spending
              </p>

              <h3>
                {formatShortCurrency(
                  monthlySpending
                )}
              </h3>

              <span className="positive">

                ●{' '}

                <small>
                  Based on recent
                  transactions
                </small>

              </span>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon credit-icon">
              %
            </div>

            <div className="stat-content">

              <p>
                Credit Utilization
              </p>

              <h3>
                {creditUtilization}%
              </h3>

              <span className="positive">

                ●{' '}

                <small>
                  {creditUtilization <=
                  30
                    ? 'Healthy utilization'
                    : 'Review utilization'}
                </small>

              </span>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon loan-icon">
              ₹
            </div>

            <div className="stat-content">

              <p>
                Active Loans
              </p>

              <h3>
                {activeLoans.length}
              </h3>

              <span className="neutral">

                Next EMI:{' '}

                <strong>
                  {nextEmi > 0
                    ? formatShortCurrency(
                        nextEmi
                      )
                    : 'N/A'}
                </strong>

              </span>

            </div>

          </div>

        </section>

        {/* TRANSACTIONS + AI */}

        <section className="dashboard-grid">

          <div className="panel transactions-panel">

            <div className="panel-header">

              <div>

                <h2>
                  Recent Transactions
                </h2>

                <p>
                  Your latest account
                  activity
                </p>

              </div>

              <button
                className="view-btn"
                onClick={() =>
                  navigate(
                    '/transactions'
                  )
                }
              >
                View All →
              </button>

            </div>

            <div className="transaction-list">

              {transactions.length === 0 ? (

                <p>
                  No transactions
                  found.
                </p>

              ) : (

                transactions
                  .slice(0, 4)
                  .map(
                    (
                      transaction
                    ) => {

                      const isCredit =
                        String(
                          transaction.transaction_type || ''
                        ).toUpperCase() ===
                        'CREDIT'

                      return (

                        <div
                          className="transaction"
                          key={
                            transaction.id
                          }
                        >

                          <div className="transaction-icon">

                            {getTransactionIcon(
                              transaction.category
                            )}

                          </div>

                          <div className="transaction-info">

                            <strong>
                              {
                                transaction.description
                              }
                            </strong>

                            <span>

                              {formatDate(
                                transaction.transaction_date
                              )}{' '}
                              ·{' '}
                              {
                                transaction.category
                              }

                            </span>

                          </div>

                          <strong
                            className={`amount ${
                              isCredit
                                ? 'credit'
                                : 'debit'
                            }`}
                          >

                            {isCredit
                              ? '+'
                              : '-'}{' '}

                            {formatShortCurrency(
                              Number(
                                transaction.amount || 0
                              )
                            )}

                          </strong>

                        </div>
                      )
                    }
                  )
              )}

            </div>

          </div>

          {/* AI ASSISTANT */}

          <div className="panel ai-panel">

            <div className="ai-top">

              <div className="ai-icon">
                ✦
              </div>

              <span className="ai-status">
                AI POWERED
              </span>

            </div>

            <h2>
              FinBank AI Assistant
            </h2>

            <p className="ai-description">
              Get quick answers about
              your finances,
              transactions, loans
              and accounts.
            </p>

            <button
              className="ai-question"
              onClick={() =>
                openAI(
                  'How much did I spend this month?'
                )
              }
            >
              <span>
                How much did I spend
                this month?
              </span>

              <b>
                →
              </b>
            </button>

            <button
              className="ai-question"
              onClick={() =>
                openAI(
                  'When is my next EMI due?'
                )
              }
            >
              <span>
                When is my next EMI
                due?
              </span>

              <b>
                →
              </b>
            </button>

            <button
              className="ai-main-btn"
              onClick={() =>
                openAI()
              }
            >
              <span>
                ✦
              </span>

              Open AI Assistant
            </button>

          </div>

        </section>

        {/* ACCOUNTS + RM */}

        <section className="bottom-grid">

          <div className="panel accounts-panel">

            <div className="panel-header">

              <div>

                <h2>
                  My Accounts
                </h2>

                <p>
                  Manage your bank
                  accounts
                </p>

              </div>

              <button
                className="view-btn"
                onClick={() =>
                  navigate('/accounts')
                }
              >
                View All →
              </button>

            </div>

            {accounts.length === 0 ? (

              <p>
                No accounts found.
              </p>

            ) : (

              accounts
                .slice(0, 2)
                .map(
                  (account) => (

                    <div
                      className="account-row"
                      key={
                        account.id
                      }
                    >

                      <div className="account-icon">
                        ₹
                      </div>

                      <div className="account-details">

                        <strong>

                          {
                            account.account_type
                          }{' '}

                          Account

                        </strong>

                        <span>

                          ••••{' '}

                          {getAccountLastFour(
                            account.account_number
                          )}

                        </span>

                      </div>

                      <div className="account-balance">

                        {formatShortCurrency(
                          Number(
                            account.balance || 0
                          )
                        )}

                      </div>

                    </div>

                  )
                )
            )}

          </div>

          {/* RELATIONSHIP MANAGER */}

          <div className="panel rm-card">

            <div className="rm-card-top">

              <div className="rm-avatar">

                {customer.rm_name
                  ? customer.rm_name
                      .split(' ')
                      .map(
                        (name) =>
                          name.charAt(0)
                      )
                      .join('')
                  : 'RM'}

              </div>

              <div>

                <span className="rm-label">
                  YOUR RELATIONSHIP
                  MANAGER
                </span>

                <h3>

                  {customer.rm_name ||
                    'Relationship Manager'}

                </h3>

                <p>
                  Senior Relationship
                  Manager
                </p>

              </div>

            </div>

            <div className="rm-contact">

              <div className="rm-contact-item">

                <span>
                  ✉
                </span>

                <div>

                  <small>
                    Email
                  </small>

                  <strong>

                    {customer.rm_name
                      ? 'Available through FinBank'
                      : 'Not assigned'}

                  </strong>

                </div>

              </div>

              <div className="rm-contact-item">

                <span>
                  ☎
                </span>

                <div>

                  <small>
                    Phone
                  </small>

                  <strong>
                    Contact through FinBank
                  </strong>

                </div>

              </div>

            </div>

            <button
              className="contact-btn"
              onClick={() =>
                navigate(
                  '/service-requests'
                )
              }
            >
              Contact RM

              <span>
                →
              </span>

            </button>

          </div>

        </section>

      </main>

    </div>
  )
}

export default Dashboard
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import RMSidebar from '../components/RMSidebar'
import { apiFetch } from '../api'

type Customer = {
  id: number
  customer_code: string
  full_name: string
  email: string
  phone: string | null
  date_of_birth: string | null
  gender: string | null
  address: string | null
  city: string | null
  state: string | null
  pincode: string | null
  customer_type: string
  status: string
  created_at: string
  relationship_manager_id: number | null
  rm_name: string | null
  rm_employee_code: string | null
}

type Account = {
  id: number
  account_number: string
  account_type: string
  branch_name: string
  ifsc_code: string
  balance: string | number
  currency: string
  status: string
  opened_at: string
}

type Card = {
  id: number
  card_number: string
  card_type: string
  card_variant: string
  expiry_date: string
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
  next_emi_date: string
  tenure_months: number
  status: string
  start_date: string
}

type Transaction = {
  id: number
  account_id: number | null
  account_number: string | null
  transaction_reference: string
  transaction_type: string
  category: string
  description: string
  amount: string | number
  transaction_date: string
  status: string
}

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

type Summary = {
  total_balance: string | number
  total_loan_outstanding: string | number
  total_card_used: string | number
  total_credit_limit: string | number
}

function Customer360() {
  const navigate = useNavigate()
  const { customerId } = useParams()

  const [customer, setCustomer] =
    useState<Customer | null>(null)

  const [summary, setSummary] =
    useState<Summary | null>(null)

  const [accounts, setAccounts] =
    useState<Account[]>([])

  const [cards, setCards] =
    useState<Card[]>([])

  const [loans, setLoans] =
    useState<Loan[]>([])

  const [transactions, setTransactions] =
    useState<Transaction[]>([])

  const [serviceRequests, setServiceRequests] =
    useState<ServiceRequest[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const fetchCustomer360 = async () => {
      try {
        setLoading(true)
        setError('')

        if (!customerId) {
          throw new Error(
            'Customer ID is missing'
          )
        }

        const response = await apiFetch(
          `/rm/customers/${customerId}/360`
        )

        if (!response.ok) {
          const errorData =
            await response.json().catch(() => null)

          throw new Error(
            errorData?.message ||
              'Customer information could not be loaded'
          )
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(
            data.message ||
              'Customer information could not be loaded'
          )
        }

        setCustomer(data.customer || null)
        setSummary(data.summary || null)

        setAccounts(
          Array.isArray(data.accounts)
            ? data.accounts
            : []
        )

        setCards(
          Array.isArray(data.cards)
            ? data.cards
            : []
        )

        setLoans(
          Array.isArray(data.loans)
            ? data.loans
            : []
        )

        setTransactions(
          Array.isArray(data.transactions)
            ? data.transactions
            : []
        )

        setServiceRequests(
          Array.isArray(data.serviceRequests)
            ? data.serviceRequests
            : []
        )
      } catch (err) {
        console.error(
          'Customer 360 API error:',
          err
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load customer information'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCustomer360()
  }, [customerId])

  const formatCurrency = (
    amount: string | number
  ) => {
    return `₹ ${Number(
      amount || 0
    ).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    })}`
  }

  const formatDate = (
    date: string | null | undefined
  ) => {
    if (!date) return '—'

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
      return '—'
    }

    return parsedDate.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }
    )
  }

  const formatCustomerSince = (
    date: string | null | undefined
  ) => {
    if (!date) return '—'

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
      return '—'
    }

    return parsedDate.toLocaleDateString(
      'en-IN',
      {
        month: 'long',
        year: 'numeric',
      }
    )
  }

  const maskAccountNumber = (
    accountNumber: string
  ) => {
    if (!accountNumber) return '—'

    if (accountNumber.length <= 4) {
      return accountNumber
    }

    return `•••• ${accountNumber.slice(-4)}`
  }

  const maskCardNumber = (
    cardNumber: string
  ) => {
    if (!cardNumber) return '—'

    if (cardNumber.length <= 4) {
      return cardNumber
    }

    return `•••• •••• •••• ${cardNumber.slice(-4)}`
  }

  const getCreditUtilization = () => {
    const totalLimit =
      Number(
        summary?.total_credit_limit || 0
      )

    const totalUsed =
      Number(
        summary?.total_card_used || 0
      )

    if (totalLimit <= 0) {
      return 0
    }

    return Math.max(
      0,
      Math.min(
        100,
        (totalUsed / totalLimit) * 100
      )
    )
  }

  const getOpenRequestsCount = () => {
    return serviceRequests.filter(
      (request) => {
        const status =
          request.status?.toUpperCase()

        return (
          status !== 'CLOSED' &&
          status !== 'RESOLVED' &&
          status !== 'COMPLETED'
        )
      }
    ).length
  }

  if (loading) {
    return (
      <div className="finbank-app">

        <RMSidebar />

        <main className="main-content">

          <header className="topbar">

            <div>
              <p className="welcome-text">
                Customer Management
              </p>

              <h1>
                Customer 360°
              </h1>
            </div>

          </header>

          <section className="panel customer-no-results">

            <strong>
              Loading customer information...
            </strong>

            <span>
              Fetching customer profile and
              financial data from PostgreSQL.
            </span>

          </section>

        </main>

      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="finbank-app">

        <RMSidebar />

        <main className="main-content">

          <header className="topbar">

            <div>

              <p className="welcome-text">
                Customer Management
              </p>

              <h1>
                Customer 360°
              </h1>

            </div>

          </header>

          <section className="panel customer-demo-notice">

            <div className="customer-demo-icon">
              !
            </div>

            <div>

              <h3>
                Customer Not Found
              </h3>

              <p>
                {error ||
                  'Customer information could not be loaded.'}
              </p>

              <button
                className="customer-view-btn"
                onClick={() =>
                  navigate('/rm-customers')
                }
              >
                ← Back to Customers
              </button>

            </div>

          </section>

        </main>

      </div>
    )
  }

  const isPremium =
    customer.customer_type?.toUpperCase() ===
    'PREMIUM'

  const isActive =
    customer.status?.toUpperCase() ===
    'ACTIVE'

  const totalBalance =
    Number(
      summary?.total_balance || 0
    )

  const loanOutstanding =
    Number(
      summary?.total_loan_outstanding || 0
    )

  const creditUtilization =
    getCreditUtilization()

  const openRequests =
    getOpenRequestsCount()

  return (
    <div className="finbank-app">

      <RMSidebar />

      <main className="main-content">

        {/* TOPBAR */}

        <header className="topbar">

          <div>

            <p className="welcome-text">
              Customer Management
            </p>

            <h1>
              Customer 360°
            </h1>

          </div>

          <div className="topbar-right">

            <button
              className="notification-btn"
              onClick={() =>
                alert(
                  'No new notifications.'
                )
              }
            >
              🔔
            </button>

            <div className="profile-mini">

              <div className="avatar">
                R
              </div>

              <div>

                <strong>
                  Relationship Manager
                </strong>

                <small>
                  RM Portal
                </small>

              </div>

            </div>

          </div>

        </header>

        {/* BACK */}

        <button
          className="customer-back-btn"
          onClick={() =>
            navigate('/rm-customers')
          }
        >
          ← Back to Customers
        </button>

        {/* CUSTOMER HEADER */}

        <section className="customer-360-header">

          <div className="customer-360-avatar">
            {customer.full_name
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="customer-360-main">

            <div className="customer-360-title">

              <div>

                <h2>
                  {customer.full_name}
                </h2>

                <p>
                  Customer ID:{' '}
                  {customer.customer_code}
                </p>

              </div>

              <span className="customer-360-status">
                ● {isActive
                  ? 'Active'
                  : 'Inactive'}
              </span>

            </div>

            <div className="customer-360-meta">

              <span>
                {isPremium
                  ? 'Premium'
                  : 'Regular'}{' '}
                Customer
              </span>

              <span>
                Customer Since:{' '}
                {formatCustomerSince(
                  customer.created_at
                )}
              </span>

              <span>
                RM:{' '}
                {customer.rm_name ||
                  'Not Assigned'}
              </span>

            </div>

          </div>

          <button
            className="customer-contact-btn"
            onClick={() =>
              alert(
                `Demo: Contact ${customer.full_name}`
              )
            }
          >
            Contact Customer
          </button>

        </section>

        {/* FINANCIAL SUMMARY */}

        <section className="stats-grid customer-360-stats">

          <div className="stat-card">

            <div className="stat-icon">
              ₹
            </div>

            <div>

              <span>
                Total Balance
              </span>

              <strong>
                {formatCurrency(
                  totalBalance
                )}
              </strong>

              <small>
                Across {accounts.length}{' '}
                {accounts.length === 1
                  ? 'account'
                  : 'accounts'}
              </small>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              ₹
            </div>

            <div>

              <span>
                Loan Outstanding
              </span>

              <strong>
                {formatCurrency(
                  loanOutstanding
                )}
              </strong>

              <small>
                {loans.length}{' '}
                {loans.length === 1
                  ? 'loan'
                  : 'loans'}
              </small>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              💳
            </div>

            <div>

              <span>
                Credit Utilization
              </span>

              <strong>
                {cards.length > 0
                  ? `${creditUtilization.toFixed(
                      1
                    )}%`
                  : '—'}
              </strong>

              <small>
                {cards.length}{' '}
                {cards.length === 1
                  ? 'card'
                  : 'cards'}
              </small>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              📋
            </div>

            <div>

              <span>
                Open Requests
              </span>

              <strong>
                {openRequests}
              </strong>

              <small>
                Service requests
              </small>

            </div>

          </div>

        </section>

        {/* PERSONAL INFORMATION */}

        <section className="panel customer-360-panel">

          <div className="panel-header">

            <div>

              <h2>
                Personal Information
              </h2>

              <p>
                Customer details from PostgreSQL
              </p>

            </div>

          </div>

          <div className="customer-360-info-grid">

            <div>
              <span>Full Name</span>
              <strong>
                {customer.full_name}
              </strong>
            </div>

            <div>
              <span>Customer ID</span>
              <strong>
                {customer.customer_code}
              </strong>
            </div>

            <div>
              <span>Date of Birth</span>
              <strong>
                {formatDate(
                  customer.date_of_birth
                )}
              </strong>
            </div>

            <div>
              <span>Customer Since</span>
              <strong>
                {formatCustomerSince(
                  customer.created_at
                )}
              </strong>
            </div>

            <div>
              <span>Email</span>
              <strong>
                {customer.email}
              </strong>
            </div>

            <div>
              <span>Mobile</span>
              <strong>
                {customer.phone || '—'}
              </strong>
            </div>

            <div>
              <span>City</span>
              <strong>
                {customer.city || '—'}
              </strong>
            </div>

            <div>
              <span>State</span>
              <strong>
                {customer.state || '—'}
              </strong>
            </div>

          </div>

        </section>

        {/* ACCOUNTS */}

        <section className="panel customer-360-panel">

          <div className="panel-header">

            <div>

              <h2>
                Accounts
              </h2>

              <p>
                Customer accounts
              </p>

            </div>

            <span className="section-count">
              {accounts.length}{' '}
              {accounts.length === 1
                ? 'Account'
                : 'Accounts'}
            </span>

          </div>

          {accounts.length > 0 ? (

            <div className="customer-360-list">

              {accounts.map(
                (account) => (

                  <div
                    className="customer-360-list-row"
                    key={account.id}
                  >

                    <div className="customer-360-row-icon">
                      ₹
                    </div>

                    <div className="customer-360-row-main">

                      <strong>
                        {account.account_type}
                      </strong>

                      <span>
                        {maskAccountNumber(
                          account.account_number
                        )}
                      </span>

                      <span>
                        {account.branch_name}
                      </span>

                    </div>

                    <div>

                      <span>
                        Balance
                      </span>

                      <strong>
                        {formatCurrency(
                          account.balance
                        )}
                      </strong>

                    </div>

                    <span className="customer-360-active">
                      ● {account.status}
                    </span>

                  </div>
                )
              )}

            </div>

          ) : (

            <div className="customer-no-results">

              <strong>
                No accounts found
              </strong>

              <span>
                No account records are available.
              </span>

            </div>

          )}

        </section>

        {/* CARDS */}

        <section className="panel customer-360-panel">

          <div className="panel-header">

            <div>

              <h2>
                Cards
              </h2>

              <p>
                Customer card portfolio
              </p>

            </div>

            <span className="section-count">
              {cards.length}{' '}
              {cards.length === 1
                ? 'Card'
                : 'Cards'}
            </span>

          </div>

          {cards.length > 0 ? (

            <div className="customer-360-list">

              {cards.map((card) => {

                const limit =
                  Number(
                    card.credit_limit || 0
                  )

                const available =
                  Number(
                    card.available_limit || 0
                  )

                const used =
                  Math.max(
                    0,
                    limit - available
                  )

                const utilization =
                  limit > 0
                    ? (used / limit) * 100
                    : 0

                return (
                  <div
                    className="customer-360-list-row"
                    key={card.id}
                  >

                    <div className="customer-360-row-icon">
                      💳
                    </div>

                    <div className="customer-360-row-main">

                      <strong>
                        {card.card_variant ||
                          card.card_type}
                      </strong>

                      <span>
                        {maskCardNumber(
                          card.card_number
                        )}
                      </span>

                      <span>
                        Expires:{' '}
                        {formatDate(
                          card.expiry_date
                        )}
                      </span>

                    </div>

                    <div>

                      <span>
                        Available
                      </span>

                      <strong>
                        {formatCurrency(
                          available
                        )}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Utilization
                      </span>

                      <strong>
                        {utilization.toFixed(1)}%
                      </strong>

                    </div>

                    <span className="customer-360-active">
                      ● {card.status}
                    </span>

                  </div>
                )
              })}

            </div>

          ) : (

            <div className="customer-no-results">

              <strong>
                No cards found
              </strong>

              <span>
                No card records are available.
              </span>

            </div>

          )}

        </section>

        {/* LOANS */}

        <section className="panel customer-360-panel">

          <div className="panel-header">

            <div>

              <h2>
                Loans
              </h2>

              <p>
                Customer loan portfolio
              </p>

            </div>

            <span className="section-count">
              {loans.length}{' '}
              {loans.length === 1
                ? 'Loan'
                : 'Loans'}
            </span>

          </div>

          {loans.length > 0 ? (

            <div className="customer-360-loan-grid">

              {loans.map((loan) => (

                <div
                  className="customer-360-loan"
                  key={loan.id}
                >

                  <div className="customer-360-loan-top">

                    <div>

                      <strong>
                        {loan.loan_type}
                      </strong>

                      <span>
                        {loan.loan_number}
                      </span>

                    </div>

                    <span className="customer-360-active">
                      ● {loan.status}
                    </span>

                  </div>

                  <div className="customer-360-loan-info">

                    <div>

                      <span>
                        Outstanding
                      </span>

                      <strong>
                        {formatCurrency(
                          loan.outstanding_amount
                        )}
                      </strong>

                    </div>

                    <div>

                      <span>
                        EMI
                      </span>

                      <strong>
                        {formatCurrency(
                          loan.emi_amount
                        )}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Interest
                      </span>

                      <strong>
                        {Number(
                          loan.interest_rate
                        ).toFixed(2)}
                        %
                      </strong>

                    </div>

                    <div>

                      <span>
                        Next EMI
                      </span>

                      <strong>
                        {formatDate(
                          loan.next_emi_date
                        )}
                      </strong>

                    </div>

                  </div>

                </div>
              ))}

            </div>

          ) : (

            <div className="customer-no-results">

              <strong>
                No loans found
              </strong>

              <span>
                No loan records are available.
              </span>

            </div>

          )}

        </section>

        {/* TRANSACTIONS */}

        <section className="panel customer-360-panel">

          <div className="panel-header">

            <div>

              <h2>
                Recent Transactions
              </h2>

              <p>
                Latest customer transactions
              </p>

            </div>

            <span className="section-count">
              {transactions.length}{' '}
              {transactions.length === 1
                ? 'Transaction'
                : 'Transactions'}
            </span>

          </div>

          {transactions.length > 0 ? (

            <div className="customer-360-list">

              {transactions
                .slice(0, 10)
                .map(
                  (transaction) => (

                    <div
                      className="customer-360-list-row"
                      key={transaction.id}
                    >

                      <div className="customer-360-row-icon">
                        {transaction.transaction_type
                          ?.toUpperCase() ===
                        'CREDIT'
                          ? '+'
                          : '-'}
                      </div>

                      <div className="customer-360-row-main">

                        <strong>
                          {transaction.description ||
                            transaction.category}
                        </strong>

                        <span>
                          {transaction.transaction_reference}
                        </span>

                        <span>
                          {transaction.account_number
                            ? maskAccountNumber(
                                transaction.account_number
                              )
                            : 'Account unavailable'}
                        </span>

                      </div>

                      <div>

                        <span>
                          Date
                        </span>

                        <strong>
                          {formatDate(
                            transaction.transaction_date
                          )}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Amount
                        </span>

                        <strong>
                          {formatCurrency(
                            transaction.amount
                          )}
                        </strong>

                      </div>

                      <span className="customer-360-active">
                        ● {transaction.status}
                      </span>

                    </div>
                  )
                )}

            </div>

          ) : (

            <div className="customer-no-results">

              <strong>
                No transactions found
              </strong>

              <span>
                No transaction records are available.
              </span>

            </div>

          )}

        </section>

        {/* SERVICE REQUESTS */}

        <section className="panel customer-360-panel">

          <div className="panel-header">

            <div>

              <h2>
                Service Requests
              </h2>

              <p>
                Customer support activity
              </p>

            </div>

            <span className="section-count">
              {openRequests} Open
            </span>

          </div>

          {serviceRequests.length > 0 ? (

            <div className="customer-360-list">

              {serviceRequests.map(
                (request) => (

                  <div
                    className="customer-360-list-row"
                    key={request.id}
                  >

                    <div className="customer-360-row-icon">
                      📋
                    </div>

                    <div className="customer-360-row-main">

                      <strong>
                        {request.subject}
                      </strong>

                      <span>
                        {request.request_number}
                      </span>

                      <span>
                        {request.request_type}
                      </span>

                    </div>

                    <div>

                      <span>
                        Priority
                      </span>

                      <strong>
                        {request.priority}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Created
                      </span>

                      <strong>
                        {formatDate(
                          request.created_at
                        )}
                      </strong>

                    </div>

                    <span className="customer-360-active">
                      ● {request.status}
                    </span>

                  </div>
                )
              )}

            </div>

          ) : (

            <div className="customer-no-results">

              <strong>
                No service requests
              </strong>

              <span>
                No service requests are available.
              </span>

            </div>

          )}

        </section>

        {/* AI PREVIEW */}

        <section className="panel customer-360-ai">

          <div className="customer-360-ai-icon">
            AI
          </div>

          <div>

            <span className="customer-360-ai-label">
              AI CUSTOMER INSIGHT
            </span>

            <h3>
              Customer portfolio overview
            </h3>

            <p>
              {customer.full_name} has{' '}
              {formatCurrency(totalBalance)}
              {' '}total balance across{' '}
              {accounts.length}{' '}
              {accounts.length === 1
                ? 'account'
                : 'accounts'} and{' '}
              {formatCurrency(
                loanOutstanding
              )}
              {' '}in loan outstanding.
              The customer is currently
              classified as a{' '}
              {isPremium
                ? 'Premium'
                : 'Regular'} customer.
              {cards.length > 0 &&
                ` Current credit utilization is ${creditUtilization.toFixed(
                  1
                )}%.`}
              {openRequests > 0 &&
                ` There ${
                  openRequests === 1
                    ? 'is'
                    : 'are'
                } ${openRequests} open service request${
                  openRequests === 1
                    ? ''
                    : 's'
                }.`}
            </p>

          </div>

          <button
            onClick={() =>
              alert(
                'AI Assistant will be connected in the next phase.'
              )
            }
          >
            Ask AI →
          </button>

        </section>

        {/* CONNECTION NOTICE */}

        <section className="panel customer-demo-notice">

          <div className="customer-demo-icon">
            ✓
          </div>

          <div>

            <h3>
              Customer 360 Connected
            </h3>

            <p>
              Customer profile, accounts, cards,
              loans, transactions and service
              requests are loaded through the
              authenticated RM API from PostgreSQL.
            </p>

          </div>

        </section>

      </main>

    </div>
  )
}

export default Customer360
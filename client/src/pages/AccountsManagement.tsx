import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RMSidebar from '../components/RMSidebar'

type AccountType = 'Savings' | 'Salary' | 'Current'
type AccountStatus = 'Active' | 'Inactive'

type ApiAccount = {
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
  created_at: string
  customer_code: string
  full_name: string
  customer_type: string
}

type Account = {
  id: string
  customerId: number
  customerCode: string
  customerName: string
  type: AccountType
  number: string
  balance: number
  openedOn: string
  status: AccountStatus
}

function AccountsManagement() {
  const navigate = useNavigate()

  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [accountType, setAccountType] =
    useState<'All' | AccountType>('All')

  const [status, setStatus] =
    useState<'All' | AccountStatus>('All')

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          'http://localhost:5000/api/accounts'
        )

        if (!response.ok) {
          throw new Error('Failed to fetch accounts')
        }

        const data = await response.json()

        const mappedAccounts: Account[] = data.accounts.map(
          (account: ApiAccount) => ({
            id: account.account_number,
            customerId: account.customer_id,
            customerCode: account.customer_code,
            customerName: account.full_name,
            type: normalizeAccountType(account.account_type),
            number: maskAccountNumber(account.account_number),
            balance: Number(account.balance),
            openedOn: formatDate(account.opened_at),
            status: normalizeAccountStatus(account.status),
          })
        )

        setAccounts(mappedAccounts)
      } catch (err) {
        console.error('Accounts fetch error:', err)

        setError(
          'Unable to load account data. Please make sure the backend server is running.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  const filteredAccounts = useMemo(() => {
    const query = search.toLowerCase().trim()

    return accounts.filter((account) => {
      const matchesSearch =
        account.customerName
          .toLowerCase()
          .includes(query) ||
        account.customerCode
          .toLowerCase()
          .includes(query) ||
        account.number
          .toLowerCase()
          .includes(query) ||
        account.type
          .toLowerCase()
          .includes(query)

      const matchesType =
        accountType === 'All' ||
        account.type === accountType

      const matchesStatus =
        status === 'All' ||
        account.status === status

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      )
    })
  }, [accounts, search, accountType, status])

  const totalBalance = accounts.reduce(
    (total, account) => total + account.balance,
    0
  )

  const activeAccounts = accounts.filter(
    (account) => account.status === 'Active'
  ).length

  const savingsAccounts = accounts.filter(
    (account) => account.type === 'Savings'
  ).length

  const currentAccounts = accounts.filter(
    (account) => account.type === 'Current'
  ).length

  const salaryAccounts = accounts.filter(
    (account) => account.type === 'Salary'
  ).length

  const formatCurrency = (value: number) => {
    return `₹ ${value.toLocaleString('en-IN')}`
  }

  const openCustomer360 = (customerId: number) => {
    navigate(`/customer-360/${customerId}`)
  }

  const clearFilters = () => {
    setSearch('')
    setAccountType('All')
    setStatus('All')
  }

  return (
    <div className="finbank-app">

      <RMSidebar />

      <main className="main-content">

        {/* TOPBAR */}

        <header className="topbar">

          <div>

            <p className="welcome-text">
              Relationship Manager
            </p>

            <h1>
              Accounts Management
            </h1>

          </div>

          <div className="topbar-right">

            <button
              className="notification-btn"
              onClick={() =>
                alert('No new notifications.')
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
                  Rahul Sharma
                </strong>

                <small>
                  Senior RM
                </small>

              </div>

            </div>

          </div>

        </header>


        {/* PAGE INTRO */}

        <section className="rm-accounts-intro">

          <div>

            <p className="rm-accounts-eyebrow">
              ACCOUNT PORTFOLIO
            </p>

            <h2>
              Manage customer accounts
            </h2>

            <p>
              Monitor account balances, account types and
              customer account status from one place.
            </p>

          </div>

          <div className="rm-accounts-summary-badge">

            <span>
              Total Accounts
            </span>

            <strong>
              {accounts.length}
            </strong>

          </div>

        </section>


        {/* ACCOUNT STATS */}

        <section className="rm-account-stats">

          <div className="rm-account-stat-card">

            <div className="rm-account-stat-icon">
              ◉
            </div>

            <div>

              <span>
                Total Accounts
              </span>

              <strong>
                {accounts.length}
              </strong>

              <small>
                Across your portfolio
              </small>

            </div>

          </div>


          <div className="rm-account-stat-card">

            <div className="rm-account-stat-icon">
              ✓
            </div>

            <div>

              <span>
                Active Accounts
              </span>

              <strong>
                {activeAccounts}
              </strong>

              <small>
                Currently operational
              </small>

            </div>

          </div>


          <div className="rm-account-stat-card">

            <div className="rm-account-stat-icon">
              ₹
            </div>

            <div>

              <span>
                Total Balance
              </span>

              <strong>
                {formatCurrency(totalBalance)}
              </strong>

              <small>
                Combined account balance
              </small>

            </div>

          </div>


          <div className="rm-account-stat-card">

            <div className="rm-account-stat-icon">
              ▣
            </div>

            <div>

              <span>
                Savings Accounts
              </span>

              <strong>
                {savingsAccounts}
              </strong>

              <small>
                Primary deposit accounts
              </small>

            </div>

          </div>

        </section>


        {/* FILTER PANEL */}

        <section className="panel rm-account-filter-panel">

          <div className="rm-account-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search customer name, customer ID, account number or type..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          <div className="rm-account-filters">

            <div className="rm-account-filter-group">

              <label>
                Account Type
              </label>

              <select
                value={accountType}
                onChange={(e) =>
                  setAccountType(
                    e.target.value as
                      | 'All'
                      | AccountType
                  )
                }
              >

                <option value="All">
                  All Types
                </option>

                <option value="Savings">
                  Savings
                </option>

                <option value="Salary">
                  Salary
                </option>

                <option value="Current">
                  Current
                </option>

              </select>

            </div>


            <div className="rm-account-filter-group">

              <label>
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as
                      | 'All'
                      | AccountStatus
                  )
                }
              >

                <option value="All">
                  All Status
                </option>

                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>

              </select>

            </div>


            <button
              className="rm-account-clear-btn"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>


          <div className="rm-account-filter-result">

            Showing{' '}
            <strong>
              {filteredAccounts.length}
            </strong>{' '}
            of{' '}
            <strong>
              {accounts.length}
            </strong>{' '}
            accounts

          </div>

        </section>


        {/* ACCOUNT TABLE */}

        <section className="panel rm-account-table-panel">

          <div className="panel-header">

            <div>

              <h2>
                Customer Accounts
              </h2>

              <p>
                Accounts assigned to Rahul Sharma
              </p>

            </div>

            <span className="rm-account-portfolio-status">
              ● Portfolio Active
            </span>

          </div>


          <div className="rm-account-table">

            {/* TABLE HEADER */}

            <div className="rm-account-table-header">

              <span>
                Customer
              </span>

              <span>
                Account
              </span>

              <span>
                Type
              </span>

              <span>
                Balance
              </span>

              <span>
                Opened On
              </span>

              <span>
                Status
              </span>

              <span>
                Action
              </span>

            </div>


            {/* LOADING */}

            {loading && (

              <div className="rm-account-no-results">

                <div>
                  ⟳
                </div>

                <strong>
                  Loading accounts...
                </strong>

                <span>
                  Fetching account data from PostgreSQL.
                </span>

              </div>

            )}


            {/* ERROR */}

            {!loading && error && (

              <div className="rm-account-no-results">

                <div>
                  !
                </div>

                <strong>
                  Unable to load accounts
                </strong>

                <span>
                  {error}
                </span>

                <button
                  onClick={() =>
                    window.location.reload()
                  }
                >
                  Retry
                </button>

              </div>

            )}


            {/* TABLE ROWS */}

            {!loading &&
              !error &&
              filteredAccounts.length > 0 && (

                filteredAccounts.map((account) => (

                  <div
                    className="rm-account-table-row"
                    key={account.id}
                  >

                    {/* CUSTOMER */}

                    <div className="rm-account-customer">

                      <div className="rm-account-avatar">
                        {account.customerName.charAt(0)}
                      </div>

                      <div>

                        <strong>
                          {account.customerName}
                        </strong>

                        <span>
                          {account.customerCode}
                        </span>

                      </div>

                    </div>


                    {/* ACCOUNT NUMBER */}

                    <div className="rm-account-number">

                      <strong>
                        {account.number}
                      </strong>

                      <span>
                        {account.id}
                      </span>

                    </div>


                    {/* TYPE */}

                    <div>

                      <span
                        className={`rm-account-type ${account.type.toLowerCase()}`}
                      >
                        {account.type}
                      </span>

                    </div>


                    {/* BALANCE */}

                    <div className="rm-account-balance">

                      <strong>
                        {formatCurrency(account.balance)}
                      </strong>

                    </div>


                    {/* OPENED */}

                    <div className="rm-account-opened">

                      <span>
                        {account.openedOn}
                      </span>

                    </div>


                    {/* STATUS */}

                    <div>

                      <span
                        className={
                          account.status === 'Active'
                            ? 'rm-account-status active'
                            : 'rm-account-status inactive'
                        }
                      >
                        ● {account.status}
                      </span>

                    </div>


                    {/* ACTION */}

                    <div>

                      <button
                        className="rm-account-view-btn"
                        onClick={() =>
                          openCustomer360(
                            account.customerId
                          )
                        }
                      >
                        Customer 360° →
                      </button>

                    </div>

                  </div>

                ))

              )}


            {/* NO RESULTS */}

            {!loading &&
              !error &&
              filteredAccounts.length === 0 && (

                <div className="rm-account-no-results">

                  <div>
                    ⌕
                  </div>

                  <strong>
                    No accounts found
                  </strong>

                  <span>
                    Try changing your search or filters.
                  </span>

                  <button
                    onClick={clearFilters}
                  >
                    Reset Filters
                  </button>

                </div>

              )}

          </div>

        </section>


        {/* ACCOUNT INFORMATION NOTICE */}

        <section className="panel rm-account-notice">

          <div className="rm-account-notice-icon">
            ✓
          </div>

          <div>

            <h3>
              RM Account Access
            </h3>

            <p>
              Account information shown here is fictional
              demo data. In the production system, sensitive
              account information would be protected using
              role-based authorization, masking and audit logs.
            </p>

          </div>

        </section>


        {/* ACCOUNT SUMMARY */}

        <section className="rm-account-bottom-grid">

          {/* DISTRIBUTION */}

          <div className="panel rm-account-type-panel">

            <div className="panel-header">

              <div>

                <h2>
                  Account Distribution
                </h2>

                <p>
                  Portfolio by account type
                </p>

              </div>

            </div>


            <div className="rm-account-distribution">

              <div className="rm-account-distribution-row">

                <div className="rm-account-distribution-label">

                  <span className="distribution-dot savings">
                  </span>

                  <strong>
                    Savings
                  </strong>

                </div>

                <div className="rm-account-distribution-value">

                  <strong>
                    {savingsAccounts}
                  </strong>

                  <span>
                    accounts
                  </span>

                </div>

              </div>


              <div className="rm-account-distribution-row">

                <div className="rm-account-distribution-label">

                  <span className="distribution-dot salary">
                  </span>

                  <strong>
                    Salary
                  </strong>

                </div>

                <div className="rm-account-distribution-value">

                  <strong>
                    {salaryAccounts}
                  </strong>

                  <span>
                    accounts
                  </span>

                </div>

              </div>


              <div className="rm-account-distribution-row">

                <div className="rm-account-distribution-label">

                  <span className="distribution-dot current">
                  </span>

                  <strong>
                    Current
                  </strong>

                </div>

                <div className="rm-account-distribution-value">

                  <strong>
                    {currentAccounts}
                  </strong>

                  <span>
                    accounts
                  </span>

                </div>

              </div>

            </div>

          </div>


          {/* AI INSIGHT */}

          <div className="panel rm-account-insight-panel">

            <div className="rm-account-insight-icon">
              AI
            </div>

            <span className="rm-account-insight-label">
              ACCOUNT INSIGHT
            </span>

            <h3>
              Portfolio account overview
            </h3>

            <p>
              Your portfolio currently contains{' '}
              {accounts.length} accounts with a combined
              balance of {formatCurrency(totalBalance)}.
              {' '}
              {activeAccounts} accounts are currently active.
            </p>

            <button
              onClick={() =>
                alert(
                  'AI account insights will be connected with the LLM service later.'
                )
              }
            >
              Ask AI →
            </button>

          </div>

        </section>

      </main>

    </div>
  )
}


/* ---------------- HELPER FUNCTIONS ---------------- */

function normalizeAccountType(
  value: string
): AccountType {
  const type = value.toLowerCase()

  if (type.includes('salary')) {
    return 'Salary'
  }

  if (type.includes('current')) {
    return 'Current'
  }

  return 'Savings'
}


function normalizeAccountStatus(
  value: string
): AccountStatus {
  return value.toLowerCase() === 'active'
    ? 'Active'
    : 'Inactive'
}


function maskAccountNumber(
  accountNumber: string
): string {
  if (!accountNumber) {
    return '••••'
  }

  const lastFour = accountNumber.slice(-4)

  return `•••• ${lastFour}`
}


function formatDate(
  value: string
): string {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}


export default AccountsManagement
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RMSidebar from '../components/RMSidebar'
import { apiFetch } from '../api'

type LoanType =
  | 'Home Loan'
  | 'Personal Loan'
  | 'Car Loan'
  | 'Education Loan'

type LoanStatus =
  | 'Active'
  | 'Closed'
  | 'Overdue'

type ApiLoan = {
  id: number
  customer_id: number
  loan_number: string
  loan_type: string
  principal_amount: number | string
  outstanding_amount: number | string
  interest_rate: number | string
  emi_amount: number | string
  next_emi_date: string | null
  tenure_months: number
  status: string
  start_date: string | null
  created_at: string
  customer_code: string
  customer_name: string
  customer_email?: string
  customer_phone?: string
}

type Loan = {
  id: number
  customerId: number
  customerCode: string
  customerName: string
  type: LoanType
  loanAccount: string
  principal: number
  outstanding: number
  interestRate: number
  emi: number
  nextEmi: string
  tenure: string
  status: LoanStatus
}

function LoansManagement() {
  const navigate = useNavigate()

  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await apiFetch('/rm/loans')

        if (!response.ok) {
          throw new Error('Failed to fetch loans')
        }

        const data = await response.json()

        if (
          !data.success ||
          !Array.isArray(data.loans)
        ) {
          throw new Error(
            data.message ||
              'Invalid loan data received from server'
          )
        }

        const mappedLoans: Loan[] =
          data.loans.map(
            (loan: ApiLoan) => ({
              id: loan.id,
              customerId: loan.customer_id,
              customerCode: loan.customer_code,
              customerName: loan.customer_name,
              type: normalizeLoanType(
                loan.loan_type
              ),
              loanAccount:
                maskLoanNumber(
                  loan.loan_number
                ),
              principal:
                Number(
                  loan.principal_amount || 0
                ),
              outstanding:
                Number(
                  loan.outstanding_amount || 0
                ),
              interestRate:
                Number(
                  loan.interest_rate || 0
                ),
              emi:
                Number(
                  loan.emi_amount || 0
                ),
              nextEmi:
                formatDate(
                  loan.next_emi_date
                ),
              tenure:
                formatTenure(
                  loan.tenure_months
                ),
              status:
                normalizeLoanStatus(
                  loan.status
                ),
            })
          )

        setLoans(mappedLoans)
      } catch (err) {
        console.error(
          'Loans fetch error:',
          err
        )

        setError(
          'Unable to load loan data. Please make sure the backend server is running.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchLoans()
  }, [])

  const filteredLoans = useMemo(() => {
    const query =
      search.toLowerCase().trim()

    return loans.filter((loan) => {
      const matchesSearch =
        loan.customerName
          .toLowerCase()
          .includes(query) ||
        loan.customerCode
          .toLowerCase()
          .includes(query) ||
        loan.loanAccount
          .toLowerCase()
          .includes(query) ||
        loan.type
          .toLowerCase()
          .includes(query)

      const matchesType =
        typeFilter === 'All' ||
        loan.type === typeFilter

      const matchesStatus =
        statusFilter === 'All' ||
        loan.status === statusFilter

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      )
    })
  }, [
    loans,
    search,
    typeFilter,
    statusFilter,
  ])

  const activeLoans =
    loans.filter(
      (loan) =>
        loan.status === 'Active'
    ).length

  const overdueLoans =
    loans.filter(
      (loan) =>
        loan.status === 'Overdue'
    ).length

  const closedLoans =
    loans.filter(
      (loan) =>
        loan.status === 'Closed'
    ).length

  const totalOutstanding =
    loans.reduce(
      (total, loan) =>
        total + loan.outstanding,
      0
    )

  const emiDueSoon =
    loans.filter(
      (loan) =>
        loan.status === 'Active' ||
        loan.status === 'Overdue'
    ).length

  const formatCurrency = (
    value: number
  ) => {
    return `₹ ${value.toLocaleString(
      'en-IN'
    )}`
  }

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('All')
    setStatusFilter('All')
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
              Loans Management
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


        {/* PAGE INTRO */}

        <section className="rm-loans-intro">

          <div>

            <p className="rm-loans-eyebrow">
              LOAN PORTFOLIO
            </p>

            <h2>
              Manage customer loans
            </h2>

            <p>
              Monitor loan accounts,
              outstanding balances,
              EMI schedules and
              repayment status.
            </p>

          </div>

          <div className="rm-loans-summary">

            <span>
              Total Loans
            </span>

            <strong>
              {loading
                ? '...'
                : loans.length}
            </strong>

          </div>

        </section>


        {/* LOAN STATS */}

        <section className="rm-loan-stats">

          <div className="rm-loan-stat-card">

            <div className="rm-loan-stat-icon">
              ₹
            </div>

            <div>

              <span>
                Total Loans
              </span>

              <strong>
                {loading
                  ? '...'
                  : loans.length}
              </strong>

              <small>
                Across portfolio
              </small>

            </div>

          </div>


          <div className="rm-loan-stat-card">

            <div className="rm-loan-stat-icon">
              ✓
            </div>

            <div>

              <span>
                Active Loans
              </span>

              <strong>
                {loading
                  ? '...'
                  : activeLoans}
              </strong>

              <small>
                Currently running
              </small>

            </div>

          </div>


          <div className="rm-loan-stat-card">

            <div className="rm-loan-stat-icon">
              ◉
            </div>

            <div>

              <span>
                Total Outstanding
              </span>

              <strong>
                {loading
                  ? '...'
                  : formatCurrency(
                      totalOutstanding
                    )}
              </strong>

              <small>
                Remaining loan amount
              </small>

            </div>

          </div>


          <div className="rm-loan-stat-card">

            <div className="rm-loan-stat-icon">
              ⚠
            </div>

            <div>

              <span>
                EMI Attention
              </span>

              <strong>
                {loading
                  ? '...'
                  : emiDueSoon}
              </strong>

              <small>
                Active / overdue loans
              </small>

            </div>

          </div>

        </section>


        {/* FILTER PANEL */}

        <section className="panel rm-loan-filter-panel">

          <div className="rm-loan-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search customer, customer ID, loan account or loan type..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              disabled={loading}
            />

          </div>


          <div className="rm-loan-filters">

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All Loan Types
              </option>

              <option value="Home Loan">
                Home Loan
              </option>

              <option value="Personal Loan">
                Personal Loan
              </option>

              <option value="Car Loan">
                Car Loan
              </option>

              <option value="Education Loan">
                Education Loan
              </option>

            </select>


            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All Status
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Overdue">
                Overdue
              </option>

              <option value="Closed">
                Closed
              </option>

            </select>


            <button
              className="rm-loan-clear-btn"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>


          <div className="rm-loan-filter-result">

            Showing{' '}

            <strong>
              {filteredLoans.length}
            </strong>{' '}

            of{' '}

            <strong>
              {loans.length}
            </strong>{' '}

            loans

          </div>

        </section>


        {/* LOAN TABLE */}

        <section className="panel rm-loan-table-panel">

          <div className="panel-header">

            <div>

              <h2>
                Customer Loan Portfolio
              </h2>

              <p>
                Loans assigned to your
                customer portfolio
              </p>

            </div>

            <span className="rm-loan-portfolio-status">
              ● Portfolio Active
            </span>

          </div>


          <div className="rm-loan-table">

            {/* TABLE HEADER */}

            <div className="rm-loan-table-header">

              <span>
                Customer
              </span>

              <span>
                Loan
              </span>

              <span>
                Principal
              </span>

              <span>
                Outstanding
              </span>

              <span>
                EMI
              </span>

              <span>
                Next EMI
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

              <div className="rm-loan-no-results">

                <strong>
                  Loading loans...
                </strong>

                <span>
                  Fetching loan data
                  from PostgreSQL.
                </span>

              </div>

            )}


            {/* ERROR */}

            {!loading &&
              error && (

                <div className="rm-loan-no-results">

                  <strong>
                    Unable to load loans
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
              filteredLoans.length >
                0 && (

                filteredLoans.map(
                  (loan) => (

                    <div
                      className="rm-loan-table-row"
                      key={loan.id}
                    >

                      {/* CUSTOMER */}

                      <div className="rm-loan-customer">

                        <div className="rm-loan-avatar">
                          {loan.customerName
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <strong>
                            {loan.customerName}
                          </strong>

                          <span>
                            {loan.customerCode}
                          </span>

                        </div>

                      </div>


                      {/* LOAN */}

                      <div className="rm-loan-info">

                        <strong>
                          {loan.type}
                        </strong>

                        <span>
                          {loan.loanAccount}
                        </span>

                        <small>
                          {loan.tenure}
                        </small>

                      </div>


                      {/* PRINCIPAL */}

                      <div className="rm-loan-money">

                        <strong>
                          {formatCurrency(
                            loan.principal
                          )}
                        </strong>

                      </div>


                      {/* OUTSTANDING */}

                      <div className="rm-loan-money">

                        <strong>
                          {formatCurrency(
                            loan.outstanding
                          )}
                        </strong>

                      </div>


                      {/* EMI */}

                      <div className="rm-loan-emi">

                        <strong>
                          {formatCurrency(
                            loan.emi
                          )}
                        </strong>

                        <span>
                          {loan.interestRate >
                          0
                            ? `${loan.interestRate}% interest`
                            : 'Monthly'}
                        </span>

                      </div>


                      {/* NEXT EMI */}

                      <div className="rm-loan-next-emi">

                        <strong>
                          {loan.nextEmi}
                        </strong>

                      </div>


                      {/* STATUS */}

                      <div>

                        <span
                          className={
                            loan.status ===
                            'Active'
                              ? 'rm-loan-status active'
                              : loan.status ===
                                  'Overdue'
                                ? 'rm-loan-status overdue'
                                : 'rm-loan-status closed'
                          }
                        >
                          ● {loan.status}
                        </span>

                      </div>


                      {/* ACTION */}

                      <div>

                        <button
                          className="rm-loan-view-btn"
                          onClick={() =>
                            navigate(
                              `/customer-360/${loan.customerId}`
                            )
                          }
                        >
                          Customer 360° →
                        </button>

                      </div>

                    </div>

                  )
                )

              )}


            {/* NO RESULTS */}

            {!loading &&
              !error &&
              filteredLoans.length ===
                0 && (

                <div className="rm-loan-no-results">

                  <strong>
                    No loans found
                  </strong>

                  <span>
                    Try changing your
                    search or filters.
                  </span>

                  <button
                    onClick={
                      clearFilters
                    }
                  >
                    Reset Filters
                  </button>

                </div>

              )}

          </div>

        </section>


        {/* LOAN NOTICE */}

        <section className="panel rm-loan-notice">

          <div className="rm-loan-notice-icon">
            ✓
          </div>

          <div>

            <h3>
              RM Loan Access
            </h3>

            <p>
              Loan information shown here
              is fictional demo data. In the
              production system, sensitive
              financial information would be
              protected through role-based
              authorization, masking and
              audit logs.
            </p>

          </div>

        </section>


        {/* BOTTOM GRID */}

        <section className="rm-loan-bottom-grid">

          {/* PORTFOLIO SUMMARY */}

          <div className="panel rm-loan-summary-panel">

            <div className="panel-header">

              <div>

                <h2>
                  Loan Portfolio Summary
                </h2>

                <p>
                  Current loan status
                  overview
                </p>

              </div>

            </div>


            <div className="rm-loan-summary-list">

              <div>

                <span>
                  Active Loans
                </span>

                <strong className="green-value">
                  {activeLoans}
                </strong>

              </div>


              <div>

                <span>
                  Overdue Loans
                </span>

                <strong className="red-value">
                  {overdueLoans}
                </strong>

              </div>


              <div>

                <span>
                  Closed Loans
                </span>

                <strong>
                  {closedLoans}
                </strong>

              </div>


              <div>

                <span>
                  Total Outstanding
                </span>

                <strong>
                  {formatCurrency(
                    totalOutstanding
                  )}
                </strong>

              </div>

            </div>

          </div>


          {/* AI INSIGHT */}

          <div className="panel rm-loan-ai-panel">

            <div className="rm-loan-ai-header">

              <div className="rm-loan-ai-icon">
                AI
              </div>

              <div>

                <h2>
                  Loan Smart Insight
                </h2>

                <span>
                  Portfolio monitoring
                </span>

              </div>

            </div>


            <div className="rm-loan-ai-insight">

              <span>
                💡
              </span>

              <div>

                <strong>
                  EMI Monitoring
                </strong>

                <p>
                  {overdueLoans >
                  0
                    ? `${overdueLoans} loan${overdueLoans > 1 ? 's' : ''} require immediate RM attention because of overdue status.`
                    : 'No overdue loans currently require immediate attention.'}
                </p>

              </div>

            </div>


            <button
              className="rm-loan-ai-btn"
              onClick={() =>
                alert(
                  'AI Loan Assistant will be connected after LLM integration.'
                )
              }
            >
              Open AI Assistant →
            </button>

          </div>

        </section>

      </main>

    </div>
  )
}


/* ---------------- HELPER FUNCTIONS ---------------- */

function normalizeLoanType(
  value: string
): LoanType {
  const type =
    value?.toLowerCase() || ''

  if (type.includes('home')) {
    return 'Home Loan'
  }

  if (
    type.includes('car') ||
    type.includes('auto')
  ) {
    return 'Car Loan'
  }

  if (
    type.includes('education') ||
    type.includes('student')
  ) {
    return 'Education Loan'
  }

  return 'Personal Loan'
}


function normalizeLoanStatus(
  value: string
): LoanStatus {
  const status =
    value?.toLowerCase() || ''

  if (status === 'closed') {
    return 'Closed'
  }

  if (
    status === 'overdue' ||
    status === 'defaulted'
  ) {
    return 'Overdue'
  }

  return 'Active'
}


function maskLoanNumber(
  loanNumber: string
): string {
  if (!loanNumber) {
    return 'LN••••'
  }

  const lastFour =
    loanNumber.slice(-4)

  return `LN••••${lastFour}`
}


function formatDate(
  value: string | null
): string {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value
  }

  return date.toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  )
}


function formatTenure(
  months: number
): string {
  if (!months || months <= 0) {
    return '-'
  }

  if (months < 12) {
    return `${months} Months`
  }

  const years = Math.floor(
    months / 12
  )

  const remainingMonths =
    months % 12

  if (remainingMonths === 0) {
    return `${years} ${
      years === 1
        ? 'Year'
        : 'Years'
    }`
  }

  return `${years}Y ${remainingMonths}M`
}


export default LoansManagement
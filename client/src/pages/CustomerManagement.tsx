import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RMSidebar from '../components/RMSidebar'
import { apiFetch } from '../api'

type ApiCustomer = {
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

  account_count: string | number
  card_count: string | number
  loan_count: string | number
  request_count: string | number
}

type Customer = {
  id: number
  customerCode: string
  name: string
  email: string
  phone: string
  type: 'Premium' | 'Regular'
  accounts: number
  cards: number
  loans: number
  requests: number
  status: 'Active' | 'Inactive'
}

function CustomerManagement() {
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await apiFetch('/rm/customers')

        if (!response.ok) {
          throw new Error('Failed to fetch RM customers')
        }

        const data = await response.json()

        if (!data.success || !Array.isArray(data.customers)) {
          throw new Error(
            'Invalid customer data received from server'
          )
        }

        const mappedCustomers: Customer[] =
          data.customers.map(
            (customer: ApiCustomer) => ({
              id: customer.id,

              customerCode:
                customer.customer_code,

              name:
                customer.full_name,

              email:
                customer.email,

              phone:
                customer.phone || 'Not available',

              type:
                customer.customer_type?.toUpperCase() ===
                'PREMIUM'
                  ? 'Premium'
                  : 'Regular',

              accounts:
                Number(customer.account_count) || 0,

              cards:
                Number(customer.card_count) || 0,

              loans:
                Number(customer.loan_count) || 0,

              requests:
                Number(customer.request_count) || 0,

              status:
                customer.status?.toUpperCase() ===
                'ACTIVE'
                  ? 'Active'
                  : 'Inactive',
            })
          )

        setCustomers(mappedCustomers)
      } catch (err) {
        console.error(
          'RM Customer API error:',
          err
        )

        setError(
          'Unable to load customers. Please make sure the backend server is running.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  const filteredCustomers =
    customers.filter((customer) => {
      const query =
        search.toLowerCase().trim()

      if (!query) {
        return true
      }

      return (
        customer.name
          .toLowerCase()
          .includes(query) ||

        customer.customerCode
          .toLowerCase()
          .includes(query) ||

        customer.email
          .toLowerCase()
          .includes(query) ||

        customer.type
          .toLowerCase()
          .includes(query)
      )
    })

  const openCustomer360 = (
    customerId: number
  ) => {
    navigate(
      `/customer-360/${customerId}`
    )
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
              Customer Management
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

        {/* INTRO */}

        <section className="customer-page-intro">

          <div>

            <p className="customer-eyebrow">
              CUSTOMER PORTFOLIO
            </p>

            <h2>
              Manage your customers
            </h2>

            <p>
              Search, review and access complete
              customer relationship information.
            </p>

          </div>

          <div className="customer-count-box">

            <span>
              Assigned Customers
            </span>

            <strong>
              {loading
                ? '...'
                : customers.length}
            </strong>

          </div>

        </section>

        {/* SEARCH */}

        <section className="panel customer-search-panel">

          <div className="customer-search-wrapper">

            <span className="customer-search-icon">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search by customer name, ID, email or type..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              disabled={loading}
            />

          </div>

          <div className="customer-filter-info">

            <span>
              {loading
                ? 'Loading customers from PostgreSQL...'
                : `Showing ${filteredCustomers.length} of ${customers.length} assigned customers`}
            </span>

            {search && !loading && (
              <button
                onClick={() =>
                  setSearch('')
                }
              >
                Clear Search
              </button>
            )}

          </div>

        </section>

        {/* ERROR */}

        {error && (
          <section className="panel customer-demo-notice">

            <div className="customer-demo-icon">
              !
            </div>

            <div>

              <h3>
                Customer Data Error
              </h3>

              <p>
                {error}
              </p>

            </div>

          </section>
        )}

        {/* CUSTOMER LIST */}

        <section className="panel customer-list-panel">

          <div className="panel-header">

            <div>

              <h2>
                Customer Portfolio
              </h2>

              <p>
                Live customer data from FinBank
                PostgreSQL database
              </p>

            </div>

            <span className="portfolio-status">
              ● Portfolio Active
            </span>

          </div>

          <div className="customer-table">

            {/* HEADER */}

            <div className="customer-table-header">

              <span>
                Customer
              </span>

              <span>
                Type
              </span>

              <span>
                Accounts
              </span>

              <span>
                Cards
              </span>

              <span>
                Loans
              </span>

              <span>
                Status
              </span>

              <span>
                Action
              </span>

            </div>

            {/* LOADING */}

            {loading ? (

              <div className="customer-no-results">

                <strong>
                  Loading customers...
                </strong>

                <span>
                  Fetching assigned customers
                  from PostgreSQL.
                </span>

              </div>

            ) : filteredCustomers.length > 0 ? (

              filteredCustomers.map(
                (customer) => (

                  <div
                    className="customer-table-row"
                    key={customer.id}
                  >

                    {/* CUSTOMER */}

                    <div className="customer-table-profile">

                      <div className="customer-table-avatar">
                        {customer.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>

                        <strong>
                          {customer.name}
                        </strong>

                        <span>
                          {customer.customerCode}
                        </span>

                      </div>

                    </div>

                    {/* TYPE */}

                    <div>

                      <span
                        className={
                          customer.type ===
                          'Premium'
                            ? 'customer-type premium'
                            : 'customer-type regular'
                        }
                      >
                        {customer.type}
                      </span>

                    </div>

                    {/* ACCOUNTS */}

                    <div className="customer-table-value">

                      <strong>
                        {customer.accounts}
                      </strong>

                      <span>
                        {customer.accounts === 1
                          ? 'account'
                          : 'accounts'}
                      </span>

                    </div>

                    {/* CARDS */}

                    <div className="customer-table-value">

                      <strong>
                        {customer.cards}
                      </strong>

                      <span>
                        {customer.cards === 1
                          ? 'card'
                          : 'cards'}
                      </span>

                    </div>

                    {/* LOANS */}

                    <div className="customer-table-value">

                      <strong>
                        {customer.loans}
                      </strong>

                      <span>
                        {customer.loans === 1
                          ? 'loan'
                          : 'loans'}
                      </span>

                    </div>

                    {/* STATUS */}

                    <div>

                      <span
                        className={
                          customer.status ===
                          'Active'
                            ? 'customer-status active'
                            : 'customer-status inactive'
                        }
                      >
                        ● {customer.status}
                      </span>

                    </div>

                    {/* ACTION */}

                    <div>

                      <button
                        className="customer-view-btn"
                        onClick={() =>
                          openCustomer360(
                            customer.id
                          )
                        }
                      >
                        View 360° →
                      </button>

                    </div>

                  </div>
                )
              )

            ) : (

              <div className="customer-no-results">

                <strong>
                  No customers found
                </strong>

                <span>
                  Try searching with a
                  different name or customer ID.
                </span>

              </div>

            )}

          </div>

        </section>

        {/* PRIVACY */}

        <section className="panel customer-demo-notice">

          <div className="customer-demo-icon">
            ✓
          </div>

          <div>

            <h3>
              RM Access & Privacy
            </h3>

            <p>
              Customer information shown here
              is fictional demo data. Records are
              loaded from the FinBank PostgreSQL
              database and are restricted to the
              authenticated RM's assigned portfolio.
            </p>

          </div>

        </section>

      </main>

    </div>
  )
}

export default CustomerManagement
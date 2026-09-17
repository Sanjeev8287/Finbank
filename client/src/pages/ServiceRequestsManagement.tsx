import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RMSidebar from '../components/RMSidebar'
import { apiFetch } from '../api'

type RequestType =
  | 'Account'
  | 'Card'
  | 'Loan'
  | 'Transaction'
  | 'Profile'
  | 'Other'

type RequestStatus =
  | 'Open'
  | 'In Progress'
  | 'Resolved'
  | 'Escalated'

type Priority = 'High' | 'Medium' | 'Low'

type ApiServiceRequest = {
  id: number
  customer_id: number
  customer_code: string
  customer_name: string
  customer_email?: string
  customer_phone?: string
  request_number: string
  request_type: string
  subject: string
  description: string
  priority: string
  status: string
  created_at: string
  updated_at: string
}

type ServiceRequest = {
  id: number
  customerId: number
  customerCode: string
  requestNumber: string
  customerName: string
  type: RequestType
  subject: string
  description: string
  created: string
  priority: Priority
  status: RequestStatus
}

function ServiceRequestsManagement() {
  const navigate = useNavigate()

  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')

  useEffect(() => {
    const fetchServiceRequests = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await apiFetch(
          '/rm/service-requests'
        )

        if (!response.ok) {
          throw new Error(
            'Failed to fetch service requests'
          )
        }

        const data = await response.json()

        if (
          !data.success ||
          !Array.isArray(data.requests)
        ) {
          throw new Error(
            'Invalid service request data received'
          )
        }

        const mappedRequests: ServiceRequest[] =
          data.requests.map(
            (request: ApiServiceRequest) => ({
              id: request.id,

              customerId: request.customer_id,

              customerCode:
                request.customer_code || 'N/A',

              requestNumber:
                request.request_number || 'N/A',

              customerName:
                request.customer_name || 'Unknown Customer',

              type: normalizeRequestType(
                request.request_type
              ),

              subject:
                request.subject ||
                'Service Request',

              description:
                request.description ||
                'No description available.',

              created: formatDate(
                request.created_at
              ),

              priority: normalizePriority(
                request.priority
              ),

              status: normalizeRequestStatus(
                request.status
              ),
            })
          )

        setRequests(mappedRequests)
      } catch (err) {
        console.error(
          'Service requests fetch error:',
          err
        )

        setError(
          'Unable to load service requests. Please make sure the backend server is running.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchServiceRequests()
  }, [])

  const filteredRequests = useMemo(() => {
    const query = search.toLowerCase().trim()

    return requests.filter((request) => {
      const matchesSearch =
        request.requestNumber
          .toLowerCase()
          .includes(query) ||
        request.customerName
          .toLowerCase()
          .includes(query) ||
        request.customerCode
          .toLowerCase()
          .includes(query) ||
        request.subject
          .toLowerCase()
          .includes(query) ||
        request.type
          .toLowerCase()
          .includes(query)

      const matchesType =
        typeFilter === 'All' ||
        request.type === typeFilter

      const matchesStatus =
        statusFilter === 'All' ||
        request.status === statusFilter

      const matchesPriority =
        priorityFilter === 'All' ||
        request.priority === priorityFilter

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesPriority
      )
    })
  }, [
    requests,
    search,
    typeFilter,
    statusFilter,
    priorityFilter,
  ])

  const openRequests = requests.filter(
    (request) => request.status === 'Open'
  ).length

  const inProgressRequests = requests.filter(
    (request) => request.status === 'In Progress'
  ).length

  const escalatedRequests = requests.filter(
    (request) => request.status === 'Escalated'
  ).length

  const resolvedRequests = requests.filter(
    (request) => request.status === 'Resolved'
  ).length

  const highPriorityRequests = requests.filter(
    (request) => request.priority === 'High'
  ).length

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('All')
    setStatusFilter('All')
    setPriorityFilter('All')
  }

  return (
    <div className="finbank-app">

      <RMSidebar />

      <main className="main-content">

        <header className="topbar">

          <div>
            <p className="welcome-text">
              Relationship Manager
            </p>

            <h1>
              Service Requests
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
                  Relationship Manager
                </strong>

                <small>
                  RM Portal
                </small>
              </div>

            </div>

          </div>

        </header>


        <section className="rm-service-intro">

          <div>

            <p className="rm-service-eyebrow">
              SERVICE OPERATIONS
            </p>

            <h2>
              Customer service requests
            </h2>

            <p>
              Track, prioritize and manage customer service
              requests across your assigned portfolio.
            </p>

          </div>

          <div className="rm-service-summary">

            <span>
              Total Requests
            </span>

            <strong>
              {requests.length}
            </strong>

          </div>

        </section>


        <section className="rm-service-stats">

          <div className="rm-service-stat-card">

            <div className="rm-service-stat-icon">
              ◉
            </div>

            <div>

              <span>
                Open Requests
              </span>

              <strong>
                {openRequests}
              </strong>

              <small>
                Awaiting action
              </small>

            </div>

          </div>


          <div className="rm-service-stat-card">

            <div className="rm-service-stat-icon">
              ↻
            </div>

            <div>

              <span>
                In Progress
              </span>

              <strong>
                {inProgressRequests}
              </strong>

              <small>
                Currently being handled
              </small>

            </div>

          </div>


          <div className="rm-service-stat-card">

            <div className="rm-service-stat-icon">
              ⚠
            </div>

            <div>

              <span>
                Escalated
              </span>

              <strong>
                {escalatedRequests}
              </strong>

              <small>
                Requires attention
              </small>

            </div>

          </div>


          <div className="rm-service-stat-card">

            <div className="rm-service-stat-icon">
              ✓
            </div>

            <div>

              <span>
                Resolved
              </span>

              <strong>
                {resolvedRequests}
              </strong>

              <small>
                Successfully completed
              </small>

            </div>

          </div>

        </section>


        <section className="panel rm-service-filter-panel">

          <div className="rm-service-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search request, customer, customer ID or subject..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          <div className="rm-service-filters">

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value)
              }
            >
              <option value="All">
                All Request Types
              </option>

              <option value="Account">
                Account
              </option>

              <option value="Card">
                Card
              </option>

              <option value="Loan">
                Loan
              </option>

              <option value="Transaction">
                Transaction
              </option>

              <option value="Profile">
                Profile
              </option>

              <option value="Other">
                Other
              </option>
            </select>


            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="All">
                All Status
              </option>

              <option value="Open">
                Open
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Resolved">
                Resolved
              </option>

              <option value="Escalated">
                Escalated
              </option>
            </select>


            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value)
              }
            >
              <option value="All">
                All Priority
              </option>

              <option value="High">
                High
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Low">
                Low
              </option>
            </select>


            <button
              className="rm-service-clear-btn"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>


          <div className="rm-service-filter-result">

            Showing{' '}
            <strong>
              {filteredRequests.length}
            </strong>{' '}
            of{' '}
            <strong>
              {requests.length}
            </strong>{' '}
            requests

          </div>

        </section>


        <section className="panel rm-service-table-panel">

          <div className="panel-header">

            <div>

              <h2>
                Customer Service Requests
              </h2>

              <p>
                Requests from your assigned customer portfolio
              </p>

            </div>

            <span className="rm-service-portfolio-status">
              ● Operations Active
            </span>

          </div>


          <div className="rm-service-table">

            <div className="rm-service-table-header">

              <span>
                Request
              </span>

              <span>
                Customer
              </span>

              <span>
                Type
              </span>

              <span>
                Priority
              </span>

              <span>
                Created
              </span>

              <span>
                Status
              </span>

              <span>
                Action
              </span>

            </div>


            {loading && (

              <div className="rm-service-no-results">

                <strong>
                  Loading service requests...
                </strong>

                <span>
                  Fetching assigned requests from PostgreSQL.
                </span>

              </div>

            )}


            {!loading && error && (

              <div className="rm-service-no-results">

                <strong>
                  Unable to load service requests
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


            {!loading &&
              !error &&
              filteredRequests.length > 0 && (

                filteredRequests.map((request) => (

                  <div
                    className="rm-service-table-row"
                    key={request.id}
                  >

                    <div className="rm-service-request">

                      <strong>
                        {request.requestNumber}
                      </strong>

                      <span>
                        {request.subject}
                      </span>

                      <small>
                        {request.description}
                      </small>

                    </div>


                    <div className="rm-service-customer">

                      <div className="rm-service-avatar">
                        {request.customerName
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>

                        <strong>
                          {request.customerName}
                        </strong>

                        <span>
                          {request.customerCode}
                        </span>

                      </div>

                    </div>


                    <div className="rm-service-type">
                      {request.type}
                    </div>


                    <div>

                      <span
                        className={
                          request.priority === 'High'
                            ? 'rm-service-priority high'
                            : request.priority === 'Medium'
                              ? 'rm-service-priority medium'
                              : 'rm-service-priority low'
                        }
                      >
                        ● {request.priority}
                      </span>

                    </div>


                    <div className="rm-service-created">
                      {request.created}
                    </div>


                    <div>

                      <span
                        className={
                          request.status === 'Open'
                            ? 'rm-service-status open'
                            : request.status === 'In Progress'
                              ? 'rm-service-status progress'
                              : request.status === 'Escalated'
                                ? 'rm-service-status escalated'
                                : 'rm-service-status resolved'
                        }
                      >
                        ● {request.status}
                      </span>

                    </div>


                    <div>

                      <button
                        className="rm-service-view-btn"
                        onClick={() =>
                          navigate(
                            `/customer-360/${request.customerId}`
                          )
                        }
                      >
                        Customer 360° →
                      </button>

                    </div>

                  </div>

                ))

              )}


            {!loading &&
              !error &&
              filteredRequests.length === 0 && (

                <div className="rm-service-no-results">

                  <strong>
                    No service requests found
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


        <section className="rm-service-bottom-grid">

          <div className="panel rm-service-summary-panel">

            <div className="panel-header">

              <div>

                <h2>
                  Request Overview
                </h2>

                <p>
                  Current service workload
                </p>

              </div>

            </div>


            <div className="rm-service-summary-list">

              <div>

                <span>
                  Open Requests
                </span>

                <strong className="orange-value">
                  {openRequests}
                </strong>

              </div>


              <div>

                <span>
                  High Priority
                </span>

                <strong className="red-value">
                  {highPriorityRequests}
                </strong>

              </div>


              <div>

                <span>
                  Escalated
                </span>

                <strong className="red-value">
                  {escalatedRequests}
                </strong>

              </div>


              <div>

                <span>
                  Resolved
                </span>

                <strong className="green-value">
                  {resolvedRequests}
                </strong>

              </div>

            </div>

          </div>


          <div className="panel rm-service-ai-panel">

            <div className="rm-service-ai-header">

              <div className="rm-service-ai-icon">
                AI
              </div>

              <div>

                <h2>
                  Service Request Insight
                </h2>

                <span>
                  AI-powered operations
                </span>

              </div>

            </div>


            <div className="rm-service-ai-insight">

              <span>
                💡
              </span>

              <div>

                <strong>
                  Priority Monitoring
                </strong>

                <p>
                  {highPriorityRequests > 0
                    ? `${highPriorityRequests} high-priority request${highPriorityRequests > 1 ? 's' : ''} require RM attention.`
                    : 'No high-priority requests currently require attention.'}
                </p>

              </div>

            </div>


            <button
              className="rm-service-ai-btn"
              onClick={() =>
                alert(
                  'AI Service Request Assistant will be connected after LLM integration.'
                )
              }
            >
              Open AI Assistant →
            </button>

          </div>

        </section>


        <section className="panel rm-service-notice">

          <div className="rm-service-notice-icon">
            ✓
          </div>

          <div>

            <h3>
              RM Service Request Access
            </h3>

            <p>
              Service request information shown here is
              fictional demo data. Access is restricted to
              the authenticated RM's assigned customer
              portfolio.
            </p>

          </div>

        </section>

      </main>

    </div>
  )
}


/* ---------------- HELPER FUNCTIONS ---------------- */

function normalizeRequestType(
  value: string
): RequestType {
  const type = value.toLowerCase()

  if (type.includes('account')) {
    return 'Account'
  }

  if (type.includes('card')) {
    return 'Card'
  }

  if (type.includes('loan')) {
    return 'Loan'
  }

  if (
    type.includes('transaction') ||
    type.includes('txn')
  ) {
    return 'Transaction'
  }

  if (type.includes('profile')) {
    return 'Profile'
  }

  return 'Other'
}


function normalizeRequestStatus(
  value: string
): RequestStatus {
  const status = value.toLowerCase()

  if (status.includes('escalat')) {
    return 'Escalated'
  }

  if (
    status.includes('progress') ||
    status.includes('pending')
  ) {
    return 'In Progress'
  }

  if (
    status.includes('resolved') ||
    status.includes('closed') ||
    status.includes('completed')
  ) {
    return 'Resolved'
  }

  return 'Open'
}


function normalizePriority(
  value: string
): Priority {
  const priority = value.toLowerCase()

  if (priority.includes('high')) {
    return 'High'
  }

  if (priority.includes('low')) {
    return 'Low'
  }

  return 'Medium'
}


function formatDate(
  value: string | null
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


export default ServiceRequestsManagement
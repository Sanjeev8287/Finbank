import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RMSidebar from '../components/RMSidebar'
import { apiFetch } from '../api'

type ActivityType =
  | 'Transaction'
  | 'Service Request'

type ActivityStatus =
  | 'Success'
  | 'Pending'
  | 'Alert'

type ApiActivity = {
  activity_type: string
  id: number
  reference: string
  description: string
  amount: number | string | null
  activity_date: string
  status: string
  customer_code: string
  customer_name: string
}

type ActivityItem = {
  id: string
  type: ActivityType
  title: string
  description: string
  customerName: string
  customerId?: number
  customerCode: string
  amount?: number
  date: string
  time: string
  status: ActivityStatus
  reference: string
}

function Activity() {
  const navigate = useNavigate()

  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await apiFetch('/rm/activity')

        if (!response.ok) {
          throw new Error('Failed to fetch RM activity')
        }

        const data = await response.json()

        if (!data.success || !Array.isArray(data.activity)) {
          throw new Error('Invalid activity data received')
        }

        const mappedActivities: ActivityItem[] =
          data.activity.map(
            (activity: ApiActivity) => {
              const isTransaction =
                activity.activity_type ===
                'TRANSACTION'

              const normalizedStatus =
                normalizeActivityStatus(
                  activity.status
                )

              return {
                id: `${activity.activity_type}-${activity.id}`,
                type: isTransaction
                  ? 'Transaction'
                  : 'Service Request',

                title: isTransaction
                  ? 'Customer transaction recorded'
                  : 'Service request recorded',

                description:
                  activity.description ||
                  (
                    isTransaction
                      ? 'Transaction activity recorded in the customer account.'
                      : 'Customer service request activity recorded.'
                  ),

                customerName:
                  activity.customer_name,

                customerCode:
                  activity.customer_code,

                amount:
                  activity.amount !== null
                    ? Number(activity.amount)
                    : undefined,

                date: formatDate(
                  activity.activity_date
                ),

                time: formatTime(
                  activity.activity_date
                ),

                status:
                  normalizedStatus,

                reference:
                  activity.reference || '-',
              }
            }
          )

        setActivities(mappedActivities)
      } catch (err) {
        console.error(
          'RM Activity fetch error:',
          err
        )

        setError(
          'Unable to load activity data. Please make sure the backend server is running.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [])

  const filteredActivities = useMemo(() => {
    const query =
      search.toLowerCase().trim()

    return activities.filter(
      (activity) => {
        const matchesSearch =
          activity.id
            .toLowerCase()
            .includes(query) ||
          activity.title
            .toLowerCase()
            .includes(query) ||
          activity.description
            .toLowerCase()
            .includes(query) ||
          activity.type
            .toLowerCase()
            .includes(query) ||
          activity.customerName
            .toLowerCase()
            .includes(query) ||
          activity.customerCode
            .toLowerCase()
            .includes(query) ||
          activity.reference
            .toLowerCase()
            .includes(query)

        const matchesType =
          typeFilter === 'All' ||
          activity.type === typeFilter

        const matchesStatus =
          statusFilter === 'All' ||
          activity.status === statusFilter

        return (
          matchesSearch &&
          matchesType &&
          matchesStatus
        )
      }
    )
  }, [
    activities,
    search,
    typeFilter,
    statusFilter,
  ])

  const successfulActivities =
    activities.filter(
      (activity) =>
        activity.status === 'Success'
    ).length

  const pendingActivities =
    activities.filter(
      (activity) =>
        activity.status === 'Pending'
    ).length

  const alertActivities =
    activities.filter(
      (activity) =>
        activity.status === 'Alert'
    ).length

  const customerActivities =
    activities.filter(
      (activity) =>
        activity.customerId !== undefined
    ).length

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('All')
    setStatusFilter('All')
  }

  const formatCurrency = (
    value: number
  ) => {
    return `₹ ${value.toLocaleString('en-IN')}`
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
              Activity
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
                  Rahul Sharma
                </strong>

                <small>
                  Senior RM
                </small>

              </div>

            </div>

          </div>

        </header>


        {/* INTRO */}

        <section className="rm-activity-intro">

          <div>

            <p className="rm-activity-eyebrow">
              AUDIT & ACTIVITY
            </p>

            <h2>
              Recent RM activity
            </h2>

            <p>
              Review customer transactions and
              service-request activity across your
              assigned portfolio.
            </p>

          </div>

          <div className="rm-activity-summary">

            <span>
              Total Activities
            </span>

            <strong>
              {activities.length}
            </strong>

          </div>

        </section>


        {/* STATS */}

        <section className="rm-activity-stats">

          <div className="rm-activity-stat-card">

            <div className="rm-activity-stat-icon">
              ✓
            </div>

            <div>

              <span>
                Successful
              </span>

              <strong>
                {successfulActivities}
              </strong>

              <small>
                Completed activities
              </small>

            </div>

          </div>


          <div className="rm-activity-stat-card">

            <div className="rm-activity-stat-icon">
              ◷
            </div>

            <div>

              <span>
                Pending
              </span>

              <strong>
                {pendingActivities}
              </strong>

              <small>
                Awaiting action
              </small>

            </div>

          </div>


          <div className="rm-activity-stat-card">

            <div className="rm-activity-stat-icon">
              !
            </div>

            <div>

              <span>
                Alerts
              </span>

              <strong>
                {alertActivities}
              </strong>

              <small>
                Needs attention
              </small>

            </div>

          </div>


          <div className="rm-activity-stat-card">

            <div className="rm-activity-stat-icon">
              ◉
            </div>

            <div>

              <span>
                Customer Activities
              </span>

              <strong>
                {customerActivities}
              </strong>

              <small>
                Portfolio interactions
              </small>

            </div>

          </div>

        </section>


        {/* FILTERS */}

        <section className="panel rm-activity-filter-panel">

          <div className="rm-activity-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search activity, customer, ID or description..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>


          <div className="rm-activity-filters">

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All Activity Types
              </option>

              <option value="Transaction">
                Transaction
              </option>

              <option value="Service Request">
                Service Request
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

              <option value="Success">
                Success
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Alert">
                Alert
              </option>

            </select>


            <button
              className="rm-activity-clear-btn"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>


          <div className="rm-activity-filter-result">

            Showing{' '}

            <strong>
              {filteredActivities.length}
            </strong>{' '}

            of{' '}

            <strong>
              {activities.length}
            </strong>{' '}

            activities

          </div>

        </section>


        {/* ACTIVITY TIMELINE */}

        <section className="panel rm-activity-table-panel">

          <div className="panel-header">

            <div>

              <h2>
                Activity Timeline
              </h2>

              <p>
                Live activity data from the
                FinBank PostgreSQL database
              </p>

            </div>

            <span className="rm-activity-live-status">
              ● Activity Tracking Active
            </span>

          </div>


          <div className="rm-activity-table">

            {/* LOADING */}

            {loading && (

              <div className="rm-activity-no-results">

                <strong>
                  Loading activity...
                </strong>

                <span>
                  Fetching RM activity from PostgreSQL.
                </span>

              </div>

            )}


            {/* ERROR */}

            {!loading && error && (

              <div className="rm-activity-no-results">

                <strong>
                  Unable to load activity
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


            {/* ACTIVITIES */}

            {!loading &&
              !error &&
              filteredActivities.length > 0 && (

                filteredActivities.map(
                  (activity) => (

                    <div
                      className="rm-activity-row"
                      key={activity.id}
                    >

                      {/* ICON */}

                      <div className="rm-activity-icon">

                        {activity.type ===
                        'Transaction'
                          ? '₹'
                          : '!'}

                      </div>


                      {/* CONTENT */}

                      <div className="rm-activity-content">

                        <div className="rm-activity-title-row">

                          <strong>
                            {activity.title}
                          </strong>

                          <span
                            className={
                              activity.status ===
                              'Success'
                                ? 'rm-activity-status success'
                                : activity.status ===
                                    'Pending'
                                  ? 'rm-activity-status pending'
                                  : 'rm-activity-status alert'
                            }
                          >
                            ● {activity.status}
                          </span>

                        </div>


                        <p>
                          {activity.description}
                        </p>


                        <div className="rm-activity-meta">

                          <span>
                            {activity.type}
                          </span>

                          <span>
                            •
                          </span>

                          <span>
                            {activity.customerName}
                          </span>

                          <span>
                            •
                          </span>

                          <span>
                            {activity.customerCode}
                          </span>

                          <span>
                            •
                          </span>

                          <span>
                            {activity.reference}
                          </span>

                          {activity.amount !==
                            undefined &&
                            activity.type ===
                              'Transaction' && (
                              <>
                                <span>
                                  •
                                </span>

                                <span>
                                  {formatCurrency(
                                    activity.amount
                                  )}
                                </span>
                              </>
                            )}

                        </div>

                      </div>


                      {/* TIME */}

                      <div className="rm-activity-time">

                        <strong>
                          {activity.date}
                        </strong>

                        <span>
                          {activity.time}
                        </span>

                      </div>


                      {/* ACTION */}

                      {activity.customerId !==
                      undefined ? (

                        <button
                          className="rm-activity-view-btn"
                          onClick={() =>
                            navigate(
                              `/customer-360/${activity.customerId}`
                            )
                          }
                        >
                          Customer 360° →
                        </button>

                      ) : (

                        <span className="rm-activity-system">
                          System
                        </span>

                      )}

                    </div>

                  )
                )

              )}


            {/* NO RESULTS */}

            {!loading &&
              !error &&
              filteredActivities.length ===
                0 && (

                <div className="rm-activity-no-results">

                  <strong>
                    No activities found
                  </strong>

                  <span>
                    Try changing your search or filters.
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


        {/* BOTTOM GRID */}

        <section className="rm-activity-bottom-grid">

          {/* SUMMARY */}

          <div className="panel rm-activity-summary-panel">

            <div className="panel-header">

              <div>

                <h2>
                  Activity Summary
                </h2>

                <p>
                  Current audit overview
                </p>

              </div>

            </div>


            <div className="rm-activity-summary-list">

              <div>

                <span>
                  Total Activities
                </span>

                <strong>
                  {activities.length}
                </strong>

              </div>


              <div>

                <span>
                  Customer Interactions
                </span>

                <strong>
                  {customerActivities}
                </strong>

              </div>


              <div>

                <span>
                  Successful Actions
                </span>

                <strong className="green-value">
                  {successfulActivities}
                </strong>

              </div>


              <div>

                <span>
                  Attention Required
                </span>

                <strong className="red-value">
                  {alertActivities +
                    pendingActivities}
                </strong>

              </div>

            </div>

          </div>


          {/* SECURITY */}

          <div className="panel rm-activity-security-panel">

            <div className="rm-activity-security-header">

              <div className="rm-activity-security-icon">
                ✓
              </div>

              <div>

                <h2>
                  Audit & Security
                </h2>

                <span>
                  Activity monitoring
                </span>

              </div>

            </div>


            <div className="rm-activity-security-info">

              <strong>
                Activity monitoring enabled
              </strong>

              <p>
                Activity is now loaded through the
                authenticated RM activity API and is
                restricted to the RM portfolio.
              </p>

            </div>


            <div className="rm-activity-security-points">

              <span>
                ✓ Customer transactions tracked
              </span>

              <span>
                ✓ Service requests tracked
              </span>

              <span>
                ✓ RM authorization enforced
              </span>

            </div>

          </div>

        </section>


        {/* NOTICE */}

        <section className="panel rm-activity-notice">

          <div className="rm-activity-notice-icon">
            ✓
          </div>

          <div>

            <h3>
              RM Activity Access
            </h3>

            <p>
              Activity information shown here is
              fictional demo data. Access is protected
              by authentication and RM-level
              authorization. A dedicated audit-log
              system can be added during the final
              security phase.
            </p>

          </div>

        </section>

      </main>

    </div>
  )
}


/* ---------------- HELPERS ---------------- */

function formatDate(
  value: string
): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
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


function formatTime(
  value: string
): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleTimeString(
    'en-IN',
    {
      hour: '2-digit',
      minute: '2-digit',
    }
  )
}


function normalizeActivityStatus(
  value: string
): ActivityStatus {
  const status =
    value?.toLowerCase() || ''

  if (
    status.includes('escalat') ||
    status.includes('overdue') ||
    status.includes('failed') ||
    status.includes('blocked')
  ) {
    return 'Alert'
  }

  if (
    status.includes('pending') ||
    status.includes('progress') ||
    status.includes('open')
  ) {
    return 'Pending'
  }

  return 'Success'
}


export default Activity
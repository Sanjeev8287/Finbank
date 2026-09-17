import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RMSidebar from '../components/RMSidebar'

type RMProfile = {
  id: number
  employee_code: string
  full_name: string
  email: string
  phone?: string
  role?: string
  status?: string
  department?: string
  branch_name?: string
  branch_code?: string
  region?: string
  reporting_manager?: string
  joining_date?: string
}

type Customer = {
  id: number
  relationship_manager_id?: number
}

type Account = {
  id: number
  customer_id: number
}

type Card = {
  id: number
  customer_id: number
}

type Loan = {
  id: number
  customer_id: number
}

type ServiceRequest = {
  id: number
  customer_id: number
  status?: string
}

function MyProfile() {
  const navigate = useNavigate()

  const [showDetails, setShowDetails] =
    useState(false)

  const [profile, setProfile] =
    useState<RMProfile | null>(null)

  const [customers, setCustomers] =
    useState<Customer[]>([])

  const [accounts, setAccounts] =
    useState<Account[]>([])

  const [cards, setCards] =
    useState<Card[]>([])

  const [loans, setLoans] =
    useState<Loan[]>([])

  const [serviceRequests, setServiceRequests] =
    useState<ServiceRequest[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  /*
   * Demo RM ID.
   *
   * Authentication phase me ye ID
   * logged-in RM ke token se aayegi.
   */
  const rmId = 1

  useEffect(() => {
    const fetchProfileData =
      async () => {
        try {
          setLoading(true)
          setError('')

          const [
            customersResponse,
            accountsResponse,
            cardsResponse,
            loansResponse,
            requestsResponse,
          ] = await Promise.all([
            fetch(
              'http://localhost:5000/api/customers'
            ),
            fetch(
              'http://localhost:5000/api/accounts'
            ),
            fetch(
              'http://localhost:5000/api/cards'
            ),
            fetch(
              'http://localhost:5000/api/loans'
            ),
            fetch(
              'http://localhost:5000/api/service-requests'
            ),
          ])

          if (
            !customersResponse.ok ||
            !accountsResponse.ok ||
            !cardsResponse.ok ||
            !loansResponse.ok ||
            !requestsResponse.ok
          ) {
            throw new Error(
              'Failed to fetch portfolio data'
            )
          }

          const customersData =
            await customersResponse.json()

          const accountsData =
            await accountsResponse.json()

          const cardsData =
            await cardsResponse.json()

          const loansData =
            await loansResponse.json()

          const requestsData =
            await requestsResponse.json()

          const customerList =
            customersData.customers || []

          const accountList =
            accountsData.accounts || []

          const cardList =
            cardsData.cards || []

          const loanList =
            loansData.loans || []

          const requestList =
            requestsData.data || []

          setCustomers(customerList)
          setAccounts(accountList)
          setCards(cardList)
          setLoans(loanList)
          setServiceRequests(
            requestList
          )

          /*
           * Relationship manager profile
           *
           * Current project has RM/customer
           * relationship through relationship_manager_id.
           *
           * Until RM profile endpoint is added,
           * use the project's demo RM identity.
           */
          setProfile({
            id: rmId,
            employee_code:
              'FB-RM-00017',
            full_name:
              'Rahul Sharma',
            email:
              'rahul.sharma@finbank.demo',
            phone:
              '+91 98XXXXXX42',
            role:
              'SENIOR_RM',
            status:
              'ACTIVE',
            department:
              'Retail Banking',
            branch_name:
              'FinBank Main Branch',
            branch_code:
              'FB-MB-001',
            region:
              'North India',
            reporting_manager:
              'Arun Mehta',
            joining_date:
              '2024-07-08',
          })
        } catch (err) {
          console.error(
            'RM profile error:',
            err
          )

          setError(
            'Unable to load profile data. Please make sure the backend server is running.'
          )
        } finally {
          setLoading(false)
        }
      }

    fetchProfileData()
  }, [])

  const assignedCustomers =
    customers.filter(
      (customer) =>
        customer.relationship_manager_id ===
        rmId
    )

  const assignedCustomerIds =
    new Set(
      assignedCustomers.map(
        (customer) => customer.id
      )
    )

  const portfolioAccounts =
    accounts.filter(
      (account) =>
        assignedCustomerIds.has(
          account.customer_id
        )
    )

  const portfolioCards =
    cards.filter(
      (card) =>
        assignedCustomerIds.has(
          card.customer_id
        )
    )

  const portfolioLoans =
    loans.filter(
      (loan) =>
        assignedCustomerIds.has(
          loan.customer_id
        )
    )

  const openRequests =
    serviceRequests.filter(
      (request) =>
        assignedCustomerIds.has(
          request.customer_id
        ) &&
        isOpenRequest(
          request.status
        )
    )

  const displayName =
    profile?.full_name ||
    'Rahul Sharma'

  const employeeCode =
    profile?.employee_code ||
    'FB-RM-00017'

  const roleLabel =
    profile?.role ===
    'SENIOR_RM'
      ? 'Senior Relationship Manager'
      : profile?.role ===
          'ADMIN'
        ? 'Administrator'
        : 'Relationship Manager'

  const isActive =
    !profile?.status ||
    profile.status.toUpperCase() ===
      'ACTIVE'

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
              My Profile
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
                {displayName.charAt(0)}
              </div>

              <div>

                <strong>
                  {displayName}
                </strong>

                <small>
                  {profile?.role ===
                  'SENIOR_RM'
                    ? 'Senior RM'
                    : 'RM'}
                </small>

              </div>

            </div>

          </div>

        </header>


        {/* ERROR */}

        {error && (

          <section className="panel">

            <div className="rm-profile-notice">

              <div className="rm-profile-notice-icon">
                !
              </div>

              <div>

                <h3>
                  Profile data warning
                </h3>

                <p>
                  {error}
                </p>

              </div>

            </div>

          </section>

        )}


        {/* HERO */}

        <section className="rm-profile-hero">

          <div className="rm-profile-hero-left">

            <div className="rm-profile-large-avatar">
              {displayName.charAt(0)}
            </div>

            <div>

              <p className="rm-profile-eyebrow">
                RELATIONSHIP MANAGER PROFILE
              </p>

              <h2>
                {displayName}
              </h2>

              <p>
                {roleLabel} · FinBank
              </p>

              <div className="rm-profile-status">

                <span>
                  ●
                </span>

                {isActive
                  ? 'Active Account'
                  : 'Inactive Account'}

              </div>

            </div>

          </div>


          <div className="rm-profile-hero-right">

            <span>
              RM ID
            </span>

            <strong>
              {employeeCode}
            </strong>

          </div>

        </section>


        {/* PERSONAL + ROLE */}

        <section className="rm-profile-grid">

          <div className="panel rm-profile-details-panel">

            <div className="panel-header">

              <div>

                <h2>
                  Personal Information
                </h2>

                <p>
                  Basic information associated
                  with your RM profile.
                </p>

              </div>

            </div>


            <div className="rm-profile-details-grid">

              <div className="rm-profile-field">

                <span>
                  Full Name
                </span>

                <strong>
                  {displayName}
                </strong>

              </div>


              <div className="rm-profile-field">

                <span>
                  Employee ID
                </span>

                <strong>
                  {employeeCode}
                </strong>

              </div>


              <div className="rm-profile-field">

                <span>
                  Designation
                </span>

                <strong>
                  {roleLabel}
                </strong>

              </div>


              <div className="rm-profile-field">

                <span>
                  Department
                </span>

                <strong>
                  {profile?.department ||
                    'Retail Banking'}
                </strong>

              </div>


              <div className="rm-profile-field">

                <span>
                  Official Email
                </span>

                <strong>
                  {profile?.email ||
                    'rahul.sharma@finbank.demo'}
                </strong>

              </div>


              <div className="rm-profile-field">

                <span>
                  Contact Number
                </span>

                <strong>
                  {profile?.phone ||
                    '+91 98XXXXXX42'}
                </strong>

              </div>

            </div>

          </div>


          {/* ROLE */}

          <div className="panel rm-profile-role-panel">

            <div className="panel-header">

              <div>

                <h2>
                  Role & Access
                </h2>

                <p>
                  Your current system permissions.
                </p>

              </div>

            </div>


            <div className="rm-profile-role-badge">

              <div className="rm-profile-role-icon">
                RM
              </div>

              <div>

                <strong>
                  {profile?.role ===
                  'SENIOR_RM'
                    ? 'Senior RM'
                    : 'RM'}
                </strong>

                <span>
                  Relationship Manager Role
                </span>

              </div>

            </div>


            <div className="rm-profile-access-list">

              <div>
                <span>
                  Customer Management
                </span>
                <strong>
                  Allowed
                </strong>
              </div>

              <div>
                <span>
                  Customer 360°
                </span>
                <strong>
                  Allowed
                </strong>
              </div>

              <div>
                <span>
                  Account Information
                </span>
                <strong>
                  Allowed
                </strong>
              </div>

              <div>
                <span>
                  Card Information
                </span>
                <strong>
                  Allowed
                </strong>
              </div>

              <div>
                <span>
                  Loan Information
                </span>
                <strong>
                  Allowed
                </strong>
              </div>

              <div>
                <span>
                  Service Requests
                </span>
                <strong>
                  Allowed
                </strong>
              </div>

            </div>

          </div>

        </section>


        {/* OFFICE + SECURITY */}

        <section className="rm-profile-grid">

          <div className="panel rm-profile-office-panel">

            <div className="panel-header">

              <div>

                <h2>
                  Office Information
                </h2>

                <p>
                  RM branch and work assignment details.
                </p>

              </div>

            </div>


            <div className="rm-profile-office-list">

              <div>
                <span>
                  Branch
                </span>

                <strong>
                  {profile?.branch_name ||
                    'FinBank Main Branch'}
                </strong>
              </div>


              <div>
                <span>
                  Branch Code
                </span>

                <strong>
                  {profile?.branch_code ||
                    'FB-MB-001'}
                </strong>
              </div>


              <div>
                <span>
                  Region
                </span>

                <strong>
                  {profile?.region ||
                    'North India'}
                </strong>
              </div>


              <div>
                <span>
                  Reporting Manager
                </span>

                <strong>
                  {profile?.reporting_manager ||
                    'Arun Mehta'}
                </strong>
              </div>


              <div>
                <span>
                  Joining Date
                </span>

                <strong>
                  {formatJoiningDate(
                    profile?.joining_date
                  )}
                </strong>
              </div>

            </div>

          </div>


          {/* SECURITY */}

          <div className="panel rm-profile-security-panel">

            <div className="panel-header">

              <div>

                <h2>
                  Security
                </h2>

                <p>
                  Account and session security information.
                </p>

              </div>

            </div>


            <div className="rm-profile-security-card">

              <div className="rm-profile-security-icon">
                ✓
              </div>

              <div>

                <strong>
                  Account Protected
                </strong>

                <p>
                  Your RM account is protected with
                  role-based access controls.
                </p>

              </div>

            </div>


            <div className="rm-profile-security-list">

              <div>

                <span>
                  Last Login
                </span>

                <strong>
                  Demo Session
                </strong>

              </div>


              <div>

                <span>
                  Session Status
                </span>

                <strong className="green-value">
                  Active
                </strong>

              </div>


              <div>

                <span>
                  Audit Logging
                </span>

                <strong className="green-value">
                  Enabled
                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* PORTFOLIO */}

        <section className="panel rm-profile-portfolio-panel">

          <div className="panel-header">

            <div>

              <h2>
                Portfolio Overview
              </h2>

              <p>
                Customers and products currently
                assigned to this RM.
              </p>

            </div>

          </div>


          {loading ? (

            <div className="rm-profile-portfolio-stats">

              <div>
                <span>
                  Assigned Customers
                </span>

                <strong>
                  ...
                </strong>

                <small>
                  Loading
                </small>
              </div>

              <div>
                <span>
                  Accounts
                </span>

                <strong>
                  ...
                </strong>

                <small>
                  Loading
                </small>
              </div>

              <div>
                <span>
                  Cards
                </span>

                <strong>
                  ...
                </strong>

                <small>
                  Loading
                </small>
              </div>

              <div>
                <span>
                  Loans
                </span>

                <strong>
                  ...
                </strong>

                <small>
                  Loading
                </small>
              </div>

              <div>
                <span>
                  Open Requests
                </span>

                <strong>
                  ...
                </strong>

                <small>
                  Loading
                </small>
              </div>

            </div>

          ) : (

            <div className="rm-profile-portfolio-stats">

              <div>

                <span>
                  Assigned Customers
                </span>

                <strong>
                  {assignedCustomers.length}
                </strong>

                <small>
                  Active portfolio
                </small>

              </div>


              <div>

                <span>
                  Accounts
                </span>

                <strong>
                  {portfolioAccounts.length}
                </strong>

                <small>
                  Customer accounts
                </small>

              </div>


              <div>

                <span>
                  Cards
                </span>

                <strong>
                  {portfolioCards.length}
                </strong>

                <small>
                  Linked cards
                </small>

              </div>


              <div>

                <span>
                  Loans
                </span>

                <strong>
                  {portfolioLoans.length}
                </strong>

                <small>
                  Customer loan accounts
                </small>

              </div>


              <div>

                <span>
                  Open Requests
                </span>

                <strong>
                  {openRequests.length}
                </strong>

                <small>
                  Require attention
                </small>

              </div>

            </div>

          )}

        </section>


        {/* ACTIONS */}

        <section className="panel rm-profile-actions-panel">

          <div className="panel-header">

            <div>

              <h2>
                Profile Actions
              </h2>

              <p>
                Manage your profile and account session.
              </p>

            </div>

          </div>


          <div className="rm-profile-actions">

            <button
              className="rm-profile-action-btn"
              onClick={() =>
                setShowDetails(
                  !showDetails
                )
              }
            >
              {showDetails
                ? 'Hide Account Details'
                : 'View Account Details'}
            </button>


            <button
              className="rm-profile-action-btn"
              onClick={() =>
                alert(
                  'Profile editing will be connected to the backend after authentication is implemented.'
                )
              }
            >
              Edit Profile
            </button>


            <button
              className="rm-profile-action-btn danger"
              onClick={() =>
                navigate('/rm-login')
              }
            >
              Logout
            </button>

          </div>


          {showDetails && (

            <div className="rm-profile-extra-details">

              <div>

                <span>
                  Account Type
                </span>

                <strong>
                  RM Employee Account
                </strong>

              </div>


              <div>

                <span>
                  Role Code
                </span>

                <strong>
                  {profile?.role ||
                    'SENIOR_RM'}
                </strong>

              </div>


              <div>

                <span>
                  Access Level
                </span>

                <strong>
                  Portfolio Management
                </strong>

              </div>


              <div>

                <span>
                  Environment
                </span>

                <strong>
                  FinBank Demo
                </strong>

              </div>

            </div>

          )}

        </section>


        {/* NOTICE */}

        <section className="panel rm-profile-notice">

          <div className="rm-profile-notice-icon">
            ✓
          </div>

          <div>

            <h3>
              Profile & Security Notice
            </h3>

            <p>
              This profile uses fictional FinBank
              demo information. Authentication,
              permissions, session management and
              server-side audit logging will be
              connected during the security phase.
            </p>

          </div>

        </section>

      </main>

    </div>
  )
}


/* ---------------- HELPERS ---------------- */

function isOpenRequest(
  status?: string
): boolean {
  if (!status) {
    return false
  }

  const normalized =
    status.toLowerCase()

  return (
    normalized.includes('open') ||
    normalized.includes('pending') ||
    normalized.includes('progress') ||
    normalized.includes('escalat')
  )
}


function formatJoiningDate(
  value?: string
): string {
  if (!value) {
    return '08 July 2024'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }
  )
}


export default MyProfile
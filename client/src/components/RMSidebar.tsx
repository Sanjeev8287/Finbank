import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

function RMSidebar() {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <aside className="sidebar">

      {/* BRAND */}

      <div className="brand">

        <div className="brand-icon">
          F
        </div>

        <div>
          <h2>FinBank</h2>
          <span>RM Portal</span>
        </div>

      </div>


      {/* MAIN NAVIGATION */}

      <nav className="sidebar-nav">

        {/* DASHBOARD */}

        <Link
          to="/rm-dashboard"
          className={`nav-item ${
            isActive('/rm-dashboard') ? 'active' : ''
          }`}
        >
          <span>▣</span>
          Dashboard
        </Link>


        {/* CUSTOMERS */}

        <Link
          to="/rm-customers"
          className={`nav-item ${
            isActive('/rm-customers') ? 'active' : ''
          }`}
        >
          <span>👥</span>
          Customers
        </Link>


        {/* ACCOUNTS */}

        <Link
          to="/rm-accounts"
          className={`nav-item ${
            isActive('/rm-accounts') ? 'active' : ''
          }`}
        >
          <span>◉</span>
          Accounts
        </Link>


        {/* CARDS */}

        <Link
          to="/rm-cards"
          className={`nav-item ${
            isActive('/rm-cards') ? 'active' : ''
          }`}
        >
          <span>▰</span>
          Cards
        </Link>


        {/* LOANS */}

        <Link
          to="/rm-loans"
          className={`nav-item ${
            isActive('/rm-loans') ? 'active' : ''
          }`}
        >
          <span>₹</span>
          Loans
        </Link>


        {/* SERVICE REQUESTS */}

        <Link
          to="/rm-service-requests"
          className={`nav-item ${
            isActive('/rm-service-requests') ? 'active' : ''
          }`}
        >
          <span>⚙</span>
          Service Requests
        </Link>


        {/* ACTIVITY */}

        <Link
          to="/rm-activity"
          className={`nav-item ${
            isActive('/rm-activity') ? 'active' : ''
          }`}
        >
          <span>◌</span>
          Activity
        </Link>

      </nav>


      {/* BOTTOM NAVIGATION */}

      <div className="sidebar-bottom">

        {/* MY PROFILE */}

        <Link
          to="/rm-profile"
          className={`nav-item ${
            isActive('/rm-profile') ? 'active' : ''
          }`}
        >
          <span>👤</span>
          My Profile
        </Link>


        {/* LOGOUT */}

        <Link
          to="/rm-login"
          className="nav-item"
        >
          <span>↪</span>
          Logout
        </Link>

      </div>

    </aside>
  )
}

export default RMSidebar


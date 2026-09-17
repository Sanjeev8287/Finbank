import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'
import CustomerProtectedRoute from './components/CustomerProtectedRoute'

import RMLogin from './pages/RMLogin'
import RMDashboard from './pages/RMDashboard'
import CustomerManagement from './pages/CustomerManagement'
import Customer360 from './pages/Customer360'
import AccountsManagement from './pages/AccountsManagement'
import CardsManagement from './pages/CardsManagement'
import LoansManagement from './pages/LoansManagement'
import ServiceRequestsManagement from './pages/ServiceRequestsManagement'
import Activity from './pages/Activity'
import MyProfile from './pages/MyProfile'
import RMAIChat from './pages/RMAIChat'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Accounts from './pages/Accounts'
import Cards from './pages/Cards'
import Loans from './pages/Loans'
import Transactions from './pages/Transactions'
import ServiceRequests from './pages/ServiceRequests'
import Profile from './pages/Profile'
import AIChat from './pages/AIChat'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            CUSTOMER LOGIN
        ========================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* =========================
            RM LOGIN
        ========================== */}

        <Route
          path="/rm-login"
          element={<RMLogin />}
        />

        {/* =========================
            CUSTOMER PORTAL
        ========================== */}

        <Route
          element={<CustomerProtectedRoute />}
        >
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/accounts"
            element={<Accounts />}
          />

          <Route
            path="/cards"
            element={<Cards />}
          />

          <Route
            path="/loans"
            element={<Loans />}
          />

          <Route
            path="/transactions"
            element={<Transactions />}
          />

          <Route
            path="/service-requests"
            element={<ServiceRequests />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          {/* CUSTOMER AI ASSISTANT */}
          <Route
            path="/ai-assistant"
            element={<AIChat />}
          />
        </Route>

        {/* =========================
            RM PORTAL
        ========================== */}

        <Route
          element={<ProtectedRoute />}
        >
          <Route
            path="/rm-dashboard"
            element={<RMDashboard />}
          />

          <Route
            path="/rm-customers"
            element={<CustomerManagement />}
          />

          <Route
            path="/customer-360/:customerId"
            element={<Customer360 />}
          />

          <Route
            path="/rm-accounts"
            element={<AccountsManagement />}
          />

          <Route
            path="/rm-cards"
            element={<CardsManagement />}
          />

          <Route
            path="/rm-loans"
            element={<LoansManagement />}
          />

          <Route
            path="/rm-service-requests"
            element={
              <ServiceRequestsManagement />
            }
          />

          <Route
            path="/rm-activity"
            element={<Activity />}
          />

          <Route
            path="/rm-profile"
            element={<MyProfile />}
          />

          {/* RM AI ASSISTANT */}
          <Route
            path="/rm-ai-assistant"
            element={<RMAIChat />}
          />
        </Route>

        {/* =========================
            DEFAULT ROUTE
        ========================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        {/* =========================
            FALLBACK
        ========================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App
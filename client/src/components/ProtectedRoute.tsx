import { Navigate, Outlet, useLocation } from 'react-router-dom'

const ProtectedRoute = () => {
  const location = useLocation()

  const token = localStorage.getItem('finbank_token')
  const userData = localStorage.getItem('finbank_user')

  if (!token || !userData) {
    return (
      <Navigate
        to="/rm-login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  try {
    const user = JSON.parse(userData)

    const allowedRoles = [
      'RM',
      'SENIOR_RM',
      'ADMIN',
    ]

    if (!allowedRoles.includes(user.role)) {
      localStorage.removeItem('finbank_token')
      localStorage.removeItem('finbank_user')

      return <Navigate to="/rm-login" replace />
    }

    return <Outlet />
  } catch (error) {
    console.error('Invalid stored user:', error)

    localStorage.removeItem('finbank_token')
    localStorage.removeItem('finbank_user')

    return <Navigate to="/rm-login" replace />
  }
}

export default ProtectedRoute
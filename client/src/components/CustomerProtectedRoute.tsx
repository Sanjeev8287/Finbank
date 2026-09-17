import { Navigate, Outlet, useLocation } from 'react-router-dom'

function CustomerProtectedRoute() {
  const location = useLocation()

  const token = localStorage.getItem('finbank_token')
  const userData = localStorage.getItem('finbank_user')

  if (!token || !userData) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  try {
    const user = JSON.parse(userData)

    if (user.role !== 'CUSTOMER') {
      localStorage.removeItem('finbank_token')
      localStorage.removeItem('finbank_user')

      return <Navigate to="/login" replace />
    }

    return <Outlet />
  } catch (error) {
    console.error('Invalid stored customer:', error)

    localStorage.removeItem('finbank_token')
    localStorage.removeItem('finbank_user')

    return <Navigate to="/login" replace />
  }
}

export default CustomerProtectedRoute

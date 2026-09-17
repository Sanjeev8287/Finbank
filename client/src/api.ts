const API_BASE_URL = 'http://localhost:5000/api'

export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = localStorage.getItem('finbank_token')

  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  )

  if (response.status === 401) {
    const userData =
      localStorage.getItem('finbank_user')

    let loginPath = '/login'

    try {
      const user = userData
        ? JSON.parse(userData)
        : null

      if (
        user &&
        ['RM', 'SENIOR_RM', 'ADMIN'].includes(
          user.role
        )
      ) {
        loginPath = '/rm-login'
      }
    } catch {
      loginPath = '/login'
    }

    localStorage.removeItem('finbank_token')
    localStorage.removeItem('finbank_user')

    window.location.href = loginPath

    throw new Error('Authentication expired')
  }

  return response
}

export default apiFetch
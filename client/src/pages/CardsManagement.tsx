import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RMSidebar from '../components/RMSidebar'
import { apiFetch } from '../api'

type CardType = 'Credit Card' | 'Debit Card'
type CardStatus = 'Active' | 'Blocked' | 'Expired'

type ApiCard = {
  id: number
  customer_id: number
  card_number: string
  card_type: string
  card_variant: string
  expiry_date: string
  credit_limit: number | string
  available_limit: number | string
  status: string
  issued_at: string
  created_at: string
  customer_code: string
  customer_name: string
  customer_email?: string
  customer_phone?: string
}

type Card = {
  id: number
  customerId: number
  customerCode: string
  customerName: string
  cardNumber: string
  type: CardType
  variant: string
  status: CardStatus
  expiry: string
  limit: number
  available: number
}

function CardsManagement() {
  const navigate = useNavigate()

  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await apiFetch('/rm/cards')

        if (!response.ok) {
          throw new Error('Failed to fetch cards')
        }

        const data = await response.json()

        if (
          !data.success ||
          !Array.isArray(data.cards)
        ) {
          throw new Error(
            data.message ||
              'Invalid card data received from server'
          )
        }

        const mappedCards: Card[] =
          data.cards.map(
            (card: ApiCard) => ({
              id: card.id,
              customerId: card.customer_id,
              customerCode: card.customer_code,
              customerName: card.customer_name,
              cardNumber:
                maskCardNumber(
                  card.card_number
                ),
              type: normalizeCardType(
                card.card_type
              ),
              variant:
                card.card_variant || 'Standard',
              status:
                normalizeCardStatus(
                  card.status
                ),
              expiry:
                formatExpiry(
                  card.expiry_date
                ),
              limit:
                Number(
                  card.credit_limit || 0
                ),
              available:
                Number(
                  card.available_limit || 0
                ),
            })
          )

        setCards(mappedCards)
      } catch (err) {
        console.error(
          'Cards fetch error:',
          err
        )

        setError(
          'Unable to load card data. Please make sure the backend server is running.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [])

  const filteredCards = useMemo(() => {
    const query =
      search.toLowerCase().trim()

    return cards.filter((card) => {
      const matchesSearch =
        card.customerName
          .toLowerCase()
          .includes(query) ||
        card.customerCode
          .toLowerCase()
          .includes(query) ||
        card.cardNumber
          .toLowerCase()
          .includes(query) ||
        card.variant
          .toLowerCase()
          .includes(query)

      const matchesType =
        typeFilter === 'All' ||
        card.type === typeFilter

      const matchesStatus =
        statusFilter === 'All' ||
        card.status === statusFilter

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      )
    })
  }, [
    cards,
    search,
    typeFilter,
    statusFilter,
  ])

  const activeCards =
    cards.filter(
      (card) =>
        card.status === 'Active'
    ).length

  const blockedCards =
    cards.filter(
      (card) =>
        card.status === 'Blocked'
    ).length

  const expiredCards =
    cards.filter(
      (card) =>
        card.status === 'Expired'
    ).length

  const creditCards =
    cards.filter(
      (card) =>
        card.type === 'Credit Card'
    ).length

  const debitCards =
    cards.filter(
      (card) =>
        card.type === 'Debit Card'
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
              Cards Management
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

        <section className="rm-accounts-intro">

          <div>

            <p className="customer-eyebrow">
              CARD PORTFOLIO
            </p>

            <h2>
              Manage customer cards
            </h2>

            <p>
              Review customer cards, status,
              limits and expiry information.
            </p>

          </div>

          <div className="customer-count-box">

            <span>
              Total Cards
            </span>

            <strong>
              {loading
                ? '...'
                : cards.length}
            </strong>

          </div>

        </section>


        {/* STATS */}

        <section className="rm-account-stats">

          <div className="stat-card">

            <div className="stat-icon">
              ▰
            </div>

            <div>

              <span>
                Total Cards
              </span>

              <strong>
                {loading
                  ? '...'
                  : cards.length}
              </strong>

              <small>
                Across customer portfolio
              </small>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              ✓
            </div>

            <div>

              <span>
                Active Cards
              </span>

              <strong>
                {loading
                  ? '...'
                  : activeCards}
              </strong>

              <small>
                Currently active
              </small>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              ⚠
            </div>

            <div>

              <span>
                Blocked Cards
              </span>

              <strong>
                {loading
                  ? '...'
                  : blockedCards}
              </strong>

              <small>
                Require attention
              </small>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              !
            </div>

            <div>

              <span>
                Expired Cards
              </span>

              <strong>
                {loading
                  ? '...'
                  : expiredCards}
              </strong>

              <small>
                Need replacement
              </small>

            </div>

          </div>

        </section>


        {/* FILTER */}

        <section className="panel rm-account-filter-panel">

          <div className="rm-account-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search customer, customer ID, card number or variant..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              disabled={loading}
            />

          </div>


          <div className="rm-account-filters">

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All Card Types
              </option>

              <option value="Credit Card">
                Credit Card
              </option>

              <option value="Debit Card">
                Debit Card
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

              <option value="Blocked">
                Blocked
              </option>

              <option value="Expired">
                Expired
              </option>

            </select>


            <button
              className="rm-account-clear-btn"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>


          <div className="rm-account-filter-result">

            Showing{' '}

            <strong>
              {filteredCards.length}
            </strong>{' '}

            of{' '}

            <strong>
              {cards.length}
            </strong>{' '}

            cards

          </div>

        </section>


        {/* CARD TABLE */}

        <section className="panel rm-account-table-panel">

          <div className="panel-header">

            <div>

              <h2>
                Card Portfolio
              </h2>

              <p>
                Showing {filteredCards.length} of{' '}
                {cards.length} cards
              </p>

            </div>

            <span className="portfolio-status">
              ● Portfolio Active
            </span>

          </div>


          <div className="rm-account-table">

            {/* TABLE HEADER */}

            <div className="rm-account-table-header">

              <span>
                Customer
              </span>

              <span>
                Card
              </span>

              <span>
                Type
              </span>

              <span>
                Limit
              </span>

              <span>
                Expiry
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

              <div className="customer-no-results">

                <strong>
                  Loading cards...
                </strong>

                <span>
                  Fetching card data from
                  PostgreSQL.
                </span>

              </div>

            )}


            {/* ERROR */}

            {!loading &&
              error && (

                <div className="customer-no-results">

                  <strong>
                    Unable to load cards
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


            {/* CARD ROWS */}

            {!loading &&
              !error &&
              filteredCards.length >
                0 && (

                filteredCards.map(
                  (card) => (

                    <div
                      className="rm-account-table-row"
                      key={card.id}
                    >

                      {/* CUSTOMER */}

                      <div className="rm-account-customer">

                        <div className="rm-account-avatar">
                          {card.customerName
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <strong>
                            {card.customerName}
                          </strong>

                          <span>
                            {card.customerCode}
                          </span>

                        </div>

                      </div>


                      {/* CARD */}

                      <div className="rm-card-info">

                        <div className="rm-card-visual">
                          <span>
                            F
                          </span>
                        </div>

                        <div>

                          <strong>
                            {card.cardNumber}
                          </strong>

                          <span>
                            {card.variant}
                          </span>

                        </div>

                      </div>


                      {/* TYPE */}

                      <div>

                        <span
                          className={
                            card.type ===
                            'Credit Card'
                              ? 'customer-type premium'
                              : 'customer-type regular'
                          }
                        >
                          {card.type}
                        </span>

                      </div>


                      {/* LIMIT */}

                      <div className="rm-card-limit">

                        <strong>
                          {formatCurrency(
                            card.limit
                          )}
                        </strong>

                        <span>
                          Avail.{' '}
                          {formatCurrency(
                            card.available
                          )}
                        </span>

                      </div>


                      {/* EXPIRY */}

                      <div className="rm-card-expiry">

                        <strong>
                          {card.expiry}
                        </strong>

                        <span>
                          Expiry
                        </span>

                      </div>


                      {/* STATUS */}

                      <div>

                        <span
                          className={
                            card.status ===
                            'Active'
                              ? 'customer-status active'
                              : card.status ===
                                  'Blocked'
                                ? 'customer-status inactive'
                                : 'customer-status expired'
                          }
                        >
                          ● {card.status}
                        </span>

                      </div>


                      {/* ACTION */}

                      <div>

                        <button
                          className="customer-view-btn"
                          onClick={() =>
                            navigate(
                              `/customer-360/${card.customerId}`
                            )
                          }
                        >
                          View 360° →
                        </button>

                      </div>

                    </div>

                  )
                )

              )}


            {/* NO RESULTS */}

            {!loading &&
              !error &&
              filteredCards.length ===
                0 && (

                <div className="customer-no-results">

                  <strong>
                    No cards found
                  </strong>

                  <span>
                    Try changing your search
                    or filters.
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


        {/* BOTTOM INSIGHTS */}

        <section className="rm-account-bottom-grid">

          {/* CARD DISTRIBUTION */}

          <div className="panel rm-account-distribution">

            <div className="panel-header">

              <div>

                <h2>
                  Card Distribution
                </h2>

                <p>
                  Current portfolio breakdown
                </p>

              </div>

            </div>


            <div className="rm-distribution-list">

              <div>

                <span>
                  Credit Cards
                </span>

                <strong>
                  {creditCards}
                </strong>

              </div>


              <div>

                <span>
                  Debit Cards
                </span>

                <strong>
                  {debitCards}
                </strong>

              </div>


              <div>

                <span>
                  Active Cards
                </span>

                <strong>
                  {activeCards}
                </strong>

              </div>


              <div>

                <span>
                  Cards Requiring Attention
                </span>

                <strong>
                  {blockedCards +
                    expiredCards}
                </strong>

              </div>

            </div>

          </div>


          {/* AI INSIGHT */}

          <div className="panel rm-account-ai">

            <div className="rm-ai-header">

              <div className="rm-ai-icon">
                AI
              </div>

              <div>

                <h2>
                  Card Smart Insight
                </h2>

                <span>
                  Portfolio monitoring
                </span>

              </div>

            </div>


            <div className="rm-ai-insight">

              <span>
                💡
              </span>

              <div>

                <strong>
                  Cards Requiring Attention
                </strong>

                <p>
                  {blockedCards +
                    expiredCards}{' '}
                  cards currently need RM
                  attention because they are
                  blocked or expired.
                </p>

              </div>

            </div>


            <button
              className="rm-ai-btn"
              onClick={() =>
                alert(
                  'AI Card Assistant will be connected after LLM integration.'
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

function normalizeCardType(
  value: string
): CardType {
  const type =
    value?.toLowerCase() || ''

  if (type.includes('debit')) {
    return 'Debit Card'
  }

  return 'Credit Card'
}


function normalizeCardStatus(
  value: string
): CardStatus {
  const status =
    value?.toLowerCase() || ''

  if (status === 'blocked') {
    return 'Blocked'
  }

  if (status === 'expired') {
    return 'Expired'
  }

  return 'Active'
}


function maskCardNumber(
  cardNumber: string
): string {
  if (!cardNumber) {
    return '**** **** ****'
  }

  const lastFour =
    cardNumber.slice(-4)

  return `**** **** **** ${lastFour}`
}


function formatExpiry(
  value: string
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

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0')

  const year = String(
    date.getFullYear()
  ).slice(-2)

  return `${month}/${year}`
}


export default CardsManagement
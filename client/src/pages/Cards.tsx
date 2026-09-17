import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiFetch from '../api'

type Card = {
  id: number
  card_number: string
  card_type: string
  card_variant: string
  expiry_date: string
  credit_limit: number | string
  available_limit: number | string
  status: string
}

function Cards() {
  const navigate = useNavigate()

  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCards = async () => {
      try {
        const response = await apiFetch(
          '/cards/me'
        )

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || 'Failed to load cards'
          )
        }

        setCards(data.cards || [])
      } catch (err) {
        console.error(err)
        setError('Unable to load card information')
      } finally {
        setLoading(false)
      }
    }

    loadCards()
  }, [])

  const money = (value: number | string) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(Number(value || 0))

  const maskCard = (number: string) =>
    number
      ? `•••• •••• •••• ${number.slice(-4)}`
      : '•••• •••• ••••'

  const logout = () => {
    localStorage.removeItem('finbank_token')
    localStorage.removeItem('finbank_user')
    navigate('/login')
  }

  const nav = [
    ['Dashboard', '/dashboard', '▣'],
    ['Accounts', '/accounts', '▤'],
    ['Transactions', '/transactions', '↕'],
    ['Cards', '/cards', '▭'],
    ['Loans', '/loans', '₹'],
    ['Service Requests', '/service-requests', '◉'],
    ['Profile', '/profile', '◯'],
  ]

  return (
    <>
      <style>{`
        .fb-card-page {
          min-height: 100vh;
          display: flex;
          background: #f5f7fb;
          color: #101828;
        }

        .fb-card-sidebar {
          width: 250px;
          min-height: 100vh;
          background: #fff;
          border-right: 1px solid #e4e7ec;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .fb-card-brand {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 4px 10px 30px;
        }

        .fb-card-brand-mark {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg,#2563eb,#4f46e5);
          color: white;
          display: grid;
          place-items: center;
          font-size: 22px;
          font-weight: 800;
        }

        .fb-card-brand h2 {
          margin: 0;
          font-size: 20px;
        }

        .fb-card-brand span {
          font-size: 11px;
          color: #98a2b3;
        }

        .fb-card-nav {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .fb-card-nav button,
        .fb-card-logout {
          border: 0;
          border-radius: 10px;
          padding: 12px;
          background: transparent;
          color: #667085;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
          text-align: left;
        }

        .fb-card-nav button:hover {
          background: #f2f4f7;
        }

        .fb-card-nav button.active {
          background: #eef4ff;
          color: #2563eb;
        }

        .fb-card-logout {
          margin-top: auto;
          background: #fff5f5;
          color: #d92d20;
        }

        .fb-card-main {
          flex: 1;
          padding: 30px 36px;
          min-width: 0;
        }

        .fb-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        .fb-card-eyebrow {
          color: #2563eb;
          font-size: 13px;
          font-weight: 700;
          margin: 0 0 6px;
        }

        .fb-card-title {
          margin: 0;
          font-size: 30px;
          font-weight: 800;
        }

        .fb-card-subtitle {
          color: #667085;
          margin: 7px 0 0;
          font-size: 14px;
        }

        .fb-card-user {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          padding: 9px 14px 9px 9px;
          border: 1px solid #eaecf0;
          border-radius: 14px;
        }

        .fb-card-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #eaf2ff;
          color: #2563eb;
          display: grid;
          place-items: center;
          font-weight: 800;
        }

        .fb-card-user strong,
        .fb-card-user span {
          display: block;
        }

        .fb-card-user strong {
          font-size: 13px;
        }

        .fb-card-user span {
          color: #98a2b3;
          font-size: 11px;
        }

        .fb-card-summary {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 18px;
          margin-bottom: 25px;
        }

        .fb-card-stat {
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 16px;
          padding: 20px;
        }

        .fb-card-stat span {
          color: #667085;
          font-size: 12px;
        }

        .fb-card-stat strong {
          display: block;
          margin-top: 7px;
          font-size: 21px;
        }

        .fb-card-container {
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 18px;
          padding: 24px;
        }

        .fb-card-container h2 {
          margin: 0;
          font-size: 19px;
        }

        .fb-card-container > p {
          color: #98a2b3;
          font-size: 13px;
          margin: 5px 0 22px;
        }

        .fb-real-card {
          border-radius: 18px;
          padding: 25px;
          margin-bottom: 18px;
          background: linear-gradient(135deg,#172554,#2563eb);
          color: white;
          min-height: 190px;
          max-width: 600px;
          box-shadow: 0 12px 30px rgba(37,99,235,.18);
        }

        .fb-real-card:last-child {
          margin-bottom: 0;
        }

        .fb-real-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .fb-real-card-type {
          font-size: 13px;
          opacity: .8;
        }

        .fb-real-card-variant {
          font-size: 18px;
          font-weight: 800;
          margin-top: 4px;
        }

        .fb-real-card-chip {
          width: 42px;
          height: 30px;
          border-radius: 7px;
          background: #eabf64;
        }

        .fb-real-card-number {
          font-size: 21px;
          letter-spacing: 2px;
          margin: 35px 0 20px;
        }

        .fb-real-card-bottom {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }

        .fb-real-card-bottom span {
          display: block;
          opacity: .65;
          font-size: 9px;
          margin-bottom: 3px;
        }

        .fb-real-card-limit {
          margin-top: 18px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .fb-limit-box {
          background: #f8fafc;
          border: 1px solid #eaecf0;
          border-radius: 12px;
          padding: 14px;
          color: #344054;
        }

        .fb-limit-box span {
          display: block;
          font-size: 11px;
          color: #98a2b3;
          margin-bottom: 5px;
        }

        .fb-limit-box strong {
          font-size: 15px;
        }

        .fb-card-status {
          display: inline-block;
          margin-top: 14px;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
        }

        .fb-card-status.active {
          background: #ecfdf3;
          color: #027a48;
        }

        .fb-card-status.inactive {
          background: #fef3f2;
          color: #b42318;
        }

        .fb-card-message {
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 16px;
          padding: 35px;
          text-align: center;
          color: #667085;
        }

        @media(max-width:800px) {
          .fb-card-sidebar {
            width: 205px;
          }

          .fb-card-main {
            padding: 24px 20px;
          }

          .fb-card-summary {
            grid-template-columns: 1fr;
          }

          .fb-card-user {
            display: none;
          }
        }

        @media(max-width:600px) {
          .fb-card-page {
            display: block;
          }

          .fb-card-sidebar {
            width: 100%;
            min-height: auto;
          }

          .fb-card-nav {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .fb-card-logout {
            margin-top: 15px;
          }

          .fb-card-main {
            padding: 20px 14px;
          }

          .fb-card-title {
            font-size: 25px;
          }

          .fb-real-card-number {
            font-size: 17px;
          }

          .fb-real-card-limit {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="fb-card-page">

        <aside className="fb-card-sidebar">

          <div className="fb-card-brand">
            <div className="fb-card-brand-mark">F</div>

            <div>
              <h2>FinBank</h2>
              <span>Digital Banking</span>
            </div>
          </div>

          <nav className="fb-card-nav">
            {nav.map(([label, path, icon]) => (
              <button
                key={path}
                className={
                  path === '/cards'
                    ? 'active'
                    : ''
                }
                onClick={() => navigate(path)}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <button
            className="fb-card-logout"
            onClick={logout}
          >
            ↪ <span>Logout</span>
          </button>

        </aside>

        <main className="fb-card-main">

          <header className="fb-card-header">
            <div>
              <p className="fb-card-eyebrow">
                Customer Portal
              </p>

              <h1 className="fb-card-title">
                My Cards
              </h1>

              <p className="fb-card-subtitle">
                Manage your FinBank debit and credit cards
              </p>
            </div>

            <div className="fb-card-user">
              <div className="fb-card-avatar">
                A
              </div>

              <div>
                <strong>Customer</strong>
                <span>Personal Banking</span>
              </div>
            </div>
          </header>

          {loading && (
            <div className="fb-card-message">
              Loading your cards...
            </div>
          )}

          {error && (
            <div className="fb-card-message">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <section className="fb-card-summary">

                <div className="fb-card-stat">
                  <span>Total Cards</span>

                  <strong>
                    {cards.length}
                  </strong>
                </div>

                <div className="fb-card-stat">
                  <span>Active Cards</span>

                  <strong>
                    {
                      cards.filter(
                        c => c.status === 'ACTIVE'
                      ).length
                    }
                  </strong>
                </div>

                <div className="fb-card-stat">
                  <span>Total Credit Limit</span>

                  <strong>
                    {money(
                      cards.reduce(
                        (sum, c) =>
                          sum +
                          Number(
                            c.credit_limit || 0
                          ),
                        0
                      )
                    )}
                  </strong>
                </div>

              </section>

              <section className="fb-card-container">

                <h2>My Cards</h2>

                <p>
                  Your cards linked with FinBank
                </p>

                {cards.length === 0 ? (
                  <div className="fb-card-message">
                    No cards found.
                  </div>
                ) : (
                  cards.map(card => (
                    <div
                      className="fb-real-card"
                      key={card.id}
                    >

                      <div className="fb-real-card-top">

                        <div>
                          <div className="fb-real-card-type">
                            {card.card_type}
                          </div>

                          <div className="fb-real-card-variant">
                            {card.card_variant}
                          </div>
                        </div>

                        <div className="fb-real-card-chip" />

                      </div>

                      <div className="fb-real-card-number">
                        {maskCard(
                          card.card_number
                        )}
                      </div>

                      <div className="fb-real-card-bottom">

                        <div>
                          <span>EXPIRES</span>

                          {card.expiry_date
                            ? new Date(
                                card.expiry_date
                              ).toLocaleDateString(
                                'en-IN',
                                {
                                  month: '2-digit',
                                  year: '2-digit',
                                }
                              )
                            : '—'}
                        </div>

                        <div>
                          <span>STATUS</span>
                          {card.status}
                        </div>

                      </div>

                    </div>
                  ))
                )}

                {cards.length > 0 && (
                  <div className="fb-real-card-limit">

                    {cards.map(card => (
                      <div
                        className="fb-limit-box"
                        key={`limit-${card.id}`}
                      >

                        <span>
                          {
                            card.card_variant ||
                            card.card_type
                          }
                        </span>

                        <strong>
                          Used:{' '}
                          {money(
                            Number(
                              card.credit_limit || 0
                            ) -
                            Number(
                              card.available_limit || 0
                            )
                          )}
                        </strong>

                        <br />

                        <span>
                          Available Credit
                        </span>

                        <strong>
                          {money(
                            card.available_limit
                          )}
                        </strong>

                      </div>
                    ))}

                  </div>
                )}

              </section>
            </>
          )}

        </main>
      </div>
    </>
  )
}

export default Cards
import { useState } from 'react'
import apiFetch from '../api'
import './AIChat.css'

type Message = {
  role: 'user' | 'assistant'
  text: string
}

function AIChat() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text:
        'Hello! I am your FinBank AI Assistant. I can help you understand your account balance, loans, EMI, credit utilization, transactions, and FinBank policies.',
    },
  ])
  const [loading, setLoading] = useState(false)

  const askQuestion = async (
    customQuestion?: string
  ) => {
    const text = (
      customQuestion ?? question
    ).trim()

    if (!text || loading) {
      return
    }

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text,
      },
    ])

    setQuestion('')
    setLoading(true)

    try {
      const response = await apiFetch(
        '/ai/customer-chat',
        {
          method: 'POST',
          body: JSON.stringify({
            question: text,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            'AI request failed'
        )
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text:
            data.answer ||
            'No answer received.',
        },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text:
            error instanceof Error
              ? error.message
              : 'Something went wrong.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault()
      askQuestion()
    }
  }

  const suggestions = [
    {
      icon: '💰',
      title: 'My Balance',
      text: 'What is my total balance?',
    },
    {
      icon: '💳',
      title: 'Credit Usage',
      text: 'How much credit have I used?',
    },
    {
      icon: '💵',
      title: 'My Loans',
      text: 'How many active loans do I have?',
    },
    {
      icon: '📅',
      title: 'Next EMI',
      text: 'What is my next EMI and when is it due?',
    },
    {
      icon: '📊',
      title: 'Transactions',
      text: 'Show my recent transactions',
    },
    {
      icon: '📄',
      title: 'Loan Policy',
      text:
        'What documents are required for a personal loan?',
    },
  ]

  const renderAnswer = (text: string) => {
    const lines = text.split('\n')

    return (
      <div className="ai-answer">

        {lines.map((line, index) => {
          const trimmed = line.trim()

          if (!trimmed) {
            return (
              <div
                key={index}
                className="answer-space"
              />
            )
          }

          if (
            trimmed.startsWith('### ') ||
            trimmed.startsWith('## ')
          ) {
            return (
              <h4 key={index}>
                {trimmed.replace(
                  /^#+\s*/,
                  ''
                )}
              </h4>
            )
          }

          if (
            trimmed.startsWith('- ') ||
            trimmed.startsWith('• ')
          ) {
            return (
              <div
                key={index}
                className="answer-list"
              >
                <span>•</span>
                <span>
                  {trimmed.replace(
                    /^[-•]\s*/,
                    ''
                  )}
                </span>
              </div>
            )
          }

          if (/^\d+\.\s/.test(trimmed)) {
            return (
              <div
                key={index}
                className="answer-list"
              >
                <span className="answer-number">
                  {trimmed.match(
                    /^\d+/
                  )?.[0]}
                </span>

                <span>
                  {trimmed.replace(
                    /^\d+\.\s*/,
                    ''
                  )}
                </span>
              </div>
            )
          }

          if (
            trimmed
              .toLowerCase()
              .startsWith('source:')
          ) {
            return (
              <div
                key={index}
                className="answer-source"
              >
                📄 {trimmed}
              </div>
            )
          }

          return (
            <p key={index}>
              {trimmed}
            </p>
          )
        })}

      </div>
    )
  }

  return (
    <div className="ai-page">

      <header className="ai-header">

        <div className="ai-header-inner">

          <div className="ai-brand">

            <div className="ai-logo">
              AI
            </div>

            <div>
              <h1>
                FinBank AI Assistant
              </h1>

              <p>
                Your Personal Banking Copilot
              </p>
            </div>

          </div>

          <div className="ai-status">
            <span className="status-dot"></span>
            AI Service Online
          </div>

        </div>

      </header>

      <main className="ai-container">

        <section className="ai-intro">

          <h2>
            How can I help you?
          </h2>

          <p>
            Ask questions about your accounts,
            loans, EMI, credit, transactions or
            FinBank policies.
          </p>

        </section>

        <section className="quick-section">

          <div className="section-title">
            Quick Actions
          </div>

          <div className="quick-grid">

            {suggestions.map((item) => (
              <button
                key={item.title}
                className="quick-card"
                onClick={() =>
                  askQuestion(item.text)
                }
                disabled={loading}
              >

                <div className="quick-icon">
                  {item.icon}
                </div>

                <div className="quick-title">
                  {item.title}
                </div>

                <div className="quick-text">
                  {item.text}
                </div>

              </button>
            ))}

          </div>

        </section>

        <section className="chat-card">

          <div className="chat-header">

            <div className="chat-brand">

              <div className="chat-ai-icon">
                AI
              </div>

              <div>
                <h3>
                  FinBank Personal Assistant
                </h3>

                <p>
                  Account insights & banking guidance
                </p>
              </div>

            </div>

            <div className="secure-badge">
              🔒 Secure Banking Session
            </div>

          </div>

          <div className="messages-area">

            {messages.map(
              (message, index) => (

                <div
                  key={index}
                  className={
                    message.role === 'user'
                      ? 'message-row user-row'
                      : 'message-row'
                  }
                >

                  <div
                    className={
                      message.role === 'user'
                        ? 'avatar user-avatar'
                        : 'avatar ai-avatar'
                    }
                  >
                    {message.role === 'user'
                      ? 'You'
                      : 'AI'}
                  </div>

                  <div
                    className={
                      message.role === 'user'
                        ? 'message user-message'
                        : 'message ai-message'
                    }
                  >

                    {message.role ===
                    'assistant'
                      ? renderAnswer(
                          message.text
                        )
                      : message.text}

                  </div>

                </div>

              )
            )}

            {loading && (

              <div className="message-row">

                <div className="avatar ai-avatar">
                  AI
                </div>

                <div className="message ai-message loading-message">

                  <span>
                    FinBank AI is thinking
                  </span>

                  <span className="typing-dots">
                    <i></i>
                    <i></i>
                    <i></i>
                  </span>

                </div>

              </div>

            )}

          </div>

          <div className="chat-input-area">

            <div className="input-wrapper">

              <input
                value={question}
                onChange={(event) =>
                  setQuestion(
                    event.target.value
                  )
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask about your account, loan, EMI, card or transactions..."
                disabled={loading}
              />

              <button
                className="ask-button"
                onClick={() => askQuestion()}
                disabled={
                  loading ||
                  !question.trim()
                }
              >
                {loading
                  ? 'Thinking...'
                  : 'Ask AI'}
              </button>

            </div>

            <div className="input-footer">

              <span>
                Enter to send
              </span>

              <span>
                FinBank Demo Environment
              </span>

            </div>

          </div>

        </section>

      </main>

    </div>
  )
}

export default AIChat
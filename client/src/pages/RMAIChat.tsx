import { useState } from 'react'
import axios from 'axios'
import './RMAIChat.css'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

const RMAIChat = () => {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am your FinBank RM Assistant. I can help you analyze assigned customers, upcoming EMIs, credit utilization, active loans, pending service requests, and FinBank policies.',
    },
  ])

  const askAI = async (customQuestion?: string) => {
    const userQuestion = (
      customQuestion ?? question
    ).trim()

    if (!userQuestion || loading) return

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userQuestion,
      },
    ])

    setQuestion('')
    setLoading(true)

    try {
      const token =
        localStorage.getItem('finbank_token')

      const response = await axios.post(
        'http://localhost:5000/api/ai/rm-chat',
        {
          question: userQuestion,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const answer =
        response.data?.answer ||
        'I could not generate a response.'

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: answer,
        },
      ])
    } catch (error: any) {
      console.error('RM AI error:', error)

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            error.response?.data?.message ||
            'Something went wrong while contacting the AI service.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault()
      askAI()
    }
  }

  const suggestions = [
    {
      icon: '👥',
      title: 'Assigned Customers',
      text: 'Show my assigned customers',
    },
    {
      icon: '📅',
      title: 'Upcoming EMI',
      text: 'Which customers have EMI due in next 7 days?',
    },
    {
      icon: '💳',
      title: 'Credit Risk',
      text: 'Show customers with credit utilization above 80%',
    },
    {
      icon: '📋',
      title: 'Service Requests',
      text: 'Show pending service requests',
    },
    {
      icon: '💰',
      title: 'Active Loans',
      text: 'Which customers have active loans?',
    },
    {
      icon: '📄',
      title: 'Loan Policy',
      text: 'What documents are required for a personal loan?',
    },
  ]

  const renderAnswer = (content: string) => {
    const lines = content.split('\n')

    return (
      <div className="ai-answer-content">
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
                {trimmed.replace(/^#+\s*/, '')}
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
                className="answer-list-item"
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
                className="answer-list-item"
              >
                <span className="number-dot">
                  {trimmed.match(/^\d+/)?.[0]}
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
            trimmed.toLowerCase().startsWith(
              'source:'
            )
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
    <div className="rm-ai-page">

      <header className="rm-ai-header">
        <div className="rm-ai-header-inner">

          <div className="rm-ai-brand">

            <div className="rm-ai-logo">
              AI
            </div>

            <div>
              <h1>
                RM AI Assistant
              </h1>

              <p>
                Relationship Manager Copilot
              </p>
            </div>

          </div>

          <div className="rm-ai-status">
            <span className="status-dot"></span>
            AI Service Online
          </div>

        </div>
      </header>

      <main className="rm-ai-container">

        <section className="rm-ai-intro">

          <h2>
            Customer Intelligence
          </h2>

          <p>
            Ask questions about your assigned
            customer portfolio, loans, EMIs,
            credit utilization and policies.
          </p>

        </section>

        <section className="quick-section">

          <div className="section-title">
            Quick Insights
          </div>

          <div className="quick-grid">

            {suggestions.map((item) => (

              <button
                key={item.title}
                className="quick-card"
                onClick={() =>
                  askAI(item.text)
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
                  FinBank RM Copilot
                </h3>

                <p>
                  Customer insights & portfolio
                  analysis
                </p>

              </div>

            </div>

            <div className="secure-badge">
              🔒 Secure RM Workspace
            </div>

          </div>

          <div className="messages-area">

            {messages.map((message, index) => (

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
                    ? 'RM'
                    : 'AI'}
                </div>

                <div
                  className={
                    message.role === 'user'
                      ? 'message user-message'
                      : 'message ai-message'
                  }
                >
                  {message.role === 'assistant'
                    ? renderAnswer(
                        message.content
                      )
                    : message.content}
                </div>

              </div>

            ))}

            {loading && (

              <div className="message-row">

                <div className="avatar ai-avatar">
                  AI
                </div>

                <div className="message ai-message loading-message">

                  <span>
                    Analyzing portfolio
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

              <textarea
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask about your assigned customers..."
                rows={2}
                disabled={loading}
              />

              <button
                className="ask-button"
                onClick={() => askAI()}
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
                Enter to send • Shift + Enter
                for new line
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

export default RMAIChat
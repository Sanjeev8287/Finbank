const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL ||
  'http://127.0.0.1:8000'

// ========================================
// HELPER
// ========================================

const readAIResponse = async (response) => {
  const contentType =
    response.headers.get('content-type') || ''

  const responseText = await response.text()

  let data = null

  if (
    contentType.includes('application/json')
  ) {
    try {
      data = JSON.parse(responseText)
    } catch (error) {
      console.error(
        'AI service returned invalid JSON:',
        responseText.slice(0, 1000)
      )
    }
  } else {
    console.error(
      'AI service returned non-JSON response:',
      {
        status: response.status,
        contentType,
        body: responseText.slice(0, 1000),
      }
    )
  }

  return {
    data,
    responseText,
    contentType,
  }
}

// ========================================
// CUSTOMER AI
// ========================================

const askCustomerAI = async (req, res) => {
  try {
    const customerId = Number(
      req.user?.customerId
    )

    if (
      !Number.isInteger(customerId) ||
      customerId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Customer account is not linked',
      })
    }

    const { question } = req.body

    if (
      !question ||
      typeof question !== 'string' ||
      !question.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Question is required',
      })
    }

    console.log(
      'Calling Customer AI:',
      `${AI_SERVICE_URL}/ai/chat`
    )

    const response = await fetch(
      `${AI_SERVICE_URL}/ai/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          question: question.trim(),
        }),
      }
    )

    const {
      data,
      responseText,
      contentType,
    } = await readAIResponse(response)

    console.log(
      'Customer AI response:',
      response.status,
      contentType
    )

    if (!response.ok) {
      console.error(
        'AI service customer error:',
        responseText.slice(0, 1000)
      )

      return res.status(502).json({
        success: false,
        message:
          data?.detail ||
          data?.message ||
          'AI service failed',
      })
    }

    if (!data) {
      return res.status(502).json({
        success: false,
        message:
          'AI service returned an invalid response',
      })
    }

    return res.json({
      success: true,
      answer:
        data.answer ||
        data.response ||
        'I could not generate a response.',
    })
  } catch (error) {
    console.error(
      'Customer AI error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Failed to process AI request',
    })
  }
}

// ========================================
// RM AI
// ========================================

const askRMAI = async (req, res) => {
  try {
    const relationshipManagerId = Number(
      req.user?.relationshipManagerId
    )

    if (
      !Number.isInteger(
        relationshipManagerId
      ) ||
      relationshipManagerId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Relationship manager account is not linked',
      })
    }

    const { question } = req.body

    if (
      !question ||
      typeof question !== 'string' ||
      !question.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Question is required',
      })
    }

    const aiEndpoint =
      `${AI_SERVICE_URL}/ai/rm-chat`

    console.log(
      'Calling RM AI:',
      aiEndpoint
    )

    const response = await fetch(
      aiEndpoint,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          relationship_manager_id:
            relationshipManagerId,
          question: question.trim(),
        }),
      }
    )

    const {
      data,
      responseText,
      contentType,
    } = await readAIResponse(response)

    console.log(
      'RM AI response:',
      response.status,
      contentType
    )

    if (!response.ok) {
      console.error(
        'AI service RM error:',
        responseText.slice(0, 1000)
      )

      return res.status(502).json({
        success: false,
        message:
          data?.detail ||
          data?.message ||
          'AI service failed',
      })
    }

    if (!data) {
      return res.status(502).json({
        success: false,
        message:
          'AI service returned an invalid response',
      })
    }

    return res.json({
      success: true,
      answer:
        data.answer ||
        data.response ||
        'I could not generate a response.',
    })
  } catch (error) {
    console.error(
      'RM AI error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Failed to process RM AI request',
    })
  }
}

module.exports = {
  askCustomerAI,
  askRMAI,
}
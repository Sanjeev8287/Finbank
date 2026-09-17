const askCustomerAI = async (req, res) => {
  try {
    const customerId = Number(req.user?.customerId)

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer account is not linked',
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

    const response = await fetch(
      'http://127.0.0.1:8000/ai/chat',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          question: question.trim(),
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        message: 'AI service failed',
      })
    }

    return res.json({
      success: true,
      answer: data.answer,
    })
  } catch (error) {
    console.error(
      'Customer AI error:',
      error.message
    )

    return res.status(500).json({
      success: false,
      message: 'Failed to process AI request',
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
      !Number.isInteger(relationshipManagerId) ||
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

    const response = await fetch(
      'http://127.0.0.1:8000/ai/rm-chat',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          relationship_manager_id:
            relationshipManagerId,
          question: question.trim(),
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error(
        'AI service RM error:',
        data
      )

      return res.status(502).json({
        success: false,
        message: 'AI service failed',
      })
    }

    return res.json({
      success: true,
      answer: data.answer,
    })
  } catch (error) {
    console.error(
      'RM AI error:',
      error.message
    )

    return res.status(500).json({
      success: false,
      message: 'Failed to process RM AI request',
    })
  }
}


module.exports = {
  askCustomerAI,
  askRMAI,
}
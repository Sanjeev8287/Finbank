const pool = require('../db')

const getRMCards = async (req, res) => {
  try {
    const rmId = req.user.relationshipManagerId

    const result = await pool.query(`
      SELECT
        cd.*,
        c.customer_code,
        c.full_name AS customer_name
      FROM cards cd
      INNER JOIN customers c ON c.id = cd.customer_id
      WHERE c.relationship_manager_id = $1
      ORDER BY cd.id DESC
    `, [rmId])

    res.json({
      success: true,
      cards: result.rows
    })
  } catch (error) {
    console.error('Get RM cards error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cards'
    })
  }
}

const getRMCardById = async (req, res) => {
  try {
    const rmId = req.user.relationshipManagerId
    const cardId = Number(req.params.id)

    const result = await pool.query(`
      SELECT
        cd.*,
        c.customer_code,
        c.full_name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone
      FROM cards cd
      INNER JOIN customers c ON c.id = cd.customer_id
      WHERE cd.id = $1
      AND c.relationship_manager_id = $2
    `, [cardId, rmId])

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      })
    }

    res.json({
      success: true,
      card: result.rows[0]
    })
  } catch (error) {
    console.error('Get RM card error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch card'
    })
  }
}

module.exports = {
  getRMCards,
  getRMCardById
}
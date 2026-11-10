const { Router } = require('express')
const healthController = require('../controllers/healthController')
const playerRoutes = require('./playerRoutes')

const router = Router()

router.get('/health', healthController.check)
router.use('/players', playerRoutes)

module.exports = router

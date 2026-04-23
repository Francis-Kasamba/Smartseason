import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requirePasswordResetCompleted } from '../middleware/passwordResetGuard.js'
import { getDashboard } from '../controllers/dashboardController.js'

const router = Router()

router.use(authenticate)
router.use(requirePasswordResetCompleted)
router.get('/', getDashboard)

export default router

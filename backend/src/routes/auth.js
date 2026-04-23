import { Router } from 'express'
import { login, logout, me, resetPasswordFirstLogin } from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.post('/login', login)
router.post('/reset-password-first-login', authenticate, resetPasswordFirstLogin)
router.post('/logout', authenticate, logout)
router.get('/me', authenticate, me)

export default router

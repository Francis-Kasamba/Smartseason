import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requirePasswordResetCompleted } from '../middleware/passwordResetGuard.js'
import { requireRole } from '../middleware/requireRole.js'
import { listAgents, createAgent, updateAgent, deleteAgent } from '../controllers/userController.js'

const router = Router()

router.use(authenticate, requirePasswordResetCompleted, requireRole('admin'))
router.get('/',  listAgents)
router.post('/', createAgent)
router.put('/:id', updateAgent)
router.delete('/:id', deleteAgent)

export default router

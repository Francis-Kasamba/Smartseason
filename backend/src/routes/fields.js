import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requirePasswordResetCompleted } from '../middleware/passwordResetGuard.js'
import { requireRole } from '../middleware/requireRole.js'
import {
  listFields, createFieldHandler, getField,
  updateFieldHandler, deleteFieldHandler,
  updateStageHandler, listUpdates, addNoteHandler, editNoteHandler,
} from '../controllers/fieldController.js'

const router = Router()

router.use(authenticate)
router.use(requirePasswordResetCompleted)

router.get('/',        listFields)
router.post('/',       requireRole('admin'), createFieldHandler)
router.get('/:id',     getField)
router.put('/:id',     requireRole('admin'), updateFieldHandler)
router.delete('/:id',  requireRole('admin'), deleteFieldHandler)
router.patch('/:id/stage',   updateStageHandler)
router.get('/:id/updates',   listUpdates)
router.post('/:id/updates',  addNoteHandler)
router.patch('/:id/updates/:updateId', editNoteHandler)

export default router

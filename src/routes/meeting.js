import { Router } from 'express';
import { authenticate, authorize } from '../security/authMiddleware.js';
import { listMeetings, createMeeting, removeMeeting } from '../controllers/meetingController.js';

const router = Router();
router.use(authenticate, authorize(['admin']));

router.get('/', listMeetings);
router.post('/', createMeeting);
router.delete('/:id', removeMeeting);

export default router;





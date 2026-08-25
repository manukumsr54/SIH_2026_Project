import { Router } from 'express';
import { db } from '../db/database.js';

export const notificationsRouter = Router();

// GET /api/notifications
notificationsRouter.get('/', (req, res) => {
  const notifications = db.store.notifications || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  res.json({
    success: true,
    data: notifications,
    meta: {
      total: notifications.length,
      unreadCount
    }
  });
});

// PATCH /api/notifications/:id/read
notificationsRouter.patch('/:id/read', (req, res) => {
  const notif = (db.store.notifications || []).find(n => n.id === req.params.id);
  if (!notif) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOTIFICATION_NOT_FOUND', message: 'Notification not found' }
    });
  }

  notif.isRead = true;
  db.saveToDisk();

  res.json({
    success: true,
    data: notif
  });
});

// POST /api/notifications/read-all
notificationsRouter.post('/read-all', (req, res) => {
  (db.store.notifications || []).forEach(n => {
    n.isRead = true;
  });
  db.saveToDisk();

  res.json({
    success: true,
    meta: { message: 'All notifications marked as read' }
  });
});

const { connectionPromise } = require("../database/conn");

const createNotification = async (title, msg, event_id) => {
  return new Promise((resolve, reject) => {
    if (!event_id || !title || !msg) {
      reject(new Error("All fields are required"));
    }
    connectionPromise.execute(
      `
      INSERT INTO notifications (title, message, event_id) VALUES (?,?,?)
      `,
      [title, msg, event_id],
      async (err, result) => {
        if (err) {
          console.log(err.message);
          return reject(new Error(err.message));
        }

        if (result && result.insertId) {
          const data = await getNotificationById(result.insertId);
          resolve(data);
        } else {
          reject(new Error("Failed to create notification"));
        }
      }
    );
  });
};

const getNotificationById = async (id) => {
  return new Promise((resolve, reject) => {
    if (!id) {
      return reject(new Error("Notification ID is required"));
    }

    connectionPromise.execute(
      `
      SELECT * FROM notifications WHERE id = ?
      `,
      [id],
      (err, result) => {
        if (err) {
          console.log(err.message);
          return reject(new Error(err.message));
        }

        if (result.length > 0) {
          resolve(result[0]);
        } else {
          reject(new Error("Notification not found."));
        }
      }
    );
  });
};

const getNotificationsByEventId = async (id) => {
  return new Promise((resolve, reject) => {
    if (!id) {
      return reject(new Error("Event ID is required"));
    }

    connectionPromise.execute(
      `
      SELECT * FROM notifications WHERE event_id = ? ORDER BY created_at DESC
      `,
      [id],
      (err, result) => {
        if (err) {
          console.log(err.message);
          return reject(new Error(err.message));
        }

        resolve(result);
      }
    );
  });
};

const getNotificationsByUserId = async (id, datetime) => {
  return new Promise((resolve, reject) => {
    if (!id) {
      return reject(new Error("User ID is required"));
    }

    let sql = `
      SELECT n.*
      FROM notifications n
      WHERE n.event_id IN (
        SELECT e.id
        FROM events e
        JOIN user_events ue ON e.id = ue.event_id
        WHERE ue.user_id = ?
      )
      `
    let values = [id]
    if (datetime) {
      sql += `AND n.created_at >= ?`;
      values.push(datetime)
    }
    connectionPromise.execute(
      sql,
      values,
      (err, result) => {
        if (err) {
          console.log(err.message);
          return reject(new Error(err.message));
        }

        resolve(result);
      }
    );
  });
};

module.exports = {
  createNotification,
  getNotificationById,
  getNotificationsByEventId,
  getNotificationsByUserId,
};

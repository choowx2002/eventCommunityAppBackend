const { connectionPromise } = require("../database/conn");

const createEvent = async (
  title,
  description,
  start_time,
  end_time,
  start_date,
  end_date,
  image_path,
  admin_id,
  participants_limit,
  address,
  postcode,
  state,
  city,
  category_id
) => {
  return new Promise((resolve, reject) => {
    if (!title || !start_date || !admin_id) {
      return reject(new Error("Title, start date, and admin ID are required"));
    }

    connectionPromise.execute(
      `
      INSERT INTO events (title, description, start_time, end_time, start_date, end_date, image_path, admin_id, participants_limit, address, postcode, state, city, category_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        description,
        start_time,
        end_time,
        start_date,
        end_date,
        image_path,
        admin_id,
        participants_limit,
        address,
        postcode,
        state,
        city,
        category_id,
      ],
      async (err, result) => {
        if (err) {
          console.log(err.message);
          return reject(new Error(err.message));
        }

        if (result && result.insertId) {
          const data = await getEventById(result.insertId);
          resolve(data);
        } else {
          reject(new Error("Failed to create event"));
        }
      }
    );
  });
};

const getEvents = async () => {
  return new Promise((resolve, reject) => {
    connectionPromise.execute(
      `
        SELECT
            e.*,
            COALESCE(ue.participant, 0) AS participant,
            c.name as category_name
        FROM EVENTS
            e
        LEFT JOIN(
            SELECT
                event_id,
                COUNT(*) AS participant
            FROM
                user_events ue
            GROUP BY
                event_id
        ) ue
        ON
            e.id = ue.event_id
        LEFT JOIN(
            SELECT
                c.name,
                c.id
            FROM
                categories c
        ) c
        ON
            e.category_id = c.id;
      `,
      [],
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

const getEventById = async (id) => {
  return new Promise((resolve, reject) => {
    if (!id) {
      return reject(new Error("Event ID is required"));
    }

    connectionPromise.execute(
      `
      SELECT
            *,
            (
            SELECT
                COUNT(id)
            FROM
                user_events
        ) AS participants,
        (
            SELECT
                categories.name
            FROM
                categories
            WHERE
                categories.id = EVENTS.category_id
        ) AS category_name
        FROM EVENTS
        WHERE
            id = ?;
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
          reject(new Error("Event not found."));
        }
      }
    );
  });
};

const updateEventById = async (
  id,
  title,
  description,
  start_time,
  end_time,
  start_date,
  end_date,
  image_path,
  admin_id,
  participants_limit,
  address,
  postcode,
  state,
  city,
  category_id
) => {
  return new Promise((resolve, reject) => {
    if (!id) {
      return reject(new Error("Event ID is required"));
    }

    connectionPromise.execute(
      `
      UPDATE events
      SET title = ?, description = ?, start_time = ?, end_time = ?, start_date = ?, end_date = ?, image_path = ?, admin_id = ?, participants_limit = ?, address = ?, postcode = ?, state = ?, city = ?, category_id = ?
      WHERE id = ?
      `,
      [
        title,
        description,
        start_time,
        end_time,
        start_date,
        end_date,
        image_path,
        admin_id,
        participants_limit,
        address,
        postcode,
        state,
        city,
        category_id,
        id,
      ],
      (err, result) => {
        if (err) {
          console.log(err.message);
          return reject(new Error(err.message));
        }

        if (result.affectedRows === 0) {
          return reject(new Error("Event not found"));
        }

        resolve("Event updated successfully");
      }
    );
  });
};

const deleteEventById = async (id, userId) => {
  return new Promise((resolve, reject) => {
    if (!id) {
      return reject(new Error("Event ID is required"));
    }

    connectionPromise.execute(
      `
      DELETE FROM events WHERE id = ? AND admin_id = ?
      `,
      [id, userId],
      (err, result) => {
        if (err) {
          console.log(err.message);
          return reject(new Error(err.message));
        }

        if (result.affectedRows === 0) {
          return reject(
            new Error("Event not found or User not event's admin.")
          );
        }

        resolve("Event deleted successfully");
      }
    );
  });
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEventById,
  deleteEventById,
};

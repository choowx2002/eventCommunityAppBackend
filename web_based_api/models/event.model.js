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
    if (
      !title ||
      !start_time ||
      !end_time ||
      !start_date ||
      !end_date ||
      !admin_id ||
      !participants_limit ||
      !address ||
      !postcode ||
      !state ||
      !city ||
      !category_id
    ) {
      return reject(new Error("lack with required data."));
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

const getEvents = async (limit = 12) => {
  return new Promise((resolve, reject) => {
    let sql = `
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
            e.category_id = c.id
      `;
    let values;
    if (limit) {
      sql += `LIMIT ?`;
      values = limit;
    }

    connectionPromise.execute(sql, [values || ""], (err, result) => {
      if (err) {
        console.log(err.message);
        return reject(new Error(err.message));
      }

      resolve(result);
    });
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
                WHERE user_events.event_id = ?
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
      [id, id],
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

    if (
      !title ||
      !start_time ||
      !end_time ||
      !start_date ||
      !end_date ||
      !admin_id ||
      !participants_limit ||
      !address ||
      !postcode ||
      !state ||
      !city ||
      !category_id
    ) {
      return reject(new Error("Lack with required data."));
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
      async (err, result) => {
        if (err) {
          console.log(err.message);
          return reject(new Error(err.message));
        }

        if (result.affectedRows === 0) {
          return reject(new Error("Event not found"));
        }

        const data = await getEventById(id);
        resolve(data);
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

const getEventsByCatId = async (cat_id, limit = 5) => {
  return new Promise((resolve, reject) => {
    if (!cat_id) reject(new Error("category is required"));
    let sql = `
    SELECT * 
    FROM events 
    WHERE events.category_id = ? LIMIT ?;
    `;

    connectionPromise.execute(sql, [cat_id, limit], (err, result) => {
      if (err) reject(new Error(err.message));
      resolve(result);
    });
  });
};

const getEventsByState = async (state, limit = 5) => {
  return new Promise((resolve, reject) => {
    if (!state) reject(new Error("state required"));
    let sql = `
    SELECT * 
    FROM events 
    WHERE state LIKE ? LIMIT ?;
    `;

    connectionPromise.execute(sql, [state, limit], (err, result) => {
      if (err) reject(new Error(err.message));
      resolve(result);
    });
  });
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEventById,
  deleteEventById,
  getEventsByCatId,
  getEventsByState,
};

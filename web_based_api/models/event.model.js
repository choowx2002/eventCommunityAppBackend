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
            COALESCE(ue.participant, 0) AS participants,
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
        ORDER BY e.created_at DESC
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

const getEventsByTitle = async (title) => {
  return new Promise((resolve, reject) => {
    if (!title) reject(new Error("title is required"));
    let sql = `
    SELECT *, (
            SELECT
                COUNT(id)
            FROM
                user_events
                WHERE user_events.event_id = events.id
        ) AS participants
    FROM events 
    WHERE title LIKE ? ORDER BY created_at DESC;
    `;
    connectionPromise.execute(sql, [`%${title}%`], (err, result) => {
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
      if (err) return reject(new Error(err.message));
      resolve(result);
    });
  });
};

const joinEvent = async (uid, eid) => {
  return new Promise(async (resolve, reject) => {
    if (!uid || !eid) {
      reject(new Error("user id and event id is missing"));
    }
    try {
      const isJoin = await checkIsJoin(uid, eid);
      if (isJoin) {
        resolve({
          status: "fail",
          data: { message: "User already joined event before." },
        });
        return
      }
      const event = await getEventById(eid);
      if (!event) {
        resolve({ status: "fail", data: { message: "Event not found." } });
        return;
      }
      if (event?.participants * 1 >= event.participants_limit * 1) {
        resolve({ status: "fail", data: { message: "Event is full." } });
        return;
      }
      if (
        event?.end_date &&
        new Date(Date.now()) >= new Date(event?.end_date)
      ) {
        resolve({
          status: "fail",
          data: { message: "Event has ended at." + new Date(event.end_date) },
        });
        return;
      }

      const insertSql = `INSERT INTO user_events (user_id, event_id) VALUES ( ?, ?); `;
      connectionPromise.execute(insertSql, [uid, eid], (err, res) => {
        if (err) reject(new Error(err.message));
        resolve({
          status: "success",
          data: { message: "User successfully join the event" },
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};

const checkIsJoin = async (uid, eid) => {
  return new Promise((resolve, reject) => {
    if (!uid || !eid) {
      return reject(new Error("user id and event id is missing"));
    }

    const checkSql = `SELECT id FROM user_events WHERE user_id = ? AND event_id = ?`;

    connectionPromise.execute(checkSql, [uid, eid], (err, result) => {
      if (err) reject(new Error(err.message));
      return resolve(result && result.length > 0);
    });
  });
};

const leaveEvent = async (uid, eid) => {
  return new Promise((resolve, reject) => {
    if (!uid || !eid) {
      reject(new Error("user id and event id is missing"));
    }

    connectionPromise.execute(
      `
      DELETE FROM user_events WHERE user_id = ? AND event_id = ?
      `,
      [uid, eid],
      (err, result) => {
        if (err) {
          console.log(err.message);
          return reject(new Error(err.message));
        }

        if (result.affectedRows === 0) {
          return reject(new Error("User not join event before."));
        }

        resolve("User leaves event successfully");
      }
    );
  });
};

const _getEventUpadateDateById = async (id) => {
  return new Promise((resolve, reject) => {
    if (!id) {
      return reject(new Error("Event ID is required"));
    }

    connectionPromise.execute(
      `
      SELECT
            EVENTS.id,EVENTS.updated_at
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
          resolve(result[0].updated_at);
        } else {
          reject(new Error("Event not found."));
        }
      }
    );
  });
};

const getParticipants = async (eid) => {
  return new Promise((resolve, reject) => {
    if (!eid) {
      return reject(new Error("Event ID is required"));
    }
    let sql = `
            SELECT
                u.id,
                u.first_name,
                u.last_name,
                u.gender,
                u.email
            FROM
                user_events ue
            LEFT JOIN (SELECT first_name, last_name, gender,email, id FROM users) u ON ue.user_id = u.id
            WHERE 
              ue.event_id = ?
      `;

    connectionPromise.execute(sql, [eid], (err, result) => {
      if (err) {
        console.log(err.message);
        return reject(new Error(err.message));
      }

      const res = {
        participants: result,
        count: result.length,
      };
      resolve(res);
    });
  });
};

const checkLatest = (eid, date) => {
  return new Promise(async (resolve, reject) => {
    if (!eid) reject(new Error("Event id is required"));
    if (!date || !_isIsoDate(date))
      return reject(new Error("Updated date is missing or invalid format"));
    try {
      const update_date = await _getEventUpadateDateById(eid);
      const old_date = new Date(date).toString();
      const new_date = new Date(update_date).toString();
      if (old_date === new_date) {
        return resolve({ isLatest: true });
      } else {
        const event = await getEventById(eid);
        return resolve({ isLatest: false, event });
      }
    } catch (error) {
      return reject(new Error(error.message));
    }
  });
};

//refer https://stackoverflow.com/a/52869830
const _isIsoDate = (date) => {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(date)) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime()) && d.toISOString() === date;
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEventById,
  deleteEventById,
  getEventsByCatId,
  getEventsByState,
  joinEvent,
  leaveEvent,
  checkLatest,
  checkIsJoin,
  getParticipants,
  getEventsByTitle,
};

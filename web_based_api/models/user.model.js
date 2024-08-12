const { connectionPromise } = require("../database/conn");

const createUser = async (
  email,
  password,
  first_name,
  last_name,
  birth,
  gender
) => {
  return new Promise((resolve, reject) => {
    if (!email || !password || !first_name || !last_name || !birth || !gender) {
      reject(new Error("All fields are required"));
    }

    if (!/.+@.+\..+/.test(email)) {
      reject(new Error("Invalid email format"));
    }

    connectionPromise.execute(
      `
      INSERT INTO users (email, password, first_name, last_name, birth, gender)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [email, password, first_name, last_name, birth, gender],
      (err, result) => {
        if (err) {
          console.log(err.message);
          return reject(new Error(err.message));
        }

        if (result && result.insertId) {
          resolve(result.insertId);
        } else {
          reject(new Error("Failed to insert user"));
        }
      }
    );
  });
};

const getUsers = async () => {
  return new Promise((resolve, reject) => {
    connectionPromise.execute(
      `
      SELECT * FROM users
      `,
      [],
      (err, result) => {
        if (err) {
          console.log(err.message);
          return reject(new Error(err.message));
        }

        if (result) {
          resolve(result);
        } else {
          reject(new Error("Failed to insert user"));
        }
      }
    );
  });
};

const getUserById = async (id) => {
  if (!id) {
    reject(new Error("user id is required"));
  }
  return new Promise((resolve, reject) => {
    connectionPromise.execute(
      `
      SELECT * FROM users WHERE id = ?
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
          reject(new Error("user not found."));
        }
      }
    );
  });
};

const deleteUserById = async (id) => {
  if (!id) {
    reject(new Error("user id is required"));
  }
  return new Promise((resolve, reject) => {
    connectionPromise.execute(
      `
      DELETE FROM users WHERE id = ?
      `,
      [id],
      (err, result) => {
        if (err) {
          console.log(err.message);
          return reject(new Error(err.message));
        }

        if (result.affectedRows === 0) {
          return reject(new Error("User not found"));
        }

        resolve("User deleted successfully");
      }
    );
  });
};

const getUserEvents = async (id, type) => {
  if (!id) {
    throw new Error("User ID is required");
  }

  let sql;

  switch (type) {
    case "own":
      sql = `
        SELECT * FROM events
        WHERE admin_id = ?
      `;
      break;
    case "pass":
      sql = `
        SELECT * FROM user_events
        JOIN events ON user_events.event_id = events.id
        WHERE user_events.user_id = ? AND events.end_date < CURRENT_DATE
      `;
      break;
    case "active":
      sql = `
        SELECT * FROM user_events
        JOIN events ON user_events.event_id = events.id
        WHERE user_events.user_id = ? AND events.start_date <= CURRENT_DATE AND events.end_date >= CURRENT_DATE
      `;
      break;
    default:
      throw new Error("Invalid event type");
  }

  return new Promise((resolve, reject) => {
    connectionPromise.execute(sql, [id], (err, result) => {
      if (err) {
        console.log(err.message);
        return reject(new Error(err.message));
      }

      resolve(result);
    });
  });
};


module.exports = {
  createUser,
  getUsers,
  getUserById,
  deleteUserById,
  getUserEvents,
};

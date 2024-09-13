const { connectionPromise } = require("../database/conn");
const { getCategorieByUId } = require("./category.model");

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
      return reject(new Error("All fields are required"));
    }

    if (!/.+@.+\..+/.test(email)) {
      return reject(new Error("Invalid email format"));
    }

    connectionPromise.execute(
      `
      INSERT INTO users (email, password, first_name, last_name, birth, gender)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [email, password, first_name, last_name, birth, gender],
      async (err, result) => {
        if (err) {
          console.log(err.message);
          return reject(new Error(err.message));
        }
        if (result && result.insertId) {
          const data = await getUserById(result.insertId);
          resolve(data);
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
  return new Promise((resolve, reject) => {
    if (!id) {
      reject(new Error("user id is required"));
    }
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

const getUserByEmail = async (email) => {
  return new Promise((resolve, reject) => {
    if (!email) {
      reject(new Error("user email is required"));
    }
    connectionPromise.execute(
      `
      SELECT * FROM users WHERE email = ?
      `,
      [email],
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

const updateUser = async (user_id, first_name, last_name, birth, gender) => {
  return new Promise((resolve, reject) => {
    if (!user_id || !first_name || !last_name || !birth || !gender) {
      return reject(new Error("All fields are required"));
    }

    connectionPromise.execute(
      `
      UPDATE users 
      SET first_name = ?, last_name = ?, birth = ?, gender = ?
      WHERE id = ?
      `,
      [first_name, last_name, birth, gender, user_id],
      async (err, result) => {
        if (err) {
          console.log(err.message);
          return reject(new Error(err.message));
        }
        if (result && result.affectedRows > 0) {
          const data = await getUserById(user_id);
          resolve(data);
        } else {
          reject(new Error("Failed to update user"));
        }
      }
    );
  });
};

const updatePassword = async (user_id, new_password) => {
  return new Promise((resolve, reject) => {
    if (!user_id || !new_password) {
      return reject(new Error("User ID and new password are required"));
    }

    connectionPromise.execute(
      `
      UPDATE users 
      SET password = ?
      WHERE id = ?
      `,
      [new_password, user_id],
      async (err, result) => {
        if (err) {
          console.log(err.message);
          return reject(new Error(err.message));
        }
        if (result && result.affectedRows > 0) {
          const data = await getUserById(user_id);
          resolve(data);
        } else {
          reject(new Error("Failed to update password"));
        }
      }
    );
  });
};


const deleteUserById = async (id) => {
  return new Promise((resolve, reject) => {
    if (!id) {
      reject(new Error("user id is required"));
    }
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
      sql = `SELECT *, (
            SELECT
                COUNT(id)
            FROM
                user_events
                WHERE user_events.event_id = events.id
        ) AS participants
    FROM events 
    WHERE admin_id = ? ORDER BY created_at DESC;
    `;
      break;
    case "past":
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
        WHERE user_events.user_id = ? AND events.end_date >= CURRENT_DATE
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

const updateCategories = (id, cat_ids) => {
  return new Promise((resolve, reject) => {
    if (!id) {
      return reject(new Error("User ID is required"));
    }

    let sql = `DELETE FROM user_categories WHERE user_id = ?;`;

    connectionPromise.execute(sql, [id], async (err, result) => {
      if (err) {
        console.log(err.message);
        return reject(new Error(err.message));
      }

      if (cat_ids.length > 0) {
        const cat_values = cat_ids
          .map((cat_id) => {
            return `(${id}, ${cat_id})`;
          })
          .join(", ");

        sql = ` INSERT INTO user_categories (user_id, category_id) VALUES ${cat_values};`;
      }
      connectionPromise.execute(sql, [], async (err, result) => {
        if (err) {
          console.log(err.message);
          return reject(new Error(err.message));
        }
        if (result.affectedRows === 0) {
          return reject(new Error("User not found"));
        }
        const data = await getCategorieByUId(id);
        resolve(data);
      });
    });
  });
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  deleteUserById,
  getUserEvents,
  updateCategories,
  updateUser,
  updatePassword,
  getUserByEmail,
};

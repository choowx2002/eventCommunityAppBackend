const { connectionPromise } = require("../database/conn");

const getCategories = () => {
  return new Promise((resolve, reject) => {
    connectionPromise.execute(`Select c.id, c.name FROM categories c`, [], (err, result) => {
      if (err) reject(new Error(err.message));
      resolve(result);
    });
  });
};

const getCategorieNameById = (id) => {
  return new Promise((resolve, reject) => {
    connectionPromise.execute(`Select id, name FROM categories WHERE id = ?`, [id], (err, result) => {
      if (err) reject(new Error(err.message));
      resolve(result);
    });
  });
};

const getCategorieByUId = (id) => {
  return new Promise((resolve, reject) => {
    connectionPromise.execute(
      `SELECT
   c.id,
   c.name
    FROM
        categories c
    JOIN(
        SELECT
            uc.user_id,
            uc.category_id
        FROM
            user_categories uc
        WHERE
            uc.user_id = ?
    ) user_categories
    ON
      c.id = user_categories.category_id;`,
      [id],
      (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(result);
      }
    );
  });
};

module.exports = {
  getCategories,
  getCategorieNameById,
  getCategorieByUId,
};

const express = require("express");
const {
  getUsers,
  createUser,
  getUserById,
  deleteUserById,
  getUserEvents,
  updateCategories,
  updateUser,
  updatePassword,
  getUserByEmail,
} = require("../models/user.model");
const { getCategorieByUId } = require("../models/category.model");
const router = express.Router();

// create user
router.post("/create", async (req, res) => {
  const { email, password, first_name, last_name, birth, gender } = req.body;

  try {
    const user = await createUser(
      email,
      password,
      first_name,
      last_name,
      birth,
      gender
    );
    res.status(201).send({ status: "success", data: { user } });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
});

//get all users
router.get("/all", async (req, res) => {
  try {
    const users = await getUsers();
    res.status(200).send({ status: "success", data: { users } });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
});

//get user by id
router.get("/userById/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await getUserById(userId);
    res.status(200).send({ status: "success", data: { user } });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
});

//login with gmail and password
router.post("/login", async(req, res)=>{
  const {email, password} = req.body;
  try{
    const user = await getUserByEmail(email);
    if(user && user.password === password){
      res.status(200).send({status: "success", data: {user}})
    } else {
      res.status(200).send({status: "fail", message:"email or password incorrect"})
    }
  }catch(error){
    res.status(400).send({status: "error",message: error.message });
  }
})

//update user by ID
router.put("/updateDetails/:id", async (req, res) => {
  const user_id = req.params.id;
  const { first_name, last_name, birth, gender } = req.body;

  try {
    const user = await updateUser(user_id, first_name, last_name, birth, gender);
    res.status(200).send({ status: "success", data: { user } });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
});

// Update user password by ID
router.put("/updatePassword/:id", async (req, res) => {
  const user_id = req.params.id;
  const { new_password } = req.body;

  try {
    const user = await updatePassword(user_id, new_password);
    res.status(200).send({ status: "success", data: { user } });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
});

//delete user by id
router.delete("/delete/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const message = await deleteUserById(userId);
    res.status(200).send({ status: "success", data: { message } });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
});

//get user by id and eventType
router.get("/userEvents", async (req, res) => {
  const { userId, eventType } = req.query;
  try {
    const userEvents = await getUserEvents(userId, eventType);
    res.status(200).send({ status: "success", data: { userEvents } });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
});

//add user's interest category
router.post("/updateCategories/:id", async (req, res) => {
  const { category_ids } = req.body;
  const id  = req.params.id;
  try {
    const categories = await updateCategories(id, category_ids);
    res.status(200).send({ status: "success", data: { categories } });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
});

router.get("/categories/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const categories = await getCategorieByUId(userId);
    res.status(200).send({ status: "success", data: { categories } });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
});

//get user categories
module.exports = router;

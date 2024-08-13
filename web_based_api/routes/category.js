const express = require("express");
const { getCategories } = require("../models/category.model");
const router = express.Router();

router.get('/',async (req, res)=>{
    try {
    const categories = await getCategories();
    res.status(200).send({ status: "success", data: {categories} });
  } catch (error) {
    res.status(400).send({ status:"error", message: error.message });
  }
})

module.exports = router;
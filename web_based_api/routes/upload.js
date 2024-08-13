const express = require("express");
const { upload } = require("../database/multer");
const router = express.Router();
const path = require("path");
const fs = require("fs");

router.post("/upload", (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(500).send({ status: "error", message: err.message });
    }

    if (!req.file) {
      return res
        .status(400)
        .send({ status: "error", message: "No file uploaded" });
    }

    res.status(200).send({
      status: "success",
      data: {
        message: "File uploaded successfully",
        image_path: "/image/files/" + req.file.filename,
      },
    });
  });
});

router.get("/files/:filename", (req, res) => {
  const filePath = path.join(__dirname, "../uploadfile", req.params.filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ status: "error", message: "File not found" });
    }

    res.sendFile(filePath);
  });
});

module.exports = router;

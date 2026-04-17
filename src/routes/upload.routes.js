const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const {
  uploadRoomImage,
  compressAndSave,
} = require("../middlewares/upload.middleware");

router.post(
  "/room-image",
  auth,
  requireRole(["admin", "manager"]),
  uploadRoomImage.single("image"),
  compressAndSave,
  (req, res) => {
    if (!req.uploadedFile) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Image uploaded and compressed successfully",
      data: {
        url: req.uploadedFile.url,
        filename: req.uploadedFile.filename,
      },
    });
  },
);

module.exports = router;

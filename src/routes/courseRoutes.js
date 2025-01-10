const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");

// Routes pour les cours
router.post("/", courseController.createCourse);
router.get("/stats", courseController.getCourseStats);
router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourse);
router.delete("/:id", courseController.deleteCourse);

module.exports = router;

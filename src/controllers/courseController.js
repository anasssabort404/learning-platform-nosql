const { ObjectId } = require("mongodb");
const mongoService = require("../services/mongoService");
const redisService = require("../services/redisService");

async function createCourse(req, res) {
  try {
    console.log(req.body);

    const course = {
      title: req.body.title,
      description: req.body.description,
      instructor: req.body.instructor,
      duration: req.body.duration,
      location: req.body.location,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await mongoService.insertOne("courses", course);
    await redisService.invalidateCache("courses:list");

    res.status(201).json({
      success: true,
      data: { ...course, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create course",
    });
  }
}

async function getAllCourses(req, res) {
  try {
    const cacheKey = "courses:list";

    const cachedCourses = await redisService.getCachedData(cacheKey);
    if (cachedCourses) {
      return res.json({
        success: true,
        data: cachedCourses,
        source: "cache",
      });
    }

    const courses = await mongoService.find("courses");

    await redisService.cacheData(cacheKey, courses);

    res.json({
      success: true,
      data: courses,
      source: "db",
    });
  } catch (error) {
    console.error("Error getting courses:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get courses",
    });
  }
}

async function getCourse(req, res) {
  try {
    const { id } = req.params;
    const cacheKey = `course:${id}`;

    // Try to get from cache first
    const cachedCourse = await redisService.getCachedData(cacheKey);
    if (cachedCourse) {
      return res.json({
        success: true,
        data: cachedCourse,
        source: "cache",
      });
    }

    // If not in cache, get from MongoDB
    const course = await mongoService.findOneById("courses", id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // Cache the result
    await redisService.cacheData(cacheKey, course);

    res.json({
      success: true,
      data: course,
      source: "db",
    });
  } catch (error) {
    console.error("Error getting course:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get course",
    });
  }
}

async function getCourseStats(req, res) {
  try {
    const cacheKey = "courses:stats";

    // Try to get from cache first
    const cachedStats = await redisService.getCachedData(cacheKey);
    if (cachedStats) {
      return res.json({
        success: true,
        data: cachedStats,
        source: "cache",
      });
    }

    // If not in cache, calculate stats
    const courses = await mongoService.find("courses");

    if (!courses.length) {
      return res.json({
        success: true,
        data: {
          totalCourses: 0,
          totalDuration: 0,
          locationDistribution: {},
          averageDuration: 0,
        },
      });
    }

    const stats = {
      totalCourses: courses.length,
      totalDuration: courses.reduce(
        (acc, course) => acc + (course.duration || 0),
        0
      ),
      locationDistribution: courses.reduce((acc, course) => {
        if (course.location) {
          acc[course.location] = (acc[course.location] || 0) + 1;
        }
        return acc;
      }, {}),
      averageDuration:
        courses.reduce((acc, course) => acc + (course.duration || 0), 0) /
        courses.length,
    };

    // Cache the stats
    await redisService.cacheData(cacheKey, stats, 1800); // Cache for 30 minutes

    res.json({
      success: true,
      data: stats,
      source: "db",
    });
  } catch (error) {
    console.error("Error getting course stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get course stats",
    });
  }
}

module.exports = {
  createCourse,
  getAllCourses,
  getCourse,
  getCourseStats,
};

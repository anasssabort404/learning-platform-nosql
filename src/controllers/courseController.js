const { ObjectId } = require("mongodb");
const mongoService = require("../services/mongoService");
const redisService = require("../services/redisService");

async function createCourse(req, res) {
  try {
    //R2cupération des information d'aprèr la requête
    const course = {
      title: req.body.title,
      description: req.body.description,
      instructor: req.body.instructor,
      duration: req.body.duration,
      location: req.body.location,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insertion du document
    const result = await mongoService.insertOne("courses", course);

    //Vider le cache après l'insertions pour récuperer la nouvelle liste dans la prochaine requête
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

    //Récupération de liste depuis le cache
    const cachedCourses = await redisService.getCachedData(cacheKey);

    //Si la clé existe dans le cache retourner les informations depuis le cache
    if (cachedCourses) {
      return res.json({
        success: true,
        data: cachedCourses,
        source: "cache",
      });
    }

    //Si non on va executer la requête depuis la base de données
    const courses = await mongoService.find("courses");

    //Ajouter la liste au cache
    await redisService.cacheData(cacheKey, courses);

    //retiurner la liste des cours et la source des informations
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

    // Essayer de charger les informations depuis le cache
    const cachedCourse = await redisService.getCachedData(cacheKey);
    if (cachedCourse) {
      return res.json({
        success: true,
        data: cachedCourse,
        source: "cache",
      });
    }

    // Si non recuperer depuis la base de donnees distante
    const course = await mongoService.findOneById("courses", id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // Ajouter au cache
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

    const cachedStats = await redisService.getCachedData(cacheKey);
    if (cachedStats) {
      return res.json({
        success: true,
        data: cachedStats,
        source: "cache",
      });
    }

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

    await redisService.cacheData(cacheKey, stats, 1800); // Cache pour 30 minutes

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

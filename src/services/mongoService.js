const { ObjectId } = require("mongodb");
const db = require("../config/db");

async function findOneById(collection, id) {
  try {
    const objectId = new ObjectId(id);
    return await db.getDb().collection(collection).findOne({ _id: objectId });
  } catch (error) {
    console.error(`Error finding document in ${collection}:`, error);
    throw error;
  }
}

async function insertOne(collection, document) {
  try {
    return await db.getDb().collection(collection).insertOne(document);
  } catch (error) {
    console.error(`Error inserting document into ${collection}:`, error);
    throw error;
  }
}

async function find(collection, query = {}, options = {}) {
  try {
    return await db
      .getDb()
      .collection(collection)
      .find(query, options)
      .toArray();
  } catch (error) {
    console.error(`Error finding documents in ${collection}:`, error);
    throw error;
  }
}

async function updateOne(collection, id, update) {
  try {
    const objectId = new ObjectId(id);
    return await db
      .getDb()
      .collection(collection)
      .updateOne({ _id: objectId }, { $set: update });
  } catch (error) {
    console.error(`Error updating document in ${collection}:`, error);
    throw error;
  }
}

module.exports = {
  findOneById,
  insertOne,
  find,
  updateOne,
};

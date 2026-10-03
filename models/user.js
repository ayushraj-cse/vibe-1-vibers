import { getDb } from "@/lib/mongodb";

export async function findUserByUsername(username) {
  const db = await getDb();
  return db.collection("users").findOne({ username: username.toLowerCase() });
}

export async function createUser({ name, username, passwordHash, role }) {
  const db = await getDb();
  const doc = {
    name,
    username: username.toLowerCase(),
    passwordHash,
    role,
    createdAt: new Date(),
  };
  const result = await db.collection("users").insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

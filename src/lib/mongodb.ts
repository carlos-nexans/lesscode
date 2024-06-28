import {Db, MongoClient} from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

// check the MongoDB URI
if (!MONGODB_URI) {
    throw new Error("Define the MONGODB_URI environmental variable");
}

// check the MongoDB DB
if (!MONGODB_DB) {
    throw new Error("Define the MONGODB_DB environmental variable");
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export default async function connectToDatabase(): Promise<{ db: Db, client: MongoClient }> {
    // check the cached.
    if (cachedClient && cachedDb) {
        // load from cache
        return {
            client: cachedClient,
            db: cachedDb,
        };
    }

    // Connect to cluster
    let client = new MongoClient(MONGODB_URI);
    let db = client.db(MONGODB_DB);
    // set cache
    cachedClient = client;
    cachedDb = db;

    return {
        client: cachedClient,
        db: cachedDb,
    };
}

export async function getDatabase() {
    const { db } = await connectToDatabase();
    return db;
}
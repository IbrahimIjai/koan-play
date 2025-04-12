import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Define the full user data type that will be stored
interface UserData {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  location?: string;
  token?: string | null;
  actions?: {
    followX: boolean;
    joinTelegram: boolean;
    followChannel?: boolean;
    addFrame: boolean;
  };
  timestamp: string;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const fid = url.searchParams.get("fid");

    if (!fid) {
      return Response.json(
        { success: false, error: "FID parameter is required" },
        { status: 400 },
      );
    }

    // Get user data from Redis
    const userData = await redis.hgetall(`user:${fid}`);

    // Check if user exists
    if (!userData || Object.keys(userData).length === 0) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return Response.json({ success: true, data: userData });
  } catch (error) {
    console.error("Error retrieving user data:", error);
    return Response.json(
      { success: false, error: "Failed to retrieve user data" },
      { status: 500 },
    );
  }
}
export async function POST(request: Request) {
  try {
    const data = (await request.json()) as UserData;

    // Ensure FID is a number
    const fid =
      typeof data.fid === "string" ? Number.parseInt(data.fid, 10) : data.fid;

    if (isNaN(fid)) {
      return Response.json(
        { success: false, error: "Invalid FID" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await redis.hgetall(`user:${fid}`);
    if (existingUser && Object.keys(existingUser).length > 0) {
      return Response.json(
        {
          success: true,
          message: "User already registered",
          data: existingUser,
        },
        { status: 200 },
      );
    }

    // Store user data in Redis using FID as the key
    await redis.hset(`user:${fid}`, {
      ...data,
      fid, // Ensure FID is stored as a number
      createdAt: new Date().toISOString(),
    });

    // Add user to a list of early access users
    await redis.sadd("early_access_users", fid.toString());

    return Response.json({
      success: true,
      message: "User successfully added to early access list",
    });
  } catch (error) {
    console.error("Error storing user data:", error);
    return Response.json(
      { success: false, error: "Failed to store user data" },
      { status: 500 },
    );
  }
}

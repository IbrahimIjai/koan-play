import { redis } from "@/lib/redis";


// Define the UserContext type
type UserContext = {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  location?: string; // AccountLocation type
};

// Define the full user data type that will be stored
type UserData = UserContext & {
  token?: string | null;
  actions?: {
    followX: boolean;
    joinTelegram: boolean;
    followChannel?: boolean;
    addFrame: boolean;
  };
  timestamp: string;
};

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as UserData;

    // Ensure FID is a number
    const fid =
      typeof data.fid === "string" ? Number.parseInt(data.fid, 10) : data.fid;

    if (isNaN(fid)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid FID" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
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

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error storing user data:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to store user data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

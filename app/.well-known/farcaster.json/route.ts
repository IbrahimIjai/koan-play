export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL;

  return Response.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE,
    },
    frame: {
      version: "next",
      name: "Koan Play",
      homeUrl: "https://koan-play.vercel.app",
      iconUrl: "https://koan-play.vercel.app/snake.png",
      imageUrl: "https://koan-play.vercel.app/snake.png",
      buttonTitle: `Launch Koan Play`,
      splashImageUrl: "https://koan-play.vercel.app/snake.png",
      splashBackgroundColor: `#ffffff`,
      webhookUrl: `${URL}/api/webhook`,
    },
  });
}

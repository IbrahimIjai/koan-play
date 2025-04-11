"use client";

import { useAddFrame } from "@/hooks/useAddFrame";
import { useOpenUrl } from "@/hooks/useOpenUrl";
import { useMiniKit } from "@/hooks/useMiniKit";
import { useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { Button } from "@/components/ui/button";
import ConnectButton from "@/components/connect-button";

// const SCHEMA_UID =
//   "0x7889a09fb295b0a0c63a3d7903c4f00f7896cca4fa64d2c1313f8547390b7d39";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  console.log({ frameAdded });
  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  const sendNotification = useNotification();

  const handleSendNotification = () => {
    sendNotification({
      title: "New High Score!",
      body: "Congratulations on your new high score!",
    });
  };

  const handleAddFrame = async () => {
    const result = await addFrame();
    if (result) {
      console.log("Frame added:", result.url, result.token);
      setFrameAdded(true);
    }
  };

  console.log({ setFrameReady, isFrameReady, context });
  return (
    <div className="">
      <Button onClick={handleSendNotification}>Send Notifications</Button>
      <Button onClick={handleAddFrame}>Add frame</Button>
      <Button onClick={() => openUrl("https://x.com/koanprotocol")}>
        Open X(Twiiter)
      </Button>
      <ConnectButton />
    </div>
  );
}

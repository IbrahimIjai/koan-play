"use client";

import { useAddFrame } from "@/hooks/useAddFrame";
import { useOpenUrl } from "@/hooks/useOpenUrl";
import { useMiniKit } from "@/hooks/useMiniKit";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { Button } from "@/components/ui/button";
import ConnectButton from "@/components/connect-button";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  console.log({ frameAdded });
  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const sendNotification = useNotification();

  const handleSendNotification = () => {
    sendNotification({
      title: "New High Score!",
      body: "Congratulations on your new high score!",
    });
  };

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <Button
          size="sm"
          onClick={handleAddFrame}
          className="text-[var(--app-accent)] p-4"
          // icon={<Icon name="plus" size="sm" />}
        >
          Save Frame
        </Button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out">
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  console.log({ setFrameReady, isFrameReady, context });
  return (
    <div className="flex flex-wrap py-8">
      <Button onClick={handleSendNotification}>Send Notifications</Button>
      <Button>{saveFrameButton}</Button>
      <Button onClick={() => openUrl("https://x.com/koanprotocol")}>
        Open X(Twiiter)
      </Button>
      <ConnectButton />
    </div>
  );
}

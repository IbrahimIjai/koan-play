"use client";

import { useAddFrame } from "@/hooks/useAddFrame";
import { useMiniKit } from "@/hooks/useMiniKit";
import { useCallback, useEffect, useState } from "react";
import Countdown from "@/components/koan-play-animation";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  console.log({ frameAdded });
  const addFrame = useAddFrame();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);




  useEffect(() => {
    if (context && !context.client.added) {
      handleAddFrame();
    }
  });
  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  console.log({ setFrameReady, isFrameReady, context });
  return (
    <main className="relative w-full">
      <Countdown seconds={259200}/>
    
    </main>
  );
}

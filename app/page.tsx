"use client";

import { useCallback, useEffect, useState } from "react";
import { CountdownMain } from "@/components/koan-play-animation";
import { motion } from "framer-motion";
import { useMiniKit, useAddFrame } from "@coinbase/onchainkit/minikit";

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
    <main className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 py-12 px-2">
      <div className="relative z-10 max-w-4xl w-full mx-auto">
        {/* Logo Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex justify-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-lg ">
            <span className="text-2xl font-bold text-white">K</span>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Now using the countdown component with no props - it handles the calculation internally */}
          <CountdownMain />
        </div>
      </div>
    </main>
  );
}

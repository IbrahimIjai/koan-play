// koan-play-animation.tsx
import NumberFlow, { NumberFlowGroup } from "@number-flow/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Check, Heart } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "./ui/separator";
import { useMiniKit } from "@/hooks/useMiniKit";
import { useAddFrame } from "@/hooks/useAddFrame";
import { useOpenUrl } from "@/hooks/useOpenUrl";
import { useNotification } from "@/hooks/useNotification";

export default function Countdown() {
  const { context } = useMiniKit();
  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();
  const sendNotification = useNotification();
  const [actions, setActions] = useState({
    followX: false,
    joinTelegram: false,
    followChannel: false,
    addFrame: false,
  });
  const [frameToken, setFrameToken] = useState<string | null>(null);

  const handleAddFrame = async () => {
    const result = await addFrame();
    if (result) {
      setFrameToken(result.token);
    }
  };

  const handleDone = async () => {
    if (!context) {
      console.log("NOooo web");
      toast.error("Tasks not completed", {
        description:
          "Completeall tasks to be paticipate in the early birds rewards",
      });
      return;
    } else if (
      context &&
      (!context.client.added || !actions.followX || !actions.joinTelegram)
    ) {
      toast.error("Tasks not completed", {
        description:
          "Completeall tasks to be paticipate in the early birds rewards",
      });
      return;
    }

    const userData = {
      fid: context.user.fid,
      username: context.user.username,
      displayName: context.user.displayName,
      pfpUrl: context.user.pfpUrl,
      location: context.user.location,
      token: frameToken,
      timestamp: new Date().toISOString(),
    };

    try {
      // Store user data in Redis
      await fetch("/api/store-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      // Send notification
      if (frameToken) {
        sendNotification({
          title: "Early Access Granted!",
          body: `Welcome ${context.user.username}! You've unlocked early access benefits.`,
        });
      }
    } catch (error) {
      console.error("Error storing user data:", error);
    }
  };

  // Set the target end date (3 days from now)
  const [targetDate] = useState(() => {
    const now = new Date();
    const target = new Date(now);
    target.setDate(now.getDate() + 3); // Add 3 days
    return target;
  });

  // Track remaining time in seconds
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Update the countdown timer every second
  useEffect(() => {
    const calculateRemainingTime = () => {
      const now = new Date();
      const difference = Math.max(
        0,
        Math.floor((targetDate.getTime() - now.getTime()) / 1000),
      );
      setRemainingSeconds(difference);
    };

    // Calculate immediately on mount
    calculateRemainingTime();

    // Set up interval to update the time every second
    const interval = setInterval(calculateRemainingTime, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [targetDate]);

  // Calculate time units from seconds
  const dd = Math.floor(remainingSeconds / 86400);
  const hh = Math.floor((remainingSeconds % 86400) / 3600);
  const mm = Math.floor((remainingSeconds % 3600) / 60);
  const ss = remainingSeconds % 60;

  // Labels for time units
  const timeLabels = ["DAYS", "HOURS", "MINS", "SECS"];

  const handleAction = async (action: keyof typeof actions) => {
    setActions((prev) => ({ ...prev, [action]: true }));

    // Here we would typically open the respective platform in a new tab
    // or trigger the appropriate action
    switch (action) {
      case "followX":
        openUrl("https://x.com/koanprotocol");
        setActions((prev) => ({ ...prev, followX: true }));
        break;
      case "joinTelegram":
        openUrl("https://t.me/koanprotocol");
        setActions((prev) => ({ ...prev, joinTelegram: true }));

        break;
      case "addFrame":
        handleAddFrame();
        break;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Lottery Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-4 text-center"
      >
        <h1 className="text-xl font-bold">Koan Play Lottery</h1>
        <p className="text-sm text-muted-foreground">
          Get early access to exclusive benefits
        </p>
      </motion.div>

      {/* Countdown Timer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700/50 shadow-xl"
      >
        <NumberFlowGroup>
          <div className="flex items-center justify-center gap-4">
            {/* Days */}
            <div className="flex flex-col items-center">
              <div className="px-4 py-3 rounded-lg bg-gray-800/80 border border-purple-500/30 shadow-lg">
                <div className="text-4xl font-bold number-flow-container ">
                  <NumberFlow
                    trend={-1}
                    value={dd}
                    format={{ minimumIntegerDigits: 2 }}
                  />
                </div>
              </div>
              <span className="mt-2 text-xs font-medium text-gray-400">
                {timeLabels[0]}
              </span>
            </div>

            {/* Hours */}
            <div className="flex flex-col items-center">
              <div className="px-4 py-3 rounded-lg bg-gray-800/80 border border-blue-500/30 shadow-lg">
                <div className="text-4xl font-bold  number-flow-container ">
                  <NumberFlow
                    trend={-1}
                    value={hh}
                    format={{ minimumIntegerDigits: 2 }}
                  />
                </div>
              </div>
              <span className="mt-2 text-xs font-medium text-gray-400">
                {timeLabels[1]}
              </span>
            </div>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <div className="px-4 py-3 rounded-lg bg-gray-800/80 border border-indigo-500/30 shadow-lg">
                <div className="text-4xl font-bold number-flow-container ">
                  <NumberFlow
                    trend={-1}
                    value={mm}
                    digits={{ 1: { max: 5 } }}
                    format={{ minimumIntegerDigits: 2 }}
                  />
                </div>
              </div>
              <span className="mt-2 text-xs font-medium text-gray-400">
                {timeLabels[2]}
              </span>
            </div>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <div className="px-4 py-3 rounded-lg bg-gray-800/80 border border-cyan-500/30 shadow-lg pulse-animation">
                <div className="text-4xl font-bold number-flow-container ">
                  <NumberFlow
                    trend={-1}
                    value={ss}
                    digits={{ 1: { max: 5 } }}
                    format={{ minimumIntegerDigits: 2 }}
                  />
                </div>
              </div>
              <span className="mt-2 text-xs font-medium text-gray-400">
                {timeLabels[3]}
              </span>
            </div>
          </div>
        </NumberFlowGroup>
      </motion.div>

      <Drawer>
        <DrawerTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8"
          >
            <Button className="px-6 py-2">Get Early Access Benefits</Button>
          </motion.div>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Get early access benefits</DrawerTitle>
              <DrawerDescription>
                Complete these actions to unlock early access benefits
              </DrawerDescription>
            </DrawerHeader>

            <div className="p-4 space-y-4">
              {/* Follow X Button */}
              <Button
                disabled={actions.followX}
                variant="outline"
                className="w-full justify-start gap-3 border-2 bg-transparent"
                onClick={() => handleAction("followX")}
              >
                <div className="flex items-center gap-3">
                  <XLogo />
                  <span>Follow on X</span>
                </div>
                {actions.followX && <Check className="ml-auto h-4 w-4" />}
              </Button>

              <Separator />

              {/* Join Telegram Button */}
              <Button
                variant="outline"
                disabled={actions.joinTelegram}
                className="w-full justify-start gap-3 border-2 bg-transparent"
                onClick={() => handleAction("joinTelegram")}
              >
                <div className="flex items-center gap-3">
                  <TelegramLogo />
                  <span>Join Telegram</span>
                </div>
                {actions.joinTelegram && <Check className="ml-auto h-4 w-4" />}
              </Button>

              <Separator />

              {/* Add Frame Button */}
              <Button
                variant="outline"
                disabled={!!(context && !context.client.added)}
                className="w-full justify-start gap-3 border-2 bg-transparent"
                onClick={() => handleAction("addFrame")}
              >
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5" />
                  <span>Add Frame</span>
                </div>
                {context && !context.client.added && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </Button>
            </div>

            <DrawerFooter>
              <Button onClick={handleDone}>Done</Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

// Custom SVG components for logos
function XLogo() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"
        fill="currentColor"
      />
    </svg>
  );
}

function TelegramLogo() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.332.318-.6.318l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.87 4.326-2.962-.924c-.643-.204-.658-.643.135-.953l11.566-4.458c.538-.196 1.006.128.831.916z"
        fill="currentColor"
      />
    </svg>
  );
}

// function ChannelIcon() {
//   return (
//     <svg
//       width="20"
//       height="20"
//       viewBox="0 0 24 24"
//       fill="none"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <path
//         d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
//         fill="currentColor"
//       />
//     </svg>
//   );
// }

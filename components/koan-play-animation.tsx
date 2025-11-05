import { motion } from "framer-motion";
import { useState } from "react";
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
import { Check, Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMiniKit } from "@/hooks/useMiniKit";
import { useAddFrame } from "@/hooks/useAddFrame";
// import {
//   useMiniKit,
//   useAddFrame,
//   useOpenUrl,
//   useNotification,
// } from "@coinbase/onchainkit/minikit";
import { useOpenUrl } from "@/hooks/useOpenUrl";
import { useNotification } from "@/hooks/useNotification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import Countdown from "./countdown-timer";

export function CountdownMain() {
  const { context } = useMiniKit();
  const [launchTimestamp] = useState(() => {
    return 1745668800;
  });

  // Get user's FID
  const userFid = context?.user?.fid;

  // Query to check if user is already on the waitlist
  const { data: userData } = useQuery({
    queryKey: ["userData", userFid],
    queryFn: async () => {
      if (!userFid) return null;
      try {
        const response = await axios.get(`/api/store-user?fid=${userFid}`);
        return response.data.success ? response.data.data : null;
      } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
      }
    },
    enabled: !!userFid, // Only run query if userFid exists
    refetchOnWindowFocus: false,
  });

  // Check if the user is already registered
  const isRegistered = !!userData;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto py-8 px-4"
    >
      {/* Glassmorphism Card Container */}
      <div className="w-full rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="relative bg-gradient-to-br from-indigo-600/30 via-purple-600/30 to-pink-600/30 px-6 py-10">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-indigo-500/20 blur-3xl"
            />
          </div>

          <div className="relative z-10">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 mb-3">
                Koan Play Lottery
              </h1>
              <p className="text-indigo-100/70 text-sm md:text-base font-medium">
                Join the waitlist for exclusive early access benefits
              </p>
            </motion.div>

            {/* Countdown Timer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Countdown
                targetUnixTimestamp={launchTimestamp}
                className="p-5 rounded-xl bg-black/30 backdrop-blur-md border border-white/20 shadow-lg"
              />
            </motion.div>
          </div>
        </div>

        {/* Body Section */}
        <div className="bg-slate-900/60 backdrop-blur-sm p-8 flex flex-col items-center">
          {/* Success Message (if user is already registered) */}
          {isRegistered && (
            <SuccessAlert
              message="You're on the early access list!"
              subtitle="You've already completed all required tasks. You'll be notified when early access begins."
            />
          )}

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-4 w-full max-w-xs"
          >
            <TaskDrawer isRegistered={isRegistered} userFid={userFid || null} />
          </motion.div>

          {/* Info Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 text-center max-w-md space-y-2"
          >
            <p className="text-sm text-gray-300 font-medium">
              🎯 Complete all tasks to secure your spot
            </p>
            <p className="text-xs text-gray-400">
              Limited slots available • First come, first served
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

interface TaskDrawerProps {
  isRegistered: boolean;
  userFid: number | null;
}
interface UserData {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  // location?: any;
  token?: string | null;
  actions?: {
    followX: boolean;
    joinTelegram: boolean;
    followChannel?: boolean;
    addFrame: boolean;
  };
  timestamp: string;
}

function TaskDrawer({ isRegistered, userFid }: TaskDrawerProps) {
  const { context } = useMiniKit();
  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();
  const sendNotification = useNotification();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [actions, setActions] = useState({
    followX: false,
    joinTelegram: false,
    addFrame: context?.client?.added || false,
  });
  const [frameToken, setFrameToken] = useState<string | null>(null);

  // Create mutation for submitting user data
  const mutation = useMutation({
    mutationFn: async (userData: UserData) => {
      const response = await axios.post("/api/store-user", userData);
      return response.data;
    },
    onSuccess: (data) => {
      console.log({ data });
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["userData", userFid] });

      // Send notification
      if (frameToken && context) {
        sendNotification({
          title: "Early Access Granted!",
          body: `Welcome ${context.user.username}! You've unlocked early access benefits.`,
        });
      }

      toast.success("Early access granted!", {
        description: "You've been added to our early access waitlist.",
      });

      // Close drawer after successful submission
      setTimeout(() => setIsOpen(false), 1500);
    },
    onError: (error) => {
      console.error("Error storing user data:", error);
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
    },
  });

  const handleAddFrame = async () => {
    const result = await addFrame();
    if (result) {
      setFrameToken(result.token);
      setActions((prev) => ({ ...prev, addFrame: true }));
      toast.success("Frame added successfully!");
    }
  };

  const handleAction = async (action: keyof typeof actions) => {
    switch (action) {
      case "followX":
        openUrl("https://x.com/koanprotocol");
        setActions((prev) => ({ ...prev, followX: true }));
        toast.success("Thanks for following us on X!");
        break;
      case "joinTelegram":
        openUrl("https://t.me/koanprotocol");
        setActions((prev) => ({ ...prev, joinTelegram: true }));
        toast.success("Thanks for joining our Telegram!");
        break;
      case "addFrame":
        handleAddFrame();
        break;
    }
  };

  const handleDone = async () => {
    if (!context) {
      toast.error("Not connected", {
        description: "Please connect your wallet to continue.",
      });
      return;
    } else if (
      context &&
      (!context.client.added || !actions.followX || !actions.joinTelegram)
    ) {
      toast.error("Tasks not completed", {
        description:
          "Complete all tasks to participate in the early access rewards",
      });
      return;
    }

    const userData = {
      fid: context.user.fid,
      username: context.user.username,
      displayName: context.user.displayName,
      pfpUrl: context.user.pfpUrl,
      // location: context.user.location,
      token: frameToken,
      actions: actions,
      timestamp: new Date().toISOString(),
    };

    mutation.mutate(userData);

    sendNotification({
      title: "Early Access Granted!",
      body: `Welcome ${context.user.username}! You've unlocked early access benefits.`,
    });
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          className="w-full px-8 py-6 text-base font-semibold bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:via-purple-700 hover:to-pink-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
          disabled={isRegistered}
          size="lg"
        >
          {isRegistered ? (
            <span className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              Already Registered
            </span>
          ) : (
            "Get Early Access 🚀"
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-gradient-to-b from-slate-900 to-slate-950 border-t border-white/10">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="text-center pb-6">
            <DrawerTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Get Early Access Benefits
            </DrawerTitle>
            <DrawerDescription className="text-base text-gray-300 mt-2">
              Complete these simple tasks to unlock exclusive early access
            </DrawerDescription>
          </DrawerHeader>

          {isRegistered ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="p-8 text-center"
            >
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg"
                >
                  <Check className="h-10 w-10 text-white" strokeWidth={3} />
                </motion.div>
              </div>
              <h3 className="font-bold text-xl mb-3 text-green-400">
                You&apos;re already registered!
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                You&apos;ve completed all tasks and secured your spot for early
                access. We&apos;ll notify you when it begins! 🎉
              </p>
            </motion.div>
          ) : (
            <div className="px-6 pb-4 space-y-3">
              {/* Follow X Button */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Button
                  disabled={actions.followX}
                  variant="outline"
                  className="w-full h-14 justify-start text-left border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
                  onClick={() => handleAction("followX")}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-black rounded-full p-2">
                      <XLogo />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Follow on X</p>
                      <p className="text-xs text-muted-foreground">@koanprotocol</p>
                    </div>
                  </div>
                  {actions.followX && (
                    <Check className="h-5 w-5 text-green-500" strokeWidth={3} />
                  )}
                </Button>
              </motion.div>

              {/* Join Telegram Button */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  variant="outline"
                  disabled={actions.joinTelegram}
                  className="w-full h-14 justify-start text-left border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
                  onClick={() => handleAction("joinTelegram")}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-[#229ED9] rounded-full p-2">
                      <TelegramLogo />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Join Telegram</p>
                      <p className="text-xs text-muted-foreground">Community group</p>
                    </div>
                  </div>
                  {actions.joinTelegram && (
                    <Check className="h-5 w-5 text-green-500" strokeWidth={3} />
                  )}
                </Button>
              </motion.div>

              {/* Add Frame Button */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="outline"
                  disabled={!!(context && context.client.added)}
                  className="w-full h-14 justify-start text-left border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
                  onClick={() => handleAction("addFrame")}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-full p-2">
                      <Heart className="h-5 w-5 text-white" fill="white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Add Frame</p>
                      <p className="text-xs text-muted-foreground">Add to Farcaster</p>
                    </div>
                  </div>
                  {context && context.client.added && (
                    <Check className="h-5 w-5 text-green-500" strokeWidth={3} />
                  )}
                </Button>
              </motion.div>
            </div>
          )}

          <DrawerFooter className="pt-4">
            {!isRegistered && (
              <Button
                onClick={handleDone}
                disabled={mutation.isPending}
                className="w-full h-12 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:via-purple-700 hover:to-pink-600 font-semibold text-base shadow-lg"
                size="lg"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Complete Registration ✨"
                )}
              </Button>
            )}
            <DrawerClose asChild>
              <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

interface SuccessAlertProps {
  message: string;
  subtitle?: string;
}

function SuccessAlert({ message, subtitle }: SuccessAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring" }}
      className="w-full max-w-md"
    >
      <Alert className="border-green-500/40 bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-md shadow-lg">
        <div className="flex items-start gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-full p-2 shadow-md"
          >
            <Check className="h-5 w-5 text-white" strokeWidth={3} />
          </motion.div>
          <div className="flex-1">
            <AlertTitle className="text-green-400 font-bold text-base mb-1">
              {message}
            </AlertTitle>
            {subtitle && (
              <AlertDescription className="text-green-300/80 text-sm leading-relaxed">
                {subtitle}
              </AlertDescription>
            )}
          </div>
        </div>
      </Alert>
    </motion.div>
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

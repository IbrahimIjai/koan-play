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
import { Separator } from "./ui/separator";
import { useMiniKit } from "@/hooks/useMiniKit";
import { useAddFrame } from "@/hooks/useAddFrame";
import { useOpenUrl } from "@/hooks/useOpenUrl";
import { useNotification } from "@/hooks/useNotification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import Countdown from "./countdown-timer";

export function CountdownMain() {
  const { context } = useMiniKit();
  const [launchTimestamp] = useState(() => {
    return 1744823628;
  });

  // Get user's FID
  const userFid = context?.user?.fid;

  // Query to check if user is already on the waitlist
  const { data: userData } = useQuery({
    queryKey: ["userData", userFid],
    queryFn: async () => {
      if (!userFid) return null;
      try {
        const response = await axios.get(`/api/get-user?fid=${userFid}`);
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
      <div className="w-full rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-indigo-900/70 to-primary/70 px-6 py-8">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-purple-500/20 blur-2xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-indigo-500/20 blur-2xl"></div>
          </div>

          <div className="relative z-10">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center mb-6"
            >
              <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-200">
                Koan Play Lottery
              </h1>
              <p className="text-indigo-200/80 mt-2">
                Get early access to exclusive benefits
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
                className="p-4 rounded-lg bg-black/20 backdrop-blur-md border border-white/10"
              />
            </motion.div>
          </div>
        </div>

        {/* Body Section */}
        <div className="bg-slate-900/80 p-6 flex flex-col items-center">
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
            className="mt-4"
          >
            <TaskDrawer isRegistered={isRegistered} userFid={userFid || null} />
          </motion.div>

          {/* Info Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-6 text-xs text-gray-400 text-center max-w-md"
          >
            Complete all tasks to secure your spot for early access. Limited
            slots available.
          </motion.p>
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
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg"
          disabled={isRegistered}
        >
          {isRegistered ? "Already Registered" : "Get Early Access"}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Get early access benefits</DrawerTitle>
            <DrawerDescription>
              Complete these actions to unlock early access benefits
            </DrawerDescription>
          </DrawerHeader>

          {isRegistered ? (
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="font-medium text-lg mb-2">
                You&apos;re already registered!
              </h3>
              <p className="text-gray-500 text-sm">
                You&apos;ve already completed all tasks and secured your spot
                for early access.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Follow X Button */}
              <Button
                disabled={actions.followX}
                variant="outline"
                className="w-full justify-start gap-3 border-2 bg-transparent hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                onClick={() => handleAction("followX")}
              >
                <div className="flex items-center gap-3">
                  <XLogo />
                  <span>Follow on X</span>
                </div>
                {actions.followX && (
                  <Check className="ml-auto h-4 w-4 text-green-500" />
                )}
              </Button>

              <Separator />

              {/* Join Telegram Button */}
              <Button
                variant="outline"
                disabled={actions.joinTelegram}
                className="w-full justify-start gap-3 border-2 bg-transparent hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                onClick={() => handleAction("joinTelegram")}
              >
                <div className="flex items-center gap-3">
                  <TelegramLogo />
                  <span>Join Telegram</span>
                </div>
                {actions.joinTelegram && (
                  <Check className="ml-auto h-4 w-4 text-green-500" />
                )}
              </Button>

              <Separator />

              {/* Add Frame Button */}
              <Button
                variant="outline"
                disabled={!!(context && context.client.added)}
                className="w-full justify-start gap-3 border-2 bg-transparent hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                onClick={() => handleAction("addFrame")}
              >
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-pink-500" />
                  <span>Add Frame</span>
                </div>
                {context && context.client.added && (
                  <Check className="ml-auto h-4 w-4 text-green-500" />
                )}
              </Button>
            </div>
          )}

          <DrawerFooter>
            {!isRegistered && (
              <Button
                onClick={handleDone}
                disabled={mutation.isPending}
                className="relative bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </Button>
            )}
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
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
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mb-4"
    >
      <Alert className="border-green-500/30 bg-green-50/90 text-green-800 backdrop-blur-sm shadow-md">
        <div className="flex items-start">
          <div className="bg-green-100 rounded-full p-1 mr-3">
            <Check className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <AlertTitle className="text-green-700">{message}</AlertTitle>
            {subtitle && (
              <AlertDescription className="text-green-600/80">
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

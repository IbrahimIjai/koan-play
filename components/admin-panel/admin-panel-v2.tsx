"use client";
import { useAccount } from "wagmi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LotteryDetails from "./lottery-details";
import LotterySettings from "./lottery-settings";
import RandomGeneratorSettings from "./random-generator-settings";
import StartLotteryForm from "./start-lottery-form";

export function AdminPanelV2() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <h3 className="text-lg font-medium">Connect Your Wallet</h3>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="lottery">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="lottery">Lottery Management</TabsTrigger>
          <TabsTrigger value="settings">Lottery Settings</TabsTrigger>
          <TabsTrigger value="random">Random Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="lottery" className="space-y-8">
          <LotteryDetails />
        </TabsContent>

        <TabsContent value="settings">
          <LotterySettings />
        </TabsContent>

        <TabsContent value="random">
          <RandomGeneratorSettings />
        </TabsContent>
      </Tabs>

      <StartLotteryForm />
    </div>
  );
}

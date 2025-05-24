"use client";
import { useAccount } from "wagmi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LotteryDetails from "./lottery-details";
import LotterySettings from "./lottery-settings";
import RandomGeneratorSettings from "./random-generator-settings";
import StartLotteryForm from "./start-lottery-form";
import LotteryStatistics from "./lottery-statistics";
import LotteryWinners from "./lottery-winners";
import OperatorControls from "./operator-controls";
import { ConnectButton } from "@/components/connect-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AdminPanelV3() {
  const { isConnected, address } = useAccount();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Access Required</CardTitle>
            <CardDescription>
              Please connect your wallet to access the lottery administration panel
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ConnectButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Lottery Administration</h1>
        <ConnectButton />
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Admin wallet connected</AlertTitle>
        <AlertDescription>
          You are connected with address: {address}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="lottery" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="lottery">Current Lottery</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="winners">Winners</TabsTrigger>
          <TabsTrigger value="operator">Operator Controls</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="lottery" className="space-y-8">
          <LotteryDetails />
          <StartLotteryForm />
        </TabsContent>

        <TabsContent value="statistics">
          <LotteryStatistics />
        </TabsContent>

        <TabsContent value="winners">
          <LotteryWinners />
        </TabsContent>

        <TabsContent value="operator">
          <OperatorControls />
        </TabsContent>

        <TabsContent value="settings" className="space-y-8">
          <LotterySettings />
          <RandomGeneratorSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

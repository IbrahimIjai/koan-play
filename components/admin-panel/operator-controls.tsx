"use client";

import { useState, useEffect } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import {  parseUnits } from "viem";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  DollarSign,
  Settings,
  Users,
  ArrowRight,
} from "lucide-react";
import { LOTTERY_ABI } from "@/configs/abis";
import { CONTRACTS } from "@/configs/contracts-confg";
import { baseSepolia } from "viem/chains";
import { getTokenByAddress } from "@/configs/token-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

export default function OperatorControls() {
  const { address } = useAccount();
  const [tokenInfo, setTokenInfo] = useState<{
    symbol: string;
    decimals: number;
  }>({
    symbol: "TOKEN",
    decimals: 18,
  });
  const [isOperator, setIsOperator] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Get operator address
  const { data: operatorAddress } = useReadContract({
    address: CONTRACTS.LOTTERY.address[baseSepolia.id],
    abi: LOTTERY_ABI,
    functionName: "operatorAddress",
  });

  // Get owner address
  const { data: ownerAddress } = useReadContract({
    address: CONTRACTS.LOTTERY.address[baseSepolia.id],
    abi: LOTTERY_ABI,
    functionName: "owner",
  });

  // Get treasury address
  const { data: treasuryAddress } = useReadContract({
    address: CONTRACTS.LOTTERY.address[baseSepolia.id],
    abi: LOTTERY_ABI,
    functionName: "treasuryAddress",
  });

  // Get injector address
  const { data: injectorAddress } = useReadContract({
    address: CONTRACTS.LOTTERY.address[baseSepolia.id],
    abi: LOTTERY_ABI,
    functionName: "injectorAddress",
  });

  // Get payment token
  const { data: paymentTokenAddress } = useReadContract({
    address: CONTRACTS.LOTTERY.address[baseSepolia.id],
    abi: LOTTERY_ABI,
    functionName: "paymentToken",
  });

  // Get token info
  useEffect(() => {
    if (paymentTokenAddress) {
      const tokenInfo = getTokenByAddress(
        baseSepolia.id,
        paymentTokenAddress as string,
      );
      if (tokenInfo) {
        setTokenInfo({
          symbol: tokenInfo.symbol,
          decimals: tokenInfo.decimals,
        });
      }
    }
  }, [paymentTokenAddress]);

  // Check if current user is operator or owner
  useEffect(() => {
    if (address && operatorAddress) {
      setIsOperator(
        address.toLowerCase() === (operatorAddress as string).toLowerCase(),
      );
    }
    if (address && ownerAddress) {
      setIsOwner(
        address.toLowerCase() === (ownerAddress as string).toLowerCase(),
      );
    }
  }, [address, operatorAddress, ownerAddress]);

  // Form schema for address management
  const addressFormSchema = z.object({
    operatorAddress: z.string().startsWith("0x"),
    treasuryAddress: z.string().startsWith("0x"),
    injectorAddress: z.string().startsWith("0x"),
  });

  // Form for address management
  const addressForm = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      operatorAddress: "",
      treasuryAddress: "",
      injectorAddress: "",
    },
  });

  // Update form values when addresses are loaded
  useEffect(() => {
    if (operatorAddress && treasuryAddress && injectorAddress) {
      addressForm.reset({
        operatorAddress: operatorAddress as string,
        treasuryAddress: treasuryAddress as string,
        injectorAddress: injectorAddress as string,
      });
    }
  }, [operatorAddress, treasuryAddress, injectorAddress, addressForm]);

  // Form schema for token recovery
  const tokenRecoveryFormSchema = z.object({
    tokenAddress: z.string().startsWith("0x"),
    amount: z.string().min(1),
  });

  // Form for token recovery
  const tokenRecoveryForm = useForm<z.infer<typeof tokenRecoveryFormSchema>>({
    resolver: zodResolver(tokenRecoveryFormSchema),
    defaultValues: {
      tokenAddress: "",
      amount: "",
    },
  });

  // Form schema for funds injection
  const injectFundsFormSchema = z.object({
    lotteryId: z.string().min(1),
    amount: z.string().min(1),
  });

  // Form for funds injection
  const injectFundsForm = useForm<z.infer<typeof injectFundsFormSchema>>({
    resolver: zodResolver(injectFundsFormSchema),
    defaultValues: {
      lotteryId: "",
      amount: "",
    },
  });

  // Write contract hooks
  const {
    data: setAddressesHash,
    writeContract: setAddresses,
    isPending: isSettingAddresses,
    error: setAddressesError,
  } = useWriteContract();

  const {
    data: recoverTokensHash,
    writeContract: recoverTokens,
    isPending: isRecoveringTokens,
    error: recoverTokensError,
  } = useWriteContract();

  const {
    data: injectFundsHash,
    writeContract: injectFunds,
    isPending: isInjectingFunds,
    error: injectFundsError,
  } = useWriteContract();

  // Wait for transaction receipts
  const { isLoading: isAddressesLoading, isSuccess: isAddressesSuccess } =
    useWaitForTransactionReceipt({
      hash: setAddressesHash,
    });

  const {
    isLoading: isRecoverTokensLoading,
    isSuccess: isRecoverTokensSuccess,
  } = useWaitForTransactionReceipt({
    hash: recoverTokensHash,
  });

  const { isLoading: isInjectFundsLoading, isSuccess: isInjectFundsSuccess } =
    useWaitForTransactionReceipt({
      hash: injectFundsHash,
    });

  // Handle address form submission
  const onAddressSubmit = (values: z.infer<typeof addressFormSchema>) => {
    setAddresses({
      address: CONTRACTS.LOTTERY.address[baseSepolia.id],
      abi: LOTTERY_ABI,
      functionName: "setOperatorAndTreasuryAndInjectorAddresses",
      args: [
        values.operatorAddress as `0x${string}`,
        values.treasuryAddress as `0x${string}`,
        values.injectorAddress as `0x${string}`,
      ],
    });
  };

  // Handle token recovery form submission
  const onTokenRecoverySubmit = (
    values: z.infer<typeof tokenRecoveryFormSchema>,
  ) => {
    recoverTokens({
      address: CONTRACTS.LOTTERY.address[baseSepolia.id],
      abi: LOTTERY_ABI,
      functionName: "recoverWrongTokens",
      args: [
        values.tokenAddress as `0x${string}`,
        parseUnits(values.amount, 18), // Assuming 18 decimals, should be adjusted based on token
      ],
    });
  };

  // Handle funds injection form submission
  const onInjectFundsSubmit = (
    values: z.infer<typeof injectFundsFormSchema>,
  ) => {
    injectFunds({
      address: CONTRACTS.LOTTERY.address[baseSepolia.id],
      abi: LOTTERY_ABI,
      functionName: "injectFunds",
      args: [
        BigInt(values.lotteryId),
        parseUnits(values.amount, tokenInfo.decimals),
      ],
    });
  };

  // Transaction submitted toasts
  useEffect(() => {
    if (setAddressesHash) {
      toast.info("Transaction submitted", {
        description: "Updating addresses. Waiting for confirmation...",
      });
    }
  }, [setAddressesHash]);

  useEffect(() => {
    if (recoverTokensHash) {
      toast.info("Transaction submitted", {
        description: "Recovering tokens. Waiting for confirmation...",
      });
    }
  }, [recoverTokensHash]);

  useEffect(() => {
    if (injectFundsHash) {
      toast.info("Transaction submitted", {
        description: "Injecting funds. Waiting for confirmation...",
      });
    }
  }, [injectFundsHash]);

  // Success toasts
  useEffect(() => {
    if (isAddressesSuccess) {
      toast.success("Addresses updated successfully!", {
        description: "Lottery addresses have been updated.",
      });
      // Refresh the page to get updated addresses
      window.location.reload();
    }
  }, [isAddressesSuccess]);

  useEffect(() => {
    if (isRecoverTokensSuccess) {
      toast.success("Tokens recovered successfully!", {
        description: "Tokens have been recovered from the lottery contract.",
      });
      tokenRecoveryForm.reset();
    }
  }, [isRecoverTokensSuccess, tokenRecoveryForm]);

  useEffect(() => {
    if (isInjectFundsSuccess) {
      toast.success("Funds injected successfully!", {
        description: "Funds have been added to the lottery prize pool.",
      });
      injectFundsForm.reset();
    }
  }, [isInjectFundsSuccess, injectFundsForm]);

  // Error toasts
  useEffect(() => {
    if (setAddressesError) {
      toast.error("Failed to update addresses", {
        description: setAddressesError.message || "An error occurred",
      });
    }
  }, [setAddressesError]);

  useEffect(() => {
    if (recoverTokensError) {
      toast.error("Failed to recover tokens", {
        description: recoverTokensError.message || "An error occurred",
      });
    }
  }, [recoverTokensError]);

  useEffect(() => {
    if (injectFundsError) {
      toast.error("Failed to inject funds", {
        description: injectFundsError.message || "An error occurred",
      });
    }
  }, [injectFundsError]);

  // If not operator or owner, show access denied
  if (!isOperator && !isOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Operator Controls</CardTitle>
          <CardDescription>
            Advanced lottery management functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You must be the contract owner or operator to access these
              controls.
              <br />
              Current operator: {operatorAddress || "Loading..."}
              <br />
              Current owner: {ownerAddress || "Loading..."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Operator Controls</CardTitle>
          <CardDescription>
            Advanced lottery management functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="addresses" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="addresses">
                <Users className="w-4 h-4 mr-2" />
                Address Management
              </TabsTrigger>
              <TabsTrigger value="recovery">
                <DollarSign className="w-4 h-4 mr-2" />
                Token Recovery
              </TabsTrigger>
              <TabsTrigger value="injection">
                <ArrowRight className="w-4 h-4 mr-2" />
                Inject Funds
              </TabsTrigger>
            </TabsList>

            <TabsContent value="addresses" className="space-y-4 mt-4">
              <Alert className="mb-4">
                <Settings className="h-4 w-4" />
                <AlertTitle>Address Configuration</AlertTitle>
                <AlertDescription>
                  Update the operator, treasury, and injector addresses for the
                  lottery contract.
                  <br />
                  <strong>Note:</strong> Only the contract owner can update
                  these addresses.
                </AlertDescription>
              </Alert>

              <Form {...addressForm}>
                <form
                  onSubmit={addressForm.handleSubmit(onAddressSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={addressForm.control}
                    name="operatorAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Operator Address</FormLabel>
                        <FormControl>
                          <Input placeholder="0x..." {...field} />
                        </FormControl>
                        <FormDescription>
                          The operator can start, close, and draw lotteries
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addressForm.control}
                    name="treasuryAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Treasury Address</FormLabel>
                        <FormControl>
                          <Input placeholder="0x..." {...field} />
                        </FormControl>
                        <FormDescription>
                          Treasury fees are sent to this address
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addressForm.control}
                    name="injectorAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Injector Address</FormLabel>
                        <FormControl>
                          <Input placeholder="0x..." {...field} />
                        </FormControl>
                        <FormDescription>
                          This address can inject funds into the lottery
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={
                      !isOwner || isSettingAddresses || isAddressesLoading
                    }
                    className="w-full"
                  >
                    {isSettingAddresses || isAddressesLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        {isSettingAddresses ? "Submitting..." : "Confirming..."}
                      </>
                    ) : (
                      "Update Addresses"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="recovery" className="space-y-4 mt-4">
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Token Recovery</AlertTitle>
                <AlertDescription>
                  Recover tokens accidentally sent to the lottery contract.
                  <br />
                  <strong>Note:</strong> You cannot recover the payment token
                  used by the lottery.
                </AlertDescription>
              </Alert>

              <Form {...tokenRecoveryForm}>
                <form
                  onSubmit={tokenRecoveryForm.handleSubmit(
                    onTokenRecoverySubmit,
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={tokenRecoveryForm.control}
                    name="tokenAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token Address</FormLabel>
                        <FormControl>
                          <Input placeholder="0x..." {...field} />
                        </FormControl>
                        <FormDescription>
                          The address of the token to recover
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={tokenRecoveryForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input placeholder="0.0" {...field} />
                        </FormControl>
                        <FormDescription>
                          The amount of tokens to recover
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={
                      !isOwner || isRecoveringTokens || isRecoverTokensLoading
                    }
                    className="w-full"
                  >
                    {isRecoveringTokens || isRecoverTokensLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        {isRecoveringTokens ? "Submitting..." : "Confirming..."}
                      </>
                    ) : (
                      "Recover Tokens"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="injection" className="space-y-4 mt-4">
              <Alert className="mb-4">
                <DollarSign className="h-4 w-4" />
                <AlertTitle>Inject Funds</AlertTitle>
                <AlertDescription>
                  Inject additional funds into a lottery to increase the prize
                  pool.
                  <br />
                  <strong>Note:</strong> Only the owner or injector can inject
                  funds.
                </AlertDescription>
              </Alert>

              <Form {...injectFundsForm}>
                <form
                  onSubmit={injectFundsForm.handleSubmit(onInjectFundsSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={injectFundsForm.control}
                    name="lotteryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lottery ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="1"
                            type="number"
                            min="1"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The ID of the lottery to inject funds into
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={injectFundsForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount ({tokenInfo.symbol})</FormLabel>
                        <FormControl>
                          <Input placeholder="0.0" {...field} />
                        </FormControl>
                        <FormDescription>
                          The amount of {tokenInfo.symbol} to inject
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isInjectingFunds || isInjectFundsLoading}
                    className="w-full"
                  >
                    {isInjectingFunds || isInjectFundsLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        {isInjectingFunds ? "Submitting..." : "Confirming..."}
                      </>
                    ) : (
                      "Inject Funds"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <div className="w-full text-sm text-muted-foreground">
            <div className="flex justify-between mb-2">
              <span>Current Operator:</span>
              <span className="font-mono">{operatorAddress as string}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Current Treasury:</span>
              <span className="font-mono">{treasuryAddress as string}</span>
            </div>
            <div className="flex justify-between">
              <span>Current Injector:</span>
              <span className="font-mono">{injectorAddress as string}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

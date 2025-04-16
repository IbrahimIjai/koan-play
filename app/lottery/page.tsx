

import ConnectButton from "@/components/connect-button";
import CheckWinningsButton from "./components/check-winings";
import LotteryHeader from "./components/LotteryHeader";

export default function Lottery() {
  // const { connectors } = useConnect();

  // console.log({ connectors });

  return (
    <div className="min-h-screen  py-8 px-4 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
      <ConnectButton/>
        <LotteryHeader />

        <CheckWinningsButton />
      </div>
    </div>
  );
}

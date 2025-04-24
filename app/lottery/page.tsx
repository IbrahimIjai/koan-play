import ConnectButton from "@/components/connect-button";
import CheckWinningsButton from "./components/check-winings";
import LotteryHeader from "../../components/lottery/lottery-header-heros";
import FinishedRounds from "@/components/lottery/finished-rounds";
import LotteryTicketADSCard from "@/components/lottery/lottery-ticket-ads-card";

export default function Lottery() {
  // const { connectors } = useConnect();

  // console.log({ connectors });

  return (
    <div className="min-h-screen  py-8 px-4 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        <ConnectButton />
        <LotteryHeader />
        
        <LotteryTicketADSCard />

        <CheckWinningsButton />

        <FinishedRounds />
      </div>
    </div>
  );
}

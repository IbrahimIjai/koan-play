"use client";

export default function PrizeFunds() {
  // Prize pool allocation data
  const prizeAllocation = [
    { name: "Matches first 1", percentage: "2%" },
    { name: "Matches first 2", percentage: "3%" },
    { name: "Matches first 3", percentage: "5%" },
    { name: "Matches first 4", percentage: "10%" },
    { name: "Matches first 5", percentage: "20%" },
    { name: "Matches all 6", percentage: "40%" },
    { name: "Burn Pool", percentage: "20%" },
  ];

  return (
    <div>
      <h2 className="text-white text-4xl font-bold text-center mb-8">Prize Funds</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="text-gray-300 space-y-6">
          <p className="text-xl">The prizes for each lottery round come from three sources:</p>
          
          <div>
            <h3 className="text-white text-2xl font-bold mb-2">Ticket Purchases</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>100% of the USDC paid by people buying tickets that round goes back into the prize pools.</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white text-2xl font-bold mb-2">Rollover Prizes</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>After every round, if nobody wins in one of the prize brackets, the unclaimed USDC for that bracket rolls over into the next round and are redistributed among the prize pools.</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white text-2xl font-bold mb-2">USDC Injections</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>An average total of 35,000 USDC from the treasury is added to lottery rounds over the course of a week. This USDC is of course also included in rollovers!</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-2xl p-8">
          <div className="flex justify-between mb-6">
            <div className="text-purple-400 font-bold">DIGITS MATCHED</div>
            <div className="text-purple-400 font-bold">PRIZE POOL ALLOCATION</div>
          </div>
          
          <div className="space-y-4">
            {prizeAllocation.map((allocation, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center">
                  <div 
                    className={`w-4 h-4 rounded-full mr-3 ${
                      index === 6 ? "bg-gray-400" : 
                      index === 0 ? "bg-yellow-500" :
                      index === 1 ? "bg-green-500" : 
                      index === 2 ? "bg-teal-500" : 
                      index === 3 ? "bg-cyan-500" : 
                      index === 4 ? "bg-purple-500" : 
                      "bg-pink-500"
                    }`}
                  ></div>
                  <div className="text-gray-300">{allocation.name}</div>
                </div>
                <div className="text-white font-bold">{allocation.percentage}</div>
              </div>
            ))}
          </div>
          
          {/* Chart illustration - simplified version of a pie chart */}
          <div className="mt-8 flex justify-center">
            <div className="w-48 h-48 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gray-800"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
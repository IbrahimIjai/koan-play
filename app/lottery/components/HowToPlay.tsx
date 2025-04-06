"use client";

export default function HowToPlay() {
  return (
    <div>
      <h2 className="text-white text-4xl font-bold text-center mb-8">
        How to Play
      </h2>

      <div className="text-center text-white mb-6">
        <p className="text-xl">
          If the digits on your tickets match the winning numbers in the correct
          order, you win a portion of the prize pool. Simple!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-2xl p-6 relative">
          <div className="absolute right-6 top-6 text-gray-500 font-bold">
            STEP 1
          </div>

          <h3 className="text-purple-400 text-2xl font-bold mb-4">
            Buy Tickets
          </h3>
          <p className="text-gray-300">
            Prices are set when the round starts, equal to 5 USD in USDC per
            ticket.
          </p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 relative">
          <div className="absolute right-6 top-6 text-gray-500 font-bold">
            STEP 2
          </div>

          <h3 className="text-purple-400 text-2xl font-bold mb-4">
            Wait for the Draw
          </h3>
          <p className="text-gray-300">
            There is one draw every day alternating between 0 AM UTC and 12 PM
            UTC.
          </p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 relative">
          <div className="absolute right-6 top-6 text-gray-500 font-bold">
            STEP 3
          </div>

          <h3 className="text-purple-400 text-2xl font-bold mb-4">
            Check for Prizes
          </h3>
          <p className="text-gray-300">
            Once the round's over, come back to the page and check to see if
            you've won!
          </p>
        </div>
      </div>

      <div className="mt-16">
        <h3 className="text-purple-500 text-3xl font-bold mb-6">
          Winning Criteria
        </h3>
        <p className="text-white text-xl mb-4">
          The digits on your ticket must match in the correct order to win.
        </p>
        <p className="text-gray-300 mb-6">
          Here's an example lottery draw, with two tickets, A and B.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="text-gray-300 space-y-4">
            <ul className="list-disc pl-5 space-y-4">
              <li>
                Ticket A: The first 3 digits and the last 2 digits match, but
                the 4th digit is wrong, so this ticket only wins a "Match first
                3" prize.
              </li>
              <li>
                Ticket B: Even though the last 5 digits match, the first digit
                is wrong, so this ticket doesn't win a prize.
              </li>
            </ul>
            <p>
              Prize brackets don't 'stack': if you match the first 3 digits in
              order, you'll only win prizes from the 'Match 3' bracket, and not
              from 'Match 1' and 'Match 2'.
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-2xl">
            <div className="flex justify-between mb-6">
              {[9, 1, 3, 6, 6, 2].map((number, index) => (
                <div
                  key={index}
                  className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                  bg-yellow-500
                `}
                >
                  {number}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <div className="text-purple-400 font-bold w-8">A</div>
                <div className="flex bg-gray-700 rounded-full p-1 pl-2 pr-2 w-full justify-between">
                  <div className="text-white">9</div>
                  <div className="text-white">1</div>
                  <div className="text-white">3</div>
                  <div className="text-red-500">9</div>
                  <div className="text-white">6</div>
                  <div className="text-white">2</div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="text-purple-400 font-bold w-8">B</div>
                <div className="flex bg-gray-700 rounded-full p-1 pl-2 pr-2 w-full justify-between">
                  <div className="text-red-500">0</div>
                  <div className="text-white">1</div>
                  <div className="text-white">3</div>
                  <div className="text-white">6</div>
                  <div className="text-white">6</div>
                  <div className="text-white">2</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

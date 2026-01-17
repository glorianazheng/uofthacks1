import { Link } from "react-router";
import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";

export function Welcome() {
  return (
    <main className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Phone Device Frame */}
      <div className="relative w-full max-w-sm">
        {/* Phone Bezel */}
        <div className="bg-black rounded-3xl p-3 shadow-2xl" style={{ aspectRatio: "9/20" }}>
          {/* Phone Screen */}
          <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-2xl overflow-hidden flex flex-col relative">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-10" />

            {/* Status Bar */}
            <div className="h-8 px-6 flex items-center justify-between text-white text-xs pt-2">
              <span>9:41</span>
              <div className="flex gap-1">
                <span>📶</span>
                <span>📡</span>
                <span>🔋</span>
              </div>
            </div>

            {/* Screen Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
              <header className="flex flex-col items-center gap-2 pt-4">
                <h1 className="text-3xl font-bold text-white text-center">Bet → Consequence</h1>
                <p className="text-white/80 text-sm text-center">Make bets with friends, pay up with chores</p>
              </header>

              <div className="w-full space-y-4 max-w-xs">
                <Link
                  to="/dashboard"
                  className="block w-full px-6 py-3 bg-gradient-to-r from-green-400 to-teal-400 text-gray-900 font-bold rounded-xl text-center hover:shadow-lg transition-all"
                >
                  Get Started 🚀
                </Link>

                <nav className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 space-y-2">
                  <p className="text-white text-center font-semibold text-sm">How it works</p>
                  <ul className="space-y-1 text-white/90 text-xs">
                    <li>✅ Create a bet (sports, TV, weather, custom)</li>
                    <li>✅ Friends pick sides</li>
                    <li>✅ Winner locks in</li>
                    <li>✅ Loser completes a chore</li>
                  </ul>
                </nav>

                <button className="w-full px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all">
                  Learn More 📖
                </button>
              </div>
            </div>

            {/* Home Indicator */}
            <div className="h-6 flex items-center justify-center pb-2">
              <div className="w-32 h-1 bg-white/30 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}



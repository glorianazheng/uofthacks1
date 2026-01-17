import { PhoneLayout } from "../components/PhoneLayout";

export function meta() {
  return [
    { title: "STAKE - Explore" },
    { name: "description", content: "Public bets from friends" },
  ];
}

export default function Explore() {
  return (
    <PhoneLayout>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Explore</h1>
        <p className="text-gray-600 text-sm">Feed of public bets from friends</p>
        
        {/* Placeholder for public bets feed */}
        <div className="space-y-3 mt-4">
          <div className="bg-gray-100 rounded-lg p-4 h-24 flex items-center justify-center text-gray-500">
            No public bets yet
          </div>
        </div>
      </div>
    </PhoneLayout>
  );
}

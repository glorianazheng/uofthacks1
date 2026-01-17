import type { Route } from "./+types/home";
import { PhoneLayout } from "../components/PhoneLayout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "STAKE - Home" },
    { name: "description", content: "Active bets across all circles" },
  ];
}

export default function Home() {
  return (
    <PhoneLayout>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Home</h1>
        <p className="text-gray-600 text-sm">Active bets across all circles</p>
        
        {/* Placeholder for active bets */}
        <div className="space-y-3 mt-4">
          <div className="bg-gray-100 rounded-lg p-4 h-24 flex items-center justify-center text-gray-500">
            No active bets yet
          </div>
        </div>
      </div>
    </PhoneLayout>
  );
}

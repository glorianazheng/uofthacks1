import { PhoneLayout } from "../components/PhoneLayout";

export function meta() {
  return [
    { title: "STAKE - Circles" },
    { name: "description", content: "Your friend circles" },
  ];
}

export default function Circles() {
  return (
    <PhoneLayout>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Circles</h1>
        <p className="text-gray-600 text-sm">Your friend groups</p>
        
        {/* Placeholder for circles list */}
        <div className="space-y-3 mt-4">
          <div className="bg-gray-100 rounded-lg p-4 h-24 flex items-center justify-center text-gray-500">
            No circles yet
          </div>
        </div>
      </div>
    </PhoneLayout>
  );
}

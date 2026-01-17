import { PhoneLayout } from "../components/PhoneLayout";

export function meta() {
  return [
    { title: "STAKE - Create Bet" },
    { name: "description", content: "Create a new bet" },
  ];
}

export default function Create() {
  return (
    <PhoneLayout>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Create Bet</h1>
        <p className="text-gray-600 text-sm">Start a new prediction</p>
        
        {/* Placeholder for create form */}
        <div className="mt-4 space-y-4">
          <div className="bg-gray-100 rounded-lg p-4 h-12"></div>
          <div className="bg-gray-100 rounded-lg p-4 h-12"></div>
          <div className="bg-gray-100 rounded-lg p-4 h-12"></div>
        </div>
      </div>
    </PhoneLayout>
  );
}

import { PhoneLayout } from "../components/PhoneLayout";

export function meta() {
  return [
    { title: "STAKE - Profile" },
    { name: "description", content: "Your profile and stats" },
  ];
}

export default function Profile() {
  return (
    <PhoneLayout>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-gray-600 text-sm">Your stats and identity badges</p>
        
        {/* Placeholder for profile content */}
        <div className="mt-4 space-y-4">
          <div className="bg-gray-100 rounded-lg p-6 h-24 flex items-center justify-center text-gray-500">
            Profile content coming soon
          </div>
        </div>
      </div>
    </PhoneLayout>
  );
}

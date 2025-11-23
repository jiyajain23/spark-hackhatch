import { Suspense, lazy, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import YouTuberSearch from "./YouTuberSearch";
import YouTuberDashboard from "./YouTuberDashboard";
import { YouTuber } from "./types";

// Lazy load components with error boundaries
const LampDemo = lazy(() => 
  import("@/components/ui/lamp")
    .then(module => ({ default: module.LampDemo }))
    .catch(() => ({ 
      default: () => (
        <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-sky-50 via-blue-50 to-sky-100">
          <h1 className="text-5xl font-bold bg-gradient-to-br from-blue-600 via-blue-500 to-sky-500 bg-clip-text text-transparent">
            The Future of Creator Economy
          </h1>
        </div>
      )
    }))
);

const SplineSceneBasic = lazy(() => 
  import("@/components/ui/spline-demo")
    .then(module => ({ default: module.SplineSceneBasic }))
    .catch(() => ({ 
      default: () => (
        <div className="w-full h-[500px] bg-gradient-to-br from-blue-50 to-sky-100 rounded-lg flex items-center justify-center">
          <p className="text-blue-600 text-xl">3D Experience Loading...</p>
        </div>
      )
    }))
);

function App() {
  const [view, setView] = useState<"search" | "dashboard">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYoutuber, setSelectedYoutuber] = useState<YouTuber | null>(null);

  const handleYouTuberSelect = (youtuber: YouTuber) => {
    setSelectedYoutuber(youtuber);
    setView("dashboard");
  };

  const handleBackToSearch = () => {
    setSelectedYoutuber(null);
    setView("search");
  };

  // Sample data for the chart
  const tokenData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 600 },
    { name: 'Mar', value: 800 },
    { name: 'Apr', value: 1200 },
    { name: 'May', value: 1600 },
    { name: 'Jun', value: 2000 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-sky-100">
      {/* Hero Section with Lamp Effect */}
      <Suspense fallback={
        <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-sky-50 via-blue-50 to-sky-100">
          <div className="text-blue-600 text-2xl">Loading...</div>
        </div>
      }>
        <LampDemo />
      </Suspense>

      {/* 3D Spline Scene */}
      <div className="container mx-auto px-4 py-16">
        <Suspense fallback={
          <div className="flex items-center justify-center h-[600px] bg-gradient-to-br from-blue-50 to-sky-100 rounded-lg">
            <div className="text-blue-600 text-xl">Loading 3D Experience...</div>
          </div>
        }>
          <SplineSceneBasic />
        </Suspense>
      </div>

      {/* Token Growth Chart */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
            Token Growth Trends
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={tokenData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#3b82f6" />
              <YAxis stroke="#3b82f6" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #3b82f6',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* YouTuber Section with Toggle */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-center mb-8 gap-4">
            <button
              onClick={() => setView("search")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                view === "search"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Search YouTubers
            </button>
            <button
              onClick={() => setView("dashboard")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                view === "dashboard"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Dashboard
            </button>
          </div>
          
          {view === "search" ? (
            <YouTuberSearch 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onYouTuberSelect={handleYouTuberSelect}
            />
          ) : selectedYoutuber ? (
            <YouTuberDashboard 
              youtuber={selectedYoutuber}
              onBack={handleBackToSearch}
            />
          ) : (
            <div className="text-center py-8 text-gray-600">
              Please select a YouTuber to view their dashboard
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-sky-500 rounded-2xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">Ready to Join the Creator Economy?</h2>
          <p className="text-xl mb-8 opacity-90">
            Launch your token today and build a community like never before
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Get Started Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default App;

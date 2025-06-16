import { useState } from "react";
import Users from "./components/Users";
import  Groups  from "./components/Groups";

function App() {
  const [activeTab, setActiveTab] = useState("Users");

  const renderContent = () => {
    switch (activeTab) {
      case "Users":
        return <Users />;
      case "Groups":
        return <Groups/>;
      case "Query":
        return <p className="text-gray-600">View balances and who owes whom.</p>;
      default:
        return null;
    }
  };

  const tabs = ["Users", "Groups", "Query"];

  return (
    <div className="min-h-screen w-full bg-gray-100 text-black p-4 space-y-6 overflow-x-hidden">
      {/* Tab Selector */}
      <div className="flex justify-center">
        <div className="inline-flex items-center overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-gray-700 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-[1000px] mx-auto bg-white rounded-2xl shadow-xl border border-gray-300 p-6 overflow-hidden">
        <h1 className="text-3xl font-semibold mb-4">{activeTab}</h1>
        <div className="w-full">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default App;

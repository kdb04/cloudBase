import React from 'react';
import { FaPlane } from 'react-icons/fa';

const airlines = [
  { name: "Air India", logo: "/assets/airindia.png" },
  { name: "IndiGo", logo: "/assets/indigo.png" },
  { name: "AirAsia", logo: "/assets/airasia.png" },
  { name: "SpiceJet", logo: "/assets/spicejet.png" },
  { name: "Vistara", logo: "/assets/vistara.png" },
  { name: "Air France", logo: "/assets/airfrance.png" },
  { name: "British Airways", logo: "/assets/britishairways.png"},
  { name: "Emirates", logo: "/assets/emirates.png"},
  { name: "Etihad Airways", logo: "/assets/etihad.png"},
  { name: "KLM", logo: "/assets/klm.png"},
  { name: "Lufthansa", logo: "/assets/lufthansa.png"}, 
  { name: "Qatar Airways", logo: "/assets/qatar.png"}
];

const AirlineLogos = () => {
  return (
    <div className="w-full bg-purple-900 bg-opacity-50 backdrop-blur-md p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center justify-center">
          Airlines that travel with us <FaPlane className="ml-2" />
        </h2>
        <div className="max-h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {airlines.map((airline, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center justify-center bg-white rounded-lg p-4 hover:shadow-lg transition-all"
              >
                <div className="w-24 h-24 flex items-center justify-center">
                  <img
                    src={airline.logo}
                    alt={`${airline.name} logo`}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      console.log(`Failed to load: ${airline.logo}`);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <span className="mt-2 text-gray-800 text-sm font-medium text-center">
                  {airline.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirlineLogos;

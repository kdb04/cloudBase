import React from 'react';
import { FaPlane } from 'react-icons/fa';

const airlines = [
  { name: "Air India", logo: "./assets/airindia.png" },
  { name: "IndiGo", logo: "./assets/indigo.png" },
  { name: "AirAsia", logo: "./assets/airasia.png" },
  { name: "SpiceJet", logo: "./assets/spicejet.png" },
  { name: "Vistara", logo: "./assets/vistara.jpeg" },
  { name: "Air France", logo: "./assets/airfrance.png" },
  { name: "British Airways", logo: "./assets/britishairways.png"},
  { name: "Emirates", logo: "./assets/emirates.png"},
  { name: "Etihad Airways", logo: "./assets/etihad.png"},
  { name: "KLM", logo: "./assets/klm.png"},
  { name: "Lufthansa", logo: "./assets/lufthansa.jpg"}, 
  { name: "Qatar Airways", logo: "./assets/qatarairways.png"}
];

const AirlineLogos = () => {
  return (
    <div className="w-full bg-purple-900 bg-opacity-50 backdrop-blur-md p-4 mt-4">
      <div className="max-w-full mx-auto">
        <h2 className="text-xl font-bold mb-2 text-blue-400 flex items-center">
          Airlines that travel with us <FaPlane className="ml-2" />
        </h2>
        <div className="overflow-x-auto">
          <div className="flex space-x-4 pb-2">
            {airlines.map((airline, index) => (
              <div key={index} className="flex flex-col items-center">
                <img
                  src={airline.logo}
                  alt={`${airline.name} logo`}
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `/api/placeholder/48/48?text=${airline.name[0]}`;
                  }}
                />
                <span className="text-white text-xs mt-1">{airline.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirlineLogos;

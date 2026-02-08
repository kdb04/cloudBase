import { Plane } from 'lucide-react';

const airlines = [
  { name: 'Air India', logo: '/assets/airindia.png' },
  { name: 'IndiGo', logo: '/assets/indigo.png' },
  { name: 'AirAsia', logo: '/assets/airasia.png' },
  { name: 'SpiceJet', logo: '/assets/spicejet.png' },
  { name: 'Vistara', logo: '/assets/vistara.jpeg' },
  { name: 'Air France', logo: '/assets/airfrance.png' },
  { name: 'British Airways', logo: '/assets/britishairways.png' },
  { name: 'Emirates', logo: '/assets/emirates.png' },
  { name: 'Etihad Airways', logo: '/assets/etihad.png' },
  { name: 'KLM', logo: '/assets/klm.png' },
  { name: 'Lufthansa', logo: '/assets/lufthansa.jpg' },
  { name: 'Qatar Airways', logo: '/assets/qatarairways.png' },
];

const AirlineLogos = () => {
  return (
    <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center">
        Our Partner Airlines
        <Plane className="ml-2 text-primary" />
      </h2>
      <div className="max-h-96 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {airlines.map((airline, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center bg-white dark:bg-dark-surface rounded-lg p-4 hover:shadow-elevated hover:-translate-y-1 transition-all border border-gray-200 dark:border-dark-border"
            >
              <div className="w-20 h-20 flex items-center justify-center">
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
              <span className="mt-2 text-gray-800 dark:text-gray-200 text-xs font-medium text-center">
                {airline.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AirlineLogos;

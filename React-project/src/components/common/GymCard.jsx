import React from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaStar, FaDumbbell } from "react-icons/fa";
import { getGymMainImage } from "../../utils/gymImages";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const defaultImage = "https://via.placeholder.com/400x250.png?text=No+Image";


const resolveImage = (src) =>
  src?.startsWith("http") ? src : `${API_BASE}${src}`;

const GymCard = ({ gym }) => {
  const cover = getGymMainImage(gym);
  const rating = Number(gym.rating) || 0;
  const lowestPrice = gym.membership
    ? Math.min(
        gym.membership.oneMonth,
        gym.membership.threeMonths,
        gym.membership.sixMonths,
        gym.membership.oneYear
      )
    : null;

  return (
    <Link to={`/gym/${gym._id}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col group cursor-pointer">
    
      <div className="relative h-48 overflow-hidden">
        <img
          src={cover ? resolveImage(cover) : defaultImage}
          alt={gym.name}
          onError={(e) => (e.currentTarget.src = defaultImage)}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
          <FaStar className="text-yellow-400 text-xs" />
          <span className="text-xs font-bold text-gray-800">{rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-base font-bold text-gray-900 line-clamp-1">{gym.name}</h3>

        <div className="flex items-center gap-1 mt-1 text-gray-500">
          <FaMapMarkerAlt className="text-gray-900 text-xs flex-shrink-0" />
          <span className="text-xs line-clamp-1">{gym.location}</span>
        </div>

        <p className="text-xs text-gray-500 mt-2 line-clamp-2 flex-grow">{gym.description}</p>

        {/* Membership Pricing */}
        {gym.membership && (
          <div className="mt-3 grid grid-cols-2 gap-1">
            {[
              { label: "1 Month", price: gym.membership.oneMonth },
              { label: "3 Months", price: gym.membership.threeMonths },
              { label: "6 Months", price: gym.membership.sixMonths },
              { label: "1 Year", price: gym.membership.oneYear },
            ].map(({ label, price }) => (
              <div key={label} className="bg-gray-50 rounded-lg px-2 py-1 text-center">
                <div className="text-[10px] text-gray-700 font-medium">{label}</div>
                <div className="text-xs font-bold text-gray-900">Rs {price?.toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}

        
        <div className="mt-4">
          <div className="flex items-center justify-between">
            {lowestPrice !== null && (
              <div>
                <span className="text-[10px] text-gray-400">Starting from</span>
                <div className="text-sm font-bold text-gray-900">Rs {lowestPrice?.toLocaleString()}/mo</div>
              </div>
            )}
            <button className="bg-gray-900 ml-auto flex items-center gap-1 text-white text-xs font-semibold px-3 py-2 rounded-xl transition hover:opacity-90"
              >
              <FaDumbbell />
              View Details
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GymCard;

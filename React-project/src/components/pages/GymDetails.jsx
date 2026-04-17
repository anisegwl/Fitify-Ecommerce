import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaMapMarkerAlt, FaStar, FaDumbbell, FaCheckCircle, FaArrowLeft } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const defaultImage = "https://via.placeholder.com/800x500.png?text=No+Image";

const resolveImage = (src) => src?.startsWith("http") ? src : `${API_BASE}${src}`;

const GymDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGym = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/gyms/${id}`);
        setGym(res.data);
      } catch (err) {
        console.error(err);
        setError("Gym not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };
    fetchGym();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10 flex justify-center mt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
      </div>
    );
  }

  if (error || !gym) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10 flex flex-col items-center mt-20">
        <h2 className="text-2xl font-bold text-gray-900">Gym not found</h2>
        <p className="text-gray-600 mt-2">{error}</p>
        <button onClick={() => navigate("/gyms")} className="mt-6 px-6 py-3 rounded-xl bg-gray-900 text-white">Back to Gyms</button>
      </div>
    );
  }

  const rating = Number(gym.rating) || 0;

  const plans = [
    { label: "1 Month", value: "1 Month", price: gym.membership?.oneMonth },
    { label: "3 Months", value: "3 Months", price: gym.membership?.threeMonths },
    { label: "6 Months", value: "6 Months", price: gym.membership?.sixMonths },
    { label: "1 Year", value: "1 Year", price: gym.membership?.oneYear },
  ].filter(p => p.price); // filter out plans without a price

  const handleBookNow = (planValue) => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      if (window.confirm("You need to login to book a gym. Go to login page?")) {
        navigate("/login");
      }
      return;
    }
    navigate(`/gym-booking/${gym._id}?plan=${planValue}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 mb-6">
          <FaArrowLeft /> Back
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header Image */}
          <div className="relative h-64 md:h-96">
            <img
              src={gym.image?.length ? resolveImage(gym.image[0]) : defaultImage}
              alt={gym.name}
              onError={(e) => (e.currentTarget.src = defaultImage)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2">{gym.name}</h1>
                  <div className="flex items-center gap-4 text-sm md:text-base text-gray-200">
                    <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-green-400"/> {gym.location}</span>
                    <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg"><FaStar className="text-yellow-400"/> <span className="font-bold">{rating.toFixed(1)}</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaDumbbell className="text-gray-900" /> About this Gym
                </h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {gym.description}
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Highlights</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-700"><FaCheckCircle className="text-gray-900" /> Professional Trainers</div>
                  <div className="flex items-center gap-2 text-gray-700"><FaCheckCircle className="text-gray-900" /> Premium Equipment</div>
                  <div className="flex items-center gap-2 text-gray-700"><FaCheckCircle className="text-gray-900" /> Clean Facilities</div>
                  <div className="flex items-center gap-2 text-gray-700"><FaCheckCircle className="text-gray-900" /> Welcoming Environment</div>
                </div>
              </section>
            </div>

            {/* Right Sidebar - Pricing */}
            <div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Membership Plans</h3>
                
                {plans.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No membership plans available.</p>
                ) : (
                  <div className="space-y-4">
                    {plans.map((plan, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:border-gray-900 transition-colors">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-gray-800">{plan.label}</span>
                          <span className="text-xl font-bold text-gray-900">Rs {plan.price.toLocaleString()}</span>
                        </div>
                        <button
                          onClick={() => handleBookNow(plan.value)}
                          className="w-full py-2 rounded-lg font-semibold text-white bg-gray-900 hover:bg-gray-800 transition duration-200"
                        >
                          Book Now
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-6 text-xs text-gray-500 text-center">
                  Secure booking. Cancel anytime before start date.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymDetails;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import GymCard from "../common/GymCard";
import { FaDumbbell, FaArrowRight } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const GymSection = () => {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/gyms`, { timeout: 8000 });
      
        setGyms((res.data || []).slice(0, 5));
      } catch (err) {
        console.error("GymSection fetch error:", err);
        setError("Unable to load gyms.");
      } finally {
        setLoading(false);
      }
    };
    fetchGyms();
  }, []);

  // Don't render Section at all if there's nothing to show and not loading
  if (!loading && (error || gyms.length === 0)) return null;

  return (
    <section className="py-14 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Featured Gyms
              </h2>
            </div>
            <p className="text-gray-600 text-sm mt-1">
              Top-rated fitness centers - reach your peak performance.
            </p>
          </div>
          <Link
            to="/gyms"
            className="hidden sm:flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-all duration-300 bg-gray-900 hover:bg-gray-800 shadow-md hover:shadow-lg active:scale-95"
          >
            View All <FaArrowRight />
          </Link>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-2xl border border-gray-100 p-4 animate-pulse"
              >
                <div className="h-48 bg-gray-200 rounded-xl mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-10 bg-gray-200 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gyms.map((gym) => (
                <GymCard key={gym._id} gym={gym} />
              ))}
            </div>

            {/* Mobile View All Button */}
            <div className="sm:hidden mt-6 text-center">
              <Link
                to="/gyms"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-xl transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #065f46, #047857)" }}
              >
                View All Gyms <FaArrowRight />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default GymSection;

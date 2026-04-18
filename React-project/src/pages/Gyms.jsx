import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import GymCard from "../components/common/GymCard";
import { FaDumbbell, FaSearch, FaStar } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const Gyms = () => {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_BASE}/api/gyms`, { timeout: 10000 });
        setGyms(res.data || []);
      } catch (err) {
        console.error("Error fetching gyms:", err);
        setError("Failed to load gyms. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchGyms();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...gyms];

    if (q) {
      list = list.filter(
        (g) =>
          g.name?.toLowerCase().includes(q) ||
          g.location?.toLowerCase().includes(q) ||
          g.description?.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "ratingHigh":
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "priceLow":
        list.sort(
          (a, b) =>
            (a.membership?.oneMonth || 0) - (b.membership?.oneMonth || 0)
        );
        break;
      case "priceHigh":
        list.sort(
          (a, b) =>
            (b.membership?.oneMonth || 0) - (a.membership?.oneMonth || 0)
        );
        break;
      case "nameAZ":
        list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      default:
        break;
    }

    return list;
  }, [gyms, query, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <div className="flex items-center gap-3 mb-3">
        
            <h1 className="text-3xl md:text-4xl font-bold">Find Your Gym</h1>
          </div>
          <p className="text-white/80 max-w-xl">
            Discover top-rated gyms near you. Compare memberships, facilities, and prices to find your perfect fit.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3 flex items-center gap-3">
              <FaSearch className="text-white/60" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, location..."
                className="flex-1 bg-transparent text-white placeholder-white/50 outline-none"
              />
            </div>

            {/* Sort */}
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3">
              <label className="text-xs text-white/70 block mb-1">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-transparent text-white outline-none text-sm"
              >
                <option value="newest" className="text-black">Newest</option>
                <option value="ratingHigh" className="text-black">Highest Rated</option>
                <option value="priceLow" className="text-black">Price: Low to High</option>
                <option value="priceHigh" className="text-black">Price: High to Low</option>
                <option value="nameAZ" className="text-black">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Count */}
          {!loading && (
            <p className="mt-4 text-sm text-white/70">
              {filtered.length} gym{filtered.length !== 1 ? "s" : ""} found
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            ❌ {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-pulse">
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
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
            <FaDumbbell className="text-gray-300 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900">No gyms found</h3>
            <p className="text-gray-500 mt-2">Try a different search term.</p>
            {query && (
              <button
                onClick={() => setQuery("")}
                className="mt-5 px-6 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition"
                style={{ background: "#047857" }}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((gym) => (
              <GymCard key={gym._id} gym={gym} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gyms;

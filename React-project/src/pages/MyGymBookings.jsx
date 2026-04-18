import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaDumbbell, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const MyGymBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/api/gym-bookings/my`, {
          headers: { "auth-token": token }
        });
        setBookings(res.data);
      } catch (err) {
        console.error("Failed to fetch gym bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800 border-green-200";
      case "completed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          My Gym Bookings
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <FaDumbbell className="text-gray-300 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Bookings Yet</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't booked any gym memberships.</p>
            <Link to="/gyms" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition">
              Find a Gym
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map(booking => (
              <div key={booking._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{booking.gymName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-400" /> {booking.gymLocation}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 bg-gray-100 p-4 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Plan</p>
                      <p className="font-semibold text-gray-900">{booking.plan}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Date</p>
                      <p className="font-semibold text-gray-900 flex items-center gap-1">
                        <FaCalendarAlt className="text-gray-400 text-xs" />
                        {new Date(booking.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="md:w-48 flex flex-col items-end justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 text-right">
                  <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                  <p className="text-2xl font-extrabold text-gray-900">Rs {booking.price.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {booking.paymentMethod === 'cod' ? 'Pay at gym' : 'Paid online'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGymBookings;

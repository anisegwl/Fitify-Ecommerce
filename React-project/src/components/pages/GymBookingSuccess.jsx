import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { FaCheckCircle, FaDumbbell, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const GymBookingSuccess = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/api/gym-bookings/${id}`, {
          headers: { "auth-token": token }
        });
        setBooking(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Booking not found</h2>
        <Link to="/gyms" className="text-green-600 underline">Back to Gyms</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <FaCheckCircle className="text-5xl text-green-500" />
          </div>
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Booking Confirmed!</h1>
        <p className="text-lg text-gray-600 mb-10">
          Thank you for choosing <span className="font-bold">{booking.gymName}</span>. Your membership booking is successful.
        </p>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-left mb-10">
          <h2 className="text-xl font-bold text-gray-900 border-b pb-4 mb-6">Booking Details</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <FaDumbbell className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Gym</p>
                <p className="font-semibold text-gray-900">{booking.gymName}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><FaMapMarkerAlt /> {booking.gymLocation}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                <FaCalendarAlt className="text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Plan & Start Date</p>
                <p className="font-semibold text-gray-900">{booking.plan} Membership</p>
                <p className="text-sm text-gray-500 mt-1">Starting: {new Date(booking.startDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-green-500">Rs</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount to Pay</p>
                <p className="font-bold text-xl text-green-700">Rs {booking.price.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">Payment Method: {booking.paymentMethod === 'cod' ? 'Pay at Gym' : 'Online'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/my-gym-bookings" className="px-8 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-black transition">
            View My Bookings
          </Link>
          <Link to="/gyms" className="px-8 py-3 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition">
            Discover More Gyms
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GymBookingSuccess;

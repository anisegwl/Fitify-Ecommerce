import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaDumbbell, FaExclamationTriangle, FaMapMarkerAlt, FaCalendarAlt, FaUser } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const AdminGymBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/admin/gym-bookings`, {
        headers: { "auth-token": token }
      });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch gym bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/api/admin/gym-bookings/${id}/status`,
        { status: newStatus },
        { headers: { "auth-token": token } }
      );
      toast.success(" Status updated");
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b));
    } catch (err) {
      toast.error(" Failed to update status");
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const statusColors = {
    pending: "text-yellow-700 bg-yellow-100",
    confirmed: "text-green-700 bg-green-100",
    completed: "text-blue-700 bg-blue-100",
    cancelled: "text-red-700 bg-red-100"
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-900">
            <h2 className="text-2xl font-bold text-white"> Manage Gym Bookings</h2>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6 flex items-center gap-3">
              <FaExclamationTriangle className="text-red-500 text-xl" />
              <div>
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
            </div>
          ) : bookings.length === 0 && !error ? (
            <div className="text-center py-20">
              <FaDumbbell className="text-gray-300 text-6xl mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No bookings found</p>
            </div>
          ) : !error ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Gym Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Plan / Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900 flex items-center gap-2"><FaUser className="text-gray-400"/> {b.customer.fullName}</div>
                        <div className="text-xs text-gray-500 mt-1">{b.customer.phone}</div>
                        <div className="text-xs text-gray-500">{b.customer.address}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">{b.gymName}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1"><FaMapMarkerAlt/> {b.gymLocation}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-semibold mb-1">{b.plan}</span>
                        <div className="text-xs text-gray-500 flex items-center gap-1"><FaCalendarAlt/> {new Date(b.startDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-green-700">Rs {b.price.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 uppercase">{b.paymentMethod}</div>
                      </td>
                      <td className="px-6 py-4">
                        {updating === b._id ? (
                          <span className="text-xs text-gray-500 animate-pulse">Updating...</span>
                        ) : (
                          <select
                            value={b.status}
                            onChange={(e) => handleStatusChange(b._id, e.target.value)}
                            className={`text-xs font-bold uppercase rounded-full px-3 py-1 outline-none cursor-pointer border-transparent ring-1 ring-inset focus:ring-2 focus:ring-gray-400 ${statusColors[b.status] || "bg-gray-100 text-gray-800"}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        )}
                        <div className="text-[10px] text-gray-400 mt-2" title={new Date(b.createdAt).toLocaleString()}>
                          {new Date(b.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AdminGymBookings;

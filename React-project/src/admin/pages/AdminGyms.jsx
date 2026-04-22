import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import EditGymModal from "../components/EditGymModal.jsx";
import AddGym from "../components/AddGym";
import { FaEdit, FaTrash, FaDumbbell, FaExclamationTriangle, FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { getGymMainImage } from "../../utils/gymImages";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const defaultImage = "https://via.placeholder.com/100x100.png?text=No+Image";


const resolveImage = (src) =>
  src?.startsWith("http") ? src : `${API_BASE}${src}`;

const AdminGyms = () => {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingGym, setEditingGym] = useState(null);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const fetchGyms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE}/api/gyms`, { timeout: 10000 });
      setGyms(response.data || []);
    } catch (error) {
      console.error("Error fetching gyms:", error);
      if (error.code === "ECONNABORTED") {
        setError("Request timeout. Please try again.");
      } else if (error.response) {
        setError(`Server error: ${error.response.data?.message || "Failed to fetch gyms"}`);
      } else if (error.request) {
        setError("Cannot connect to server. Please check your connection.");
      } else {
        setError("An unexpected error occurred while fetching gyms.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGyms(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this gym?")) return;
    setDeleteLoading(id);
    try {
      const token = localStorage.getItem("token");
      if (!token) { toast.error(" Token missing. Login again."); return; }
      await axios.delete(`${API_BASE}/api/gyms/${id}`, {
        headers: { "auth-token": token },
        timeout: 10000,
      });
      toast.success(" Gym deleted");
      await fetchGyms();
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        (error?.response?.status === 401 ? "Invalid token (login again)" : "") ||
        "Failed to delete gym";
      toast.error(`${msg}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleUpdate = async (formData) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token missing. Login again.");
    await axios.put(`${API_BASE}/api/gyms/${editingGym._id}`, formData, {
      headers: { "auth-token": token },
      timeout: 10000,
    });
    toast.success("Gym updated");
    await fetchGyms();
    setEditingGym(null);
  };

  const renderStars = (rating) => {
    const r = Number(rating) || 0;
    return (
      <span className="flex items-center gap-1">
        <FaStar className="text-yellow-400" />
        <span className="text-sm font-medium text-gray-700">{r.toFixed(1)}</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <AddGym onSuccess={fetchGyms} />
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-900">
            <h2 className="text-2xl font-bold text-white"> Manage Gyms</h2>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
              <div className="flex items-center gap-3">
                <FaExclamationTriangle className="text-red-500 text-xl flex-shrink-0" />
                <div className="flex-grow">
                  <p className="text-red-700 font-medium">Error Loading Gyms</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
                <button onClick={fetchGyms} className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Retry
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading gyms...</p>
              </div>
            </div>
          ) : gyms.length === 0 && !error ? (
            <div className="text-center py-20">
              <FaDumbbell className="text-gray-300 text-6xl mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No gyms found</p>
              <p className="text-gray-400 text-sm mt-2">Add your first gym to get started</p>
            </div>
          ) : !error ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Membership (Rs)</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {gyms.map((gym) => (
                    <tr key={gym._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <img
                          src={getGymMainImage(gym) ? resolveImage(getGymMainImage(gym)) : defaultImage}
                          alt={gym.name}
                          onError={(e) => (e.currentTarget.src = defaultImage)}
                          className="w-16 h-16 object-cover rounded-lg shadow-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{gym.name}</p>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">{gym.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1 text-sm text-gray-700">
                          <FaMapMarkerAlt className="text-green-600" />
                          {gym.location}
                        </span>
                      </td>
                      <td className="px-6 py-4">{renderStars(gym.rating)}</td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>1M: <span className="font-semibold">Rs {gym.membership?.oneMonth}</span></div>
                          <div>3M: <span className="font-semibold">Rs {gym.membership?.threeMonths}</span></div>
                          <div>6M: <span className="font-semibold">Rs {gym.membership?.sixMonths}</span></div>
                          <div>1Y: <span className="font-semibold">Rs {gym.membership?.oneYear}</span></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingGym(gym)}
                            className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md
                            bg-gray-900
                            hover:bg-gray-800
                            active:scale-95
                            shadow-lg
                            hover:shadow-xl
                            transition-all
                            duration-200
                            flex
                            items-center
                            justify-center
                            gap-2"
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(gym._id)}
                            disabled={deleteLoading === gym._id}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md ${
                              deleteLoading === gym._id ? "bg-gray-400 text-white cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"
                            }`}
                          >
                            {deleteLoading === gym._id ? "Deleting..." : <><FaTrash /> Delete</>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

        {editingGym && (
          <EditGymModal
            gym={editingGym}
            onClose={() => setEditingGym(null)}
            onSave={handleUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default AdminGyms;

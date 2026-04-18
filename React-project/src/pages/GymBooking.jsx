import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const resolveImage = (src) => src?.startsWith("http") ? src : `${API_BASE}${src}`;

const GymBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedPlan = queryParams.get("plan");

  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    notes: "",
    startDate: "",
    paymentMethod: "cod"
  });

  useEffect(() => {
    const fetchGym = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/gyms/${id}`);
        setGym(res.data);
      } catch (err) {
        toast.error("Failed to load gym details");
        navigate("/gyms");
      } finally {
        setLoading(false);
      }
    };
    fetchGym();
  }, [id, navigate]);

  useEffect(() => {
    // Pre-fill user data if available
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setFormData(p => ({
          ...p,
          fullName: user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "",
          phone: user.phone || ""
        }));
      } catch (e) {}
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getPriceForPlan = (planLabel) => {
    if (!gym || !gym.membership) return 0;
    switch (planLabel) {
      case "1 Month": return gym.membership.oneMonth || 0;
      case "3 Months": return gym.membership.threeMonths || 0;
      case "6 Months": return gym.membership.sixMonths || 0;
      case "1 Year": return gym.membership.oneYear || 0;
      default: return 0;
    }
  };

  const price = getPriceForPlan(selectedPlan);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlan || !price) {
      toast.error("Invalid plan selected");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to book");
      navigate("/login");
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post(
        `${API_BASE}/api/gym-bookings`,
        {
          gymId: gym._id,
          plan: selectedPlan,
          price,
          startDate: formData.startDate,
          paymentMethod: formData.paymentMethod,
          customer: {
            fullName: formData.fullName,
            phone: formData.phone,
            address: formData.address,
            notes: formData.notes
          }
        },
        { headers: { "auth-token": token } }
      );

      toast.success("Booking confirmed!");
      navigate(`/gym-booking-success/${res.data.bookingId}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !gym) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }


  if (!selectedPlan || price === 0) {
    navigate(`/gym/${id}`);
    return null;
  }

  // Today's date for min date picker
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-6">
          <FaArrowLeft /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Details</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input 
                      required type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input 
                      required type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                      placeholder="+977 98..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Address *</label>
                  <input 
                    required type="text" name="address" value={formData.address} onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    placeholder="City, Area, Street"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                  <input 
                    required type="date" name="startDate" value={formData.startDate} min={today} onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">When will you start your membership?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
                  <textarea 
                    name="notes" value={formData.notes} onChange={handleChange} rows="3"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    placeholder="Any specific requests?"
                  ></textarea>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h3>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition border-green-500 bg-green-50">
                      <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === "cod"} onChange={handleChange} className="w-4 h-4 text-green-600 focus:ring-green-500" />
                      <span className="ml-3 font-medium text-gray-900">Pay at Gym (Cash/Card)</span>
                    </label>
                    <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition opacity-60">
                      <input type="radio" name="paymentMethod" value="online" disabled className="w-4 h-4" />
                      <span className="ml-3 font-medium text-gray-900">Online Payment (Coming Soon)</span>
                    </label>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-gray-900 w-full py-4 rounded-xl text-white font-bold text-lg transition shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                  
                >
                  {submitting ? "Processing..." : `Confirm Booking - Rs ${price.toLocaleString()}`}
                </button>
              </form>
            </div>
          </div>

          {/* Right Summary */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="p-6 bg-gray-50 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Booking Summary</h3>
              </div>
              <div className="p-6">
                <div className="flex gap-4 mb-6">
                  <img 
                    src={gym.image?.length ? resolveImage(gym.image[0]) : "https://via.placeholder.com/150"} 
                    alt={gym.name} 
                    className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 line-clamp-2">{gym.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{gym.location}</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Selected Plan</span>
                    <span className="font-semibold text-gray-900">{selectedPlan}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Start Date</span>
                    <span className="font-semibold text-gray-900">{formData.startDate ? new Date(formData.startDate).toLocaleDateString() : "-"}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total Due</span>
                    <span className="text-2xl font-extrabold text-gray-900">Rs {price.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-right">To be paid at the gym</p>
                </div>
                
                <div className="mt-6 flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-xl border border-green-100">
                  <FaCheckCircle className="flex-shrink-0" />
                  <span>Secure booking. No hidden fees.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymBooking;

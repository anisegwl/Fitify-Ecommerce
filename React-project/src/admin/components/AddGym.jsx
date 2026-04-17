import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaImage, FaTimes, FaUpload, FaLink } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// ✅ Defined OUTSIDE AddGym so it keeps a stable identity across re-renders
// If defined inside, React unmounts/remounts it on every keystroke, losing focus
const Field = ({ label, name, value, onChange, type = "text", placeholder, min, max, step, error }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 ${
        error ? "border-red-300 focus:ring-red-500" : "border-gray-200 focus:ring-green-500"
      }`}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const EMPTY_GYM = {
  name: "",
  description: "",
  location: "",
  rating: "",
  oneMonth: "",
  threeMonths: "",
  sixMonths: "",
  oneYear: "",
  image: null,
};

const AddGym = ({ onSuccess }) => {
  const [gym, setGym] = useState(EMPTY_GYM);
  const [loading, setLoading] = useState(false);
  const [imageMode, setImageMode] = useState("upload"); // "upload" | "url"
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFieldErrors((p) => ({ ...p, [name]: "" }));

    if (type === "file") {
      const file = files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setFieldErrors((p) => ({ ...p, image: "Please upload an image file" }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors((p) => ({ ...p, image: "Image must be less than 5MB" }));
        return;
      }
      setGym((p) => ({ ...p, image: file }));
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      return;
    }
    setGym((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const errors = {};
    if (!gym.name || gym.name.trim().length < 3)
      errors.name = "Name must be at least 3 characters";
    if (!gym.description || gym.description.trim().length < 5)
      errors.description = "Description must be at least 5 characters";
    if (!gym.location || gym.location.trim().length < 3)
      errors.location = "Location is required";
    const rating = Number(gym.rating);
    if (gym.rating !== "" && (isNaN(rating) || rating < 0 || rating > 5))
      errors.rating = "Rating must be between 0 and 5";
    if (!gym.oneMonth || isNaN(Number(gym.oneMonth)) || Number(gym.oneMonth) <= 0)
      errors.oneMonth = "1-month price is required";
    if (!gym.threeMonths || isNaN(Number(gym.threeMonths)) || Number(gym.threeMonths) <= 0)
      errors.threeMonths = "3-month price is required";
    if (!gym.sixMonths || isNaN(Number(gym.sixMonths)) || Number(gym.sixMonths) <= 0)
      errors.sixMonths = "6-month price is required";
    if (!gym.oneYear || isNaN(Number(gym.oneYear)) || Number(gym.oneYear) <= 0)
      errors.oneYear = "1-year price is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearImage = () => {
    setGym((p) => ({ ...p, image: null }));
    setImagePreview(null);
    setFileName("");
    setImageUrl("");
    setFieldErrors((p) => ({ ...p, image: "" }));
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setImagePreview(url || null);
    setFieldErrors((p) => ({ ...p, image: "" }));
  };

  const switchMode = (mode) => {
    setImageMode(mode);
    clearImage();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) { toast.error("❌ Fix form errors first"); return; }

    const token = localStorage.getItem("token");
    if (!token) { toast.error("❌ Token missing. Login again as admin."); return; }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", gym.name.trim());
      formData.append("description", gym.description.trim());
      formData.append("location", gym.location.trim());
      formData.append("rating", String(gym.rating || 0));
      formData.append("membership[oneMonth]", String(gym.oneMonth));
      formData.append("membership[threeMonths]", String(gym.threeMonths));
      formData.append("membership[sixMonths]", String(gym.sixMonths));
      formData.append("membership[oneYear]", String(gym.oneYear));
      // Image: file takes priority, then URL
      if (imageMode === "upload" && gym.image) {
        formData.append("myfile", gym.image);
      } else if (imageMode === "url" && imageUrl.trim()) {
        formData.append("imageUrl", imageUrl.trim());
      }

      const res = await axios.post(`${API_BASE}/api/gyms/addgym`, formData, {
        headers: { "auth-token": token },
        timeout: 15000,
      });

      toast.success("✅ Gym added!");
      onSuccess?.(res.data);
      setGym(EMPTY_GYM);
      setImagePreview(null);
      setFileName("");
      setImageUrl("");
      setFieldErrors({});
    } catch (err) {
      console.error("AddGym error:", err);
      const apiErrors = err?.response?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        toast.error(`❌ ${apiErrors.map((e) => e.msg).join(", ")}`);
        return;
      }
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 401 ? "Invalid token (login again)" : "") ||
        (err.code === "ECONNABORTED" ? "Request timeout." : "Failed to add gym.");
      toast.error(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4" style={{ background: "linear-gradient(135deg, #065f46, #047857)" }}>
        <h3 className="text-xl font-bold text-white">🏋️ Add New Gym</h3>
        <p className="text-sm text-green-100 mt-1">Admin only</p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Name + Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Gym Name *" name="name" value={gym.name} onChange={handleChange} placeholder="e.g. FitZone Elite" error={fieldErrors.name} />
            <Field label="Location *" name="location" value={gym.location} onChange={handleChange} placeholder="e.g. Kathmandu, Baneshwor" error={fieldErrors.location} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
            <textarea
              name="description"
              value={gym.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe the gym facilities, equipment, trainers..."
              className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 ${
                fieldErrors.description ? "border-red-300 focus:ring-red-500" : "border-gray-200 focus:ring-green-500"
              }`}
            />
            {fieldErrors.description && <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>}
          </div>

          {/* Rating */}
          <Field label="Rating (0–5)" name="rating" value={gym.rating} onChange={handleChange} type="number" min="0" max="5" step="0.1" placeholder="e.g. 4.5" error={fieldErrors.rating} />

          {/* Membership Prices */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Membership Prices (Rs) *</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="1 Month" name="oneMonth" value={gym.oneMonth} onChange={handleChange} type="number" min="0" error={fieldErrors.oneMonth} />
              <Field label="3 Months" name="threeMonths" value={gym.threeMonths} onChange={handleChange} type="number" min="0" error={fieldErrors.threeMonths} />
              <Field label="6 Months" name="sixMonths" value={gym.sixMonths} onChange={handleChange} type="number" min="0" error={fieldErrors.sixMonths} />
              <Field label="1 Year" name="oneYear" value={gym.oneYear} onChange={handleChange} type="number" min="0" error={fieldErrors.oneYear} />
            </div>
          </div>

          {/* Image Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Gym Image</label>

            {/* Mode Toggle */}
            <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-4 w-fit">
              <button
                type="button"
                onClick={() => switchMode("upload")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${
                  imageMode === "upload"
                    ? "bg-green-700 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaUpload className="text-xs" /> Upload File
              </button>
              <button
                type="button"
                onClick={() => switchMode("url")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${
                  imageMode === "url"
                    ? "bg-green-700 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaLink className="text-xs" /> Image URL
              </button>
            </div>

            {/* URL Mode */}
            {imageMode === "url" && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  placeholder="https://example.com/gym-image.jpg"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="URL Preview"
                      onError={() => setImagePreview(null)}
                      className="w-full h-48 object-cover rounded-2xl border border-gray-100"
                    />
                    <button type="button" onClick={clearImage} className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow">
                      <FaTimes />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Upload Mode */}
            {imageMode === "upload" && (
              !imagePreview ? (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center">
                  <FaImage className="text-gray-400 text-4xl mx-auto mb-3" />
                  <label className="cursor-pointer inline-block">
                    <span className="px-6 py-2 rounded-xl font-semibold text-white hover:opacity-90 transition" style={{ background: "#047857" }}>
                      Choose Image
                    </span>
                    <input type="file" accept="image/*" onChange={handleChange} className="hidden" />
                  </label>
                  {fieldErrors.image && <p className="mt-2 text-sm text-red-600">{fieldErrors.image}</p>}
                </div>
              ) : (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-2xl border border-gray-100" />
                  <button type="button" onClick={clearImage} className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow" title="Remove image">
                    <FaTimes />
                  </button>
                  <div className="mt-2 text-sm text-gray-600">📄 {fileName}</div>
                </div>
              )
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 font-semibold text-white transition"
            style={{ background: loading ? "#9ca3af" : "#047857", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Adding..." : "Add Gym"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddGym;

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaImage, FaTimes, FaUpload, FaLink } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

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
        error ? "border-red-300 focus:ring-red-500" : "border-gray-200 focus:ring-gray-500"
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
};

const AddGym = ({ onSuccess }) => {
  const [gym, setGym] = useState(EMPTY_GYM);
  const [loading, setLoading] = useState(false);
  const [mainImageMode, setMainImageMode] = useState("upload");
  const [mainFile, setMainFile] = useState(null);
  const [mainPreview, setMainPreview] = useState(null);
  const [mainUrl, setMainUrl] = useState("");
  const [mainFileName, setMainFileName] = useState("");
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryUrlText, setGalleryUrlText] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const readImagePreview = (file, onData) => {
    const reader = new FileReader();
    reader.onloadend = () => onData(reader.result);
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFieldErrors((p) => ({ ...p, [name]: "" }));
    setGym((p) => ({ ...p, [name]: value }));
  };

  const handleMainFile = (e) => {
    const file = e.target.files?.[0];
    setFieldErrors((p) => ({ ...p, mainImage: "" }));
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFieldErrors((p) => ({ ...p, mainImage: "Please upload an image file" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors((p) => ({ ...p, mainImage: "Image must be less than 5MB" }));
      return;
    }
    setMainFile(file);
    setMainFileName(file.name);
    readImagePreview(file, setMainPreview);
  };

  const handleGalleryFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    const next = [];
    for (const file of picked) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Each gallery image must be under 5MB");
        continue;
      }
      next.push(file);
    }
    if (next.length) setGalleryFiles((p) => [...p, ...next]);
  };

  const removeGalleryFile = (idx) => {
    setGalleryFiles((p) => p.filter((_, i) => i !== idx));
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

  const clearMainImage = () => {
    setMainFile(null);
    setMainPreview(null);
    setMainFileName("");
    setMainUrl("");
    setFieldErrors((p) => ({ ...p, mainImage: "" }));
  };

  const handleMainUrlChange = (e) => {
    const url = e.target.value;
    setMainUrl(url);
    setMainPreview(url || null);
    setFieldErrors((p) => ({ ...p, mainImage: "" }));
  };

  const switchMainMode = (mode) => {
    setMainImageMode(mode);
    clearMainImage();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) { toast.error(" Fix form errors first"); return; }

    const token = localStorage.getItem("token");
    if (!token) { toast.error(" Token missing. Login again as admin."); return; }

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
      if (mainImageMode === "upload" && mainFile) {
        formData.append("mainfile", mainFile);
      } else if (mainImageMode === "url" && mainUrl.trim()) {
        formData.append("mainImageUrl", mainUrl.trim());
      }
      const extraUrls = galleryUrlText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      formData.append("galleryUrls", JSON.stringify(extraUrls));
      galleryFiles.forEach((file) => formData.append("gallery", file));

      const res = await axios.post(`${API_BASE}/api/gyms/addgym`, formData, {
        headers: { "auth-token": token },
        timeout: 15000,
      });

      toast.success("Gym added!");
      onSuccess?.(res.data);
      setGym(EMPTY_GYM);
      clearMainImage();
      setGalleryFiles([]);
      setGalleryUrlText("");
      setMainImageMode("upload");
      setFieldErrors({});
    } catch (err) {
      console.error("AddGym error:", err);
      const apiErrors = err?.response?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        toast.error(`${apiErrors.map((e) => e.msg).join(", ")}`);
        return;
      }
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 401 ? "Invalid token (login again)" : "") ||
        (err.code === "ECONNABORTED" ? "Request timeout." : "Failed to add gym.");
      toast.error(`${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gray-900 px-6 py-4" >
        <h3 className="text-xl font-bold text-white"> Add New Gym</h3>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
         
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Gym Name *" name="name" value={gym.name} onChange={handleChange} error={fieldErrors.name} />
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
                fieldErrors.description ? "border-red-300 focus:ring-red-500" : "border-gray-200 focus:ring-gray-500"
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

          {/* Main / cover image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Main cover image</label>
            <p className="text-xs text-gray-500 mb-3">Used on gym cards and at the top of the gym detail page.</p>

            <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-4 w-fit">
              <button
                type="button"
                onClick={() => switchMainMode("upload")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${
                  mainImageMode === "upload"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaUpload className="text-xs" /> Upload
              </button>
              <button
                type="button"
                onClick={() => switchMainMode("url")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${
                  mainImageMode === "url"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaLink className="text-xs" /> URL
              </button>
            </div>

            {mainImageMode === "url" && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={mainUrl}
                  onChange={handleMainUrlChange}
                  placeholder="https://example.com/cover.jpg"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                />
                {mainPreview && (
                  <div className="relative">
                    <img
                      src={mainPreview}
                      alt="Preview"
                      onError={() => setMainPreview(null)}
                      className="w-full h-48 object-cover rounded-2xl border border-gray-100"
                    />
                    <button type="button" onClick={clearMainImage} className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow">
                      <FaTimes />
                    </button>
                  </div>
                )}
              </div>
            )}

            {mainImageMode === "upload" && (
              !mainPreview ? (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center">
                  <FaImage className="text-gray-400 text-4xl mx-auto mb-3" />
                  <label className="cursor-pointer inline-block">
                    <span className="px-6 py-2 rounded-xl font-semibold text-white hover:opacity-90 transition bg-gray-900">
                      Choose cover image
                    </span>
                    <input type="file" accept="image/*" onChange={handleMainFile} className="hidden" />
                  </label>
                  {fieldErrors.mainImage && <p className="mt-2 text-sm text-red-600">{fieldErrors.mainImage}</p>}
                </div>
              ) : (
                <div className="relative">
                  <img src={mainPreview} alt="Preview" className="w-full h-64 object-cover rounded-2xl border border-gray-100" />
                  <button type="button" onClick={clearMainImage} className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow" title="Remove">
                    <FaTimes />
                  </button>
                  <div className="mt-2 text-sm text-gray-600">📄 {mainFileName}</div>
                </div>
              )
            )}
          </div>

          {/* Gallery */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Gym gallery (optional)</label>
            <p className="text-xs text-gray-500 mb-3">Extra photos appear on the gym detail page in a gallery (below highlights).</p>

            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 mb-4">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gray-900">
                <FaUpload className="text-xs" />
                Add photos
                <input type="file" accept="image/*" multiple onChange={handleGalleryFiles} className="hidden" />
              </label>
              {galleryFiles.length > 0 && (
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  {galleryFiles.map((f, i) => (
                    <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <span className="truncate">{f.name}</span>
                      <button type="button" onClick={() => removeGalleryFile(i)} className="text-red-600 font-semibold shrink-0">
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Or paste image URLs (one per line)</label>
              <textarea
                value={galleryUrlText}
                onChange={(e) => setGalleryUrlText(e.target.value)}
                rows={3}
                
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 font-semibold text-white transition
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
            {loading ? "Adding..." : "Add Gym"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddGym;

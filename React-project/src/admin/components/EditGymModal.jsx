import React, { useState, useEffect } from "react";
import { FaTimes, FaUpload, FaLink, FaImage } from "react-icons/fa";

const EditGymModal = ({ gym, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    rating: "",
    oneMonth: "",
    threeMonths: "",
    sixMonths: "",
    oneYear: "",
    image: null,
  });
  const [imageMode, setImageMode] = useState("upload"); // "upload" | "url"
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (gym) {
      setForm({
        name: gym.name || "",
        description: gym.description || "",
        location: gym.location || "",
        rating: gym.rating ?? "",
        oneMonth: gym.membership?.oneMonth ?? "",
        threeMonths: gym.membership?.threeMonths ?? "",
        sixMonths: gym.membership?.sixMonths ?? "",
        oneYear: gym.membership?.oneYear ?? "",
        image: null,
      });
      setImageMode("upload");
      setImageUrl("");
      setImagePreview(null);
    }
  }, [gym]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files?.[0];
      if (!file) return;
      setForm((p) => ({ ...p, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      return;
    }
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setImagePreview(url || null);
  };

  const clearImage = () => {
    setForm((p) => ({ ...p, image: null }));
    setImageUrl("");
    setImagePreview(null);
  };

  const switchMode = (mode) => {
    setImageMode(mode);
    clearImage();
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("location", form.location.trim());
      formData.append("rating", String(form.rating || 0));
      formData.append("membership[oneMonth]", String(form.oneMonth));
      formData.append("membership[threeMonths]", String(form.threeMonths));
      formData.append("membership[sixMonths]", String(form.sixMonths));
      formData.append("membership[oneYear]", String(form.oneYear));
      if (imageMode === "upload" && form.image) {
        formData.append("myfile", form.image);
      } else if (imageMode === "url" && imageUrl.trim()) {
        formData.append("imageUrl", imageUrl.trim());
      }

      await onSave(formData);
    } catch (err) {
      setError(err.message || "Failed to update gym");
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, name, type = "text", min, max, step }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">✏️ Edit Gym</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">❌ {error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Gym Name *" name="name" />
            <Field label="Location *" name="location" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <Field label="Rating (0–5)" name="rating" type="number" min="0" max="5" step="0.1" />

          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Membership Prices (Rs)</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field label="1 Month" name="oneMonth" type="number" min="0" />
              <Field label="3 Months" name="threeMonths" type="number" min="0" />
              <Field label="6 Months" name="sixMonths" type="number" min="0" />
              <Field label="1 Year" name="oneYear" type="number" min="0" />
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Update Image (optional)</label>

            {/* Mode Toggle */}
            <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-3 w-fit">
              <button
                type="button"
                onClick={() => switchMode("upload")}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium transition ${
                  imageMode === "upload" ? "bg-green-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaUpload /> Upload File
              </button>
              <button
                type="button"
                onClick={() => switchMode("url")}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium transition ${
                  imageMode === "url" ? "bg-green-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaLink /> Image URL
              </button>
            </div>

            {/* URL Mode */}
            {imageMode === "url" && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  placeholder="https://example.com/gym-image.jpg"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                />
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="URL Preview"
                      onError={() => setImagePreview(null)}
                      className="w-full h-40 object-cover rounded-xl border"
                    />
                    <button type="button" onClick={clearImage} className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow">
                      <FaTimes size={10} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Upload Mode */}
            {imageMode === "upload" && (
              <div className="space-y-2">
                <input type="file" accept="image/*" onChange={handleChange} className="text-sm text-gray-600" />
                {imagePreview && (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="mt-2 w-full h-40 object-cover rounded-xl border" />
                    <button type="button" onClick={clearImage} className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow">
                      <FaTimes size={10} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 sticky bottom-0">
          <button onClick={onClose} className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition text-sm font-medium">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-white font-semibold text-sm transition"
            style={{ background: saving ? "#9ca3af" : "#047857", cursor: saving ? "not-allowed" : "pointer" }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditGymModal;

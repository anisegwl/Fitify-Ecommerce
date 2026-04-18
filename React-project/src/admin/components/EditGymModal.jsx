import React, { useState, useEffect } from "react";
import { FaTimes, FaUpload, FaLink, FaImage } from "react-icons/fa";
import { getGymMainImage, getGymGallery } from "../../utils/gymImages";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const resolveImage = (src) =>
  !src ? "" : src.startsWith("http") ? src : `${API_BASE}${src}`;

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
  });
  const [mainImageMode, setMainImageMode] = useState("upload");
  const [mainFile, setMainFile] = useState(null);
  const [mainUrl, setMainUrl] = useState("");
  const [mainPreview, setMainPreview] = useState(null);
  const [existingMainUrl, setExistingMainUrl] = useState("");
  const [galleryKeep, setGalleryKeep] = useState([]);
  const [galleryNewFiles, setGalleryNewFiles] = useState([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
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
      });
      setMainImageMode("upload");
      setMainFile(null);
      setMainUrl("");
      setMainPreview(null);
      setExistingMainUrl(resolveImage(getGymMainImage(gym)));
      setGalleryKeep(getGymGallery(gym));
      setGalleryNewFiles([]);
      setNewGalleryUrl("");
      setError("");
    }
  }, [gym]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file" && name === "mainfile") {
      const file = files?.[0];
      if (!file) return;
      setMainFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setMainPreview(reader.result);
      reader.readAsDataURL(file);
      return;
    }
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleMainUrlChange = (e) => {
    const url = e.target.value;
    setMainUrl(url);
    setMainPreview(url || null);
  };

  const clearNewMain = () => {
    setMainFile(null);
    setMainUrl("");
    setMainPreview(null);
  };

  const switchMainMode = (mode) => {
    setMainImageMode(mode);
    clearNewMain();
  };

  const handleGalleryPick = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    const valid = [];
    for (const file of picked) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) {
        setError("Each gallery image must be under 5MB");
        continue;
      }
      valid.push(file);
    }
    if (valid.length) setGalleryNewFiles((p) => [...p, ...valid]);
  };

  const removeNewGalleryFile = (idx) => {
    setGalleryNewFiles((p) => p.filter((_, i) => i !== idx));
  };

  const removeGalleryUrl = (url) => {
    setGalleryKeep((p) => p.filter((u) => u !== url));
  };

  const addGalleryUrl = () => {
    const u = newGalleryUrl.trim();
    if (!u) return;
    if (!/^https?:\/\//i.test(u)) {
      setError("Gallery URL must start with http:// or https://");
      return;
    }
    setGalleryKeep((p) => [...p, u]);
    setNewGalleryUrl("");
    setError("");
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

      if (mainImageMode === "upload" && mainFile) {
        formData.append("mainfile", mainFile);
      } else if (mainImageMode === "url" && mainUrl.trim()) {
        formData.append("mainImageUrl", mainUrl.trim());
      }

      formData.append("galleryKeep", JSON.stringify(galleryKeep));
      galleryNewFiles.forEach((file) => formData.append("gallery", file));

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

  const mainShown = mainPreview || existingMainUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900"> Edit Gym</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm"> {error}</div>}

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

          {/* Main image */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Main cover image</label>
            <p className="text-[11px] text-gray-500 mb-2">Leave unchanged if you only want to edit the gallery.</p>
            <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-3 w-fit">
              <button
                type="button"
                onClick={() => switchMainMode("upload")}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium transition ${
                  mainImageMode === "upload" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaUpload /> Upload
              </button>
              <button
                type="button"
                onClick={() => switchMainMode("url")}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium transition ${
                  mainImageMode === "url" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaLink /> URL
              </button>
            </div>

            {mainShown && (
              <div className="relative mb-3 inline-block max-w-full">
                <img
                  src={mainShown}
                  alt="Cover preview"
                  className="max-h-40 rounded-xl border object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                {mainPreview && (
                  <button
                    type="button"
                    onClick={clearNewMain}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow"
                  >
                    <FaTimes size={10} />
                  </button>
                )}
              </div>
            )}

            {mainImageMode === "url" && (
              <input
                type="text"
                value={mainUrl}
                onChange={handleMainUrlChange}
                placeholder="New cover image URL (optional)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
            )}
            {mainImageMode === "upload" && (
              <input name="mainfile" type="file" accept="image/*" onChange={handleChange} className="text-sm text-gray-600" />
            )}
          </div>

          {/* Gallery */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Gym gallery</label>
            <p className="text-[11px] text-gray-500 mb-2">Shown on the gym page below highlights. Click a photo to enlarge.</p>

            {galleryKeep.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                {galleryKeep.map((url) => (
                  <div key={url} className="relative group rounded-lg overflow-hidden border aspect-square">
                    <img
                      src={resolveImage(url)}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/120?text=Bad+URL";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryUrl(url)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-90 hover:opacity-100"
                      title="Remove from gallery"
                    >
                      <FaTimes size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800">
                <FaImage /> Add photos
                <input type="file" accept="image/*" multiple onChange={handleGalleryPick} className="hidden" />
              </label>
            </div>
            {galleryNewFiles.length > 0 && (
              <ul className="text-xs text-gray-600 space-y-1 mb-3">
                {galleryNewFiles.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex justify-between gap-2 bg-gray-50 rounded px-2 py-1">
                    <span className="truncate">{f.name} (new)</span>
                    <button type="button" onClick={() => removeNewGalleryFile(i)} className="text-red-600 shrink-0">
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newGalleryUrl}
                onChange={(e) => setNewGalleryUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={addGalleryUrl}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-200 hover:bg-gray-300"
              >
                Add URL
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 sticky bottom-0">
          <button onClick={onClose} className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition text-sm font-medium">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-white font-semibold text-sm transition 
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
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditGymModal;

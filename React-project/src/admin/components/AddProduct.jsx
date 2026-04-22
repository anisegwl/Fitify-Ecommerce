import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaImage, FaTimes, FaUpload, FaLink } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const AddProduct = ({ onSuccess }) => {
  const [product, setProduct] = useState({
    title: "",
    description: "",
    price: "",
    discount: "",
    instock: "",
    category: "",
  });

  const [loading, setLoading] = useState(false);
  const [imageMode, setImageMode] = useState("upload");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const categories = ["Men", "Women", "Supplements", "Accessories"];
  const availableSizes = ["S", "M", "L", "XL", "2XL"];
  const [selectedSizes, setSelectedSizes] = useState([]);

  const handleSizeToggle = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFieldErrors((p) => ({ ...p, [name]: "" }));
    setProduct((p) => ({ ...p, [name]: value }));
  };

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    setFieldErrors((p) => ({ ...p, image: "" }));
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFieldErrors((p) => ({ ...p, image: "Please upload an image file" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors((p) => ({ ...p, image: "Image must be less than 5MB" }));
      return;
    }

    setImageFile(file);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setImagePreview(url || null);
    setFieldErrors((p) => ({ ...p, image: "" }));
  };

  const switchImageMode = (mode) => {
    setImageMode(mode);
    clearImage();
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFileName("");
    setImageUrl("");
    setFieldErrors((p) => ({ ...p, image: "" }));
  };

  const validate = () => {
    const errors = {};

    if (!product.title || product.title.trim().length < 3)
      errors.title = "Title must be at least 3 characters";

    if (!product.description || product.description.trim().length < 5)
      errors.description = "Description must be at least 5 characters";

    const price = Number(product.price);
    if (!Number.isFinite(price) || price <= 0)
      errors.price = "Price must be greater than 0";

    const discount = Number(product.discount || 0);
    if (!Number.isFinite(discount) || discount < 0)
      errors.discount = "Discount cannot be negative";

    const stock = Number(product.instock);
    if (!Number.isFinite(stock) || stock < 0)
      errors.instock = "Stock must be 0 or greater";

    if (!categories.includes(product.category))
      errors.category = "Select a valid category";

    // Validate image
    if (imageMode === "upload" && !imageFile) {
      errors.image = "Please upload an image";
    } else if (imageMode === "url" && !imageUrl.trim()) {
      errors.image = "Please enter an image URL";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!validate()) {
      toast.error(" Fix form errors first");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Token missing. Login again as admin.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", product.title.trim());
      formData.append("description", product.description.trim());
      formData.append("price", String(product.price));
      formData.append("discount", String(product.discount || 0));
      formData.append("instock", String(product.instock));
      formData.append("category", product.category);

      // Handle image based on mode
      if (imageMode === "upload" && imageFile) {
        formData.append("myfile", imageFile);
      } else if (imageMode === "url" && imageUrl.trim()) {
        formData.append("imageUrl", imageUrl.trim());
      }

      // Handle sizes
      if (selectedSizes.length > 0) {
        formData.append("sizes", JSON.stringify(selectedSizes));
      }

      const res = await axios.post(`${API_BASE}/api/products/addproduct`, formData, {
        headers: {
          "auth-token": token,
        },
        timeout: 15000,
      });

      toast.success("Product added!");
      onSuccess?.(res.data);

      // reset
      setProduct({
        title: "",
        description: "",
        price: "",
        discount: "",
        instock: "",
        category: "",
      });
      clearImage();
      setImageMode("upload");
      setSelectedSizes([]);
      setFieldErrors({});
    } catch (err) {
      console.error("AddProduct error:", err);

      const apiErrors = err?.response?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        toast.error(` ${apiErrors.map((e) => e.msg).join(", ")}`);
        return;
      }

      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (err?.response?.status === 401 ? "Invalid token (login again)" : "") ||
        (err.code === "ECONNABORTED"
          ? "Request timeout. Try again."
          : "Failed to add product.");

      toast.error(` ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 bg-gray-900">
        <h3 className="text-xl font-bold text-white">Add New Product</h3>
        <p className="text-sm text-gray-200 mt-1">Admin only</p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title *
              </label>
              <input
                name="title"
                value={product.title}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 ${
                  fieldErrors.title
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-200 focus:ring-blue-500"
                }`}
              />
              {fieldErrors.title && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={product.category}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 ${
                  fieldErrors.category
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-200 focus:ring-blue-500"
                }`}
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {fieldErrors.category && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.category}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={product.description}
              onChange={handleChange}
              rows={4}
              className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 ${
                fieldErrors.description
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-200 focus:ring-blue-500"
              }`}
            />
            {fieldErrors.description && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={product.price}
                onChange={handleChange}
                min="0"
                className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 ${
                  fieldErrors.price
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-200 focus:ring-blue-500"
                }`}
              />
              {fieldErrors.price && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Discount
              </label>
              <input
                type="number"
                name="discount"
                value={product.discount}
                onChange={handleChange}
                min="0"
                className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 ${
                  fieldErrors.discount
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-200 focus:ring-blue-500"
                }`}
                placeholder="0"
              />
              {fieldErrors.discount && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.discount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stock *
              </label>
              <input
                type="number"
                name="instock"
                value={product.instock}
                onChange={handleChange}
                min="0"
                className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 ${
                  fieldErrors.instock
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-200 focus:ring-blue-500"
                }`}
              />
              {fieldErrors.instock && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.instock}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Available Sizes
            </label>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => (
                <button
                  type="button"
                  key={size}
                  onClick={() => handleSizeToggle(size)}
                  className={`px-4 py-2 rounded-xl border text-sm font-semibold transition ${
                    selectedSizes.includes(size)
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Image *
            </label>
            <p className="text-xs text-gray-500 mb-3">Upload an image or paste an image URL</p>

            {/* Toggle buttons */}
            <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-4 w-fit">
              <button
                type="button"
                onClick={() => switchImageMode("upload")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${
                  imageMode === "upload"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaUpload className="text-xs" /> Upload
              </button>
              <button
                type="button"
                onClick={() => switchImageMode("url")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${
                  imageMode === "url"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaLink className="text-xs" /> URL
              </button>
            </div>

            {/* URL Mode */}
            {imageMode === "url" && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  placeholder="https://example.com/product.jpg"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                />
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      onError={() => setImagePreview(null)}
                      className="w-full h-48 object-cover rounded-2xl border border-gray-100"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
                {fieldErrors.image && (
                  <p className="text-sm text-red-600">{fieldErrors.image}</p>
                )}
              </div>
            )}

            {/* Upload Mode */}
            {imageMode === "upload" && (
              !imagePreview ? (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center">
                  <FaImage className="text-gray-400 text-4xl mx-auto mb-3" />
                  <label className="cursor-pointer inline-block">
                    <span className="px-6 py-2 rounded-xl bg-gray-900 text-white font-semibold hover:bg-black transition">
                      Choose Image
                    </span>
                    <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
                  </label>
                  {fieldErrors.image && (
                    <p className="mt-2 text-sm text-red-600">{fieldErrors.image}</p>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-2xl border border-gray-100"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow"
                    title="Remove image"
                  >
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
            className={`w-full rounded-xl py-3 font-semibold text-white transition ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-black"
            }`}
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;

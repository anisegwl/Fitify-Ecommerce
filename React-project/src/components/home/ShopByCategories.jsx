import React from "react";
import { Link } from "react-router-dom";

const categories = [
  {
    name: "Men's Apparel",
    path: "/men-products",
    image: "https://imgs.search.brave.com/y7G7wvLFtNJliRxnLAOKZL7oAfF9p88Lr8RgTaEmvGw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NjFFRThleksrckwu/anBn",
  },
  {
    name: "Women's Apparel",
    path: "/women-products",
    image: "https://imgs.search.brave.com/MSWyI3Kx8c0MWFwwYdbr7mVxS0dZk3Kt_qD_ZQC8BfM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/c2hvcGlmeS5jb20v/cy9maWxlcy8xLzI2/NjUvMDM0Ni9maWxl/cy8zMjAyNS1XRXNz/ZW50aWFsU2VhbWxl/c3NMU1RlZS1EYXJr/T2FrMDEuanBnP3Y9/MTc3NTgyNjU0MiZ3/aWR0aD02MTEmaGVp/Z2h0PTkxNyZjcm9w/PXRvcA",
  },
  {
    name: "Supplements",
    path: "/supplements",
    image: "https://imgs.search.brave.com/PIJfJAGY7vTFaYabOT_FPd9-Gx7kXiDINOdnaxnNAmU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pMC53/cC5jb20vcG9zdC5o/ZWFsdGhsaW5lLmNv/bS93cC1jb250ZW50/L3VwbG9hZHMvMjAy/Mi8xMi9wcm90ZWlu/LXBvd2Rlci1zdXBw/bGVtZW50LTEyOTYt/NzI4LWhlYWRlci5q/cGc_dz0xMTU1Jmg9/MTUyOA",
  },
  {
    name: "Accessories",
    path: "/accsessories",
    image: "https://imgs.search.brave.com/Nli-7WOT3qZIrVN3pHw370CUKKseaY5R7bqLB64i3XA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4x/MS5iaWdjb21tZXJj/ZS5jb20vcy16NnZv/bHk2eXU3L2ltYWdl/cy9zdGVuY2lsLzUz/Mng1MzIvcHJvZHVj/dHMvMTY3My8zMDQ2/My9ic3RoYi0yMDI1/LTEwLTMwVDIwLTQy/LTQ4X180MTA4OC4x/NzYyMzU3OTM0Lmpw/Zz9jPTE",
  },
];

const ShopByCategories = () => {
  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Shop by Category</h2>
            <p className="mt-2 text-lg text-gray-500">Find exactly what you need to crush your goals.</p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {categories.map((category, idx) => (
            <Link
              key={idx}
              to={category.path}
              className="group relative block overflow-hidden rounded-2xl aspect-[4/5] bg-gray-100 shadow-sm transition-all hover:shadow-xl"
            >
              {/* Image */}
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:from-black/90" />

              {/* Text */}
              <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-center translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                <span className="text-sm font-semibold text-white/0 group-hover:text-white/100 transition-colors duration-300">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByCategories;

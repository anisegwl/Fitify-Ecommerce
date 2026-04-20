import React, { useContext, useEffect } from "react";
import ProductContext from "../../context/product/ProductContext";
import ProductCard from "../common/ProductCard";

const RecommendedProducts = () => {
  const {
    recommendedProducts,
    getRecommendedProducts,
    addToCart,
    loadingRecommendations,
    errorRecommendations,
  } = useContext(ProductContext);

  useEffect(() => {
    getRecommendedProducts(8);
  }, []);

  if (!loadingRecommendations && (errorRecommendations || recommendedProducts.length === 0)) {
    return null;
  }

  return (
    <div className="container mx-auto my-8 px-4">
      <h3 className="mb-2 text-center text-2xl font-bold">Recommended for You</h3>
      <p className="mb-8 text-center text-sm text-gray-600">
        Personalized picks based on your recent purchases.
      </p>

      {loadingRecommendations ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-80 rounded-2xl bg-white border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {recommendedProducts.map((item) => (
            <ProductCard key={item._id} item={item} onAddToCart={addToCart} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedProducts;

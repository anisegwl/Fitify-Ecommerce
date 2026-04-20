import React, { useContext, useEffect } from "react";
import ProductContext from "../context/product/ProductContext";
import ProductCard from "./common/ProductCard";

const OurProduct = () => {
  const { products, getAllProducts, addToCart } =
    useContext(ProductContext);

  useEffect(() => {
    getAllProducts();
  }, []);

  return (
    <div className="container mx-auto my-8 px-4">
      <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
        Our Products
      </h3>
      <p className="text-gray-600 text-sm mt-1">
        Explore our curated selection of top-tier fitness gear and apparel.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, 8).map((item) => (
          <ProductCard
            key={item._id}
            item={item}
            onAddToCart={addToCart}
          />
        ))}
      </div>
    </div>
  );
};

export default OurProduct;

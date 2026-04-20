import React from "react";
import Hero from "../components/home/Hero";
import Brands from "../components/home/Brands";
import Features from "../components/home/Features";
import ShopByCategories from "../components/home/ShopByCategories";
import OurProduct from "../components/OurProduct";
import RecommendedProducts from "../components/home/RecommendedProducts";
import GymSection from "../components/home/GymSection";
import Banner from "../components/home/Banner";
import Card from "../components/Card";
import Testimonials from "../components/home/Testimonial";
import Newsletter from "../components/home/Newsletter";

const Home = () => {
  return (
    <div className="bg-gray-50 bg-opacity-50 flex flex-col">
      <Hero />
      <Brands />
      
      <ShopByCategories />

      <div className="py-2">
        <RecommendedProducts />
      </div>
      
      {/* Featured Products */}
      <div className="py-8">
        <OurProduct />
      </div>

      {/* Featured Gyms */}
      <GymSection />

      <Features />

      <Banner />
      <Card />
      
      <Testimonials />
      <Newsletter />
    </div>
  );
};

export default Home;

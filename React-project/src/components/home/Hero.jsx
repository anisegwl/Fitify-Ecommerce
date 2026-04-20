import React from 'react';

const HERO_BG_PRIMARY =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80';
const HERO_BG_FALLBACK =
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1920&q=80';

const Hero = () => {
  const handleShopClick = (e) => {
    try {
      
      const shopSection = document.querySelector('#shop');
      if (shopSection) {
        shopSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        console.warn('Shop section not found');
      }
    } catch (err) {
      console.error('Navigation error:', err);
    }
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center text-white text-center bg-black"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0,0,0,0.5)), url(${HERO_BG_PRIMARY}), url(${HERO_BG_FALLBACK})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-black uppercase mb-6 tracking-wider leading-tight">
          Unleash Your Beast
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl mb-12 text-gray-100 font-light">
          Engineered for performance. Designed for style.
        </p>
        <a
          href="#shop"
          onClick={handleShopClick}
          className="inline-block bg-white text-black font-bold px-12 py-4 text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl active:scale-95 hover:scale-105"
        >
          Explore Shop
        </a>
      </div>
    </section>
  );
};

export default Hero;
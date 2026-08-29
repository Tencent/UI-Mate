import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/product/ProductCard';
import { CATEGORIES } from '../lib/mockData';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';

const CAROUSEL_SLIDES = [
  {
    id: 1,
    image: 'https://picsum.photos/seed/hero-electronics/1500/600',
    headline: 'New Year, New Deals',
    subtext: 'Save up to 50% on top Electronics',
    ctaText: 'Shop now',
    ctaLink: '/search?category=Electronics',
    bgColor: '#1a3a5c'
  },
  {
    id: 2,
    image: 'https://picsum.photos/seed/hero-books/1500/600',
    headline: 'Best Sellers in Books',
    subtext: 'Discover your next great read',
    ctaText: 'Shop Books',
    ctaLink: '/search?category=Books',
    bgColor: '#3a2a1a'
  },
  {
    id: 3,
    image: 'https://picsum.photos/seed/hero-kitchen/1500/600',
    headline: 'Home & Kitchen Essentials',
    subtext: 'Top-rated appliances for your home',
    ctaText: 'Shop Home & Kitchen',
    ctaLink: '/search?category=Home+%26+Kitchen',
    bgColor: '#1a3a2a'
  },
  {
    id: 4,
    image: 'https://picsum.photos/seed/hero-fashion/1500/600',
    headline: 'Fashion Forward',
    subtext: 'Top brands at unbeatable prices',
    ctaText: 'Shop Fashion',
    ctaLink: '/search?category=Fashion',
    bgColor: '#2a1a3a'
  },
  {
    id: 5,
    image: 'https://picsum.photos/seed/hero-toys/1500/600',
    headline: 'Fun for the Whole Family',
    subtext: 'Toys & Games for every age',
    ctaText: 'Shop Toys & Games',
    ctaLink: '/search?category=Toys+%26+Games',
    bgColor: '#3a1a1a'
  }
];

const CATEGORY_CARD_DATA = [
  { title: "Gaming accessories", category: "Electronics", products: ["p1", "p3", "p5", "p9"] },
  { title: "Kitchen favorites", category: "Home & Kitchen", products: ["p21", "p22", "p23", "p29"] },
  { title: "Fashion picks", category: "Fashion", products: ["p31", "p33", "p34", "p37"] },
  { title: "Bestselling books", category: "Books", products: ["p11", "p12", "p15", "p18"] },
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent(c => (c - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  const next = () => setCurrent(c => (c + 1) % CAROUSEL_SLIDES.length);

  return (
    <div className="relative w-full h-[280px] md:h-[380px] overflow-hidden bg-gray-900">
      {CAROUSEL_SLIDES.map((s, idx) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: idx === current ? 1 : 0, zIndex: idx === current ? 1 : 0 }}
        >
          <img src={s.image} alt={s.headline} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end pb-16 md:pb-24">
            <div className="ml-8 md:ml-16 text-white">
              <h2 className="text-2xl md:text-4xl font-bold mb-1">{s.headline}</h2>
              <p className="text-base md:text-lg mb-3 text-gray-200">{s.subtext}</p>
              <Link
                to={s.ctaLink}
                className="inline-block bg-[#ffa41c] hover:bg-[#fa8900] text-[#111] font-bold px-5 py-2 rounded-lg text-sm shadow"
              >
                {s.ctaText}
              </Link>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={prev}
        className="absolute left-0 top-0 bottom-0 z-10 px-3 bg-transparent hover:bg-white/10 transition-colors"
        aria-label="Previous"
      >
        <ChevronLeft size={36} className="text-white drop-shadow" />
      </button>

      <button
        onClick={next}
        className="absolute right-0 top-0 bottom-0 z-10 px-3 bg-transparent hover:bg-white/10 transition-colors"
        aria-label="Next"
      >
        <ChevronRight size={36} className="text-white drop-shadow" />
      </button>
    </div>
  );
};

const DealCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const endTime = new Date();
    endTime.setHours(23, 59, 59, 999);
    const tick = () => {
      const diff = endTime - new Date();
      if (diff <= 0) return;
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5 text-[13px]">
      <span className="text-red-600 font-bold deal-timer flex items-center gap-1">
        <Zap size={14} fill="currentColor" />
        Ends in
      </span>
      <span className="bg-[#111] text-white px-1.5 py-0.5 rounded font-mono font-bold text-[13px]">
        {String(timeLeft.hours || 0).padStart(2, '0')}
      </span>
      <span className="font-bold">:</span>
      <span className="bg-[#111] text-white px-1.5 py-0.5 rounded font-mono font-bold text-[13px]">
        {String(timeLeft.minutes || 0).padStart(2, '0')}
      </span>
      <span className="font-bold">:</span>
      <span className="bg-[#111] text-white px-1.5 py-0.5 rounded font-mono font-bold text-[13px]">
        {String(timeLeft.seconds || 0).padStart(2, '0')}
      </span>
    </div>
  );
};

const CategoryCard = ({ title, category, productIds, allProducts }) => {
  const products = productIds.map(id => allProducts.find(p => p.id === id)).filter(Boolean);

  return (
    <div className="bg-white p-5 shadow-sm h-full flex flex-col">
      <h2 className="text-[16px] font-bold mb-3 text-[#0F1111]">{title}</h2>
      <div className="grid grid-cols-2 gap-2 mb-3 flex-1">
        {products.slice(0, 4).map(p => (
          <Link key={p.id} to={`/product/${p.id}`} className="block group">
            <div className="bg-gray-50 rounded overflow-hidden aspect-square flex items-center justify-center p-2">
              <img src={p.image} alt={p.title} className="max-h-full max-w-full object-contain group-hover:opacity-80 transition-opacity" />
            </div>
            <div className="text-[11px] text-[#111] mt-1 line-clamp-1">{p.brand}</div>
          </Link>
        ))}
      </div>
      <Link to={`/search?category=${encodeURIComponent(category)}`} className="text-[13px] text-xmazon-blue hover:text-xmazon-orange hover:underline">
        See more
      </Link>
    </div>
  );
};

const ScrollableProductRow = ({ title, products, seeMoreLink }) => {
  const scrollRef = React.useRef(null);
  const scrollBy = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
    }
  };

  if (products.length === 0) return null;

  return (
    <div className="bg-white p-5 shadow-sm relative">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[18px] font-bold text-[#0F1111]">{title}</h2>
        {seeMoreLink && (
          <Link to={seeMoreLink} className="text-[13px] text-xmazon-blue hover:text-xmazon-orange hover:underline">See more</Link>
        )}
      </div>
      <div className="relative">
        <button
          onClick={() => scrollBy(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-r-sm p-1 border border-gray-200 hover:bg-gray-50"
        >
          <ChevronLeft size={20} />
        </button>
        <div ref={scrollRef} className="scroll-row gap-4 px-8">
          {products.map(product => (
            <div key={product.id} className="shrink-0 w-[170px] text-center group">
              <Link to={`/product/${product.id}`}>
                <div className="bg-gray-50 rounded p-2 h-[170px] flex items-center justify-center mb-2">
                  <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain group-hover:opacity-80 transition-opacity" />
                </div>
                <div className="text-[12px] text-[#111] line-clamp-2 mb-1 text-left group-hover:text-xmazon-orange">{product.title}</div>
              </Link>
              <div className="text-[14px] font-bold text-red-700 text-left">${product.price.toFixed(2)}</div>
              {product.prime && (
                <div className="text-left">
                  <span className="text-[#00a8e1] font-bold italic text-[11px]">prime</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={() => scrollBy(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-l-sm p-1 border border-gray-200 hover:bg-gray-50"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export const Home = () => {
  const { state } = useStore();
  const navigate = useNavigate();

  const deals = state.products.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, 8);
  const recommendations = state.products.slice(0, 12);
  const recentlyViewedProducts = state.recentlyViewed
    .map(id => state.products.find(p => p.id === id))
    .filter(Boolean);
  const topRated = [...state.products].sort((a, b) => b.rating - a.rating).slice(0, 8);
  const newArrivals = [...state.products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

  return (
    <div className="max-w-[1500px] mx-auto">
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Category Cards - Overlapping Hero */}
      <div className="relative z-10 -mt-36 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORY_CARD_DATA.map(card => (
            <CategoryCard
              key={card.title}
              title={card.title}
              category={card.category}
              productIds={card.products}
              allProducts={state.products}
            />
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="px-4 mt-4 space-y-4">
        {/* Today's Deals with countdown */}
        {deals.length > 0 && (
          <div className="bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <h2 className="text-[18px] font-bold text-[#0F1111]">Today's Deals</h2>
                <DealCountdown />
              </div>
              <Link to="/search?deals=true" className="text-[13px] text-xmazon-blue hover:text-xmazon-orange hover:underline">See all deals</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {deals.slice(0, 4).map(product => (
                <div key={product.id} className="group">
                  <Link to={`/product/${product.id}`}>
                    <div className="bg-gray-50 rounded p-2 h-[180px] flex items-center justify-center mb-2 relative">
                      <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain group-hover:opacity-80 transition-opacity" />
                      {product.originalPrice && (
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                          -{Math.round((1 - product.price / product.originalPrice) * 100)}% off
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                    </span>
                    <span className="text-[12px] text-red-600 font-bold">Limited time deal</span>
                  </div>
                  <div className="text-[14px] font-bold text-[#0F1111]">${product.price.toFixed(2)}</div>
                  <div className="text-[12px] text-gray-500 line-through">${product.originalPrice.toFixed(2)}</div>
                  <Link to={`/product/${product.id}`} className="text-[12px] text-[#111] line-clamp-2 hover:text-xmazon-orange mt-1 block">
                    {product.title}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended for you */}
        <ScrollableProductRow
          title="Recommended for you"
          products={recommendations.slice(0, 8)}
          seeMoreLink="/search"
        />

        {/* More category rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 shadow-sm">
            <h2 className="text-[16px] font-bold mb-3">Top rated in Beauty</h2>
            <Link to="/search?category=Beauty">
              <img src={`https://picsum.photos/seed/beauty-banner/300/300`} alt="Beauty" className="w-full aspect-square object-cover rounded mb-3 hover:opacity-90 transition-opacity" />
            </Link>
            <Link to="/search?category=Beauty" className="text-[13px] text-xmazon-blue hover:text-xmazon-orange hover:underline">Shop now</Link>
          </div>
          <div className="bg-white p-5 shadow-sm">
            <h2 className="text-[16px] font-bold mb-3">Toys & Games for all ages</h2>
            <Link to="/search?category=Toys+%26+Games">
              <img src={`https://picsum.photos/seed/toys-banner/300/300`} alt="Toys" className="w-full aspect-square object-cover rounded mb-3 hover:opacity-90 transition-opacity" />
            </Link>
            <Link to="/search?category=Toys+%26+Games" className="text-[13px] text-xmazon-blue hover:text-xmazon-orange hover:underline">Shop now</Link>
          </div>
          <div className="bg-white p-5 shadow-sm">
            <h2 className="text-[16px] font-bold mb-3">New home essentials</h2>
            <Link to="/search?category=Home+%26+Kitchen">
              <img src={`https://picsum.photos/seed/home-banner/300/300`} alt="Home" className="w-full aspect-square object-cover rounded mb-3 hover:opacity-90 transition-opacity" />
            </Link>
            <Link to="/search?category=Home+%26+Kitchen" className="text-[13px] text-xmazon-blue hover:text-xmazon-orange hover:underline">Explore now</Link>
          </div>
          <div className="bg-white p-5 shadow-sm">
            <h2 className="text-[16px] font-bold mb-3">Sign in for the best experience</h2>
            <p className="text-[13px] text-gray-600 mb-4">Sign in securely to get personalized recommendations.</p>
            <Link to="/profile" className="block bg-[#ffd814] hover:bg-[#f7ca00] text-center text-[13px] py-1.5 rounded-lg border border-[#fcd200] font-medium text-[#0F1111] mb-3">
              Sign in securely
            </Link>
            <p className="text-[12px] text-xmazon-blue hover:text-xmazon-orange hover:underline cursor-pointer">
              <Link to="/profile">New customer? Start here</Link>
            </p>
          </div>
        </div>

        {/* Top rated products */}
        <ScrollableProductRow
          title="Top rated across categories"
          products={topRated}
          seeMoreLink="/search"
        />

        {/* More deals row */}
        <div className="bg-white p-5 shadow-sm">
          <h2 className="text-[18px] font-bold mb-4 text-[#0F1111]">More items to explore</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {recommendations.slice(4, 8).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Recently Viewed */}
        {recentlyViewedProducts.length > 0 && (
          <ScrollableProductRow
            title="Your recently viewed items"
            products={recentlyViewedProducts}
          />
        )}

        {/* New arrivals */}
        <ScrollableProductRow
          title="New arrivals for you"
          products={newArrivals}
          seeMoreLink="/search"
        />
      </div>
    </div>
  );
};

import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  // ইমেজ পাথ ডিফাইন করুন
  const images = {
    logo: "/images/image-5.png",
    destination1: "/images/image-8.png",
    destination2: "/images/image-8-2.png",
    destination3: "/images/image-8-3.png",
    destination4: "/images/image-8-4.png",
    destination5: "/images/image-8-5.png",
    destination6: "/images/image-8-6.png",
    destination7: "/images/image-8-7.png",
    chatIcon: "/images/chat-2.png",
    peopleIcon1: "/images/people-2.png",
    peopleIcon2: "/images/people-2-2.png",
    peopleIcon3: "/images/people-2-3.png",
    peopleIcon4: "/images/people-3.png",
    peopleIcon5: "/images/people-3-2.png",
    peopleIcon6: "/images/people-4.png",
    peopleIcon7: "/images/people-4-2.png",
    peopleIcon8: "/images/people-5.png",
    peopleIcon9: "/images/people-5-2.png",
    trifoldIcon: "/images/trifold-2.png",
    sliceIcon: "/images/slice-1.svg",
    line1: "/images/line-22.svg",
    line2: "/images/line-23.svg",
    line3: "/images/line-24.svg",
  };

  // Featured Destinations Data
  const featuredDestinations = [
    {
      id: 1,
      image: images.destination1,
      title: "Bichanakandi – Sylhet",
      url: "https://tourtoday.com.bd/bichanakandi-sylhet/",
      rating: "4.8",
      ratingIcon: images.peopleIcon6,
    },
    {
      id: 2,
      image: images.destination2,
      title: "Nilgiris – Bandarban",
      url: "https://tourtoday.com.bd/nilgiris-bandarban/",
      rating: "4.6",
      ratingIcon: images.peopleIcon4,
    },
    {
      id: 3,
      image: images.destination3,
      title: "St. Martin's Island – Cox's Bazar",
      url: "https://tourtoday.com.bd/st-martins-island-coxs-bazar/",
      rating: "4.7",
      ratingIcon: images.peopleIcon8,
    },
    {
      id: 4,
      image: images.destination4,
      title: "Lalbagh Fort – Dhaka",
      url: "https://tourtoday.com.bd/lalbagh-fort-dhaka/",
      rating: "4.3",
      ratingIcon: images.peopleIcon1,
    },
  ];

  // Why Choose Us Features
  const features = [
    {
      id: 1,
      icon: images.trifoldIcon,
      iconAlt: "Trifold",
      title: "Diverse Destinations",
      description: "Explore hundreds of handpicked destinations worldwide",
    },
    {
      id: 2,
      icon: images.peopleIcon3,
      iconAlt: "People",
      title: "Local Hosts",
      description: "Connect with verified local hosts for authentic experiences",
    },
    {
      id: 3,
      icon: images.chatIcon,
      iconAlt: "Chat",
      title: "Easy Communication",
      description: "Chat directly with hosts to plan your perfect trip",
    },
  ];

  // Statistics
  const stats = [
    { value: "500+", label: "Destinations" },
    { value: "10k+", label: "Happy Travelers" },
    { value: "1K+", label: "Local Hosts" },
  ];

  // FAQ Data
  const faqs = [
    {
      id: 1,
      question: "How do I book a destination?",
      answer: "Simply browse our destinations, select your preferred location, choose your dates, and optionally select a local host. You can also book transportation tickets in the same process.",
    },
    {
      id: 2,
      question: "Are the hosts verified?",
      answer: "Yes! All our hosts go through a verification process and are rated by previous travelers. You can see ratings and reviews before making your selection.",
    },
    {
      id: 3,
      question: "Can I message hosts before booking?",
      answer: "Absolutely! Our messaging system allows you to communicate with hosts to ask questions and plan your trip before confirming your booking.",
    },
    {
      id: 4,
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and digital payment methods for a seamless booking experience.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50">
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full h-20 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 md:px-8 h-full flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={images.logo} alt="Bhromonbondhu Logo" className="w-10 h-10 md:w-12 md:h-12" />
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-serif text-gray-800">ভ্রমণবন্ধু</h1>
              <p className="text-sm md:text-lg font-light text-gray-600">Bhromonbondhu</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Home
            </Link>
            <Link to="/destinations" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Destinations
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              About
            </Link>
            <Link to="/faq" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Q/A
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors text-sm md:text-base"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-4 py-2 md:px-6 md:py-2 rounded-full hover:from-cyan-500 hover:to-blue-600 transition-all shadow-md hover:shadow-lg text-sm md:text-base"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4 md:px-8">
        <div className="container mx-auto bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 md:p-12 shadow-lg">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Explore. Book. Experience.
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Discover amazing destinations and connect with local hosts for authentic travel experiences
            </p>
            <Link 
              to="/destinations" 
              className="inline-flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-full hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl text-lg font-medium"
            >
              Start your Journey
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-12 md:py-16 px-4 md:px-8">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-12">
            Featured Destinations
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredDestinations.map((destination) => (
              <div key={destination.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                <img 
                  src={destination.image} 
                  alt={destination.title} 
                  className="w-full h-48 md:h-56 object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Found";
                  }}
                />
                
                <div className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
                    {destination.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <img 
                        src={destination.ratingIcon} 
                        alt="Rating" 
                        className="w-5 h-5 mr-2"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/20x20?text=⭐";
                        }}
                      />
                      <span className="text-gray-700 font-medium">{destination.rating}</span>
                    </div>
                    <a 
                      href={destination.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View Details →
                    </a>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white py-2 rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-all">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Bhromonbondhu */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-white">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose Bhromonbondhu
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {features.map((feature) => (
              <div key={feature.id} className="text-center">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                  <img 
                    src={feature.icon} 
                    alt={feature.iconAlt} 
                    className="w-10 h-10"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/40x40?text=Icon";
                    }}
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8">
            About Us
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-600 text-center mb-12">
              Bhromonbondhu connects travelers with local hosts and provides seamless booking for destinations and transportation. We believe in authentic travel experiences that bring cultures together and create lasting memories.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-700 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 px-4 md:px-8">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-100 to-cyan-100 py-12 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* Logo and Info */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <img 
                  src={images.logo} 
                  alt="Bhromonbondhu Logo" 
                  className="w-12 h-12"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/48x48?text=Logo";
                  }}
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Bhromonbondhu</h2>
                  <p className="text-gray-600">Making travel dreams come true</p>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-12">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Quick Links</h3>
                <ul className="space-y-2">
                  <li><Link to="/" className="text-gray-600 hover:text-blue-600">Home</Link></li>
                  <li><Link to="/destinations" className="text-gray-600 hover:text-blue-600">Destinations</Link></li>
                  <li><Link to="/about" className="text-gray-600 hover:text-blue-600">About Us</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Support</h3>
                <ul className="space-y-2">
                  <li><Link to="/faq" className="text-gray-600 hover:text-blue-600">FAQ</Link></li>
                  <li><Link to="/contact" className="text-gray-600 hover:text-blue-600">Contact Us</Link></li>
                  <li><Link to="/privacy" className="text-gray-600 hover:text-blue-600">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-6 border-t border-gray-300 text-center">
            <p className="text-gray-600">
              © 2025 Bhromonbondhu. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
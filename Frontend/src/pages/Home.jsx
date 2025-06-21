import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plane, Menu, X, LayoutDashboard, MapIcon, Calendar, Users, Store as Explore, 
  Newspaper, CreditCard, Map, Settings, ArrowRight, Star, Shield, Zap, 
  Globe, Clock, Heart, CheckCircle, Play, Quote, Facebook, Twitter, 
  Instagram, Linkedin, Mail, Phone, MapPin, ArrowUp
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Plan Trip', icon: MapIcon },
    { name: 'My Trips', icon: Calendar },
    { name: 'Team', icon: Users },
    { name: 'Explore', icon: Explore },
    { name: 'Calendar', icon: Calendar },
    { name: 'News', icon: Newspaper },
    { name: 'Expense Tracker', icon: CreditCard },
    { name: 'Maps', icon: Map },
    { name: 'Settings', icon: Settings },
  ];

  const features = [
    {
      icon: MapIcon,
      title: 'Smart Planning',
      description: 'AI-powered trip planning with personalized recommendations based on your preferences and budget.',
      color: 'from-purple-500 to-violet-500'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Plan together with friends and family in real-time with shared itineraries and voting features.',
      color: 'from-violet-500 to-purple-500'
    },
    {
      icon: Calendar,
      title: 'Seamless Organization',
      description: 'Keep all your travel plans organized with smart calendars and automated reminders.',
      color: 'from-blue-500 to-purple-500'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your travel data is encrypted and secure with enterprise-grade security measures.',
      color: 'from-orange-500 to-yellow-500'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance ensures your planning experience is smooth and responsive.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Globe,
      title: 'Global Coverage',
      description: 'Access information and recommendations for destinations worldwide with local insights.',
      color: 'from-pink-500 to-purple-500'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Travel Blogger',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'PlanPal Pro revolutionized how I plan my adventures. The AI recommendations are spot-on and the collaboration features make group travel planning effortless.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Business Executive',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'As someone who travels frequently for work, PlanPal Pro keeps me organized and helps me discover amazing local experiences in every city I visit.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Adventure Enthusiast',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'The expense tracking and budget planning features saved me hundreds on my last trip. Plus, the mobile app works perfectly even offline!',
      rating: 5
    }
  ];

  const stats = [
    { number: '50K+', label: 'Happy Travelers' },
    { number: '200+', label: 'Countries Covered' },
    { number: '1M+', label: 'Trips Planned' },
    { number: '99.9%', label: 'Uptime' }
  ];

  const pricingPlans = [
    {
      name: 'Explorer',
      price: 'Free',
      description: 'Perfect for occasional travelers',
      features: [
        'Up to 3 trips per month',
        'Basic itinerary planning',
        'Mobile app access',
        'Community support'
      ],
      popular: false
    },
    {
      name: 'Adventurer',
      price: '$9.99',
      period: '/month',
      description: 'Ideal for frequent travelers',
      features: [
        'Unlimited trips',
        'AI-powered recommendations',
        'Team collaboration',
        'Expense tracking',
        'Priority support',
        'Offline access'
      ],
      popular: true
    },
    {
      name: 'Professional',
      price: '$19.99',
      period: '/month',
      description: 'For travel professionals',
      features: [
        'Everything in Adventurer',
        'Advanced analytics',
        'Custom branding',
        'API access',
        'Dedicated support',
        'White-label options'
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                  <Plane className="w-6 h-6 text-white transform rotate-45" />
                </div>
              </div>
              <span className="text-2xl font-bold text-white">
                PlanPal Pro
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.slice(0, 6).map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate('/login')}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-200 group"
                >
                  <item.icon className="w-4 h-4 group-hover:text-purple-400 transition-colors" />
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-lg hover:from-purple-600 hover:to-violet-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
              >
                Sign Up
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-700">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate('/login')}
                  className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              ))}
              <div className="pt-4 space-y-2">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-lg hover:from-purple-600 hover:to-violet-600 transition-all"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
        </div>

        

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-20 md:py-24 lg:py-32">
          <div className="text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-8">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                  PlanPal Pro
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-slate-300 mb-12 leading-relaxed">
                Your ultimate companion for planning and organizing trips, adventures, and daily tasks. 
                Seamlessly collaborate, discover new destinations, and keep everything in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                <button
                  onClick={() => navigate('/register')}
                  className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-violet-500 text-white text-lg font-semibold rounded-xl hover:from-purple-600 hover:to-violet-600 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/30"
                >
                  <span className="flex items-center space-x-2">
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-violet-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                </button>

                <button className="group flex items-center space-x-3 px-8 py-4 border-2 border-slate-600 text-slate-300 text-lg font-semibold rounded-xl hover:border-purple-400 hover:text-white hover:bg-slate-800/50 transition-all duration-300">
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                    <div className="text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">PlanPal Pro</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Discover the features that make PlanPal Pro the ultimate travel planning companion for modern adventurers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:-translate-y-2"
              >
                <div className="relative mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} p-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4 text-center">{feature.title}</h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors text-center">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              What Our <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">Travelers</span> Say
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Join thousands of satisfied travelers who have transformed their planning experience with PlanPal Pro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:-translate-y-2"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-slate-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                <Quote className="w-8 h-8 text-purple-400 mb-4 opacity-50" />
                <p className="text-slate-300 group-hover:text-white transition-colors">
                  {testimonial.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Choose Your <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">Adventure</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Select the perfect plan for your travel needs. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-2xl border transition-all duration-300 hover:transform hover:-translate-y-2 ${
                  plan.popular
                    ? 'bg-gradient-to-b from-purple-500/10 to-violet-500/10 border-purple-500/50 shadow-2xl shadow-purple-500/20'
                    : 'bg-slate-800/50 border-slate-700 hover:border-purple-500/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-violet-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.period && <span className="text-slate-400 ml-1">{plan.period}</span>}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-slate-300">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:from-purple-600 hover:to-violet-600 transform hover:scale-105 shadow-lg hover:shadow-purple-500/30'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-3xl p-12 border border-purple-500/20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Your Next Adventure?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of travelers who trust PlanPal Pro for their journey planning needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-violet-500 text-white text-lg font-semibold rounded-xl hover:from-purple-600 hover:to-violet-600 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/30"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 border-2 border-slate-600 text-slate-300 text-lg font-semibold rounded-xl hover:border-purple-400 hover:text-white hover:bg-slate-800/50 transition-all duration-300"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className='w-full overflow-hidden'>
      <footer className="bg-slate-900/80 backdrop-blur-sm border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                    <Plane className="w-6 h-6 text-white transform rotate-45" />
                  </div>
                </div>
                <span className="text-2xl font-bold text-white">
                  PlanPal Pro
                </span>
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Your ultimate companion for planning and organizing trips, adventures, and daily tasks. 
                Making travel planning effortless and enjoyable.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-white font-semibold mb-6">Product</h3>
              <ul className="space-y-4">
                {['Features', 'Pricing', 'API', 'Mobile App', 'Integrations', 'Security'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-semibold mb-6">Company</h3>
              <ul className="space-y-4">
                {['About Us', 'Careers', 'Press', 'Blog', 'Partners', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-semibold mb-6">Support</h3>
              <ul className="space-y-4">
                {['Help Center', 'Documentation', 'Community', 'Status', 'Terms', 'Privacy'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="border-t border-slate-700 mt-12 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-purple-400" />
                <span className="text-slate-300">hello@planpalpro.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-purple-400" />
                <span className="text-slate-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-purple-400" />
                <span className="text-slate-300">San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-center md:text-left">
              © 2025 PlanPal Pro. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-full shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-110 z-40"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default Home;
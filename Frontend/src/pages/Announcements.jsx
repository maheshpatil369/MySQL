import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Pin,
  MessageCircle,
  Heart,
  Share2,
  MoreVertical,
  Bell,
  AlertCircle,
  Info,
  CheckCircle,
  Loader2,
  Newspaper,
  RefreshCw 
} from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';

const NEWS_API_KEY = 'pub_b79fe12045c04eae8b454ffc7fe48668';
const NEWS_API_URL_BASE = `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&language=en&country=in`; 

const Announcements = () => {
  const [newsArticles, setNewsArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchNewsData = async () => {
    setIsLoading(true);
    setError(null);
    let url = NEWS_API_URL_BASE;
    if (searchTerm) {
      url += `&q=${encodeURIComponent(searchTerm)}`;
    }
    console.log(`Fetching news from URL: ${url}`); 

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("News API error response:", errorData);
        throw new Error(errorData.message || errorData.results?.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === "success") {
        setNewsArticles(data.results || []);
        console.log("News data fetched successfully, articles:", data.results?.length);
      } else {
        console.error("News API was not successful:", data);
        throw new Error(data.message || data.results?.message || "Failed to fetch news: API request was not successful.");
      }
    } catch (e) {
      console.error("Failed to fetch news data (catch block):", e);
      setError(e.message);
      setNewsArticles([]);
    } finally {
      setIsLoading(false);
      console.log("Finished fetching news, isLoading set to false.");
    }
  };

  useEffect(() => {
    console.log("useEffect for fetchNewsData triggered. SearchTerm:", searchTerm);
    fetchNewsData();
  }, [searchTerm]); 

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return dateString; 
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Latest News</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Stay updated with the latest news headlines.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchNewsData}
            disabled={isLoading}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-200 shadow-sm disabled:opacity-70"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh News
          </motion.button>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 items-center" 
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /> 
            <input
              type="text"
              placeholder="Search news articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </motion.div>

        {/* News Articles List */}
        <div className="space-y-6">
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="ml-3 text-lg text-gray-700 dark:text-gray-300">Loading news articles...</p>
            </div>
          )}
          {error && (
            <div className="text-center py-10 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <p className="text-red-700 dark:text-red-400 font-semibold">Error loading news:</p>
              <p className="text-red-600 dark:text-red-500">{error}</p>
              <button
                onClick={fetchNewsData}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Try Again
              </button>
            </div>
          )}
          {!isLoading && !error && newsArticles.map((article, index) => (
              <motion.div
                key={article.article_id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6">
                  {article.image_url && (
                    <img 
                      src={article.image_url} 
                      alt={article.title} 
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      onError={(e) => { e.target.onerror = null; e.target.style.display='none';}}
                    />
                  )}
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400">
                    <a href={article.link} target="_blank" rel="noopener noreferrer">
                      {article.title}
                    </a>
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    By {article.creator ? article.creator.join(', ') : article.source_id || 'Unknown Source'} - {formatDate(article.pubDate)}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    {article.description || (article.content && article.content.substring(0, 200) + (article.content.length > 200 ? '...' : '')) || 'No description available.'}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.keywords && Array.isArray(article.keywords) && article.keywords.map((keyword) => (
                      <span key={keyword} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                        {keyword}
                      </span>
                    ))}
                     {article.category && Array.isArray(article.category) && article.category.map((cat) => (
                      <span key={cat} className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                        {cat}
                      </span>
                    ))}
                  </div>
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Read more <Share2 className="h-3 w-3 ml-1.5" />
                  </a>
                </div>
              </motion.div>
            ))}
        </div>

        {!isLoading && !error && newsArticles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Newspaper className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No news articles found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm
                ? 'Try adjusting your search criteria.'
                : 'There are no news articles to display at the moment.'
              }
            </p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Announcements;

'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { format } from 'date-fns'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import SherlockDetective from './components/SherlockDetective'
import Link from 'next/link'

interface Article {
  title: string
  description: string
  url: string
  urlToImage: string
  publishedAt: string
  source: {
    name: string
  }
  relevanceScore?: number
  content?: string
}

interface ScoredArticle extends Article {
  scores: {
    king: number
    queen: number
    jack: number
  }
}

const TOPICS = [
  'Technology',
  'Business',
  'Sports',
  'Entertainment',
  'Health',
  'Science',
  'Politics',
  'World',
  'Environment',
  'Education',
  'Food',
  'Travel',
  'Fashion',
  'Art',
  'Economy',
  'Crime',
  'Weather',
  'Space',
  'Gaming',
  'Music',
  'Movies',
  'Books',
  'Fitness',
  'Automotive',
  'Real Estate',
  'Energy',
  'Agriculture',
  'Transportation',
  'Media',
  'Religion',
  'History',
  'Culture',
  'Social Media',
  'Innovation',
  'Startups',
  'Finance',
  'Markets',
  'Cryptocurrency',
  'AI',
  'Robotics'
]

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000&auto=format&fit=crop'
const NEWS_LOGO = 'https://cdn-icons-png.flaticon.com/512/2965/2965879.png'

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState('')
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false)
  const [showEasterEgg, setShowEasterEgg] = useState(false)
  const [easterEggMessage, setEasterEggMessage] = useState('')
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [detectivePosition, setDetectivePosition] = useState({ x: 0, y: 0 })
  const [isWalking, setIsWalking] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [suggestedQuery, setSuggestedQuery] = useState<string | null>(null)

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true)
    setDetectivePosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    })
  }, [])

  // Add walking animation with smoother movement
  useEffect(() => {
    if (!isClient) return

    let animationFrame: number
    let lastTime = 0
    const moveSpeed = 0.5 // pixels per millisecond
    const maxDistance = 5 // maximum distance per frame

    const animate = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime
      const deltaTime = currentTime - lastTime
      lastTime = currentTime

      if (isWalking) {
        setDetectivePosition(prev => {
          const targetX = Math.max(100, Math.min(window.innerWidth - 100, prev.x + (Math.random() * 2 - 1) * maxDistance))
          const targetY = Math.max(100, Math.min(window.innerHeight - 100, prev.y + (Math.random() * 2 - 1) * maxDistance))
          
          const dx = targetX - prev.x
          const dy = targetY - prev.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance > maxDistance) {
            const ratio = maxDistance / distance
            return {
              x: prev.x + dx * ratio,
              y: prev.y + dy * ratio
            }
          }
          
          return { x: targetX, y: targetY }
        })
      }

      animationFrame = requestAnimationFrame(animate)
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [isWalking, isClient])

  // Update mouse position with smoother transitions
  useEffect(() => {
    if (!isClient) return

    let rafId: number
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY })
        setIsWalking(true)
        setTimeout(() => setIsWalking(false), 1500) // Longer walking duration
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [isClient])

  const handleCardHover = (index: number) => {
    setHoveredCard(index)
  }

  const handleCardLeave = () => {
    setHoveredCard(null)
  }

  const categorizeArticles = (articles: Article[]): ScoredArticle[] => {
    // Keywords that indicate importance levels
    const kingKeywords = ['breaking', 'urgent', 'exclusive', 'major', 'critical', 'emergency', 'crisis', 'disaster', 'attack', 'outbreak']
    const queenKeywords = ['analysis', 'impact', 'development', 'breakthrough', 'discovery', 'innovation', 'policy', 'reform', 'agreement', 'summit']
    const jackKeywords = ['interesting', 'trending', 'viral', 'popular', 'feature', 'spotlight', 'highlight', 'showcase', 'review', 'preview']

    // Score articles based on keywords and content
    const scoredArticles = articles.map(article => {
      const title = article.title.toLowerCase()
      const description = article.description?.toLowerCase() || ''
      const content = `${title} ${description}`

      const kingScore = kingKeywords.reduce((score, keyword) => 
        score + (content.includes(keyword) ? 2 : 0), 0)
      const queenScore = queenKeywords.reduce((score, keyword) => 
        score + (content.includes(keyword) ? 2 : 0), 0)
      const jackScore = jackKeywords.reduce((score, keyword) => 
        score + (content.includes(keyword) ? 2 : 0), 0)

      // Additional scoring based on source reliability and recency
      const sourceScore = ['reuters', 'ap', 'bbc', 'cnn', 'nyt'].includes(article.source.name.toLowerCase()) ? 1 : 0
      const recencyScore = new Date(article.publishedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 ? 1 : 0

      return {
        ...article,
        scores: {
          king: kingScore + sourceScore + recencyScore,
          queen: queenScore + sourceScore,
          jack: jackScore
        }
      }
    })

    // Sort articles by their highest score
    const sortedArticles = scoredArticles.sort((a, b) => {
      const aMaxScore = Math.max(a.scores.king, a.scores.queen, a.scores.jack)
      const bMaxScore = Math.max(b.scores.king, b.scores.queen, b.scores.jack)
      return bMaxScore - aMaxScore
    })

    // Assign articles to cards
    const kingArticle = sortedArticles.find(a => a.scores.king >= a.scores.queen && a.scores.king >= a.scores.jack) || sortedArticles[0]
    const queenArticle = sortedArticles.find(a => a.scores.queen >= a.scores.king && a.scores.queen >= a.scores.jack && a !== kingArticle) || sortedArticles[1]
    const jackArticle = sortedArticles.find(a => a !== kingArticle && a !== queenArticle) || sortedArticles[2]

    return [kingArticle, queenArticle, jackArticle]
  }

  const defaultTopics = TOPICS.slice(0, 8) // First 8 categories
  const additionalTopics = TOPICS.slice(8) // Remaining categories
  const displayedTopics = isCategoriesExpanded ? TOPICS : defaultTopics

  useEffect(() => {
    fetchNews()
  }, [selectedTopic])

  const fetchNews = async (query = '') => {
    try {
      setLoading(true)
      setSearchError(null)
      setSuggestedQuery(null)

      // Enhanced search parameters for more relevant results
      const searchParams = {
        q: query || (selectedTopic ? selectedTopic : 'news'),
        apiKey: process.env.NEXT_PUBLIC_NEWS_API_KEY,
        language: 'en',
        sortBy: 'relevancy', // Changed from 'publishedAt' to 'relevancy'
        pageSize: 30, // Limit results to get more relevant ones
        searchIn: 'title,description', // Search in both title and description
      }

      const response = await axios.get(`https://newsapi.org/v2/everything`, {
        params: searchParams,
      })

      if (response.data.articles.length === 0) {
        // If no results found, try to suggest a corrected query
        const words = query.split(' ')
        const correctedWords = words.map(word => {
          // Simple spell check using common misspellings
          const commonMisspellings: { [key: string]: string } = {
            'tecnology': 'technology',
            'bussiness': 'business',
            'entertainment': 'entertainment',
            'politcs': 'politics',
            'sciense': 'science',
            'healt': 'health',
            'sport': 'sports',
            'enviroment': 'environment',
            'educacion': 'education',
            'economy': 'economy',
            'weather': 'weather',
            'space': 'space',
            'art': 'art',
            'food': 'food',
            'travel': 'travel',
            'fashion': 'fashion',
            'music': 'music',
            'movie': 'movies',
            'book': 'books',
            'game': 'gaming',
          }
          return commonMisspellings[word.toLowerCase()] || word
        })
        const correctedQuery = correctedWords.join(' ')
        
        if (correctedQuery !== query) {
          setSuggestedQuery(correctedQuery)
          setSearchError(`No results found for "${query}". Did you mean "${correctedQuery}"?`)
        } else {
          setSearchError(`No results found for "${query}". Please try a different search term.`)
        }
        setArticles([])
        return
      }

      // Enhanced filtering of articles for better relevance
      const filteredArticles = response.data.articles.reduce((acc: Article[], current: Article) => {
        // Skip if article is missing essential information
        if (!current.title || !current.description || !current.url) {
          return acc
        }

        const title = current.title.toLowerCase()
        const description = current.description.toLowerCase()
        const content = `${title} ${description}`
        const searchTerms = query.toLowerCase().split(' ')

        // Calculate relevance score
        let relevanceScore = 0
        
        // Higher score for exact matches in title
        searchTerms.forEach(term => {
          if (title.includes(term)) {
            relevanceScore += 3
          }
          if (description.includes(term)) {
            relevanceScore += 1
          }
        })

        // Check if the article is actually about the search topic
        const isRelevant = searchTerms.some(term => {
          // Check if the term appears in a meaningful context
          const contextPattern = new RegExp(`\\b${term}\\b`, 'i')
          return contextPattern.test(content)
        })

        // Skip if the article is not relevant enough
        if (!isRelevant || relevanceScore < 1) {
          return acc
        }

        // Add relevance score to the article
        const articleWithScore = {
          ...current,
          relevanceScore
        }

        acc.push(articleWithScore)
        return acc
      }, [])

      // Sort articles by relevance score
      const sortedArticles = filteredArticles.sort((a: Article, b: Article) => 
        (b.relevanceScore || 0) - (a.relevanceScore || 0)
      )

      // Take only the most relevant articles
      const relevantArticles = sortedArticles.slice(0, 20)

      // Categorize articles for top cards
      const topThreeArticles = categorizeArticles(relevantArticles.map((article: Article): ScoredArticle => ({
        ...article,
        scores: {
          king: article.relevanceScore || 0,
          queen: article.relevanceScore || 0,
          jack: article.relevanceScore || 0
        }
      })))
      const remainingArticles = relevantArticles.filter((article: Article) => !topThreeArticles.includes(article as ScoredArticle))

      setArticles([...topThreeArticles, ...remainingArticles])
    } catch (error) {
      console.error('Error fetching news:', error)
      setSearchError('An error occurred while fetching news. Please try again.')
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchNews(searchQuery)
  }

  const handleTopicSelect = (topic: string) => {
    const topicLower = topic.toLowerCase()
    // If clicking the same category, clear the selection to show all news
    setSelectedTopic(selectedTopic === topicLower ? '' : topicLower)
  }

  const topNews = articles.slice(0, 3)
  const remainingNews = articles.slice(3)

  const handleCardClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault()
    const messages = {
      0: "👑 I am the King card! I bring you the most important and breaking news of the day. My stories are the ones you can't afford to miss!",
      1: "👸 I am the Queen card! I present you with the most insightful and impactful stories. My news shapes the world we live in!",
      2: "🎭 I am the Jack card! I deliver the most interesting and engaging stories. My news keeps you informed and entertained!"
    }
    setEasterEggMessage(messages[index as keyof typeof messages])
    setShowEasterEgg(true)
  }

  return (
    <main className="min-h-screen bg-gray-900 relative overflow-hidden">
      <SherlockDetective onHover={setIsHovering} />
      
      <div className="container mx-auto px-4 py-8 relative">
        {/* Background Illustrations */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gray-900">
            {/* Newspaper Pattern */}
            <svg className="absolute top-0 left-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="newspaper" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M0 0h20v20H0z" fill="none"/>
                <path d="M2 2h16v16H2z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                <path d="M4 4h12v12H4z" fill="none" stroke="currentColor" strokeWidth="0.3"/>
                <path d="M6 6h8v8H6z" fill="none" stroke="currentColor" strokeWidth="0.2"/>
              </pattern>
              <rect x="0" y="0" width="100" height="100" fill="url(#newspaper)"/>
            </svg>

            {/* News Icons Pattern */}
            <div className="absolute inset-0 opacity-10">
              {/* Top Row */}
              <div className="absolute top-10 left-10">
                <svg className="w-12 h-12 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                </svg>
              </div>
              <div className="absolute top-10 right-10">
                <svg className="w-12 h-12 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>

              {/* Middle Row */}
              <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                <svg className="w-12 h-12 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                </svg>
              </div>
              <div className="absolute top-1/2 right-1/4 transform translate-x-1/2 -translate-y-1/2">
                <svg className="w-12 h-12 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>

              {/* Bottom Row */}
              <div className="absolute bottom-10 left-10">
                <svg className="w-12 h-12 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                </svg>
              </div>
              <div className="absolute bottom-10 right-10">
                <svg className="w-12 h-12 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>

            {/* Additional Decorative Elements */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2">
                <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
              </div>
              <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2">
                <div className="w-32 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
              </div>
            </div>

            {/* Sherlock Holmes Detective */}
            {isClient && (
              <div 
                className="fixed pointer-events-none transition-all duration-500 ease-out z-50"
                style={{
                  left: detectivePosition.x,
                  top: detectivePosition.y,
                  transform: `translate(-50%, -50%) scale(${isWalking ? 1.1 : 1})`,
                  filter: `blur(${isWalking ? '1px' : '0px'})`,
                }}
              >
                <div className="relative">
                  {/* Detective Silhouette */}
                  <svg className="w-[500px] h-[500px] transition-transform duration-500 ease-out" viewBox="0 0 100 100">
                    {/* Hat */}
                    <path d="M30 15h40v10h-40z" fill="#F5F5F5"/>
                    <path d="M25 25h50v5h-50z" fill="#F5F5F5"/>
                    
                    {/* Head */}
                    <path d="M40 30c-5 0-10 5-10 10 0 5 5 10 10 10s10-5 10-10c0-5-5-10-10-10z" fill="#F5F5F5"/>
                    
                    {/* Body */}
                    <path d="M35 50h30v40h-30z" fill="#F5F5F5"/>
                    
                    {/* Coat */}
                    <path d="M30 45h40v50h-40z" fill="#F5F5F5"/>
                    
                    {/* Arms */}
                    <path d="M25 50h10v30h-10z" fill="#F5F5F5"/>
                    <path d="M65 50h10v30h-10z" fill="#F5F5F5"/>
                    
                    {/* Pipe */}
                    <path d="M60 40h15v5h-15z" fill="#F5F5F5"/>
                    <path d="M75 35h5v15h-5z" fill="#F5F5F5"/>
                    
                    {/* Magnifying Glass */}
                    <circle cx="25" cy="45" r="8" fill="none" stroke="#F5F5F5" strokeWidth="3"/>
                    <path d="M20 50l5 5" stroke="#F5F5F5" strokeWidth="3"/>
                  </svg>
                  
                  {/* Torch Light */}
                  <div 
                    className={`absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-gradient-to-r from-yellow-400/60 to-yellow-600/60 rounded-full blur-3xl transition-all duration-700 ease-out ${
                      hoveredCard !== null ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
                    }`}
                    style={{
                      transform: 'translate(-50%, -50%)',
                      filter: 'blur(40px)',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Add detective-themed decorative elements */}
            {isClient && (
              <div className="fixed inset-0 pointer-events-none opacity-30">
                {/* Footprints */}
                <div className="absolute bottom-10 left-10 animate-bounce-slow">
                  <svg className="w-12 h-12 text-gray-400 transition-all duration-500 ease-out" viewBox="0 0 24 24">
                    <path d="M12 2c-2.5 0-4.5 2-4.5 4.5S9.5 11 12 11s4.5-2 4.5-4.5S14.5 2 12 2z" fill="currentColor"/>
                    <path d="M12 13c-2.5 0-4.5 2-4.5 4.5S9.5 22 12 22s4.5-2 4.5-4.5S14.5 13 12 13z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
            )}

            {/* Add custom animations */}
            <style jsx global>{`
              @keyframes bounce-slow {
                0%, 100% {
                  transform: translateY(0);
                }
                50% {
                  transform: translateY(-10px);
                }
              }
              .animate-bounce-slow {
                animation: bounce-slow 2s ease-in-out infinite;
              }
            `}</style>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/90 to-gray-900"></div>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center mb-8 animate-fade-in bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Latest News
        </h1>

        {loading ? (
          <div className="text-center animate-pulse">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-400 border-r-transparent"></div>
            <p className="mt-3 text-gray-300 text-base">Loading news...</p>
          </div>
        ) : (
          <>
            {/* Top News Cards */}
            <div className="max-w-5xl mx-auto mb-16">
              <h2 className="text-2xl font-semibold mb-8 text-center animate-fade-in text-gray-100">Top Stories</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topNews.map((article, index) => (
                  <div
                    key={index}
                    className={`relative transform hover:-translate-y-2 transition-all duration-500 animate-fade-in ${
                      hoveredCard === index ? 'shadow-[0_0_50px_rgba(234,179,8,0.4)]' : ''
                    }`}
                    style={{ animationDelay: `${index * 200}ms` }}
                    onMouseEnter={() => handleCardHover(index)}
                    onMouseLeave={handleCardLeave}
                  >
                    <div 
                      className="absolute -top-3 -right-3 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full shadow-lg flex items-center justify-center text-xl font-bold transform hover:rotate-12 transition-transform duration-300 text-white z-10 cursor-pointer"
                      onClick={(e) => handleCardClick(e, index)}
                    >
                      {index === 0 ? 'K' : index === 1 ? 'Q' : 'J'}
                    </div>
                    <Link
                      href={{
                        pathname: '/article',
                        query: {
                          title: article.title,
                          description: article.description,
                          url: article.url,
                          urlToImage: article.urlToImage,
                          publishedAt: article.publishedAt,
                          source: article.source.name,
                          content: article.content,
                        },
                      }}
                      className="block h-full group"
                    >
                      <article className="bg-gray-800 rounded-xl shadow-lg overflow-hidden h-full hover:shadow-xl transition-all duration-500 cursor-pointer border border-gray-700 news-card">
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={article.urlToImage || DEFAULT_IMAGE}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = NEWS_LOGO;
                              target.onerror = null;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                        <div className="p-6">
                          <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors duration-300 text-gray-100">
                            {article.title}
                          </h2>
                          <div className="relative overflow-hidden">
                            <p className={`text-gray-300 mb-4 line-clamp-3 text-base transition-all duration-500 ${
                              hoveredCard === index ? 'line-clamp-none' : ''
                            }`}>
                              {article.description}
                            </p>
                            <div className={`absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gray-800 to-transparent transition-opacity duration-500 ${
                              hoveredCard === index ? 'opacity-0' : 'opacity-100'
                            }`}></div>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-700 pt-3">
                            <span className="group-hover:text-blue-400 transition-colors duration-300 font-medium">{article.source.name}</span>
                            <span className="group-hover:text-blue-400 transition-colors duration-300">
                              {format(new Date(article.publishedAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-6 animate-slide-up">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-sm group-hover:blur-md transition-all duration-500"></div>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setSearchError(null)
                      setSuggestedQuery(null)
                    }}
                    placeholder="Search for news..."
                    className="w-full px-4 py-2 pl-12 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:shadow-lg text-sm bg-gray-800/90 text-gray-100 placeholder-gray-400"
                  />
                  <div className="absolute left-3 top-2.5 flex items-center">
                    <div className="relative">
                      <MagnifyingGlassIcon className="h-4 w-4 text-blue-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                      <div className="absolute inset-0 animate-ping-slow">
                        <MagnifyingGlassIcon className="h-4 w-4 text-blue-400/30" />
                      </div>
                    </div>
                  </div>
                  {searchQuery && (
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors duration-300"
                    >
                      Search
                    </button>
                  )}
                </div>
              </div>
              {searchError && (
                <div className="mt-2 text-sm text-red-400 animate-fade-in">
                  {searchError}
                  {suggestedQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery(suggestedQuery)
                        fetchNews(suggestedQuery)
                      }}
                      className="ml-2 text-blue-400 hover:text-blue-300 underline"
                    >
                      Try this instead
                    </button>
                  )}
                </div>
              )}
            </form>

            <style jsx global>{`
              @keyframes ping-slow {
                0% {
                  transform: scale(1);
                  opacity: 0.5;
                }
                50% {
                  transform: scale(1.5);
                  opacity: 0;
                }
                100% {
                  transform: scale(1);
                  opacity: 0;
                }
              }
              .animate-ping-slow {
                animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
              }
            `}</style>

            {/* Topic Selection */}
            <div className="max-w-3xl mx-auto mb-8 animate-slide-up delay-100">
              <div className="flex flex-col items-center justify-center mb-4">
                <h2 className="text-xl font-semibold text-center text-gray-100 mb-3">Choose a Topic</h2>
                <button
                  onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
                  className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium border border-gray-700 transition-all duration-300 flex items-center gap-2"
                >
                  {isCategoriesExpanded ? (
                    <>
                      <span>Show Less</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>Show More</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
              <div className={`transition-all duration-500 ${isCategoriesExpanded ? 'opacity-100 max-h-[400px]' : 'opacity-100 max-h-80'}`}>
                <div className="flex flex-wrap justify-center gap-2">
                  {displayedTopics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => handleTopicSelect(topic)}
                      className={`px-3 py-1.5 rounded-full transition-all duration-300 transform hover:scale-105 text-xs font-medium ${
                        selectedTopic === topic.toLowerCase()
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                          : 'bg-gray-800 hover:bg-gray-700 hover:shadow-md text-gray-300 border border-gray-700'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Remaining News */}
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-semibold mb-8 text-center animate-fade-in text-gray-100">More Stories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {remainingNews.map((article, index) => (
                  <Link
                    key={index}
                    href={{
                      pathname: '/article',
                      query: {
                        title: article.title,
                        description: article.description,
                        url: article.url,
                        urlToImage: article.urlToImage,
                        publishedAt: article.publishedAt,
                        source: article.source.name,
                        content: article.content,
                      },
                    }}
                    className={`block h-full group perspective card-reveal card-reveal-delay-${(index % 6) + 1}`}
                    onMouseEnter={() => handleCardHover(index + 3)}
                    onMouseLeave={handleCardLeave}
                  >
                    <article
                      className="bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer h-full border border-gray-700 relative preserve-3d news-card"
                    >
                      <div className="card-inner">
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={article.urlToImage || DEFAULT_IMAGE}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = NEWS_LOGO;
                              target.onerror = null;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                        <div className="p-5">
                          <h2 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors duration-300 text-gray-100">
                            {article.title}
                          </h2>
                          <div className="relative overflow-hidden">
                            <p className={`text-gray-300 mb-3 line-clamp-3 text-sm transition-all duration-500 ${
                              hoveredCard === index + 3 ? 'line-clamp-none' : ''
                            }`}>
                              {article.description}
                            </p>
                            <div className={`absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gray-800 to-transparent transition-opacity duration-500 ${
                              hoveredCard === index + 3 ? 'opacity-0' : 'opacity-100'
                            }`}></div>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-700 pt-3">
                            <span className="group-hover:text-blue-400 transition-colors duration-300 font-medium">{article.source.name}</span>
                            <span className="group-hover:text-blue-400 transition-colors duration-300">
                              {format(new Date(article.publishedAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {showEasterEgg && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md mx-4 transform transition-all duration-500 animate-scale-in">
              <div className="text-center">
                <p className="text-xl text-gray-100 mb-6">{easterEggMessage}</p>
                <button
                  onClick={() => setShowEasterEgg(false)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

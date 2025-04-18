"use client"

import { useState } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  ArcElement,
  Filler,
} from "chart.js"
import { Line, Bar, Radar, Doughnut } from "react-chartjs-2"
import { ArrowUp, ArrowDown, TrendingUp, Users, MessageSquare, Heart, BarChart2, Calendar } from "lucide-react"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  ArcElement,
  Filler,
)

// Define types based on your Prisma schema
interface AIRating {
  id: string
  postId: string
  engagementScore: number
  contentQualityScore: number
  mediaQualityScore: number
  commentSentimentScore: number
  authenticityScore: number
  overallAIScore: number
  createdAt: string
}

interface Post {
  id: string
  description: string
  mediaUrls: string[]
  createdAt: string
  likes: { id: string }[]
  comments: { id: string }[]
  views: number
  aiRating?: AIRating
}

export default function Analytics() {
  // Time period filter
  const [timePeriod, setTimePeriod] = useState<"week" | "month" | "year">("month")

  // Generate fake data for analytics
  const generateFakeData = () => {
    // Generate dates for the selected time period
    const dates: string[] = []
    const now = new Date()
    const daysToGenerate = timePeriod === "week" ? 7 : timePeriod === "month" ? 30 : 365

    for (let i = daysToGenerate - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      dates.push(date.toLocaleDateString("en-US", { month: "short", day: "numeric" }))
    }

    // Generate fake posts with AI ratings
    const posts: Post[] = Array.from({ length: 20 }, (_, i) => {
      const creationDate = new Date(now)
      creationDate.setDate(creationDate.getDate() - Math.floor(Math.random() * daysToGenerate))

      return {
        id: `post-${i}`,
        description: `Sample post description ${i}`,
        mediaUrls: i % 2 === 0 ? [`/image-${i}.jpg`] : [],
        createdAt: creationDate.toISOString(),
        likes: Array.from({ length: Math.floor(Math.random() * 50) }, (_, j) => ({ id: `like-${j}` })),
        comments: Array.from({ length: Math.floor(Math.random() * 20) }, (_, j) => ({ id: `comment-${j}` })),
        views: Math.floor(Math.random() * 200) + 50,
        aiRating: {
          id: `rating-${i}`,
          postId: `post-${i}`,
          engagementScore: Number.parseFloat((Math.random() * 5).toFixed(1)),
          contentQualityScore: Number.parseFloat((Math.random() * 5).toFixed(1)),
          mediaQualityScore: Number.parseFloat((Math.random() * 5).toFixed(1)),
          commentSentimentScore: Number.parseFloat((Math.random() * 5).toFixed(1)),
          authenticityScore: Number.parseFloat((Math.random() * 5).toFixed(1)),
          overallAIScore: Number.parseFloat((Math.random() * 5).toFixed(1)),
          createdAt: creationDate.toISOString(),
        },
      }
    })

    // Calculate daily metrics
    const dailyEngagement = dates.map(() => 0)
    const dailyContentQuality = dates.map(() => 0)
    const dailyOverallScore = dates.map(() => 0)
    const postsPerDay = dates.map(() => 0)

    posts.forEach((post) => {
      if (post.aiRating) {
        const postDate = new Date(post.createdAt)
        const dateStr = postDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        const dateIndex = dates.indexOf(dateStr)

        if (dateIndex !== -1) {
          dailyEngagement[dateIndex] += post.aiRating.engagementScore
          dailyContentQuality[dateIndex] += post.aiRating.contentQualityScore
          dailyOverallScore[dateIndex] += post.aiRating.overallAIScore
          postsPerDay[dateIndex]++
        }
      }
    })

    // Average the scores by the number of posts per day
    for (let i = 0; i < dates.length; i++) {
      if (postsPerDay[i] > 0) {
        dailyEngagement[i] = Number.parseFloat((dailyEngagement[i] / postsPerDay[i]).toFixed(1))
        dailyContentQuality[i] = Number.parseFloat((dailyContentQuality[i] / postsPerDay[i]).toFixed(1))
        dailyOverallScore[i] = Number.parseFloat((dailyOverallScore[i] / postsPerDay[i]).toFixed(1))
      }
    }

    // Calculate average scores across all posts
    const avgEngagement = posts.reduce((sum, post) => sum + (post.aiRating?.engagementScore || 0), 0) / posts.length
    const avgContentQuality =
      posts.reduce((sum, post) => sum + (post.aiRating?.contentQualityScore || 0), 0) / posts.length
    const avgMediaQuality = posts.reduce((sum, post) => sum + (post.aiRating?.mediaQualityScore || 0), 0) / posts.length
    const avgCommentSentiment =
      posts.reduce((sum, post) => sum + (post.aiRating?.commentSentimentScore || 0), 0) / posts.length
    const avgAuthenticity = posts.reduce((sum, post) => sum + (post.aiRating?.authenticityScore || 0), 0) / posts.length
    const avgOverallScore = posts.reduce((sum, post) => sum + (post.aiRating?.overallAIScore || 0), 0) / posts.length

    // Calculate total engagement
    const totalLikes = posts.reduce((sum, post) => sum + post.likes.length, 0)
    const totalComments = posts.reduce((sum, post) => sum + post.comments.length, 0)
    const totalViews = posts.reduce((sum, post) => sum + post.views, 0)

    // Find top performing posts
    const topPosts = [...posts]
      .sort((a, b) => (b.aiRating?.overallAIScore || 0) - (a.aiRating?.overallAIScore || 0))
      .slice(0, 5)

    return {
      dates,
      dailyEngagement,
      dailyContentQuality,
      dailyOverallScore,
      postsPerDay,
      avgEngagement,
      avgContentQuality,
      avgMediaQuality,
      avgCommentSentiment,
      avgAuthenticity,
      avgOverallScore,
      totalLikes,
      totalComments,
      totalViews,
      topPosts,
      posts,
    }
  }

  const data = generateFakeData()

  // Chart data for line chart
  const lineChartData = {
    labels: data.dates,
    datasets: [
      {
        label: "Overall AI Score",
        data: data.dailyOverallScore,
        borderColor: "#fc7348",
        backgroundColor: "rgba(252, 115, 72, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Engagement Score",
        data: data.dailyEngagement,
        borderColor: "#4466ff",
        backgroundColor: "rgba(68, 102, 255, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Content Quality",
        data: data.dailyContentQuality,
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  }

  // Chart data for radar chart
  const radarChartData = {
    labels: ["Engagement", "Content Quality", "Media Quality", "Comment Sentiment", "Authenticity", "Overall Score"],
    datasets: [
      {
        label: "Your Scores",
        data: [
          data.avgEngagement,
          data.avgContentQuality,
          data.avgMediaQuality,
          data.avgCommentSentiment,
          data.avgAuthenticity,
          data.avgOverallScore,
        ],
        backgroundColor: "rgba(252, 115, 72, 0.2)",
        borderColor: "#fc7348",
        pointBackgroundColor: "#fc7348",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#fc7348",
      },
      {
        label: "Platform Average",
        data: [3.2, 3.5, 3.3, 3.0, 3.7, 3.4],
        backgroundColor: "rgba(68, 102, 255, 0.2)",
        borderColor: "#4466ff",
        pointBackgroundColor: "#4466ff",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#4466ff",
      },
    ],
  }

  // Chart data for posts per day
  const postsBarData = {
    labels: data.dates,
    datasets: [
      {
        label: "Posts",
        data: data.postsPerDay,
        backgroundColor: "rgba(252, 115, 72, 0.7)",
      },
    ],
  }

  // Chart data for engagement distribution
  const engagementData = {
    labels: ["Likes", "Comments", "Views"],
    datasets: [
      {
        data: [data.totalLikes, data.totalComments, data.totalViews / 10], // Scale down views for better visualization
        backgroundColor: ["rgba(252, 115, 72, 0.7)", "rgba(68, 102, 255, 0.7)", "rgba(16, 185, 129, 0.7)"],
        borderColor: ["#fc7348", "#4466ff", "#10b981"],
        borderWidth: 1,
      },
    ],
  }

  // Calculate growth metrics (fake data)
  const growthMetrics = {
    overallScoreGrowth: 12.5,
    engagementGrowth: 8.3,
    followersGrowth: 15.2,
    viewsGrowth: -3.7,
  }

  return (
    <div className="bg-[#1d1d1d] text-white p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-400">Track your performance and AI-powered insights</p>
      </div>

      {/* Time period filter */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTimePeriod("week")}
          className={`px-4 py-2 rounded-lg ${
            timePeriod === "week" ? "bg-[#fc7348] text-white" : "bg-black/20 text-gray-300 hover:bg-black/30"
          }`}
        >
          Week
        </button>
        <button
          onClick={() => setTimePeriod("month")}
          className={`px-4 py-2 rounded-lg ${
            timePeriod === "month" ? "bg-[#fc7348] text-white" : "bg-black/20 text-gray-300 hover:bg-black/30"
          }`}
        >
          Month
        </button>
        <button
          onClick={() => setTimePeriod("year")}
          className={`px-4 py-2 rounded-lg ${
            timePeriod === "year" ? "bg-[#fc7348] text-white" : "bg-black/20 text-gray-300 hover:bg-black/30"
          }`}
        >
          Year
        </button>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Overall AI Score</p>
              <h3 className="text-2xl font-bold">{data.avgOverallScore.toFixed(1)}/5.0</h3>
            </div>
            <div
              className={`flex items-center ${growthMetrics.overallScoreGrowth >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {growthMetrics.overallScoreGrowth >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              <span className="text-sm">{Math.abs(growthMetrics.overallScoreGrowth)}%</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-700/30 rounded-full h-1.5">
              <div
                className="bg-[#fc7348] h-1.5 rounded-full"
                style={{ width: `${(data.avgOverallScore / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Engagement</p>
              <h3 className="text-2xl font-bold">{data.avgEngagement.toFixed(1)}/5.0</h3>
            </div>
            <div
              className={`flex items-center ${growthMetrics.engagementGrowth >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {growthMetrics.engagementGrowth >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              <span className="text-sm">{Math.abs(growthMetrics.engagementGrowth)}%</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-700/30 rounded-full h-1.5">
              <div
                className="bg-[#4466ff] h-1.5 rounded-full"
                style={{ width: `${(data.avgEngagement / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Followers</p>
              <h3 className="text-2xl font-bold">1,248</h3>
            </div>
            <div
              className={`flex items-center ${growthMetrics.followersGrowth >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {growthMetrics.followersGrowth >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              <span className="text-sm">{Math.abs(growthMetrics.followersGrowth)}%</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-2">+24 this {timePeriod}</p>
        </div>

        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Total Views</p>
              <h3 className="text-2xl font-bold">{data.totalViews.toLocaleString()}</h3>
            </div>
            <div className={`flex items-center ${growthMetrics.viewsGrowth >= 0 ? "text-green-500" : "text-red-500"}`}>
              {growthMetrics.viewsGrowth >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              <span className="text-sm">{Math.abs(growthMetrics.viewsGrowth)}%</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-2">Avg {Math.round(data.totalViews / data.posts.length)} per post</p>
        </div>
      </div>

      {/* Main charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-black/20 p-4 rounded-xl border border-white/5">
          <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
          <div className="h-[300px]">
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 5,
                    grid: {
                      color: "rgba(255, 255, 255, 0.05)",
                    },
                    ticks: {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                  },
                  x: {
                    grid: {
                      color: "rgba(255, 255, 255, 0.05)",
                    },
                    ticks: {
                      color: "rgba(255, 255, 255, 0.7)",
                      maxRotation: 45,
                      minRotation: 45,
                    },
                  },
                },
                plugins: {
                  legend: {
                    position: "top" as const,
                    labels: {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                  },
                  tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    titleColor: "rgba(255, 255, 255, 0.9)",
                    bodyColor: "rgba(255, 255, 255, 0.9)",
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
          <h3 className="text-lg font-semibold mb-4">AI Rating Breakdown</h3>
          <div className="h-[300px]">
            <Radar
              data={radarChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                      stepSize: 1,
                      display: false,
                    },
                    grid: {
                      color: "rgba(255, 255, 255, 0.1)",
                    },
                    angleLines: {
                      color: "rgba(255, 255, 255, 0.1)",
                    },
                    pointLabels: {
                      color: "rgba(255, 255, 255, 0.7)",
                      font: {
                        size: 10,
                      },
                    },
                  },
                },
                plugins: {
                  legend: {
                    position: "top" as const,
                    labels: {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                  },
                  tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    titleColor: "rgba(255, 255, 255, 0.9)",
                    bodyColor: "rgba(255, 255, 255, 0.9)",
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Secondary charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
          <h3 className="text-lg font-semibold mb-4">Posts Activity</h3>
          <div className="h-[250px]">
            <Bar
              data={postsBarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: "rgba(255, 255, 255, 0.05)",
                    },
                    ticks: {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      color: "rgba(255, 255, 255, 0.7)",
                      maxRotation: 45,
                      minRotation: 45,
                    },
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    titleColor: "rgba(255, 255, 255, 0.9)",
                    bodyColor: "rgba(255, 255, 255, 0.9)",
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
          <h3 className="text-lg font-semibold mb-4">Engagement Distribution</h3>
          <div className="h-[250px] flex items-center justify-center">
            <div className="w-[200px]">
              <Doughnut
                data={engagementData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom" as const,
                      labels: {
                        color: "rgba(255, 255, 255, 0.7)",
                      },
                    },
                    tooltip: {
                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                      titleColor: "rgba(255, 255, 255, 0.9)",
                      bodyColor: "rgba(255, 255, 255, 0.9)",
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Engagement metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-[#fc7348]/10 rounded-full">
            <TrendingUp className="w-6 h-6 text-[#fc7348]" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Content Quality</p>
            <h3 className="text-xl font-bold">{data.avgContentQuality.toFixed(1)}/5.0</h3>
          </div>
        </div>

        <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-[#4466ff]/10 rounded-full">
            <Users className="w-6 h-6 text-[#4466ff]" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Authenticity</p>
            <h3 className="text-xl font-bold">{data.avgAuthenticity.toFixed(1)}/5.0</h3>
          </div>
        </div>

        <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-[#10b981]/10 rounded-full">
            <MessageSquare className="w-6 h-6 text-[#10b981]" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Comment Sentiment</p>
            <h3 className="text-xl font-bold">{data.avgCommentSentiment.toFixed(1)}/5.0</h3>
          </div>
        </div>

        <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-[#f59e0b]/10 rounded-full">
            <Heart className="w-6 h-6 text-[#f59e0b]" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Media Quality</p>
            <h3 className="text-xl font-bold">{data.avgMediaQuality.toFixed(1)}/5.0</h3>
          </div>
        </div>
      </div>

      {/* Top performing posts */}
      <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-6">
        <h3 className="text-lg font-semibold mb-4">Top Performing Posts</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 border-b border-white/10">
                <th className="pb-2 font-medium">Post</th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Likes</th>
                <th className="pb-2 font-medium">Comments</th>
                <th className="pb-2 font-medium">Views</th>
                <th className="pb-2 font-medium">AI Score</th>
              </tr>
            </thead>
            <tbody>
              {data.topPosts.map((post, index) => (
                <tr key={post.id} className="border-b border-white/5">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-xs">
                        {index + 1}
                      </div>
                      <div className="truncate max-w-[150px]">{post.description}</div>
                    </div>
                  </td>
                  <td className="py-3 text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">{post.likes.length}</td>
                  <td className="py-3">{post.comments.length}</td>
                  <td className="py-3">{post.views}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{post.aiRating?.overallAIScore.toFixed(1)}</span>
                      <div className="w-16 bg-gray-700/30 rounded-full h-1.5">
                        <div
                          className="bg-[#fc7348] h-1.5 rounded-full"
                          style={{ width: `${((post.aiRating?.overallAIScore || 0) / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-black/20 p-4 rounded-xl border border-white/5">
        <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 border border-white/10 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-5 h-5 text-[#fc7348]" />
              <h4 className="font-medium">Engagement Strategy</h4>
            </div>
            <p className="text-sm text-gray-400">
              Based on your content performance, try posting more media-rich content with questions to increase
              engagement. Your highest engagement is on weekdays between 2-4 PM.
            </p>
          </div>
          <div className="p-3 border border-white/10 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-[#4466ff]" />
              <h4 className="font-medium">Content Schedule</h4>
            </div>
            <p className="text-sm text-gray-400">
              Your content quality scores are highest when you post 3-4 times per week. Consider a more consistent
              posting schedule to maintain engagement.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

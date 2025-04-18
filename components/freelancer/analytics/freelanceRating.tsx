// app/components/freelancer/FreelancerRating.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { StarIcon, AwardIcon } from 'lucide-react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, ChartData, ChartOptions } from 'chart.js';
import { Radar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

type Rating = {
  id: string;
  deliveryScore: number;
  qualityScore: number;
  communicationScore: number;
  overallScore: number;
  comments: string | null;
  createdAt: string;
  client: {
    id: string;
    name: string;
    profileImage: string | null;
  };
  project: {
    id: string;
    job: {
      title: string;
    };
  };
};

type AverageRatings = {
  averageDeliveryScore: number;
  averageQualityScore: number;
  averageCommunicationScore: number;
  averageOverallScore: number;
  totalRatings: number;
};

type AIRating = {
  engagementScore: number;
  contentQualityScore: number;
  mediaQualityScore: number;
  commentSentimentScore: number;
  authenticityScore: number;
  overallAIScore: number;
};

type Props = {
  freelancerId: string;
};

export default function FreelancerRating({ freelancerId }: Props) {
  const [loading, setLoading] = useState(true);
  const [clientRatings, setClientRatings] = useState<Rating[]>([]);
  const [averageRatings, setAverageRatings] = useState<AverageRatings | null>(null);
  const [aiRatings, setAiRatings] = useState<AIRating[]>([]);
  const [combinedRating, setCombinedRating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRatings() {
      try {
        setLoading(true);
        
        // Fetch client ratings
        const clientResponse = await fetch(`/api/ratings?freelancerId=${freelancerId}`);
        if (!clientResponse.ok) throw new Error('Failed to fetch client ratings');
        const clientData = await clientResponse.json();
        
        setClientRatings(clientData.data.ratings);
        setAverageRatings(clientData.data.averages);
        
        // Fetch AI ratings
        const aiResponse = await fetch(`/api/ai/rating/${freelancerId}`);
        if (!aiResponse.ok) throw new Error('Failed to fetch AI ratings');
        const aiData = await aiResponse.json();
        
        setAiRatings(aiData.data.ratings);
        setCombinedRating(aiData.data.combinedRating);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRatings();
  }, [freelancerId]);

  // Generate client radar chart data
  const clientRadarData: ChartData<'radar'> = {
    labels: ['Delivery', 'Quality', 'Communication'],
    datasets: [
      {
        label: 'Client Rating',
        data: averageRatings ? [
          averageRatings.averageDeliveryScore,
          averageRatings.averageQualityScore,
          averageRatings.averageCommunicationScore
        ] : [0, 0, 0],
        backgroundColor: 'rgba(136, 132, 216, 0.2)',
        borderColor: 'rgba(136, 132, 216, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(136, 132, 216, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(136, 132, 216, 1)',
      }
    ]
  };

  // Generate AI radar chart data
  const aiRadarData: ChartData<'radar'> = {
    labels: ['Engagement', 'Content Quality', 'Media Quality', 'Comment Sentiment', 'Authenticity'],
    datasets: [
      {
        label: 'AI Analysis',
        data: aiRatings.length > 0 ? [
          aiRatings.reduce((sum, rating) => sum + rating.engagementScore, 0) / aiRatings.length,
          aiRatings.reduce((sum, rating) => sum + rating.contentQualityScore, 0) / aiRatings.length,
          aiRatings.reduce((sum, rating) => sum + rating.mediaQualityScore, 0) / aiRatings.length,
          aiRatings.reduce((sum, rating) => sum + rating.commentSentimentScore, 0) / aiRatings.length,
          aiRatings.reduce((sum, rating) => sum + rating.authenticityScore, 0) / aiRatings.length
        ] : [0, 0, 0, 0, 0],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(99, 102, 241, 1)',
      }
    ]
  };

  // Generate combined radar chart data
  const combinedRadarData: ChartData<'radar'> = {
    labels: [
      'Delivery', 
      'Quality', 
      'Communication', 
      'Engagement', 
      'Content Quality', 
      'Media Quality'
    ],
    datasets: [
      {
        label: 'Combined Rating',
        data: [
          averageRatings?.averageDeliveryScore || 0,
          averageRatings?.averageQualityScore || 0,
          averageRatings?.averageCommunicationScore || 0,
          aiRatings.length > 0 ? aiRatings.reduce((sum, r) => sum + r.engagementScore, 0) / aiRatings.length : 0,
          aiRatings.length > 0 ? aiRatings.reduce((sum, r) => sum + r.contentQualityScore, 0) / aiRatings.length : 0,
          aiRatings.length > 0 ? aiRatings.reduce((sum, r) => sum + r.mediaQualityScore, 0) / aiRatings.length : 0
        ],
        backgroundColor: 'rgba(124, 58, 237, 0.2)',
        borderColor: 'rgba(124, 58, 237, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(124, 58, 237, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(124, 58, 237, 1)',
      }
    ]
  };

  // Chart.js options (shared across charts)
  const chartOptions: ChartOptions<'radar'> = {
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 10,
        ticks: {
          stepSize: 2
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.r.toFixed(1)}/10`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  // Function to render star ratings
  const renderStars = (score: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-5 w-5 ${
              star <= score / 2 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{score.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        Loading
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-md text-red-600">
        Error loading ratings: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="p-3 rounded-full bg-purple-100">
          <AwardIcon className="h-10 w-10 text-purple-600" />
        </div>
        <div>
          <h3 className="text-2xl font-semibold">
            {combinedRating !== null ? combinedRating.toFixed(1) : 'N/A'}/10
          </h3>
          <p className="text-gray-500">Overall Rating</p>
        </div>
      </div>

      <div defaultValue="combined">
        <div className="grid w-full grid-cols-3">
          <div >Combined Rating</div>
          <div >Client Ratings</div>
          <div >AI Analysis</div>
        </div>

        <div >
          <div>
            <div>
              <div>Combined Rating</div>
              <div>
                Overall rating based on client feedback and AI analysis of portfolio content
              </div>
            </div>
            <div>
              <div className="h-72">
                <Radar data={combinedRadarData} options={chartOptions} />
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="font-medium text-sm text-purple-700">
                    What does this mean?
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    This combined rating represents both client feedback and AI analysis of portfolio content. 
                    A score above 7 indicates a highly skilled freelancer, while a score below 5 suggests room for improvement.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-3">
                    <p className="text-sm font-medium text-gray-500">Client Ratings</p>
                    <p className="text-xl font-bold mt-1">
                      {averageRatings?.averageOverallScore.toFixed(1) || 'N/A'}/10
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Based on {averageRatings?.totalRatings || 0} ratings
                    </p>
                  </div>
                  
                  <div className="rounded-lg border p-3">
                    <p className="text-sm font-medium text-gray-500">AI Analysis</p>
                    <p className="text-xl font-bold mt-1">
                      {aiRatings.length > 0 
                        ? (aiRatings.reduce((sum, r) => sum + r.overallAIScore, 0) / aiRatings.length).toFixed(1)
                        : 'N/A'}/10
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Based on {aiRatings.length} portfolio items
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div >
          <div>
            <div>
              <div>Client Ratings</div>
              <div>
                Feedback from clients on completed projects
              </div>
            </div>
            <div>
              {clientRatings.length > 0 ? (
                <div className="space-y-6">
                  <div className="h-72 mb-6">
                    <Radar data={clientRadarData} options={chartOptions} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-3">
                      <p className="text-sm font-medium text-gray-500">Delivery</p>
                      {renderStars(averageRatings?.averageDeliveryScore || 0)}
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-sm font-medium text-gray-500">Quality</p>
                      {renderStars(averageRatings?.averageQualityScore || 0)}
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-sm font-medium text-gray-500">Communication</p>
                      {renderStars(averageRatings?.averageCommunicationScore || 0)}
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-sm font-medium text-gray-500">Overall</p>
                      {renderStars(averageRatings?.averageOverallScore || 0)}
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-lg mt-6 mb-4">Recent Ratings</h4>
                  <div className="space-y-4">
                    {clientRatings.slice(0, 3).map((rating) => (
                      <div key={rating.id} className="p-4 rounded-lg border">
                        <div className="flex justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                              {rating.client.profileImage ? (
                                <img 
                                  src={rating.client.profileImage} 
                                  alt={rating.client.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-purple-100 text-purple-600 font-medium">
                                  {rating.client.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{rating.client.name}</p>
                              <p className="text-sm text-gray-500">{new Date(rating.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          {renderStars(rating.overallScore)}
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-2">
                          Project: {rating.project.job.title}
                        </p>
                        
                        {rating.comments && (
                          <p className="mt-2 text-sm text-gray-600">
                            "{rating.comments}"
                          </p>
                        )}
                      </div>
                    ))}
                    
                    {clientRatings.length > 3 && (
                      <button className="text-sm text-purple-600 font-medium hover:underline w-full text-center mt-2">
                        View all {clientRatings.length} ratings
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No client ratings yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div >
          <div>
            <div>
              <div>AI Analysis</div>
              <div>
                Automated analysis of portfolio content and engagement
              </div>
            </div>
            <div>
              {aiRatings.length > 0 ? (
                <div className="space-y-6">
                  <div className="h-72">
                    <Radar data={aiRadarData} options={chartOptions} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-3">
                      <p className="text-sm font-medium text-gray-500">Engagement Score</p>
                      <p className="text-xl font-bold mt-1">
                        {(aiRatings.reduce((sum, r) => sum + r.engagementScore, 0) / aiRatings.length).toFixed(1)}/10
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Based on likes, comments and views
                      </p>
                    </div>
                    
                    <div className="rounded-lg border p-3">
                      <p className="text-sm font-medium text-gray-500">Content Quality</p>
                      <p className="text-xl font-bold mt-1">
                        {(aiRatings.reduce((sum, r) => sum + r.contentQualityScore, 0) / aiRatings.length).toFixed(1)}/10
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Based on description quality
                      </p>
                    </div>
                    
                    <div className="rounded-lg border p-3">
                      <p className="text-sm font-medium text-gray-500">Media Quality</p>
                      <p className="text-xl font-bold mt-1">
                        {(aiRatings.reduce((sum, r) => sum + r.mediaQualityScore, 0) / aiRatings.length).toFixed(1)}/10
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Based on uploaded photos/videos
                      </p>
                    </div>
                    
                    <div className="rounded-lg border p-3">
                      <p className="text-sm font-medium text-gray-500">Comment Sentiment</p>
                      <p className="text-xl font-bold mt-1">
                        {(aiRatings.reduce((sum, r) => sum + r.commentSentimentScore, 0) / aiRatings.length).toFixed(1)}/10
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Analysis of comment positivity
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="font-medium text-sm text-blue-700">
                      What does AI analyze?
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Our AI rating system analyzes your portfolio content, engagement metrics, and comment sentiment to provide an objective assessment of your work quality.
                      This helps new freelancers establish credibility even without client ratings.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No AI ratings available yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Add some portfolio posts to get AI ratings
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
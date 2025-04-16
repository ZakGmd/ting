"use client"

import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

const stats = [
  {
    title: 'Total Projects',
    value: '12',
    change: '+2',
    trend: 'up',
    icon: Briefcase
  },
  {
    title: 'Active Freelancers',
    value: '8',
    change: '+3',
    trend: 'up',
    icon: Users
  },
  {
    title: 'Total Spent',
    value: '$2,450',
    change: '+$450',
    trend: 'up',
    icon: DollarSign
  },
  {
    title: 'Project Completion',
    value: '85%',
    change: '-5%',
    trend: 'down',
    icon: TrendingUp
  }
]

export default function DashboardMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div 
          key={stat.title}
          className="bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">{stat.title}</p>
              <h3 className="text-2xl font-semibold mt-1">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${
              stat.trend === 'up' ? 'bg-green-500/10' : 'bg-red-500/10'
            }`}>
              <stat.icon className={`w-6 h-6 ${
                stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`} />
            </div>
          </div>
          <div className="flex items-center mt-4">
            {stat.trend === 'up' ? (
              <ArrowUpRight className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm ml-1 ${
              stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
            }`}>
              {stat.change} this month
            </span>
          </div>
        </div>
      ))}
    </div>
  )
} 
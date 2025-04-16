"use client"

const recentProjects = [
  {
    title: 'Website Redesign',
    freelancer: 'Sarah Johnson',
    status: 'In Progress',
    budget: '$1,200',
    deadline: 'May 15, 2024'
  },
  {
    title: 'Mobile App Development',
    freelancer: 'Mike Chen',
    status: 'Completed',
    budget: '$2,500',
    deadline: 'April 30, 2024'
  },
  {
    title: 'Logo Design',
    freelancer: 'Emma Wilson',
    status: 'Pending',
    budget: '$500',
    deadline: 'May 20, 2024'
  }
]

export default function RecentProjects() {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Recent Projects</h2>
        <button className="text-[#fc7348] hover:text-[#fc7348]/80 text-sm">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {recentProjects.map((project) => (
          <div 
            key={project.title}
            className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
          >
            <div>
              <h3 className="font-medium">{project.title}</h3>
              <p className="text-sm text-white/60 mt-1">{project.freelancer}</p>
            </div>
            <div className="flex items-center gap-8">
              <div>
                <p className="text-sm text-white/60">Status</p>
                <p className={`font-medium ${
                  project.status === 'Completed' ? 'text-green-500' :
                  project.status === 'In Progress' ? 'text-[#fc7348]' :
                  'text-yellow-500'
                }`}>
                  {project.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-white/60">Budget</p>
                <p className="font-medium">{project.budget}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Deadline</p>
                <p className="font-medium">{project.deadline}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
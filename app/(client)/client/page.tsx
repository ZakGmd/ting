"use client"

import ClientSidebar from "@/components/client/ClientSidebar"
import ClientHeader from "@/components/client/ClientHeader"
import DashboardMetrics from "@/components/client/DashboardMetrics"
import RecentProjects from "@/components/client/RecentProjects"
import TopFreelancers from "@/components/client/TopFreelancers"

export default function ClientDashboard() {
  return (
    <div className="flex h-screen bg-[#1D1D1F] text-white">
      <ClientSidebar />
      
      <div className="flex-1 flex flex-col">
        <ClientHeader />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            <DashboardMetrics />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentProjects />
              <TopFreelancers />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
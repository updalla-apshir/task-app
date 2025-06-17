"use client"

import { StatsCards } from "./stats-cards"
import { ActiveProjects } from "./active-projects"
import { ActivityFeed } from "./activity-feed"
import { AnalyticsWidgets } from "./analytics-widgets"

export function DashboardLayout() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCards />
      </div>
      
      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ActiveProjects />
        <ActivityFeed />
      </div>
      
      {/* Analytics Widgets */}
      <h3 className="text-xl font-semibold tracking-tight mt-8">Analytics</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnalyticsWidgets />
      </div>
    </div>
  )
} 
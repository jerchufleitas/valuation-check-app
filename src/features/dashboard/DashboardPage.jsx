import React from 'react';
import { WelcomeSection } from './components/WelcomeSection';
import { AnalyticsWidgets } from './components/AnalyticsWidgets';
import { RecentActivity } from './components/RecentActivity';

export default function Dashboard({ user, onNewValuation, setView }) {
  return (
    <div className="absolute inset-0 bg-[#0d1b2a] overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Welcome Section */}
        <WelcomeSection user={user} onNewValuation={onNewValuation} />

        {/* Analytics Widgets - Bento Grid Row 1 */}
        <AnalyticsWidgets />

        <div className="grid grid-cols-1 gap-8">
          {/* Recent Activity - Takes full width */}
          <div className="w-full">
            <RecentActivity setView={setView} />
          </div>
        </div>
      </div>
    </div>
  );
}

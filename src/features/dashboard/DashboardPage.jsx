import React from 'react';
import { WelcomeSection } from './components/WelcomeSection';
import { AnalyticsWidgets } from './components/AnalyticsWidgets';
import { RecentActivity } from './components/RecentActivity';
import { AchievementCard } from './components/AchievementCard';

export default function Dashboard({ user, onNewValuation, setView }) {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeSection user={user} onNewValuation={onNewValuation} />

      {/* Analytics Widgets - Bento Grid Row 1 */}
      <AnalyticsWidgets />

      {/* Bento Grid Row 2 - Recent Activity & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentActivity setView={setView} />
        </div>

        {/* Achievement Card - Takes 1 column */}
        <div>
          <AchievementCard />
        </div>
      </div>
    </div>
  );
}

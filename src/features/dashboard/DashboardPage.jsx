import { WelcomeSection } from './components/WelcomeSection';
import { AnalyticsWidgets } from './components/AnalyticsWidgets';
import { RecentActivity } from './components/RecentActivity';
import LegalFooter from '../../components/ui/LegalFooter';

export default function Dashboard({ user, onNewValuation, setView }) {
  return (
    <div className="flex flex-col min-h-full">
      <div className="max-w-7xl mx-auto w-full p-8 space-y-8 flex-1">
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
      
      <LegalFooter isDark={false} />
    </div>
  );
}

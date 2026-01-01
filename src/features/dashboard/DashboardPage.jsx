import { useState, useEffect } from 'react';
import { WelcomeSection } from './components/WelcomeSection';
import { AnalyticsWidgets } from './components/AnalyticsWidgets';
import { RecentActivity } from './components/RecentActivity';
import LegalFooter from '../../components/ui/LegalFooter';
import { getValuations } from '../../firebase/valuationService';

export default function Dashboard({ user, onNewValuation, setView, onSelect }) {
  const [valuations, setValuations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchValuations = async () => {
      if (!user?.uid) return;
      try {
        const data = await getValuations(user.uid);
        setValuations(data);
      } catch (error) {
        console.error("Error fetching valuations for dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchValuations();
  }, [user?.uid]);

  return (
    <div className="flex flex-col min-h-full">
      <div className="max-w-7xl mx-auto w-full p-8 space-y-8 flex-1">
        {/* Welcome Section */}
        <WelcomeSection user={user} onNewValuation={onNewValuation} />

        {/* Analytics Widgets - Bento Grid Row 1 */}
        <AnalyticsWidgets valuations={valuations} loading={loading} />

        <div className="grid grid-cols-1 gap-8">
          {/* Recent Activity - Takes full width */}
          <div className="w-full">
            <RecentActivity 
              setView={setView} 
              user={user} 
              onSelect={onSelect} 
              initialData={valuations.slice(0, 3)}
              loading={loading}
            />
          </div>
        </div>
      </div>
      
      <LegalFooter isDark={false} />
    </div>
  );
}

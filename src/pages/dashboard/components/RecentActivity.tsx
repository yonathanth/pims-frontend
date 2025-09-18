import React from 'react';
import type { AuditLog } from '../../../api/dashboard';

interface RecentActivityProps {
  data?: AuditLog[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ data }) => {
  // Transform backend data to display format
  const activities = data
    ? data.map((log) => ({
        initials: log.entityName.substring(0, 2).toUpperCase(),
        name: log.entityName,
        type: log.action.toLowerCase(),
        typeColor: 'bg-gray-200 text-gray-900',
        typeText: log.action,
        description: log.changeSummary,
        time: new Date(log.timestamp).toLocaleString(),
      }))
    : [
        {
          initials: 'SJ',
          name: 'Sarah Johnson',
          type: 'inventory',
          typeColor: 'bg-gray-200 text-gray-900',
          typeText: 'inventory',
          description: 'Added inventory Amoxicillin 500mg (100 units)',
          time: '2 minutes ago',
        },
        {
          initials: 'MC',
          name: 'Mike Chen',
          type: 'order',
          typeColor: 'bg-gray-200 text-gray-900',
          typeText: 'order',
          description: 'Created purchase order PO-2024-001 for PharmaCorp',
          time: '15 minutes ago',
        },
        {
          initials: 'MC',
          name: 'Mike Chen',
          type: 'system',
          typeColor: 'bg-gray-200 text-gray-900',
          typeText: 'system',
          description: 'Created purchase order PO-2024-001 for PharmaCorp',
          time: '15 minutes ago',
        },
      ];

  return (
    <div className="w-[60%] px-6">
      <h2 className=" font-bold mb-4 flex items-center gap-2">
        Recent Activity
      </h2>
      <div className="flex flex-col gap-6">
        {activities.map((a, idx) => (
          <div key={idx} className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-700">
              {a.initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{a.name}</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${a.typeColor}`}
                >
                  {a.typeText}
                </span>
              </div>
              <div className="flex justify-between">
                {a.description && (
                  <div className="text-gray-600 text-sm">{a.description}</div>
                )}
                {a.time && (
                  <div className="text-xs text-gray-400 mt-1">{a.time}</div>
                )}
              </div>
            </div>
          </div>
        ))}
        <p className="text-right text-sm">
          <a href="/dashboard/audit" className="hover:text-blue-600">
            ...See all
          </a>
        </p>
      </div>
    </div>
  );
};

export default RecentActivity;

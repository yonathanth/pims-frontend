import React from 'react';

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  className = '',
}) => {
  // Don't show badge if count is 0
  if (count === 0) {
    return null;
  }

  // Format count for display
  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <div
      className={`absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 ${className}`}
      style={{
        fontSize: '10px',
        lineHeight: '1',
        zIndex: 10,
      }}
      aria-label={`${count} unread notifications`}
    >
      {displayCount}
    </div>
  );
};

export default NotificationBadge;

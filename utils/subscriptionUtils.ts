export const addMonthsToDate = (dateString: string, months: number): string => {
  const date = new Date(dateString);
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();
  const currentDay = date.getDate();
  
  // Calculate new month and year
  const newMonth = (currentMonth + months) % 12;
  const yearIncrement = Math.floor((currentMonth + months) / 12);
  const newYear = currentYear + yearIncrement;
  
  // Handle month-end dates (e.g., Jan 31 → Feb 28/29)
  const lastDayOfNewMonth = new Date(newYear, newMonth + 1, 0).getDate();
  const newDay = Math.min(currentDay, lastDayOfNewMonth);
  
  const newDate = new Date(newYear, newMonth, newDay);
  return newDate.toISOString().split('T')[0];
};

export const getDaysUntilDue = (dueDateString: string): number => {
  const today = new Date();
  const dueDate = new Date(dueDateString);
  
  // Reset time to compare dates only
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isOverdue = (dueDateString: string): boolean => {
  return getDaysUntilDue(dueDateString) < 0;
};

export const formatDaysUntilDue = (dueDateString: string): string => {
  const days = getDaysUntilDue(dueDateString);
  
  if (days < 0) {
    return `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue`;
  } else if (days === 0) {
    return 'Due today';
  } else {
    return `${days} day${days !== 1 ? 's' : ''} until due`;
  }
};

export const getStatusColor = (dueDateString: string, colors: any) => {
  const days = getDaysUntilDue(dueDateString);
  
  if (days < 0) return colors.error; // Overdue
  if (days === 0) return colors.warning; // Due today
  if (days <= 3) return colors.warning; // Due soon
  return colors.success; // On time
};

export const sortSubscriptions = (
  subscriptions: any[], 
  sortBy: 'dueDate' | 'amount' | 'name'
) => {
  return [...subscriptions].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
      case 'amount':
        return b.amount - a.amount;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
};
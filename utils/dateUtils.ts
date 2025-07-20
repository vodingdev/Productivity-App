/**
 * Date utilities for smart task management
 */

export const dateUtils = {
  /**
   * Get today's date in YYYY-MM-DD format
   */
  getToday(): string {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * Get tomorrow's date in YYYY-MM-DD format
   */
  getTomorrow(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  },

  /**
   * Get yesterday's date in YYYY-MM-DD format
   */
  getYesterday(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  },

  /**
   * Check if a date is in the past (before today)
   */
  isPastDate(dateString: string): boolean {
    return dateString < this.getToday();
  },

  /**
   * Check if a date is today
   */
  isToday(dateString: string): boolean {
    return dateString === this.getToday();
  },

  /**
   * Check if a date is tomorrow
   */
  isTomorrow(dateString: string): boolean {
    return dateString === this.getTomorrow();
  },

  /**
   * Get the number of days between two dates
   */
  getDaysDifference(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = d2.getTime() - d1.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  /**
   * Format date for display
   */
  formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    const today = this.getToday();
    const tomorrow = this.getTomorrow();
    const yesterday = this.getYesterday();

    if (dateString === today) return 'Today';
    if (dateString === tomorrow) return 'Tomorrow';
    if (dateString === yesterday) return 'Yesterday';

    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  },

  /**
   * Check if we need to show the midnight modal
   */
  shouldShowMidnightModal(lastCheckDate: string | null): boolean {
    if (!lastCheckDate) return true;
    return lastCheckDate < this.getToday();
  },

  /**
   * Auto-update task zones based on current date
   */
  updateTaskZones(tasks: any[]): any[] {
    const today = this.getToday();
    const tomorrow = this.getTomorrow();

    return tasks.map(task => {
      // Skip completed tasks and bank tasks
      if (task.completed || task.zone === 'bank') {
        return task;
      }

      // Update zones based on current date
      if (task.date === today && task.zone !== 'today') {
        return { ...task, zone: 'today' };
      }
      
      if (task.date === tomorrow && task.zone !== 'tomorrow') {
        return { ...task, zone: 'tomorrow' };
      }

      // Mark overdue tasks
      if (this.isPastDate(task.date) && task.zone !== 'overdue') {
        return { ...task, zone: 'overdue' };
      }

      return task;
    });
  }
};
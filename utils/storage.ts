import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: string;
  title: string;
  note?: string;
  date: string;
  zone: 'bank' | 'today' | 'tomorrow' | 'overdue';
  completed: boolean;
  createdAt: string;
  lastMidnightCheck?: string;
  tags?: string[];
}

export interface FinanceEntry {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  createdAt: string;
  tags?: string[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  date: string;
  createdAt: string;
  tags?: string[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface FocusItem {
  id: string;
  title: string;
  description?: string;
  period: 'today' | 'tomorrow' | 'this-week' | 'this-month' | 'this-quarter' | 'this-year' | 'custom';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  initialDueDate: string;
  nextDueDate: string;
  isActive: boolean;
  notes?: string;
  paymentHistory: PaymentRecord[];
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface PaymentRecord {
  id: string;
  paidDate: string;
  amount: number;
  wasOverdue: boolean;
}

const STORAGE_KEYS = {
  TASKS: 'productivity_tasks',
  FINANCE: 'productivity_finance',
  INVENTORY: 'productivity_inventory',
  NOTES: 'productivity_notes',
  FOCUS: 'productivity_focus',
  CATEGORIES: 'productivity_categories',
  SUBSCRIPTIONS: 'productivity_subscriptions',
  LAST_MIDNIGHT_CHECK: 'productivity_last_midnight_check',
  TAGS: 'productivity_tags',
};

export const storage = {
  // Tasks
  async getTasks(): Promise<Task[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  },

  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  },

  // Finance
  async getFinanceEntries(): Promise<FinanceEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FINANCE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading finance entries:', error);
      return [];
    }
  },

  async saveFinanceEntries(entries: FinanceEntry[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FINANCE, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving finance entries:', error);
    }
  },

  // Inventory
  async getInventoryItems(): Promise<InventoryItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.INVENTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading inventory items:', error);
      return [];
    }
  },

  async saveInventoryItems(items: InventoryItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving inventory items:', error);
    }
  },

  // Notes
  async getNotes(): Promise<Note[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading notes:', error);
      return [];
    }
  },

  async saveNotes(notes: Note[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  },

  // Focus
  async getFocusItems(): Promise<FocusItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FOCUS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading focus items:', error);
      return [];
    }
  },

  async saveFocusItems(items: FocusItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FOCUS, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving focus items:', error);
    }
  },

  // Categories
  async getCategories(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading categories:', error);
      return [];
    }
  },

  async saveCategories(categories: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  },

  // Tags
  async getTags(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TAGS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading tags:', error);
      return [];
    }
  },

  async saveTags(tags: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
    } catch (error) {
      console.error('Error saving tags:', error);
    }
  },

  // Subscriptions
  async getSubscriptions(): Promise<Subscription[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      return [];
    }
  },

  async saveSubscriptions(subscriptions: Subscription[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
    } catch (error) {
      console.error('Error saving subscriptions:', error);
    }
  },

  // Midnight check tracking
  async getLastMidnightCheck(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_MIDNIGHT_CHECK);
    } catch (error) {
      console.error('Error loading last midnight check:', error);
      return null;
    }
  },

  async saveLastMidnightCheck(date: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_MIDNIGHT_CHECK, date);
    } catch (error) {
      console.error('Error saving last midnight check:', error);
    }
  },
};
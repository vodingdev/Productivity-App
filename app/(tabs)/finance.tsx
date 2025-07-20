import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, Typography, Spacing } from '@/constants/Colors';
import { FinanceEntry, Subscription, PaymentRecord, storage } from '@/utils/storage';
import { FinanceCard } from '@/components/FinanceCard';
import { FinanceModal } from '@/components/modals/FinanceModal';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { SubscriptionModal } from '@/components/modals/SubscriptionModal';
import { DatePicker } from '@/components/DatePicker';
import { addMonthsToDate, isOverdue, sortSubscriptions } from '@/utils/subscriptionUtils';
import { Plus, TrendingUp, TrendingDown, DollarSign, CreditCard, Filter, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';

export default function FinanceScreen() {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinanceEntry | undefined>();
  const [editingSubscription, setEditingSubscription] = useState<Subscription | undefined>();
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'entries' | 'subscriptions'>('entries');
  const [showInactive, setShowInactive] = useState(false);
  const [sortBy, setSortBy] = useState<'dueDate' | 'amount' | 'name'>('dueDate');
  const [tags, setTags] = useState<string[]>([]);
  const [scrollY] = useState(new Animated.Value(0));
  const [isScrolled, setIsScrolled] = useState(false);

  const loadEntries = async () => {
    const [loadedEntries, loadedTags] = await Promise.all([
      storage.getFinanceEntries(),
      storage.getTags()
    ]);
    setEntries(loadedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setTags(loadedTags);
  };

  const loadSubscriptions = async () => {
    const loadedSubscriptions = await storage.getSubscriptions();
    setSubscriptions(loadedSubscriptions);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadEntries();
      loadSubscriptions();
    }, [])
  );

  const handleSaveEntry = async (entryData: Omit<FinanceEntry, 'id' | 'createdAt'>) => {
    let updatedEntries: FinanceEntry[];
    
    if (editingEntry) {
      updatedEntries = entries.map(entry =>
        entry.id === editingEntry.id
          ? { ...entry, ...entryData }
          : entry
      );
    } else {
      const newEntry: FinanceEntry = {
        id: Date.now().toString(),
        ...entryData,
        createdAt: new Date().toISOString(),
      };
      updatedEntries = [...entries, newEntry];
    }
    
    setEntries(updatedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    await storage.saveFinanceEntries(updatedEntries);
    setEditingEntry(undefined);
  };

  const handleDeleteEntry = async (entryId: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== entryId);
    setEntries(updatedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    await storage.saveFinanceEntries(updatedEntries);
  };

  const handleSaveSubscription = async (subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    let updatedSubscriptions: Subscription[];
    const now = new Date().toISOString();
    
    if (editingSubscription) {
      updatedSubscriptions = subscriptions.map(sub =>
        sub.id === editingSubscription.id
          ? { ...sub, ...subscriptionData, updatedAt: now }
          : sub
      );
    } else {
      const newSubscription: Subscription = {
        id: Date.now().toString(),
        ...subscriptionData,
        createdAt: now,
        updatedAt: now,
      };
      updatedSubscriptions = [...subscriptions, newSubscription];
    }
    
    setSubscriptions(updatedSubscriptions);
    await storage.saveSubscriptions(updatedSubscriptions);
    setEditingSubscription(undefined);
  };

  const handleDeleteSubscription = async (subscriptionId: string) => {
    const updatedSubscriptions = subscriptions.filter(sub => sub.id !== subscriptionId);
    setSubscriptions(updatedSubscriptions);
    await storage.saveSubscriptions(updatedSubscriptions);
  };

  const handleAddTag = async (newTag: string) => {
    if (!tags.includes(newTag)) {
      const updatedTags = [...tags, newTag];
      setTags(updatedTags);
      await storage.saveTags(updatedTags);
    }
  };
  const handleMarkPaid = async (subscriptionId: string) => {
    const subscription = subscriptions.find(sub => sub.id === subscriptionId);
    if (!subscription) return;

    const paymentRecord: PaymentRecord = {
      id: Date.now().toString(),
      paidDate: new Date().toISOString().split('T')[0],
      amount: subscription.amount,
      wasOverdue: isOverdue(subscription.nextDueDate),
    };

    const nextDueDate = addMonthsToDate(subscription.nextDueDate, 1);

    const updatedSubscriptions = subscriptions.map(sub =>
      sub.id === subscriptionId
        ? {
            ...sub,
            nextDueDate,
            paymentHistory: [...sub.paymentHistory, paymentRecord],
            updatedAt: new Date().toISOString(),
          }
        : sub
    );

    // Create corresponding finance entry
    const financeEntry: FinanceEntry = {
      id: `sub_${Date.now()}`,
      title: `${subscription.name} Subscription`,
      amount: subscription.amount,
      type: 'expense',
      date: paymentRecord.paidDate,
      createdAt: new Date().toISOString(),
    };

    // Update both subscriptions and finance entries
    const updatedEntries = [...entries, financeEntry].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setSubscriptions(updatedSubscriptions);
    setEntries(updatedEntries);
    
    await storage.saveSubscriptions(updatedSubscriptions);
    await storage.saveFinanceEntries(updatedEntries);
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setIsScrolled(offsetY > 50);
      }
    }
  );

  const getFilteredEntries = () => {
    if (!filterDate) return entries;
    const filterDateStr = filterDate.toISOString().split('T')[0];
    return entries.filter(entry => entry.date === filterDateStr);
  };

  const getFilteredSubscriptions = () => {
    let filtered = showInactive 
      ? subscriptions.filter(sub => !sub.isActive)
      : subscriptions.filter(sub => sub.isActive);
    
    return sortSubscriptions(filtered, sortBy);
  };

  const getBalance = () => {
    const filteredEntries = getFilteredEntries();
    return filteredEntries.reduce((sum, entry) => {
      return sum + (entry.type === 'income' ? entry.amount : -entry.amount);
    }, 0);
  };

  const getTotalSubscriptionCost = () => {
    return subscriptions
      .filter(sub => sub.isActive)
      .reduce((sum, sub) => sum + sub.amount, 0);
  };

  const getSubscriptionExpensesThisMonth = () => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    return entries
      .filter(entry => 
        entry.type === 'expense' && 
        entry.title.includes('Subscription') &&
        entry.date.startsWith(currentMonth)
      )
      .reduce((sum, entry) => sum + entry.amount, 0);
  };
  const getOverdueSubscriptions = () => {
    return subscriptions.filter(sub => sub.isActive && isOverdue(sub.nextDueDate));
  };

  const getTotalIncome = () => {
    const filteredEntries = getFilteredEntries();
    return filteredEntries
      .filter(entry => entry.type === 'income')
      .reduce((sum, entry) => sum + entry.amount, 0);
  };

  const getTotalExpenses = () => {
    const filteredEntries = getFilteredEntries();
    return filteredEntries
      .filter(entry => entry.type === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0);
  };

  const balance = getBalance();
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const totalSubscriptions = getTotalSubscriptionCost();
  const subscriptionExpensesThisMonth = getSubscriptionExpensesThisMonth();
  const overdueCount = getOverdueSubscriptions().length;
  const filteredEntries = getFilteredEntries();
  const filteredSubscriptions = getFilteredSubscriptions();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    headerContainer: {
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    header: {
      backgroundColor: colors.background,
      paddingTop: Platform.OS === 'web' ? 20 : 60,
      paddingHorizontal: 24,
      paddingBottom: 20,
    },
    headerCompact: {
      paddingTop: Platform.OS === 'web' ? 16 : 40,
      paddingBottom: 12,
    },
    headerTitle: {
      fontSize: Typography['4xl'],
      fontFamily: Typography.family.display,
      fontWeight: Typography.weight.bold,
      color: colors.text,
      marginBottom: Spacing.lg,
      letterSpacing: -1.5,
    },
    headerTitleCompact: {
      fontSize: Typography['2xl'],
      marginBottom: Spacing.sm,
    },
    balanceContainer: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 16,
      padding: 20,
    },
    balanceContainerCompact: {
      padding: 12,
      borderRadius: 12,
    },
    balanceLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    balanceLabelCompact: {
      fontSize: 12,
      marginBottom: 2,
    },
    balanceAmount: {
      fontSize: 32,
      fontWeight: '700',
      color: balance >= 0 ? colors.success : colors.error,
    },
    balanceAmountCompact: {
      fontSize: 24,
    },
    statsContainer: {
      flexDirection: 'row',
      marginTop: 20,
      gap: 16,
    },
    statsContainerCompact: {
      marginTop: 12,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    statCardCompact: {
      padding: 10,
      borderRadius: 8,
    },
    statIcon: {
      marginBottom: 4,
    },
    statIconCompact: {
      marginBottom: 2,
    },
    statAmount: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
    },
    statAmountCompact: {
      fontSize: 14,
      marginBottom: 1,
    },
    incomeAmount: {
      color: colors.success,
    },
    expenseAmount: {
      color: colors.error,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textMuted,
    },
    statLabelCompact: {
      fontSize: 10,
    },
    filterContainer: {
      backgroundColor: colors.background,
      padding: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    filterContainerCompact: {
      padding: 16,
    },
    filterHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    filterHeaderCompact: {
      marginBottom: 12,
    },
    filterTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    filterTitleCompact: {
      fontSize: 14,
    },
    clearFilter: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '500',
    },
    clearFilterCompact: {
      fontSize: 12,
    },
    content: {
      flex: 1,
    },
    stickyHeader: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      paddingHorizontal: 24,
      paddingVertical: 20,
    },
    contentHeader: {
      marginBottom: 0,
    },
    contentTitle: {
      fontSize: Typography['2xl'],
      fontFamily: 'Inter-Bold',
      fontWeight: Typography.weight.bold,
      color: colors.text,
      marginBottom: 4,
    },
    contentSubtitle: {
      fontSize: Typography.base,
      color: colors.textSecondary,
    },
    scrollContent: {
      padding: 24,
      paddingBottom: Platform.OS === 'android' ? insets.bottom + 72 + 24 : 108,
    },
    emptyState: {
      padding: 48,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: colors.textMuted,
      textAlign: 'center',
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tabContainerCompact: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    tab: {
      flex: 1,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
      marginHorizontal: 6,
    },
    tabCompact: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginHorizontal: 4,
    },
    activeTab: {
      backgroundColor: colors.primary,
    },
    inactiveTab: {
      backgroundColor: colors.surface,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
    },
    tabTextCompact: {
      fontSize: 12,
    },
    activeTabText: {
      color: colors.background,
    },
    inactiveTabText: {
      color: colors.textSecondary,
    },
    subscriptionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 20,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    subscriptionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    subscriptionControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    filterButton: {
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    subscriptionStats: {
      backgroundColor: colors.surface,
      padding: 20,
      marginHorizontal: 24,
      marginVertical: 16,
      borderRadius: 16,
    },
    subscriptionStatsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    subscriptionStatsLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    subscriptionStatsValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    overdueValue: {
      color: colors.error,
    },
    fab: {
      position: 'absolute',
      bottom: Platform.OS === 'android' ? Math.max(insets.bottom + 72 + 24, 108) : 108,
      right: 24,
      backgroundColor: colors.primary,
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    contentHeader: {
      marginBottom: 24,
    },
    contentTitle: {
      fontSize: Typography['2xl'],
      fontFamily: 'Inter-Bold',
      fontWeight: Typography.weight.bold,
      color: colors.text,
      marginBottom: 4,
    },
    contentSubtitle: {
      fontSize: Typography.base,
      color: colors.textSecondary,
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View style={styles.headerContainer}>
        <View style={[styles.header, isScrolled && styles.headerCompact]}>
          <Text style={[styles.headerTitle, isScrolled && styles.headerTitleCompact]}>Finance</Text>
          
          <View style={[styles.balanceContainer, isScrolled && styles.balanceContainerCompact]}>
            <Text style={[styles.balanceLabel, isScrolled && styles.balanceLabelCompact]}>
              {filterDate ? 'Filtered Balance' : 'Total Balance'}
            </Text>
            <Text style={[styles.balanceAmount, isScrolled && styles.balanceAmountCompact]}>
              ${balance.toFixed(2)}
            </Text>
            
            <View style={[styles.statsContainer, isScrolled && styles.statsContainerCompact]}>
              <View style={[styles.statCard, isScrolled && styles.statCardCompact]}>
                <View style={[styles.statIcon, isScrolled && styles.statIconCompact]}>
                  <TrendingUp size={isScrolled ? 16 : 20} color={colors.success} />
                </View>
                <Text style={[styles.statAmount, styles.incomeAmount, isScrolled && styles.statAmountCompact]}>
                  +${totalIncome.toFixed(2)}
                </Text>
                <Text style={[styles.statLabel, isScrolled && styles.statLabelCompact]}>Income</Text>
              </View>
              
              <View style={[styles.statCard, isScrolled && styles.statCardCompact]}>
                <View style={[styles.statIcon, isScrolled && styles.statIconCompact]}>
                  <TrendingDown size={isScrolled ? 16 : 20} color={colors.error} />
                </View>
                <Text style={[styles.statAmount, styles.expenseAmount, isScrolled && styles.statAmountCompact]}>
                  -${totalExpenses.toFixed(2)}
                </Text>
                <Text style={[styles.statLabel, isScrolled && styles.statLabelCompact]}>Expenses</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.tabContainer, isScrolled && styles.tabContainerCompact]}>
          <TouchableOpacity
            style={[styles.tab, isScrolled && styles.tabCompact, activeTab === 'entries' ? styles.activeTab : styles.inactiveTab]}
            onPress={() => setActiveTab('entries')}
          >
            <Text style={[styles.tabText, isScrolled && styles.tabTextCompact, activeTab === 'entries' ? styles.activeTabText : styles.inactiveTabText]}>
              Transactions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, isScrolled && styles.tabCompact, activeTab === 'subscriptions' ? styles.activeTab : styles.inactiveTab]}
            onPress={() => setActiveTab('subscriptions')}
          >
            <Text style={[styles.tabText, isScrolled && styles.tabTextCompact, activeTab === 'subscriptions' ? styles.activeTabText : styles.inactiveTabText]}>
              Subscriptions
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {activeTab === 'subscriptions' && (
        <>
          <View style={styles.subscriptionHeader}>
            <Text style={styles.subscriptionTitle}>
              {showInactive ? 'Inactive Subscriptions' : 'Active Subscriptions'}
            </Text>
            <View style={styles.subscriptionControls}>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowInactive(!showInactive)}
              >
                <Filter size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {!showInactive && (
            <View style={styles.subscriptionStats}>
              <View style={styles.subscriptionStatsRow}>
                <Text style={styles.subscriptionStatsLabel}>Monthly Total</Text>
                <Text style={styles.subscriptionStatsValue}>
                  ${totalSubscriptions.toFixed(2)}
                </Text>
              </View>
              <View style={styles.subscriptionStatsRow}>
                <Text style={styles.subscriptionStatsLabel}>Paid This Month</Text>
                <Text style={styles.subscriptionStatsValue}>
                  ${subscriptionExpensesThisMonth.toFixed(2)}
                </Text>
              </View>
              <View style={styles.subscriptionStatsRow}>
                <Text style={styles.subscriptionStatsLabel}>Active Subscriptions</Text>
                <Text style={styles.subscriptionStatsValue}>
                  {subscriptions.filter(sub => sub.isActive).length}
                </Text>
              </View>
              {overdueCount > 0 && (
                <View style={styles.subscriptionStatsRow}>
                  <Text style={styles.subscriptionStatsLabel}>Overdue</Text>
                  <Text style={[styles.subscriptionStatsValue, styles.overdueValue]}>
                    {overdueCount}
                  </Text>
                </View>
              )}
            </View>
          )}
        </>
      )}

      {activeTab === 'entries' && (
        <View style={[styles.filterContainer, isScrolled && styles.filterContainerCompact]}>
          <View style={[styles.filterHeader, isScrolled && styles.filterHeaderCompact]}>
            <Text style={[styles.filterTitle, isScrolled && styles.filterTitleCompact]}>Filter by Date</Text>
            {filterDate && (
              <TouchableOpacity onPress={() => setFilterDate(null)}>
                <Text style={[styles.clearFilter, isScrolled && styles.clearFilterCompact]}>Clear Filter</Text>
              </TouchableOpacity>
            )}
          </View>
          <DatePicker
            date={filterDate || new Date()}
            onDateChange={setFilterDate}
          />
        </View>
      )}

      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {activeTab === 'entries' && (
          <View style={styles.contentHeader}>
            <Text style={styles.contentTitle}>Transactions</Text>
            <Text style={styles.contentSubtitle}>
              {filterDate ? `Filtered for ${filterDate.toLocaleDateString()}` : 'All transactions'}
            </Text>
          </View>
        )}
        
        {activeTab === 'subscriptions' && (
          <View style={styles.contentHeader}>
            <Text style={styles.contentTitle}>
              {showInactive ? 'Inactive Subscriptions' : 'Active Subscriptions'}
            </Text>
            <Text style={styles.contentSubtitle}>
              {showInactive ? 'Paused or cancelled subscriptions' : 'Currently active subscriptions'}
            </Text>
          </View>
        )}

        {activeTab === 'entries' ? (
          filteredEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {filterDate ? 'No entries for selected date' : 'No finance entries yet'}
              </Text>
            </View>
          ) : (
            filteredEntries.map(entry => (
              <FinanceCard
                key={entry.id}
                entry={entry}
                onPress={() => {
                  setEditingEntry(entry);
                  setModalVisible(true);
                }}
              />
            ))
          )
        ) : (
          filteredSubscriptions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {showInactive ? 'No inactive subscriptions' : 'No active subscriptions yet'}
              </Text>
            </View>
          ) : (
            filteredSubscriptions.map(subscription => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onPress={() => {
                  setEditingSubscription(subscription);
                  setSubscriptionModalVisible(true);
                }}
                onMarkPaid={() => handleMarkPaid(subscription.id)}
              />
            ))
          )
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (activeTab === 'entries') {
            setEditingEntry(undefined);
            setModalVisible(true);
          } else {
            setEditingSubscription(undefined);
            setSubscriptionModalVisible(true);
          }
        }}
      >
        <Plus size={24} color={colors.background} />
      </TouchableOpacity>

      <FinanceModal
        visible={modalVisible}
        entry={editingEntry}
        availableTags={tags}
        onClose={() => {
          setModalVisible(false);
          setEditingEntry(undefined);
        }}
        onSave={handleSaveEntry}
        onAddTag={handleAddTag}
        onDelete={handleDeleteEntry}
      />

      <SubscriptionModal
        visible={subscriptionModalVisible}
        subscription={editingSubscription}
        availableTags={tags}
        onClose={() => {
          setSubscriptionModalVisible(false);
          setEditingSubscription(undefined);
        }}
        onSave={handleSaveSubscription}
        onAddTag={handleAddTag}
        onDelete={handleDeleteSubscription}
      />
    </View>
  );
}
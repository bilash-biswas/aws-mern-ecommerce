import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { updateUser, getUsers } from '../store/slices/adminSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import { showToast } from '../utils/toast';
import { User } from '../types/user';
import { theme } from '../theme/theme';

export default function UserManagementScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { users, loading, error } = useAppSelector((state) => state.admin);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      await dispatch(getUsers()).unwrap();
    } catch (error: any) {
      showToast('Failed to load users', 'error');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleAdminToggle = async (targetUser: User) => {
    if (targetUser._id === currentUser?._id) {
      showToast('You cannot modify your own admin privileges', 'warning');
      return;
    }

    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${
        targetUser.isAdmin ? 'remove' : 'grant'
      } admin privileges for ${targetUser.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await dispatch(
                updateUser({
                  _id: targetUser._id,
                  name: targetUser.name,
                  email: targetUser.email,
                  isAdmin: !targetUser.isAdmin,
                })
              ).unwrap();
              
              showToast(
                `Admin privileges ${
                  targetUser.isAdmin ? 'removed' : 'granted'
                } successfully`,
                'success'
              );
              loadUsers();
            } catch (error: any) {
              showToast(error || 'Failed to update user privileges', 'error');
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (loading && users.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primaryLight} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIconButton} onPress={handleBack} activeOpacity={0.7}>
            <Icon name="arrow-back-outline" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>User Management</Text>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={handleRefresh}
            disabled={refreshing}
            activeOpacity={0.7}
          >
            <Icon name="refresh-outline" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle-outline" size={18} color={theme.colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Users List Box */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>System Users</Text>
            <Text style={styles.cardSubtitle}>
              Total registered accounts: {users.length}
            </Text>
          </View>

          {users.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="people-outline" size={40} color={theme.colors.textMuted} />
              <Text style={styles.emptyTitle}>No Users Found</Text>
            </View>
          ) : (
            <View style={styles.usersList}>
              {users.map((user) => (
                <View key={user._id} style={styles.userCard}>
                  <View style={styles.userInfo}>
                    <View style={styles.userHeader}>
                      <Text style={styles.userName} numberOfLines={1}>
                        {user.name}
                        {user._id === currentUser?._id && (
                          <Text style={styles.youLabel}> (You)</Text>
                        )}
                      </Text>
                      <View style={[
                        styles.roleBadge,
                        user.isAdmin ? styles.adminBadge : styles.userBadge
                      ]}>
                        <Text style={[
                          styles.roleText,
                          { color: user.isAdmin ? theme.colors.primaryLight : theme.colors.secondary }
                        ]}>
                          {user.isAdmin ? 'Admin' : 'User'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <Text style={styles.userDate}>
                      Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </Text>
                  </View>
                  
                  {/* Actions Toggle */}
                  {user._id !== currentUser?._id && (
                    <View style={styles.userActions}>
                      <TouchableOpacity
                        style={[
                          styles.adminButton,
                          user.isAdmin ? styles.removeButton : styles.addButton
                        ]}
                        onPress={() => handleAdminToggle(user as User)}
                        activeOpacity={0.8}
                      >
                        <Icon 
                          name={user.isAdmin ? 'shield-outline' : 'shield-checkmark-outline'} 
                          size={14} 
                          color={theme.colors.white} 
                        />
                        <Text style={styles.adminButtonText}>
                          {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Aggregate Stats Card */}
        {users.length > 0 && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>User Statistics</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{users.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {users.filter(u => u.isAdmin).length}
                </Text>
                <Text style={styles.statLabel}>Admins</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {users.filter(u => !u.isAdmin).length}
                </Text>
                <Text style={styles.statLabel}>Standard</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIconButton: {
    padding: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 12,
    borderRadius: theme.roundness.sm,
    marginBottom: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.md,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  usersList: {
    gap: 12,
  },
  userCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.roundness.sm,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  userInfo: {
    marginBottom: 8,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  youLabel: {
    color: theme.colors.primaryLight,
    fontSize: 12,
  },
  userEmail: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  userDate: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  adminBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  userBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
  },
  userActions: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.roundness.sm,
    gap: 4,
    ...theme.shadows.soft,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
  },
  removeButton: {
    backgroundColor: theme.colors.danger,
  },
  adminButtonText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  statsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.md,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
// src/screens/Admin/Dashboard/index.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  RefreshControl, 
  Dimensions, 
  SafeAreaView, 
  TouchableOpacity, 
  Platform,
  StatusBar
} from 'react-native';
import { Text, ActivityIndicator, Divider, Surface, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as adminAPI from '../../../api/admin';
import { useAuth } from '../../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { useNavigation, DrawerActions } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const STATUSBAR_HEIGHT = StatusBar.currentHeight || 0;

// Custom Power Stat Card - Thể hiện quyền lực
const PowerStatCard = ({ title, value, icon, gradientColors, iconBackgroundColor }) => (
  <Surface style={styles.powerStatCard}>
    <View style={styles.powerStatContent}>
      <View style={[styles.powerStatIconContainer, { backgroundColor: iconBackgroundColor }]}>
        <MaterialCommunityIcons name={icon} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.powerStatInfo}>
        <Text style={styles.powerStatValue}>{value}</Text>
        <Text style={styles.powerStatTitle}>{title}</Text>
      </View>
    </View>
  </Surface>
);

// Graph Card Component
const GraphCard = ({ title, icon, children }) => (
  <Surface style={styles.graphCard}>
    <View style={styles.graphCardHeader}>
      <View style={styles.graphCardTitleContainer}>
        <MaterialCommunityIcons name={icon} size={20} color="#333" />
        <Text style={styles.graphCardTitle}>{title}</Text>
      </View>
      <TouchableOpacity style={styles.graphCardOptions}>
        <MaterialCommunityIcons name="dots-vertical" size={20} color="#777" />
      </TouchableOpacity>
    </View>
    <Divider style={styles.divider} />
    <View style={styles.graphCardContent}>
      {children}
    </View>
  </Surface>
);

// Progress Bar Component
const ProgressBar = ({ value, maxValue, color, label, count }) => {
  const percentage = (value / maxValue) * 100;
  return (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarHeader}>
        <Text style={styles.progressBarLabel}>{label}</Text>
        <Text style={styles.progressBarCount}>{count}</Text>
      </View>
      <View style={styles.progressBarBackground}>
        <LinearGradient
          colors={[color, color.replace('1)', '0.7)')]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBarFill, { width: `${percentage}%` }]}
        />
      </View>
    </View>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const navigation = useNavigation();
  const { userToken, userInfo } = useAuth();
  const [summaryData, setSummaryData] = useState(null);
  const [trendsData, setTrendsData] = useState([]);
  const [notificationsData, setNotificationsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [
        summaryResponse,
        trendsResponse,
        notificationsResponse
      ] = await Promise.all([
        adminAPI.getSystemSummary(userToken),
        adminAPI.getSystemTrends(userToken),
        adminAPI.getNotificationStats(userToken)
      ]);
      
      setSummaryData(summaryResponse);
      setTrendsData(trendsResponse);
      setNotificationsData(notificationsResponse);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Tính tổng số user từ user_counts
  const getTotalUsers = () => {
    if (!summaryData || !summaryData.user_counts) return 0;
    return summaryData.user_counts.reduce((total, item) => total + item.count, 0);
  };

  // Lấy số lượng người dùng theo vai trò
  const getUserCountByRole = (roleName) => {
    if (!summaryData || !summaryData.user_counts) return 0;
    const roleData = summaryData.user_counts.find(item => item.active_role__name === roleName);
    return roleData ? roleData.count : 0;
  };

  // Tính tỷ lệ đọc thông báo
  const getNotificationReadRate = () => {
    if (!notificationsData || notificationsData.total_notifications === 0) return 0;
    return ((notificationsData.read_notifications / notificationsData.total_notifications) * 100).toFixed(1);
  };

  // Generate and share PDF report
  const generateAndSharePDF = async () => {
    try {
      setIsGenerating(true);
      
      // Create HTML content
      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica'; padding: 20px; }
              h1 { color: #1E3A8A; font-size: 24px; }
              h2 { color: #2563EB; font-size: 18px; margin-top: 20px; }
              .stats-container { display: flex; flex-wrap: wrap; margin: 15px 0; }
              .stat-item { width: 50%; padding: 10px; box-sizing: border-box; }
              .stat-value { font-size: 24px; font-weight: bold; color: #1E3A8A; }
              .stat-label { font-size: 14px; color: #64748B; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th { background-color: #E2E8F0; padding: 10px; text-align: left; }
              td { padding: 10px; border-bottom: 1px solid #E2E8F0; }
              .footer { margin-top: 30px; font-size: 12px; color: #64748B; text-align: center; }
            </style>
          </head>
          <body>
            <h1>Admin Dashboard Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
            
            <h2>System Overview</h2>
            <div class="stats-container">
              <div class="stat-item">
                <div class="stat-value">${getTotalUsers()}</div>
                <div class="stat-label">Total Users</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${summaryData?.total_jobs || 0}</div>
                <div class="stat-label">Total Jobs</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${summaryData?.total_applications || 0}</div>
                <div class="stat-label">Total Applications</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${getUserCountByRole("Recruiter")}</div>
                <div class="stat-label">Active Recruiters</div>
              </div>
            </div>
            
            <h2>User Role Distribution</h2>
            <table>
              <tr>
                <th>Role</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
              ${summaryData?.user_counts?.map(role => {
                const roleName = role.active_role__name || 'Unverified';
                const percentage = ((role.count / getTotalUsers()) * 100).toFixed(1);
                return `
                  <tr>
                    <td>${roleName}</td>
                    <td>${role.count}</td>
                    <td>${percentage}%</td>
                  </tr>
                `;
              }).join('')}
            </table>
            
            <h2>Notification Statistics</h2>
            <table>
              <tr>
                <th>Type</th>
                <th>Count</th>
              </tr>
              <tr>
                <td>Total Notifications</td>
                <td>${notificationsData?.total_notifications || 0}</td>
              </tr>
              <tr>
                <td>Read Notifications</td>
                <td>${notificationsData?.read_notifications || 0}</td>
              </tr>
              <tr>
                <td>Unread Notifications</td>
                <td>${notificationsData?.unread_notifications || 0}</td>
              </tr>
            </table>
            
            <h2>Notification Types</h2>
            <table>
              <tr>
                <th>Type</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
              ${notificationsData?.counts_by_type?.map(type => {
                const typeName = type.notification_type === 'general' ? 'General' : 'Job Related';
                const percentage = ((type.count / notificationsData.total_notifications) * 100).toFixed(1);
                return `
                  <tr>
                    <td>${typeName}</td>
                    <td>${type.count}</td>
                    <td>${percentage}%</td>
                  </tr>
                `;
              }).join('')}
            </table>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Recruitment System Admin Dashboard</p>
            </div>
          </body>
        </html>
      `;
      
      try {
        // Create PDF file
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        
        // Create filename with timestamp
        const timestamp = new Date().getTime();
        const newFileUri = FileSystem.documentDirectory + `admin_report_${timestamp}.pdf`;
        
        // Move file to document directory
        await FileSystem.moveAsync({
          from: uri,
          to: newFileUri
        });
        
        // Share file using native Share API instead of expo-sharing
        await Share.share({
          url: newFileUri,
          title: 'Admin Dashboard Report',
          message: 'Here is your Admin Dashboard Report',
        });
      } catch (error) {
        console.error('Error sharing PDF:', error);
        alert('There was an error generating or sharing the report. Please try again.');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('There was an error generating the report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#F1F5F9" barStyle="dark-content" />
      
      {/* Custom Header with Drawer Button */}
      <View style={styles.customHeader}>
        <TouchableOpacity 
          style={styles.drawerButton}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <MaterialCommunityIcons name="menu" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        
        <TouchableOpacity style={styles.headerRightButton}>
          <MaterialCommunityIcons name="bell-outline" size={24} color="#1E3A8A" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1E3A8A']} />
        }
      >
        <View style={styles.dashboardHeader}>
          <View style={styles.userInfoSection}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.usernameText}>{userInfo?.username || 'Admin'}</Text>
            </View>
            {userInfo?.avatar_url ? (
              <Avatar.Image 
                source={{ uri: userInfo.avatar_url }} 
                size={50}
                style={styles.avatar}
              />
            ) : (
              <Avatar.Text 
                label={(userInfo?.username?.substring(0, 2) || 'A').toUpperCase()} 
                size={50}
                style={styles.avatar}
                color="#fff"
                backgroundColor="#1E3A8A"
              />
            )}
          </View>
          
          <View style={styles.statsOverview}>
            <View style={styles.statOverviewItem}>
              <Text style={styles.statOverviewValue}>{getTotalUsers()}</Text>
              <Text style={styles.statOverviewLabel}>Users</Text>
            </View>
            <View style={styles.statOverviewDivider} />
            <View style={styles.statOverviewItem}>
              <Text style={styles.statOverviewValue}>{summaryData?.total_jobs || 0}</Text>
              <Text style={styles.statOverviewLabel}>Jobs</Text>
            </View>
            <View style={styles.statOverviewDivider} />
            <View style={styles.statOverviewItem}>
              <Text style={styles.statOverviewValue}>{notificationsData?.unread_notifications || 0}</Text>
              <Text style={styles.statOverviewLabel}>Alerts</Text>
            </View>
          </View>
        </View>
        
        {/* Power Stats Grid */}
        <View style={styles.powerStatsContainer}>
          <PowerStatCard 
            title="Pending Approvals"
            value={getUserCountByRole(null) || 0}
            icon="account-clock"
            gradientColors={['#2563EB', '#1E40AF']}
            iconBackgroundColor="rgba(37, 99, 235, 0.8)"
          />
          <PowerStatCard 
            title="System Notifications"
            value={notificationsData?.total_notifications || 0}
            icon="bell-ring"
            gradientColors={['#F59E0B', '#D97706']}
            iconBackgroundColor="rgba(245, 158, 11, 0.8)"
          />
        </View>
        
        <View style={styles.powerStatsContainer}>
          <PowerStatCard 
            title="Job Applications"
            value={summaryData?.total_applications || 0}
            icon="file-document-multiple"
            gradientColors={['#10B981', '#059669']}
            iconBackgroundColor="rgba(16, 185, 129, 0.8)"
          />
          <PowerStatCard 
            title="Active Recruiters"
            value={getUserCountByRole("Recruiter")}
            icon="domain"
            gradientColors={['#EC4899', '#DB2777']}
            iconBackgroundColor="rgba(236, 72, 153, 0.8)"
          />
        </View>
        
        {/* User Distribution Graph */}
        <GraphCard title="User Role Distribution" icon="chart-pie">
          <View style={styles.chartContainer}>
            {summaryData?.user_counts?.map((role, index) => {
              const roleName = role.active_role__name || 'Unverified';
              return (
                <ProgressBar 
                  key={index}
                  value={role.count}
                  maxValue={getTotalUsers()}
                  color={getRoleColor(roleName)}
                  label={roleName}
                  count={role.count}
                />
              );
            })}
          </View>
        </GraphCard>
        
        {/* Monthly Trends Graph */}
        <GraphCard title="Monthly Job Postings" icon="trending-up">
          <View style={styles.trendsContainer}>
            {trendsData?.map((trend, index) => {
              const month = new Date(trend.month).toLocaleDateString('vi-VN', {
                month: 'short',
                year: 'numeric'
              });
              // Giả định 10 là giá trị tối đa để tính toán phần trăm
              const maxValue = 10;
              
              return (
                <View key={index} style={styles.trendBarContainer}>
                  <View style={styles.trendBarWrapper}>
                    <LinearGradient
                      colors={['#2563EB', '#1E40AF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={[
                        styles.trendBar, 
                        { height: `${Math.min((trend.count / maxValue) * 100, 100)}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.trendBarLabel}>{month}</Text>
                  <Text style={styles.trendBarValue}>{trend.count}</Text>
                </View>
              );
            })}
          </View>
        </GraphCard>
        
        {/* Notification Statistics */}
        <GraphCard title="Notification Analytics" icon="bell-outline">
          <View style={styles.notificationStatRow}>
            <View style={styles.notificationStat}>
              <View style={[styles.notificationStatIcon, { backgroundColor: 'rgba(37, 99, 235, 0.9)' }]}>
                <MaterialCommunityIcons name="bell" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.notificationStatValue}>{notificationsData?.total_notifications || 0}</Text>
                <Text style={styles.notificationStatLabel}>Total</Text>
              </View>
            </View>
            
            <View style={styles.notificationStat}>
              <View style={[styles.notificationStatIcon, { backgroundColor: 'rgba(236, 72, 153, 0.9)' }]}>
                <MaterialCommunityIcons name="bell-off" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.notificationStatValue}>{notificationsData?.unread_notifications || 0}</Text>
                <Text style={styles.notificationStatLabel}>Unread</Text>
              </View>
            </View>
            
            <View style={styles.notificationStat}>
              <View style={[styles.notificationStatIcon, { backgroundColor: 'rgba(16, 185, 129, 0.9)' }]}>
                <MaterialCommunityIcons name="bell-check" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.notificationStatValue}>{notificationsData?.read_notifications || 0}</Text>
                <Text style={styles.notificationStatLabel}>Read</Text>
              </View>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Notification Types</Text>
          <View style={styles.notificationTypeContainer}>
            {notificationsData?.counts_by_type?.map((type, index) => {
              const typeName = type.notification_type === 'general' ? 'General' : 'Job Related';
              const typeIcon = type.notification_type === 'general' ? 'bell-ring' : 'briefcase';
              const typeColor = type.notification_type === 'general' ? 'rgba(245, 158, 11, 0.9)' : 'rgba(37, 99, 235, 0.9)';
              const percentage = (type.count / notificationsData.total_notifications) * 100;
              
              return (
                <View key={index} style={styles.notificationTypeItem}>
                  <View style={styles.notificationTypeHeader}>
                    <View style={styles.notificationTypeIconContainer}>
                      <View style={[styles.notificationTypeIcon, { backgroundColor: typeColor }]}>
                        <MaterialCommunityIcons name={typeIcon} size={16} color="#fff" />
                      </View>
                      <Text style={styles.notificationTypeName}>{typeName}</Text>
                    </View>
                    <Text style={styles.notificationTypeCount}>{type.count}</Text>
                  </View>
                  <View style={styles.notificationTypeBarContainer}>
                    <LinearGradient
                      colors={typeColor === 'rgba(245, 158, 11, 0.9)' ? ['#F59E0B', '#D97706'] : ['#2563EB', '#1E40AF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.notificationTypeBar, { width: `${percentage}%` }]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </GraphCard>
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryActionButton]}
            onPress={generateAndSharePDF}
            disabled={isGenerating}
          >
            <LinearGradient
              colors={['#2563EB', '#1E40AF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButtonGradient}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color="#fff" style={styles.buttonIcon} />
              ) : (
                <MaterialCommunityIcons name="file-pdf-box" size={20} color="#fff" style={styles.buttonIcon} />
              )}
              <Text style={styles.actionButtonText}>
                {isGenerating ? 'Generating...' : 'Download PDF Report'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryActionButton]}
          >
            <View style={styles.secondaryActionButtonContent}>
              <MaterialCommunityIcons name="chart-bar" size={20} color="#1E3A8A" style={styles.buttonIcon} />
              <Text style={styles.secondaryActionButtonText}>Custom Report</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Màu cho từng vai trò
const getRoleColor = (roleName) => {
  switch (roleName) {
    case 'Admin':
      return 'rgba(220, 38, 38, 0.9)'; // Red
    case 'Recruiter':
      return 'rgba(16, 185, 129, 0.9)'; // Green
    case 'JobSeeker':
      return 'rgba(37, 99, 235, 0.9)'; // Blue
    default:
      return 'rgba(156, 163, 175, 0.9)'; // Gray
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingTop: Platform.OS === 'android' ? STATUSBAR_HEIGHT : 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
  },
  drawerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  headerRightButton: {
    padding: 8,
  },
  dashboardHeader: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  userInfoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748B',
  },
  usernameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  avatar: {
    backgroundColor: '#1E3A8A',
  },
  statsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 15,
    padding: 15,
  },
  statOverviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  statOverviewDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  statOverviewValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  statOverviewLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  powerStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  powerStatCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    backgroundColor: '#fff',
  },
  powerStatContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  powerStatIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  powerStatInfo: {
    flex: 1,
  },
  powerStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  powerStatTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  graphCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  graphCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  graphCardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  graphCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  graphCardOptions: {
    padding: 4,
  },
  divider: {
    backgroundColor: '#E5E7EB',
    height: 1,
    marginBottom: 16,
  },
  graphCardContent: {
    paddingTop: 8,
  },
  chartContainer: {
    marginTop: 8,
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressBarLabel: {
    fontSize: 14,
    color: '#333',
  },
  progressBarCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 10,
    borderRadius: 5,
  },
  trendsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    paddingTop: 20,
  },
  trendBarContainer: {
    flex: 1,
    alignItems: 'center',
  },
  trendBarWrapper: {
    width: 18,
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  trendBar: {
    width: 18,
    borderRadius: 9,
  },
  trendBarLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  trendBarValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  notificationStat: {
    alignItems: 'center',
  },
  notificationStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  notificationStatLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  notificationTypeContainer: {
    marginTop: 8,
  },
  notificationTypeItem: {
    marginBottom: 16,
  },
  notificationTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTypeIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTypeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  notificationTypeName: {
    fontSize: 14,
    color: '#333',
  },
  notificationTypeCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationTypeBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  notificationTypeBar: {
    height: 8,
    borderRadius: 4,
  },
  actionButtonsContainer: {
    paddingHorizontal: 16,
    marginBottom: 30,
    marginTop: 10,
  },
  actionButton: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  primaryActionButton: {
    elevation: 2,
  },
  secondaryActionButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  secondaryActionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  buttonIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  secondaryActionButtonText: {
    color: '#1E3A8A',
    fontWeight: 'bold',
  },
});

export default Dashboard;
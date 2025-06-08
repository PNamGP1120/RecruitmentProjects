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

// Thẻ thống kê chính
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

// Thẻ biểu đồ
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

// Thanh tiến trình
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

// Màn hình Tổng quan
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
      console.error('Lỗi khi tải dữ liệu tổng quan:', error);
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

  // Tính tổng số người dùng từ user_counts
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

  // Tạo và tải xuống báo cáo PDF
  const downloadPDFReport = async () => {
    try {
      setIsGenerating(true);
      
      // Tạo nội dung HTML
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
            <h1>Báo Cáo Tổng Quan Quản Trị</h1>
            <p>Ngày tạo: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}</p>
            
            <h2>Tổng Quan Hệ Thống</h2>
            <div class="stats-container">
              <div class="stat-item">
                <div class="stat-value">${getTotalUsers()}</div>
                <div class="stat-label">Tổng Người Dùng</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${summaryData?.total_jobs || 0}</div>
                <div class="stat-label">Tổng Việc Làm</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${summaryData?.total_applications || 0}</div>
                <div class="stat-label">Tổng Đơn Ứng Tuyển</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${getUserCountByRole("Recruiter")}</div>
                <div class="stat-label">Nhà Tuyển Dụng</div>
              </div>
            </div>
            
            <h2>Phân Bố Vai Trò Người Dùng</h2>
            <table>
              <tr>
                <th>Vai Trò</th>
                <th>Số Lượng</th>
                <th>Tỷ Lệ</th>
              </tr>
              ${summaryData?.user_counts?.map(role => {
                const roleName = role.active_role__name || 'Chưa xác thực';
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
            
            <h2>Thống Kê Thông Báo</h2>
            <table>
              <tr>
                <th>Loại</th>
                <th>Số Lượng</th>
              </tr>
              <tr>
                <td>Tổng Thông Báo</td>
                <td>${notificationsData?.total_notifications || 0}</td>
              </tr>
              <tr>
                <td>Đã Đọc</td>
                <td>${notificationsData?.read_notifications || 0}</td>
              </tr>
              <tr>
                <td>Chưa Đọc</td>
                <td>${notificationsData?.unread_notifications || 0}</td>
              </tr>
            </table>
            
            <h2>Loại Thông Báo</h2>
            <table>
              <tr>
                <th>Loại</th>
                <th>Số Lượng</th>
                <th>Tỷ Lệ</th>
              </tr>
              ${notificationsData?.counts_by_type?.map(type => {
                const typeName = type.notification_type === 'general' ? 'Thông Báo Chung' : 'Thông Báo Việc Làm';
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
              <p>© ${new Date().getFullYear()} Hệ Thống Quản Trị Tuyển Dụng</p>
            </div>
          </body>
        </html>
      `;
      
      try {
        // Tạo file PDF
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        
        // Tạo tên file với timestamp
        const timestamp = new Date().getTime();
        const newFileUri = FileSystem.documentDirectory + `bao_cao_quan_tri_${timestamp}.pdf`;
        
        // Di chuyển file vào thư mục tài liệu
        await FileSystem.moveAsync({
          from: uri,
          to: newFileUri
        });
        
        // Chia sẻ file
        await Sharing.shareAsync(newFileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Chia sẻ báo cáo quản trị',
        });
      } catch (error) {
        console.error('Lỗi khi chia sẻ PDF:', error);
        alert('Đã xảy ra lỗi khi tạo hoặc chia sẻ báo cáo. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Lỗi khi tạo báo cáo:', error);
      alert('Đã xảy ra lỗi khi tạo báo cáo. Vui lòng thử lại.');
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
      
      {/* Thanh tiêu đề với nút Drawer */}
      <View style={styles.customHeader}>
        <TouchableOpacity 
          style={styles.drawerButton}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <MaterialCommunityIcons name="menu" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Tổng Quan Quản Trị</Text>
        
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
              <Text style={styles.welcomeText}>Xin chào,</Text>
              <Text style={styles.usernameText}>{userInfo?.username || 'Quản trị viên'}</Text>
            </View>
            {userInfo?.avatar_url ? (
              <Avatar.Image 
                source={{ uri: userInfo.avatar_url }} 
                size={50}
                style={styles.avatar}
              />
            ) : (
              <Avatar.Text 
                label={(userInfo?.username?.substring(0, 2) || 'Q').toUpperCase()} 
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
              <Text style={styles.statOverviewLabel}>Người dùng</Text>
            </View>
            <View style={styles.statOverviewDivider} />
            <View style={styles.statOverviewItem}>
              <Text style={styles.statOverviewValue}>{summaryData?.total_jobs || 0}</Text>
              <Text style={styles.statOverviewLabel}>Việc làm</Text>
            </View>
            <View style={styles.statOverviewDivider} />
            <View style={styles.statOverviewItem}>
              <Text style={styles.statOverviewValue}>{notificationsData?.unread_notifications || 0}</Text>
              <Text style={styles.statOverviewLabel}>Thông báo</Text>
            </View>
          </View>
        </View>
        
        {/* Lưới thống kê chính */}
        <View style={styles.powerStatsContainer}>
          <PowerStatCard 
            title="Chờ phê duyệt"
            value={getUserCountByRole(null) || 0}
            icon="account-clock"
            gradientColors={['#2563EB', '#1E40AF']}
            iconBackgroundColor="rgba(37, 99, 235, 0.8)"
          />
          <PowerStatCard 
            title="Thông báo hệ thống"
            value={notificationsData?.total_notifications || 0}
            icon="bell-ring"
            gradientColors={['#F59E0B', '#D97706']}
            iconBackgroundColor="rgba(245, 158, 11, 0.8)"
          />
        </View>
        
        <View style={styles.powerStatsContainer}>
          <PowerStatCard 
            title="Đơn ứng tuyển"
            value={summaryData?.total_applications || 0}
            icon="file-document-multiple"
            gradientColors={['#10B981', '#059669']}
            iconBackgroundColor="rgba(16, 185, 129, 0.8)"
          />
          <PowerStatCard 
            title="Nhà tuyển dụng"
            value={getUserCountByRole("Recruiter")}
            icon="domain"
            gradientColors={['#EC4899', '#DB2777']}
            iconBackgroundColor="rgba(236, 72, 153, 0.8)"
          />
        </View>
        
        {/* Biểu đồ phân bố người dùng */}
        <GraphCard title="Phân bố vai trò người dùng" icon="chart-pie">
          <View style={styles.chartContainer}>
            {summaryData?.user_counts?.map((role, index) => {
              const roleName = role.active_role__name || 'Chưa xác thực';
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
        
        {/* Biểu đồ xu hướng hàng tháng */}
        <GraphCard title="Việc làm đăng hàng tháng" icon="trending-up">
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
        
        {/* Thống kê thông báo */}
        <GraphCard title="Phân tích thông báo" icon="bell-outline">
          <View style={styles.notificationStatRow}>
            <View style={styles.notificationStat}>
              <View style={[styles.notificationStatIcon, { backgroundColor: 'rgba(37, 99, 235, 0.9)' }]}>
                <MaterialCommunityIcons name="bell" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.notificationStatValue}>{notificationsData?.total_notifications || 0}</Text>
                <Text style={styles.notificationStatLabel}>Tổng</Text>
              </View>
            </View>
            
            <View style={styles.notificationStat}>
              <View style={[styles.notificationStatIcon, { backgroundColor: 'rgba(236, 72, 153, 0.9)' }]}>
                <MaterialCommunityIcons name="bell-off" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.notificationStatValue}>{notificationsData?.unread_notifications || 0}</Text>
                <Text style={styles.notificationStatLabel}>Chưa đọc</Text>
              </View>
            </View>
            
            <View style={styles.notificationStat}>
              <View style={[styles.notificationStatIcon, { backgroundColor: 'rgba(16, 185, 129, 0.9)' }]}>
                <MaterialCommunityIcons name="bell-check" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.notificationStatValue}>{notificationsData?.read_notifications || 0}</Text>
                <Text style={styles.notificationStatLabel}>Đã đọc</Text>
              </View>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Loại thông báo</Text>
          <View style={styles.notificationTypeContainer}>
            {notificationsData?.counts_by_type?.map((type, index) => {
              const typeName = type.notification_type === 'general' ? 'Thông báo chung' : 'Thông báo việc làm';
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
        
        {/* Nút tải báo cáo PDF */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryActionButton]}
            onPress={downloadPDFReport}
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
                {isGenerating ? 'Đang tạo...' : 'Tải báo cáo PDF'}
              </Text>
            </LinearGradient>
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
      return 'rgba(220, 38, 38, 0.9)'; // Đỏ
    case 'Recruiter':
      return 'rgba(16, 185, 129, 0.9)'; // Xanh lá
    case 'JobSeeker':
      return 'rgba(37, 99, 235, 0.9)'; // Xanh dương
    default:
      return 'rgba(156, 163, 175, 0.9)'; // Xám
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
  actionButtonGradient: {
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
  }
});

export default Dashboard;
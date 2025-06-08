// src/screens/Admin/Reports/UserStats.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  DataTable,
  Searchbar,
  Button,
  Menu,
  ActivityIndicator,
  List,
  Chip,
  Portal,
  Dialog,
  SegmentedButtons,
  IconButton,
  Text,
  Divider,
} from 'react-native-paper';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import * as adminAPI from '../../../api/admin';

const UserStats = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [timeRange, setTimeRange] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('registrations');
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const timeRanges = [
    { label: 'Tuần', value: 'week' },
    { label: 'Tháng', value: 'month' },
    { label: 'Năm', value: 'year' },
  ];

  const metrics = [
    { label: 'Đăng ký', value: 'registrations' },
    { label: 'Hoạt động', value: 'activities' },
    { label: 'Tương tác', value: 'interactions' },
  ];

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUserStats({
        time_range: timeRange,
        metric: selectedMetric,
        search: searchQuery,
        page: page + 1,
        limit: itemsPerPage,
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [timeRange, selectedMetric, page, itemsPerPage]);

  const onSearch = (query) => {
    setSearchQuery(query);
    setPage(0);
    fetchStats();
  };

  const showUserDetail = (user) => {
    setSelectedUser(user);
    setDetailDialogVisible(true);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Search and Filters */}
      <Card style={styles.card}>
        <Card.Content>
          <Searchbar
            placeholder="Tìm kiếm người dùng..."
            onChangeText={onSearch}
            value={searchQuery}
            style={styles.searchbar}
          />
          
          <View style={styles.filterSection}>
            <Title style={styles.sectionTitle}>Khoảng thời gian</Title>
            <SegmentedButtons
              value={timeRange}
              onValueChange={setTimeRange}
              buttons={timeRanges}
            />
          </View>

          <View style={styles.filterSection}>
            <Title style={styles.sectionTitle}>Chỉ số thống kê</Title>
            <SegmentedButtons
              value={selectedMetric}
              onValueChange={setSelectedMetric}
              buttons={metrics}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Summary Statistics */}
      <View style={styles.summaryContainer}>
        <Card style={[styles.summaryCard, { backgroundColor: '#E3F2FD' }]}>
          <Card.Content>
            <Title>Tổng người dùng</Title>
            <Paragraph style={styles.summaryNumber}>
              {stats?.totalUsers || 0}
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: '#F1F8E9' }]}>
          <Card.Content>
            <Title>Hoạt động</Title>
            <Paragraph style={styles.summaryNumber}>
              {stats?.activeUsers || 0}
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: '#FFF3E0' }]}>
          <Card.Content>
            <Title>Mới trong {timeRange}</Title>
            <Paragraph style={styles.summaryNumber}>
              {stats?.newUsers || 0}
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: '#E8EAF6' }]}>
          <Card.Content>
            <Title>Tỷ lệ hoạt động</Title>
            <Paragraph style={styles.summaryNumber}>
              {stats?.activeRate || 0}%
            </Paragraph>
          </Card.Content>
        </Card>
      </View>

      {/* User Growth Chart */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Tăng trưởng người dùng</Title>
          <LineChart
            data={{
              labels: stats?.growth?.labels || [],
              datasets: [{
                data: stats?.growth?.data || []
              }]
            }}
            width={Dimensions.get('window').width - 32}
            height={220}
            chartConfig={{
              backgroundColor: '#1976D2',
              backgroundGradientFrom: '#1976D2',
              backgroundGradientTo: '#1976D2',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {/* Role Distribution */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Phân bố vai trò</Title>
          <PieChart
            data={stats?.roleDistribution?.map(item => ({
              name: item.role,
              population: item.count,
              color: item.color,
              legendFontColor: '#7F7F7F',
            })) || []}
            width={Dimensions.get('window').width - 32}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {/* Activity Metrics */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Chỉ số hoạt động</Title>
          <BarChart
            data={{
              labels: stats?.activityMetrics?.labels || [],
              datasets: [{
                data: stats?.activityMetrics?.data || []
              }]
            }}
            width={Dimensions.get('window').width - 32}
            height={220}
            chartConfig={{
              backgroundColor: '#4CAF50',
              backgroundGradientFrom: '#4CAF50',
              backgroundGradientTo: '#4CAF50',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {/* User Table */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Chi tiết người dùng</Title>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Tên</DataTable.Title>
              <DataTable.Title>Vai trò</DataTable.Title>
              <DataTable.Title numeric>Hoạt động</DataTable.Title>
              <DataTable.Title numeric>Tương tác</DataTable.Title>
              <DataTable.Title></DataTable.Title>
            </DataTable.Header>

            {stats?.users?.map((user) => (
              <DataTable.Row key={user.id}>
                <DataTable.Cell>{user.username}</DataTable.Cell>
                <DataTable.Cell>
                  <Chip size="small">{user.role}</Chip>
                </DataTable.Cell>
                <DataTable.Cell numeric>{user.activities}</DataTable.Cell>
                <DataTable.Cell numeric>{user.interactions}</DataTable.Cell>
                <DataTable.Cell>
                  <IconButton
                    icon="information"
                    size={20}
                    onPress={() => showUserDetail(user)}
                  />
                </DataTable.Cell>
              </DataTable.Row>
            ))}

            <DataTable.Pagination
              page={page}
              numberOfPages={Math.ceil((stats?.total || 0) / itemsPerPage)}
              onPageChange={setPage}
              label={`${page + 1} of ${Math.ceil((stats?.total || 0) / itemsPerPage)}`}
              numberOfItemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              showFastPaginationControls
              selectPageDropdown
            />
          </DataTable>
        </Card.Content>
      </Card>

      {/* User Detail Dialog */}
      <Portal>
        <Dialog
          visible={detailDialogVisible}
          onDismiss={() => setDetailDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Chi tiết người dùng</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              {selectedUser && (
                <View style={styles.dialogContent}>
                  <List.Section>
                    <List.Subheader>Thông tin cơ bản</List.Subheader>
                    <List.Item
                      title="Tên đăng nhập"
                      description={selectedUser.username}
                      left={props => <List.Icon {...props} icon="account" />}
                    />
                    <List.Item
                      title="Email"
                      description={selectedUser.email}
                      left={props => <List.Icon {...props} icon="email" />}
                    />
                    <List.Item
                      title="Ngày tham gia"
                      description={new Date(selectedUser.created_at).toLocaleDateString()}
                      left={props => <List.Icon {...props} icon="calendar" />}
                    />
                  </List.Section>

                  <Divider />

                  <List.Section>
                    <List.Subheader>Vai trò và quyền hạn</List.Subheader>
                    <View style={styles.roleChips}>
                      {selectedUser.roles?.map((role) => (
                        <Chip
                          key={role}
                          style={styles.roleChip}
                          mode="outlined"
                        >
                          {role}
                        </Chip>
                      ))}
                    </View>
                  </List.Section>

                  <Divider />

                  <List.Section>
                    <List.Subheader>Thống kê hoạt động</List.Subheader>
                    <List.Item
                      title="Tổng hoạt động"
                      description={selectedUser.total_activities}
                      left={props => <List.Icon {...props} icon="chart-bar" />}
                    />
                    <List.Item
                      title="Đăng tin"
                      description={selectedUser.job_posts}
                      left={props => <List.Icon {...props} icon="briefcase" />}
                    />
                    <List.Item
                      title="Ứng tuyển"
                      description={selectedUser.applications}
                      left={props => <List.Icon {...props} icon="file-document" />}
                    />
                  </List.Section>
                </View>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDetailDialogVisible(false)}>Đóng</Button>
            <Button
              mode="contained"
              onPress={() => {
                setDetailDialogVisible(false);
                navigation.navigate('UserDetail', { userId: selectedUser.id });
              }}
            >
              Chỉnh sửa
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  searchbar: {
    marginBottom: 16,
  },
  filterSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  summaryCard: {
    width: '45%',
    margin: 8,
    elevation: 4,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  dialog: {
    maxHeight: '80%',
  },
  dialogContent: {
    padding: 16,
  },
  roleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  roleChip: {
    margin: 4,
  },
});

export default UserStats;
// src/screens/Admin/Reports/Overview.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  SegmentedButtons,
} from 'react-native-paper';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import * as adminAPI from '../../../api/admin';

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getOverviewStats({ time_range: timeRange });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const timeRangeButtons = [
    { label: 'Tuần', value: 'week' },
    { label: 'Tháng', value: 'month' },
    { label: 'Năm', value: 'year' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Time Range Selector */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Khoảng thời gian</Title>
          <SegmentedButtons
            value={timeRange}
            onValueChange={setTimeRange}
            buttons={timeRangeButtons}
          />
        </Card.Content>
      </Card>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <Card style={[styles.summaryCard, { backgroundColor: '#E3F2FD' }]}>
          <Card.Content>
            <Title>Người dùng mới</Title>
            <Paragraph style={styles.summaryNumber}>
              {stats?.newUsers || 0}
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: '#F1F8E9' }]}>
          <Card.Content>
            <Title>Việc làm mới</Title>
            <Paragraph style={styles.summaryNumber}>
              {stats?.newJobs || 0}
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: '#FFF3E0' }]}>
          <Card.Content>
            <Title>Ứng tuyển</Title>
            <Paragraph style={styles.summaryNumber}>
              {stats?.applications || 0}
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: '#E8EAF6' }]}>
          <Card.Content>
            <Title>Tỷ lệ thành công</Title>
            <Paragraph style={styles.summaryNumber}>
              {stats?.successRate || 0}%
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
              labels: stats?.userGrowth?.labels || [],
              datasets: [{
                data: stats?.userGrowth?.data || []
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

      {/* Job Categories Chart */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Phân bố việc làm theo danh mục</Title>
          <PieChart
            data={stats?.jobCategories?.map(item => ({
              name: item.name,
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

      {/* Application Status Chart */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Trạng thái ứng tuyển</Title>
          <BarChart
            data={{
              labels: stats?.applicationStatus?.labels || [],
              datasets: [{
                data: stats?.applicationStatus?.data || []
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
});

export default Overview;
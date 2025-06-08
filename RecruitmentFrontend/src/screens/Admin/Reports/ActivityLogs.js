// src/screens/Admin/Reports/ActivityLogs.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import {
  Card,
  Title,
  Searchbar,
  List,
  Chip,
  Button,
  Menu,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import * as adminAPI from '../../../api/admin';

const ActivityLogs = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchLogs = async (refresh = false) => {
    try {
      const newPage = refresh ? 1 : page;
      setLoading(true);
      const response = await adminAPI.getActivityLogs({
        page: newPage,
        limit: 20,
        search: searchQuery,
        action: selectedAction === 'all' ? null : selectedAction,
      });

      const newLogs = response.data;
      if (refresh) {
        setLogs(newLogs);
      } else {
        setLogs([...logs, ...newLogs]);
      }
      setHasMore(newLogs.length === 20);
      setPage(newPage + 1);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs(true);
  }, [selectedAction]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchLogs();
    }
  };

  const getActionColor = (action) => {
    const colors = {
      create: '#4CAF50',
      update: '#1976D2',
      delete: '#F44336',
      approve: '#4CAF50',
      reject: '#F44336',
      login: '#9C27B0',
      default: '#757575',
    };
    return colors[action] || colors.default;
  };

  const renderLogItem = ({ item }) => (
    <Card style={styles.logCard}>
      <Card.Content>
        <View style={styles.logHeader}>
          <Chip
            style={[
              styles.actionChip,
              { backgroundColor: getActionColor(item.action) + '20' }
            ]}
            textStyle={{ color: getActionColor(item.action) }}
          >
            {item.action}
          </Chip>
          <Title style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleString()}
          </Title>
        </View>

        <List.Item
          title={item.user.username}
          description={item.user.email}
          left={props => <List.Icon {...props} icon="account" />}
        />

        <Divider style={styles.divider} />

        <View style={styles.logDetails}>
          <Title style={styles.detailTitle}>Chi tiết hoạt động</Title>
          <List.Item
            title={item.target_type}
            description={item.target_id}
            left={props => <List.Icon {...props} icon="information" />}
          />
          {item.details && (
            <List.Item
              title="Thông tin thêm"
              description={item.details}
              left={props => <List.Icon {...props} icon="text" />}
            />
          )}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Tìm kiếm..."
          onChangeText={(query) => {
            setSearchQuery(query);
            fetchLogs(true);
          }}
          value={searchQuery}
          style={styles.searchbar}
        />

        <Button
          mode="outlined"
          onPress={() => setFilterMenuVisible(true)}
          icon="filter-variant"
          style={styles.filterButton}
        >
          {selectedAction === 'all' ? 'Tất cả' : selectedAction}
        </Button>

        <Menu
          visible={filterMenuVisible}
          onDismiss={() => setFilterMenuVisible(false)}
          anchor={styles.filterMenu}
        >
          <Menu.Item
            onPress={() => {
              setSelectedAction('all');
              setFilterMenuVisible(false);
            }}
            title="Tất cả"
          />
          <Menu.Item
            onPress={() => {
              setSelectedAction('create');
              setFilterMenuVisible(false);
            }}
            title="Tạo mới"
          />
          <Menu.Item
            onPress={() => {
              setSelectedAction('update');
              setFilterMenuVisible(false);
            }}
            title="Cập nhật"
          />
          <Menu.Item
            onPress={() => {
              setSelectedAction('delete');
              setFilterMenuVisible(false);
            }}
            title="Xóa"
          />
          <Menu.Item
            onPress={() => {
              setSelectedAction('approve');
              setFilterMenuVisible(false);
            }}
            title="Phê duyệt"
          />
          <Menu.Item
            onPress={() => {
              setSelectedAction('reject');
              setFilterMenuVisible(false);
            }}
            title="Từ chối"
          />
        </Menu>
      </View>

      <FlatList
        data={logs}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          loading && <ActivityIndicator style={styles.loader} />
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    elevation: 4,
  },
  searchbar: {
    marginBottom: 8,
  },
  filterButton: {
    marginTop: 8,
  },
  listContainer: {
    padding: 16,
  },
  logCard: {
    marginBottom: 16,
    elevation: 4,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionChip: {
    borderRadius: 4,
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    marginVertical: 8,
  },
  logDetails: {
    marginTop: 8,
  },
  detailTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  loader: {
    padding: 16,
  },
});

export default ActivityLogs;
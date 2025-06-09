// src/screens/JobSeeker/ApplicationStatusScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getApplications } from '../../api/application';
import { useNavigation } from '@react-navigation/native';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'applied', label: 'Applied' },
  { key: 'interview', label: 'Interview' },
  { key: 'offered', label: 'Offered' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'hired', label: 'Hired' },
  { key: 'withdraw', label: 'Withdraw' },
];

const STATUS_COLORS = {
  rejected: '#FEE2E2',
  offered: '#D1FAE5',
  interview: '#DBEAFE',
  applied: '#E0E7FF',
  hired: '#DCFCE7',
  withdraw: '#F3F4F6',
};

const STATUS_TEXT_COLORS = {
  rejected: '#EF4444',
  offered: '#10B981',
  interview: '#2563EB',
  applied: '#6366F1',
  hired: '#22C55E',
  withdraw: '#6B7280',
};

const STATUS_LABELS = {
  rejected: 'Rejected',
  offered: 'Offered',
  interview: 'Interview',
  applied: 'Applied',
  hired: 'Hired',
  withdraw: 'Withdraw',
};

export default function ApplicationStatusScreen() {
  const { userToken, userInfo } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [total, setTotal] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    fetchApplications();
  }, [selectedFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedFilter !== 'all') params.status = selectedFilter;
      const res = await getApplications(userToken, params);
      setApplications(res.results || []);
      setTotal(res.count || (res.results ? res.results.length : 0));
    } catch (e) {
      setApplications([]);
      setTotal(0);
    }
    setLoading(false);
  };

  const renderFilter = () => (
    <View style={styles.filterRow}>
      {FILTERS.map(f => (
        <TouchableOpacity
          key={f.key}
          style={[
            styles.filterBtn,
            selectedFilter === f.key && styles.filterBtnActive,
          ]}
          onPress={() => setSelectedFilter(f.key)}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === f.key && styles.filterTextActive,
            ]}
          >
            {f.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderItem = ({ item }) => {
    const job = item.job_posting_detail || item.job_posting || {};
    const recruiter = job.recruiter_profile || {};
    const workLocation = job.location;
    const companyAddress = recruiter.address;
    const statusDisplay = item.status_display || '';
    const salary =
      job.salary_min && job.salary_max
        ? `${parseInt(job.salary_min, 10).toLocaleString()} - ${parseInt(job.salary_max, 10).toLocaleString()}`
        : '';
    return (
      <TouchableOpacity onPress={() => navigation.navigate('ApplicationDetail', { id: item.id })}>
        <View style={styles.card}>
          <Image
            source={{ uri: recruiter.company_logo || 'https://via.placeholder.com/48' }}
            style={styles.logo}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.company}>{recruiter.company_name}</Text>
            <View style={styles.row}>
              <Text style={styles.salary}>{salary ? `${salary} USD` : ''}</Text>
              <Text style={styles.location}>{workLocation}</Text>
            </View>
            {/* Nếu muốn hiển thị cả địa chỉ công ty, thêm dòng sau */}
            {/* <Text style={styles.companyAddress}>{companyAddress}</Text> */}
            <View style={styles.row}>
              <View style={[
                styles.statusTag,
                { backgroundColor: STATUS_COLORS[statusDisplay] || '#E0E7FF' }
              ]}>
                <Text style={{
                  color: STATUS_TEXT_COLORS[statusDisplay] || '#6366F1',
                  fontWeight: 'bold'
                }}>
                  {statusDisplay}
                </Text>
              </View>
              <Text style={styles.type}>{job.job_type || 'Full-time'}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Image
          source={{ uri: userInfo?.avatar_url || 'https://ui-avatars.com/api/?name=User' }}
          style={styles.avatar}
        />
      </View>
      <Text style={styles.title}>
        You have <Text style={styles.highlight}>{total}</Text> Applications <Text>👍</Text>
      </Text>
      {/* Filter */}
      {renderFilter()}
      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={applications}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>No applications found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', paddingTop: 40 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    paddingHorizontal: 20, marginBottom: 10,
  },
  avatar: { width: 60, height: 60, borderRadius: 100, borderWidth: 2, borderColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginLeft: 20, marginBottom: 16 },
  highlight: { color: '#2563EB' },
  filterRow: { flexDirection: 'row', marginHorizontal: 10, marginBottom: 16 },
  filterBtn: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 10,
  },
  filterBtnActive: { backgroundColor: '#2563EB' },
  filterText: { color: '#222', fontWeight: '500' },
  filterTextActive: { color: '#fff' },
  card: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 18, padding: 16, marginHorizontal: 16,
    marginBottom: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  logo: { width: 48, height: 48, borderRadius: 12, marginRight: 16, backgroundColor: '#F3F4F6' },
  jobTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  company: { color: '#6B7280', marginBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  salary: { color: '#2563EB', fontWeight: 'bold', marginRight: 12 },
  location: { color: '#6B7280', marginRight: 12 },
  statusTag: {
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, marginRight: 10,
  },
  type: { color: '#222', fontWeight: '500' },
});

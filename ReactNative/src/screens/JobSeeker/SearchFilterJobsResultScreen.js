import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchFilterJobsResultScreen({ route, navigation }) {
  const { filterData } = route.params || {};
  const hasFilter = filterData && (
    (filterData.salaryRange && filterData.salaryRange[0] !== 0) ||
    (filterData.salaryRange && filterData.salaryRange[1] !== 999999) ||
    (filterData.selectedJobType && filterData.selectedJobType !== 'Any') ||
    (filterData.company && filterData.company !== 'All company') ||
    (filterData.location && filterData.location !== 'All location') ||
    filterData.jobFit
  );
  const [keyword, setKeyword] = useState(filterData?.keyword || '');

  // Dữ liệu job mẫu
  const jobs = [
    {
      id: '1',
      title: 'UX Designer',
      company: 'Burger King',
      salary: '$96,000/y',
      location: 'Los Angels, US',
      logo: require('../../../assets/burgerking.png'),
    },
    {
      id: '2',
      title: 'UX Designer',
      company: 'Beats',
      salary: '$84,000/y',
      location: 'Florida, US',
      logo: require('../../../assets/beats.png'),
    },
    {
      id: '3',
      title: 'UX Designer L3',
      company: 'Fiat',
      salary: '$84,000/y',
      location: 'Florida, US',
      logo: require('../../../assets/burgerking.png'),
    },
    {
      id: '4',
      title: 'UX Designer',
      company: 'Star Bucks',
      salary: '$84,000/y',
      location: 'Florida, US',
      logo: require('../../../assets/burgerking.png'),
    },
    {
      id: '5',
      title: 'UX Designer L5',
      company: 'Booking.com',
      salary: '$84,000/y',
      location: 'Florida, US',
      logo: require('../../../assets/burgerking.png'),
    },
    {
      id: '6',
      title: 'UX Designer',
      company: 'Wordpress',
      salary: '$84,000/y',
      location: 'Florida, US',
      logo: require('../../../assets/burgerking.png'),
    },
    {
      id: '7',
      title: 'UX Designer L7',
      company: 'Spotify',
      salary: '$84,000/y',
      location: 'Florida, US',
      logo: require('../../../assets/burgerking.png'),
    },
  ];

  const renderJobItem = ({ item }) => (
    <View style={styles.jobCard}>
      <Image source={item.logo} style={styles.jobLogo} />
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <Text style={styles.jobCompany}>{item.company}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.jobSalary}>{item.salary}</Text>
        <Text style={styles.jobLocation}>{item.location}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <Ionicons name="arrow-back" size={26} color="#222" />
        </TouchableOpacity>
        <TextInput
          style={styles.headerTitleInput}
          value={keyword}
          onChangeText={setKeyword}
          placeholder="Keyword"
          placeholderTextColor="#bdbdbd"
          numberOfLines={1}
        />
        <TouchableOpacity style={styles.headerIcon} onPress={() => setKeyword('')}>
          <Ionicons name="close" size={26} color={keyword ? '#bdbdbd' : '#fafbff'} />
        </TouchableOpacity>
      </View>
      {/* Dòng kẻ */}
      <View style={styles.divider} />
      {/* Jobs found + filter */}
      <View style={styles.jobsRow}>
        <Text style={styles.jobsCount}><Text style={{ color: '#3b82f6', fontWeight: 'bold' }}>293</Text> Jobs Found</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={22} color={hasFilter ? '#3b82f6' : '#bdbdbd'} />
        </TouchableOpacity>
      </View>
      {/* Danh sách job */}
      <FlatList
        data={jobs}
        keyExtractor={item => item.id}
        renderItem={renderJobItem}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbff',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
    backgroundColor: '#fafbff',
    justifyContent: 'space-between',
  },
  headerIcon: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginLeft: 4,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e6ed',
    marginBottom: 8,
    marginHorizontal: 0,
  },
  jobsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    marginBottom: 10,
  },
  jobsCount: {
    fontSize: 17,
    fontWeight: '600',
    color: '#3b82f6',
  },
  filterBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e6ed',
  },
  jobCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 18,
    marginBottom: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  jobLogo: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  jobCompany: {
    color: '#bdbdbd',
    fontSize: 15,
    marginTop: 2,
    fontWeight: '500',
  },
  jobSalary: {
    fontWeight: '700',
    fontSize: 16,
    color: '#222',
  },
  jobLocation: {
    color: '#bdbdbd',
    fontSize: 14,
    marginTop: 2,
    fontWeight: '500',
  },
}); 
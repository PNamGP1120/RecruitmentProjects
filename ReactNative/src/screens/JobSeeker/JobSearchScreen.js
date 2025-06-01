import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import FilterModal from './FilterModal';
import SearchFilterJobsResultScreen from './SearchFilterJobsResultScreen';

const { width } = Dimensions.get('window');

const popularRoles = [
  {
    id: '1',
    title: 'UX Designer',
    company: 'Dribbble',
    salary: '$80,000/y',
    logo: 'https://cdn.worldvectorlogo.com/logos/dribbble-icon.svg',
    iconType: 'dribbble',
  },
  {
    id: '2',
    title: 'UX Designer L3',
    company: 'Facebook',
    salary: '$96,000/y',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_(2019).png',
    iconType: 'facebook',
  },
  {
    id: '3',
    title: 'UX Designer L4',
    company: 'Facebook',
    salary: '$100,000/y',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_(2019).png',
    iconType: 'amazon',
  },
  // Có thể thêm nhiều role hơn nếu muốn
];

const jobs = [
  {
    id: '1',
    title: 'UX Designer L3',
    company: 'Fiat',
    salary: '$84,000/y',
    location: 'Florida, US',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Fiat_Automobiles_logo.svg',
  },
  {
    id: '2',
    title: 'UX Designer',
    company: 'Star Bucks',
    salary: '$84,000/y',
    location: 'Florida, US',
    logo: 'https://upload.wikimedia.org/wikipedia/en/6/6b/Starbucks_Coffee_Logo.svg',
  },
  {
    id: '3',
    title: 'UX Designer L5',
    company: 'Booking.com',
    salary: '$84,000/y',
    location: 'Florida, US',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Booking.com_logo.svg',
  },
  // ...Thêm job nếu muốn
];

export default function JobSearchScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  // const [recentSearches, setRecentSearches] = useState([]); // Nếu muốn lưu lịch sử tìm kiếm
  const [roleIndex, setRoleIndex] = useState(0);
  const [filterVisible, setFilterVisible] = useState(false);

  const slideAnim = useRef(new Animated.Value(500)).current;
  const popularRolesFlatListRef = useRef(null);

  // Handler chuyển role
  const handlePrevRole = () => {
    setRoleIndex((prev) => (prev === 0 ? popularRoles.length - 1 : prev - 1));
  };
  const handleNextRole = () => {
    setRoleIndex((prev) => (prev === popularRoles.length - 1 ? 0 : prev + 1));
  };

  // Header
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
        <Ionicons name="close" size={32} color="#222" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Search</Text>
      <View style={styles.headerIcon} />
    </View>
  );

  // Thanh tìm kiếm
  const renderSearchBar = () => (
    <View style={styles.searchBar}>
      <Ionicons name="search" size={22} color="#bdbdbd" style={{ marginLeft: 10 }} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search a job or position"
        placeholderTextColor="#bdbdbd"
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={() => {
          if (searchText.trim()) {
            navigation.navigate('SearchFilterJobsResult', { filterData: { keyword: searchText.trim() } });
          }
        }}
        returnKeyType="search"
      />
      <TouchableOpacity style={styles.filterBtn} onPress={openModal}>
        <Ionicons name="options-outline" size={22} color="#222" />
      </TouchableOpacity>
    </View>
  );

  // Recent Searches
  const renderRecentSearches = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Searches</Text>
      <Text style={styles.sectionSubtitle}>You don't have any search history</Text>
    </View>
  );

  // Popular Roles
  const renderPopularRoles = () => (
    <View style={styles.section}>
      <View style={styles.popularRolesHeader}>
        <Text style={styles.sectionTitle}>Popular Roles</Text>
        <View style={styles.popularRolesArrows}>
          <TouchableOpacity onPress={() => popularRolesFlatListRef.current?.scrollToOffset({ offset: 0, animated: true })} style={styles.arrowBtn}>
            <Ionicons name="chevron-back" size={22} color="#222" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => popularRolesFlatListRef.current?.scrollToEnd({ animated: true })} style={styles.arrowBtn}>
            <Ionicons name="chevron-forward" size={22} color="#222" />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        ref={popularRolesFlatListRef}
        data={popularRoles}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => (
          <View style={styles.popularRoleCard}>
            <Image source={{ uri: item.logo }} style={styles.popularRoleLogo} />
            <Text style={styles.popularRoleTitle}>{item.title}</Text>
            <Text style={styles.popularRoleCompany}>{item.company}</Text>
            <Text style={styles.popularRoleSalary}>{item.salary}</Text>
          </View>
        )}
      />
    </View>
  );

  // Danh sách job
  const renderJobItem = ({ item }) => (
    <View style={styles.jobCard}>
      <Image source={{ uri: item.logo }} style={styles.jobLogo} />
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <Text style={styles.jobCompany}>{item.company}</Text>
        <Text style={styles.jobLocation}>{item.location}</Text>
      </View>
      <Text style={styles.jobSalary}>{item.salary}</Text>
    </View>
  );

  const openModal = () => {
    setFilterVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 500,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setFilterVisible(false));
  };

  const handleApplyFilter = (filterData) => {
    navigation.navigate('SearchFilterJobsResult', { filterData });
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderSearchBar()}
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderRecentSearches()}
        {renderPopularRoles()}
        <Text style={styles.jobsCount}><Text style={{ color: '#3b82f6', fontWeight: 'bold' }}>3271</Text> Jobs</Text>
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          renderItem={renderJobItem}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      </ScrollView>
      <FilterModal
        visible={filterVisible}
        onClose={closeModal}
        slideAnim={slideAnim}
        onApply={handleApplyFilter}
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
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  headerIcon: {
    width: 36,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e0e6ed',
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: '#222',
  },
  filterBtn: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 18,
    marginHorizontal: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
  },
  sectionSubtitle: {
    color: '#bdbdbd',
    fontSize: 15,
    fontWeight: '400',
  },
  popularRolesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  popularRolesArrows: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowBtn: {
    padding: 8,
  },
  popularRoleCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    width: width * 0.38,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  popularRoleLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 10,
  },
  popularRoleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  popularRoleCompany: {
    color: '#bdbdbd',
    fontSize: 14,
    marginBottom: 2,
  },
  popularRoleSalary: {
    color: '#222',
    fontWeight: '600',
    fontSize: 15,
  },
  jobsCount: {
    fontSize: 17,
    fontWeight: '600',
    marginHorizontal: 18,
    marginBottom: 10,
    marginTop: 8,
  },
  jobCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    marginHorizontal: 18,
  },
  jobLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  jobCompany: {
    color: '#222',
    fontSize: 14,
    marginTop: 2,
    fontWeight: '500',
  },
  jobLocation: {
    color: '#bdbdbd',
    fontSize: 13,
    marginTop: 2,
  },
  jobSalary: {
    fontWeight: '600',
    fontSize: 15,
    color: '#222',
  },
});
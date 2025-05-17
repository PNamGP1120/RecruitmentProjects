import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const featuredJobsSample = [
  {
    id: '1',
    title: 'Junior Executive',
    company: 'Shell plc',
    tags: ['Administration', 'Full-Time', 'Junior'],
    salary: '$98,000/year',
    location: 'Texas, USA',
    logo: 'https://seeklogo.com/images/S/shell-logo-46DFD4F3E0-seeklogo.com.png',
  },
  {
    id: '2',
    title: 'Software Engineer',
    company: 'Facebook',
    tags: ['IT', 'Full-Time', 'Junior'],
    salary: '$180,000/year',
    location: 'California, USA',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_(2019).png',
  },
  {
    id: '3',
    title: 'Product Designer',
    company: 'Google',
    tags: ['Design', 'Full-Time', 'Junior'],
    salary: '$160,000/year',
    location: 'California, USA',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  },
  {
    id: '4',
    title: 'Marketing Manager',
    company: 'Amazon',
    tags: ['Marketing', 'Full-Time', 'Senior'],
    salary: '$120,000/year',
    location: 'Seattle, USA',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  },
  {
    id: '5',
    title: 'Data Scientist',
    company: 'Netflix',
    tags: ['Data', 'Full-Time', 'Mid-level'],
    salary: '$140,000/year',
    location: 'Los Gatos, USA',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
  },
];

const popularJobsSample = [
  {
    id: '11',
    title: 'Jr Executive',
    company: 'Burger King',
    salary: '$96,000/y',
    location: 'Los Angeles, US',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Burger_King_logo.svg',
  },
  {
    id: '12',
    title: 'Product Manager',
    company: 'Beats',
    salary: '$84,000/y',
    location: 'Florida, US',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Beats_Electronics_logo.svg',
  },
  {
    id: '13',
    title: 'UX Designer',
    company: 'Dribble',
    salary: '$80,000/y',
    location: 'New York, US',
    logo: 'https://cdn.worldvectorlogo.com/logos/dribbble-icon.svg',
  },
  {
    id: '14',
    title: 'Senior Engineer',
    company: 'Facebook',
    salary: '$96,000/y',
    location: 'California, US',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_(2019).png',
  },
  {
    id: '15',
    title: 'HR Specialist',
    company: 'Microsoft',
    salary: '$90,000/y',
    location: 'Redmond, US',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
  },
];

export default function JobSeekerHome({ navigation }) {
  const { userInfo } = useContext(AuthContext);

  const renderFeaturedJob = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.featuredJobCard}
      onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
    >
      <Image source={{ uri: item.logo }} style={styles.companyLogo} />
      <Text style={styles.jobTitle}>{item.title}</Text>
      <Text style={styles.companyName}>{item.company}</Text>
      <View style={styles.tagContainer}>
        {item.tags.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
      <View style={styles.salaryLocation}>
        <Text style={styles.salary}>{item.salary}</Text>
        <Text style={styles.location}>{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderPopularJob = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.popularJobCard}
      onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
    >
      <Image source={{ uri: item.logo }} style={styles.popularCompanyLogo} />
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={styles.popularJobTitle}>{item.title}</Text>
        <Text style={styles.popularCompanyName}>{item.company}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.popularSalary}>{item.salary}</Text>
        <Text style={styles.popularLocation}>{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.usernameText}>
            {userInfo?.first_name || userInfo?.username || 'User'}{' '}
            <Ionicons name="hand-left-outline" size={22} color="#333" />
          </Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image
            source={{ uri: userInfo?.avatar_url }}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={styles.onlineIndicator} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="gray" />
        <Text style={styles.searchPlaceholder}>Search a job or position</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => alert('Filter clicked')}>
          <Ionicons name="options-outline" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Featured Jobs */}
      <View style={styles.jobsSectionHeader}>
        <Text style={styles.sectionTitle}>Featured Jobs</Text>
        <TouchableOpacity onPress={() => navigation.navigate('JobSearch')}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={featuredJobsSample}
        keyExtractor={(item) => item.id}
        renderItem={renderFeaturedJob}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        style={{ marginBottom: 25 }}
      />

      {/* Popular Jobs */}
      <View style={styles.jobsSectionHeader}>
        <Text style={styles.sectionTitle}>Popular Jobs</Text>
        <TouchableOpacity onPress={() => navigation.navigate('JobSearch')}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={popularJobsSample}
        keyExtractor={(item) => item.id}
        renderItem={renderPopularJob}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9ff',
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  usernameText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineIndicator: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    width: 14,
    height: 14,
    backgroundColor: '#e74c3c',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eceef2',
    marginHorizontal: 20,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 30,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 12,
    color: 'gray',
    fontSize: 16,
  },
  filterButton: {
    paddingHorizontal: 10,
  },
  jobsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 18,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 22,
  },
  seeAllText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '600',
  },
  featuredJobCard: {
    backgroundColor: '#3d79f9',
    borderRadius: 18,
    padding: 18,
    marginRight: 20,
    width: width * 0.72,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  companyLogo: {
    width: 52,
    height: 52,
    borderRadius: 12,
    marginBottom: 12,
  },
  jobTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  companyName: {
    color: '#fff',
    marginBottom: 12,
    fontSize: 15,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginRight: 12,
    marginBottom: 8,
  },
  tagText: {
    color: '#fff',
    fontSize: 13,
  },
  salaryLocation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  salary: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  location: {
    color: '#fff',
    fontSize: 14,
  },
  popularJobCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  popularCompanyLogo: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  popularJobTitle: {
    fontWeight: '700',
    fontSize: 18,
    color: '#222',
  },
  popularCompanyName: {
    color: '#444',
    marginTop: 3,
  },
  popularSalary: {
    fontWeight: '600',
    fontSize: 14,
    color: '#222',
  },
  popularLocation: {
    color: '#888',
    fontSize: 13,
  },
});

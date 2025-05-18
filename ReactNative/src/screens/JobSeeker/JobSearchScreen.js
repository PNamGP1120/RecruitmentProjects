import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';

const sampleJobs = [
  {
    id: '1',
    title: 'Software Engineer',
    company: 'Facebook',
    location: 'California, USA',
    salary: '$180,000/year',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_(2019).png',
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'Google',
    location: 'California, USA',
    salary: '$160,000/year',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  },
  {
    id: '3',
    title: 'UX Designer',
    company: 'Dribble',
    location: 'New York, USA',
    salary: '$80,000/year',
    logo: 'https://cdn.worldvectorlogo.com/logos/dribbble-icon.svg',
  },
  {
    id: '4',
    title: 'Data Scientist',
    company: 'Netflix',
    location: 'Los Gatos, USA',
    salary: '$140,000/year',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
  },
  {
    id: '5',
    title: 'Marketing Manager',
    company: 'Amazon',
    location: 'Seattle, USA',
    salary: '$120,000/year',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  },
];

export default function JobSearchScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [filteredJobs, setFilteredJobs] = useState(sampleJobs);

  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredJobs(sampleJobs);
    } else {
      const filtered = sampleJobs.filter(job =>
        job.title.toLowerCase().includes(searchText.toLowerCase()) ||
        job.company.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
  }, [searchText]);

  const renderJobItem = ({ item }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
    >
      <Image source={{ uri: item.logo }} style={styles.logo} />
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <Text style={styles.company}>{item.company}</Text>
        <Text style={styles.location}>{item.location}</Text>
      </View>
      <Text style={styles.salary}>{item.salary}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search jobs or companies"
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
      />

      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        renderItem={renderJobItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={<Text style={styles.noResults}>No jobs found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f7f9ff',
  },
  searchInput: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  jobCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  company: {
    color: '#555',
    marginTop: 3,
  },
  location: {
    color: '#888',
    fontSize: 13,
    marginTop: 3,
  },
  salary: {
    fontWeight: '600',
    fontSize: 14,
    color: '#222',
  },
  noResults: {
    textAlign: 'center',
    marginTop: 50,
    color: '#888',
    fontSize: 16,
  },
});

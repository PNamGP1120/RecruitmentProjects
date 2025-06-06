import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export const JobCard = ({ job, onPress }) => {
  return (
    <TouchableOpacity style={styles.jobCard} onPress={onPress}>
      <Image
        source={{ uri: job.recruiter_profile?.company_logo_url }}
        style={styles.companyLogo}
      />
      <View style={styles.jobInfo}>
        <Text style={styles.jobTitle}>{job.title}</Text>
        <Text style={styles.companyName}>
          {job.recruiter_profile?.company_name || 'Công ty'}
        </Text>
        <Text style={styles.location}>{job.location}</Text>
        <Text style={styles.salary}>
          {formatSalary(job.salary_min, job.salary_max)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  jobCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  companyLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  jobInfo: {
    flex: 1,
    marginLeft: 15,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  salary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004aad',
  },
});

// Helper function to format salary
const formatSalary = (min, max) => {
  if (!min && !max) return 'Thỏa thuận';
  if (!min) return `${max.toLocaleString()} VNĐ`;
  if (!max) return `Từ ${min.toLocaleString()} VNĐ`;
  return `${min.toLocaleString()} - ${max.toLocaleString()} VNĐ`;
};

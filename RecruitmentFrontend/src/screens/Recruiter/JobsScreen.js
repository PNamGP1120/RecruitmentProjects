import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function JobsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý việc làm</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateJob')}
        >
          <Text style={styles.addButtonText}>+ Đăng tin mới</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[]} // Sẽ thêm data sau
        renderItem={({ item }) => (
          <View style={styles.jobCard}>
            <Text style={styles.jobTitle}>Tiêu đề việc làm</Text>
            <Text style={styles.jobStatus}>Trạng thái: Đang tuyển</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#004aad',
    padding: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
  },
  jobCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  jobStatus: {
    marginTop: 8,
    color: '#666',
  },
});
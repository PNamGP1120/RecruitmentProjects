import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { JOB_TYPES, JOB_TYPE_LABELS } from '../../api/config';

// Định nghĩa các mức lương theo VND
const SALARY_RANGES = [
  { value: 0, label: 'Any' },
  { value: 5000000, label: '5M VND' },    // 5 triệu
  { value: 10000000, label: '10M VND' },  // 10 triệu
  { value: 15000000, label: '15M VND' },  // 15 triệu
  { value: 20000000, label: '20M VND' },  // 20 triệu
  { value: 30000000, label: '30M VND' },  // 30 triệu
  { value: 50000000, label: '50M VND' },  // 50 triệu
  { value: 100000000, label: '100M VND' }, // 100 triệu
];

// Thêm tùy chọn "Tất cả" vào JOB_TYPES
const ALL_JOB_TYPES = {
  ALL: 'All',
  ...JOB_TYPES
};

// Thêm label cho "Tất cả"
const ALL_JOB_TYPE_LABELS = {
  [ALL_JOB_TYPES.ALL]: 'Tất cả',
  ...JOB_TYPE_LABELS
};

export default function FilterModal({ visible, onClose, onApply, initialFilters }) {
  const [filters, setFilters] = useState({
    job_type: ALL_JOB_TYPES.ALL, // Mặc định là "Tất cả"
    location: '',
    salary_min: 0,
  });

  useEffect(() => {
    if (visible && initialFilters) {
      setFilters({
        job_type: initialFilters.job_type || ALL_JOB_TYPES.ALL,
        location: initialFilters.location || '',
        salary_min: initialFilters.salary_min || 0,
      });
    }
  }, [visible, initialFilters]);

  const handleApply = () => {
    // Nếu chọn "Tất cả", gửi undefined để không lọc theo job_type
    const appliedFilters = {
      ...filters,
      job_type: filters.job_type === ALL_JOB_TYPES.ALL ? undefined : filters.job_type
    };
    onApply(appliedFilters);
  };

  const handleReset = () => {
    setFilters({
      job_type: ALL_JOB_TYPES.ALL,
      location: '',
      salary_min: 0,
    });
  };

  const formatSalary = (value) => {
    if (value === 0) return 'Any';
    // Chuyển đổi sang triệu và làm tròn
    const millionValue = Math.round(value / 1000000);
    return `${millionValue}M+ VND`;
  };

  const renderJobTypeFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.sectionTitle}>Job Type</Text>
      <View style={styles.jobTypeContainer}>
        {Object.entries(ALL_JOB_TYPES).map(([key, value]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.jobTypeButton,
              filters.job_type === value && styles.jobTypeButtonActive
            ]}
            onPress={() => setFilters(prev => ({ ...prev, job_type: value }))}
          >
            <Text style={[
              styles.jobTypeText,
              filters.job_type === value && styles.jobTypeTextActive
            ]}>
              {ALL_JOB_TYPE_LABELS[value]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderLocationFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.sectionTitle}>Location</Text>
      <TextInput
        style={styles.locationInput}
        placeholder="Enter location"
        value={filters.location}
        onChangeText={(text) => setFilters(prev => ({ ...prev, location: text }))}
      />
    </View>
  );

  const renderSalaryFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.sectionTitle}>Minimum Salary (VND)</Text>
      <View style={styles.salaryContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100000000}
          step={1000000}
          value={filters.salary_min}
          onValueChange={(value) => {
            // Làm tròn giá trị về triệu
            const roundedValue = Math.round(value / 1000000) * 1000000;
            setFilters(prev => ({ ...prev, salary_min: roundedValue }));
          }}
          minimumTrackTintColor="#3b82f6"
          maximumTrackTintColor="#e0e6ed"
          thumbTintColor="#3b82f6"
        />
        <View style={styles.salaryValueContainer}>
          <Text style={styles.salaryValue}>{formatSalary(filters.salary_min)}</Text>
        </View>
        <View style={styles.salaryMarkers}>
          {SALARY_RANGES.map((range, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.salaryMarker,
                filters.salary_min === range.value && styles.salaryMarkerActive
              ]}
              onPress={() => setFilters(prev => ({ ...prev, salary_min: range.value }))}
            >
              <Text style={[
                styles.salaryMarkerText,
                filters.salary_min === range.value && styles.salaryMarkerTextActive
              ]}>
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Jobs</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#222" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            {renderJobTypeFilter()}
            {renderLocationFilter()}
            {renderSalaryFilter()}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e6ed',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
  },
  filterContent: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 12,
  },
  jobTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  jobTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e0e6ed',
  },
  jobTypeButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  jobTypeText: {
    fontSize: 14,
    color: '#4b5563',
  },
  jobTypeTextActive: {
    color: '#fff',
  },
  locationInput: {
    borderWidth: 1,
    borderColor: '#e0e6ed',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#222',
  },
  salaryContainer: {
    paddingHorizontal: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  salaryValueContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  salaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  salaryMarkers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  salaryMarker: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginBottom: 8,
  },
  salaryMarkerActive: {
    backgroundColor: '#3b82f6',
  },
  salaryMarkerText: {
    fontSize: 14,
    color: '#4b5563',
  },
  salaryMarkerTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e6ed',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e6ed',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#4b5563',
  },
  applyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
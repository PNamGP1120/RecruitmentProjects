import React, { useState, useRef } from 'react';
import { Modal, View, Animated, TouchableOpacity, Text, StyleSheet, TextInput, Dimensions, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

const { width } = Dimensions.get('window');

const jobTypes = ['Any', 'Full-Time', 'Contract', 'Part-Time'];

const MAX_SALARY = 999999; // Giá trị đại diện cho unlimited

export default function FilterModal({ visible, onClose, slideAnim, onApply }) {
  const [salaryRange, setSalaryRange] = useState([0, MAX_SALARY]);
  const [selectedJobType, setSelectedJobType] = useState('Any');
  const [company, setCompany] = useState('All company');
  const [location, setLocation] = useState('All location');
  const [jobFit, setJobFit] = useState(false);
  const [keyword, setKeyword] = useState('');

  // Tính average
  let averagePrice;
  if (salaryRange[1] === MAX_SALARY) {
    averagePrice = 'Unlimited';
  } else {
    averagePrice = `$${Math.round((salaryRange[0] + salaryRange[1]) / 2).toLocaleString()}`;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.headerRow}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={() => {
              if (onApply) {
                onApply({
                  salaryRange,
                  selectedJobType,
                  company,
                  location,
                  jobFit,
                  keyword: jobFit ? '' : keyword,
                });
              }
              onClose();
            }}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Bọc các phần cần làm mờ */}
            <View style={jobFit ? { opacity: 0.5 } : null} pointerEvents={jobFit ? 'none' : 'auto'}>
              {/* Search input */}
              <View style={styles.searchBoxWrapper}>
                <TextInput
                  style={styles.searchBox}
                  placeholder="Add a role or company or type"
                  placeholderTextColor="#bdbdbd"
                  editable={!jobFit}
                  value={keyword}
                  onChangeText={setKeyword}
                />
              </View>
              {/* Salary Range */}
              <Text style={styles.label}>Salary Range</Text>
              <Text style={styles.subLabel}>
                The average listing price is <Text style={{ fontWeight: 'bold' }}>{averagePrice}</Text>
              </Text>
              <View style={{ marginVertical: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={styles.salaryValue}>
                    {salaryRange[0] === 0 ? '$0' : `$${salaryRange[0].toLocaleString()}`}
                  </Text>
                  <Text style={styles.salaryValue}>
                    {salaryRange[1] >= MAX_SALARY ? 'Unlimited' : `$${salaryRange[1].toLocaleString()}`}
                  </Text>
                </View>
                <MultiSlider
                  values={salaryRange}
                  min={0}
                  max={MAX_SALARY}
                  step={1000}
                  onValuesChange={values => {
                    const newValues = [
                      values[0],
                      values[1] >= MAX_SALARY - 1000 ? MAX_SALARY : values[1]
                    ];
                    setSalaryRange(newValues);
                  }}
                  allowOverlap={false}
                  snapped
                  markerStyle={{ backgroundColor: '#3b82f6' }}
                  selectedStyle={{ backgroundColor: '#3b82f6' }}
                  unselectedStyle={{ backgroundColor: '#e0e6ed' }}
                  containerStyle={{ alignSelf: 'center'}}
                  enabledOne={!jobFit}
                  enabledTwo={!jobFit}
                />
              </View>
              {/* Company & Location */}
              <View style={styles.selectRow}>
                <Text style={styles.label}>Company</Text>
                <TouchableOpacity disabled={jobFit}>
                  <Text style={styles.selectValue}>{company}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.selectRow}>
                <Text style={styles.label}>Location</Text>
                <TouchableOpacity disabled={jobFit}>
                  <Text style={styles.selectValue}>{location}</Text>
                </TouchableOpacity>
              </View>
              {/* Job Types */}
              <Text style={styles.label}>Job Types</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.jobTypeRow}
                scrollEnabled={!jobFit}
              >
                {jobTypes.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.jobTypeBtn, selectedJobType === type && styles.jobTypeBtnActive]}
                    onPress={() => setSelectedJobType(type)}
                    disabled={jobFit}
                  >
                    <Text style={[styles.jobTypeText, selectedJobType === type && styles.jobTypeTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            {/* Job Fit */}
            <View style={styles.selectRow}>
              <Text style={styles.label}>Job Fit</Text>
              <TouchableOpacity onPress={() => setJobFit(!jobFit)} style={styles.checkboxWrapper}>
                <View style={[styles.checkbox, jobFit && styles.checkboxChecked]} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 200,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    flex: 1,
  },
  doneText: {
    color: '#007AFF',
    fontSize: 18,
    paddingLeft: 16,
  },
  searchBoxWrapper: {
    marginBottom: 18,
  },
  searchBox: {
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 44,
    fontSize: 16,
    color: '#222',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 2,
    color: '#222',
  },
  subLabel: {
    color: '#bdbdbd',
    fontSize: 14,
    marginBottom: 8,
  },
  salaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  salaryValue: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  selectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 2,
  },
  selectValue: {
    color: '#222',
    fontSize: 16,
    fontWeight: '500',
  },
  jobTypeRow: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 10,
  },
  jobTypeBtn: {
    backgroundColor: '#e0e6ed',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 10,
  },
  jobTypeBtnActive: {
    backgroundColor: '#3b82f6',
  },
  jobTypeText: {
    color: '#222',
    fontSize: 15,
    fontWeight: '500',
  },
  jobTypeTextActive: {
    color: '#fff',
  },
  checkboxWrapper: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#bdbdbd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
  },
}); 
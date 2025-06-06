import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Modal,
    Platform,
    StatusBar,
    Image,
    FlatList,
    TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Application Status Constants
const APPLICATION_STATUS = {
    APPLIED: 'Applied',
    RESUME_SCREENING: 'Resume Screening',
    INTERVIEW_SCHEDULED: 'Interview Scheduled',
    INTERVIEW_COMPLETED: 'Interview Completed',
    OFFERED: 'Offered',
    REJECTED: 'Rejected',
    HIRED: 'Hired',
    WITHDRAWN: 'Withdrawn'
};

// Job Categories
const JOB_CATEGORIES = {
    DEVELOPMENT: 'Development',
    DESIGN: 'Design',
    MARKETING: 'Marketing',
    SALES: 'Sales',
    HR: 'Human Resources',
    FINANCE: 'Finance'
};

// Experience Levels
const EXPERIENCE_LEVELS = {
    ENTRY: 'Entry Level',
    JUNIOR: 'Junior',
    MID: 'Mid Level',
    SENIOR: 'Senior',
    LEAD: 'Team Lead',
    MANAGER: 'Manager'
};

// Mock Data with more details
const MOCK_APPLICATIONS = [
    {
        id: '1',
        job_posting: {
            title: 'Senior React Native Developer',
            company_name: 'Tech Solutions',
            category: JOB_CATEGORIES.DEVELOPMENT,
            experience_level: EXPERIENCE_LEVELS.SENIOR
        },
        applicant: {
            full_name: 'John Doe',
            email: 'john.doe@email.com',
            avatar_url: 'https://randomuser.me/api/portraits/men/1.jpg',
            experience_years: 5,
            current_salary: 75000
        },
        status: APPLICATION_STATUS.APPLIED,
        applied_date: '2024-03-15',
        resume_url: 'resume1.pdf',
        cover_letter: 'I am excited to apply...',
        skills: ['React Native', 'JavaScript', 'TypeScript', 'Redux'],
        interview_date: null,
        expected_salary: 85000
    },
    // Add 9 more mock applications with different combinations
    {
        id: '2',
        job_posting: {
            title: 'UI/UX Designer',
            company_name: 'Creative Studio',
            category: JOB_CATEGORIES.DESIGN,
            experience_level: EXPERIENCE_LEVELS.MID
        },
        applicant: {
            full_name: 'Sarah Johnson',
            email: 'sarah.j@email.com',
            avatar_url: 'https://randomuser.me/api/portraits/women/2.jpg',
            experience_years: 3,
            current_salary: 60000
        },
        status: APPLICATION_STATUS.INTERVIEW_SCHEDULED,
        applied_date: '2024-03-14',
        resume_url: 'resume2.pdf',
        cover_letter: 'With my experience in design...',
        skills: ['Figma', 'Adobe XD', 'Sketch', 'User Research'],
        interview_date: '2024-03-20',
        expected_salary: 70000
    },
    // ... Add more mock data with different combinations
];

const RecruitScreen = ({ navigation }) => {
    // States for filters
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filters, setFilters] = useState({
        status: null,
        category: null,
        experienceLevel: null,
        searchQuery: '',
        salaryRange: { min: null, max: null },
        dateRange: { start: null, end: null }
    });

    // Filtered applications using useMemo for performance
    const filteredApplications = useMemo(() => {
        return MOCK_APPLICATIONS.filter(app => {
            // Status filter
            if (filters.status && app.status !== filters.status) return false;

            // Category filter
            if (filters.category && app.job_posting.category !== filters.category) return false;

            // Experience level filter
            if (filters.experienceLevel && app.job_posting.experience_level !== filters.experienceLevel) return false;

            // Search query
            if (filters.searchQuery) {
                const query = filters.searchQuery.toLowerCase();
                const searchable = [
                    app.applicant.full_name,
                    app.job_posting.title,
                    ...app.skills
                ].join(' ').toLowerCase();
                if (!searchable.includes(query)) return false;
            }

            // Salary range
            if (filters.salaryRange.min && app.expected_salary < filters.salaryRange.min) return false;
            if (filters.salaryRange.max && app.expected_salary > filters.salaryRange.max) return false;

            // Date range
            if (filters.dateRange.start || filters.dateRange.end) {
                const appDate = new Date(app.applied_date);
                if (filters.dateRange.start && appDate < new Date(filters.dateRange.start)) return false;
                if (filters.dateRange.end && appDate > new Date(filters.dateRange.end)) return false;
            }

            return true;
        });
    }, [filters]);

    // Components
    const Header = () => (
        <View style={styles.headerWrapper}>
            <View style={styles.headerContainer}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.openDrawer()}>
                        <Ionicons name="menu-outline" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Recruitment Management</Text>
                </View>
                <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
                    <View style={styles.filterButton}>
                        <Ionicons name="filter" size={20} color="#007AFF" />
                        {Object.values(filters).some(v => v !== null && v !== '') && (
                            <View style={styles.filterBadge} />
                        )}
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search applications..."
                    value={filters.searchQuery}
                    onChangeText={(text) => setFilters(prev => ({ ...prev, searchQuery: text }))}
                />
            </View>
        </View>
    );

    const Statistics = () => (
        <View style={styles.statsContainer}>
            <View style={styles.statCard}>
                <Text style={styles.statNumber}>{filteredApplications.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                    {filteredApplications.filter(app => app.status === APPLICATION_STATUS.APPLIED).length}
                </Text>
                <Text style={styles.statLabel}>New</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                    {filteredApplications.filter(app => app.status === APPLICATION_STATUS.INTERVIEW_SCHEDULED).length}
                </Text>
                <Text style={styles.statLabel}>Interviews</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                    {filteredApplications.filter(app => app.status === APPLICATION_STATUS.HIRED).length}
                </Text>
                <Text style={styles.statLabel}>Hired</Text>
            </View>
        </View>
    );

    const FilterModal = () => (
        <Modal
            visible={filterModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setFilterModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filter Applications</Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity 
                                onPress={() => {
                                    setFilters({
                                        status: null,
                                        category: null,
                                        experienceLevel: null,
                                        searchQuery: '',
                                        salaryRange: { min: null, max: null },
                                        dateRange: { start: null, end: null }
                                    });
                                }}
                                style={styles.resetButton}
                            >
                                <Text style={styles.resetButtonText}>Reset</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.filterSection}>
                        <Text style={styles.filterSectionTitle}>Status</Text>
                        <View style={styles.filterOptions}>
                            {Object.values(APPLICATION_STATUS).map((status) => (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.filterChip,
                                        filters.status === status && styles.filterChipSelected
                                    ]}
                                    onPress={() => setFilters(prev => ({
                                        ...prev,
                                        status: prev.status === status ? null : status
                                    }))}
                                >
                                    <Text style={[
                                        styles.filterChipText,
                                        filters.status === status && styles.filterChipTextSelected
                                    ]}>{status}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.filterSection}>
                        <Text style={styles.filterSectionTitle}>Job Category</Text>
                        <View style={styles.filterOptions}>
                            {Object.values(JOB_CATEGORIES).map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    style={[
                                        styles.filterChip,
                                        filters.category === category && styles.filterChipSelected
                                    ]}
                                    onPress={() => setFilters(prev => ({
                                        ...prev,
                                        category: prev.category === category ? null : category
                                    }))}
                                >
                                    <Text style={[
                                        styles.filterChipText,
                                        filters.category === category && styles.filterChipTextSelected
                                    ]}>{category}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.filterSection}>
                        <Text style={styles.filterSectionTitle}>Experience Level</Text>
                        <View style={styles.filterOptions}>
                            {Object.values(EXPERIENCE_LEVELS).map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    style={[
                                        styles.filterChip,
                                        filters.experienceLevel === level && styles.filterChipSelected
                                    ]}
                                    onPress={() => setFilters(prev => ({
                                        ...prev,
                                        experienceLevel: prev.experienceLevel === level ? null : level
                                    }))}
                                >
                                    <Text style={[
                                        styles.filterChipText,
                                        filters.experienceLevel === level && styles.filterChipTextSelected
                                    ]}>{level}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const ApplicationCard = ({ item }) => (
        <TouchableOpacity 
            style={styles.applicationCard}
            onPress={() => navigation.navigate('ApplicationDetail', { application: item })}
        >
            <View style={styles.cardHeader}>
                <Image 
                    source={{ uri: item.applicant.avatar_url }} 
                    style={styles.avatar}
                />
                <View style={styles.cardHeaderInfo}>
                    <Text style={styles.applicantName}>{item.applicant.full_name}</Text>
                    <Text style={styles.jobTitle}>{item.job_posting.title}</Text>
                    <Text style={styles.companyName}>{item.job_posting.company_name}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>
            <View style={styles.cardBody}>
                <View style={styles.cardRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.cardText}>Applied: {formatDate(item.applied_date)}</Text>
                </View>
                {item.interview_date && (
                    <View style={styles.cardRow}>
                        <Ionicons name="time-outline" size={16} color="#666" />
                        <Text style={styles.cardText}>Interview: {formatDate(item.interview_date)}</Text>
                    </View>
                )}
                <View style={styles.skillsContainer}>
                    {item.skills.map((skill, index) => (
                        <View key={index} style={styles.skillChip}>
                            <Text style={styles.skillText}>{skill}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </TouchableOpacity>
    );

    // Helper Functions
    const getStatusColor = (status) => {
        const colors = {
            [APPLICATION_STATUS.APPLIED]: '#007AFF',
            [APPLICATION_STATUS.RESUME_SCREENING]: '#5856D6',
            [APPLICATION_STATUS.INTERVIEW_SCHEDULED]: '#FF9500',
            [APPLICATION_STATUS.INTERVIEW_COMPLETED]: '#34C759',
            [APPLICATION_STATUS.OFFERED]: '#FF2D55',
            [APPLICATION_STATUS.REJECTED]: '#FF3B30',
            [APPLICATION_STATUS.HIRED]: '#30B0C7',
            [APPLICATION_STATUS.WITHDRAWN]: '#8E8E93',
        };
        return colors[status] || '#8E8E93';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <FlatList
                data={filteredApplications}
                renderItem={({ item }) => <ApplicationCard item={item} />}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.applicationsList}
                ListHeaderComponent={Statistics}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search" size={48} color="#666" />
                        <Text style={styles.emptyText}>No applications found</Text>
                        <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
                    </View>
                )}
            />
            <FilterModal />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    headerWrapper: {
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        paddingHorizontal: 16,
        backgroundColor: '#F2F2F7',
        margin: 16,
        borderRadius: 10,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
    },
    filterButton: {
        position: 'relative',
        padding: 8,
    },
    filterBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF3B30',
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    applicationCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        margin: 16,
        marginTop: 0,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    cardHeaderInfo: {
        flex: 1,
        marginLeft: 12,
    },
    applicantName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    jobTitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    companyName: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    cardBody: {
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
        paddingTop: 12,
        gap: 8,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cardText: {
        fontSize: 14,
        color: '#666',
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    skillChip: {
        backgroundColor: '#F2F2F7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    skillText: {
        fontSize: 12,
        color: '#666',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    resetButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    resetButtonText: {
        color: '#FF3B30',
        fontSize: 16,
    },
    filterSection: {
        marginBottom: 24,
    },
    filterSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    filterOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        backgroundColor: '#fff',
    },
    filterChipSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    filterChipText: {
        fontSize: 14,
        color: '#000',
    },
    filterChipTextSelected: {
        color: '#fff',
    },
    applicationsList: {
        paddingBottom: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
    },
});

export default RecruitScreen;
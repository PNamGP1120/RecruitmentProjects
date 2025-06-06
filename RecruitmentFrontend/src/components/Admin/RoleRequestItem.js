// src/components/Admin/RoleRequestItem.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Avatar } from 'react-native-paper';

const RoleRequestItem = ({ request, onApprove, onReject, selected, onSelect }) => {
  return (
    <Card 
      style={[styles.card, selected && styles.selectedCard]} 
      onPress={onSelect}
    >
      <Card.Content>
        <View style={styles.headerContainer}>
          <View style={styles.userContainer}>
            <Avatar.Image 
              size={40} 
              source={request.user.avatar_url ? { uri: request.user.avatar_url } : require('../../../assets/default-avatar.png')} 
            />
            <View style={styles.userInfo}>
              <Title style={styles.username}>{request.user.username}</Title>
              <Paragraph style={styles.email}>{request.user.email}</Paragraph>
            </View>
          </View>
          
          <Chip mode="outlined" style={styles.roleChip}>
            {request.role}
          </Chip>
        </View>
        
        {request.user.company_name && (
          <Paragraph style={styles.companyName}>
            Công ty: {request.user.company_name}
          </Paragraph>
        )}
        
        <Paragraph style={styles.requestDate}>
          Ngày yêu cầu: {new Date(request.created_at).toLocaleDateString()}
        </Paragraph>
      </Card.Content>
      
      <Card.Actions style={styles.actionsContainer}>
        <Button 
          mode="contained" 
          onPress={() => onApprove(request.id)}
          style={styles.approveButton}
        >
          Duyệt
        </Button>
        <Button 
          mode="outlined" 
          onPress={() => onReject(request.id)}
          style={styles.rejectButton}
        >
          Từ chối
        </Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#1976D2',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  username: {
    fontSize: 16,
    marginBottom: 0,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  roleChip: {
    backgroundColor: '#e3f2fd',
  },
  companyName: {
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: '#666',
  },
  actionsContainer: {
    justifyContent: 'flex-end',
  },
  approveButton: {
    backgroundColor: '#4caf50',
    marginRight: 8,
  },
  rejectButton: {
    borderColor: '#f44336',
  },
});

export default RoleRequestItem;
import React from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import CredentialCard from './CredentialCard';

type CredentialListProps = {
  credentials: any[]; // Array of credentials
  loading?: boolean; // Optional loading state
  onRemoveCredential: (id: string) => void;
};

const CredentialList = ({credentials, loading, onRemoveCredential}: CredentialListProps) => {
  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Loading credentials...</Text>
      </View>
    );
  }

  if (!credentials || credentials.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No credentials found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={credentials}
      keyExtractor={item => item.id}
      renderItem={({item}) => (
        <CredentialCard
          credential={item}
          onRemove={onRemoveCredential}
        />
      )}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      initialNumToRender={10}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default CredentialList;

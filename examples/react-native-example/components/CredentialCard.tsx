import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

type CredentialCardProps = {
  credential: any; // Using 'any' type for simplicity, but this should be properly typed based on the credential structure
  onRemove: (id: string) => void;
};

const CredentialCard = ({credential, onRemove}: CredentialCardProps) => {
  // Extract relevant information from the credential
  const credentialName = credential.name || 'Credential';
  const issuerName = credential.issuer?.name || 'Unknown Issuer';
  const issuanceDate = credential.issuanceDate
    ? new Date(credential.issuanceDate).toLocaleDateString()
    : 'Unknown Date';
  
  // Extract subject information if available
  const subjectName = credential.credentialSubject?.name || 'No Name';

  const handleRemove = () => {
    if (credential.id) {
      onRemove(credential.id);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{credentialName}</Text>
        <Text style={styles.subject}>{subjectName}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>Issuer:</Text>
        <Text style={styles.value}>{issuerName}</Text>
        
        <Text style={styles.label}>Issued Date:</Text>
        <Text style={styles.value}>{issuanceDate}</Text>

        <Text style={styles.label}>Type:</Text>
        <Text style={styles.value}>
          {Array.isArray(credential.type) 
            ? credential.type.filter((t: string) => t !== 'VerifiableCredential').join(', ') 
            : credential.type || 'Unknown Type'}
        </Text>
      </View>
      {credential.prettyVC && (
        <View style={styles.prettyPreview}>
          <Text style={styles.previewText}>Pretty Credential Preview Available</Text>
        </View>
      )}
      <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subject: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '500',
  },
  content: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 4,
  },
  prettyPreview: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  previewText: {
    color: '#2980b9',
    fontWeight: '500',
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default CredentialCard; 
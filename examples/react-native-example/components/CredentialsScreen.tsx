import React, {useEffect, useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {getCredentialProvider} from '@docknetwork/wallet-sdk-react-native/lib/wallet';
import {basicCredential} from '../credentials';
import CredentialList from './CredentialList';

const CredentialsScreen = () => {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Function to load credentials
    const loadCredentials = async () => {
      try {
        setLoading(true);
        const provider = getCredentialProvider();

        // Check if the basic credential exists
        const credentialExist = await provider.getById(basicCredential.id);

        // Add the credential if it doesn't exist
        if (!credentialExist) {
          await provider.addCredential(basicCredential);
          console.log('Basic credential added to the wallet');
        } else {
          console.log('Credential already exists in the wallet');
        }

        // Get all credentials
        const allCredentials = await provider.getCredentials();
        setCredentials(allCredentials);
        console.log('Loaded credentials:', allCredentials.length);
      } catch (error) {
        console.error('Error loading credentials:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCredentials();
  }, []);

  // Add another sample credential
  const addAnotherCredential = async () => {
    try {
      setLoading(true);
      const provider = getCredentialProvider();

      // Create a modified version of the basic credential with a different ID
      const anotherCredential = {
        ...basicCredential,
        id: `${basicCredential.id}-copy-${Date.now()}`,
        name: 'Sample Credential Copy',
        credentialSubject: {
          ...basicCredential.credentialSubject,
          name: 'Another Test Credential',
        },
      };

      await provider.addCredential(anotherCredential);

      // Refresh the credentials list
      const updatedCredentials = await provider.getCredentials();
      setCredentials(updatedCredentials);

      console.log('Added another credential');
    } catch (error) {
      console.error('Error adding another credential:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle removing a credential
  const handleRemoveCredential = async (id: string) => {
    try {
      setLoading(true);
      const provider = getCredentialProvider();

      await provider.removeCredential(id);
      console.log('Removed credential with ID:', id);

      // Refresh the credentials list
      const updatedCredentials = await provider.getCredentials();
      setCredentials(updatedCredentials);
    } catch (error) {
      console.error('Error removing credential:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={addAnotherCredential}
      >
        <Text style={styles.addButtonText}>Add New Credential</Text>
      </TouchableOpacity>

      <CredentialList
        credentials={credentials}
        loading={loading}
        onRemoveCredential={handleRemoveCredential}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  addButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CredentialsScreen;

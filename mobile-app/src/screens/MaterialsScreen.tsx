// Materials Screen
import React from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking 
} from 'react-native';
import { useMaterials } from '@/hooks/useMaterials';
import { MaterialItem } from '@/components/MaterialItem';
import { Material } from '@/types/material';
import { api } from '@/services/api';

interface MaterialsScreenProps {
  eventId: string;
  onBack: () => void;
}

export function MaterialsScreen({ eventId, onBack }: MaterialsScreenProps) {
  const { data: materialsData, isLoading, refetch } = useMaterials(eventId);
  const [downloading, setDownloading] = React.useState<string | null>(null);

  const materials = materialsData?.materials || materialsData || [];

  const handleDownload = async (material: Material) => {
    setDownloading(material.id);
    try {
      const result = await api.getDownloadUrl(material.id);
      if (result.download_url) {
        Linking.openURL(result.download_url);
      }
    } catch (error: any) {
      if (error.response?.data?.message?.includes('already downloaded')) {
        // Allow viewing even if already tracked
        if (material.file_url) {
          Linking.openURL(material.file_url);
        }
      } else {
        Alert.alert('Error', 'Failed to download material');
      }
    }
    setDownloading(null);
  };

  const renderMaterial = ({ item }: { item: Material }) => (
    <MaterialItem 
      material={item} 
      onDownload={handleDownload}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>📚 Materials</Text>
        <Text style={styles.subtitle}>
          {materials.length} resource{materials.length !== 1 ? 's' : ''} available
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Loading materials...</Text>
        </View>
      ) : (
        <FlatList
          data={materials}
          renderItem={renderMaterial}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📄</Text>
              <Text style={styles.emptyText}>No materials available</Text>
              <Text style={styles.emptySubtext}>
                The instructor hasn't uploaded any materials yet
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    paddingBottom: 8,
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    color: '#0ea5e9',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  list: {
    padding: 20,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

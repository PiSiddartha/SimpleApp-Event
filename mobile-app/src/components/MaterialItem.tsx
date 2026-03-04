// Material Item Component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Material } from '@/types/material';

interface MaterialItemProps {
  material: Material;
  onDownload: (material: Material) => void;
}

export function MaterialItem({ material, onDownload }: MaterialItemProps) {
  const getFileIcon = (fileType?: string) => {
    if (!fileType) return '📄';
    if (fileType.includes('pdf')) return '📕';
    if (fileType.includes('word') || fileType.includes('document')) return '📘';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📙';
    if (fileType.includes('video')) return '🎬';
    if (fileType.includes('zip') || fileType.includes('archive')) return '📦';
    return '📄';
  };

  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>{getFileIcon(material.file_type)}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{material.title}</Text>
        <Text style={styles.type}>{material.file_type || 'File'}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.downloadButton}
        onPress={() => onDownload(material)}
      >
        <Text style={styles.downloadText}>⬇️</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  type: {
    fontSize: 13,
    color: '#9ca3af',
    textTransform: 'capitalize',
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadText: {
    fontSize: 18,
  },
});

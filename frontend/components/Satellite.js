import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Satellite = ({ mapRef, colors, onMapTypeChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMapType, setSelectedMapType] = useState('standard');
  const { isDark } = useTheme();

  const mapTypes = [
    { 
      id: 'standard', 
      name: 'Standard', 
      icon: 'map',
      description: 'Regular road map',
      mapType: 'standard'
    },
    { 
      id: 'satellite', 
      name: 'Satellite', 
      icon: 'globe',
      description: 'Real satellite imagery',
      mapType: 'satellite'
    },
    { 
      id: 'hybrid', 
      name: 'Hybrid', 
      icon: 'layers',
      description: 'Satellite with labels',
      mapType: 'hybrid'
    },
    { 
      id: 'terrain', 
      name: 'Terrain', 
      icon: 'map',
      description: 'Elevation & terrain',
      mapType: 'terrain'
    }
  ];

  const changeMapType = (mapTypeId, mapTypeValue) => {
    setSelectedMapType(mapTypeId);
    // Use the callback to update map type in parent
    if (onMapTypeChange) {
      onMapTypeChange(mapTypeValue);
    }
    setModalVisible(false);
  };

  return (
    <>
      {/* Satellite FAB Button */}
      <TouchableOpacity
        style={[
          styles.satelliteFab, 
          { 
            backgroundColor: colors.background[1], 
            borderColor: colors.glassBorder, 
            borderWidth: 1 
          }
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="map" size={22} color={colors.primary} />
      </TouchableOpacity>

      {/* Map Type Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={[
            styles.satelliteModalContent,
            { 
              backgroundColor: colors.background[1], 
              borderColor: colors.glassBorder,
              borderWidth: 1
            }
          ]}>
            <View style={styles.satelliteHeader}>
              <Text style={[styles.satelliteTitle, { color: colors.textMain }]}>
                Map Style
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {mapTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.mapTypeOption,
                  selectedMapType === type.id && { 
                    backgroundColor: colors.primary + '20',
                    borderColor: colors.primary,
                    borderWidth: 1
                  }
                ]}
                onPress={() => changeMapType(type.id, type.mapType)}
              >
                <View style={styles.mapTypeIcon}>
                  <Ionicons 
                    name={type.icon} 
                    size={28} 
                    color={selectedMapType === type.id ? colors.primary : colors.textSecondary} 
                  />
                </View>
                <View style={styles.mapTypeInfo}>
                  <Text style={[styles.mapTypeName, { color: colors.textMain }]}>
                    {type.name}
                  </Text>
                  <Text style={[styles.mapTypeDescription, { color: colors.textSecondary }]}>
                    {type.description}
                  </Text>
                </View>
                {selectedMapType === type.id && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: colors.primary }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = {
  satelliteFab: { 
    position: 'absolute', 
    left: 20, 
    top: 250,  
    width: 52, 
    height: 52, 
    borderRadius: 26, 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 11, 
    elevation: 6, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 4 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  satelliteModalContent: {
    width: '85%',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  satelliteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  satelliteTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  mapTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  mapTypeIcon: {
    width: 50,
    alignItems: 'center',
  },
  mapTypeInfo: {
    flex: 1,
    marginLeft: 10,
  },
  mapTypeName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  mapTypeDescription: {
    fontSize: 12,
  },
  closeButton: {
    marginTop: 15,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
};

export default Satellite;
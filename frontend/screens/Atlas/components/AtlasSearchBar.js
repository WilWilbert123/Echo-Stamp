import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, TextInput, View } from 'react-native';
import GlassCard from '../../../components/GlassCard';
import styles from '../Atlas.styles';

const AtlasSearchBar = ({ 
  insets, colors, isSearching, searchQuery, setSearchQuery, handleSearch 
}) => {
  return (
    <View style={[styles.searchContainer, { top: insets.top + 10 }]}>
      <GlassCard style={[styles.searchBar, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
        {isSearching ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="search" size={20} color={colors.primary} style={{ marginRight: 10 }} />
        )}
        <TextInput
          style={[styles.searchInput, { color: colors.textMain }]}
          placeholder="Search places..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
      </GlassCard>
    </View>
  );
};

export default AtlasSearchBar;
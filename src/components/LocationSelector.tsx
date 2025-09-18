import { useState, useEffect } from 'react';
import { ComboBox, DismissibleTag } from '@carbon/react';
import { listLocations } from '../api/locations';

export interface SelectedLocation {
  id: number;
  name: string;
  type: string;
}

export interface LocationSelectorProps {
  selectedLocations: SelectedLocation[];
  onChange: (locations: SelectedLocation[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const LocationSelector = ({
  selectedLocations,
  onChange,
  placeholder = 'Search and select locations...',
  disabled = false,
}: LocationSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationOptions, setLocationOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLocations = async (search: string = '') => {
    try {
      setLoading(true);
      const response = await listLocations({
        search,
        limit: 20,
        page: 1,
      });

      const options = (response.data || []).map((location: any) => ({
        id: location.id,
        text: `${location.name} (${location.locationType})`,
        value: location.id,
        name: location.name,
        type: location.locationType,
      }));

      setLocationOptions(options);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      setLocationOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleLocationSelect = (selectedItem: any) => {
    if (!selectedItem) return;

    // Check if location is already selected
    const isAlreadySelected = selectedLocations.some(
      (loc) => loc.id === selectedItem.value,
    );

    if (!isAlreadySelected) {
      const newLocation: SelectedLocation = {
        id: selectedItem.value,
        name: selectedItem.name,
        type: selectedItem.type,
      };
      onChange([...selectedLocations, newLocation]);
    }

    // Clear the search after selection
    setSearchTerm('');
  };

  const handleLocationRemove = (locationId: number) => {
    onChange(selectedLocations.filter((loc) => loc.id !== locationId));
  };

  const handleInputChange = (inputValue: string) => {
    setSearchTerm(inputValue);
    if (inputValue.length >= 2 || inputValue.length === 0) {
      fetchLocations(inputValue);
    }
  };

  return (
    <div>
      {/* Selected Locations as Tags */}
      {selectedLocations.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedLocations.map((location) => (
            <DismissibleTag
              key={location.id}
              type="blue"
              size="sm"
              onClose={() => handleLocationRemove(location.id)}
              text={`${location.name} (${location.type})`}
            />
          ))}
        </div>
      )}

      {/* Search ComboBox */}
      <ComboBox
        id="location-selector"
        items={locationOptions}
        itemToString={(item) => (item ? item.text : '')}
        selectedItem={null} // Always null to keep it as a search field
        onChange={({ selectedItem }) => handleLocationSelect(selectedItem)}
        onInputChange={handleInputChange}
        placeholder={placeholder}
        titleText=""
        disabled={disabled || loading}
      />
    </div>
  );
};

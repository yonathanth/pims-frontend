import { useState } from 'react';
import GeneralPageLayout from '../components/GeneralPageLayout';
import SortableTable from '../components/SortableTable';
import {
  Button,
  OverflowMenu,
  OverflowMenuItem,
  ComboBox,
  ComposedModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  InlineNotification,
} from '@carbon/react';
import { Add } from '@carbon/icons-react';
import GenericModal, { type FormField } from '../components/GenericModal';
import { useLocationsTable } from '../hooks/useLocationsTable';
import type {
  CreateLocationInput,
  UpdateLocationInput,
} from '../types/location';

// Define location headers for the table
const locationHeaders = [
  { key: 'name', header: 'Location Name' },
  { key: 'type', header: 'Type' },
  { key: 'maxCapacity', header: 'Max Capacity' },
  { key: 'actions', header: 'Actions' },
];

const LocationsPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLocation, setEditLocation] = useState<any | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLocation, setDeleteLocation] = useState<any | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [locationType, setLocationTypeForm] = useState('storage');

  const {
    locations,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    q,
    setQ,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    locationType: locationTypeFilter,
    setLocationType,
    totalItems,
    addLocation,
    editLocation: updateLocation,
    removeLocation,
    clearError,
  } = useLocationsTable();

  const resetForm = () => {
    setName('');
    setDescription('');
    setMaxCapacity('');
    setLocationTypeForm('storage');
  };

  const handleAddLocation = async () => {
    const res = await addLocation({
      name,
      description: description || undefined,
      max_capacity: maxCapacity ? parseInt(maxCapacity, 10) : undefined,
      location_type: locationType,
    } as CreateLocationInput);

    if (res.ok) {
      setShowError(null);
      setShowAddModal(false);
      setShowSuccess(true);
      setPage(1);
      resetForm();
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setShowError(res.message);
    }
  };

  const handleEditLocation = async () => {
    if (!editLocation) return;
    const res = await updateLocation(editLocation.id, {
      name: editLocation.name,
      description: editLocation.description,
      max_capacity: editLocation.maxCapacity,
      location_type: editLocation.type,
    } as UpdateLocationInput);

    if (res.ok) {
      setShowError(null);
      setShowEditModal(false);
      setEditLocation(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setShowError(res.message);
    }
  };

  const handleDeleteLocation = async () => {
    if (!deleteLocation) return;
    const res = await removeLocation(deleteLocation.id);

    if (res.ok) {
      setShowError(null);
      setShowDeleteModal(false);
      setDeleteLocation(null);
    } else {
      setShowError(res.message);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    resetForm();
    setShowError(null);
    clearError();
  };

  const renderExpandedRow = (rowData: any) => (
    <div className="p-6">
      <h4 className="font-semibold text-lg mb-3">Location Details</h4>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p>
            <span className="font-medium">Name:</span> {rowData.name}
          </p>
          <p>
            <span className="font-medium">Type:</span> {rowData.type}
          </p>
        </div>
        <div>
          <p>
            <span className="font-medium">Max Capacity:</span>{' '}
            {rowData.maxCapacity || 'N/A'}
          </p>
        </div>
      </div>
      {rowData.description && (
        <div className="mt-4">
          <p>
            <span className="font-medium">Description:</span>{' '}
            {rowData.description}
          </p>
        </div>
      )}
    </div>
  );

  const renderActionsMenu = (row: any) => (
    <OverflowMenu aria-label="overflow-menu">
      <OverflowMenuItem
        itemText="Edit"
        onClick={() => {
          setShowError(null);
          setEditLocation({ ...row });
          setShowEditModal(true);
        }}
      />
      <OverflowMenuItem
        itemText="Delete"
        onClick={() => {
          setShowError(null);
          setDeleteLocation(row);
          setShowDeleteModal(true);
        }}
      />
    </OverflowMenu>
  );

  const locationTypeOptions = [
    { text: 'All Types', value: '' },
    { text: 'Storage', value: 'storage' },
    { text: 'Dispensary', value: 'dispensary' },
    { text: 'Quarantine', value: 'quarantine' },
    { text: 'Office', value: 'office' },
    { text: 'Shelf', value: 'shelf' },
    { text: 'Fridge', value: 'fridge' },
    { text: 'Others', value: 'others' },
  ];

  const modalFields: FormField[] = [
    {
      key: 'name',
      label: 'Location Name',
      type: 'text',
      value: name,
      onChange: (value) => setName(value as string),
      placeholder: 'Enter location name',
      required: true,
    },
    {
      key: 'type',
      label: 'Location Type',
      type: 'dropdown',
      value: locationType,
      onChange: (value) => setLocationTypeForm(value as string),
      options: [
        { text: 'Storage', value: 'storage' },
        { text: 'Dispensary', value: 'dispensary' },
        { text: 'Quarantine', value: 'quarantine' },
        { text: 'Office', value: 'office' },
        { text: 'Shelf', value: 'shelf' },
        { text: 'Fridge', value: 'fridge' },
        { text: 'Others', value: 'others' },
      ],
      required: true,
    },
    {
      key: 'maxCapacity',
      label: 'Max Capacity',
      type: 'number',
      value: maxCapacity,
      onChange: (value) => setMaxCapacity(value as string),
      placeholder: 'Enter max capacity',
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      value: description,
      onChange: (value) => setDescription(value as string),
      placeholder: 'Enter description',
    },
  ];

  return (
    <GeneralPageLayout
      breadcrumbItems={[
        { label: 'PIMS', href: '/' },
        { label: 'Location Management', href: '/dashboard/locations' },
        { label: 'Locations', isCurrentPage: true },
      ]}
      title=""
      showExportButton={false}
      showSuccessNotification={showSuccess}
      successMessage="Location operation completed successfully"
      onCloseNotification={() => setShowSuccess(false)}
    >
      <SortableTable<any>
        title="Manage Locations"
        headers={locationHeaders}
        data={locations}
        filterOptions={[]}
        searchField="name"
        searchPlaceholder="Search (Name, Type, Description)"
        expandedRowContent={renderExpandedRow}
        searchActions={
          <div className="flex items-center gap-3">
            <div className="min-w-64">
              <ComboBox
                id="location-type-filter"
                items={locationTypeOptions}
                itemToString={(item) => (item ? item.text : '')}
                initialSelectedItem={{
                  text: locationTypeFilter
                    ? locationTypeOptions.find(
                        (opt) => opt.value === locationTypeFilter,
                      )?.text || 'All Types'
                    : 'All Types',
                  value: locationTypeFilter || '',
                }}
                onChange={({ selectedItem }) => {
                  const value = selectedItem?.value || '';
                  setLocationType(value || undefined);
                  setPage(1);
                }}
                placeholder="Filter by type..."
                titleText=""
              />
            </div>
            <Button
              kind="primary"
              size="md"
              renderIcon={Add}
              onClick={() => {
                setShowError(null);
                setShowAddModal(true);
              }}
            >
              Add Location
            </Button>
          </div>
        }
        controlled={{
          page,
          pageSize: limit,
          totalItems,
          onPageChange: (p) => setPage(p),
          onPageSizeChange: (s) => setLimit(s),
          sortColumn: sortBy,
          sortDirection: sortDir.toUpperCase() as 'ASC' | 'DESC',
          onSort: (col, dir) => {
            const allowed = ['name', 'locationType', 'maxCapacity'] as const;
            const mapped = col === 'type' ? 'locationType' : col;
            if (!(allowed as readonly string[]).includes(mapped as any)) return;
            setSortBy(mapped as any);
            setSortDir(dir.toLowerCase() as 'asc' | 'desc');
          },
          search: q,
          onSearchChange: (value) => setQ(value),
          activeFilter: 'All',
          onFilterChange: () => {},
          sortableKeys: ['name', 'type', 'maxCapacity'],
        }}
        renderCell={(row, key) =>
          key === 'actions' ? renderActionsMenu(row) : (row as any)[key]
        }
      />
      {loading && (
        <div
          className="px-6 py-2 text-sm"
          style={{ color: 'var(--cds-text-secondary)' }}
        >
          Loading locations...
        </div>
      )}
      {(error || showError) &&
        !showAddModal &&
        !showEditModal &&
        !showDeleteModal && (
          <div className="mx-6 mb-4">
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={(showError || error) as string}
              hideCloseButton={false}
              onCloseButtonClick={() => setShowError(null)}
            />
          </div>
        )}

      <GenericModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSubmit={handleAddLocation}
        title="Add Location"
        submitButtonText="Add Location"
        fields={modalFields}
        errorMessage={showError}
        onClearError={() => setShowError(null)}
      />

      <GenericModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setShowError(null);
          clearError();
        }}
        onSubmit={handleEditLocation}
        title="Edit Location"
        submitButtonText="Save Changes"
        fields={
          editLocation
            ? [
                {
                  key: 'name',
                  label: 'Location Name',
                  type: 'text',
                  value: editLocation.name,
                  onChange: (v) =>
                    setEditLocation({ ...editLocation, name: v as string }),
                  required: true,
                },
                {
                  key: 'type',
                  label: 'Location Type',
                  type: 'dropdown',
                  value: editLocation.type,
                  onChange: (v) =>
                    setEditLocation({ ...editLocation, type: v as string }),
                  options: [
                    { text: 'Storage', value: 'storage' },
                    { text: 'Dispensary', value: 'dispensary' },
                    { text: 'Quarantine', value: 'quarantine' },
                    { text: 'Office', value: 'office' },
                    { text: 'Shelf', value: 'shelf' },
                    { text: 'Fridge', value: 'fridge' },
                    { text: 'Others', value: 'others' },
                  ],
                  required: true,
                },
                {
                  key: 'maxCapacity',
                  label: 'Max Capacity',
                  type: 'number',
                  value: String(editLocation.maxCapacity || ''),
                  onChange: (v) =>
                    setEditLocation({
                      ...editLocation,
                      maxCapacity: v ? parseInt(v as string, 10) : null,
                    }),
                },
                {
                  key: 'description',
                  label: 'Description',
                  type: 'textarea',
                  value: editLocation.description || '',
                  onChange: (v) =>
                    setEditLocation({
                      ...editLocation,
                      description: v as string,
                    }),
                },
              ]
            : []
        }
        errorMessage={showError}
        onClearError={() => setShowError(null)}
      />

      <ComposedModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setShowError(null);
          clearError();
        }}
      >
        <ModalHeader label="" title="Delete Location" />
        <ModalBody>
          <div>
            <p className="mb-4">
              Are you sure you want to delete <b>{deleteLocation?.name}</b>?
            </p>
            {showError && (
              <InlineNotification
                kind="error"
                title="Cannot Delete Location"
                subtitle={showError}
                hideCloseButton={false}
                onCloseButtonClick={() => setShowError(null)}
              />
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button kind="danger" onClick={handleDeleteLocation}>
            Delete
          </Button>
        </ModalFooter>
      </ComposedModal>
    </GeneralPageLayout>
  );
};

export default LocationsPage;

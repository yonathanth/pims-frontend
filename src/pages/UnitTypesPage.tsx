import { useState } from 'react';
import GeneralPageLayout from '../components/GeneralPageLayout';
import SortableTable from '../components/SortableTable';
import {
  Button,
  OverflowMenu,
  OverflowMenuItem,
  ComposedModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  InlineNotification,
} from '@carbon/react';
import { Add } from '@carbon/icons-react';
import GenericModal, { type FormField } from '../components/GenericModal';
import { unitTypeHeaders } from '../data/unitTypeData';
import { useUnitTypes } from '../hooks/useUnitTypes';

const UnitTypesPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);
  const {
    unitTypes,
    loading,
    error,
    addUnitType,
    editUnitType,
    removeUnitType,
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
    totalItems,
    clearError,
  } = useUnitTypes();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUnitType, setEditingUnitType] = useState<any | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUnitType, setDeleteUnitType] = useState<any | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
  };

  const handleAddUnitType = async () => {
    const res = await addUnitType({
      name,
      description: description || undefined,
      isActive: true, // Always set to active
    });
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

  const handleCloseModal = () => {
    setShowAddModal(false);
    resetForm();
    setShowError(null);
    clearError();
  };

  const handleEditUnitType = async () => {
    if (!editingUnitType) return;
    const res = await editUnitType(Number(editingUnitType.id), {
      name: editingUnitType.name,
      description: editingUnitType.fullDescription,
      isActive: true, // Always set to active
    });
    if (res.ok) {
      setShowError(null);
      setShowEditModal(false);
      setEditingUnitType(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setShowError(res.message);
    }
  };

  const handleDeleteUnitType = async () => {
    if (!deleteUnitType) return;
    const res = await removeUnitType(deleteUnitType.id);
    if (res.ok) {
      setShowError(null);
      setShowDeleteModal(false);
      setDeleteUnitType(null);
    } else {
      setShowError(res.message);
    }
  };

  const renderExpandedRow = (rowData: any) => (
    <div className="p-6">
      <h4 className="font-semibold text-lg mb-3">Description</h4>
      <p style={{ color: 'var(--cds-text-secondary)' }}>
        {rowData.fullDescription || 'No description provided'}
      </p>
    </div>
  );

  const modalFields: FormField[] = [
    {
      key: 'name',
      label: 'Unit Type Name',
      type: 'text',
      value: name,
      onChange: (value) => setName(value as string),
      placeholder: 'Enter unit type name (e.g., TABS, VIAL)',
      required: true,
      autoComplete: 'off',
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      value: description,
      onChange: (value) => setDescription(value as string),
      placeholder: 'Enter unit type description',
    },
  ];

  const renderActionsMenu = (row: any) => (
    <OverflowMenu aria-label="overflow-menu">
      <OverflowMenuItem
        itemText="Edit"
        onClick={() => {
          setShowError(null);
          setEditingUnitType({ ...row, fullDescription: row.description });
          setShowEditModal(true);
        }}
      />
      <OverflowMenuItem
        itemText="Delete"
        onClick={() => {
          setShowError(null);
          setDeleteUnitType(row);
          setShowDeleteModal(true);
        }}
      />
    </OverflowMenu>
  );

  // Format data for table display
  const formattedUnitTypes = unitTypes.map((ut) => ({
    ...ut,
    fullDescription: ut.description,
    isActive: ut.isActive ? 'Active' : 'Inactive',
  }));

  return (
    <GeneralPageLayout
      breadcrumbItems={[
        { label: 'PIMS', href: '/' },
        { label: 'Inventory Management', href: '/dashboard/inventory' },
        { label: 'Unit Types', isCurrentPage: true },
      ]}
      title=""
      showExportButton={false}
      showSuccessNotification={showSuccess}
      successMessage="Unit type has been added successfully"
      onCloseNotification={() => setShowSuccess(false)}
    >
      <SortableTable<any>
        title="Unit Types"
        headers={unitTypeHeaders}
        data={formattedUnitTypes}
        filterOptions={[]}
        searchField="name"
        searchPlaceholder="Search (Name)"
        expandedRowContent={renderExpandedRow}
        searchActions={
          <Button
            kind="primary"
            size="md"
            renderIcon={Add}
            onClick={() => {
              setShowError(null);
              setShowAddModal(true);
            }}
          >
            Add Unit Type
          </Button>
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
            const allowed = ['name', 'batchCount', 'id', 'createdAt'] as const;
            const mapped = col === 'batchCount' ? 'batchCount' : col;
            if (!(allowed as readonly string[]).includes(mapped)) return;
            setSortBy(mapped as any);
            setSortDir(dir.toLowerCase() as 'asc' | 'desc');
            setPage(1);
          },
          search: q,
          onSearchChange: (value) => setQ(value),
          activeFilter: 'All',
          onFilterChange: () => {},
          sortableKeys: ['id', 'name', 'batchCount'],
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
          Loading unit types...
        </div>
      )}
      {(error || showError) && !showAddModal && !showEditModal && (
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
        onSubmit={handleAddUnitType}
        title="Add Unit Type"
        submitButtonText="Add Unit Type"
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
        onSubmit={handleEditUnitType}
        title="Edit Unit Type"
        submitButtonText="Save Changes"
        fields={
          editingUnitType
            ? [
                {
                  key: 'name',
                  label: 'Unit Type Name',
                  type: 'text',
                  value: editingUnitType.name,
                  onChange: (v) =>
                    setEditingUnitType({ ...editingUnitType, name: v as string }),
                  required: true,
                  autoComplete: 'off',
                },
                {
                  key: 'description',
                  label: 'Description',
                  type: 'textarea',
                  value: editingUnitType.fullDescription,
                  onChange: (v) =>
                    setEditingUnitType({
                      ...editingUnitType,
                      fullDescription: v as string,
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
        <ModalHeader label="" title="Delete Unit Type" />
        <ModalBody>
          <div>
            <p className="mb-4">
              Are you sure you want to delete <b>{deleteUnitType?.name}</b>?
            </p>
            {showError && (
              <InlineNotification
                kind="error"
                title="Cannot Delete Unit Type"
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
          <Button kind="danger" onClick={handleDeleteUnitType}>
            Delete
          </Button>
        </ModalFooter>
      </ComposedModal>
    </GeneralPageLayout>
  );
};

export default UnitTypesPage;


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
import { categoryHeaders } from '../data/categoryData';
import { useCategories } from '../hooks/useCategories';

const CategoriesPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);
  const {
    categories,
    loading,
    error,
    addCategory,
    editCategory,
    removeCategory,
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
  } = useCategories();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editCat, setEditCat] = useState<any | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCat, setDeleteCat] = useState<any | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
  };

  const handleAddCategory = async () => {
    const res = await addCategory({
      name,
      description: description || undefined,
    });
    if (res.ok) {
      setShowError(null);
      setShowAddModal(false);
      setShowSuccess(true);
      // After creating, reload first page respecting table default page size
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

  const handleEditCategory = async () => {
    if (!editCat) return;
    const res = await editCategory(editCat.id, {
      name: editCat.name,
      description: editCat.fullDescription,
    });
    if (res.ok) {
      setShowError(null);
      setShowEditModal(false);
      setEditCat(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setShowError(res.message);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCat) return;
    const res = await removeCategory(deleteCat.id);
    if (res.ok) {
      setShowError(null);
      setShowDeleteModal(false);
      setDeleteCat(null);
    } else {
      setShowError(res.message);
    }
  };

  const renderExpandedRow = (rowData: any) => (
    <div className="p-6">
      <h4 className="font-semibold text-lg mb-3">Description</h4>
      <p style={{ color: 'var(--cds-text-secondary)' }}>
        {rowData.fullDescription}
      </p>
    </div>
  );

  const modalFields: FormField[] = [
    {
      key: 'name',
      label: 'Category Name',
      type: 'text',
      value: name,
      onChange: (value) => setName(value as string),
      placeholder: 'Enter category name',
      required: true,
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      value: description,
      onChange: (value) => setDescription(value as string),
      placeholder: 'Enter category description',
    },
  ];

  const renderActionsMenu = (row: any) => (
    <OverflowMenu aria-label="overflow-menu">
      <OverflowMenuItem
        itemText="Edit"
        onClick={() => {
          setShowError(null);
          setEditCat({ ...row, fullDescription: row.fullDescription });
          setShowEditModal(true);
        }}
      />
      <OverflowMenuItem
        itemText="Delete"
        onClick={() => {
          setShowError(null);
          setDeleteCat(row);
          setShowDeleteModal(true);
        }}
      />
    </OverflowMenu>
  );

  return (
    <GeneralPageLayout
      breadcrumbItems={[
        { label: 'PIMS', href: '/' },
        { label: 'Inventory Management', href: '/dashboard/inventory' },
        { label: 'Categories', isCurrentPage: true },
      ]}
      title=""
      showExportButton={true}
      onExportClick={() => console.log('Export clicked')}
      showSuccessNotification={showSuccess}
      successMessage="Category has been added successfully"
      onCloseNotification={() => setShowSuccess(false)}
    >
      <SortableTable<any>
        title="Categories"
        headers={categoryHeaders}
        data={categories}
        filterOptions={[]} // Filters removed per requirement
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
            Add Category
          </Button>
        }
        controlled={{
          page,
          pageSize: limit,
          totalItems,
          onPageChange: (p) => setPage(p),
          onPageSizeChange: (s) => setLimit(s),
          sortColumn: sortBy,
          sortDirection: sortDir,
          onSort: (col, dir) => {
            // Only allow backend-supported columns
            const allowed = ['name', 'drugCount'] as const;
            const mapped = col === 'productsCount' ? 'drugCount' : col;
            if (!(allowed as readonly string[]).includes(mapped)) return;
            setSortBy(mapped as any);
            setSortDir(dir);
          },
          search: q,
          onSearchChange: (value) => setQ(value),
          activeFilter: 'All',
          onFilterChange: () => {},
          sortableKeys: ['name', 'productsCount'],
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
          Loading categories...
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
        onSubmit={handleAddCategory}
        title="Add Category"
        submitButtonText="Add Category"
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
        onSubmit={handleEditCategory}
        title="Edit Category"
        submitButtonText="Save Changes"
        fields={
          editCat
            ? [
                {
                  key: 'name',
                  label: 'Category Name',
                  type: 'text',
                  value: editCat.name,
                  onChange: (v) =>
                    setEditCat({ ...editCat, name: v as string }),
                  required: true,
                },
                {
                  key: 'description',
                  label: 'Description',
                  type: 'textarea',
                  value: editCat.fullDescription,
                  onChange: (v) =>
                    setEditCat({ ...editCat, fullDescription: v as string }),
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
        <ModalHeader label="" title="Delete Category" />
        <ModalBody>
          Are you sure you want to delete <b>{deleteCat?.name}</b>?
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button kind="danger" onClick={handleDeleteCategory}>
            Delete
          </Button>
        </ModalFooter>
      </ComposedModal>
    </GeneralPageLayout>
  );
};

export default CategoriesPage;

import { useState } from 'react';
import GeneralPageLayout from '../components/GeneralPageLayout';
import SortableTable from '../components/SortableTable';
import {
  Button,
  OverflowMenu,
  OverflowMenuItem,
  InlineNotification,
  ComposedModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@carbon/react';
import { Add } from '@carbon/icons-react';
import GenericModal from '../components/GenericModal';
import { productHeaders, type ProductItem } from '../data/productData';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { createDrug, updateDrug, deleteDrug } from '../api/products';
import type { CreateDrugInput, UpdateDrugInput } from '../types/product';

const ProductsPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProductItem, setDeleteProductItem] =
    useState<ProductItem | null>(null);
  const [showError, setShowError] = useState<string | null>(null);

  // Form state
  const [sku, setSku] = useState('');
  const [genericName, setGenericName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [strength, setStrength] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');

  const {
    products,
    loading,
    error,
    refetch,
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
  } = useProducts();

  const { categories } = useCategories({ initialLimit: 1000 });

  const resetForm = () => {
    setSku('');
    setGenericName('');
    setTradeName('');
    setStrength('');
    setDescription('');
    setCategoryId('');
  };

  const handleAddProduct = async () => {
    try {
      if (!categoryId) {
        setShowError('Category is required');
        return;
      }
      const categoryIdNum = Number(categoryId);
      if (isNaN(categoryIdNum) || categoryIdNum <= 0) {
        setShowError('Invalid category ID');
        return;
      }
      await createDrug({
        sku,
        generic_name: genericName,
        trade_name: tradeName || undefined,
        strength,
        description: description || undefined,
        category_id: categoryIdNum,
      } as CreateDrugInput);
      setShowAddModal(false);
      setShowSuccessMessage(true);
      setShowError(null);
      resetForm();
      refetch();
    } catch (err) {
      setShowError((err as any)?.message || String(err));
    }
  };

  const handleEditProduct = async () => {
    if (!editProduct) return;
    try {
      if (!editProduct.categoryId) {
        setShowError('Category is required');
        return;
      }
      const categoryIdNum = Number(editProduct.categoryId);
      if (isNaN(categoryIdNum) || categoryIdNum <= 0) {
        setShowError('Invalid category ID');
        return;
      }
      await updateDrug(Number(editProduct.id), {
        sku: editProduct.sku,
        generic_name: editProduct.name,
        trade_name: editProduct.tradeName || undefined,
        strength: editProduct.strength,
        description: editProduct.description || undefined,
        category_id: categoryIdNum,
      } as UpdateDrugInput);
      setShowEditModal(false);
      setEditProduct(null);
      setShowSuccessMessage(true);
      setShowError(null);
      refetch();
    } catch (err) {
      setShowError((err as any)?.message || String(err));
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductItem) return;
    try {
      await deleteDrug(Number(deleteProductItem.id));
      setShowDeleteModal(false);
      setDeleteProductItem(null);
      setShowError(null);
      refetch();
    } catch (err) {
      setShowError((err as any)?.message || String(err));
    }
  };

  const renderExpandedRow = (rowData: ProductItem) => (
    <div className="p-6">
      <h4 className="font-semibold text-lg mb-3">Description</h4>
      <p style={{ color: 'var(--cds-text-secondary)' }}>
        {rowData.description || 'No description available'}
      </p>
    </div>
  );

  const renderActionsMenu = (row: ProductItem) => (
    <OverflowMenu aria-label="overflow-menu">
      <OverflowMenuItem
        itemText="Edit"
        onClick={() => {
          setEditProduct(row);
          setShowEditModal(true);
        }}
      />
      <OverflowMenuItem
        itemText="Delete"
        onClick={() => {
          setDeleteProductItem(row);
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
        { label: 'Products', isCurrentPage: true },
      ]}
      title=""
      showExportButton={false}
      showSuccessNotification={showSuccessMessage}
      successMessage="Product saved successfully"
      onCloseNotification={() => setShowSuccessMessage(false)}
    >
      <div className="max-w-full">
        <SortableTable<ProductItem>
          title="Manage Products"
          headers={productHeaders}
          data={products}
          filterOptions={[]}
          searchField="name"
          searchPlaceholder="Search (Generic Name, SKU, Trade Name)"
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
              Add Product
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
              const allowed = ['sku', 'genericName', 'tradeName', 'id'] as const;
              const mapped =
                col === 'name'
                  ? 'genericName'
                  : col === 'tradeName'
                    ? 'tradeName'
                    : col;
              if (!(allowed as readonly string[]).includes(mapped as any))
                return;
              setSortBy(mapped as any);
              setSortDir(dir);
              setPage(1); // Reset to first page when sorting changes
            },
            search: q,
            onSearchChange: (value) => setQ(value),
            activeFilter: 'All',
            onFilterChange: () => {},
            sortableKeys: ['id', 'sku', 'name', 'tradeName'],
          }}
          renderCell={(row, key) =>
            key === 'actions' ? renderActionsMenu(row) : (row as any)[key]
          }
        />
      </div>
      {loading && (
        <div
          className="px-6 py-2 text-sm"
          style={{ color: 'var(--cds-text-secondary)' }}
        >
          Loading products...
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
        onClose={() => {
          setShowAddModal(false);
          setShowError(null);
        }}
        onSubmit={handleAddProduct}
        title="Add Product"
        submitButtonText="Add Product"
        errorMessage={showError}
        onClearError={() => setShowError(null)}
        fields={[
          {
            key: 'sku',
            label: 'SKU',
            type: 'text',
            value: sku,
            onChange: (v) => setSku(v as string),
            placeholder: 'Enter SKU',
          },
          {
            key: 'genericName',
            label: 'Generic Name',
            type: 'text',
            value: genericName,
            onChange: (v) => setGenericName(v as string),
            placeholder: 'Enter generic name',
            required: true,
          },
          {
            key: 'tradeName',
            label: 'Trade Name',
            type: 'text',
            value: tradeName,
            onChange: (v) => setTradeName(v as string),
            placeholder: 'Enter trade name (optional)',
          },
          {
            key: 'strength',
            label: 'Strength (mg)',
            type: 'text',
            value: strength,
            onChange: (v) => setStrength(v as string),
            placeholder: 'Enter strength',
            required: true,
          },
          {
            key: 'description',
            label: 'Description',
            type: 'textarea',
            value: description,
            onChange: (v) => setDescription(v as string),
            placeholder: 'Enter description (optional)',
          },
          {
            key: 'categoryId',
            label: 'Category',
            type: 'dropdown',
            value: categoryId,
            onChange: (v) => setCategoryId(v as string),
            placeholder: 'Choose a category',
            required: true,
            options: categories.map((cat) => ({
              value: cat.id,
              text: cat.name,
            })),
          },
        ]}
      />

      <GenericModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setShowError(null);
        }}
        onSubmit={handleEditProduct}
        title="Edit Product"
        submitButtonText="Save Changes"
        errorMessage={showError}
        onClearError={() => setShowError(null)}
        fields={
          editProduct
            ? [
                {
                  key: 'sku',
                  label: 'SKU',
                  type: 'text',
                  value: editProduct.sku,
                  onChange: (value) =>
                    setEditProduct({ ...editProduct, sku: value as string }),
                  placeholder: 'Enter SKU',
                },
                {
                  key: 'genericName',
                  label: 'Generic Name',
                  type: 'text',
                  value: editProduct.name,
                  onChange: (value) =>
                    setEditProduct({ ...editProduct, name: value as string }),
                  placeholder: 'Enter generic name',
                  required: true,
                },
                {
                  key: 'tradeName',
                  label: 'Trade Name',
                  type: 'text',
                  value: editProduct.tradeName,
                  onChange: (value) =>
                    setEditProduct({
                      ...editProduct,
                      tradeName: value as string,
                    }),
                  placeholder: 'Enter trade name (optional)',
                },
                {
                  key: 'strength',
                  label: 'Strength (mg)',
                  type: 'text',
                  value: editProduct.strength,
                  onChange: (value) =>
                    setEditProduct({
                      ...editProduct,
                      strength: value as string,
                    }),
                  placeholder: 'Enter strength',
                  required: true,
                },
                {
                  key: 'description',
                  label: 'Description',
                  type: 'textarea',
                  value: editProduct.description || '',
                  onChange: (value) =>
                    setEditProduct({
                      ...editProduct,
                      description: value as string,
                    }),
                  placeholder: 'Enter description (optional)',
                },
                {
                  key: 'categoryId',
                  label: 'Category',
                  type: 'dropdown',
                  value: String(editProduct.categoryId || ''),
                  onChange: (value) =>
                    setEditProduct({
                      ...editProduct,
                      categoryId: Number(value),
                    }),
                  placeholder: 'Choose a category',
                  required: true,
                  options: categories.map((cat) => ({
                    value: cat.id,
                    text: cat.name,
                  })),
                },
              ]
            : []
        }
      />

      <ComposedModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setShowError(null);
        }}
      >
        <ModalHeader label="" title="Delete Product" />
        <ModalBody>
          <div>
            <p className="mb-4">
              Are you sure you want to delete <b>{deleteProductItem?.name}</b>?
            </p>
            {showError && (
              <InlineNotification
                kind="error"
                title="Cannot Delete Product"
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
          <Button kind="danger" onClick={handleDeleteProduct}>
            Delete
          </Button>
        </ModalFooter>
      </ComposedModal>
    </GeneralPageLayout>
  );
};

export default ProductsPage;


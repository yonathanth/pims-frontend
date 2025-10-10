import { useState } from 'react';
import GeneralPageLayout from '../components/GeneralPageLayout';
import SortableTable from '../components/SortableTable';
import { Button, InlineNotification, ComboBox } from '@carbon/react';
import { Add } from '@carbon/icons-react';
import GenericModal from '../components/GenericModal';
import { productHeaders, type ProductItem } from '../data/productData';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useCategoriesSearch } from '../hooks/useCategoriesSearch';
import { createDrug, updateDrug, deleteDrug } from '../api/products';
import type { CreateDrugInput, UpdateDrugInput } from '../types/product';
import { OverflowMenu, OverflowMenuItem } from '@carbon/react';
import {
  ComposedModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@carbon/react';

const ProductsPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<ProductItem | null>(null);
  const [showError, setShowError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [category, setCategory] = useState('');
  const [strength, setStrength] = useState('');
  const [description, setDescription] = useState('');

  // Category filter state
  const [, setSelectedCategoryFilter] = useState<string>('');

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
    // categoryId,
    setCategoryId,
    totalItems,
  } = useProducts();
  const { categories: categoryRows } = useCategories();
  const { categories: searchableCategories, searchCategories } =
    useCategoriesSearch();

  // Resolve category names using categoryId if available
  const resolvedProducts = products.map((p) => {
    if (p.categoryId) {
      const match = categoryRows.find(
        (c) => Number(c.id) === Number(p.categoryId),
      );
      if (match && p.category !== match.name) {
        return { ...p, category: match.name };
      }
    }
    return p;
  });

  // Keep page mounted during loading to avoid hiding the search bar

  const resetForm = () => {
    setName('');
    setSku('');
    setTradeName('');
    setCategory('');
    setStrength('');
    setDescription('');
  };

  const renderActionsMenu = (row: ProductItem) => (
    <OverflowMenu aria-label="overflow-menu">
      <OverflowMenuItem
        itemText="Edit"
        onClick={() => {
          setShowError(null);
          setEditProduct(row);
          setShowEditModal(true);
        }}
      />
      <OverflowMenuItem
        itemText="Delete"
        onClick={() => {
          setShowError(null);
          setDeleteProduct(row);
          setShowDeleteModal(true);
        }}
      />
    </OverflowMenu>
  );

  // Add Product
  const handleAddProduct = async () => {
    try {
      const selectedCategory = categoryRows.find((c) => c.name === category);
      await createDrug({
        sku: sku.trim() || undefined, // Pass undefined if empty string
        generic_name: name,
        trade_name: tradeName,
        strength,
        description,
        category_id: selectedCategory ? Number(selectedCategory.id) : 1,
      } as CreateDrugInput);
      setShowAddModal(false);
      setShowSuccess(true);
      setShowError(null);
      resetForm();
      refetch();
    } catch (err) {
      setShowError((err as any)?.message || String(err));
    }
  };

  // Edit Product
  const handleEditProduct = async () => {
    if (!editProduct) return;
    try {
      const selectedCategory = categoryRows.find(
        (c) => c.name === editProduct.category,
      );
      await updateDrug(Number(editProduct.id), {
        sku: editProduct.sku || undefined, // Pass undefined if empty string
        generic_name: editProduct.name,
        trade_name: editProduct.tradeName,
        strength: editProduct.strength,
        description: editProduct.description || '',
        category_id: selectedCategory ? Number(selectedCategory.id) : 1,
      } as UpdateDrugInput);
      setShowEditModal(false);
      setEditProduct(null);
      setShowSuccess(true);
      setShowError(null);
      refetch();
    } catch (err) {
      setShowError((err as any)?.message || String(err));
    }
  };

  // Delete Product
  const handleDeleteProduct = async () => {
    if (!deleteProduct) return;
    try {
      await deleteDrug(Number(deleteProduct.id));
      setShowDeleteModal(false);
      setDeleteProduct(null);
      setShowError(null);
      refetch();
    } catch (err) {
      setShowError((err as any)?.message || String(err));
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    resetForm();
    setShowError(null);
  };

  // Expanded row content for products
  const renderExpandedRow = (rowData: ProductItem) => (
    <div className="p-6">
      {rowData.description ? (
        <div>
          <h4 className="font-semibold text-lg mb-3">Description</h4>
          <p style={{ color: 'var(--cds-text-secondary)' }}>
            {rowData.description}
          </p>
        </div>
      ) : (
        <div>
          <h4 className="font-semibold text-lg mb-3">Product Details</h4>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p>
                <span className="font-medium">Name:</span> {rowData.name}
              </p>
              <p>
                <span className="font-medium">Trade Name:</span>{' '}
                {rowData.tradeName}
              </p>
            </div>
            <div>
              <p>
                <span className="font-medium">Category:</span>{' '}
                {rowData.category}
              </p>
              <p>
                <span className="font-medium">Strength:</span>{' '}
                {rowData.strength} mg
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <GeneralPageLayout
      breadcrumbItems={[
        { label: 'PIMS', href: '/' },
        { label: 'Products', isCurrentPage: true },
      ]}
      title=""
      showExportButton={false}
      showSuccessNotification={showSuccess}
      successMessage="Product saved successfully"
      onCloseNotification={() => setShowSuccess(false)}
    >
      <SortableTable<ProductItem>
        title="Products"
        headers={productHeaders}
        data={resolvedProducts}
        filterOptions={[]}
        searchField="name"
        searchPlaceholder="Search (Generic Name, SKU, Trade Name, Category)"
        expandedRowContent={renderExpandedRow}
        controlled={{
          page,
          pageSize: limit,
          totalItems,
          onPageChange: (p) => setPage(p),
          onPageSizeChange: (s) => setLimit(s),
          sortColumn: sortBy,
          sortDirection: sortDir,
          onSort: (col, dir) => {
            const map: Record<
              string,
              'sku' | 'genericName' | 'tradeName' | 'id'
            > = {
              name: 'genericName',
              sku: 'sku',
              tradeName: 'tradeName',
              id: 'id',
            };
            const mapped = map[col];
            if (!mapped) return;
            setSortBy(mapped);
            setSortDir(dir);
            setPage(1); // Reset to first page when sorting changes
          },
          search: q,
          onSearchChange: (value) => setQ(value),
          activeFilter: '',
          onFilterChange: () => {},
          sortableKeys: ['id', 'name', 'sku', 'tradeName'],
        }}
        searchActions={
          <div className="flex items-center gap-3">
            <div className="min-w-64">
              <ComboBox
                id="category-filter"
                items={[
                  { text: 'All Categories', value: '' },
                  ...searchableCategories.map((c) => ({
                    text: c.name,
                    value: c.name,
                  })),
                ]}
                itemToString={(item) => (item ? item.text : '')}
                initialSelectedItem={{ text: 'All Categories', value: '' }}
                onChange={({ selectedItem }) => {
                  const categoryName = selectedItem?.value || '';
                  setSelectedCategoryFilter(categoryName);
                  if (!categoryName) {
                    setCategoryId(undefined);
                  } else {
                    const match = searchableCategories.find(
                      (c) => c.name === categoryName,
                    );
                    setCategoryId(match ? Number(match.id) : undefined);
                  }
                  setPage(1);
                }}
                onInputChange={(inputValue) => {
                  searchCategories(inputValue);
                }}
                placeholder="Filter by category..."
                titleText=""
                shouldFilterItem={() => true}
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
              Add Product
            </Button>
          </div>
        }
        renderCell={(row, key) =>
          key === 'actions'
            ? renderActionsMenu(row)
            : row[key as keyof ProductItem]
        }
      />
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
        onClose={handleCloseModal}
        onSubmit={handleAddProduct}
        title="Add Product"
        submitButtonText="Add Product"
        errorMessage={showError}
        onClearError={() => setShowError(null)}
        fields={[
          {
            key: 'name',
            label: 'Generic Name',
            type: 'text',
            value: name,
            onChange: (v) => setName(v as string),
            placeholder: 'Enter product name',
            required: true,
          },
          {
            key: 'sku',
            label: 'SKU',
            type: 'text',
            value: sku,
            onChange: (v) => setSku(v as string),
            placeholder: 'Leave empty for auto-generated SKU',
            required: false,
          },
          {
            key: 'tradeName',
            label: 'Trade Name',
            type: 'text',
            value: tradeName,
            onChange: (v) => setTradeName(v as string),
            placeholder: 'Enter trade name',
          },
          {
            key: 'category',
            label: 'Category',
            type: 'searchable-combobox',
            value: category,
            onChange: (v) => setCategory(v as string),
            options: searchableCategories.map((c) => ({
              text: c.name,
              value: c.name,
            })),
            required: true,
            placeholder: 'Search categories...',
            onSearch: searchCategories,
          },
          {
            key: 'strength',
            label: 'Strength',
            type: 'text',
            value: strength,
            onChange: (v) => setStrength(v as string),
            placeholder: 'Enter strength (e.g., 500mg)',
          },
          {
            key: 'description',
            label: 'Description',
            type: 'text',
            value: description,
            onChange: (v) => setDescription(v as string),
            placeholder: 'Enter description',
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
                  key: 'name',
                  label: 'Generic Name',
                  type: 'text',
                  value: editProduct.name,
                  onChange: (value) =>
                    setEditProduct({ ...editProduct, name: value as string }),
                  placeholder: 'Enter product name',
                  required: true,
                },
                {
                  key: 'sku',
                  label: 'SKU',
                  type: 'text',
                  value: editProduct.sku,
                  onChange: (value) =>
                    setEditProduct({ ...editProduct, sku: value as string }),
                  placeholder: 'Enter SKU',
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
                  placeholder: 'Enter trade name',
                },
                {
                  key: 'category',
                  label: 'Category',
                  type: 'searchable-combobox',
                  value: editProduct.category,
                  onChange: (value) =>
                    setEditProduct({
                      ...editProduct,
                      category: value as string,
                    }),
                  options: searchableCategories.map((c) => ({
                    text: c.name,
                    value: c.name,
                  })),
                  required: true,
                  placeholder: 'Search categories...',
                  onSearch: searchCategories,
                },
                {
                  key: 'strength',
                  label: 'Strength',
                  type: 'text',
                  value: editProduct.strength,
                  onChange: (value) =>
                    setEditProduct({
                      ...editProduct,
                      strength: value as string,
                    }),
                  placeholder: 'Enter strength',
                },
                {
                  key: 'description',
                  label: 'Description',
                  type: 'text',
                  value: editProduct.description || '',
                  onChange: (value) =>
                    setEditProduct({
                      ...editProduct,
                      description: value as string,
                    }),
                  placeholder: 'Enter description',
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
              Are you sure you want to delete <b>{deleteProduct?.name}</b>?
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

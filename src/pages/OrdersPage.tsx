import { useState, useEffect } from 'react';
import GeneralPageLayout from '../components/GeneralPageLayout';
import SortableTable from '../components/SortableTable';
import {
  Button,
  TextInput,
  NumberInput,
  Checkbox,
  OverflowMenu,
  OverflowMenuItem,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  ComboBox,
} from '@carbon/react';
import { Add } from '@carbon/icons-react';
import GenericModal, { type FormField } from '../components/GenericModal';
// Using GenericModal's 'searchable-combobox' field type for supplier; for products we keep inline filtered select for now
import {
  orderHeaders,
  orderFilterOptions,
  orderCustomFilter,
  type OrderItem,
} from '../data/orderData';
import { useOrders } from '../hooks/useOrders';
import { useSuppliers } from '../hooks/useSuppliers';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useCategoriesSearch } from '../hooks/useCategoriesSearch';
import { createPurchaseOrder } from '../api/orders';
import { createSupplier } from '../api/suppliers';
import { createDrug } from '../api/products';
import type { CreatePurchaseOrderInput } from '../types/order';
import type { CreateSupplierInput } from '../types/supplier';
import type { CreateDrugInput } from '../types/product';

// Modal line item type
type ModalItem = {
  id: string;
  productId: number;
  productName: string;
  expected: number;
  received: number;
  cancelled: boolean;
};

const OrdersPage = () => {
  // Data hooks
  const {
    orders,
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
    statusFilter,
    setStatusFilter,
  } = useOrders();
  const { suppliers, refetch: refetchSuppliers } = useSuppliers();
  const {
    products,
    refetch: refetchProducts,
    setQ: setProductsQ,
  } = useProducts();
  const { categories: categoriesList } = useCategories();
  const { categories: searchableCategories, searchCategories } =
    useCategoriesSearch();

  // Primary modal visibility
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Auxiliary modals (add new supplier/product)
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // New supplier/product form values
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierContactName, setNewSupplierContactName] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierEmail, setNewSupplierEmail] = useState('');
  const [newSupplierAddress, setNewSupplierAddress] = useState('');

  const [newProductName, setNewProductName] = useState('');
  const [newProductSku, setNewProductSku] = useState('');
  const [newProductBrand, setNewProductBrand] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductStrength, setNewProductStrength] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');

  // Order form state
  const [orderDate, setOrderDate] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [supplier, setSupplier] = useState('');
  const [status, setStatus] = useState('Pending');
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);

  // Items (within add/edit modals)
  const [modalItems, setModalItems] = useState<ModalItem[]>([]);
  const [productToAddId, setProductToAddId] = useState<number | null>(null);
  const [productToAddName, setProductToAddName] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);

  // Cache of fetched order items for expanded rows
  const [orderItemsMap, setOrderItemsMap] = useState<
    Record<string, ModalItem[]>
  >({});

  // Helpers
  const resetForm = () => {
    setOrderDate('');
    setArrivalDate('');
    setSupplier('');
    setStatus('Pending');
    setEditingOrderId(null);
    setModalItems([]);
    setProductToAddId(null);
    setProductToAddName('');
  };
  const handleCloseModal = () => {
    setShowAddModal(false);
    resetForm();
  };
  // Backend expects format "%Y-%m-%d %H:%M:%S"; build at midnight local if only date provided
  const toBackendDateTime = (d: string): string | undefined => {
    if (!d) return undefined;
    // If user provides just a date, treat it as local midnight and send in backend format
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return `${d} 00:00:00`;
    // If an ISO string with timezone is provided, convert to local and output in backend format to avoid off-by-one
    const parsed = new Date(d);
    if (isNaN(parsed.getTime())) return undefined;
    const pad = (n: number) => String(n).padStart(2, '0');
    const year = parsed.getFullYear();
    const month = pad(parsed.getMonth() + 1);
    const day = pad(parsed.getDate());
    const hours = pad(parsed.getHours());
    const mins = pad(parsed.getMinutes());
    const secs = pad(parsed.getSeconds());
    return `${year}-${month}-${day} ${hours}:${mins}:${secs}`;
  };
  const deriveOrderStatus = (items: ModalItem[]): string => {
    if (items.length === 0) return status; // keep current if no items yet
    const nonCancelled = items.filter((i) => !i.cancelled);
    const allCancelled = items.length > 0 && nonCancelled.length === 0;
    if (allCancelled) return 'Cancelled';
    const allComplete =
      nonCancelled.length > 0 &&
      nonCancelled.every((i) => i.expected > 0 && i.received >= i.expected);
    if (allComplete) return 'Complete';
    const allPending =
      nonCancelled.length > 0 &&
      nonCancelled.every((i) => i.expected > 0 && i.received === 0);
    if (allPending) return 'Pending';
    return 'Partially Received';
  };
  const computeStatus = (mi: ModalItem): string => {
    if (mi.cancelled) return 'Cancelled';
    if (mi.received <= 0) return 'Pending';
    if (mi.received < mi.expected) return 'Partially Received';
    return 'Complete';
  };

  const addItemToModal = () => {
    if (!productToAddId) return;
    // prevent duplicate by productId
    if (modalItems.some((mi) => mi.productId === productToAddId)) return;
    setModalItems((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        productId: productToAddId,
        productName: productToAddName,
        expected: 0,
        received: 0,
        cancelled: false,
      },
    ]);
    setProductToAddId(null);
    setProductToAddName('');
  };
  const updateModalItem = (id: string, updater: (mi: ModalItem) => ModalItem) =>
    setModalItems((prev) =>
      prev.map((mi) => (mi.id === id ? updater(mi) : mi)),
    );
  const removeModalItem = (id: string) =>
    setModalItems((prev) => prev.filter((mi) => mi.id !== id));

  // CRUD handlers
  const handleAddOrder = async () => {
    try {
      if (!supplier || supplier === '__choose_supplier__') {
        setModalError('Please select a valid supplier');
        return;
      }
      const selectedSupplier = suppliers?.find((s) => s.name === supplier);
      if (!selectedSupplier) {
        alert('Please select a valid supplier');
        return;
      }
      const supplier_id = Number(
        (selectedSupplier as any).id ?? (selectedSupplier as any).supplierId,
      );
      const created_at = toBackendDateTime(orderDate);
      const expected_date = toBackendDateTime(arrivalDate);
      const computedStatus = deriveOrderStatus(modalItems);
      const orderData: CreatePurchaseOrderInput = {
        supplier_id,
        created_at,
        expected_date,
        status: computedStatus,
      };
      const createdOrder = await createPurchaseOrder(orderData);
      const api = await import('../api/orders');
      for (const item of modalItems) {
        if (!item.productId) continue;
        await api.createPurchaseOrderItem({
          purchase_order_id: createdOrder.purchase_order_id,
          drug_id: Number(item.productId),
          quantity_ordered: item.expected,
          quantity_received: item.received,
          unit_cost: 0,
          status: item.cancelled
            ? 'Cancelled'
            : item.received === 0
              ? 'Pending'
              : item.received < item.expected
                ? 'Partially Received'
                : 'Complete',
        });
      }
      setShowAddModal(false);
      setShowSuccess(true);
      resetForm();
      refetch();
      setTimeout(() => setShowSuccess(false), 1500);
    } catch (e: any) {
      console.error(e);
      setModalError((e?.message as string) || 'Failed to add order');
    }
  };

  const handleEditOrder = async () => {
    try {
      if (!editingOrderId) return;
      if (!supplier || supplier === '__choose_supplier__') {
        setModalError('Please select a valid supplier');
        return;
      }
      const selectedSupplier = suppliers?.find((s) => s.name === supplier);
      if (!selectedSupplier) {
        alert('Please select a valid supplier');
        return;
      }
      const supplier_id = Number(
        (selectedSupplier as any).id ?? (selectedSupplier as any).supplierId,
      );
      const created_at = toBackendDateTime(orderDate);
      const expected_date = toBackendDateTime(arrivalDate);
      const api = await import('../api/orders');
      // First fetch existing items then apply item changes (so status derived after successful item updates)
      const existingItems = await api.listPurchaseOrderItems({
        purchase_order_id: editingOrderId,
      });
      const byDrug = new Map(existingItems.map((i) => [i.drug_id, i]));
      const existingIds = new Set(
        existingItems.map((i) => i.purchase_order_item_id),
      );
      for (const item of modalItems) {
        if (!item.productId) continue;
        const drugId = Number(item.productId);
        const existing = byDrug.get(drugId);
        if (existing) {
          // Always send explicit status derived from fields to clear stale cancelled state
          await api.updatePurchaseOrderItem(existing.purchase_order_item_id, {
            drug_id: drugId,
            quantity_ordered: item.expected,
            quantity_received: item.received,
            unit_cost: 0,
            status: item.cancelled
              ? 'Cancelled'
              : item.received === 0
                ? 'Pending'
                : item.received < item.expected
                  ? 'Partially Received'
                  : 'Complete',
          });
          existingIds.delete(existing.purchase_order_item_id);
        } else {
          await api.createPurchaseOrderItem({
            purchase_order_id: editingOrderId,
            drug_id: drugId,
            quantity_ordered: item.expected,
            quantity_received: item.received,
            unit_cost: 0,
            status: item.cancelled
              ? 'Cancelled'
              : item.received === 0
                ? 'Pending'
                : item.received < item.expected
                  ? 'Partially Received'
                  : 'Complete',
          });
        }
      }
      // Delete items that were removed in the edit modal
      for (const leftoverId of existingIds) {
        await api.deletePurchaseOrderItem(leftoverId);
      }
      // Derive final order status AFTER item updates
      const finalStatus = deriveOrderStatus(modalItems);
      await api.updatePurchaseOrder(editingOrderId, {
        supplier_id,
        created_at,
        expected_date,
        status: finalStatus,
      });
      // Refresh cached items for this order so expanded row shows newest data
      try {
        const freshItems = await api.listPurchaseOrderItems({
          purchase_order_id: editingOrderId,
        });
        const mapped = freshItems.map((item, idx) => {
          const productObj = products?.find(
            (p) => Number((p as any).id) === item.drug_id,
          );
          return {
            id: `${editingOrderId}-${idx}`,
            productId: Number(item.drug_id),
            productName: productObj
              ? (productObj as any).name
              : `Drug ID: ${item.drug_id}`,
            expected: item.quantity_ordered,
            received: item.quantity_received || 0,
            cancelled: item.status === 'Cancelled',
          } as ModalItem;
        });
        setOrderItemsMap((prev) => ({
          ...prev,
          [String(editingOrderId)]: mapped,
        }));
      } catch (e) {
        /* ignore refresh error */
      }
      setShowEditModal(false);
      setShowSuccess(true);
      resetForm();
      refetch();
      setTimeout(() => setShowSuccess(false), 1500);
    } catch (e: any) {
      console.error(e);
      setModalError((e?.message as string) || 'Failed to edit order');
    }
  };

  const handleAddNewSupplier = async () => {
    if (
      !newSupplierName.trim() ||
      !newSupplierPhone.trim() ||
      !newSupplierEmail.trim()
    ) {
      alert('Name, phone and email are required');
      return;
    }
    try {
      const supplierData: CreateSupplierInput = {
        name: newSupplierName.trim(),
        contact_name: newSupplierContactName.trim() || null,
        phone: newSupplierPhone.trim(),
        email: newSupplierEmail.trim(),
        address: newSupplierAddress.trim() || null,
      };
      const createdSupplier = await createSupplier(supplierData);
      setSupplier((createdSupplier as any).name);
      setNewSupplierName('');
      setNewSupplierContactName('');
      setNewSupplierPhone('');
      setNewSupplierEmail('');
      setNewSupplierAddress('');
      setShowAddSupplierModal(false);
      refetchSuppliers();
    } catch (e: any) {
      console.error(e);
      alert('Failed to add supplier: ' + e);
    }
  };
  const handleAddNewProduct = async () => {
    if (
      !newProductName.trim() ||
      !newProductSku.trim() ||
      !newProductCategory
    ) {
      alert('Product name, SKU and category required');
      return;
    }
    try {
      const selectedCategory = categoriesList.find(
        (c) => c.name === newProductCategory,
      );
      const productData: CreateDrugInput = {
        sku: newProductSku.trim(),
        generic_name: newProductName.trim(),
        brand_name: newProductBrand.trim() || null,
        strength: newProductStrength.trim() || '',
        description: newProductDescription.trim() || '',
        category_id: selectedCategory ? Number(selectedCategory.id) : 1,
      };
      const createdProduct = await createDrug(productData);
      setProductToAddId(Number((createdProduct as any)?.id));
      setProductToAddName(
        (createdProduct as any)?.genericName ||
          (createdProduct as any)?.generic_name ||
          '',
      );
      setNewProductName('');
      setNewProductSku('');
      setNewProductBrand('');
      setNewProductCategory('');
      setNewProductStrength('');
      setNewProductDescription('');
      setShowAddProductModal(false);
      refetchProducts();
    } catch (e: any) {
      console.error(e);
      alert('Failed to add product: ' + e);
    }
  };

  // Expanded row component (allows useEffect)
  const ExpandedOrderRow = ({ rowData }: { rowData: OrderItem }) => {
    const items = orderItemsMap[rowData.orderId];
    useEffect(() => {
      if (!items) {
        (async () => {
          try {
            const api = await import('../api/orders');
            const orderItems = await api.listPurchaseOrderItems({
              purchase_order_id: Number(rowData.orderId),
            });
            const mapped = orderItems.map((item, idx) => {
              const productObj = products?.find(
                (p) => Number((p as any).id) === item.drug_id,
              );
              return {
                id: `${rowData.orderId}-${idx}`,
                productId: Number(item.drug_id),
                productName: productObj
                  ? (productObj as any).name
                  : `Drug ID: ${item.drug_id}`,
                expected: item.quantity_ordered,
                received: item.quantity_received || 0,
                cancelled: item.status === 'Cancelled',
              } as ModalItem;
            });
            setOrderItemsMap((prev) => ({
              ...prev,
              [rowData.orderId]: mapped,
            }));
          } catch {
            setOrderItemsMap((prev) => ({ ...prev, [rowData.orderId]: [] }));
          }
        })();
      }
    }, [items, rowData.orderId]);

    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-lg">Order Details</h4>
          <OverflowMenu ariaLabel="Order actions" size="sm">
            <OverflowMenuItem
              itemText="Edit Order"
              onClick={async () => {
                try {
                  setOrderDate(rowData.orderDate);
                  setArrivalDate(
                    rowData.arrivalDate === 'N/A' ? '' : rowData.arrivalDate,
                  );
                  setSupplier(rowData.supplier);
                  setStatus(rowData.status);
                  setEditingOrderId(Number(rowData.orderId));
                  // Ensure items are loaded before opening edit
                  let mapped = orderItemsMap[rowData.orderId];
                  if (!mapped) {
                    const api = await import('../api/orders');
                    const orderItems = await api.listPurchaseOrderItems({
                      purchase_order_id: Number(rowData.orderId),
                    });
                    mapped = orderItems.map((item, idx) => {
                      const productObj = products?.find(
                        (p) => Number((p as any).id) === item.drug_id,
                      );
                      return {
                        id: `${rowData.orderId}-${idx}`,
                        productId: Number(item.drug_id),
                        productName: productObj
                          ? (productObj as any).name
                          : `Drug ID: ${item.drug_id}`,
                        expected: item.quantity_ordered,
                        received: item.quantity_received || 0,
                        cancelled: item.status === 'Cancelled',
                      } as ModalItem;
                    });
                    setOrderItemsMap((prev) => ({
                      ...prev,
                      [rowData.orderId]: mapped!,
                    }));
                  }
                  setModalItems(mapped || []);
                  setShowEditModal(true);
                } catch (e) {
                  console.error(e);
                  setModalItems([]);
                  setShowEditModal(true);
                }
              }}
            />
          </OverflowMenu>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr style={{ backgroundColor: 'var(--cds-layer-accent)' }}>
                <th className="px-4 py-2 text-left font-medium">Product</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
                <th className="px-4 py-2 text-left font-medium">Quantity</th>
                <th className="px-4 py-2 text-left font-medium">
                  Quantity Received
                </th>
              </tr>
            </thead>
            <tbody>
              {!items ? (
                <tr>
                  <td className="px-4 py-4" colSpan={4}>
                    Loading items...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-4" colSpan={4}>
                    No items found
                  </td>
                </tr>
              ) : (
                items.map((it) => (
                  <tr key={it.id} className="border-t">
                    <td className="px-4 py-2">{it.productName}</td>
                    <td className="px-4 py-2">{computeStatus(it)}</td>
                    <td className="px-4 py-2">{it.expected}</td>
                    <td className="px-4 py-2">{it.received}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  const renderExpandedRow = (row: OrderItem) => (
    <ExpandedOrderRow rowData={row} />
  );

  const modalFields: FormField[] = [
    {
      key: 'orderDate',
      label: 'Order Date',
      type: 'date',
      value: orderDate,
      onChange: (v: any) => setOrderDate(v as string),
      required: true,
    },
    {
      key: 'arrivalDate',
      label: 'Arrival Date',
      type: 'date',
      value: arrivalDate,
      onChange: (v: any) => setArrivalDate(v as string),
    },
    {
      key: 'supplier',
      label: 'Supplier',
      type: 'searchable-combobox',
      value: supplier,
      onChange: (v: any) => {
        if (v === '__add_new_supplier__') setShowAddSupplierModal(true);
        else setSupplier(v as string);
      },
      options: (suppliers || []).map((s) => ({ text: s.name, value: s.name })),
      required: true,
      validate: (v) =>
        v === '__choose_supplier__' || !v ? 'Select supplier' : undefined,
    },
  ];

  return (
    <GeneralPageLayout
      breadcrumbItems={[
        { label: 'PIMS', href: '/' },
        { label: 'Orders', isCurrentPage: true },
      ]}
      title=""
      showExportButton={true}
      onExportClick={() => console.log('Export clicked')}
      showSuccessNotification={showSuccess}
      successMessage="Order has been saved successfully"
      onCloseNotification={() => setShowSuccess(false)}
    >
      <SortableTable<OrderItem>
        title="Orders"
        headers={orderHeaders}
        data={orders}
        filterOptions={orderFilterOptions}
        customFilters={orderCustomFilter}
        searchField="orderId"
        searchPlaceholder="Search (Supplier)"
        expandedRowContent={renderExpandedRow}
        searchActions={
          <Button
            kind="primary"
            size="md"
            renderIcon={Add}
            onClick={() => {
              setModalError(null);
              setShowAddModal(true);
            }}
          >
            Add Order
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
            const allowed = ['createdDate', 'expectedDate', 'status'] as const;
            if (!(allowed as readonly string[]).includes(col)) return;
            setSortBy(col as any);
            setSortDir(dir);
          },
          search: q,
          onSearchChange: (value) => setQ(value),
          activeFilter: statusFilter ?? 'All Statuses',
          onFilterChange: (value) => setStatusFilter(value),
          sortableKeys: ['createdDate', 'expectedDate', 'status'],
        }}
      />

      {/* Add Order Modal with editable items table */}
      <GenericModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSubmit={handleAddOrder}
        title="Add Order"
        submitButtonText="Add Order"
        errorMessage={modalError}
        onClearError={() => setModalError(null)}
        fields={modalFields}
        maxWidth="72rem"
        className="max-h-[90vh] overflow-y-auto"
      >
        <div className="mt-6">
          <div className="mb-3 font-medium">Items</div>
          <div className="flex items-center gap-2 mb-3">
            <ComboBox
              id="productToAdd"
              items={(products || []).slice(0, 50).map((p) => ({
                id: Number(p.id),
                text: (p as any).name,
                value: Number(p.id),
              }))}
              itemToString={(it: any) => (it ? it.text : '')}
              selectedItem={null}
              onInputChange={(text: string) => setProductsQ(text)}
              onChange={({ selectedItem }: any) => {
                if (!selectedItem) return;
                setProductToAddId(Number(selectedItem.value));
                setProductToAddName(String(selectedItem.text));
              }}
              placeholder="Search products..."
              titleText=""
            />
            <Button size="sm" kind="secondary" onClick={addItemToModal}>
              Add Item
            </Button>
          </div>
          <ItemsTable
            items={modalItems}
            computeStatus={computeStatus}
            onChangeItem={updateModalItem}
            onRemoveItem={removeModalItem}
            mode="add"
          />
        </div>
      </GenericModal>

      {/* Edit Order Modal (only cancel toggle per item) */}
      <GenericModal
        isOpen={showEditModal}
        onClose={() => {
          setModalError(null);
          setShowEditModal(false);
          resetForm();
        }}
        onSubmit={handleEditOrder}
        title="Edit Order"
        submitButtonText="Save Changes"
        errorMessage={modalError}
        onClearError={() => setModalError(null)}
        fields={modalFields}
        maxWidth="72rem"
        className="max-h-[90vh] overflow-y-auto"
      >
        <div className="mt-6">
          <div className="mb-3 font-medium">Items</div>
          <div className="flex items-center gap-2 mb-3">
            <ComboBox
              id="productToAddEdit"
              items={(products || []).slice(0, 50).map((p) => ({
                id: Number(p.id),
                text: (p as any).name,
                value: Number(p.id),
              }))}
              itemToString={(it: any) => (it ? it.text : '')}
              selectedItem={null}
              onInputChange={(text: string) => setProductsQ(text)}
              onChange={({ selectedItem }: any) => {
                if (!selectedItem) return;
                setProductToAddId(Number(selectedItem.value));
                setProductToAddName(String(selectedItem.text));
              }}
              placeholder="Search products..."
              titleText=""
            />
            <Button size="sm" kind="secondary" onClick={addItemToModal}>
              Add Item
            </Button>
          </div>
          <ItemsTable
            items={modalItems}
            computeStatus={computeStatus}
            onChangeItem={updateModalItem}
            onRemoveItem={removeModalItem}
            mode="edit"
          />
        </div>
      </GenericModal>

      {/* Add New Supplier Modal */}
      <GenericModal
        isOpen={showAddSupplierModal}
        onClose={() => {
          setShowAddSupplierModal(false);
          setNewSupplierName('');
          setNewSupplierContactName('');
          setNewSupplierPhone('');
          setNewSupplierEmail('');
          setNewSupplierAddress('');
        }}
        onSubmit={handleAddNewSupplier}
        title="Add New Supplier"
        submitButtonText="Add Supplier"
        fields={[
          {
            key: 'supplierName',
            label: 'Name',
            type: 'text',
            value: newSupplierName,
            onChange: (v: any) => setNewSupplierName(v as string),
            placeholder: 'Enter supplier name',
            required: true,
          },
          {
            key: 'supplierContact',
            label: 'Contact Name',
            type: 'text',
            value: newSupplierContactName,
            onChange: (v: any) => setNewSupplierContactName(v as string),
            placeholder: 'Enter contact person',
          },
          {
            key: 'supplierPhone',
            label: 'Phone',
            type: 'text',
            value: newSupplierPhone,
            onChange: (v: any) => setNewSupplierPhone(v as string),
            placeholder: 'Enter phone number',
            required: true,
          },
          {
            key: 'supplierEmail',
            label: 'Email',
            type: 'text',
            value: newSupplierEmail,
            onChange: (v: any) => setNewSupplierEmail(v as string),
            placeholder: 'Enter email',
            required: true,
            validate: (v) =>
              /.+@.+/.test(String(v)) ? undefined : 'Invalid email',
          },
          {
            key: 'supplierAddress',
            label: 'Address',
            type: 'text',
            value: newSupplierAddress,
            onChange: (v: any) => setNewSupplierAddress(v as string),
            placeholder: 'Enter address',
          },
        ]}
        maxWidth="36rem"
      />

      {/* Add New Product Modal */}
      <GenericModal
        isOpen={showAddProductModal}
        onClose={() => {
          setShowAddProductModal(false);
          setNewProductName('');
          setNewProductSku('');
          setNewProductBrand('');
          setNewProductCategory('');
          setNewProductStrength('');
          setNewProductDescription('');
        }}
        onSubmit={handleAddNewProduct}
        title="Add New Product"
        submitButtonText="Add Product"
        fields={[
          {
            key: 'prodName',
            label: 'Product Name',
            type: 'text',
            value: newProductName,
            onChange: (v: any) => setNewProductName(v as string),
            placeholder: 'Enter product name',
            required: true,
          },
          {
            key: 'prodSku',
            label: 'SKU',
            type: 'text',
            value: newProductSku,
            onChange: (v: any) => setNewProductSku(v as string),
            placeholder: 'Enter SKU',
            required: true,
          },
          {
            key: 'prodBrand',
            label: 'Brand',
            type: 'text',
            value: newProductBrand,
            onChange: (v: any) => setNewProductBrand(v as string),
            placeholder: 'Enter brand',
          },
          {
            key: 'prodCategory',
            label: 'Category',
            type: 'searchable-combobox',
            value: newProductCategory,
            onChange: (v: any) => setNewProductCategory(v as string),
            options: searchableCategories.map((c) => ({
              text: c.name,
              value: c.name,
            })),
            required: true,
            placeholder: 'Search categories...',
            onSearch: searchCategories,
          },
          {
            key: 'prodStrength',
            label: 'Strength',
            type: 'text',
            value: newProductStrength,
            onChange: (v: any) => setNewProductStrength(v as string),
            placeholder: 'Enter strength (optional)',
          },
          {
            key: 'prodDescription',
            label: 'Description',
            type: 'text',
            value: newProductDescription,
            onChange: (v: any) => setNewProductDescription(v as string),
            placeholder: 'Enter description',
          },
        ]}
        maxWidth="40rem"
      />
    </GeneralPageLayout>
  );
};

export default OrdersPage;

// Reusable items table for both Add and Edit modals
type ItemsTableProps = {
  items: ModalItem[];
  computeStatus: (mi: ModalItem) => string;
  onChangeItem: (id: string, updater: (mi: ModalItem) => ModalItem) => void;
  onRemoveItem: (id: string) => void;
  mode: 'add' | 'edit';
};

const ItemsTable = ({
  items,
  computeStatus,
  onChangeItem,
  onRemoveItem,
  mode,
}: ItemsTableProps) => {
  const baseHeaders = [
    { key: 'product', header: 'Product' },
    { key: 'status', header: 'Status' },
    { key: 'expected', header: 'Expected' },
    { key: 'received', header: 'Received' },
  ];
  const headers =
    mode === 'edit'
      ? [...baseHeaders, { key: 'cancelled', header: 'Cancelled' }]
      : [...baseHeaders, { key: 'actions', header: '' }];

  const rows = items.map((mi) => ({
    id: mi.id,
    product: mi.productName,
    status: computeStatus(mi),
    expected: String(mi.expected),
    received: String(mi.received),
    ...(mode === 'edit'
      ? { cancelled: mi.cancelled ? 'Yes' : 'No' }
      : { actions: '' }),
  }));

  return (
    <div className="overflow-x-auto">
      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
          <Table {...getTableProps()} size="sm" useZebraStyles>
            <TableHead>
              <TableRow>
                {headers.map((h) => (
                  <TableHeader {...getHeaderProps({ header: h })} key={h.key}>
                    {h.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => {
                const mi = items.find((x) => x.id === r.id);
                if (!mi) return null;
                const rowProps = getRowProps({ row: r });
                return (
                  <TableRow {...rowProps} key={r.id}>
                    <TableCell>
                      <TextInput
                        id={`prod-${mi.id}`}
                        labelText=""
                        value={mi.productName}
                        onChange={(e: any) =>
                          onChangeItem(mi.id, (prev) => ({
                            ...prev,
                            productName: e.target.value,
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell>{computeStatus(mi)}</TableCell>
                    <TableCell>
                      <NumberInput
                        id={`exp-${mi.id}`}
                        hideLabel
                        value={mi.expected}
                        onChange={(_e, { value }) =>
                          onChangeItem(mi.id, (prev) => ({
                            ...prev,
                            expected: Math.max(0, Number(value)),
                          }))
                        }
                        min={0}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell>
                      <NumberInput
                        id={`rec-${mi.id}`}
                        hideLabel
                        value={mi.received}
                        onChange={(_e, { value }) =>
                          onChangeItem(mi.id, (prev) => ({
                            ...prev,
                            received: Math.max(
                              0,
                              Math.min(Number(value), prev.expected),
                            ),
                          }))
                        }
                        min={0}
                        size="sm"
                      />
                    </TableCell>
                    {mode === 'edit' ? (
                      <TableCell>
                        <Checkbox
                          id={`can-${mi.id}`}
                          labelText=""
                          checked={!!mi.cancelled}
                          onChange={(_e, data) =>
                            onChangeItem(mi.id, (prev) => ({
                              ...prev,
                              cancelled: !!data.checked,
                            }))
                          }
                        />
                      </TableCell>
                    ) : (
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          kind="ghost"
                          onClick={() => onRemoveItem(mi.id)}
                        >
                          ×
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </div>
  );
};

import { useState, useEffect, useCallback, useRef } from 'react';
import GeneralPageLayout from '../../../components/GeneralPageLayout';
import SortableTable from '../../../components/SortableTable';
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
  DatePicker,
  DatePickerInput,
  TextInput,
  NumberInput,
} from '@carbon/react';
import { Add } from '@carbon/icons-react';
import GenericModal, { type FormField } from '../../../components/GenericModal';
import { useInventoryTable } from '../../../hooks/useInventoryTable';
import {
  useSaleBatchSearch,
  type SaleBatchRow,
} from '../../../hooks/useSaleBatchSearch';
import { useProducts } from '../../../hooks/useProducts';
import { useSuppliers } from '../../../hooks/useSuppliers';
import { useUnitTypes } from '../../../hooks/useUnitTypes';
import { useBatchLocations } from '../../../hooks/useBatchLocations';
import { useBatchTransactions } from '../../../hooks/useBatchTransactions';
import {
  LocationSelector,
  type SelectedLocation,
} from '../../../components/LocationSelector';
import {
  createSaleGroup,
  checkSaleExpiryOrder,
  type ExpiryOrderConflict,
  type ExpiryOrderPolicy,
} from '../../../api/sales';
import type {
  CreateBatchInput,
  UpdateBatchInput,
  CreateTransactionInput,
} from '../../../types/inventory';
import { createTransaction } from '../../../api/inventory';
import ExpiryOrderNotice from '../../../components/ExpiryOrderNotice';
import { useAuth } from '../../../hooks/useAuth';

// Define inventory headers for the table
const inventoryHeaders = [
  { key: 'id', header: 'Batch ID' },
  { key: 'batchNumber', header: 'Batch Number' },
  { key: 'drugName', header: 'Drug Name' },
  { key: 'sku', header: 'SKU' },
  { key: 'expiryDate', header: 'Expiry Date' },
  { key: 'quantity', header: 'Quantity' },
  { key: 'unitPrice', header: 'Unit Price' },
  { key: 'purchaseDate', header: 'Purchase Date' },
  { key: 'supplier', header: 'Supplier' },
  { key: 'actions', header: 'Actions' },
];

const InventoryList = () => {
  const { session } = useAuth();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBatch, setEditBatch] = useState<any | null>(null);
  const [editQuantity, setEditQuantity] = useState<string>('');
  const [editSelectedLocations, setEditSelectedLocations] = useState<
    SelectedLocation[]
  >([]);
  // False when the batch's current locations couldn't be loaded; then locations aren't sent on save
  const [editLocationsLoaded, setEditLocationsLoaded] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteBatch, setDeleteBatch] = useState<any | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedBatchForTransaction, setSelectedBatchForTransaction] =
    useState<any | null>(null);

  // Batch creation loading state
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);
  // Transaction creation loading state
  const [isSubmittingTransaction, setIsSubmittingTransaction] = useState(false);
  // Batch edit loading state
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Sale group (cart) state
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [saleSelectedBatch, setSaleSelectedBatch] =
    useState<SaleBatchRow | null>(null);
  const [saleQuantity, setSaleQuantity] = useState('');
  const [saleSubmitting, setSaleSubmitting] = useState(false);
  // Batches of the same product that expire sooner than what's in the cart
  const [expiryConflicts, setExpiryConflicts] = useState<{
    policy: ExpiryOrderPolicy;
    conflicts: ExpiryOrderConflict[];
  } | null>(null);
  // Set once the user chose "Sell anyway" for the current cart (warn policy)
  const [expiryWarningAccepted, setExpiryWarningAccepted] = useState(false);
  const [saleCart, setSaleCart] = useState<
    {
      batchId: number;
      drugName: string;
      batchNumber: string;
      unitTypeName?: string;
      availableQty: number;
      quantity: number;
    }[]
  >([]);

  // Transaction form state
  const [transactionType, setTransactionType] = useState('');
  // Expiry-order check for 'sale' transactions created from the row modal
  const [txExpiryConflicts, setTxExpiryConflicts] = useState<{
    policy: ExpiryOrderPolicy;
    conflicts: ExpiryOrderConflict[];
  } | null>(null);
  const [transactionQuantity, setTransactionQuantity] = useState('');
  const [transactionNotes, setTransactionNotes] = useState('');

  // Form state
  const [batchNumber, setBatchNumber] = useState('');
  const [selectedDrug, setSelectedDrug] = useState('');
  const [selectedDrugOption, setSelectedDrugOption] = useState<{
    text: string;
    value: string;
  } | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedUnitType, setSelectedUnitType] = useState('');
  const [manufactureDate, setManufactureDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [currentQty, setCurrentQty] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<
    SelectedLocation[]
  >([]);

  const {
    inventory,
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
    setDrugId,
    setStockStatus,
    setExpiryFrom,
    setExpiryTo,
    totalItems,
    addBatch,
    editBatch: updateBatch,
    removeBatch,
    clearError,
    refetch: refetchInventory,
  } = useInventoryTable();

  // Dedicated batch search for sales (independent of inventory pagination)
  const { batches: saleBatches, setSearch: setSaleBatchSearch } =
    useSaleBatchSearch(50);

  // For drug/supplier combo boxes
  const { products, setQ: setProductSearchTerm, setPage: setProductsPage } =
    useProducts({ initialLimit: 10 });
  const {
    suppliers,
    setQ: setSupplierSearchTerm,
    setPage: setSuppliersPage,
  } = useSuppliers();
  const {
    unitTypes,
    setQ: setUnitTypeSearchTerm,
    setPage: setUnitTypesPage,
  } = useUnitTypes();

  // For expanded row data - track per batch
  const [expandedRowData, setExpandedRowData] = useState<{
    [batchId: string]: {
      locations: any[];
      transactions: any[];
      locationsLoading: boolean;
      transactionsLoading: boolean;
      locationsError: string | null;
      transactionsError: string | null;
      loaded: boolean;
    };
  }>({});

  // Track which batch IDs are currently being fetched to prevent duplicate requests
  const fetchingBatchIds = useRef<Set<string>>(new Set());

  // Hooks for fetching expanded row data
  const { fetchLocationsByBatch } = useBatchLocations();
  const { fetchTransactionsByBatch } = useBatchTransactions();

  const resetProductSearch = useCallback(() => {
    setProductSearchTerm('');
    setProductsPage(1);
  }, [setProductSearchTerm, setProductsPage]);

  const resetSupplierSearch = useCallback(() => {
    setSupplierSearchTerm('');
    setSuppliersPage(1);
  }, [setSupplierSearchTerm, setSuppliersPage]);

  const resetUnitTypeSearch = useCallback(() => {
    setUnitTypeSearchTerm('');
    setUnitTypesPage(1);
  }, [setUnitTypeSearchTerm, setUnitTypesPage]);

  const handleDrugSearch = useCallback(
    (searchValue: string) => {
      setProductSearchTerm(searchValue);
      setProductsPage(1);
    },
    [setProductSearchTerm, setProductsPage],
  );

  const handleSupplierSearch = useCallback(
    (searchValue: string) => {
      setSupplierSearchTerm(searchValue);
      setSuppliersPage(1);
    },
    [setSupplierSearchTerm, setSuppliersPage],
  );

  const handleUnitTypeSearch = useCallback(
    (searchValue: string) => {
      setUnitTypeSearchTerm(searchValue);
      setUnitTypesPage(1);
    },
    [setUnitTypeSearchTerm, setUnitTypesPage],
  );

  // Keep the selected drug option in the list even if it falls off the current page
  // A changed type or quantity needs a fresh expiry-order check
  useEffect(() => {
    setTxExpiryConflicts(null);
  }, [transactionType, transactionQuantity]);

  // A changed cart needs a fresh expiry-order check
  useEffect(() => {
    setExpiryConflicts(null);
    setExpiryWarningAccepted(false);
  }, [saleCart]);

  useEffect(() => {
    if (!selectedDrug) {
      setSelectedDrugOption(null);
      return;
    }
    const drug = products.find(
      (p) => String(p.id) === String(selectedDrug),
    );
    if (!drug) {
      // Keep whatever was previously selected if it is no longer in the current page
      return;
    }
    setSelectedDrugOption({
      text: drug.tradeName ? `${drug.name} (${drug.tradeName})` : drug.name,
      value: String(drug.id),
    });
  }, [selectedDrug, products]);

  const resetForm = () => {
    setBatchNumber('');
    setSelectedDrug('');
    setSelectedSupplier('');
    setSelectedUnitType('');
    setManufactureDate('');
    setExpiryDate('');
    setUnitCost('');
    setUnitPrice('');
    setPurchaseDate('');
    setCurrentQty('');
    setLowStockThreshold('');
    setSelectedLocations([]);
    resetProductSearch();
    resetSupplierSearch();
    resetUnitTypeSearch();
    setIsSubmittingBatch(false);
    setShowError(null);
  };

  const resetTransactionForm = () => {
    setTransactionType('');
    setTransactionQuantity('');
    setTransactionNotes('');
    setTxExpiryConflicts(null);
  };

  // Auto-suggest 10% of current quantity for low stock threshold
  const handleCurrentQtyChange = (value: string) => {
    setCurrentQty(value);
    const qty = parseInt(value, 10);
    if (!isNaN(qty) && qty > 0) {
      const suggestedThreshold = Math.max(1, Math.floor(qty * 0.1));
      setLowStockThreshold(String(suggestedThreshold));
    }
  };

  const handleAddBatch = async () => {
    // Prevent multiple submissions
    if (isSubmittingBatch) {
      return;
    }

    try {
      setIsSubmittingBatch(true);
      setShowError(null);

      // Ensure required selections are present (ids stored in state)
      if (!selectedDrug || !selectedSupplier || !selectedUnitType) {
        setShowError('Please select valid drug, supplier, and unit type');
        return;
      }

      const res = await addBatch({
        batch_number: batchNumber || undefined,
        drug_id: Number(selectedDrug),
        supplier_id: Number(selectedSupplier),
        unit_type_id: Number(selectedUnitType),
        manufacture_date: manufactureDate || undefined,
        expiry_date: expiryDate,
        unit_cost: parseFloat(unitCost),
        unit_price: parseFloat(unitPrice),
        purchase_date: purchaseDate,
        current_qty: parseInt(currentQty, 10),
        low_stock_threshold: lowStockThreshold
          ? parseInt(lowStockThreshold, 10)
          : 10,
        location_ids:
          selectedLocations.length > 0
            ? selectedLocations.map((loc) => loc.id)
            : undefined,
      } as CreateBatchInput);

      if (res.ok) {
        setShowError(null);
        setShowAddModal(false);
        setShowSuccess(true);
        setPage(1);
        resetForm();
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setShowError(res.message || 'Failed to create batch');
      }
    } catch (err: any) {
      // Handle duplicate request error from backend
      if (err?.status === 409 || err?.message?.includes('Duplicate')) {
        setShowError('This request was already submitted. Please wait a moment.');
      } else {
      setShowError(err?.message || 'Failed to add batch');
      }
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  const handleEditBatch = async () => {
    // Prevent multiple submissions
    if (isSubmittingEdit) {
      return;
    }

    if (!editBatch) return;

    try {
      setIsSubmittingEdit(true);
      setShowError(null);

      // Prefer explicit ids from editBatch; fall back to current selection for unit type
      const drugId = editBatch.drugId ?? editBatch.drug_id ?? editBatch.drugID;
      const supplierId =
        editBatch.supplierId ??
        editBatch.supplier_id ??
        editBatch.supplierID;
      const unitTypeId =
        selectedUnitType ||
        editBatch.unitTypeId ||
        editBatch.unit_type_id ||
        editBatch.unitTypeID;

      if (!drugId || !supplierId || !unitTypeId) {
        setShowError('Please select valid drug, supplier, and unit type');
        return;
      }

      const updateData: UpdateBatchInput = {
        batch_number: batchNumber || undefined,
        drug_id: Number(drugId),
        supplier_id: Number(supplierId),
        unit_type_id: Number(unitTypeId),
        manufacture_date: editBatch.manufactureDate || undefined,
        expiry_date: editBatch.expiryDate,
        unit_cost: editBatch.unitCost,
        unit_price: editBatch.unitPrice,
        purchase_date: editBatch.purchaseDate,
        low_stock_threshold: editBatch.reorderLevel || 10,
        // Always send the selection shown in the form (preloaded from the batch's current locations)
        location_ids: editLocationsLoaded
          ? editSelectedLocations.map((loc) => loc.id)
          : undefined,
        // Quantity can only be changed by admins; the backend rejects it from other roles
        current_qty:
          isAdmin && editQuantity !== '' ? Number(editQuantity) : undefined,
      };

      const res = await updateBatch(editBatch.id, updateData);

      if (res.ok) {
        setShowError(null);
        setShowEditModal(false);

        // Refresh the inventory list to show updated data
        refetchInventory();

        // Clear and refetch expanded row data for the edited batch
        const batchId = String(editBatch.id);
        setExpandedRowData((prev) => {
          const newData = { ...prev };
          delete newData[batchId]; // Remove existing data
          return newData;
        });
        fetchingBatchIds.current.delete(batchId); // Clear fetching flag

        setEditBatch(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setShowError(res.message);
      }
    } catch (err: any) {
      // Handle duplicate request error from backend
      if (err?.status === 409 || err?.message?.includes('Duplicate')) {
        setShowError('This request was already submitted. Please wait a moment.');
      } else {
      setShowError(err?.message || 'Failed to update batch');
      }
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteBatch = async () => {
    if (!deleteBatch) return;

    try {
      const res = await removeBatch(deleteBatch.id);

      if (res.ok) {
        setShowError(null);
        setShowDeleteModal(false);
        setDeleteBatch(null);

        // Refresh the inventory list to show updated data
        refetchInventory();
      } else {
        setShowError(res.message);
      }
    } catch (err: any) {
      setShowError(err?.message || 'Failed to delete batch');
    }
  };

  const handleCreateTransaction = async () => {
    // Prevent multiple submissions
    if (isSubmittingTransaction) {
      return;
    }

    if (!selectedBatchForTransaction) return;

    try {
      setIsSubmittingTransaction(true);
      setShowError(null);

      if (!transactionType || !transactionQuantity) {
        setShowError('Please fill in all required fields');
        return;
      }

      // Validate quantity for sales and negative returns
      const requestedQty = Number(transactionQuantity);
      const availableQty = selectedBatchForTransaction.quantity;

      if (
        (transactionType === 'sale' || transactionType === 'negative return') &&
        requestedQty > availableQty
      ) {
        setShowError(
          `Insufficient quantity. Available: ${availableQty}, Requested: ${requestedQty}`,
        );
        return;
      }

      // Sales follow the soonest-expiry-first rule. A warning is shown once;
      // submitting again with the same warning on screen means "Sell anyway".
      // The backend enforces 'block' itself, so a failed check falls through.
      if (transactionType === 'sale') {
        const warned =
          txExpiryConflicts?.policy === 'warn' &&
          txExpiryConflicts.conflicts.length > 0;
        if (!warned) {
          const check = await checkSaleExpiryOrder({
            items: [
              {
                batchId: Number(selectedBatchForTransaction.id),
                quantity: requestedQty,
              },
            ],
          }).catch(() => null);
          if (check && check.conflicts.length > 0) {
            setTxExpiryConflicts(check);
            return;
          }
        }
      }

      const res = await createTransaction({
        batch_id: Number(selectedBatchForTransaction.id),
        transaction_type: transactionType,
        quantity: Number(transactionQuantity),
        notes: transactionNotes || null,
      } as CreateTransactionInput);

      // Check if transaction was created successfully (has an id)
      if (res && (res as any).id) {
        setShowError(null);
        setShowTransactionModal(false);

        // Refresh the inventory list to show updated quantities
        refetchInventory();

        // Clear and refetch expanded row data for the batch to show updated transactions
        const batchId = String(selectedBatchForTransaction.id);
        setExpandedRowData((prev) => {
          const newData = { ...prev };
          delete newData[batchId]; // Remove existing data
          return newData;
        });
        fetchingBatchIds.current.delete(batchId); // Clear fetching flag

        setSelectedBatchForTransaction(null);
        resetTransactionForm();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setShowError((res as any).message || 'Transaction creation failed');
      }
    } catch (err: any) {
      // Handle duplicate request error from backend
      if (err?.status === 409 || err?.message?.includes('Duplicate')) {
        setShowError('This request was already submitted. Please wait a moment.');
      } else {
      // Extract error message from different possible locations
      let errorMessage = 'Failed to create transaction';
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.details?.message) {
        errorMessage = err.details.message;
      } else if (err?.details?.error) {
        errorMessage = err.details.error;
      }
      setShowError(errorMessage);
      }
    } finally {
      setIsSubmittingTransaction(false);
    }
  };

  const handleRowClick = (rowData: any) => {
    setSelectedBatchForTransaction(rowData);
    setShowTransactionModal(true);
    setShowError(null);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setIsSubmittingBatch(false);
    resetForm();
    setShowError(null);
    clearError();
  };

  // Function to fetch expanded row data
  const fetchExpandedRowData = useCallback(
    async (batchId: string) => {
      // If currently fetching, don't fetch again
      if (fetchingBatchIds.current.has(batchId)) {
        return;
      }

      // Check if already loaded using functional state update
      let shouldFetch = false;
      setExpandedRowData((prev) => {
        if (prev[batchId]?.loaded) {
          // Already loaded, don't change state
          return prev;
        }
        shouldFetch = true;
        return prev;
      });

      if (!shouldFetch) {
        return;
      }

      console.log(
        '[InventoryList] Fetching expanded row data for batchId:',
        batchId,
      );

      // Mark as currently fetching
      fetchingBatchIds.current.add(batchId);

      // Set loading state
      setExpandedRowData((prev) => ({
        ...prev,
        [batchId]: {
          locations: [],
          transactions: [],
          locationsLoading: true,
          transactionsLoading: true,
          locationsError: null,
          transactionsError: null,
          loaded: false,
        },
      }));

      // Fetch both locations and transactions
      try {
        const [locations, transactions] = await Promise.all([
          fetchLocationsByBatch(Number(batchId)),
          fetchTransactionsByBatch(Number(batchId)),
        ]);

        setExpandedRowData((prev) => ({
          ...prev,
          [batchId]: {
            locations: locations || [],
            transactions: transactions || [],
            locationsLoading: false,
            transactionsLoading: false,
            locationsError: null,
            transactionsError: null,
            loaded: true,
          },
        }));
      } catch (error: any) {
        console.error(
          '[InventoryList] Error fetching expanded row data:',
          error,
        );
        setExpandedRowData((prev) => ({
          ...prev,
          [batchId]: {
            locations: [],
            transactions: [],
            locationsLoading: false,
            transactionsLoading: false,
            locationsError: error?.message || 'Failed to load data',
            transactionsError: error?.message || 'Failed to load data',
            loaded: true,
          },
        }));
      } finally {
        // Remove from fetching set
        fetchingBatchIds.current.delete(batchId);
      }
    },
    [fetchLocationsByBatch, fetchTransactionsByBatch],
  );

  const ExpandedRowContent = ({ rowData }: { rowData: any }) => {
    const batchId = String(rowData.id);
    const rowExpandedData = expandedRowData[batchId];

    // Trigger data fetch on mount if not already loaded
    useEffect(() => {
      fetchExpandedRowData(batchId);
    }, [batchId, fetchExpandedRowData]);

    const formatDate = (dateStr: string) => {
      try {
        return new Date(dateStr).toLocaleDateString();
      } catch {
        return dateStr;
      }
    };

    // Use data from central state
    const locations = rowExpandedData?.locations || [];
    const transactions = rowExpandedData?.transactions || [];
    const locationsLoading = rowExpandedData?.locationsLoading || false;
    const transactionsLoading = rowExpandedData?.transactionsLoading || false;
    const locationsError = rowExpandedData?.locationsError;
    const transactionsError = rowExpandedData?.transactionsError;

    return (
      <div
        className="p-6"
        style={{ backgroundColor: 'var(--cds-layer-accent)' }}
      >
        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total On Hand Card */}
          <div
            className="p-4 rounded-md"
            style={{ backgroundColor: 'var(--cds-layer)' }}
          >
            <div className="text-sm font-medium text-gray-600 mb-1">
              Total On Hand
            </div>
            <div className="text-2xl font-bold">
              {rowData.unitTypeName
                ? `${rowData.quantity} ${rowData.unitTypeName}`
                : rowData.quantity}
            </div>
          </div>

          {/* Unit Cost Card */}
          <div
            className="p-4 rounded-md"
            style={{ backgroundColor: 'var(--cds-layer)' }}
          >
            <div className="text-sm font-medium text-gray-600 mb-1">
              Unit Cost
            </div>
            <div className="text-2xl font-bold">
              ETB {rowData.unitCost || rowData.unitPrice}
            </div>
          </div>

          {/* Reorder Level Card */}
          <div
            className="p-4 rounded-md"
            style={{ backgroundColor: 'var(--cds-layer)' }}
          >
            <div className="text-sm font-medium text-gray-600 mb-1">
              Reorder Level
            </div>
            <div className="text-2xl font-bold">{rowData.reorderLevel}</div>
          </div>
        </div>

        {/* Storage Locations Section */}
        <div className="mb-6">
          <h5 className="font-semibold text-md mb-3">Storage Locations</h5>
          {locationsLoading ? (
            <div className="text-sm text-gray-500">Loading locations...</div>
          ) : locationsError ? (
            <div className="text-sm text-red-600">
              Error loading locations: {locationsError}
            </div>
          ) : locations.length === 0 ? (
            <div className="text-sm text-gray-500">
              No storage locations assigned
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {locations.map((location: any, index: number) => (
                <div
                  key={index}
                  className="px-3 py-2 rounded-md text-sm"
                  style={{ backgroundColor: 'var(--cds-layer)' }}
                >
                  <span className="font-medium">{location.name}</span>
                  <span className="text-gray-600 ml-1">
                    ({location.locationType})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions Section */}
        <div>
          <h5 className="font-semibold text-md mb-3">
            Recent Transactions (Last 10)
          </h5>
          {transactionsLoading ? (
            <div className="text-sm text-gray-500">Loading transactions...</div>
          ) : transactionsError ? (
            <div className="text-sm text-red-600">
              Error loading transactions: {transactionsError}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-sm text-gray-500">No transactions found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--cds-border-subtle)',
                    }}
                  >
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Quantity</th>
                    <th className="text-left py-2">User</th>
                    <th className="text-left py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction: any, index: number) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: '1px solid var(--cds-border-subtle-01)',
                      }}
                    >
                      <td className="py-2">
                        {formatDate(transaction.transactionDate)}
                      </td>
                      <td className="py-2">{transaction.transactionType}</td>
                      <td className="py-2">{transaction.quantity}</td>
                      <td className="py-2">
                        {transaction.username || 'Unknown'}
                      </td>
                      <td className="py-2 max-w-xs truncate">
                        {transaction.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderExpandedRow = (rowData: any) => (
    <ExpandedRowContent rowData={rowData} />
  );

  const renderActionsMenu = (row: any) => (
    <OverflowMenu aria-label="overflow-menu">
      <OverflowMenuItem
        itemText="Edit"
        onClick={async () => {
          setShowError(null);
          setEditBatch({ ...row });
          setEditQuantity(String(row.quantity || row.currentQty || ''));
          setBatchNumber(row.batchNumberValue || row.batchNumber || '');
          // Set unit type by name if available, otherwise by ID
          const unitTypeName = row.unitTypeName;
          const unitTypeOption = unitTypeName 
            ? unitTypeOptions.find(ut => ut.text === unitTypeName)
            : null;
          setSelectedUnitType(unitTypeOption ? unitTypeOption.value : (row.unitTypeId ? String(row.unitTypeId) : ''));

          // Fetch current locations for this batch
          try {
            const currentLocations = await fetchLocationsByBatch(
              Number(row.id),
              { throwOnError: true },
            );
            const selectedLocs: SelectedLocation[] = (
              currentLocations || []
            ).map((loc: any) => ({
              id: loc.id,
              name: loc.name,
              type: loc.locationType,
            }));
            setEditSelectedLocations(selectedLocs);
            setEditLocationsLoaded(true);
          } catch (error) {
            console.error('Failed to fetch batch locations:', error);
            setEditSelectedLocations([]);
            setEditLocationsLoaded(false);
          }

          setShowEditModal(true);
        }}
      />
      <OverflowMenuItem
        itemText="Delete"
        onClick={() => {
          setShowError(null);
          setDeleteBatch(row);
          setShowDeleteModal(true);
        }}
      />
    </OverflowMenu>
  );

  // Format as "genericName (tradeName)" or just "genericName". Use id as value.
  const baseDrugOptions = products.map((p) => ({
    text: p.tradeName ? `${p.name} (${p.tradeName})` : p.name,
    value: String(p.id),
  }));

  // Ensure the currently selected drug (by id) is always present in the options
  const drugOptions = selectedDrugOption
    ? [
        selectedDrugOption,
        ...baseDrugOptions.filter(
          (opt) => opt.value !== selectedDrugOption.value,
        ),
      ]
    : baseDrugOptions;
  const supplierOptions = suppliers.map((s) => ({
    text: s.name,
    value: String(s.id),
  }));
  const unitTypeOptions = unitTypes
    .filter((ut) => ut.isActive)
    .map((ut) => ({
      text: ut.name,
      value: String(ut.id),
    }));
  const stockStatusOptions = [
    { text: 'All', value: 'All' },
    { text: 'In Stock', value: 'In stock' },
    { text: 'Out of Stock', value: 'Out of Stock' },
    { text: 'Low Stock', value: 'Low Stock' },
    { text: 'Expired', value: 'Expired' },
    { text: 'Near Expiry', value: 'Near-Expiry' },
  ];

  const transactionTypeOptions = [
    { text: 'Sale', value: 'sale' },
    { text: 'Inbound', value: 'inbound' },
    { text: 'Positive Return', value: 'positive return' },
    { text: 'Negative Return', value: 'negative return' },
  ];

  const modalFields: FormField[] = [
    {
      key: 'batchNumber',
      label: 'Batch Number (Optional)',
      type: 'text',
      value: batchNumber,
      onChange: (value) => setBatchNumber(value as string),
      placeholder: 'Enter batch number (e.g., BATCH-001)',
      required: false,
      autoComplete: 'off',
    },
    {
      key: 'drug',
      label: 'Drug',
      type: 'searchable-combobox',
      value: selectedDrug,
      onChange: (value) => setSelectedDrug(value as string),
      options: drugOptions,
      required: true,
      placeholder: 'Search drugs...',
      onSearch: handleDrugSearch,
    },
    {
      key: 'supplier',
      label: 'Supplier',
      type: 'searchable-combobox',
      value: selectedSupplier,
      onChange: (value) => setSelectedSupplier(value as string),
      options: supplierOptions,
      required: true,
      placeholder: 'Search suppliers...',
      onSearch: handleSupplierSearch,
    },
    {
      key: 'unitType',
      label: 'Unit Type',
      type: 'searchable-combobox',
      value: selectedUnitType,
      onChange: (value) => setSelectedUnitType(value as string),
      options: unitTypeOptions,
      required: true,
      placeholder: 'Search unit types...',
      onSearch: handleUnitTypeSearch,
    },
    {
      key: 'manufactureDate',
      label: 'Manufacture Date (Optional)',
      type: 'date',
      value: manufactureDate,
      onChange: (value) => setManufactureDate(value as string),
      required: false,
    },
    {
      key: 'expiryDate',
      label: 'Expiry Date',
      type: 'date',
      value: expiryDate,
      onChange: (value) => setExpiryDate(value as string),
      required: true,
    },
    {
      key: 'unitCost',
      label: 'Unit Cost',
      type: 'number',
      value: unitCost,
      onChange: (value) => setUnitCost(value as string),
      placeholder: 'Enter unit cost',
      required: true,
    },
    {
      key: 'unitPrice',
      label: 'Unit Price',
      type: 'number',
      value: unitPrice,
      onChange: (value) => setUnitPrice(value as string),
      placeholder: 'Enter unit price',
      required: true,
    },
    {
      key: 'purchaseDate',
      label: 'Purchase Date',
      type: 'date',
      value: purchaseDate,
      onChange: (value) => setPurchaseDate(value as string),
      required: true,
    },
    {
      key: 'currentQty',
      label: 'Current Quantity',
      type: 'number',
      value: currentQty,
      onChange: (value) => handleCurrentQtyChange(value as string),
      placeholder: 'Enter quantity',
      required: true,
    },
    {
      key: 'lowStockThreshold',
      label: 'Low Stock Threshold (Auto-suggested: 10% of quantity)',
      type: 'number',
      value: lowStockThreshold,
      onChange: (value) => setLowStockThreshold(value as string),
      placeholder: 'Auto-suggested based on quantity',
      required: false,
    },
    {
      key: 'locations',
      label: 'Storage Locations',
      type: 'custom',
      value: selectedLocations,
      onChange: (value) => setSelectedLocations(value as SelectedLocation[]),
      renderComponent: () => (
        <LocationSelector
          selectedLocations={selectedLocations}
          onChange={setSelectedLocations}
          placeholder="Search and select storage locations..."
        />
      ),
      required: false,
    },
  ];

  const transactionModalFields: FormField[] = [
    {
      key: 'batchInfo',
      label: 'Batch Information',
      type: 'text',
      value: selectedBatchForTransaction
        ? `${selectedBatchForTransaction.drugName}${
            selectedBatchForTransaction.strength
              ? ` (${selectedBatchForTransaction.strength})`
              : ''
          } - Batch #${selectedBatchForTransaction.batchNumber} (Available: ${
            selectedBatchForTransaction.unitTypeName
              ? `${selectedBatchForTransaction.quantity} ${selectedBatchForTransaction.unitTypeName}`
              : selectedBatchForTransaction.quantity
          })`
        : '',
      onChange: () => {}, // Read-only
      required: false,
    },
    {
      key: 'transactionType',
      label: 'Transaction Type',
      type: 'combobox',
      value: transactionType,
      onChange: (value) => setTransactionType(value as string),
      options: transactionTypeOptions,
      required: true,
      placeholder: 'Select transaction type...',
    },
    {
      key: 'quantity',
      label: 'Quantity',
      type: 'number',
      value: transactionQuantity,
      onChange: (value) => setTransactionQuantity(value as string),
      placeholder: 'Enter quantity',
      required: true,
    },
    {
      key: 'notes',
      label: 'Notes',
      type: 'textarea',
      value: transactionNotes,
      onChange: (value) => setTransactionNotes(value as string),
      placeholder: 'Optional notes...',
      required: false,
    },
  ];

  return (
    <GeneralPageLayout
      breadcrumbItems={[
        { label: 'PIMS', href: '/' },
        { label: 'Inventory', isCurrentPage: true },
      ]}
      title=""
      showExportButton={false}
      showSuccessNotification={showSuccess}
      successMessage="Inventory operation completed successfully"
      onCloseNotification={() => setShowSuccess(false)}
    >
      <SortableTable<any>
        title="Manage Inventory"
        headers={inventoryHeaders}
        data={inventory}
        filterOptions={[]}
        enableSearch={false}
        expandedRowContent={renderExpandedRow}
        customFilterSection={
          <div>
            {/* Top Row - Expiry Date Filters */}
            <div className="mb-4 flex flex-wrap gap-4 items-end">
              <div className="min-w-40">
                <DatePicker
                  dateFormat="Y-m-d"
                  datePickerType="single"
                  onChange={(dates) => {
                    const date = dates[0];
                    setExpiryFrom(
                      date ? date.toISOString().split('T')[0] : undefined,
                    );
                    setPage(1);
                  }}
                >
                  <DatePickerInput
                    placeholder="Expiry from"
                    labelText="Expiry From"
                    id="expiry-from"
                  />
                </DatePicker>
              </div>
              <div className="min-w-40">
                <DatePicker
                  dateFormat="Y-m-d"
                  datePickerType="single"
                  onChange={(dates) => {
                    const date = dates[0];
                    setExpiryTo(
                      date ? date.toISOString().split('T')[0] : undefined,
                    );
                    setPage(1);
                  }}
                >
                  <DatePickerInput
                    placeholder="Expiry to"
                    labelText="Expiry To"
                    id="expiry-to"
                  />
                </DatePicker>
              </div>
            </div>

            {/* Bottom Row - Stock Status and Drug Filters on left, Search and Add Button on right */}
            <div className="mb-4 flex flex-wrap gap-4 items-end justify-between">
              {/* Left side - Stock Status and Drug Filters */}
              <div className="flex flex-wrap gap-4 items-end">
                <div className="min-w-40">
                  <ComboBox
                    id="stock-status-filter"
                    items={stockStatusOptions}
                    itemToString={(item) => (item ? item.text : '')}
                    initialSelectedItem={{ text: 'In Stock', value: 'In stock' }}
                    onChange={({ selectedItem }) => {
                      const status = selectedItem?.value || 'All';
                      setStockStatus(status as any);
                      setPage(1);
                    }}
                    placeholder="Stock status..."
                    titleText="Stock Status"
                  />
                </div>
                <div className="min-w-48">
                  <ComboBox
                    id="drug-filter"
                    items={[{ text: 'All Drugs', value: '' }, ...drugOptions]}
                    itemToString={(item) => (item ? item.text : '')}
                    initialSelectedItem={{ text: 'All Drugs', value: '' }}
                    onInputChange={(inputValue: string) =>
                      handleDrugSearch(inputValue)
                    }
                    onChange={({ selectedItem }) => {
                      const selectedDrugId = selectedItem?.value || '';
                      if (selectedDrugId) {
                        setDrugId(Number(selectedDrugId));
                      } else {
                        setDrugId(undefined);
                      }
                      setPage(1);
                    }}
                    placeholder="Filter by drug..."
                    titleText="Drug"
                  />
                </div>
              </div>-

            {/* Right side - Search and Action Buttons */}
              <div className="flex items-end gap-3">
                 <div className="min-w-64">
                   <TextInput
                     id="search-input"
                     labelText="Search"
                     placeholder="Search (Drug Name, SKU, Batch Number, Supplier, Category, Location)"
                     value={q}
                     onChange={(e) => setQ(e.target.value)}
                     autoComplete="off"
                   />
                 </div>
               <Button
                 kind="secondary"
                 size="md"
                 onClick={() => {
                   setShowError(null);
                   setSaleSelectedBatch(null);
                   setSaleQuantity('');
                   setSaleCart([]);
                   setShowSaleModal(true);
                 }}
               >
                 Create Sale
               </Button>
                <Button
                  kind="primary"
                  size="md"
                  renderIcon={Add}
                  onClick={() => {
                    setShowError(null);
                    setShowAddModal(true);
                  }}
                >
                  Add Inventory
                </Button>
              </div>
            </div>
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
            const allowed = [
              'purchaseDate',
              'expiryDate',
              'currentQty',
              'drugName',
              'sku',
              'lowStockThreshold',
              'batchNumber',
            ] as const;
            const mapped =
              col === 'quantity'
                ? 'currentQty'
                : col === 'reorderLevel'
                  ? 'lowStockThreshold'
                  : col === 'batchNumber'
                    ? 'batchNumber'
                    : col;
            if (!(allowed as readonly string[]).includes(mapped as any)) return;
            setSortBy(mapped as any);
            setSortDir(dir.toLowerCase() as 'asc' | 'desc');
            setPage(1); // Reset to first page when sorting changes
          },
          search: q,
          onSearchChange: (value) => setQ(value),
          activeFilter: 'All',
          onFilterChange: () => {},
          sortableKeys: [
            'batchNumber',
            'drugName',
            'sku',
            'expiryDate',
            'quantity',
            'purchaseDate',
          ],
        }}
        getRowClassName={(row) =>
          (row as any).expiryDate &&
          new Date((row as any).expiryDate) < new Date()
            ? 'row-expired'
            : undefined
        }
        renderCell={(row, key) => {
          if (key === 'actions') {
            return renderActionsMenu(row);
          }

          // Drug name + strength
          if (key === 'drugName') {
            const strength = (row as any).strength;
            const label = strength
              ? `${(row as any).drugName} (${strength})`
              : (row as any).drugName;
            return (
              <div
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRowClick(row);
                }}
              >
                {label}
              </div>
            );
          }

          // Format quantity with unit type
          if (key === 'quantity') {
            const qty = (row as any).quantity || 0;
            const unitType = (row as any).unitTypeName || '';
            return (
              <div
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRowClick(row);
                }}
              >
                {unitType ? `${qty} ${unitType}` : qty}
              </div>
            );
          }

          // Make all non-action cells clickable
          return (
            <div
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                handleRowClick(row);
              }}
            >
              {(row as any)[key]}
            </div>
          );
        }}
      />

      {loading && (
        <div
          className="px-6 py-2 text-sm"
          style={{ color: 'var(--cds-text-secondary)' }}
        >
          Loading inventory...
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
        onSubmit={handleAddBatch}
        title="Add Inventory Batch"
        submitButtonText="Add Batch"
        fields={modalFields}
        errorMessage={showError}
        onClearError={() => setShowError(null)}
        isSubmitting={isSubmittingBatch}
      />

      <GenericModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setIsSubmittingEdit(false);
          setEditQuantity('');
          setEditSelectedLocations([]);
          setShowError(null);
          clearError();
        }}
        onSubmit={handleEditBatch}
        title="Edit Inventory Batch"
        submitButtonText="Save Changes"
        isSubmitting={isSubmittingEdit}
        fields={
          editBatch
            ? [
                {
                  key: 'drug',
                  label: 'Drug',
                  type: 'text',
                  value: editBatch.drugName,
                  onChange: () => {}, // Read-only for edit
                },
                {
                  key: 'supplier',
                  label: 'Supplier',
                  type: 'text',
                  value: editBatch.supplier,
                  onChange: () => {}, // Read-only for edit
                },
                {
                  key: 'unitType',
                  label: 'Unit Type',
                  type: 'searchable-combobox',
                  value: selectedUnitType,
                  onChange: (value) => setSelectedUnitType(value as string),
                  options: unitTypeOptions,
                  required: true,
                  placeholder: 'Search unit types...',
                  onSearch: handleUnitTypeSearch,
                },
                {
                  key: 'batchNumber',
                  label: 'Batch Number (Optional)',
                  type: 'text',
                  value: batchNumber,
                  onChange: (v) => setBatchNumber(v as string),
                  placeholder: 'Enter batch number (e.g., BATCH-001)',
                  required: false,
                  autoComplete: 'off',
                },
                {
                  key: 'manufactureDate',
                  label: 'Manufacture Date (Optional)',
                  type: 'date',
                  value: editBatch.manufactureDate,
                  onChange: (v) =>
                    setEditBatch({
                      ...editBatch,
                      manufactureDate: v as string,
                    }),
                  required: false,
                },
                {
                  key: 'expiryDate',
                  label: 'Expiry Date',
                  type: 'date',
                  value: editBatch.expiryDate,
                  onChange: (v) =>
                    setEditBatch({ ...editBatch, expiryDate: v as string }),
                  required: true,
                },
                {
                  key: 'unitCost',
                  label: 'Unit Cost',
                  type: 'number',
                  value: String(editBatch.unitCost || ''),
                  onChange: (v) =>
                    setEditBatch({
                      ...editBatch,
                      unitCost: parseFloat(v as string) || 0,
                    }),
                  required: true,
                },
                {
                  key: 'unitPrice',
                  label: 'Unit Price',
                  type: 'number',
                  value: String(editBatch.unitPrice || ''),
                  onChange: (v) =>
                    setEditBatch({
                      ...editBatch,
                      unitPrice: parseFloat(v as string) || 0,
                    }),
                  required: true,
                },
                {
                  key: 'purchaseDate',
                  label: 'Purchase Date',
                  type: 'date',
                  value: editBatch.purchaseDate,
                  onChange: (v) =>
                    setEditBatch({ ...editBatch, purchaseDate: v as string }),
                  required: true,
                },
                // Quantity field - Admin only
                ...(isAdmin
                  ? [
                      {
                        key: 'currentQty',
                        label: 'Current Quantity (Admin Only)',
                        type: 'number' as const,
                        value: editQuantity,
                        onChange: (v: any) => setEditQuantity(v as string),
                        placeholder: 'Enter quantity',
                        required: false,
                      },
                    ]
                  : []),
                {
                  key: 'lowStockThreshold',
                  label: 'Low Stock Threshold',
                  type: 'number',
                  value: String(editBatch.reorderLevel || ''),
                  onChange: (v) =>
                    setEditBatch({
                      ...editBatch,
                      reorderLevel: parseInt(v as string, 10) || 0,
                    }),
                  required: false,
                },
                {
                  key: 'locations',
                  label: 'Storage Locations',
                  type: 'custom',
                  value: editSelectedLocations,
                  onChange: (value) => {
                    setEditSelectedLocations(value as SelectedLocation[]);
                    setEditBatch({
                      ...editBatch,
                      locationIds: (value as SelectedLocation[]).map(
                        (loc) => loc.id,
                      ),
                    });
                  },
                  renderComponent: () => (
                    <LocationSelector
                      selectedLocations={editSelectedLocations}
                      onChange={(locations) => {
                        setEditSelectedLocations(locations);
                        setEditLocationsLoaded(true);
                        setEditBatch({
                          ...editBatch,
                          locationIds: locations.map((loc) => loc.id),
                        });
                      }}
                      placeholder="Search and select storage locations..."
                    />
                  ),
                  required: false,
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
        <ModalHeader label="" title="Delete Batch" />
        <ModalBody>
          {showError && (
            <InlineNotification
              kind="error"
              title="Delete failed"
              subtitle={showError}
              onCloseButtonClick={() => setShowError(null)}
              className="mb-4"
            />
          )}
          Are you sure you want to delete batch{' '}
          <b>{deleteBatch?.batchNumber}</b> for <b>{deleteBatch?.drugName}</b>?
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button kind="danger" onClick={handleDeleteBatch}>
            Delete
          </Button>
        </ModalFooter>
      </ComposedModal>

      <GenericModal
        isOpen={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false);
          setIsSubmittingTransaction(false);
          setSelectedBatchForTransaction(null);
          resetTransactionForm();
          setShowError(null);
          clearError();
        }}
        onSubmit={handleCreateTransaction}
        title={`Create Transaction - ${selectedBatchForTransaction ? selectedBatchForTransaction.drugName : ''}`}
        submitButtonText={
          txExpiryConflicts?.policy === 'warn' &&
          txExpiryConflicts.conflicts.length > 0
            ? 'Sell Anyway'
            : 'Create Transaction'
        }
        fields={transactionModalFields}
        errorMessage={showError}
        onClearError={() => setShowError(null)}
        isSubmitting={isSubmittingTransaction}
      >
        {txExpiryConflicts && (
          <ExpiryOrderNotice
            policy={txExpiryConflicts.policy}
            conflicts={txExpiryConflicts.conflicts}
          />
        )}
      </GenericModal>

      {/* Sale group (cart) modal */}
      <ComposedModal
        open={showSaleModal}
        onClose={() => {
          setShowSaleModal(false);
          setSaleSelectedBatch(null);
          setSaleQuantity('');
          setSaleCart([]);
          setSaleSubmitting(false);
          setShowError(null);
        }}
      >
        <ModalHeader label="" title="Create Sale" />
        <ModalBody>
          {showError && (
            <InlineNotification
              kind="error"
              title="Sale Error"
              subtitle={showError}
              hideCloseButton={false}
              onCloseButtonClick={() => setShowError(null)}
              className="mb-4"
            />
          )}

          {/* Item selection */}
          <div className="mb-4 space-y-3">
            <ComboBox
              id="sale-item-combobox"
              titleText="Select item from inventory"
              placeholder="Search by drug, SKU or batch..."
              items={saleBatches}
              itemToString={(item) =>
                item
                  ? `${item.drugName}${
                      item.strength ? ` (${item.strength})` : ''
                    } - Batch #${item.batchNumber} (Available: ${item.quantity} ${
                      item.unitTypeName || ''
                    }${item.expiryDate ? `, expires ${item.expiryDate}` : ''})`
                  : ''
              }
              selectedItem={saleSelectedBatch as any}
              onChange={({ selectedItem }) => {
                setSaleSelectedBatch((selectedItem as SaleBatchRow) || null);
              }}
              onInputChange={(val: string) => {
                setSaleBatchSearch(val);
              }}
            />

            <NumberInput
              id="sale-quantity-input"
              min={1}
              value={saleQuantity}
              onChange={(_, { value }) => setSaleQuantity(String(value))}
              label="Quantity"
              placeholder="Enter quantity to add"
            />

            <Button
              kind="primary"
              size="sm"
              disabled={!saleSelectedBatch || !saleQuantity || saleSubmitting}
              onClick={() => {
                if (!saleSelectedBatch) {
                  setShowError('Please select an item');
                  return;
                }
                const qty = Number(saleQuantity);
                if (!qty || qty <= 0 || Number.isNaN(qty)) {
                  setShowError('Please enter a valid quantity');
                  return;
                }

                const existingForBatch = saleCart.filter(
                  (item) => item.batchId === Number(saleSelectedBatch.id),
                );
                const alreadyInCartQty = existingForBatch.reduce(
                  (sum, item) => sum + item.quantity,
                  0,
                );
                const available = saleSelectedBatch.quantity;

                if (qty + alreadyInCartQty > available) {
                  setShowError(
                    `Insufficient quantity. Available: ${available - alreadyInCartQty}, Requested: ${qty}`,
                  );
                  return;
                }

                setSaleCart((prev) => {
                  const existingIndex = prev.findIndex(
                    (p) => p.batchId === Number(saleSelectedBatch.id),
                  );
                  if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = {
                      ...updated[existingIndex],
                      quantity: updated[existingIndex].quantity + qty,
                    };
                    return updated;
                  }
                  return [
                    ...prev,
                    {
                      batchId: Number(saleSelectedBatch.id),
                      drugName: saleSelectedBatch.drugName,
                      batchNumber: saleSelectedBatch.batchNumber,
                      unitTypeName: saleSelectedBatch.unitTypeName,
                      availableQty: saleSelectedBatch.quantity,
                      quantity: qty,
                    },
                  ];
                });

                setSaleQuantity('');
                setShowError(null);
              }}
            >
              Add to Sale
            </Button>
          </div>

          {expiryConflicts && (
            <ExpiryOrderNotice
              policy={expiryConflicts.policy}
              conflicts={expiryConflicts.conflicts}
            />
          )}

          {/* Cart preview */}
          <div>
            <h5 className="font-semibold mb-2">Selected Items</h5>
            {saleCart.length === 0 ? (
              <p
                className="text-sm"
                style={{ color: 'var(--cds-text-secondary)' }}
              >
                No items added yet. Use the search above to add items to this
                sale.
              </p>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        backgroundColor: 'var(--cds-layer-accent)',
                        borderBottom: '1px solid var(--cds-border-subtle)',
                      }}
                    >
                      <th className="text-left px-3 py-2">Drug</th>
                      <th className="text-left px-3 py-2">Batch</th>
                      <th className="text-left px-3 py-2">Qty</th>
                      <th className="text-left px-3 py-2">Available</th>
                      <th className="text-right px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saleCart.map((item) => (
                      <tr
                        key={item.batchId}
                        style={{
                          borderBottom:
                            '1px solid var(--cds-border-subtle-01)',
                        }}
                      >
                        <td className="px-3 py-2 truncate">
                          {item.drugName}
                        </td>
                        <td className="px-3 py-2">{item.batchNumber}</td>
                        <td className="px-3 py-2">
                          {item.quantity}{' '}
                          {item.unitTypeName ? item.unitTypeName : ''}
                        </td>
                        <td className="px-3 py-2">
                          {item.availableQty}{' '}
                          {item.unitTypeName ? item.unitTypeName : ''}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            kind="ghost"
                            size="sm"
                            onClick={() =>
                              setSaleCart((prev) =>
                                prev.filter((p) => p.batchId !== item.batchId),
                              )
                            }
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            kind="secondary"
            onClick={() => {
              setShowSaleModal(false);
              setSaleSelectedBatch(null);
              setSaleQuantity('');
              setSaleCart([]);
              setSaleSubmitting(false);
              setShowError(null);
            }}
            disabled={saleSubmitting}
          >
            Cancel
          </Button>
          <Button
            kind="primary"
            disabled={
              saleCart.length === 0 ||
              saleSubmitting ||
              (expiryConflicts?.policy === 'block' &&
                expiryConflicts.conflicts.length > 0)
            }
            onClick={async () => {
              // After a warning, the next click means "Sell anyway"
              const sellAnyway =
                expiryWarningAccepted ||
                (expiryConflicts?.policy === 'warn' &&
                  expiryConflicts.conflicts.length > 0);
              if (sellAnyway && !expiryWarningAccepted) {
                setExpiryWarningAccepted(true);
              }

              // Prevent multiple submissions
              if (saleSubmitting) {
                return;
              }

              try {
                setSaleSubmitting(true);
                setShowError(null);

                const saleRequest = {
                  notes: undefined,
                  items: saleCart.map((item) => ({
                    batchId: item.batchId,
                    quantity: item.quantity,
                  })),
                };

                // Check for batches of the same product that expire sooner.
                // The backend enforces 'block' on its own, so if the check
                // itself fails we fall through to creating the sale.
                if (!sellAnyway) {
                  const check = await checkSaleExpiryOrder(saleRequest).catch(
                    () => null,
                  );
                  if (check && check.conflicts.length > 0) {
                    setExpiryConflicts(check);
                    setSaleSubmitting(false);
                    return;
                  }
                }

                await createSaleGroup(saleRequest);

                setShowSaleModal(false);
                setSaleSelectedBatch(null);
                setSaleQuantity('');
                setSaleCart([]);
                setSaleSubmitting(false);

                // Refresh inventory to reflect deducted quantities
                refetchInventory();
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
              } catch (err: any) {
                setSaleSubmitting(false);
                // Handle duplicate request error from backend
                if (err?.status === 409 || err?.message?.includes('Duplicate')) {
                  setShowError('This request was already submitted. Please wait a moment.');
                } else {
                  setShowError(err?.message || 'Failed to create grouped sale');
                }
              }
            }}
          >
            {saleSubmitting
              ? 'Creating Sale...'
              : expiryConflicts?.policy === 'warn' &&
                  expiryConflicts.conflicts.length > 0
                ? 'Sell Anyway'
                : 'Create Sale'}
          </Button>
        </ModalFooter>
      </ComposedModal>
    </GeneralPageLayout>
  );
};

export default InventoryList;

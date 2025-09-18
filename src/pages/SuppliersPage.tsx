import { useState } from 'react';
import GeneralPageLayout from '../components/GeneralPageLayout';
import SortableTable from '../components/SortableTable';
import SupplierExpandedRow from '../components/SupplierExpandedRow';
import {
  Button,
  OverflowMenu,
  OverflowMenuItem,
  InlineNotification,
} from '@carbon/react';
import { Add } from '@carbon/icons-react';
import GenericModal from '../components/GenericModal';
import {
  ComposedModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@carbon/react';
import {
  supplierHeaders,
  supplierFilterOptions,
  supplierCustomFilter,
  type SupplierItem,
} from '../data/supplierData';
import { useSuppliers } from '../hooks/useSuppliers';
import {
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../api/suppliers';
import type {
  CreateSupplierInput,
  UpdateSupplierInput,
} from '../types/supplier';

const SuppliersPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSupplier, setEditSupplier] = useState<SupplierItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSupplierItem, setDeleteSupplierItem] =
    useState<SupplierItem | null>(null);
  const [showError, setShowError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const {
    suppliers,
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
  } = useSuppliers();

  const resetForm = () => {
    setName('');
    setContactName('');
    setPhone('');
    setEmail('');
    setAddress('');
  };

  const handleAddSupplier = async () => {
    try {
      await createSupplier({
        name,
        contact_name: contactName,
        phone,
        email,
        address,
      } as CreateSupplierInput);
      setShowAddModal(false);
      setShowSuccessMessage(true);
      setShowError(null);
      resetForm();
      refetch();
    } catch (err) {
      setShowError((err as any)?.message || String(err));
    }
  };

  const handleEditSupplier = async () => {
    if (!editSupplier) return;
    try {
      await updateSupplier(Number(editSupplier.id), {
        name: editSupplier.name,
        contact_name: editSupplier.contactName,
        phone: editSupplier.phone,
        email: editSupplier.email,
        address: editSupplier.address,
      } as UpdateSupplierInput);
      setShowEditModal(false);
      setEditSupplier(null);
      setShowSuccessMessage(true);
      setShowError(null);
      refetch();
    } catch (err) {
      setShowError((err as any)?.message || String(err));
    }
  };

  const handleDeleteSupplier = async () => {
    if (!deleteSupplierItem) return;
    try {
      await deleteSupplier(Number(deleteSupplierItem.id));
      setShowDeleteModal(false);
      setDeleteSupplierItem(null);
      setShowError(null);
      refetch();
    } catch (err) {
      setShowError((err as any)?.message || String(err));
    }
  };

  // Expanded row content for suppliers showing real orders
  const renderExpandedRow = (rowData: SupplierItem) => {
    return <SupplierExpandedRow supplier={rowData} />;
  };

  const renderActionsMenu = (row: SupplierItem) => (
    <OverflowMenu aria-label="overflow-menu">
      <OverflowMenuItem
        itemText="Edit"
        onClick={() => {
          setEditSupplier(row);
          setShowEditModal(true);
        }}
      />
      <OverflowMenuItem
        itemText="Delete"
        onClick={() => {
          setDeleteSupplierItem(row);
          setShowDeleteModal(true);
        }}
      />
    </OverflowMenu>
  );

  return (
    <GeneralPageLayout
      breadcrumbItems={[
        { label: 'PIMS', href: '/' },
        { label: 'Supplier List', isCurrentPage: true },
      ]}
      title=""
      showExportButton={true}
      onExportClick={() => console.log('Export clicked')}
      showSuccessNotification={showSuccessMessage}
      successMessage="Supplier saved successfully"
      onCloseNotification={() => setShowSuccessMessage(false)}
    >
      <div className="max-w-full">
        <SortableTable<SupplierItem>
          title="Manage Suppliers"
          headers={supplierHeaders}
          data={suppliers}
          filterOptions={[]}
          searchField="name"
          searchPlaceholder="Search (Name, Contact, Phone, Email)"
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
              Add Supplier
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
              const allowed = [
                'name',
                'contactName',
                'phone',
                'email',
              ] as const;
              if (!(allowed as readonly string[]).includes(col)) return;
              setSortBy(col as any);
              setSortDir(dir);
            },
            search: q,
            onSearchChange: (value) => setQ(value),
            activeFilter: 'All',
            onFilterChange: () => {},
            sortableKeys: ['name', 'contactName', 'phone', 'email'],
          }}
          renderCell={(row, key) =>
            key === 'actions' ? renderActionsMenu(row) : row[key]
          }
        />
      </div>
      {loading && (
        <div
          className="px-6 py-2 text-sm"
          style={{ color: 'var(--cds-text-secondary)' }}
        >
          Loading suppliers...
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
        onClose={() => {
          setShowAddModal(false);
          setShowError(null);
        }}
        onSubmit={handleAddSupplier}
        title="Add Supplier"
        submitButtonText="Add Supplier"
        errorMessage={showError}
        onClearError={() => setShowError(null)}
        fields={[
          {
            key: 'name',
            label: 'Name',
            type: 'text',
            value: name,
            onChange: (v) => setName(v as string),
            placeholder: 'Enter supplier name',
            required: true,
          },
          {
            key: 'contactName',
            label: 'Contact Name',
            type: 'text',
            value: contactName,
            onChange: (v) => setContactName(v as string),
            placeholder: 'Enter contact name',
          },
          {
            key: 'phone',
            label: 'Phone',
            type: 'text',
            value: phone,
            onChange: (v) => setPhone(v as string),
            placeholder: 'Enter phone number',
            required: true,
          },
          {
            key: 'email',
            label: 'Email',
            type: 'text',
            value: email,
            onChange: (v) => setEmail(v as string),
            placeholder: 'Enter email address',
            validate: (v) =>
              v
                ? /.+@.+/.test(String(v))
                  ? undefined
                  : 'Invalid email'
                : undefined,
          },
          {
            key: 'address',
            label: 'Address',
            type: 'text',
            value: address,
            onChange: (v) => setAddress(v as string),
            placeholder: 'Enter address',
          },
        ]}
      />

      <GenericModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setShowError(null);
        }}
        onSubmit={handleEditSupplier}
        title="Edit Supplier"
        submitButtonText="Save Changes"
        errorMessage={showError}
        onClearError={() => setShowError(null)}
        fields={
          editSupplier
            ? [
                {
                  key: 'name',
                  label: 'Name',
                  type: 'text',
                  value: editSupplier.name,
                  onChange: (value) =>
                    setEditSupplier({ ...editSupplier, name: value as string }),
                  placeholder: 'Enter supplier name',
                  required: true,
                },
                {
                  key: 'contactName',
                  label: 'Contact Name',
                  type: 'text',
                  value: editSupplier.contactName,
                  onChange: (value) =>
                    setEditSupplier({
                      ...editSupplier,
                      contactName: value as string,
                    }),
                  placeholder: 'Enter contact name',
                },
                {
                  key: 'phone',
                  label: 'Phone',
                  type: 'text',
                  value: editSupplier.phone,
                  onChange: (value) =>
                    setEditSupplier({
                      ...editSupplier,
                      phone: value as string,
                    }),
                  placeholder: 'Enter phone number',
                  required: true,
                },
                {
                  key: 'email',
                  label: 'Email',
                  type: 'text',
                  value: editSupplier.email,
                  onChange: (value) =>
                    setEditSupplier({
                      ...editSupplier,
                      email: value as string,
                    }),
                  placeholder: 'Enter email address',
                  validate: (v) =>
                    v
                      ? /.+@.+/.test(String(v))
                        ? undefined
                        : 'Invalid email'
                      : undefined,
                },
                {
                  key: 'address',
                  label: 'Address',
                  type: 'text',
                  value: editSupplier.address,
                  onChange: (value) =>
                    setEditSupplier({
                      ...editSupplier,
                      address: value as string,
                    }),
                  placeholder: 'Enter address',
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
        <ModalHeader label="" title="Delete Supplier" />
        <ModalBody>
          Are you sure you want to delete <b>{deleteSupplierItem?.name}</b>?
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button kind="danger" onClick={handleDeleteSupplier}>
            Delete
          </Button>
        </ModalFooter>
      </ComposedModal>
    </GeneralPageLayout>
  );
};

export default SuppliersPage;

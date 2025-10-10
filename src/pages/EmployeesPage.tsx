import { useMemo, useState } from 'react';
import GeneralPageLayout from '../components/GeneralPageLayout';
import SortableTable from '../components/SortableTable';
import { Button, InlineNotification } from '@carbon/react';
import { Add } from '@carbon/icons-react';
import GenericModal from '../components/GenericModal';
import { employeeHeaders, type EmployeeItem } from '../data/employeeData';
import { OverflowMenu, OverflowMenuItem } from '@carbon/react';
import {
  ComposedModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@carbon/react';
import { useEmployees } from '../hooks/useEmployees';
import { createUser, updateUser, deleteUser } from '../api/users';
import type { CreateUserInput, UpdateUserInput } from '../types/user';

type RoleEnum = 'ADMIN' | 'MANAGER' | 'PHARMACIST' | 'SELLER' | '';

const EmployeesPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<EmployeeItem | null>(null);
  const [editPassword, setEditPassword] = useState<string>('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmployee, setDeleteEmployee] = useState<EmployeeItem | null>(
    null,
  );

  // Form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleEnum>('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const {
    employees,
    loading,
    error,
    refetch,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
  } = useEmployees();
  const [formError, setFormError] = useState<string | null>(null);

  // Static roles list - no need to fetch from backend since they don't change
  const staticRoles = ['ADMIN', 'MANAGER', 'PHARMACIST', 'SELLER'];

  // Static filter options for roles
  const filterOptions = useMemo(() => {
    return ['All Roles', ...staticRoles];
  }, [staticRoles]);

  // Custom filter using static role set
  const employeeCustomFilter = (item: EmployeeItem, filterValue: string) => {
    if (!filterValue || filterValue === 'All Roles') return true;
    return item.role === filterValue;
  };

  // Role options for dropdowns using static list
  const roleOptions = useMemo(
    () => staticRoles.map((role) => ({ text: role, value: role })),
    [staticRoles],
  );

  if (loading) return <div>Loading...</div>;

  const resetForm = () => {
    setName('');
    setUsername('');
    setSelectedRole('');
    setEmail('');
    setPhoneNumber('');
    setPassword('');
  };

  const renderActionsMenu = (row: EmployeeItem) => (
    <OverflowMenu aria-label="overflow-menu">
      <OverflowMenuItem
        itemText="Edit"
        onClick={() => {
          setEditEmployee(row);
          setEditPassword('');
          setShowEditModal(true);
        }}
      />
      <OverflowMenuItem
        itemText="Delete"
        onClick={() => {
          setDeleteEmployee(row);
          setShowDeleteModal(true);
        }}
      />
    </OverflowMenu>
  );

  // Add Employee - send role as enum string
  const handleAddEmployee = async () => {
    try {
      if (!selectedRole) {
        setFormError('Please select a role.');
        return;
      }
      const finalPassword =
        password.trim() || Math.random().toString(36).slice(-10);

      const payload: CreateUserInput = {
        username,
        password: finalPassword,
        full_name: name,
        email: email.trim() || undefined,
        phone_number: phoneNumber.trim() || undefined,
        role: selectedRole as any,
      } as unknown as CreateUserInput;

      await createUser(payload);

      setShowAddModal(false);
      setShowSuccess(true);
      setFormError(null);
      resetForm();
      refetch();
    } catch (err: any) {
      setFormError(err?.message || String(err));
    }
  };

  // Edit Employee - send role as enum string
  const handleEditEmployee = async () => {
    if (!editEmployee) return;
    try {
      const payload: UpdateUserInput = {
        username: editEmployee.username,
        full_name: editEmployee.name,
        email: editEmployee.email || undefined,
        phone_number: editEmployee.phoneNumber || undefined,
        role: (editEmployee.role as any) || undefined,
      } as unknown as UpdateUserInput;
      (payload as any).password = editPassword || '';

      await updateUser(Number(editEmployee.id), payload);
      setShowEditModal(false);
      setEditEmployee(null);
      setEditPassword('');
      setShowSuccess(true);
      setFormError(null);
      refetch();
    } catch (err: any) {
      setFormError(err?.message || String(err));
    }
  };

  // Delete Employee
  const handleDeleteEmployee = async () => {
    if (!deleteEmployee) return;
    try {
      await deleteUser(Number(deleteEmployee.id));
      setShowDeleteModal(false);
      setDeleteEmployee(null);
      refetch();
    } catch (err) {
      console.error('Failed to delete employee:', err);
      alert('Failed to delete employee: ' + String(err));
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  return (
    <GeneralPageLayout
      breadcrumbItems={[
        { label: 'PIMS', href: '/' },
        { label: 'Employee List', isCurrentPage: true },
      ]}
      title=""
      showExportButton={false}
      onExportClick={() => console.log('Export clicked')}
      showSuccessNotification={showSuccess}
      successMessage="Employee saved successfully"
      onCloseNotification={() => setShowSuccess(false)}
    >
      <SortableTable<EmployeeItem>
        title="Manage Employees"
        headers={employeeHeaders}
        data={employees}
        filterOptions={filterOptions}
        customFilters={employeeCustomFilter}
        searchField="name"
        searchPlaceholder="Search (Name, Username, Role, Email)"
        searchActions={
          <Button
            kind="primary"
            size="md"
            renderIcon={Add}
            onClick={() => {
              setFormError(null);
              setShowAddModal(true);
            }}
          >
            Add Employee
          </Button>
        }
        renderCell={(row, key) =>
          key === 'actions'
            ? renderActionsMenu(row)
            : row[key as keyof EmployeeItem]
        }
        controlled={{
          sortColumn: sortBy,
          sortDirection: sortDir.toUpperCase() as 'ASC' | 'DESC',
          onSort: (col, dir) => {
            const allowed = [
              'id',
              'name',
              'username',
              'role',
              'email',
              'phoneNumber',
            ] as const;
            if (!(allowed as readonly string[]).includes(col)) return;
            setSortBy(col as any);
            setSortDir(dir.toLowerCase() as 'asc' | 'desc');
          },
        }}
      />

      {(error || formError) && !showAddModal && !showEditModal && (
        <div className="mx-6 mb-4">
          <InlineNotification
            kind="error"
            title="Error"
            subtitle={(formError || error) as string}
            hideCloseButton={false}
            onCloseButtonClick={() => setFormError(null)}
          />
        </div>
      )}

      <GenericModal
        isOpen={showAddModal}
        onClose={() => {
          handleCloseModal();
          setFormError(null);
        }}
        onSubmit={handleAddEmployee}
        title="Add Employee"
        submitButtonText="Add Employee"
        errorMessage={formError}
        onClearError={() => setFormError(null)}
        fields={[
          {
            key: 'name',
            label: 'Full Name',
            type: 'text',
            value: name,
            onChange: (v) => setName(v as string),
            placeholder: 'Enter full name',
            required: true,
          },
          {
            key: 'username',
            label: 'Username',
            type: 'text',
            value: username,
            onChange: (v) => setUsername(v as string),
            placeholder: 'Enter username',
            required: true,
          },
          {
            key: 'role',
            label: 'Role',
            type: 'dropdown',
            value: selectedRole,
            onChange: (v) => setSelectedRole(v as RoleEnum),
            options: roleOptions,
            required: true,
            placeholder: 'Select role',
          },
          {
            key: 'email',
            label: 'Email',
            type: 'text',
            value: email,
            onChange: (v) => setEmail(v as string),
            placeholder: 'Enter email address (optional)',
            required: false,
            validate: (v) => {
              const val = String(v).trim();
              if (val && !/.+@.+/.test(val)) return 'Invalid email';
              return undefined;
            },
          },
          {
            key: 'phoneNumber',
            label: 'Phone Number',
            type: 'text',
            value: phoneNumber,
            onChange: (v) => setPhoneNumber(v as string),
            placeholder: 'Enter phone number (optional)',
            required: false,
          },
          {
            key: 'password',
            label: 'Initial Password',
            type: 'text',
            value: password,
            onChange: (v) => setPassword(v as string),
            placeholder: 'Leave blank to auto-generate',
          },
        ]}
      />

      <GenericModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setFormError(null);
          setEditPassword('');
        }}
        onSubmit={() => {
          handleEditEmployee();
        }}
        title="Edit Employee"
        submitButtonText="Save Changes"
        errorMessage={formError}
        onClearError={() => setFormError(null)}
        fields={
          editEmployee
            ? [
                {
                  key: 'name',
                  label: 'Full Name',
                  type: 'text',
                  value: editEmployee.name,
                  onChange: (v) =>
                    setEditEmployee({ ...editEmployee, name: v as string }),
                  placeholder: 'Enter full name',
                  required: true,
                },
                {
                  key: 'username',
                  label: 'Username',
                  type: 'text',
                  value: editEmployee.username,
                  onChange: (v) =>
                    setEditEmployee({ ...editEmployee, username: v as string }),
                  placeholder: 'Enter username',
                  required: true,
                },
                {
                  key: 'role',
                  label: 'Role',
                  type: 'dropdown',
                  value: editEmployee.role,
                  onChange: (v) =>
                    setEditEmployee({ ...editEmployee, role: v as string }),
                  options: roleOptions,
                  required: true,
                  placeholder: 'Select role',
                },
                {
                  key: 'password',
                  label: 'New Password',
                  type: 'text',
                  value: editPassword,
                  onChange: (v) => setEditPassword(v as string),
                  placeholder: 'Leave blank to keep current password',
                },
                {
                  key: 'email',
                  label: 'Email',
                  type: 'text',
                  value: editEmployee.email || '',
                  onChange: (v) =>
                    setEditEmployee({ ...editEmployee, email: v as string }),
                  placeholder: 'Enter email address (optional)',
                  required: false,
                  validate: (v) => {
                    const val = String(v).trim();
                    if (val && !/.+@.+/.test(val)) return 'Invalid email';
                    return undefined;
                  },
                },
                {
                  key: 'phoneNumber',
                  label: 'Phone Number',
                  type: 'text',
                  value: editEmployee.phoneNumber || '',
                  onChange: (v) =>
                    setEditEmployee({
                      ...editEmployee,
                      phoneNumber: v as string,
                    }),
                  placeholder: 'Enter phone number (optional)',
                  required: false,
                },
              ]
            : []
        }
      />

      <ComposedModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setFormError(null);
        }}
      >
        <ModalHeader label="" title="Delete Employee" />
        <ModalBody>
          Are you sure you want to delete <b>{deleteEmployee?.name}</b>?
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button kind="danger" onClick={handleDeleteEmployee}>
            Delete
          </Button>
        </ModalFooter>
      </ComposedModal>
    </GeneralPageLayout>
  );
};

export default EmployeesPage;

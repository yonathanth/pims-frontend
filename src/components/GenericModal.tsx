import { type ReactNode } from 'react';
import {
  Button,
  TextInput,
  InlineNotification,
  ComboBox,
  MultiSelect,
} from '@carbon/react';

export interface FormField {
  key: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'date'
    | 'textarea'
    | 'dropdown'
    | 'combobox'
    | 'searchable-combobox'
    | 'multi-select'
    | 'custom';
  value: string | number | string[] | any;
  onChange: (value: string | number | string[] | any) => void;
  options?: Array<{ text: string; value: string }>;
  placeholder?: string;
  required?: boolean; // if true, value must be non-empty
  validate?: (
    value: string | number | string[] | any,
  ) => string | undefined | null; // return error message
  onSearch?: (searchTerm: string) => void; // for searchable-combobox
  loading?: boolean; // for searchable-combobox
  disabled?: boolean; // for disabling field
  renderComponent?: () => React.ReactNode; // for custom field type
}

export interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  submitButtonText?: string;
  fields: FormField[];
  children?: ReactNode;
  /** Optional max width for the modal content. Accepts px number or any CSS size (e.g., '72rem', '90vw'). */
  maxWidth?: number | string;
  /** Optional extra className for the content container. */
  className?: string;
  /** Optional error message to show like the login page. */
  errorMessage?: string | null;
  /** Optional handler when closing the error. */
  onClearError?: () => void;
}

const GenericModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitButtonText = 'Submit',
  fields,
  children,
  maxWidth,
  className,
  errorMessage,
  onClearError,
}: GenericModalProps) => {
  if (!isOpen) return null;

  // Validation: compute if any required/invalid field exists (no visual error styling per new UX)
  let hasErrors = false;
  for (const f of fields) {
    const val = f.value;
    const empty =
      val === null ||
      val === undefined ||
      (typeof val === 'string' && val.trim() === '') ||
      (f.type === 'number' && val === '') ||
      (Array.isArray(val) && val.length === 0) ||
      (f.type === 'custom' && Array.isArray(val) && val.length === 0);
    if (f.required && empty) {
      hasErrors = true;
      continue;
    }
    if (!empty && f.validate && f.validate(val)) {
      hasErrors = true;
    }
  }

  const resolvedMaxWidth =
    typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth || '32rem';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
    >
      <div
        className={`rounded-lg shadow-lg w-full mx-auto relative ${className || ''}`}
        style={{
          backgroundColor: 'var(--cds-layer)',
          boxShadow: 'var(--cds-shadow)',
          color: 'var(--cds-text-primary)',
          maxWidth: resolvedMaxWidth,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="p-8 flex-shrink-0">
          <h2 className="text-xl font-medium mb-8">{title}</h2>
          {typeof errorMessage !== 'undefined' && errorMessage ? (
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={errorMessage}
              onCloseButtonClick={onClearError}
              className="mb-6"
            />
          ) : null}
        </div>
        <div className="px-8 overflow-y-auto flex-1">
          {fields.map((field) => {
            const isDropdown = field.type === 'dropdown';
            const isComboBox = field.type === 'combobox';
            const isSearchableComboBox = field.type === 'searchable-combobox';
            const isTextarea = field.type === 'textarea';
            const isMultiSelect = field.type === 'multi-select';
            const isCustom = field.type === 'custom';
            return (
              <div className="mb-6" key={field.key}>
                <label className="text-sm mb-2 flex items-center gap-1">
                  {field.label}
                  {field.required && <span className="opacity-60">*</span>}
                </label>
                {isSearchableComboBox ? (
                  <ComboBox
                    id={field.key}
                    items={field.options || []}
                    itemToString={(item) => (item ? item.text : '')}
                    selectedItem={
                      field.options?.find((opt) => opt.value === field.value) ||
                      null
                    }
                    onChange={({ selectedItem }) => {
                      field.onChange(selectedItem ? selectedItem.value : '');
                    }}
                    onInputChange={(inputValue) => {
                      if (field.onSearch) {
                        field.onSearch(inputValue);
                      }
                    }}
                    placeholder={field.placeholder || 'Type to search...'}
                    titleText=""
                  />
                ) : isComboBox ? (
                  <ComboBox
                    id={field.key}
                    items={field.options || []}
                    itemToString={(item) => (item ? item.text : '')}
                    selectedItem={
                      field.options?.find((opt) => opt.value === field.value) ||
                      null
                    }
                    onChange={({ selectedItem }) => {
                      field.onChange(selectedItem ? selectedItem.value : '');
                    }}
                    placeholder={field.placeholder || 'Type to search...'}
                    titleText=""
                  />
                ) : isMultiSelect ? (
                  <MultiSelect
                    id={field.key}
                    items={field.options || []}
                    itemToString={(item) => (item ? item.text : '')}
                    initialSelectedItems={
                      field.options?.filter((opt) =>
                        (field.value as string[])?.includes(opt.value),
                      ) || []
                    }
                    onChange={({ selectedItems }) => {
                      const selectedValues = selectedItems.map(
                        (item) => item.value,
                      );
                      field.onChange(selectedValues);
                    }}
                    titleText=""
                    placeholder={field.placeholder || 'Select options...'}
                    disabled={field.loading}
                  />
                ) : isCustom ? (
                  field.renderComponent ? (
                    field.renderComponent()
                  ) : null
                ) : isDropdown ? (
                  <select
                    className={`w-full border-b py-2 text-lg focus:outline-none border-gray-300`}
                    value={field.value}
                    style={{
                      borderBottom: '1px solid var(--cds-border-subtle)',
                      background: 'transparent',
                      color: 'var(--cds-text-primary)',
                    }}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    <option value="" disabled hidden>
                      {field.placeholder || 'Select...'}
                    </option>
                    {(field.options || []).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.text}
                      </option>
                    ))}
                  </select>
                ) : isTextarea ? (
                  <>
                    <textarea
                      className={`w-full border rounded p-2 min-h-[80px] border-gray-300`}
                      maxLength={
                        field.placeholder === 'Optional Notes...'
                          ? 100
                          : undefined
                      }
                      placeholder={field.placeholder}
                      style={{
                        border: '1px solid var(--cds-border-subtle)',
                        background: 'transparent',
                        color: 'var(--cds-text-primary)',
                      }}
                      value={field.value as string}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                    {field.type === 'textarea' &&
                      field.placeholder === 'Optional Notes...' && (
                        <div className="text-right text-xs text-gray-500">
                          {(field.value as string).length}/100
                        </div>
                      )}
                  </>
                ) : (
                  <TextInput
                    id={field.key}
                    labelText=""
                    type={field.type}
                    placeholder={field.placeholder}
                    value={
                      field.type === 'number'
                        ? String(field.value)
                        : (field.value as string)
                    }
                    onChange={(e: any) => {
                      if (field.type === 'number') {
                        const val = e.target.value;
                        field.onChange(val === '' ? '' : Number(val));
                      } else {
                        field.onChange(e.target.value);
                      }
                    }}
                    size="md"
                  />
                )}
              </div>
            );
          })}
          {children}
        </div>
        <div className="p-8 flex-shrink-0">
          <div
            className="flex justify-between items-center"
            style={{ color: 'var(--cds-text-secondary)' }}
          >
            <Button kind="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              kind="primary"
              className="bg-blue-600 text-white min-w-[160px]"
              onClick={onSubmit}
              disabled={hasErrors}
            >
              {submitButtonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericModal;

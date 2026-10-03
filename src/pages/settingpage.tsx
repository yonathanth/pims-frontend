import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  Button,
  InlineNotification,
  SkeletonText,
  FileUploader,
  Select,
  SelectItem,
} from '@carbon/react';
import { ArrowLeft, Edit as EditIcon, Renew, Download, Upload, Warning } from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';
import { useGeneralConfigs } from '../hooks/useGeneralConfigs';
import GenericModal from '../components/GenericModal';
import { updateGeneralConfig } from '../api/generalConfigs';
import { createBackup, restoreBackup, checkExistingData, type ExistingDataCheck } from '../api/backup';
import { useAuth } from '../hooks/useAuth';

// Created by the backend on startup; see back3/src/sales/expiry-order.service.ts
const EXPIRY_ORDER_POLICY_KEY = 'sale_expiry_order_policy';
const EXPIRY_ORDER_POLICY_OPTIONS = [
  { value: 'off', text: 'Off: allow selling from any batch' },
  {
    value: 'warn',
    text: 'Warn: tell the seller about batches that expire sooner',
  },
  {
    value: 'block',
    text: 'Block: only allow selling the soonest-expiring batch',
  },
];

export default function SettingPage() {
  const navigate = useNavigate();
  const { configs, loading, error, refetch } = useGeneralConfigs();
  const { session } = useAuth();
  const isAdmin = session?.user?.role === 'ADMIN';
  const expiryPolicyConfig = configs.find(
    (c) => c.key === EXPIRY_ORDER_POLICY_KEY,
  );
  const [policySaving, setPolicySaving] = useState(false);
  const [policyError, setPolicyError] = useState<string | null>(null);

  const handlePolicyChange = useCallback(
    async (value: string) => {
      if (!expiryPolicyConfig) return;
      setPolicySaving(true);
      setPolicyError(null);
      try {
        await updateGeneralConfig(expiryPolicyConfig.id, {
          key: expiryPolicyConfig.key,
          value,
          dataType: expiryPolicyConfig.dataType,
          category: expiryPolicyConfig.category,
          description: expiryPolicyConfig.description ?? undefined,
        });
        await refetch();
      } catch (e: any) {
        setPolicyError(e?.message || 'Failed to update the setting');
      } finally {
        setPolicySaving(false);
      }
    },
    [expiryPolicyConfig, refetch],
  );

  const [editOpen, setEditOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selected, setSelected] = useState<{
    id: number;
    key: string;
    value: string;
    dataType: string;
    category: string;
    description?: string | null;
  } | null>(null);

  // Backup/Restore state
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [backupError, setBackupError] = useState<string | null>(null);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingData, setExistingData] = useState<ExistingDataCheck | null>(null);
  const [dataCheckLoading, setDataCheckLoading] = useState(false);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const onEdit = useCallback((row: any) => {
    setSelected({
      id: Number(row.id),
      key: row.key,
      value: String(row.value ?? ''),
      dataType: row.dataType,
      category: row.category,
      description: row.description ?? null,
    });
    setFormError(null);
    setEditOpen(true);
  }, []);

  const fields = useMemo(() => {
    if (!selected) return [];
    const common = [
      {
        key: 'key',
        label: 'Key',
        type: 'text',
        value: selected.key,
        onChange: (v: any) =>
          setSelected((p) => (p ? { ...p, key: String(v) } : p)),
        required: true,
        readOnly: true,
      },
      {
        key: 'category',
        label: 'Category',
        type: 'text',
        value: selected.category,
        onChange: (v: any) =>
          setSelected((p) => (p ? { ...p, category: String(v) } : p)),
        required: true,
        readOnly: true,
      },
      {
        key: 'description',
        label: 'Description',
        type: 'text',
        value: selected.description ?? '',
        onChange: (v: any) =>
          setSelected((p) => (p ? { ...p, description: String(v) } : p)),
        required: false,
      },
    ] as any[];

    const valueField =
      selected.key === EXPIRY_ORDER_POLICY_KEY
        ? {
            key: 'value',
            label: 'Value',
            type: 'dropdown',
            value: String(selected.value ?? 'warn'),
            onChange: (v: any) =>
              setSelected((p) => (p ? { ...p, value: String(v) } : p)),
            options: EXPIRY_ORDER_POLICY_OPTIONS,
            required: true,
          }
        : selected.dataType === 'number'
        ? {
            key: 'value',
            label: 'Value',
            type: 'number',
            value: String(selected.value ?? ''),
            onChange: (v: any) =>
              setSelected((p) => (p ? { ...p, value: String(v) } : p)),
            required: true,
          }
        : selected.dataType === 'boolean'
          ? {
              key: 'value',
              label: 'Value',
              type: 'dropdown',
              value: String(selected.value ?? 'false'),
              onChange: (v: any) =>
                setSelected((p) => (p ? { ...p, value: String(v) } : p)),
              options: [
                { text: 'true', value: 'true' },
                { text: 'false', value: 'false' },
              ],
              required: true,
            }
          : {
              key: 'value',
              label: 'Value',
              type: 'text',
              value: String(selected.value ?? ''),
              onChange: (v: any) =>
                setSelected((p) => (p ? { ...p, value: String(v) } : p)),
              required: true,
            };

    return [valueField, ...common];
  }, [selected]);

  const handleSave = useCallback(async () => {
    if (!selected) return;
    try {
      setFormError(null);
      await updateGeneralConfig(selected.id, {
        key: selected.key,
        value: String(selected.value ?? ''),
        dataType: selected.dataType,
        category: selected.category,
        description: selected.description ?? undefined,
      });
      setEditOpen(false);
      setSelected(null);
      await refetch();
    } catch (e: any) {
      setFormError(e?.message || 'Failed to update configuration');
    }
  }, [selected, refetch]);

  // Check existing data on mount
  useEffect(() => {
    const checkData = async () => {
      setDataCheckLoading(true);
      try {
        const data = await checkExistingData();
        setExistingData(data);
      } catch (error) {
        console.error('Failed to check existing data:', error);
      } finally {
        setDataCheckLoading(false);
      }
    };
    checkData();
  }, []);

  // Backup handlers
  const handleCreateBackup = async () => {
    setBackupLoading(true);
    setBackupError(null);
    setBackupSuccess(null);
    try {
      await createBackup();
      setBackupSuccess('Backup created and downloaded successfully!');
    } catch (error: any) {
      setBackupError(error.message || 'Failed to create backup');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.dump')) {
        setRestoreError('Please select a valid .dump backup file');
        return;
      }
      setSelectedFile(file);
      setShowRestoreConfirm(true);
      setRestoreError(null);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedFile) return;

    setRestoreLoading(true);
    setRestoreError(null);
    setRestoreSuccess(null);
    try {
      await restoreBackup(selectedFile);
      setRestoreSuccess('Database restored successfully! Please refresh the page.');
      setShowRestoreConfirm(false);
      setSelectedFile(null);
      // Refresh data check
      const data = await checkExistingData();
      setExistingData(data);
    } catch (error: any) {
      setRestoreError(error.message || 'Failed to restore backup');
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--cds-background)',
        color: 'var(--cds-text-primary)',
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 border-b"
        style={{
          backgroundColor: 'var(--cds-layer-01)',
          borderColor: 'var(--cds-border-subtle)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              kind="ghost"
              renderIcon={ArrowLeft}
              onClick={handleBack}
              className="mr-2"
            >
              Back
            </Button>
            <div>
              <h1
                className="text-2xl font-semibold"
                style={{ color: 'var(--cds-text-primary)' }}
              >
                Settings
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="flex-1 overflow-auto"
        style={{ backgroundColor: 'var(--cds-background)' }}
      >
        <div className="p-8">
          {/* Sales rules */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold">Sales Rules</h2>
            <p
              className="text-sm mb-4"
              style={{ color: 'var(--cds-text-secondary)' }}
            >
              What happens when someone sells from a batch while the same
              product has another batch in stock that expires sooner
            </p>
            <div
              className="rounded-lg border p-6"
              style={{
                borderColor: 'var(--cds-border-subtle)',
                backgroundColor: 'var(--cds-layer)',
              }}
            >
              {policyError && (
                <InlineNotification
                  kind="error"
                  title="Error"
                  subtitle={policyError}
                  onClose={() => setPolicyError(null)}
                  className="mb-4"
                />
              )}
              {loading ? (
                <SkeletonText />
              ) : expiryPolicyConfig ? (
                <div style={{ maxWidth: '28rem' }}>
                  <Select
                    id="expiry-order-policy"
                    labelText="Selling from a later-expiring batch"
                    value={expiryPolicyConfig.value}
                    disabled={!isAdmin || policySaving}
                    helperText={
                      isAdmin
                        ? 'Expired batches never count as "expiring sooner".'
                        : 'Only administrators can change this setting.'
                    }
                    onChange={(e) => handlePolicyChange(e.target.value)}
                  >
                    {EXPIRY_ORDER_POLICY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value} text={o.text} />
                    ))}
                  </Select>
                </div>
              ) : (
                <p
                  className="text-sm"
                  style={{ color: 'var(--cds-text-secondary)' }}
                >
                  This setting appears after the backend restarts.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">General Configuration</h2>
              <p
                className="text-sm"
                style={{ color: 'var(--cds-text-secondary)' }}
              >
                Edit application-wide key-value settings
              </p>
            </div>
            <Button kind="ghost" renderIcon={Renew} onClick={() => refetch()}>
              Refresh
            </Button>
          </div>

          {error && (
            <div className="mb-4">
              <InlineNotification
                kind="error"
                title="Error"
                subtitle={String(error)}
                hideCloseButton={false}
              />
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              <SkeletonText heading width="30%" />
              <SkeletonText />
              <SkeletonText />
              <SkeletonText />
            </div>
          ) : (
            <div
              className="rounded-lg border"
              style={{
                borderColor: 'var(--cds-border-subtle)',
                backgroundColor: 'var(--cds-layer)',
              }}
            >
              <div
                className="divide-y"
                style={{ borderColor: 'var(--cds-border-subtle)' }}
              >
                {configs.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{c.key}</div>
                      <div
                        className="text-sm truncate"
                        style={{ color: 'var(--cds-text-secondary)' }}
                      >
                        {String(c.value)}
                      </div>
                      <div
                        className="text-xs mt-1"
                        style={{ color: 'var(--cds-text-secondary)' }}
                      >
                        {c.category} • {c.dataType}
                        {c.description ? ` • ${c.description}` : ''}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Button
                        kind="ghost"
                        size="sm"
                        renderIcon={EditIcon}
                        onClick={() => onEdit(c)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
                {configs.length === 0 && (
                  <div
                    className="px-4 py-6 text-sm"
                    style={{ color: 'var(--cds-text-secondary)' }}
                  >
                    No configuration entries found.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Backup & Restore Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Database Backup & Restore</h2>
                <p
                  className="text-sm"
                  style={{ color: 'var(--cds-text-secondary)' }}
                >
                  Create backups of your database or restore from a previous backup
                </p>
              </div>
            </div>

            {/* Create Backup Section */}
            <div
              className="rounded-lg border p-6 mb-6"
              style={{
                borderColor: 'var(--cds-border-subtle)',
                backgroundColor: 'var(--cds-layer)',
              }}
            >
              <h3 className="text-lg font-medium mb-4">Create Backup</h3>
              <p
                className="text-sm mb-4"
                style={{ color: 'var(--cds-text-secondary)' }}
              >
                Download a complete backup of your database. Save this file in a safe
                place (USB drive, cloud storage, etc.) for transferring to another
                computer.
              </p>

              {backupSuccess && (
                <InlineNotification
                  kind="success"
                  title="Success"
                  subtitle={backupSuccess}
                  onClose={() => setBackupSuccess(null)}
                  className="mb-4"
                />
              )}

              {backupError && (
                <InlineNotification
                  kind="error"
                  title="Error"
                  subtitle={backupError}
                  onClose={() => setBackupError(null)}
                  className="mb-4"
                />
              )}

              <Button
                kind="primary"
                renderIcon={Download}
                onClick={handleCreateBackup}
                disabled={backupLoading}
              >
                {backupLoading ? 'Creating Backup...' : 'Create & Download Backup'}
              </Button>
            </div>

            {/* Restore Backup Section */}
            <div
              className="rounded-lg border p-6"
              style={{
                borderColor: 'var(--cds-border-subtle)',
                backgroundColor: 'var(--cds-layer)',
              }}
            >
              <h3 className="text-lg font-medium mb-4">Restore Backup</h3>
              <p
                className="text-sm mb-4"
                style={{ color: 'var(--cds-text-secondary)' }}
              >
                Restore your database from a backup file. This will replace all current
                data with the backup data.
              </p>

              {/* Show warning if existing data detected */}
              {!dataCheckLoading && existingData?.hasData && (
                <div
                  className="mb-4 p-4 rounded border-2"
                  style={{
                    backgroundColor: 'var(--cds-support-error-inverse)',
                    borderColor: 'var(--cds-support-error)',
                    color: 'var(--cds-text-on-color)',
                  }}
                >
                  <div className="flex items-center mb-2">
                    <Warning className="mr-2" size={20} />
                    <span className="font-bold">WARNING: Existing Data Detected!</span>
                  </div>
                  <p className="text-sm mb-2">
                    Your database currently contains data. Restoring a backup is
                    restricted when data exists to prevent accidental data loss.
                  </p>
                  <p className="text-sm font-medium">
                    ⚠️ Restore is only allowed on empty databases. Please contact
                    support if you need to restore over existing data.
                  </p>
                </div>
              )}

              {showRestoreConfirm && selectedFile && (
                <div
                  className="mb-4 p-4 rounded border-2"
                  style={{
                    backgroundColor: 'var(--cds-layer-02)',
                    borderColor: 'var(--cds-border-subtle)',
                  }}
                >
                  <div className="flex items-center mb-2">
                    <Warning className="mr-2" size={20} />
                    <span className="font-bold">Confirm Restore</span>
                  </div>
                  <p
                    className="text-sm mb-2"
                    style={{ color: 'var(--cds-text-secondary)' }}
                  >
                    Selected file: <strong>{selectedFile.name}</strong> (
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      kind="primary"
                      renderIcon={Upload}
                      onClick={handleRestoreBackup}
                      disabled={restoreLoading || existingData?.hasData}
                    >
                      {restoreLoading
                        ? 'Restoring...'
                        : existingData?.hasData
                          ? 'Restore Disabled (Data Exists)'
                          : 'Confirm Restore'}
                    </Button>
                    <Button
                      kind="secondary"
                      onClick={() => {
                        setShowRestoreConfirm(false);
                        setSelectedFile(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {restoreSuccess && (
                <InlineNotification
                  kind="success"
                  title="Success"
                  subtitle={restoreSuccess}
                  onClose={() => setRestoreSuccess(null)}
                  className="mb-4"
                />
              )}

              {restoreError && (
                <InlineNotification
                  kind="error"
                  title="Error"
                  subtitle={restoreError}
                  onClose={() => setRestoreError(null)}
                  className="mb-4"
                />
              )}

              {!showRestoreConfirm && (
                <FileUploader
                  labelTitle="Upload backup file"
                  labelDescription="Only .dump files are accepted (max 1GB)"
                  buttonLabel="Choose file"
                  buttonKind="primary"
                  filenameStatus="edit"
                  accept={['.dump']}
                  onChange={handleFileSelect}
                  disabled={restoreLoading || existingData?.hasData || false}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <GenericModal
        isOpen={editOpen}
        onClose={() => {
          setEditOpen(false);
          setFormError(null);
          setSelected(null);
        }}
        onSubmit={handleSave}
        title={`Edit Configuration${selected ? ` - ${selected.key}` : ''}`}
        submitButtonText="Save"
        errorMessage={formError}
        onClearError={() => setFormError(null)}
        fields={fields as any}
      />
    </div>
  );
}

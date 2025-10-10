import { useCallback, useMemo, useState } from 'react';
import { Button, InlineNotification, SkeletonText } from '@carbon/react';
import { ArrowLeft, Edit as EditIcon, Renew } from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';
import { useGeneralConfigs } from '../hooks/useGeneralConfigs';
import GenericModal from '../components/GenericModal';
import { updateGeneralConfig } from '../api/generalConfigs';

export default function SettingPage() {
  const navigate = useNavigate();
  const { configs, loading, error, refetch } = useGeneralConfigs();

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
      selected.dataType === 'number'
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

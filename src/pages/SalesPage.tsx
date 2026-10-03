import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Select,
  SelectItem,
  TextInput,
  Pagination,
  Loading,
  InlineNotification,
} from '@carbon/react';
import GeneralPageLayout from '../components/GeneralPageLayout';
import {
  getProductSales,
  type ProductSalesResponse,
  type ProductSalesQuery,
  type PeriodType,
} from '../api/sales';
import SortableTable from '../components/SortableTable';

// 'date' is a UI-only option: it's sent as a custom range of a single day
type PeriodOption = PeriodType | 'date';

// Today as YYYY-MM-DD in local time (toISOString would use UTC)
const todayLocal = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const SalesPage = () => {
  const [period, setPeriod] = useState<PeriodOption>('daily');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(todayLocal());
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [data, setData] = useState<ProductSalesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Wait until the needed dates are picked instead of requesting an invalid range
    if (period === 'date' && !selectedDate) return;
    if (period === 'custom' && (!startDate || !endDate)) return;

    setLoading(true);
    setError(null);
    try {
      const query: ProductSalesQuery =
        period === 'date'
          ? {
              period: 'custom',
              startDate: selectedDate,
              endDate: selectedDate,
              page,
              limit,
            }
          : {
              period,
              page,
              limit,
              ...(period === 'custom' && {
                startDate,
                endDate,
              }),
            };
      const response = await getProductSales(query);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product sales');
    } finally {
      setLoading(false);
    }
  }, [period, startDate, endDate, selectedDate, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePeriodChange = (newPeriod: PeriodOption) => {
    setPeriod(newPeriod);
    setPage(1); // Reset to first page when period changes
  };

  const handlePageChange = ({ page: newPage }: { page: number }) => {
    setPage(newPage);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-ET').format(value);
  };

  return (
    <GeneralPageLayout
      breadcrumbItems={[
        { label: 'PIMS', href: '/' },
        { label: 'Sales', isCurrentPage: true },
      ]}
      showExportButton={false}
    >
      <div className="flex justify-between items-start px-6">
        <div>
          <h1 className="text-2xl font-semibold">Sales</h1>
          <p className="text-sm text-gray-600">
            View product sales with period filtering and detailed metrics
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 px-6 mt-4 md:flex-row md:items-end">
        <div style={{ width: '200px' }}>
          <Select
            id="period-select"
            labelText="Period"
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value as PeriodOption)}
          >
            <SelectItem value="daily" text="Daily" />
            <SelectItem value="weekly" text="Weekly" />
            <SelectItem value="monthly" text="Monthly" />
            <SelectItem value="yearly" text="Yearly" />
            <SelectItem value="date" text="Specific Date" />
            <SelectItem value="custom" text="Custom" />
          </Select>
        </div>

        {period === 'date' && (
          <div style={{ width: '200px' }}>
            <TextInput
              id="sales-date"
              labelText="Date"
              type="date"
              value={selectedDate}
              max={todayLocal()}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setPage(1);
              }}
            />
          </div>
        )}

        {period === 'custom' && (
          <>
            <div style={{ width: '200px' }}>
              <TextInput
                id="start-date"
                labelText="Start Date"
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                placeholder="mm/dd/yyyy"
              />
            </div>
            <div style={{ width: '200px' }}>
              <TextInput
                id="end-date"
                labelText="End Date"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                placeholder="mm/dd/yyyy"
              />
            </div>
          </>
        )}

        <div className="flex-1"></div>
        
        <Button 
          onClick={fetchData} 
          disabled={loading}
          size="md"
        >
          Refresh
        </Button>
      </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 mt-4 mb-4">
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={error}
              onClose={() => setError(null)}
            />
          </div>
        )}

        {/* Summary Cards */}
        {data?.summary && (
          <div className="px-6 mt-4">
            <div className="py-3 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              <div className="border p-4 bg-[#f4f4f4] flex flex-col gap-2">
                <span className="text-sm text-gray-600">Products Sold</span>
                <strong className="text-lg">{formatNumber(data.summary.numberOfProductsSold || 0)}</strong>
              </div>
              <div className="border p-4 bg-[#f4f4f4] flex flex-col gap-2">
                <span className="text-sm text-gray-600">Total Quantity</span>
                <strong className="text-lg">{formatNumber(data.summary.totalQuantitySold || 0)}</strong>
              </div>
              <div className="border p-4 bg-[#f4f4f4] flex flex-col gap-2">
                <span className="text-sm text-gray-600">Most Sold Item</span>
                <strong className="text-lg truncate" title={data.summary.mostSoldItem || 'N/A'}>
                  {data.summary.mostSoldItem || 'N/A'}
                </strong>
              </div>
              <div className="border p-4 bg-[#f4f4f4] flex flex-col gap-2">
                <span className="text-sm text-gray-600">Total Revenue</span>
                <strong className="text-lg">{formatCurrency(data.summary.totalRevenue || 0)}</strong>
              </div>
              <div className="border p-4 bg-[#f4f4f4] flex flex-col gap-2">
                <span className="text-sm text-gray-600">Total Profit</span>
                <strong className="text-lg">{formatCurrency(data.summary.totalProfit || 0)}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !data && (
          <div className="flex items-center justify-center h-64">
            <Loading description="Loading product sales..." />
          </div>
        )}

        {/* Products Table */}
        {data?.products && !loading && (
          <div className="px-6 mt-4">
            <SortableTable
              title="Products Sold"
              headers={[
                { key: 'drugName', header: 'Product Name' },
                { key: 'sku', header: 'SKU' },
                { key: 'category', header: 'Category' },
                { key: 'totalQuantity', header: 'Quantity Sold' },
                { key: 'unitPrice', header: 'Unit Price' },
                { key: 'totalRevenue', header: 'Total Revenue' },
                { key: 'totalProfit', header: 'Total Profit' },
              ]}
              data={(data.products || []).map((product) => ({
                ...product,
                id: String(product.drugId), // SortableTable requires an 'id' field
                unitPrice: formatCurrency(product.unitPrice || 0),
                totalRevenue: formatCurrency(product.totalRevenue || 0),
                totalProfit: formatCurrency(product.totalProfit || 0),
                totalQuantity: formatNumber(product.totalQuantity || 0),
              }))}
              filterOptions={[]}
              customFilters={() => true}
              enableSearch={false}
            />

            {/* Pagination */}
            {data.pagination && data.pagination.totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  page={data.pagination.page || 1}
                  pageSize={data.pagination.limit || 10}
                  totalItems={data.pagination.total || 0}
                  pageSizes={[10, 20, 30, 50, 100]}
                  onChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {data && !loading && data.products.length === 0 && (
          <div className="px-6 mt-4">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <p className="text-gray-500">No products sold in the selected period.</p>
            </div>
          </div>
        )}
    </GeneralPageLayout>
  );
};

export default SalesPage;






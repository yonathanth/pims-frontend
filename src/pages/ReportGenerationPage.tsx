import { useState, useEffect } from 'react';
import { Button, Select, SelectItem, TextInput, Loading } from '@carbon/react';
import GeneralPageLayout from '../components/GeneralPageLayout';
import SortableTable from '../components/SortableTable';
import {
  previewReport,
  downloadReport,
  getCategories,
  type ReportData,
  type ReportFilters,
} from '../api/reports';

// Report type mapping
const REPORT_TYPES = {
  'Inventory Report': 'inventory',
  'Sales Report': 'sales',
  'Expiry Report': 'expiry',
} as const;

type ReportTypeKey = keyof typeof REPORT_TYPES;

const ReportGenerationPage = () => {
  // State for filters
  const [reportType, setReportType] =
    useState<ReportTypeKey>('Inventory Report');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [medicineCategory, setMedicineCategory] = useState('All');
  const [status, setStatus] = useState('All Status');
  const [daysThreshold, setDaysThreshold] = useState('30');

  // State for data
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for filter options
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    [],
  );

  // Load filter options on component mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const categoriesData = await getCategories().catch((err) => {
          console.warn('Failed to load categories:', err);
          return [];
        });

        // Extract data from API response structure
        const categoriesArray =
          (categoriesData as any)?.data || categoriesData || [];

        // Ensure we have arrays even if API calls fail
        setCategories(Array.isArray(categoriesArray) ? categoriesArray : []);
      } catch (error) {
        console.error('Error loading filter options:', error);
        // Set empty arrays as fallback
        setCategories([]);
      }
    };

    loadFilterOptions();
  }, []);

  // Generate report preview (first 100 records)
  const handleGeneratePreview = async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: ReportFilters = {
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        category: medicineCategory !== 'All' ? medicineCategory : undefined,
        status: getStatusValue(status, reportType),
        daysThreshold: parseInt(daysThreshold) || 30,
      };

      const reportTypeValue = REPORT_TYPES[reportType];
      const data = await previewReport(reportTypeValue, filters);
      setReportData(data);
    } catch (error) {
      console.error('Error generating preview:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to generate preview',
      );
    } finally {
      setLoading(false);
    }
  };

  // Download report as PDF
  const handleDownloadPDF = async () => {
    if (!reportData) return;

    setLoading(true);
    try {
      const filters: ReportFilters = {
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        category: medicineCategory !== 'All' ? medicineCategory : undefined,
        status: getStatusValue(status, reportType),
        daysThreshold: parseInt(daysThreshold) || 30,
      };

      const reportTypeValue = REPORT_TYPES[reportType];
      await downloadReport(reportTypeValue, 'pdf', filters);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to download PDF',
      );
    } finally {
      setLoading(false);
    }
  };

  // Download report as Excel
  const handleDownloadExcel = async () => {
    if (!reportData) return;

    setLoading(true);
    try {
      const filters: ReportFilters = {
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        category: medicineCategory !== 'All' ? medicineCategory : undefined,
        status: getStatusValue(status, reportType),
        daysThreshold: parseInt(daysThreshold) || 30,
      };

      const reportTypeValue = REPORT_TYPES[reportType];
      await downloadReport(reportTypeValue, 'excel', filters);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to download Excel',
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert status display value to API value based on report type
  const getStatusValue = (
    status: string,
    reportType: string,
  ): string | undefined => {
    if (reportType === 'Inventory Report') {
      const inventoryMap: Record<string, string> = {
        'Current Stock': 'current_stock',
        'Low Stock': 'low_stock',
        'Out of Stock': 'out_of_stock',
      };
      return inventoryMap[status];
    } else if (reportType === 'Sales Report') {
      const salesMap: Record<string, string> = {
        'All Status': 'all_status',
        Completed: 'completed',
        Pending: 'pending',
        Declined: 'declined',
      };
      return salesMap[status];
    }
    return undefined;
  };

  // Get status options based on report type
  const getStatusOptions = () => {
    switch (reportType) {
      case 'Inventory Report':
        return [
          { value: 'Current Stock', text: 'Current Stock' },
          { value: 'Low Stock', text: 'Low Stock' },
          { value: 'Out of Stock', text: 'Out of Stock' },
        ];
      case 'Sales Report':
        return [
          { value: 'All Status', text: 'All Status' },
          { value: 'Completed', text: 'Completed' },
          { value: 'Pending', text: 'Pending' },
          { value: 'Declined', text: 'Declined' },
        ];
      default:
        return [];
    }
  };

  // Get category options
  const getCategoryOptions = () => {
    // Fallback mock data if categories is empty or not an array
    const fallbackCategories = [
      { value: 'Antibiotic', text: 'Antibiotic' },
      { value: 'Anti-viral', text: 'Anti-viral' },
      { value: 'Pain Relief', text: 'Pain Relief' },
    ];

    const categoryOptions =
      Array.isArray(categories) && categories.length > 0
        ? categories.map((cat) => ({ value: cat.name, text: cat.name }))
        : fallbackCategories;

    return [{ value: 'All', text: 'All' }, ...categoryOptions];
  };

  // Show loading state
  if (loading) {
    return (
      <GeneralPageLayout
        breadcrumbItems={[
          { label: 'PIMS', href: '/' },
          { label: 'Report generation', isCurrentPage: true },
        ]}
        showExportButton={false}
      >
        <div className="flex justify-center items-center h-64">
          <Loading description="Generating report..." />
        </div>
      </GeneralPageLayout>
    );
  }

  return (
    <GeneralPageLayout
      breadcrumbItems={[
        { label: 'PIMS', href: '/' },
        { label: 'Report generation', isCurrentPage: true },
      ]}
      showExportButton={false}
    >
      <div className="space-y-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mx-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* First Row: Report Type, From, To, Generate Button */}
        <div className="flex flex-wrap items-end gap-16 mb-6 px-6">
          <div className="min-w-[200px]">
            <Select
              id="reportType"
              labelText="Select Report Type"
              value={reportType}
              onChange={(e) => {
                const newReportType = e.target.value as ReportTypeKey;
                setReportType(newReportType);
                // Reset status based on report type
                if (newReportType === 'Inventory Report') {
                  setStatus('Current Stock');
                } else if (newReportType === 'Sales Report') {
                  setStatus('All Status');
                }
              }}
            >
              <SelectItem value="Inventory Report" text="Inventory Report" />
              <SelectItem value="Sales Report" text="Sales Report" />
              <SelectItem value="Expiry Report" text="Expiry Report" />
            </Select>
          </div>

          <div className="min-w-[150px]">
            <TextInput
              id="fromDate"
              labelText="From"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              placeholder="mm/dd/yyyy"
            />
          </div>

          <div className="min-w-[150px]">
            <TextInput
              id="toDate"
              labelText="To"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              placeholder="mm/dd/yyyy"
            />
          </div>

          <div className="ml-auto">
            <Button kind="primary" onClick={handleGeneratePreview}>
              Preview and Generate Report
            </Button>
          </div>
        </div>

        {/* Second Row: Medicine Category, Status, and other filters */}
        <div className="flex flex-wrap items-end gap-16 mb-8 px-6">
          <div className="min-w-[180px]">
            <Select
              id="medicineCategory"
              labelText="Medicine Category"
              value={medicineCategory}
              onChange={(e) => setMedicineCategory(e.target.value)}
            >
              {getCategoryOptions().map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  text={option.text}
                />
              ))}
            </Select>
          </div>

          {getStatusOptions().length > 0 && (
            <div className="min-w-[150px]">
              <Select
                id="status"
                labelText="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {getStatusOptions().map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    text={option.text}
                  />
                ))}
              </Select>
            </div>
          )}

          {reportType === 'Expiry Report' && (
            <div className="min-w-[150px]">
              <TextInput
                id="daysThreshold"
                labelText="Days Threshold"
                type="number"
                value={daysThreshold}
                onChange={(e) => setDaysThreshold(e.target.value)}
                placeholder="30"
              />
            </div>
          )}
        </div>

        {/* Report Results */}
        {reportData && (
          <div>
            <h2 className="text-xl font-semibold mb-4 px-6">
              {reportData.reportType}
            </h2>

            {/* Summary Section */}
            <div className="bg-gray-50 p-4 mx-6 mb-4 rounded-md">
              <h3 className="text-lg font-medium mb-2">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(reportData.summary)
                  .filter(([, value]) => typeof value !== 'object')
                  .map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {value}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Export Buttons - Above Table */}
            <div className="flex justify-end gap-3 mb-4 px-6">
              <Button
                kind="secondary"
                size="lg"
                onClick={handleDownloadExcel}
                disabled={loading}
              >
                Export as Excel
              </Button>
              <Button
                kind="primary"
                size="lg"
                onClick={handleDownloadPDF}
                disabled={loading}
              >
                Export as PDF
              </Button>
            </div>

            <SortableTable<any>
              title=""
              headers={reportData.headers}
              data={reportData.data}
              filterOptions={[]}
              customFilters={() => true}
              enableSearch={false}
            />
          </div>
        )}

        {/* No Data Message */}
        {reportData && reportData.data.length === 0 && (
          <div className="text-center py-8 px-6">
            <p className="text-gray-500 text-lg">
              No data available for the selected filters.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your date range or filter criteria.
            </p>
          </div>
        )}
      </div>
    </GeneralPageLayout>
  );
};

export default ReportGenerationPage;

import React, { useState, useEffect } from 'react';
import adminAPI from '../../services/adminAPI';
import { formatSimpleDate, formatDateTime } from '../../utils/dateUtils';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  TableCellsIcon,
  CodeBracketIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

// Constants
const VALID_FILE_TYPES = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/json'];
const VALID_FILE_EXTENSIONS = /\.(csv|xlsx|xls|json)$/;
const NOTIFICATION_DURATION = 5000;

// Utility functions
const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const getToday = () => new Date().toISOString().split('T')[0];

const getNotificationStyles = (type) => {
  const styles = {
    success: {
      bg: 'bg-green-50 border-green-500',
      text: 'text-green-800',
      icon: 'text-green-600',
      hover: 'text-green-600 hover:text-green-800'
    },
    error: {
      bg: 'bg-red-50 border-red-500',
      text: 'text-red-800',
      icon: 'text-red-600',
      hover: 'text-red-600 hover:text-red-800'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-500',
      text: 'text-yellow-800',
      icon: 'text-yellow-600',
      hover: 'text-yellow-600 hover:text-yellow-800'
    }
  };
  return styles[type] || styles.success;
};

const getStatusBadge = (status, type = null) => {
  const badges = {
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    export: 'bg-blue-100 text-blue-800',
    import: 'bg-green-100 text-green-800',
    default: 'bg-yellow-100 text-yellow-800'
  };
  return badges[status || type] || badges.default;
};

const ImportExportData = () => {
  const [lastExportDate, setLastExportDate] = useState(null);
  const [lastImportDate, setLastImportDate] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Error/Success State
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error' | 'warning', message: '' }

  // Export State
  const [exportFields, setExportFields] = useState({
    lisu_word: true,
    ipa: true,
    part_of_speech: true,
    english_meaning: true,
    alternate_meanings: true,
    example_lisu: true,
    example_english: true,
    example_audio_urls: true,
    etymology_context: true,
    etymology_origin: true,
    phrases: true,
    synonyms: true,
    antonyms: true,
    categories: true,
    tags: true,
    audio_url: true,
  });
  const [exportFormat, setExportFormat] = useState('csv');
  const [showExportFilters, setShowExportFilters] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    category: '',
    tags: [],
    status: 'all',
    contributor: '',
  });

  // Import State
  const [importFile, setImportFile] = useState(null);
  const [importType, setImportType] = useState('add');
  const [duplicateAction, setDuplicateAction] = useState('skip');
  const [importStatus, setImportStatus] = useState('active');
  const [delimiter, setDelimiter] = useState(';');
  const [showColumnMapping, setShowColumnMapping] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [columnMapping, setColumnMapping] = useState({});
  const [validationResult, setValidationResult] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [importProgress, setImportProgress] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    // Note: Import/Export history endpoint not yet implemented in backend
    // Disabling this feature for now
    try {
      // const response = await adminAPI.getImportExportHistory();
      // const historyData = response.data?.history || response.data || [];
      // setHistory(Array.isArray(historyData) ? historyData : []);

      setHistory([]);
      setLastExportDate(null);
      setLastImportDate(null);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setHistory([]);
    }
  };

  const availableFields = [
    { id: 'english_word', label: 'English', required: true },
    { id: 'lisu_word', label: 'Lisu', required: true },
    { id: 'english_definition', label: 'English Definition' },
    { id: 'lisu_definition', label: 'Lisu Definition' },
    { id: 'part_of_speech', label: 'Part of speech' },
    { id: 'meaning', label: 'Meaning' },
    { id: 'pronunciation_english', label: 'Pronunciation (English)' },
    { id: 'pronunciation_lisu', label: 'Pronunciation (Lisu)' },
    { id: 'examples', label: 'Examples' },
    { id: 'phrase', label: 'Phrase' },
    { id: 'synonyms', label: 'Synonyms' },
    { id: 'antonyms', label: 'Antonyms' },
    { id: 'etymology_origin', label: 'Etymology Origin' },
    { id: 'etymology_context', label: 'Etymology Context' },
    { id: 'tags', label: 'Tags' },
    { id: 'is_verified', label: 'Verified' },
  ];

  // Helper function to show notifications
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), NOTIFICATION_DURATION);
  };

  // Unified error handler
  const handleError = (error, context = 'Operation') => {
    console.error(`${context} failed:`, error);

    const statusMessages = {
      401: 'Please log in again.',
      403: 'You do not have admin permissions.',
      404: `${context} endpoint not found.`,
      500: 'Server error. Please try again later.'
    };

    let message = `${context} failed. `;
    const status = error.response?.status;

    if (statusMessages[status]) {
      message += statusMessages[status];
    } else if (!error.response) {
      message += 'Cannot connect to server. Please check if backend is running.';
    } else if (error.response?.data?.error?.message) {
      message += error.response.data.error.message;
    } else if (error.response?.data?.message) {
      message += error.response.data.message;
    } else if (error.message) {
      message += error.message;
    } else {
      message += 'Please try again.';
    }

    showNotification('error', message);
  };

  const handleSelectAllFields = () => {
    const allSelected = {};
    availableFields.forEach(field => {
      allSelected[field.id] = true;
    });
    setExportFields(allSelected);
  };

  const handleDeselectAllFields = () => {
    const noneSelected = {};
    availableFields.forEach(field => {
      noneSelected[field.id] = field.required || false;
    });
    setExportFields(noneSelected);
  };

  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.downloadImportTemplate();

      if (!response?.data || response.data.size === 0) {
        throw new Error('No data received from server');
      }

      downloadBlob(response.data, `lisu_dictionary_template_${getToday()}.csv`);
      showNotification('success', '✓ Template downloaded');
    } catch (error) {
      handleError(error, 'Template download');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const selectedFields = Object.keys(exportFields).filter(key => exportFields[key]);
      const response = await adminAPI.exportWords({
        fields: selectedFields,
        format: exportFormat,
        filters: exportFilters,
      });

      downloadBlob(response.data, `lisu_dictionary_export_${getToday()}.${exportFormat}`);
      fetchHistory();
      showNotification('success', `✓ ${exportFormat.toUpperCase()} exported`);
    } catch (error) {
      handleError(error, 'Export');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (!VALID_FILE_TYPES.includes(file.type) && !file.name.match(VALID_FILE_EXTENSIONS)) {
      showNotification('error', '✗ Invalid file type • Use CSV, XLSX, or JSON');
      return;
    }

    setImportFile(file);
    setValidationResult(null);
    setImportProgress(null);
    showNotification('success', `✓ File ready: ${file.name}`);
  };

  const handleValidateImport = async () => {
    if (!importFile) {
      showNotification('warning', '⚠ No file selected');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('validateOnly', 'true');
      formData.append('importType', importType);
      formData.append('duplicateAction', duplicateAction);
      formData.append('status', importStatus);
      formData.append('delimiter', delimiter);

      if (Object.keys(columnMapping).length > 0) {
        formData.append('columnMapping', JSON.stringify(columnMapping));
      }

      // Note: validateImport endpoint not yet implemented in backend
      // Using importWords with validateOnly flag instead
      const response = await adminAPI.importWords(formData);
      const data = response.data?.data || response.data || { errors: [] };

      setValidationResult(data);

      const errorCount = data.errors?.length || 0;
      if (errorCount > 0) {
        showNotification('warning', `⚠ ${errorCount} error${errorCount > 1 ? 's' : ''} found`);
      } else {
        showNotification('success', `✓ Validation passed • ${data.validCount || 0} entries ready`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Unknown error occurred';
      showNotification('error', `Validation error: ${errorMessage}`);
      setValidationResult({ errors: [{ message: errorMessage, row: null }], validCount: 0, warnings: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!validationResult || !validationResult.errors || validationResult.errors.length > 0) {
      showNotification('warning', '⚠ Validate first and fix errors');
      return;
    }

    // Show custom confirmation modal instead of browser confirm
    setShowConfirmModal(true);
  };

  const proceedWithImport = async () => {
    setShowConfirmModal(false);

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('importType', importType);
      formData.append('duplicateAction', duplicateAction);
      formData.append('status', importStatus);
      formData.append('delimiter', delimiter);

      if (Object.keys(columnMapping).length > 0) {
        formData.append('columnMapping', JSON.stringify(columnMapping));
      }

      const response = await adminAPI.importWords(formData);
      const importData = response.data.data || response.data;

      if (!importData || typeof importData.imported === 'undefined') {
        throw new Error('Invalid response from server: missing import data');
      }

      setImportProgress(importData);
      setImportFile(null);
      setValidationResult(null);

      try {
        await fetchHistory();
      } catch (historyError) {
        console.warn('Could not refresh history:', historyError);
      }

      showNotification('success', `✓ Imported ${importData.imported || 0} • Updated ${importData.updated || 0} • Skipped ${importData.skipped || 0}`);

      // Auto refresh page after 2 seconds to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      handleError(error, 'Import');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const downloadErrorLog = () => {
    if (!validationResult?.errors?.length) return;

    const errorText = validationResult.errors
      .map((err, idx) => `Error ${idx + 1}: ${err.row ? `Row ${err.row}: ` : ''}${err.message}`)
      .join('\n');

    downloadBlob(new Blob([errorText], { type: 'text/plain' }), `import_errors_${getToday()}.txt`);
  };

  return (
    <div className="space-y-6">
      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowConfirmModal(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationTriangleIcon className="h-6 w-6 text-teal-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Confirm Import
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to proceed with this import? This action cannot be undone.
                    </p>
                    {validationResult && (
                      <div className="mt-3 text-sm text-gray-700">
                        <p>• {validationResult.validCount || 0} valid entries will be imported</p>
                        <p>• Import type: <span className="font-medium">{importType}</span></p>
                        <p>• Status: <span className="font-medium">{importStatus}</span></p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={proceedWithImport}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Proceed with Import
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Banner */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-md w-full shadow-lg rounded-lg p-4 animate-fade-in-down ${getNotificationStyles(notification.type).bg} border-2`}>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {notification.type === 'success' && <CheckCircleIcon className={`w-6 h-6 ${getNotificationStyles(notification.type).icon}`} />}
              {notification.type === 'error' && <XCircleIcon className={`w-6 h-6 ${getNotificationStyles(notification.type).icon}`} />}
              {notification.type === 'warning' && <ExclamationTriangleIcon className={`w-6 h-6 ${getNotificationStyles(notification.type).icon}`} />}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${getNotificationStyles(notification.type).text}`}>
                {notification.message}
              </p>
            </div>
            <button onClick={() => setNotification(null)} className={`flex-shrink-0 ${getNotificationStyles(notification.type).hover}`}>
              <XCircleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Import/Export Dictionary Data
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Bulk import and export dictionary entries with validation and error handling
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {lastExportDate && (
              <div className="flex items-center space-x-2">
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>Last Export: {formatSimpleDate(lastExportDate)}</span>
              </div>
            )}
            {lastImportDate && (
              <div className="flex items-center space-x-2">
                <ArrowUpTrayIcon className="w-4 h-4" />
                <span>Last Import: {formatSimpleDate(lastImportDate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Export Data */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div className="flex items-center space-x-3">
            <DocumentArrowDownIcon className="w-6 h-6 text-teal-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Export Dictionary Data
              </h2>
              <p className="text-sm text-gray-500">
                Generate a backup or custom export for analysis
              </p>
            </div>
          </div>

          {/* Download Sample Template */}
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <DocumentTextIcon className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-700 mb-2">
                  Download a sample template with all available fields for import preparation
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  disabled={loading}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 text-sm font-medium"
                >
                  Download Sample Template (CSV)
                </button>
              </div>
            </div>
          </div>

          {/* Fields to Export */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">
                Fields to Export
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleSelectAllFields}
                  className="text-xs text-teal-600 hover:text-teal-700"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={handleDeselectAllFields}
                  className="text-xs text-teal-600 hover:text-teal-700"
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
              {availableFields.map(field => (
                <label key={field.id} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={exportFields[field.id] || false}
                    onChange={(e) => setExportFields({ ...exportFields, [field.id]: e.target.checked })}
                    disabled={field.required}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className={`${field.required ? 'font-medium' : ''} text-gray-700`}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Export Filters */}
          <div>
            <button
              onClick={() => setShowExportFilters(!showExportFilters)}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-3"
            >
              <span className="flex items-center space-x-2">
                <AdjustmentsHorizontalIcon className="w-4 h-4" />
                <span>Filter Export (Optional)</span>
              </span>
              {showExportFilters ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </button>

            {showExportFilters && (
              <div className="space-y-3 pl-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Filter by Status
                  </label>
                  <select
                    value={exportFilters.status}
                    onChange={(e) => setExportFilters({ ...exportFilters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900"
                  >
                    <option value="all">All Words</option>
                    <option value="active">Active Words</option>
                    <option value="pending">Pending Contributions</option>
                    <option value="hidden">Hidden Words</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['csv', 'xlsx', 'json'].map(format => (
                <button
                  key={format}
                  onClick={() => setExportFormat(format)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${exportFormat === format
                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                    : 'border-gray-200 hover:border-gray-300:border-gray-600 text-gray-700'
                    }`}
                >
                  {format === 'csv' && <TableCellsIcon className="w-5 h-5 mx-auto mb-1" />}
                  {format === 'xlsx' && <DocumentTextIcon className="w-5 h-5 mx-auto mb-1" />}
                  {format === 'json' && <CodeBracketIcon className="w-5 h-5 mx-auto mb-1" />}
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              JSON is best for complex multi-valued fields. CSV/XLSX use delimiters for arrays.
            </p>
          </div>

          {/* Generate Export Button */}
          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>{loading ? 'Generating...' : 'Generate & Download File'}</span>
          </button>
        </div>

        {/* RIGHT COLUMN: Import Data */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div className="flex items-center space-x-3">
            <DocumentArrowUpIcon className="w-6 h-6 text-teal-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Import Dictionary Data
              </h2>
              <p className="text-sm text-gray-500">
                Upload a file to add or update words in bulk
              </p>
            </div>
          </div>

          {/* File Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
              ? 'border-teal-500 bg-teal-50'
              : 'border-gray-300'
              }`}
          >
            <ArrowUpTrayIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop your file here, or
            </p>
            <label className="inline-block px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50:bg-gray-600 cursor-pointer">
              Choose File
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.json"
                onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </label>
            <p className="mt-2 text-xs text-gray-500">
              Accepts .CSV, .XLSX, .JSON
            </p>
            {importFile && (
              <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-teal-600">
                <CheckCircleIcon className="w-5 h-5" />
                <span>{importFile.name}</span>
                <button
                  onClick={() => setImportFile(null)}
                  className="text-red-600 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Import Options */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Import Type
              </label>
              <select
                value={importType}
                onChange={(e) => setImportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              >
                <option value="add">Add New Words Only</option>
                <option value="update">Update Existing Words</option>
                <option value="hybrid">Add & Update (Hybrid)</option>
              </select>
            </div>

            {(importType === 'update' || importType === 'hybrid') && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  On Duplicate Lisu Word
                </label>
                <select
                  value={duplicateAction}
                  onChange={(e) => setDuplicateAction(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                >
                  <option value="skip">Skip Row</option>
                  <option value="overwrite">Overwrite Existing Data</option>
                  <option value="merge">Merge Fields</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Assign Status on Import
              </label>
              <select
                value={importStatus}
                onChange={(e) => setImportStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              >
                <option value="active">Active</option>
                <option value="pending">Pending Review</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Delimiter for Multi-Value Fields
              </label>
              <input
                type="text"
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                maxLength={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                placeholder=";"
              />
              <p className="mt-1 text-xs text-gray-500">
                Character used to separate multiple values (e.g., tags, meanings)
              </p>
            </div>
          </div>

          {/* Column Mapping */}
          <div>
            <button
              onClick={() => setShowColumnMapping(!showColumnMapping)}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-900"
            >
              <span>Column Mapping (Advanced)</span>
              {showColumnMapping ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </button>
            {showColumnMapping && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-2">
                  Auto-mapping will be attempted on upload. Adjust if needed.
                </p>
                {/* Column mapping interface would go here */}
                <p className="text-xs text-gray-500 italic">
                  Available after file upload
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleValidateImport}
              disabled={!importFile || loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span>{loading ? 'Validating...' : 'Validate & Upload Data'}</span>
            </button>

            {validationResult && validationResult.errors && validationResult.errors.length === 0 && (
              <button
                onClick={handleConfirmImport}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <CheckCircleIcon className="w-5 h-5" />
                <span>{loading ? 'Importing...' : 'Confirm Import'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Import/Export History */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <ClockIcon className="w-5 h-5" />
          <span>Recent Import/Export History</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date/Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performed By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Summary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No import/export history yet
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(item.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(null, item.type)}`}>
                        {item.type === 'export' ? <ArrowDownTrayIcon className="w-3 h-3 mr-1" /> : <ArrowUpTrayIcon className="w-3 h-3 mr-1" />}
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.file_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.performed_by || 'Admin'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {item.summary || 'No details available'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        {item.type === 'export' && item.file_url && (
                          <a href={item.file_url} download className="text-teal-600 hover:text-teal-700">
                            Download
                          </a>
                        )}
                        {item.type === 'import' && item.log_url && (
                          <a href={item.log_url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700">
                            View Log
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ImportExportData;

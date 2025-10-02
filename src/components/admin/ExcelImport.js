import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { useMutation, useQueryClient } from 'react-query';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const ExcelImport = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importOptions, setImportOptions] = useState({
    mode: 'skip', // 'skip', 'update', 'replace'
    validateOnly: false,
    clearDatabase: false
  });
  const queryClient = useQueryClient();

  // Template structure for Excel file
  const excelTemplate = [
    {
      english_word: 'hello',
      lisu_translation: 'ꓪꓵꓽ',
      part_of_speech: 'noun',
      definition: 'A greeting used when meeting someone',
      example_usage: 'Hello, how are you?',
      phonetic: '/həˈloʊ/',
      synonyms: 'hi, greeting',
      antonyms: 'goodbye'
    },
    {
      english_word: 'water',
      lisu_translation: 'ꓲꓸ',
      part_of_speech: 'noun',
      definition: 'A clear liquid essential for life',
      example_usage: 'I need to drink water',
      phonetic: '/ˈwɔːtər/',
      synonyms: 'H2O, liquid',
      antonyms: ''
    }
  ];

  // Import mutation
  const importMutation = useMutation(
    (data) => {
      return adminAPI.importWords({
        ...data,
        options: importOptions
      });
    },
    {
      onSuccess: (response) => {
        const { imported, skipped, updated, errors } = response;

        if (imported > 0) {
          toast.success(`Successfully imported ${imported} words`);
        }
        if (updated > 0) {
          toast.info(`Updated ${updated} existing words`);
        }
        if (skipped > 0) {
          toast.info(`Skipped ${skipped} duplicate words`);
        }
        if (errors && errors.length > 0) {
          toast.warning(`${errors.length} words had errors`);
        }

        queryClient.invalidateQueries('adminWords');
        onClose();
        resetState();
      },
      onError: (error) => {
        console.error('Import error:', error);
        console.error('Import error response:', error.response);
        toast.error(error.response?.data?.message || error.message || 'Import failed');
      }
    }
  );

  const resetState = () => {
    setFile(null);
    setPreview([]);
    setErrors([]);
    setIsProcessing(false);
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFile(file);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        validateAndPreview(jsonData);
      } catch (error) {
        toast.error('Error reading Excel file');
        setErrors([{ row: 0, message: 'Invalid Excel file format' }]);
      }
      setIsProcessing(false);
    };

    reader.readAsArrayBuffer(file);
  }, []);

  const validateAndPreview = (data) => {
    const requiredFields = ['english_word', 'lisu_translation'];
    const validationErrors = [];
    const validRows = [];

    data.forEach((row, index) => {
      const rowErrors = [];

      // Check required fields
      requiredFields.forEach(field => {
        if (!row[field] || row[field].toString().trim() === '') {
          rowErrors.push(`Missing ${field.replace('_', ' ')}`);
        }
      });

      // Validate part of speech
      if (row.part_of_speech) {
        const validPOS = ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection'];
        if (!validPOS.includes(row.part_of_speech.toLowerCase())) {
          rowErrors.push('Invalid part of speech');
        }
      }

      if (rowErrors.length > 0) {
        validationErrors.push({
          row: index + 2, // +2 because Excel rows start at 1 and we have header
          message: rowErrors.join(', ')
        });
      } else {
        validRows.push({
          ...row,
          english_word: row.english_word.toString().trim(),
          lisu_translation: row.lisu_translation.toString().trim(),
          part_of_speech: row.part_of_speech?.toString().toLowerCase() || '',
          definition: row.definition?.toString().trim() || '',
          example_usage: row.example_usage?.toString().trim() || '',
          phonetic: row.phonetic?.toString().trim() || '',
          synonyms: row.synonyms?.toString().trim() || '',
          antonyms: row.antonyms?.toString().trim() || ''
        });
      }
    });

    setErrors(validationErrors);
    setPreview(validRows); // Show all valid rows for preview
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(excelTemplate);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Words Template');
    XLSX.writeFile(wb, 'english-lisu-dictionary-template.xlsx');
  };

  const handleImport = () => {
    if (!file || preview.length === 0) {
      toast.error('Please select a valid file first');
      return;
    }

    if (errors.length > 0) {
      toast.error('Please fix validation errors before importing');
      return;
    }

    // Read the full file data for import
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Process all valid rows
        const processedData = jsonData
          .filter((row) => row.english_word && row.lisu_translation)
          .map(row => ({
            english_word: row.english_word.toString().trim(),
            lisu_translation: row.lisu_translation.toString().trim(),
            part_of_speech: row.part_of_speech?.toString().toLowerCase() || '',
            definition: row.definition?.toString().trim() || '',
            example_usage: row.example_usage?.toString().trim() || '',
            phonetic: row.phonetic?.toString().trim() || '',
            synonyms: row.synonyms?.toString().trim() || '',
            antonyms: row.antonyms?.toString().trim() || ''
          }));

        importMutation.mutate({ words: processedData });
      } catch (error) {
        console.error('Error processing file:', error);
        toast.error('Error processing file for import');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Import Words from Excel
            </h3>
            <button
              onClick={() => {
                onClose();
                resetState();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Download Template */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-800">
                  First time importing? Download our template
                </h4>
                <p className="text-sm text-blue-600 mt-1">
                  Use our Excel template to ensure proper formatting
                </p>
                <button
                  onClick={downloadTemplate}
                  className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                  Download Template
                </button>
              </div>
            </div>
          </div>

          {/* Import Options */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Import Options</h4>

            {/* Import Mode */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">When duplicate words are found:</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="importMode"
                      value="skip"
                      checked={importOptions.mode === 'skip'}
                      onChange={(e) => setImportOptions(prev => ({ ...prev, mode: e.target.value }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Skip duplicates (default)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="importMode"
                      value="update"
                      checked={importOptions.mode === 'update'}
                      onChange={(e) => setImportOptions(prev => ({ ...prev, mode: e.target.value }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Update existing words</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importOptions.mode === 'replace'}
                      onChange={(e) => setImportOptions(prev => ({ ...prev, mode: e.target.value }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Replace existing words</span>
                  </label>
                </div>
              </div>

              {/* Additional Options */}
              <div className="pt-3 border-t border-gray-200">
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={importOptions.validateOnly}
                      onChange={(e) => setImportOptions(prev => ({ ...prev, validateOnly: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Validate only (don't import, just check for errors)</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={importOptions.clearDatabase}
                      onChange={(e) => setImportOptions(prev => ({ ...prev, clearDatabase: e.target.checked }))}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-red-700 font-medium">⚠️ Clear all existing words before import</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
              }`}
          >
            <input {...getInputProps()} />
            <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-blue-600">Drop the Excel file here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Drag and drop an Excel file here, or click to select
                </p>
                <p className="text-sm text-gray-400">
                  Supports .xlsx, .xls, and .csv files
                </p>
              </div>
            )}
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600 mt-2">Processing file...</p>
            </div>
          )}

          {/* File Info */}
          {file && !isProcessing && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Selected file: <span className="font-medium">{file.name}</span>
              </p>
              <p className="text-sm text-gray-500">
                Size: {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          )}

          {/* Validation Errors */}
          {errors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-800 mb-2">
                    Validation Errors ({errors.length})
                  </h4>
                  <div className="max-h-24 overflow-y-auto">
                    {errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600">
                        Row {error.row}: {error.message}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center mb-3">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <h4 className="text-sm font-medium text-gray-900">
                  Preview ({preview.length} valid rows{preview.length > 10 ? ', showing first 10' : ''})
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        English
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Lisu
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Part of Speech
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Definition
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.slice(0, 10).map((row, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {row.english_word}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {row.lisu_translation}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500">
                          {row.part_of_speech || '-'}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500 max-w-xs truncate">
                          {row.definition || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => {
                onClose();
                resetState();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file || preview.length === 0 || errors.length > 0 || importMutation.isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importMutation.isLoading
                ? 'Processing...'
                : importOptions.validateOnly
                  ? `Validate ${preview.length} Words`
                  : importOptions.clearDatabase
                    ? `Replace All with ${preview.length} Words`
                    : `Import ${preview.length} Words`
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelImport;

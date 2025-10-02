import React, { useState } from 'react';
import { useMutation } from 'react-query';
import * as XLSX from 'xlsx';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  DocumentArrowDownIcon,
  XMarkIcon,
  Cog6ToothIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const ExcelExport = ({ isOpen, onClose, selectedWords = [] }) => {
  const [exportOptions, setExportOptions] = useState({
    format: 'xlsx',
    includeEtymology: false,
    includeMetadata: true,
    onlySelected: selectedWords.length > 0,
    fields: {
      english_word: true,
      lisu_translation: true,
      part_of_speech: true,
      definition: true,
      example_usage: true,
      phonetic: true,
      synonyms: true,
      antonyms: true,
      created_at: false,
      updated_at: false
    }
  });

  // Export mutation
  const exportMutation = useMutation(
    async (options) => {
      const params = {
        format: options.format,
        include_etymology: options.includeEtymology,
        include_metadata: options.includeMetadata,
        fields: Object.keys(options.fields).filter(key => options.fields[key]),
        word_ids: options.onlySelected ? selectedWords : undefined
      };

      const response = await adminAPI.exportWords(params);
      return response;
    },
    {
      onSuccess: (response, variables) => {
        try {

          // Extract data from the formatted response
          const data = response.data || response;

          // Validate data structure
          if (!data || !data.words || !Array.isArray(data.words)) {
            throw new Error('Invalid data structure received from server');
          }

          if (data.words.length === 0) {
            toast.warning('No words to export');
            onClose();
            return;
          }

          // Create and download the file
          const ws = XLSX.utils.json_to_sheet(data.words);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Dictionary Words');

          // Add metadata sheet if requested
          if (variables.includeMetadata && data.metadata) {
            const metaWs = XLSX.utils.json_to_sheet([data.metadata]);
            XLSX.utils.book_append_sheet(wb, metaWs, 'Export Info');
          }

          // Add etymology sheet if requested and available
          if (variables.includeEtymology && data.etymology && data.etymology.length > 0) {
            const etymWs = XLSX.utils.json_to_sheet(data.etymology);
            XLSX.utils.book_append_sheet(wb, etymWs, 'Etymology');
          }

          const fileName = `english-lisu-dictionary-${new Date().toISOString().split('T')[0]}.${variables.format}`;

          XLSX.writeFile(wb, fileName);

          toast.success(`Successfully exported ${data.words.length} words`);
          onClose();
        } catch (fileError) {
          console.error('File generation error:', fileError);
          toast.error(`File generation failed: ${fileError.message}`);
        }
      },
      onError: (error) => {
        console.error('Export API error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Export failed';
        toast.error(errorMessage);
      }
    }
  );

  const handleFieldChange = (field) => {
    setExportOptions(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [field]: !prev.fields[field]
      }
    }));
  };

  const handleSelectAllFields = () => {
    const allSelected = Object.values(exportOptions.fields).every(Boolean);
    setExportOptions(prev => ({
      ...prev,
      fields: Object.keys(prev.fields).reduce((acc, field) => ({
        ...acc,
        [field]: !allSelected
      }), {})
    }));
  };

  const handleExport = () => {
    const selectedFields = Object.values(exportOptions.fields).filter(Boolean);
    if (selectedFields.length === 0) {
      toast.error('Please select at least one field to export');
      return;
    }

    if (exportOptions.onlySelected && selectedWords.length === 0) {
      toast.error('No words selected for export');
      return;
    }

    exportMutation.mutate(exportOptions);
  };

  const fieldLabels = {
    english_word: 'English Word',
    lisu_translation: 'Lisu Translation',
    part_of_speech: 'Part of Speech',
    definition: 'Definition',
    example_usage: 'Example Usage',
    phonetic: 'Phonetic',
    synonyms: 'Synonyms',
    antonyms: 'Antonyms',
    created_at: 'Created Date',
    updated_at: 'Updated Date'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <DocumentArrowDownIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Export Words to Excel
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Export Options */}
          <div className="space-y-6">
            {/* Export Scope */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Export Scope</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="scope"
                    checked={!exportOptions.onlySelected}
                    onChange={() => setExportOptions(prev => ({ ...prev, onlySelected: false }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">All words in database</span>
                </label>
                {selectedWords.length > 0 && (
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="scope"
                      checked={exportOptions.onlySelected}
                      onChange={() => setExportOptions(prev => ({ ...prev, onlySelected: true }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Only selected words ({selectedWords.length})
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* File Format */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">File Format</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="format"
                    value="xlsx"
                    checked={exportOptions.format === 'xlsx'}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Excel (.xlsx) - Recommended</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={exportOptions.format === 'csv'}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">CSV (.csv)</span>
                </label>
              </div>
            </div>

            {/* Fields to Export */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-900">Fields to Export</h4>
                <button
                  onClick={handleSelectAllFields}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  {Object.values(exportOptions.fields).every(Boolean) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
                {Object.entries(fieldLabels).map(([field, label]) => (
                  <label key={field} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.fields[field]}
                      onChange={() => handleFieldChange(field)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Additional Options</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeEtymology}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeEtymology: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include etymology data (separate sheet)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeMetadata}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include export metadata (separate sheet)</span>
                </label>
              </div>
            </div>

            {/* Export Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start">
                <Cog6ToothIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-gray-900">Export Summary</h5>
                  <div className="mt-1 text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Scope:</span>{' '}
                      {exportOptions.onlySelected
                        ? `${selectedWords.length} selected words`
                        : 'All words in database'
                      }
                    </p>
                    <p>
                      <span className="font-medium">Format:</span>{' '}
                      {exportOptions.format.toUpperCase()}
                    </p>
                    <p>
                      <span className="font-medium">Fields:</span>{' '}
                      {Object.values(exportOptions.fields).filter(Boolean).length} selected
                    </p>
                    {exportOptions.includeEtymology && (
                      <p className="text-blue-600">
                        <CheckIcon className="h-4 w-4 inline mr-1" />
                        Etymology data included
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exportMutation.isLoading || Object.values(exportOptions.fields).filter(Boolean).length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              {exportMutation.isLoading ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelExport;

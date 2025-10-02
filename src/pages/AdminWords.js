import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CloudArrowUpIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { wordsAPI, adminAPI } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Pagination from '../components/UI/Pagination';
import ExcelImport from '../components/admin/ExcelImport';
import ExcelExport from '../components/admin/ExcelExport';
import toast from 'react-hot-toast';

const AdminWords = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedWords, setSelectedWords] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Fetch words with pagination and search
  const { data: wordsData, isLoading } = useQuery(
    ['adminWords', currentPage, searchQuery, sortBy, sortOrder],
    () => adminAPI.getWords({
      page: currentPage,
      limit: 20,
      search: searchQuery || undefined,
      sort_by: sortBy,
      order: sortOrder
    }),
    {
      keepPreviousData: true
    }
  );

  // Delete word mutation
  const deleteWordMutation = useMutation(
    (wordId) => wordsAPI.deleteWord(wordId),
    {
      onSuccess: () => {
        toast.success('Word deleted successfully');
        queryClient.invalidateQueries('adminWords');
        setSelectedWords([]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete word');
      }
    }
  );

  // Bulk actions mutation
  const bulkActionMutation = useMutation(
    ({ action, wordIds }) => adminAPI.bulkWords(action, wordIds),
    {
      onSuccess: (_, variables) => {
        toast.success(`Successfully ${variables.action}d ${variables.wordIds.length} words`);
        queryClient.invalidateQueries('adminWords');
        setSelectedWords([]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Bulk action failed');
      }
    }
  );

  const handleSelectWord = (wordId) => {
    setSelectedWords(prev =>
      prev.includes(wordId)
        ? prev.filter(id => id !== wordId)
        : [...prev, wordId]
    );
  };

  const handleSelectAll = () => {
    if (selectedWords.length === wordsData?.data?.words?.length) {
      setSelectedWords([]);
    } else {
      setSelectedWords(wordsData?.data?.words?.map(word => word.id) || []);
    }
  };

  const handleBulkAction = (action) => {
    if (selectedWords.length === 0) {
      toast.error('Please select words first');
      return;
    }

    const confirmMessage = `Are you sure you want to ${action} ${selectedWords.length} selected words?`;
    if (window.confirm(confirmMessage)) {
      bulkActionMutation.mutate({ action, wordIds: selectedWords });
    }
  };

  const handleDeleteWord = (wordId) => {
    if (window.confirm('Are you sure you want to delete this word?')) {
      deleteWordMutation.mutate(wordId);
    }
  };

  const WordForm = ({ word, onClose }) => {
    const [formData, setFormData] = useState({
      english_word: word?.english_word || '',
      lisu_translation: word?.lisu_translation || '',
      part_of_speech: word?.part_of_speech || '',
      definition: word?.definition || '',
      example_usage: word?.example_usage || '',
      phonetic: word?.phonetic || '',
      synonyms: word?.synonyms || '',
      antonyms: word?.antonyms || ''
    });

    const saveWordMutation = useMutation(
      (data) => word ? wordsAPI.updateWord(word.id, data) : wordsAPI.createWord(data),
      {
        onSuccess: () => {
          toast.success(`Word ${word ? 'updated' : 'created'} successfully`);
          queryClient.invalidateQueries('adminWords');
          onClose();
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || `Failed to ${word ? 'update' : 'create'} word`);
        }
      }
    );

    const handleSubmit = (e) => {
      e.preventDefault();
      saveWordMutation.mutate(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              {word ? 'Edit Word' : 'Add New Word'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    English Word *
                  </label>
                  <input
                    type="text"
                    value={formData.english_word}
                    onChange={(e) => setFormData({ ...formData, english_word: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lisu Translation *
                  </label>
                  <input
                    type="text"
                    value={formData.lisu_translation}
                    onChange={(e) => setFormData({ ...formData, lisu_translation: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Part of Speech
                  </label>
                  <select
                    value={formData.part_of_speech}
                    onChange={(e) => setFormData({ ...formData, part_of_speech: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="noun">Noun</option>
                    <option value="verb">Verb</option>
                    <option value="adjective">Adjective</option>
                    <option value="adverb">Adverb</option>
                    <option value="pronoun">Pronoun</option>
                    <option value="preposition">Preposition</option>
                    <option value="conjunction">Conjunction</option>
                    <option value="interjection">Interjection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phonetic
                  </label>
                  <input
                    type="text"
                    value={formData.phonetic}
                    onChange={(e) => setFormData({ ...formData, phonetic: e.target.value })}
                    placeholder="/fəˈnetɪk/"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Definition *
                </label>
                <textarea
                  rows={3}
                  value={formData.definition}
                  onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Example Usage
                </label>
                <textarea
                  rows={2}
                  value={formData.example_usage}
                  onChange={(e) => setFormData({ ...formData, example_usage: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Synonyms
                  </label>
                  <input
                    type="text"
                    value={formData.synonyms}
                    onChange={(e) => setFormData({ ...formData, synonyms: e.target.value })}
                    placeholder="Comma separated"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Antonyms
                  </label>
                  <input
                    type="text"
                    value={formData.antonyms}
                    onChange={(e) => setFormData({ ...formData, antonyms: e.target.value })}
                    placeholder="Comma separated"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveWordMutation.isLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {saveWordMutation.isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : null}
                  {word ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Words</h1>
        <p className="text-gray-600">Add, edit, and manage dictionary words</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-600 mb-1">Search words</label>
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" style={{ top: '60%' }} />
              <input
                type="text"
                placeholder="Search words..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-600 mb-1">Sort by</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                  setCurrentPage(1); // Reset to first page when sorting changes
                }}
                className="border border-gray-300 rounded-md px-3 py-2 pr-8 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="created_at-desc">📅 Newest First</option>
                <option value="created_at-asc">📅 Oldest First</option>
                <option value="english_word-asc">🔤 A-Z</option>
                <option value="english_word-desc">🔤 Z-A</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            {selectedWords.length > 0 && (
              <>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
                >
                  Delete Selected ({selectedWords.length})
                </button>
              </>
            )}

            {/* Import/Export Buttons */}
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100"
            >
              <CloudArrowUpIcon className="w-4 h-4 mr-2" />
              Import Excel
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
            >
              <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
              Export Excel
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Word
            </button>
          </div>
        </div>
      </div>

      {/* Words Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedWords.length === wordsData?.data?.words?.length && wordsData?.data?.words?.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  English Word
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lisu Translation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Part of Speech
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {wordsData?.data?.words?.map((word) => (
                <tr key={word.id} className={selectedWords.includes(word.id) ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedWords.includes(word.id)}
                      onChange={() => handleSelectWord(word.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{word.english_word}</div>
                    {word.phonetic && (
                      <div className="text-sm text-gray-500">{word.phonetic}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-blue-600 font-medium">{word.lisu_translation}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {word.part_of_speech && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {word.part_of_speech}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(word.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setEditingWord(word)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteWord(word.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {wordsData?.data?.pagination && (
          <Pagination
            currentPage={currentPage}
            totalPages={wordsData.data.pagination.total_pages}
            totalResults={wordsData.data.pagination.total_words}
            perPage={wordsData.data.pagination.per_page}
            onPageChange={setCurrentPage}
            hasPrev={wordsData.data.pagination.has_prev}
            hasNext={wordsData.data.pagination.has_next}
          />
        )}
      </div>

      {/* Add/Edit Word Modal */}
      {(showAddModal || editingWord) && (
        <WordForm
          word={editingWord}
          onClose={() => {
            setShowAddModal(false);
            setEditingWord(null);
          }}
        />
      )}

      {/* Import Modal */}
      <ExcelImport
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />

      {/* Export Modal */}
      <ExcelExport
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        selectedWords={selectedWords}
      />
    </div>
  );
};

export default AdminWords;

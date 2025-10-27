import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import adminAPI from '../../services/adminAPI';
import Pagination from '../UI/Pagination';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  XCircleIcon,
  EyeIcon,
  BookOpenIcon,
  PlusIcon,
  ClockIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';
import ImportExportData from './ImportExportData';

const WordsManagement = () => {
  return (
    <Routes>
      <Route path="/" element={<WordsList />} />
      <Route path="/pending" element={<PendingContributions />} />
      <Route path="/import-export" element={<ImportExportData />} />
    </Routes>
  );
};

const WordsList = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [partOfSpeechFilter, setPartOfSpeechFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWords, setTotalWords] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [wordToDelete, setWordToDelete] = useState(null);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [addFormData, setAddFormData] = useState({
    english_word: '',
    lisu_word: '',
    part_of_speech: '',
    meaning: '',
    ipa_pronunciation: '',
    examples: '',
    phrase: '',
    synonyms: '',
    antonyms: '',
    etymology_origin: '',
    etymology_context: '',
    status: 'active'
  });

  useEffect(() => {
    fetchWords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, partOfSpeechFilter]);

  const fetchWords = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(partOfSpeechFilter !== 'all' && { part_of_speech: partOfSpeechFilter }),
      };

      const response = await adminAPI.getWords(params);

      if (response.success) {
        const fetchedWords = response.data.words || [];
        // Debug: Log first word to see available fields
        if (fetchedWords.length > 0) {
          console.log('Sample word data:', fetchedWords[0]);
        }
        setWords(fetchedWords);
        const pagination = response.metadata?.pagination || {};
        setTotalPages(pagination.totalPages || pagination.total_pages || 1);
        setTotalWords(pagination.total || pagination.total_words || 0);
      }
    } catch (error) {
      console.error('Error fetching words:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWord = async (wordId) => {
    setWordToDelete(wordId);
    setShowDeleteModal(true);
    setDeleteConfirmed(false);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmed) {
      toast.error('Please confirm that you understand this action is permanent.', {
        duration: 3000,
        icon: '⚠️'
      });
      return;
    }

    try {
      await adminAPI.bulkWords('delete', [wordToDelete]);
      setShowDeleteModal(false);
      setWordToDelete(null);
      setDeleteConfirmed(false);
      fetchWords();
      toast.success('Word deleted successfully', {
        duration: 3000,
        icon: '🗑️'
      });
    } catch (error) {
      console.error('Error deleting word:', error);
      toast.error('Failed to delete word', {
        duration: 4000
      });
    }
  };

  const handleAddWord = async () => {
    try {
      // Validate required fields
      if (!addFormData.english_word || !addFormData.lisu_word) {
        toast.error('Please fill in both English word and Lisu word (required fields)', {
          duration: 4000
        });
        return;
      }

      const formattedData = {
        english_word: addFormData.english_word.trim(),
        lisu_word: addFormData.lisu_word.trim(),
        part_of_speech: addFormData.part_of_speech || null,
        meaning: addFormData.meaning.trim() || null,
        ipa_pronunciation: addFormData.ipa_pronunciation.trim() || null,
        examples: addFormData.examples ? addFormData.examples.split(';').map(e => e.trim()).filter(Boolean) : [],
        phrase: addFormData.phrase.trim() || null,
        synonyms: addFormData.synonyms ? addFormData.synonyms.split(',').map(s => s.trim()).filter(Boolean) : [],
        antonyms: addFormData.antonyms ? addFormData.antonyms.split(',').map(a => a.trim()).filter(Boolean) : [],
        etymology_origin: addFormData.etymology_origin.trim() || null,
        etymology_context: addFormData.etymology_context.trim() || null
      };

      console.log('Submitting word data:', formattedData);

      const response = await adminAPI.createWord(formattedData);
      console.log('Word created successfully:', response);

      setShowAddModal(false);
      setAddFormData({
        english_word: '',
        lisu_word: '',
        part_of_speech: '',
        meaning: '',
        ipa_pronunciation: '',
        examples: '',
        phrase: '',
        synonyms: '',
        antonyms: '',
        etymology_origin: '',
        etymology_context: ''
      });

      fetchWords();

      toast.success(`Word "${formattedData.english_word}" created successfully!`, {
        duration: 4000,
        icon: '✅'
      });

    } catch (error) {
      console.error('Error adding word:', error);
      console.error('Error response:', error.response);

      const errorMessage = error.response?.data?.error?.message
        || error.response?.data?.message
        || error.message
        || 'Unknown error occurred';

      toast.error(`Failed to add word: ${errorMessage}`, {
        duration: 5000
      });
    }
  };

  const handleViewWord = (word) => {
    setSelectedWord(word);
    setShowViewModal(true);
  };

  const handleEditWord = (word) => {
    setSelectedWord(word);
    setEditFormData({
      english_word: word.english_word || '',
      lisu_word: word.lisu_translation || word.lisu_word || '',
      part_of_speech: word.part_of_speech || '',
      meaning: word.definition || word.meaning || '',
      ipa_pronunciation: word.ipa_pronunciation || '',
      examples: Array.isArray(word.examples) ? word.examples.join('; ') : word.examples || '',
      phrase: word.phrase || '',
      synonyms: Array.isArray(word.synonyms) ? word.synonyms.join(', ') : word.synonyms || '',
      antonyms: Array.isArray(word.antonyms) ? word.antonyms.join(', ') : word.antonyms || '',
      etymology_origin: word.etymology_origin || '',
      etymology_context: word.etymology_context || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      // Format the data
      const formattedData = {
        english_word: editFormData.english_word?.trim(),
        lisu_word: editFormData.lisu_word?.trim(),
        part_of_speech: editFormData.part_of_speech || null,
        meaning: editFormData.meaning?.trim() || null,
        ipa_pronunciation: editFormData.ipa_pronunciation?.trim() || null,
        examples: editFormData.examples ? editFormData.examples.split(';').map(e => e.trim()).filter(Boolean) : [],
        phrase: editFormData.phrase?.trim() || null,
        synonyms: editFormData.synonyms ? editFormData.synonyms.split(',').map(s => s.trim()).filter(Boolean) : [],
        antonyms: editFormData.antonyms ? editFormData.antonyms.split(',').map(a => a.trim()).filter(Boolean) : [],
        etymology_origin: editFormData.etymology_origin?.trim() || null,
        etymology_context: editFormData.etymology_context?.trim() || null,
      };

      console.log('Updating word:', selectedWord.id, formattedData);

      const response = await adminAPI.updateWord(selectedWord.id, formattedData);
      console.log('Word updated successfully:', response);

      setShowEditModal(false);
      setSelectedWord(null);
      fetchWords();

      toast.success(`Word "${formattedData.english_word}" updated successfully!`, {
        duration: 4000,
        icon: '✅'
      });

    } catch (error) {
      console.error('Error updating word:', error);
      console.error('Error response:', error.response);

      const errorMessage = error.response?.data?.error?.message
        || error.response?.data?.message
        || error.message
        || 'Unknown error occurred';

      toast.error(`Failed to update word: ${errorMessage}`, {
        duration: 5000
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Words & Definitions
          </h1>
          <p className="text-gray-600">
            Manage dictionary entries and word contributions
          </p>
        </div>

        {/* Add New Word Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add New Word
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200">
        <Link
          to="/admin/words"
          className="flex items-center px-4 py-2 border-b-2 border-teal-600 text-teal-600 font-medium"
        >
          <BookOpenIcon className="w-5 h-5 mr-2" />
          All Words
        </Link>
        <Link
          to="/admin/words/pending"
          className="flex items-center px-4 py-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900:text-white hover:border-gray-300"
        >
          <ClockIcon className="w-5 h-5 mr-2" />
          Pending
        </Link>
        <Link
          to="/admin/words/import-export"
          className="flex items-center px-4 py-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900:text-white hover:border-gray-300"
        >
          <ArrowsRightLeftIcon className="w-5 h-5 mr-2" />
          Import/Export
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Lisu word or English meaning..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50:bg-gray-700 text-gray-700"
          >
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Part of Speech
              </label>
              <select
                value={partOfSpeechFilter}
                onChange={(e) => {
                  setPartOfSpeechFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Parts of Speech</option>
                <option value="noun">Noun</option>
                <option value="verb">Verb</option>
                <option value="adjective">Adjective</option>
                <option value="adverb">Adverb</option>
                <option value="pronoun">Pronoun</option>
                <option value="preposition">Preposition</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {words.length} of {totalWords} words
        </p>
      </div>

      {/* Words Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : words.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <BookOpenIcon className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-600">No words found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    English
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Part of Speech
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lisu
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meaning
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Example
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Etymology
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phrase
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Synonyms
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Antonyms
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Etymology Context
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Etymology Origin
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {words.map((word) => (
                  <tr key={word.id} className="hover:bg-gray-50:bg-gray-700/50">
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">
                        {word.english_word || 'N/A'}
                      </p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {word.part_of_speech || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {word.lisu_translation || word.lisu_word || 'N/A'}
                        </p>
                        {word.ipa_pronunciation && (
                          <p className="text-xs text-gray-500">
                            /{word.ipa_pronunciation}/
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      <p className="text-sm text-gray-900 line-clamp-2">
                        {word.definition || word.meaning || 'N/A'}
                      </p>
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {word.examples && Array.isArray(word.examples) && word.examples.length > 0
                          ? word.examples.join('; ')
                          : word.examples && typeof word.examples === 'string'
                            ? word.examples
                            : word.usage_example || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {word.etymology_origin || word.etymology || word.etymology_info || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {word.phrase || word.common_phrases || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {word.synonyms && Array.isArray(word.synonyms) && word.synonyms.length > 0
                          ? word.synonyms.join(', ')
                          : word.synonyms && typeof word.synonyms === 'string'
                            ? word.synonyms
                            : '-'}
                      </p>
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {word.antonyms && Array.isArray(word.antonyms) && word.antonyms.length > 0
                          ? word.antonyms.join(', ')
                          : word.antonyms && typeof word.antonyms === 'string'
                            ? word.antonyms
                            : '-'}
                      </p>
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {word.etymology_context || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {word.etymology_origin || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-500">
                        {word.created_at
                          ? new Date(word.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                          : 'N/A'}
                      </p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewWord(word)}
                          className="text-blue-600 hover:text-blue-900:text-blue-300"
                          title="View"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditWord(word)}
                          className="text-teal-600 hover:text-teal-900:text-teal-300"
                          title="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteWord(word.id)}
                          className="text-red-600 hover:text-red-900:text-red-300"
                          title="Delete"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Add New Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowAddModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Add New Dictionary Entry</h3>
                  <p className="text-sm text-gray-500 mt-1">Fill in the details to add a new word to the Lisu dictionary</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600:text-gray-300">
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Required Fields Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3">Required Fields *</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        English Word * <span className="text-xs text-gray-500">(Must be unique)</span>
                      </label>
                      <input
                        type="text"
                        value={addFormData.english_word}
                        onChange={(e) => setAddFormData({ ...addFormData, english_word: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
                        placeholder="e.g., Hello"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lisu Word * <span className="text-xs text-gray-500">(Lisu script or romanization)</span>
                      </label>
                      <input
                        type="text"
                        value={addFormData.lisu_word}
                        onChange={(e) => setAddFormData({ ...addFormData, lisu_word: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
                        placeholder="e.g., ꓧꓰꓼ ꓡꓯ"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Part of Speech *
                      </label>
                      <select
                        value={addFormData.part_of_speech}
                        onChange={(e) => setAddFormData({ ...addFormData, part_of_speech: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
                        required
                      >
                        <option value="">Select</option>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IPA Pronunciation <span className="text-xs text-gray-500">(Standard IPA format)</span>
                      </label>
                      <input
                        type="text"
                        value={addFormData.ipa_pronunciation}
                        onChange={(e) => setAddFormData({ ...addFormData, ipa_pronunciation: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
                        placeholder="e.g., həˈloʊ"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primary English Meaning * <span className="text-xs text-gray-500">(Clear, concise definition)</span>
                    </label>
                    <textarea
                      value={addFormData.meaning}
                      onChange={(e) => setAddFormData({ ...addFormData, meaning: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., A greeting used when meeting someone"
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Optional Fields Section */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Additional Information (Optional)</h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Example Sentences <span className="text-xs text-gray-500">(Separate with semicolon ; )</span>
                      </label>
                      <textarea
                        value={addFormData.examples}
                        onChange={(e) => setAddFormData({ ...addFormData, examples: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                        placeholder="Example 1 in Lisu; Example 2 in Lisu"
                      ></textarea>
                      <p className="text-xs text-gray-500 mt-1">Provide at least one example sentence showing usage</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Common Phrase/Usage
                      </label>
                      <input
                        type="text"
                        value={addFormData.phrase}
                        onChange={(e) => setAddFormData({ ...addFormData, phrase: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                        placeholder="e.g., Hello, how are you?"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Synonyms <span className="text-xs text-gray-500">(Comma separated)</span>
                        </label>
                        <input
                          type="text"
                          value={addFormData.synonyms}
                          onChange={(e) => setAddFormData({ ...addFormData, synonyms: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                          placeholder="synonym1, synonym2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Antonyms <span className="text-xs text-gray-500">(Comma separated)</span>
                        </label>
                        <input
                          type="text"
                          value={addFormData.antonyms}
                          onChange={(e) => setAddFormData({ ...addFormData, antonyms: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                          placeholder="antonym1, antonym2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Etymology Origin
                      </label>
                      <input
                        type="text"
                        value={addFormData.etymology_origin}
                        onChange={(e) => setAddFormData({ ...addFormData, etymology_origin: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                        placeholder="e.g., From Ancient Lisu"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Etymology Context
                      </label>
                      <textarea
                        value={addFormData.etymology_context}
                        onChange={(e) => setAddFormData({ ...addFormData, etymology_context: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                        placeholder="Historical context or linguistic notes"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300:bg-gray-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAddWord()}
                  className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium shadow-lg"
                >
                  Add Word
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && wordToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowDeleteModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <TrashIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                  <h3 className="text-lg leading-6 font-bold text-gray-900">
                    Confirm Deletion
                  </h3>
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">
                      Are you sure you want to permanently delete this dictionary entry?
                    </p>
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800 font-medium">⚠️ Warning: This action cannot be undone</p>
                      <ul className="mt-2 text-xs text-red-700 space-y-1 list-disc list-inside">
                        <li>All associated meanings and examples will be removed</li>
                        <li>Audio files and images will be permanently deleted</li>
                        <li>Related discussions may lose context</li>
                      </ul>
                    </div>
                    <div className="mt-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={deleteConfirmed}
                          onChange={(e) => setDeleteConfirmed(e.target.checked)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">
                          I understand this action is permanent and irreversible
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={!deleteConfirmed}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-5 py-2.5 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Permanently
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-5 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedWord && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowViewModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">View Word Details</h3>
                <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">English Word</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{selectedWord.english_word || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lisu Word</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{selectedWord.lisu_translation || selectedWord.lisu_word || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Part of Speech</label>
                    <p className="mt-1 text-gray-900 capitalize">{selectedWord.part_of_speech || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IPA Pronunciation</label>
                    <p className="mt-1 text-gray-900">/{selectedWord.ipa_pronunciation || 'N/A'}/</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Meaning/Definition</label>
                  <p className="mt-1 text-gray-900">{selectedWord.definition || selectedWord.meaning || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Examples</label>
                  <p className="mt-1 text-gray-900">
                    {Array.isArray(selectedWord.examples) ? selectedWord.examples.join('; ') : selectedWord.examples || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phrase</label>
                  <p className="mt-1 text-gray-900">{selectedWord.phrase || 'N/A'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Synonyms</label>
                    <p className="mt-1 text-gray-900">
                      {Array.isArray(selectedWord.synonyms) ? selectedWord.synonyms.join(', ') : selectedWord.synonyms || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Antonyms</label>
                    <p className="mt-1 text-gray-900">
                      {Array.isArray(selectedWord.antonyms) ? selectedWord.antonyms.join(', ') : selectedWord.antonyms || 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Etymology Origin</label>
                  <p className="mt-1 text-gray-900">{selectedWord.etymology_origin || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Etymology Context</label>
                  <p className="mt-1 text-gray-900">{selectedWord.etymology_context || 'N/A'}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedWord && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowEditModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Edit Word</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">English Word *</label>
                    <input
                      type="text"
                      value={editFormData.english_word}
                      onChange={(e) => setEditFormData({ ...editFormData, english_word: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lisu Word *</label>
                    <input
                      type="text"
                      value={editFormData.lisu_word}
                      onChange={(e) => setEditFormData({ ...editFormData, lisu_word: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Part of Speech</label>
                    <select
                      value={editFormData.part_of_speech}
                      onChange={(e) => setEditFormData({ ...editFormData, part_of_speech: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                    >
                      <option value="">Select</option>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">IPA Pronunciation</label>
                    <input
                      type="text"
                      value={editFormData.ipa_pronunciation}
                      onChange={(e) => setEditFormData({ ...editFormData, ipa_pronunciation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                      placeholder="e.g., həˈloʊ"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meaning/Definition</label>
                  <textarea
                    value={editFormData.meaning}
                    onChange={(e) => setEditFormData({ ...editFormData, meaning: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Examples (separate with semicolon)</label>
                  <textarea
                    value={editFormData.examples}
                    onChange={(e) => setEditFormData({ ...editFormData, examples: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                    placeholder="Example 1; Example 2"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phrase</label>
                  <input
                    type="text"
                    value={editFormData.phrase}
                    onChange={(e) => setEditFormData({ ...editFormData, phrase: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Synonyms (comma separated)</label>
                    <input
                      type="text"
                      value={editFormData.synonyms}
                      onChange={(e) => setEditFormData({ ...editFormData, synonyms: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                      placeholder="synonym1, synonym2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Antonyms (comma separated)</label>
                    <input
                      type="text"
                      value={editFormData.antonyms}
                      onChange={(e) => setEditFormData({ ...editFormData, antonyms: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                      placeholder="antonym1, antonym2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Etymology Origin</label>
                  <input
                    type="text"
                    value={editFormData.etymology_origin}
                    onChange={(e) => setEditFormData({ ...editFormData, etymology_origin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Etymology Context</label>
                  <textarea
                    value={editFormData.etymology_context}
                    onChange={(e) => setEditFormData({ ...editFormData, etymology_context: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  ></textarea>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PendingContributions = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pending Word Contributions
          </h1>
          <p className="text-gray-600">
            Review and approve word submissions from contributors
          </p>
        </div>
        <Link
          to="/admin/words"
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50:bg-gray-700 text-gray-700"
        >
          ← Back to All Words
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
        <div className="text-center">
          <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Pending contributions feature coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default WordsManagement;

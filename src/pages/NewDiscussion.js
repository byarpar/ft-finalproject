import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { discussionsAPI } from '../services/api';
import {
  XMarkIcon,
  PlusIcon,
  TagIcon,
  LinkIcon,
  ListBulletIcon,
  PhotoIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const NewDiscussion = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const contentRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [],
    images: [] // Add images array to store base64 images
  });

  const [tagInput, setTagInput] = useState('');
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscribeToUpdates, setSubscribeToUpdates] = useState(true);

  // Suggested tags based on category
  const [suggestedTags, setSuggestedTags] = useState([]);

  // Load categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await discussionsAPI.getCategories();
        setCategories(response.data?.categories || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        toast.error('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Update suggested tags based on selected category
  useEffect(() => {
    const tagSuggestions = {
      'grammar': ['#tenses', '#verbs', '#syntax', '#structure'],
      'pronunciation': ['#tones', '#phonetics', '#accent', '#listening'],
      'vocabulary': ['#words', '#phrases', '#translation', '#meaning'],
      'cultural': ['#traditions', '#customs', '#history', '#culture'],
      'technical': ['#bug', '#feature', '#help', '#support'],
      'general': ['#question', '#discussion', '#community', '#feedback']
    };

    setSuggestedTags(tagSuggestions[formData.category] || []);
  }, [formData.category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = (tag = tagInput) => {
    const normalizedTag = tag.trim().toLowerCase().replace(/^#/, '');
    if (normalizedTag && !formData.tags.includes(normalizedTag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, normalizedTag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Rich text formatting helpers (basic implementation)
  const insertFormatting = (format) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    let replacement = '';

    switch (format) {
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`;
        break;
      case 'link':
        replacement = `[${selectedText || 'link text'}](url)`;
        break;
      case 'list':
        replacement = `\n- ${selectedText || 'list item'}`;
        break;
      default:
        return;
    }

    const newContent =
      formData.content.substring(0, start) +
      replacement +
      formData.content.substring(end);

    setFormData(prev => ({ ...prev, content: newContent }));

    // Restore focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  // Handle image upload and convert to base64
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Limit to 5 images
    if (formData.images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    files.forEach(file => {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, {
            name: file.name,
            data: base64String,
            size: file.size,
            type: file.type
          }]
        }));
        toast.success(`${file.name} uploaded successfully`);
      };
      reader.onerror = () => {
        toast.error(`Failed to upload ${file.name}`);
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    e.target.value = '';
  };

  // Remove image from upload list
  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    toast.success('Image removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (formData.title.trim().length < 10) {
      toast.error('Title must be at least 10 characters');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Please enter some content');
      return;
    }
    if (formData.content.trim().length < 20) {
      toast.error('Content must be at least 20 characters');
      return;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    try {
      setIsSubmitting(true);

      // Create discussion with images
      const response = await discussionsAPI.createDiscussion({
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags,
        images: formData.images, // Include base64 images
        subscribe: subscribeToUpdates
      });

      toast.success('Discussion created successfully!');

      // Navigate to the new discussion
      if (response?.data?.id) {
        navigate(`/discussions/${response.data.id}`);
      } else {
        navigate('/discussions');
      }

    } catch (error) {
      console.error('Error creating discussion:', error);
      toast.error(error.response?.data?.error || 'Failed to create discussion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (formData.title || formData.content) {
      if (window.confirm('Are you sure you want to discard this discussion?')) {
        navigate('/discussions');
      }
    } else {
      navigate('/discussions');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Start a New Discussion
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your questions, insights, and ideas with the Lisu Dictionary community.
          </p>
          {user && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
              Posting as <span className="font-medium text-teal-600 dark:text-teal-400">{user.username || user.email}</span>
            </p>
          )}
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Form (70%) */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 space-y-6">
                {/* Title Input */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Discussion Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter a clear, concise title for your topic"
                    maxLength={200}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 disabled:opacity-50"
                    required
                  />
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className={`${formData.title.length < 10 ? 'text-red-500' :
                      formData.title.length < 50 ? 'text-yellow-500' :
                        'text-green-500'
                      }`}>
                      {formData.title.length < 10 && 'Minimum 10 characters'}
                      {formData.title.length >= 10 && formData.title.length < 50 && 'Good length'}
                      {formData.title.length >= 50 && 'Excellent!'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {formData.title.length}/200 characters
                    </span>
                  </div>
                </div>

                {/* Category Selector */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.filter(cat => cat.id !== 'all').map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags Input */}
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (Optional)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add keywords like #tones, #verbs, #greetings"
                      maxLength={30}
                      disabled={isSubmitting || formData.tags.length >= 5}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag()}
                      disabled={isSubmitting || !tagInput.trim() || formData.tags.length >= 5}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Suggested Tags */}
                  {suggestedTags.length > 0 && formData.tags.length < 5 && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Suggested tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedTags
                          .filter(tag => !formData.tags.includes(tag.replace('#', '')))
                          .map((tag, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleAddTag(tag)}
                              className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-gray-700 dark:text-gray-300 hover:text-teal-700 dark:hover:text-teal-300 rounded-full transition-colors"
                            >
                              {tag}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Display added tags */}
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-sm"
                        >
                          <TagIcon className="w-3 h-3" />
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            disabled={isSubmitting}
                            className="hover:text-teal-900 dark:hover:text-teal-100 disabled:opacity-50"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Add up to 5 tags to help others find your discussion
                  </p>
                </div>

                {/* Main Content Editor */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type your post here... Explain your question or detail. <span className="text-red-500">*</span>
                  </label>

                  {/* Formatting Toolbar */}
                  <div className="flex flex-wrap gap-2 mb-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <button
                      type="button"
                      onClick={() => insertFormatting('bold')}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300 transition-colors"
                      title="Bold"
                    >
                      <span className="font-bold">B</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('italic')}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300 transition-colors"
                      title="Italic"
                    >
                      <span className="italic">I</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('link')}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300 transition-colors"
                      title="Insert Link"
                    >
                      <LinkIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('list')}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300 transition-colors"
                      title="Bullet List"
                    >
                      <ListBulletIcon className="w-5 h-5" />
                    </button>
                    <div className="border-l border-gray-300 dark:border-gray-600 mx-2"></div>
                    <label
                      htmlFor="imageUpload"
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                      title="Upload Image (Max 5 images, 5MB each)"
                    >
                      <PhotoIcon className="w-5 h-5" />
                      <input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <div className="flex-1"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      Markdown supported • {formData.images.length}/5 images
                    </span>
                  </div>

                  <textarea
                    ref={contentRef}
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Clearly describe your question or topic. Provide examples if possible.

You can use Markdown for formatting:
- **bold** for bold text
- *italic* for italic text
- [links](url) for links
- Use bullet points and numbered lists for clarity

For pronunciation questions, consider uploading audio.
For grammar examples, provide context and specific sentences."
                    rows={12}
                    maxLength={5000}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 resize-none disabled:opacity-50 font-mono text-sm"
                    required
                  />
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className={`${formData.content.length < 20 ? 'text-red-500' :
                      formData.content.length < 100 ? 'text-yellow-500' :
                        'text-green-500'
                      }`}>
                      {formData.content.length < 20 && 'Minimum 20 characters'}
                      {formData.content.length >= 20 && formData.content.length < 100 && 'Add more details'}
                      {formData.content.length >= 100 && 'Good detail level'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {formData.content.length}/5000 characters
                    </span>
                  </div>
                </div>

                {/* Uploaded Images Preview */}
                {formData.images.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Uploaded Images ({formData.images.length}/5)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.data}
                            alt={image.name}
                            className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Remove image"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                            {image.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subscribe to updates checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="subscribe"
                    checked={subscribeToUpdates}
                    onChange={(e) => setSubscribeToUpdates(e.target.checked)}
                    className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 dark:focus:ring-teal-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="subscribe" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Subscribe to thread updates (receive notifications about replies)
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 rounded-b-lg">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.title.trim() || !formData.content.trim() || !formData.category}
                    className="flex-1 sm:flex-none px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-5 h-5" />
                        Publish Discussion
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column - Guidelines (30%) */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Posting Tips
              </h3>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                  <span>Be specific and clear in your title and question</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                  <span>Be respectful and constructive in your language</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                  <span>Use relevant tags to help others find your post</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                  <span>Check for existing topics before creating a new one</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                  <span>Provide examples when asking about grammar or vocabulary</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                  <span>Keep personal information private</span>
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Community Guidelines
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Help us maintain a welcoming and helpful community for all members.
                </p>
                <a
                  href="/discussions/guidelines"
                  className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Read full guidelines →
                </a>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                  <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Before posting:</p>
                    <p>Search existing discussions to avoid duplicates and get faster answers.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDiscussion;

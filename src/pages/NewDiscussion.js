import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  ExclamationTriangleIcon,
  FaceSmileIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { SkeletonLoader, EmojiPicker, MentionRenderer } from '../components/UIComponents';
import MentionInput from '../components/UI/MentionInput';
import { PageLayout } from '../components/LayoutComponents';

/**
 * NewDiscussion Component
 * 
 * Form for creating new discussion threads with category selection,
 * tags, images, and rich text content.
 */

const TAG_SUGGESTIONS = {
  general: ['#question', '#discussion', '#community', '#feedback', '#help', '#tips'],
  javascript: ['#react', '#nodejs', '#frontend', '#async', '#typescript', '#npm'],
  python: ['#django', '#flask', '#fastapi', '#pandas', '#automation', '#scripting'],
  java: ['#spring', '#jvm', '#backend', '#oop', '#maven', '#gradle'],
  cpp: ['#stl', '#algorithms', '#memory', '#performance', '#pointers', '#systems'],
  csharp: ['#dotnet', '#aspnet', '#linq', '#entityframework', '#blazor', '#api'],
  php: ['#laravel', '#symfony', '#composer', '#backend', '#api', '#web'],
  go: ['#goroutines', '#channels', '#microservices', '#backend', '#api', '#performance'],
  rust: ['#ownership', '#borrow-checker', '#cargo', '#tokio', '#systems', '#wasm'],
  other: ['#miscellaneous', '#off-topic', '#general', '#chat', '#random']
};

const MAX_TAGS = 5;
const MIN_TAGS = 1;
const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_TITLE_LENGTH = 10;
const MIN_CONTENT_LENGTH = 20;
const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 5000;

const NewDiscussion = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contentRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [],
    images: []
  });

  const [tagInput, setTagInput] = useState('');
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscribeToUpdates, setSubscribeToUpdates] = useState(true);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showTextFormats, setShowTextFormats] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [mentionProcessed, setMentionProcessed] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // Close emoji picker and color pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false);
      }
      if (showColorPicker && !event.target.closest('.color-picker-container')) {
        setShowColorPicker(false);
      }
      if (showBgColorPicker && !event.target.closest('.bg-color-picker-container')) {
        setShowBgColorPicker(false);
      }
      if (showTextFormats && !event.target.closest('.text-formats-container')) {
        setShowTextFormats(false);
      }
      if (showMoreOptions && !event.target.closest('.more-options-container')) {
        setShowMoreOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker, showColorPicker, showBgColorPicker, showTextFormats, showMoreOptions]);

  const loadDiscussionData = useCallback(async (discussionId) => {
    try {
      const response = await discussionsAPI.getDiscussionById(discussionId);
      const discussion = response.data?.discussion;

      if (discussion) {
        setFormData({
          title: discussion.title || '',
          content: discussion.content || '',
          category: typeof discussion.category === 'object' ? discussion.category.slug : discussion.category || '',
          tags: discussion.tags || [],
          images: discussion.images || []
        });
      }
    } catch (error) {
      console.error('Error loading discussion:', error);
      toast.error('Failed to load discussion data');
      navigate('/discussions');
    }
  }, [navigate]);

  // Load discussion data in edit mode
  useEffect(() => {
    const editIdParam = searchParams.get('edit');
    if (editIdParam) {
      setEditMode(true);
      setEditId(editIdParam);
      loadDiscussionData(editIdParam);
    }
  }, [searchParams, loadDiscussionData]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await discussionsAPI.getCategories();
        const categoriesData = response.data?.categories || {};

        // Convert object to array if needed
        let categoriesList = [];
        if (Array.isArray(categoriesData)) {
          categoriesList = categoriesData;
        } else {
          // If it's an object, convert to array
          categoriesList = Object.entries(categoriesData).map(([key, cat]) => ({
            id: key,
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            description: cat.description,
            count: cat.count || 0
          }));
        }

        setCategories(categoriesList);
      } catch (err) {
        console.error('Error fetching categories:', err);
        toast.error('Failed to load categories');
        setCategories([]); // Ensure categories is always an array
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    setSuggestedTags(TAG_SUGGESTIONS[formData.category] || []);
  }, [formData.category]);

  // Handle mention parameter from URL (only once)
  useEffect(() => {
    const mentionUser = searchParams.get('mention');
    if (mentionUser && !mentionProcessed) {
      setFormData(prev => ({
        ...prev,
        content: `@${mentionUser} `
      }));
      setMentionProcessed(true);
    }
  }, [searchParams, mentionProcessed]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = useCallback((tag = tagInput) => {
    const normalizedTag = tag.trim().toLowerCase().replace(/^#/, '');
    if (normalizedTag && !formData.tags.includes(normalizedTag) && formData.tags.length < MAX_TAGS) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, normalizedTag] }));
      setTagInput('');
    }
  }, [tagInput, formData.tags]);

  const handleRemoveTag = useCallback((tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  }, [handleAddTag]);

  const insertFormatting = useCallback((format, value = null) => {
    const mentionInputRef = contentRef.current;
    if (!mentionInputRef || !mentionInputRef.textarea) return;

    const textarea = mentionInputRef.textarea;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    let newCursorPos = start;

    const formats = {
      bold: `**${selectedText || 'bold text'}**`,
      italic: `*${selectedText || 'italic text'}*`,
      underline: `__${selectedText || 'underlined text'}__`,
      link: `[${selectedText || 'link text'}](url)`,
      list: `\n- ${selectedText || 'list item'}`,
      numberedList: `\n1. ${selectedText || 'numbered item'}`,
      code: `\`${selectedText || 'code'}\``,
      codeBlock: `\n\`\`\`\n${selectedText || 'code block'}\n\`\`\`\n`,
      heading1: `# ${selectedText || 'Heading 1'}`,
      heading2: `## ${selectedText || 'Heading 2'}`,
      heading3: `### ${selectedText || 'Heading 3'}`,
      quote: `> ${selectedText || 'quote'}`,
      color: value ? `<span style="color: ${value}">${selectedText || 'colored text'}</span>` : null,
      bgColor: value ? `<span style="background-color: ${value}; padding: 2px 4px; border-radius: 3px;">${selectedText || 'highlighted text'}</span>` : null,
      emoji: selectedText ? `${selectedText} 😊` : '😊 '
    };

    const replacement = formats[format];
    if (!replacement) return;

    // Calculate cursor position for better UX
    switch (format) {
      case 'bold':
      case 'underline':
        newCursorPos = selectedText ? start + replacement.length : start + 2;
        break;
      case 'italic':
        newCursorPos = selectedText ? start + replacement.length : start + 1;
        break;
      case 'link':
        newCursorPos = selectedText ? start + replacement.length - 4 : start + 1;
        break;
      case 'code':
        newCursorPos = selectedText ? start + replacement.length : start + 1;
        break;
      case 'heading1':
        newCursorPos = selectedText ? start + replacement.length : start + 2;
        break;
      case 'heading2':
        newCursorPos = selectedText ? start + replacement.length : start + 3;
        break;
      case 'heading3':
        newCursorPos = selectedText ? start + replacement.length : start + 4;
        break;
      case 'color':
      case 'bgColor':
        newCursorPos = selectedText ? end + (replacement.length - selectedText.length) : start + replacement.indexOf('>') + 1;
        break;
      default:
        newCursorPos = start + replacement.length;
    }

    const newContent =
      formData.content.substring(0, start) + replacement + formData.content.substring(end);

    setFormData(prev => ({ ...prev, content: newContent }));

    setTimeout(() => {
      mentionInputRef.focus();
      if (!selectedText) {
        mentionInputRef.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [formData.content]);

  const insertEmoji = useCallback((emoji) => {
    const mentionInputRef = contentRef.current;
    if (!mentionInputRef || !mentionInputRef.textarea) return;

    const textarea = mentionInputRef.textarea;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newContent = formData.content.substring(0, start) + emoji + ' ' + formData.content.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));

    setTimeout(() => {
      mentionInputRef.focus();
      mentionInputRef.setSelectionRange(start + emoji.length + 1, start + emoji.length + 1);
    }, 0);
  }, [formData.content]);

  const insertColor = useCallback((color, isBgColor = false) => {
    insertFormatting(isBgColor ? 'bgColor' : 'color', color);
    if (isBgColor) {
      setShowBgColorPicker(false);
    } else {
      setShowColorPicker(false);
    }
  }, [insertFormatting]);

  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (formData.images.length + files.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    files.forEach(file => {
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, {
            name: file.name,
            data: reader.result,
            size: file.size,
            type: file.type
          }]
        }));
        toast.success(`${file.name} uploaded successfully`);
      };
      reader.onerror = () => toast.error(`Failed to upload ${file.name}`);
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  }, [formData.images.length]);

  const handleRemoveImage = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    toast.success('Image removed');
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (formData.title.trim().length < MIN_TITLE_LENGTH) {
      toast.error(`Title must be at least ${MIN_TITLE_LENGTH} characters`);
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Please enter some content');
      return;
    }
    if (formData.content.trim().length < MIN_CONTENT_LENGTH) {
      toast.error(`Content must be at least ${MIN_CONTENT_LENGTH} characters`);
      return;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    if (formData.tags.length < MIN_TAGS) {
      toast.error(`Please add at least ${MIN_TAGS} tag to help others find your discussion`);
      return;
    }

    try {
      setIsSubmitting(true);

      // Extract only the base64 data from images
      const imageData = formData.images.map(img => img.data || img);

      // Check total payload size (rough estimate)
      const totalSize = formData.images.reduce((sum, img) => sum + (img.size || 0), 0);
      if (totalSize > 8 * 1024 * 1024) { // 8MB limit (leaving buffer for other data)
        toast.error('Total image size too large. Please reduce image sizes or quantity.');
        setIsSubmitting(false);
        return;
      }

      let response;
      if (editMode && editId) {
        // Update existing discussion
        response = await discussionsAPI.updateDiscussion(editId, {
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category,
          tags: formData.tags,
          images: imageData
        });
        toast.success('Discussion updated successfully!');
      } else {
        // Create new discussion
        response = await discussionsAPI.createDiscussion({
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category,
          tags: formData.tags,
          images: imageData,
          subscribe: subscribeToUpdates
        });
        toast.success('Question posted successfully!');
      }

      if (editMode && editId) {
        navigate(`/discussions/${editId}`);
      } else if (response?.data?.id) {
        navigate(`/discussions/${response.data.id}`);
      } else {
        navigate('/discussions');
      }

    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} discussion:`, error);

      // Handle specific error cases
      if (error.response?.status === 413 || error.message?.includes('too large')) {
        toast.error('Images are too large. Please use smaller images (max 5MB each, 8MB total).');
      } else {
        toast.error(error.response?.data?.error || `Failed to ${editMode ? 'update' : 'create'} discussion`);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, subscribeToUpdates, navigate, editMode, editId]);

  const handleCancel = useCallback(() => {
    if (formData.title || formData.content) {
      if (window.confirm('Are you sure you want to discard this question?')) {
        navigate('/discussions');
      }
    } else {
      navigate('/discussions');
    }
  }, [formData.title, formData.content, navigate]);

  if (loading) {
    return (
      <PageLayout
        title="Ask a Question"
        description="Share a question or start a discussion with the community."
        headerIcon={<PlusIcon className="w-6 h-6 text-white" />}
        showHeader={true}
        fullWidth={true}
        background="bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <SkeletonLoader variant="form-field" count={5} />
              </div>
            </div>
            <div className="lg:col-span-1">
              <SkeletonLoader variant="card" count={1} />
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={editMode ? 'Edit Discussion' : 'Ask a Question'}
      description={editMode ? 'Update your discussion with the community.' : 'Share a question or start a discussion with the community.'}
      headerIcon={<PlusIcon className="w-6 h-6 text-white" />}
      headerActions={user && (
        <p className="text-sm text-teal-100">
          Posting as <span className="font-semibold text-white">{user.username || user.email}</span>
        </p>
      )}
      showHeader={true}
      fullWidth={true}
      background="bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Form (70%) */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 space-y-6">
                {/* Title Input */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Question Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="What's your question? Be specific and clear"
                    maxLength={200}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-400 disabled:opacity-50"
                    required
                  />
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className={`${formData.title.length < MIN_TITLE_LENGTH ? 'text-red-500' :
                      formData.title.length < 50 ? 'text-yellow-500' :
                        'text-green-500'
                      }`}>
                      {formData.title.length < MIN_TITLE_LENGTH && `Minimum ${MIN_TITLE_LENGTH} characters`}
                      {formData.title.length >= MIN_TITLE_LENGTH && formData.title.length < 50 && 'Good length'}
                      {formData.title.length >= 50 && 'Excellent!'}
                    </span>
                    <span className="text-gray-500">
                      {formData.title.length}/{MAX_TITLE_LENGTH}
                    </span>
                  </div>
                </div>

                {/* Category Selector */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50"
                    required
                  >
                    <option value="">Select a category</option>
                    {Array.isArray(categories) && categories
                      .filter(cat => !['all', 'home', 'members', 'community-chat'].includes(cat.id))
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Tags Input */}
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                    Tags <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add keywords like #question, #javascript, #python"
                      maxLength={30}
                      disabled={isSubmitting || formData.tags.length >= MAX_TAGS}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-400 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag()}
                      disabled={isSubmitting || !tagInput.trim() || formData.tags.length >= MAX_TAGS}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {suggestedTags.length > 0 && formData.tags.length < MAX_TAGS && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-2">Suggested tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedTags
                          .filter(tag => !formData.tags.includes(tag.replace('#', '')))
                          .map((tag, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleAddTag(tag)}
                              className="px-3 py-1 text-xs bg-gray-100 hover:bg-teal-100:bg-teal-900/30 text-gray-700 hover:text-teal-700:text-teal-300 rounded-full transition-colors"
                            >
                              {tag}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm"
                        >
                          <TagIcon className="w-3 h-3" />
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            disabled={isSubmitting}
                            className="hover:text-teal-900:text-teal-100 disabled:opacity-50"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    {formData.tags.length === 0 && (
                      <span className="text-red-500 font-medium">
                        Please add at least {MIN_TAGS} tag to help others find your question
                      </span>
                    )}
                    {formData.tags.length > 0 && (
                      <span>
                        Add up to {MAX_TAGS} tags • {formData.tags.length} of {MIN_TAGS} required added
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Content <span className="text-red-500">*</span>
                  </label>

                  {/* Write/Preview Tabs */}
                  <div className="flex items-center gap-2 mb-3 border-b border-gray-200">
                    <button
                      type="button"
                      onClick={() => setPreviewMode(false)}
                      className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${!previewMode
                        ? 'border-teal-500 text-teal-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode(true)}
                      className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${previewMode
                        ? 'border-teal-500 text-teal-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      Preview
                    </button>
                  </div>

                  {!previewMode && (
                    <>
                      {/* Enhanced Formatting Toolbar */}
                      <div className="flex flex-wrap gap-2 mb-2 p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                        {/* Basic Text Formatting */}
                        <button
                          type="button"
                          onClick={() => insertFormatting('bold')}
                          className="p-2 hover:bg-white hover:shadow-sm rounded text-gray-700 transition-all"
                          title="Bold"
                        >
                          <span className="font-bold">B</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting('italic')}
                          className="p-2 hover:bg-white hover:shadow-sm rounded text-gray-700 transition-all"
                          title="Italic"
                        >
                          <span className="italic">I</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting('underline')}
                          className="p-2 hover:bg-white hover:shadow-sm rounded text-gray-700 transition-all"
                          title="Underline"
                        >
                          <span className="underline">U</span>
                        </button>

                        <div className="border-l border-gray-300 mx-1"></div>

                        {/* Text Formats Dropdown */}
                        <div className="relative text-formats-container">
                          <button
                            type="button"
                            onClick={() => setShowTextFormats(!showTextFormats)}
                            className="flex items-center gap-1 px-2 py-2 hover:bg-white hover:shadow-sm rounded text-gray-700 transition-all text-xs font-medium"
                            title="Text Formats"
                          >
                            <span>H</span>
                            <ChevronDownIcon className="w-3 h-3" />
                          </button>
                          {showTextFormats && (
                            <div className="absolute z-50 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[160px] py-1">
                              <button
                                type="button"
                                onClick={() => { insertFormatting('heading1'); setShowTextFormats(false); }}
                                className="w-full px-4 py-2 text-left hover:bg-teal-50 transition-colors"
                              >
                                <span className="text-xl font-bold">Heading 1</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => { insertFormatting('heading2'); setShowTextFormats(false); }}
                                className="w-full px-4 py-2 text-left hover:bg-teal-50 transition-colors"
                              >
                                <span className="text-lg font-bold">Heading 2</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => { insertFormatting('heading3'); setShowTextFormats(false); }}
                                className="w-full px-4 py-2 text-left hover:bg-teal-50 transition-colors"
                              >
                                <span className="text-base font-bold">Heading 3</span>
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => insertFormatting('link')}
                          className="p-2 hover:bg-white hover:shadow-sm rounded text-gray-700 transition-all"
                          title="Link"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => insertFormatting('list')}
                          className="p-2 hover:bg-white hover:shadow-sm rounded text-gray-700 transition-all"
                          title="Bullet List"
                        >
                          <ListBulletIcon className="w-4 h-4" />
                        </button>

                        <div className="border-l border-gray-300 mx-1"></div>

                        {/* More Options Dropdown */}
                        <div className="relative more-options-container">
                          <button
                            type="button"
                            onClick={() => setShowMoreOptions(!showMoreOptions)}
                            className="flex items-center gap-1 px-2 py-2 hover:bg-white hover:shadow-sm rounded text-gray-700 transition-all text-xs font-medium"
                            title="More Options"
                          >
                            <span>···</span>
                            <ChevronDownIcon className="w-3 h-3" />
                          </button>
                          {showMoreOptions && (
                            <div className="absolute z-50 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[180px] py-1">
                              <button
                                type="button"
                                onClick={() => { insertFormatting('numberedList'); setShowMoreOptions(false); }}
                                className="w-full px-4 py-2 text-left hover:bg-teal-50 transition-colors text-sm"
                              >
                                <span className="flex items-center gap-2">
                                  <span className="font-semibold">1.</span> Numbered List
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => { insertFormatting('code'); setShowMoreOptions(false); }}
                                className="w-full px-4 py-2 text-left hover:bg-teal-50 transition-colors text-sm"
                              >
                                <span className="flex items-center gap-2">
                                  <span className="font-mono">&lt;&gt;</span> Inline Code
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => { insertFormatting('codeBlock'); setShowMoreOptions(false); }}
                                className="w-full px-4 py-2 text-left hover:bg-teal-50 transition-colors text-sm"
                              >
                                <span className="flex items-center gap-2">
                                  <span className="font-mono">&#123; &#125;</span> Code Block
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => { insertFormatting('quote'); setShowMoreOptions(false); }}
                                className="w-full px-4 py-2 text-left hover:bg-teal-50 transition-colors text-sm"
                              >
                                <span className="flex items-center gap-2">
                                  <span className="text-lg">"</span> Quote
                                </span>
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="border-l border-gray-300 mx-1"></div>

                        {/* Color Pickers */}
                        <div className="relative color-picker-container">
                          <button
                            type="button"
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="p-2 hover:bg-white hover:shadow-sm rounded transition-all"
                            title="Text Color"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                              <path d="M12 3L3 21h4l2-5h6l2 5h4L12 3zm0 5.84L14.5 14h-5l2.5-5.16z" fill="currentColor" />
                              <rect x="6" y="20" width="12" height="2" className="fill-current text-red-500" />
                            </svg>
                          </button>
                          {showColorPicker && (
                            <div className="absolute z-50 mt-2 p-3 bg-white rounded-lg shadow-xl border border-gray-200 w-56">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-gray-700">Text Color</span>
                                <button type="button" onClick={() => setShowColorPicker(false)} className="text-gray-400 hover:text-gray-600">
                                  <XMarkIcon className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="grid grid-cols-6 gap-1.5">
                                {['#000000', '#DC2626', '#2563EB', '#059669', '#D97706', '#7C3AED', '#EA580C', '#65A30D', '#0891B2', '#C026D3', '#DB2777', '#64748B'].map(color => (
                                  <button
                                    key={color}
                                    type="button"
                                    onClick={() => insertColor(color, false)}
                                    className="w-7 h-7 rounded border hover:scale-110 transition-transform"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="relative bg-color-picker-container">
                          <button
                            type="button"
                            onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                            className="p-2 hover:bg-white hover:shadow-sm rounded transition-all"
                            title="Highlight"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                              <rect x="4" y="8" width="16" height="10" rx="2" className="fill-yellow-300" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                          </button>
                          {showBgColorPicker && (
                            <div className="absolute z-50 mt-2 p-3 bg-white rounded-lg shadow-xl border border-gray-200 w-56">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-gray-700">Highlight</span>
                                <button type="button" onClick={() => setShowBgColorPicker(false)} className="text-gray-400 hover:text-gray-600">
                                  <XMarkIcon className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="grid grid-cols-6 gap-1.5">
                                {['#FEF3C7', '#FED7AA', '#FECACA', '#FBCFE8', '#FDE68A', '#FCA5A5', '#DDD6FE', '#BFDBFE', '#BAE6FD', '#A7F3D0', '#BBF7D0', '#E5E7EB'].map(color => (
                                  <button
                                    key={color}
                                    type="button"
                                    onClick={() => insertColor(color, true)}
                                    className="w-7 h-7 rounded border hover:scale-110 transition-transform"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="border-l border-gray-300 mx-1"></div>

                        {/* Emoji & Image */}
                        <div className="relative emoji-picker-container">
                          <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="p-2 hover:bg-white hover:shadow-sm rounded text-gray-700 transition-all"
                            title="Emoji"
                          >
                            <FaceSmileIcon className="w-4 h-4" />
                          </button>
                          <EmojiPicker
                            isOpen={showEmojiPicker}
                            onEmojiSelect={insertEmoji}
                            onClose={() => setShowEmojiPicker(false)}
                          />
                        </div>

                        <label
                          htmlFor="imageUpload"
                          className="p-2 hover:bg-white hover:shadow-sm rounded text-gray-700 transition-all cursor-pointer"
                          title="Upload Images"
                        >
                          <PhotoIcon className="w-4 h-4" />
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

                        <span className="text-xs text-gray-500 px-1">
                          {formData.images.length}/{MAX_IMAGES}
                        </span>
                      </div>

                      <MentionInput
                        ref={contentRef}
                        value={formData.content}
                        onChange={(newValue) => setFormData(prev => ({ ...prev, content: newValue }))}
                        placeholder="Describe your question in detail. What exactly are you trying to learn or understand? Include examples, context, and what you've already tried. The more specific you are, the better answers you'll receive."
                        rows={12}
                        maxLength={MAX_CONTENT_LENGTH}
                        disabled={isSubmitting}
                        showCharCount={false}
                        className="font-mono text-sm"
                      />
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className={`${formData.content.length < MIN_CONTENT_LENGTH ? 'text-red-500' :
                          formData.content.length < 100 ? 'text-yellow-500' :
                            'text-green-500'
                          }`}>
                          {formData.content.length < MIN_CONTENT_LENGTH && `Minimum ${MIN_CONTENT_LENGTH} characters`}
                          {formData.content.length >= MIN_CONTENT_LENGTH && formData.content.length < 100 && 'Add more details'}
                          {formData.content.length >= 100 && 'Good detail level'}
                        </span>
                      </div>
                    </>
                  )}

                  {previewMode && (
                    <div className="border border-gray-300 rounded-lg p-4 min-h-[300px] bg-gray-50">
                      {formData.content.trim() ? (
                        <div className="prose prose-sm sm:prose max-w-none">
                          <MentionRenderer
                            content={formData.content}
                            theme="teal"
                          />
                        </div>
                      ) : (
                        <div className="text-gray-400 text-center py-12">
                          Nothing to preview yet. Switch to Write tab to add content.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {formData.images.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Uploaded Images ({formData.images.length}/{MAX_IMAGES})
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.data}
                            alt={image.name}
                            className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Remove image"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                          <div className="mt-1 text-xs text-gray-500 truncate">
                            {image.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="subscribe"
                    checked={subscribeToUpdates}
                    onChange={(e) => setSubscribeToUpdates(e.target.checked)}
                    className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500:ring-teal-600 focus:ring-2"
                  />
                  <label htmlFor="subscribe" className="ml-2 text-sm text-gray-700">
                    Subscribe to thread updates (receive notifications about replies)
                  </label>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-gray-50:bg-gray-700 text-gray-700 border border-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.title.trim() || !formData.content.trim() || !formData.category || formData.tags.length < MIN_TAGS}
                    className="flex-1 sm:flex-none px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {editMode ? 'Updating...' : 'Posting Question...'}
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-5 h-5" />
                        {editMode ? 'Update Discussion' : 'Ask Question'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                How to Ask a Good Question
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>Be specific about what you want to learn or understand</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>Include examples and context to help others help you</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>Mention what you've already tried or researched</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>Use relevant tags so experts in that area can find you</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>Search existing questions to avoid duplicates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>Be patient and respectful while waiting for answers</span>
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Community Guidelines
                </h4>
                <p className="text-xs text-gray-600 mb-3">
                  Help us maintain a welcoming and helpful community for all members.
                </p>
                <a
                  href="/discussions/guidelines"
                  className="text-sm text-teal-600"
                >
                  Read full guidelines →
                </a>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-lg">
                  <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-medium mb-1">Before asking:</p>
                    <p>Search existing questions to see if someone already asked something similar.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default NewDiscussion;

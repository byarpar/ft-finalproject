import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import Modal from '../UI/Modal';
import { discussionsAPI } from '../../services/api';

const NewTopicModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: ''
  });
  const [errors, setErrors] = useState({});

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: discussionsAPI.createDiscussion,
    onSuccess: (data) => {
      // Invalidate discussions queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['discussions'] });

      // Reset form and close modal
      setFormData({
        title: '',
        content: '',
        category: 'general',
        tags: ''
      });
      setErrors({});
      onClose();
    },
    onError: (error) => {
      console.error('Error creating discussion:', error);
      setErrors({ submit: 'Failed to create discussion. Please try again.' });
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateForm()) {
      return;
    }

    // Double-check we're not already submitting
    if (createMutation.isPending) {
      return;
    }

    // Additional mobile touch protection
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobileDevice && e.nativeEvent && e.nativeEvent.type === 'touchend') {
      // Add a small delay for mobile touches to prevent accidental double-taps
      setTimeout(() => {
        if (!createMutation.isPending) {
          submitDiscussion();
        }
      }, 100);
    } else {
      submitDiscussion();
    }
  };

  const submitDiscussion = () => {
    const discussionData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      category: formData.category,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    createMutation.mutate(discussionData);
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      setFormData({
        title: '',
        content: '',
        category: 'general',
        tags: ''
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Discussion"
      size="lg"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6 form-touch-safe"
        style={{ touchAction: 'manipulation' }}
        onTouchStart={(e) => {
          // Prevent form submission on accidental touch
          const target = e.target;
          if (target.type === 'submit' && createMutation.isPending) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter discussion title..."
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.title ? 'border-red-300' : 'border-gray-300'}
            `}
            disabled={createMutation.isPending}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={createMutation.isPending}
          >
            <option value="general">General Discussion</option>
            <option value="language">Language Learning</option>
            <option value="culture">Culture & Traditions</option>
            <option value="translation">Translation Help</option>
            <option value="pronunciation">Pronunciation</option>
            <option value="etymology">Etymology</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="Enter tags separated by commas..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={createMutation.isPending}
          />
          <p className="mt-1 text-sm text-gray-500">
            Separate multiple tags with commas (e.g., grammar, verb, tense)
          </p>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Write your discussion content here..."
            rows={6}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical
              ${errors.content ? 'border-red-300' : 'border-gray-300'}
            `}
            disabled={createMutation.isPending}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClose();
            }}
            disabled={createMutation.isPending}
            style={{ touchAction: 'manipulation' }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-safe"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            style={{ touchAction: 'manipulation' }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-safe"
            onTouchStart={(e) => {
              // Prevent accidental touch activation
              if (createMutation.isPending) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            onTouchEnd={(e) => {
              // Additional safety check
              if (createMutation.isPending) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            {createMutation.isPending ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating...</span>
              </div>
            ) : (
              'Create Discussion'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NewTopicModal;
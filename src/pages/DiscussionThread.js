import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { discussionsAPI, answersAPI } from '../services/api';
import HeroNavbar from '../components/Layout/HeroNavbar';
import {
  ChatBubbleLeftRightIcon,
  BookmarkIcon,
  ClockIcon,
  TrashIcon,
  PencilIcon,
  FlagIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ListBulletIcon,
  LinkIcon as LinkOutlineIcon,
  ChatBubbleLeftIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassPlusIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import {
  BookmarkIcon as BookmarkSolidIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/UI/SkeletonLoader';
import DiscussionActions from '../components/Discussion/DiscussionActions';
import VoteButtons from '../components/Discussion/VoteButtons';
import { formatRelativeDate } from '../utils/dateUtils';
import PageLayout from '../components/Layout/PageLayout';

/**
 * DiscussionThreadEnhanced Component
 * 
 * Displays a single discussion thread with replies, voting,
 * bookmarking, and real-time updates via WebSocket.
 */

const DiscussionThreadEnhanced = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const replyEditorRef = useRef(null);

  // Main state
  const [discussion, setDiscussion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [relatedDiscussions, setRelatedDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reply state
  const [replyContent, setReplyContent] = useState('');
  const [replyImages, setReplyImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyToUsername, setReplyToUsername] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);

  // Constants for reply validation
  const MAX_REPLY_LENGTH = 5000;
  const MAX_REPLY_IMAGES = 5;
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  // Reply sorting
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, most_voted

  // Thread actions state
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState(null);
  const [otherReasonText, setOtherReasonText] = useState('');

  // Edit state for replies
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editContent, setEditContent] = useState('');

  // Edit state for discussion
  const [editingDiscussion, setEditingDiscussion] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedImages, setEditedImages] = useState([]);
  const [isUpdatingDiscussion, setIsUpdatingDiscussion] = useState(false);

  // Nested replies
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  // Note: nestedReplies state removed - backend returns replies in answer.replies array

  // Image lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState([]);

  // Fetch discussion details
  const fetchDiscussion = useCallback(async () => {
    try {
      setLoading(true);
      const response = await discussionsAPI.getDiscussionById(id);

      // Handle different response formats
      let discussionData = response.discussion || response.data?.discussion || response;

      // Normalize images data
      if (discussionData.images) {
        if (typeof discussionData.images === 'string') {
          try {
            discussionData.images = JSON.parse(discussionData.images);
          } catch (e) {
            console.warn('Failed to parse images:', e);
            discussionData.images = [];
          }
        }

        // Ensure it's an array
        if (!Array.isArray(discussionData.images)) {
          discussionData.images = [];
        }
      } else {
        discussionData.images = [];
      }

      setDiscussion(discussionData);
      setError(null);
    } catch (err) {
      console.error('Error fetching discussion:', err);
      // Extract error message from various error formats
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load discussion. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch answers/replies
  const fetchAnswers = useCallback(async () => {
    try {
      const response = await answersAPI.getAnswersForDiscussion(id);
      const answersData = response.data?.answers || response.answers || [];

      // Normalize images data for each answer (including nested replies)
      const normalizeAnswerImages = (answer) => {
        let images = [];

        // Handle different image formats
        if (answer.images) {
          if (typeof answer.images === 'string') {
            try {
              images = JSON.parse(answer.images);
            } catch (e) {
              console.warn('Failed to parse answer images:', answer.id, e);
              images = [];
            }
          } else if (Array.isArray(answer.images)) {
            images = answer.images;
          }
        }

        // Ensure images is an array
        images = Array.isArray(images) ? images : [];

        // Recursively normalize nested replies
        const replies = answer.replies && Array.isArray(answer.replies)
          ? answer.replies.map(reply => normalizeAnswerImages(reply))
          : [];

        return {
          ...answer,
          images,
          replies
        };
      };

      const normalizedAnswers = answersData.map(answer => normalizeAnswerImages(answer));

      // Backend already returns nested structure - only show top-level answers
      const topLevelAnswers = normalizedAnswers.filter(answer => !answer.parent_answer_id);
      setAnswers(topLevelAnswers);
    } catch (err) {
      console.error('Error fetching answers:', err);
    }
  }, [id]);

  // Fetch related discussions
  const fetchRelatedDiscussions = useCallback(async () => {
    try {
      if (!discussion) return;

      const response = await discussionsAPI.getRelatedDiscussions(id, {
        limit: 5
      });

      setRelatedDiscussions(response.data?.discussions || []);
    } catch (err) {
      console.error('Error fetching related discussions:', err);
    }
  }, [discussion, id]);

  useEffect(() => {
    fetchDiscussion();
    fetchAnswers();
  }, [fetchDiscussion, fetchAnswers]);

  useEffect(() => {
    if (discussion) {
      fetchRelatedDiscussions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchRelatedDiscussions]);

  // Organize nested replies
  // Backend already returns nested replies in answer.replies array
  // No need for client-side organization

  // Sort replies
  const sortReplies = (replies) => {
    const sorted = [...replies];

    switch (sortBy) {
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'most_voted':
        return sorted.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  };

  // Handle save/bookmark discussion
  const handleSaveDiscussion = async () => {
    if (!user) {
      toast.error('Please login to save discussions');
      navigate('/login');
      return;
    }

    try {
      if (discussion.is_saved) {
        await discussionsAPI.unsaveDiscussion(id);
        toast.success('Discussion removed from saved');
      } else {
        await discussionsAPI.saveDiscussion(id);
        toast.success('Discussion saved!');
      }
      setDiscussion(prev => ({ ...prev, is_saved: !prev.is_saved }));
    } catch (err) {
      console.error('Error saving discussion:', err);
      toast.error('Failed to save discussion');
    }
  };

  // Handle report reason selection
  const handleReportReasonSelect = (reason) => {
    if (reason === 'Other') {
      setSelectedReportReason(reason);
    } else {
      handleReport(reason);
    }
  };

  // Handle report submission
  const handleReport = async (reason) => {
    if (!user) {
      toast.error('Please login to report content');
      navigate('/login');
      return;
    }

    // Validate "Other" reason has description
    if (reason === 'Other' && !otherReasonText.trim()) {
      toast.error('Please provide a reason for reporting');
      return;
    }

    try {
      const reportData = {
        reason,
        description: reason === 'Other' ? otherReasonText.trim() : undefined
      };
      await discussionsAPI.reportDiscussion(id, reportData);
      toast.success('Report submitted. Our team will review it shortly.');
      setShowReportModal(false);
      setSelectedReportReason(null);
      setOtherReasonText('');
    } catch (err) {
      console.error('Error reporting discussion:', err);
      const errorMessage = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to submit report';
      toast.error(errorMessage);
    }
  };

  // Handle mark as solved
  const handleToggleSolved = async () => {
    if (!user) {
      toast.error('Please login to mark as solved');
      navigate('/login');
      return;
    }

    try {
      if (discussion.is_solved) {
        await discussionsAPI.unmarkAsSolved(id);
        toast.success('Discussion unmarked as solved');
        setDiscussion(prev => ({ ...prev, is_solved: false, accepted_answer_id: null }));
      } else {
        // If there are answers, let them choose which one is best
        toast.info('Mark an answer as best to solve this discussion');
      }
    } catch (err) {
      console.error('Error toggling solved status:', err);
      toast.error('Failed to update solved status');
    }
  };

  // Handle pin/unpin (admin only)
  const handleTogglePinned = async () => {
    if (!user || user.role !== 'admin') {
      toast.error('Only admins can pin discussions');
      return;
    }

    try {
      if (discussion.is_pinned) {
        await discussionsAPI.unpinDiscussion(id);
        toast.success('Discussion unpinned');
        setDiscussion(prev => ({ ...prev, is_pinned: false }));
      } else {
        await discussionsAPI.pinDiscussion(id);
        toast.success('Discussion pinned to top');
        setDiscussion(prev => ({ ...prev, is_pinned: true }));
      }
    } catch (err) {
      console.error('Error toggling pinned status:', err);
      toast.error('Failed to update pinned status');
    }
  };

  // Handle lock/unlock (admin only)
  const handleToggleLocked = async () => {
    if (!user || user.role !== 'admin') {
      toast.error('Only admins can lock discussions');
      return;
    }

    try {
      if (discussion.is_locked) {
        await discussionsAPI.unlockDiscussion(id);
        toast.success('Discussion unlocked');
        setDiscussion(prev => ({ ...prev, is_locked: false }));
      } else {
        await discussionsAPI.lockDiscussion(id);
        toast.success('Discussion locked - no new replies allowed');
        setDiscussion(prev => ({ ...prev, is_locked: true }));
      }
    } catch (err) {
      console.error('Error toggling locked status:', err);
      toast.error('Failed to update locked status');
    }
  };

  // Handle submit reply
  const handleSubmitReply = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to reply');
      navigate('/login');
      return;
    }

    // Check if discussion is locked
    if (discussion.is_locked) {
      toast.error('This discussion is locked and no longer accepting replies');
      return;
    }

    if (!replyContent.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    if (replyContent.trim().length < 10) {
      toast.error('Reply must be at least 10 characters long');
      return;
    }

    try {
      setIsSubmitting(true);

      const replyData = {
        discussion_id: id,
        content: replyContent.trim(),
        parent_answer_id: replyingTo,
        images: replyImages.map(img => img.data) // Include images
      };

      await answersAPI.createAnswer(replyData);

      toast.success('Reply posted successfully!');
      setReplyContent('');
      setReplyImages([]);
      setReplyingTo(null);
      setReplyToUsername('');
      setShowReplyBox(false);

      // Refresh answers
      await fetchAnswers();

      // Update discussion reply count
      setDiscussion(prev => ({
        ...prev,
        answers_count: (prev.answers_count || 0) + 1
      }));

    } catch (err) {
      console.error('Error posting reply:', err);
      toast.error(err.response?.data?.error || 'Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit answer
  const handleEditAnswer = (answer) => {
    setEditingAnswerId(answer.id);
    setEditContent(answer.content);
  };

  // Handle save edit
  const handleSaveEdit = async (answerId) => {
    if (!editContent.trim()) {
      toast.error('Content is required');
      return;
    }

    if (editContent.trim().length < 10) {
      toast.error('Content must be at least 10 characters long');
      return;
    }

    try {
      await answersAPI.updateAnswer(answerId, { content: editContent });
      toast.success('Reply updated successfully');
      setEditingAnswerId(null);
      setEditContent('');
      await fetchAnswers();
    } catch (err) {
      console.error('Error updating answer:', err);
      toast.error('Failed to update reply');
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingAnswerId(null);
    setEditContent('');
  };

  // Handle delete answer
  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) {
      return;
    }

    try {
      await answersAPI.deleteAnswer(answerId);
      toast.success('Reply deleted successfully');
      await fetchAnswers();

      // Update discussion reply count
      setDiscussion(prev => ({
        ...prev,
        answers_count: Math.max(0, (prev.answers_count || 0) - 1)
      }));
    } catch (err) {
      console.error('Error deleting answer:', err);
      toast.error('Failed to delete reply');
    }
  };

  // Handle edit discussion
  const handleEditDiscussion = () => {
    setEditingDiscussion(true);
    setEditedTitle(discussion.title);
    setEditedContent(discussion.content);
    setEditedImages(discussion.images || []);
  };

  // Handle save discussion edit
  const handleSaveDiscussionEdit = async () => {
    if (!editedTitle.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!editedContent.trim()) {
      toast.error('Content is required');
      return;
    }

    if (editedContent.trim().length < 10) {
      toast.error('Content must be at least 10 characters long');
      return;
    }

    try {
      setIsUpdatingDiscussion(true);

      const updateData = {
        title: editedTitle.trim(),
        content: editedContent.trim(),
        images: editedImages
      };

      await discussionsAPI.updateDiscussion(id, updateData);
      toast.success('Discussion updated successfully!');

      // Refresh discussion
      await fetchDiscussion();
      setEditingDiscussion(false);
    } catch (err) {
      console.error('Error updating discussion:', err);
      toast.error(err.response?.data?.error || 'Failed to update discussion');
    } finally {
      setIsUpdatingDiscussion(false);
    }
  };

  // Handle cancel discussion edit
  const handleCancelDiscussionEdit = () => {
    setEditingDiscussion(false);
    setEditedTitle('');
    setEditedContent('');
    setEditedImages([]);
  };

  // Handle delete discussion
  const handleDeleteDiscussion = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this discussion? This action cannot be undone and will delete all replies as well.'
    );

    if (!confirmed) {
      return;
    }

    try {
      await discussionsAPI.deleteDiscussion(id);
      toast.success('Discussion deleted successfully');
      navigate('/discussions');
    } catch (err) {
      console.error('Error deleting discussion:', err);
      toast.error(err.response?.data?.error || 'Failed to delete discussion');
    }
  };

  // Handle discussion image upload
  const handleDiscussionImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (editedImages.length + files.length > MAX_REPLY_IMAGES) {
      toast.error(`Maximum ${MAX_REPLY_IMAGES} images allowed`);
      return;
    }

    files.forEach(file => {
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedImages(prev => [...prev, {
          name: file.name,
          data: reader.result
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle remove discussion image
  const handleRemoveDiscussionImage = (index) => {
    setEditedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle reply to answer
  const handleReplyToAnswer = (answer) => {
    setReplyingTo(answer.id);
    setReplyToUsername(answer.author_name || 'this comment');
    setShowReplyBox(true);

    // Scroll to reply box
    setTimeout(() => {
      replyEditorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      replyEditorRef.current?.focus();
    }, 100);
  };

  // Toggle nested replies
  const toggleNestedReplies = (answerId) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(answerId)) {
        newSet.delete(answerId);
      } else {
        newSet.add(answerId);
      }
      return newSet;
    });
  };

  // Image lightbox functions
  const openLightbox = (images, index) => {
    setLightboxImages(images);
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'unset';
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % lightboxImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
  };

  const downloadImage = () => {
    const currentImage = lightboxImages[currentImageIndex];
    const imageUrl = typeof currentImage === 'string' ? currentImage : (currentImage?.data || currentImage?.url);

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `discussion-image-${currentImageIndex + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image downloaded!');
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyPress = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') previousImage();
      if (e.key === 'ArrowRight') nextImage();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, lightboxImages.length]);

  // Rich text formatting helpers
  const insertFormatting = (format) => {
    const textarea = replyEditorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = replyContent.substring(start, end);
    let newText = replyContent;
    let newCursorPos = start;

    switch (format) {
      case 'bold':
        newText = replyContent.substring(0, start) + `**${selectedText || 'bold text'}**` + replyContent.substring(end);
        newCursorPos = start + 2 + (selectedText ? selectedText.length : 9);
        break;
      case 'italic':
        newText = replyContent.substring(0, start) + `*${selectedText || 'italic text'}*` + replyContent.substring(end);
        newCursorPos = start + 1 + (selectedText ? selectedText.length : 11);
        break;
      case 'code':
        newText = replyContent.substring(0, start) + `\`${selectedText || 'code'}\`` + replyContent.substring(end);
        newCursorPos = start + 1 + (selectedText ? selectedText.length : 4);
        break;
      case 'link':
        newText = replyContent.substring(0, start) + `[${selectedText || 'link text'}](url)` + replyContent.substring(end);
        newCursorPos = end + (selectedText ? 3 : 13);
        break;
      case 'list':
        newText = replyContent.substring(0, start) + `\n- ${selectedText || 'list item'}\n` + replyContent.substring(end);
        newCursorPos = start + 3 + (selectedText ? selectedText.length : 9);
        break;
      case 'lisu':
        newText = replyContent.substring(0, start) + '【' + (selectedText || '') + '】' + replyContent.substring(end);
        newCursorPos = start + 1;
        break;
      default:
        return;
    }

    setReplyContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Handle image upload for replies
  const handleReplyImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (replyImages.length + files.length > MAX_REPLY_IMAGES) {
      toast.error(`Maximum ${MAX_REPLY_IMAGES} images allowed`);
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
      reader.onload = (event) => {
        setReplyImages(prev => [...prev, {
          name: file.name,
          data: event.target.result
        }]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  // Remove reply image
  const handleRemoveReplyImage = (index) => {
    setReplyImages(prev => prev.filter((_, i) => i !== index));
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'grammar': 'bg-blue-100 text-blue-700 border-blue-200',
      'pronunciation': 'bg-green-100 text-green-700 border-green-200',
      'vocabulary': 'bg-purple-100 text-purple-700 border-purple-200',
      'culture': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'general': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    const categoryKey = typeof category === 'object' ? category.id : category;
    return colors[categoryKey] || colors.general;
  };

  if (loading) {
    return (
      <PageLayout title="Loading Discussion">
        <HeroNavbar />
        <div className="min-h-screen bg-gray-50 pt-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content Skeleton */}
              <div className="lg:col-span-2 space-y-4">
                <SkeletonLoader variant="text" className="h-8 w-3/4" />
                <SkeletonLoader variant="card" className="h-64" />
                <SkeletonLoader variant="text" count={3} />
                <div className="space-y-3">
                  <SkeletonLoader variant="list-item" count={3} />
                </div>
              </div>

              {/* Sidebar Skeleton */}
              <div className="space-y-4">
                <SkeletonLoader variant="card" className="h-32" />
                <SkeletonLoader variant="card" className="h-48" />
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !discussion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ChatBubbleLeftIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-red-600 mb-4 text-lg">
            {typeof error === 'string' ? error : error?.message || 'Discussion not found'}
          </p>
          <button
            onClick={() => navigate('/discussions')}
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
          >
            Back to Discussions
          </button>
        </div>
      </div>
    );
  }

  const sortedAnswers = sortReplies(answers);

  return (
    <PageLayout
      title={discussion ? `${discussion.title} - Lisu Dictionary` : 'Discussion - Lisu Dictionary'}
      description={discussion ? discussion.content?.substring(0, 155) : 'View discussion thread'}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header Navigation */}
        <HeroNavbar />

        {/* Breadcrumbs - Mobile Optimized */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3">
            <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm overflow-x-auto scrollbar-hide">
              <Link
                to="/discussions"
                className="text-teal-600 hover:text-teal-700:text-teal-300 font-medium whitespace-nowrap touch-manipulation"
              >
                Discussions
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600 truncate max-w-[80px] sm:max-w-none whitespace-nowrap">
                {typeof discussion.category === 'object' ? discussion.category.name : discussion.category || 'General'}
              </span>
              <span className="text-gray-400 hidden sm:inline">/</span>
              <span className="text-gray-900 font-medium truncate max-w-[100px] sm:max-w-md hidden sm:inline">
                {discussion.title}
              </span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Main Content - Mobile Optimized */}
            <div className="lg:col-span-2">
              {/* Original Post */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4 sm:mb-6 border border-gray-200">
                {/* Thread Header */}
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  {/* Category Badge & Actions Row */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span
                      className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                        discussion.category
                      )}`}
                    >
                      {typeof discussion.category === 'object'
                        ? discussion.category.name
                        : discussion.category || 'General'}
                    </span>

                    {/* Thread Actions (Top Right) - Enhanced Touch Targets */}
                    <div className="flex items-center gap-1 sm:gap-2">
                      {/* Edit/Delete Buttons (for author) */}
                      {user && user.id === discussion.author_id && !editingDiscussion && (
                        <>
                          <button
                            onClick={handleEditDiscussion}
                            className="p-2 sm:p-1.5 text-gray-500 hover:text-teal-600:text-teal-400 transition-colors touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-lg active:bg-gray-100:bg-gray-700"
                            title="Edit discussion"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleDeleteDiscussion}
                            className="p-2 sm:p-1.5 text-gray-500 hover:text-red-600:text-red-400 transition-colors touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-lg active:bg-gray-100:bg-gray-700"
                            title="Delete discussion"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {/* Report Button (hidden for author, visible for others) */}
                      {(!user || user.id !== discussion.author_id) && (
                        <button
                          onClick={() => setShowReportModal(true)}
                          className="p-2 sm:p-1.5 text-gray-500 hover:text-red-600:text-red-400 transition-colors touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-lg active:bg-gray-100:bg-gray-700"
                          title="Report thread"
                        >
                          <FlagIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title - Edit Mode or Display Mode */}
                  {editingDiscussion ? (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-lg sm:text-2xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent touch-manipulation"
                        placeholder="Discussion title..."
                      />
                    </div>
                  ) : (
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                      {discussion.title}
                    </h1>
                  )}

                  {/* Discussion Status Actions - Admin Only */}
                  {!editingDiscussion && user && user.role === 'admin' && (
                    <div className="mb-4">
                      <DiscussionActions
                        discussion={discussion}
                        isAuthor={user && user.id === discussion.author_id}
                        isAdmin={true}
                        onToggleSolved={handleToggleSolved}
                        onTogglePinned={handleTogglePinned}
                        onToggleLocked={handleToggleLocked}
                        showSolved={false}
                      />
                    </div>
                  )}

                  {/* Tags - Horizontally Scrollable on Mobile */}
                  {discussion.tags && discussion.tags.length > 0 && (
                    <div className="flex gap-2 mb-3 sm:mb-4 overflow-x-auto scrollbar-hide pb-1">
                      {discussion.tags.map((tag, index) => (
                        <Link
                          key={index}
                          to={`/discussions?tag=${tag}`}
                          className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 rounded-full text-xs font-medium hover:from-teal-100 hover:to-cyan-100:from-teal-900/40:to-cyan-900/40 transition-all border border-teal-200/50 whitespace-nowrap"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Author and Meta Info - Stacked on Mobile */}
                  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-2.5">
                      <Link
                        to={`/users/${discussion.author_id}`}
                        className="flex-shrink-0 relative"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 p-0.5 hover:scale-110 transition-transform duration-300">
                          <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center">
                            {discussion.user_data?.display_picture && (
                              <img
                                src={discussion.user_data.display_picture}
                                alt={discussion.user_data?.username || 'User'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            {!discussion.user_data?.display_picture && (
                              <span className="text-sm font-bold text-teal-600">
                                {(discussion.user_data?.username || 'A').charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        {discussion.user_data?.role === 'admin' && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                            <CheckBadgeIcon className="w-3.5 h-3.5 text-red-500" />
                          </div>
                        )}
                      </Link>
                      <div className="flex flex-col">
                        <Link
                          to={`/users/${discussion.author_id}`}
                          className="font-semibold text-sm text-gray-900 hover:text-teal-600:text-teal-400 transition-colors"
                        >
                          {discussion.user_data?.username || 'Anonymous'}
                        </Link>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <ClockIcon className="w-3.5 h-3.5" />
                          <span>Posted {formatRelativeDate(discussion.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4 sm:p-6">
                  {editingDiscussion ? (
                    <div className="space-y-4">
                      {/* Edit Mode */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Content
                        </label>
                        <textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          rows={8}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                          placeholder="Write your discussion content..."
                        />
                      </div>

                      {/* Image Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Images (Optional)
                        </label>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200:bg-gray-600 transition-colors">
                          <PhotoIcon className="w-5 h-5" />
                          <span>Upload Images</span>
                          <input
                            id="discussionImageUpload"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleDiscussionImageUpload}
                            className="hidden"
                          />
                        </label>
                        <span className="ml-3 text-xs text-gray-500">
                          {editedImages.length}/{MAX_REPLY_IMAGES} images
                        </span>
                      </div>

                      {/* Images Preview */}
                      {editedImages.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {editedImages.map((image, idx) => {
                            const imageUrl = typeof image === 'string' ? image : (image?.data || image?.url);
                            return (
                              <div key={idx} className="relative group">
                                <img
                                  src={imageUrl}
                                  alt={`Discussion attachment ${idx + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDiscussionImage(idx)}
                                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                  title="Remove image"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Edit Actions */}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={handleSaveDiscussionEdit}
                          disabled={isUpdatingDiscussion || !editedTitle.trim() || !editedContent.trim()}
                          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isUpdatingDiscussion ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Updating...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                        <button
                          onClick={handleCancelDiscussionEdit}
                          disabled={isUpdatingDiscussion}
                          className="px-6 py-2.5 text-gray-600 hover:text-gray-800:text-gray-200 font-medium rounded-lg hover:bg-gray-100:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Display Mode */}
                      <div className="prose max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap text-base leading-relaxed">
                          {discussion.content}
                        </p>
                      </div>

                      {/* Images Display - Mobile Responsive */}
                      {discussion.images && Array.isArray(discussion.images) && discussion.images.length > 0 && (
                        <div className="mt-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                            {discussion.images.map((image, idx) => {
                              const imageUrl = typeof image === 'string' ? image : (image?.data || image?.url);
                              return (
                                <div
                                  key={idx}
                                  className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100 shadow-md hover:shadow-xl transition-all duration-300 touch-manipulation active:scale-98"
                                  onClick={() => openLightbox(discussion.images, idx)}
                                >
                                  <img
                                    src={imageUrl}
                                    alt={`Attachment ${idx + 1}`}
                                    className="w-full h-32 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => {
                                      console.error('Failed to load image:', image);
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                  {/* Hover overlay - Hidden on mobile, shown on desktop */}
                                  <div className="absolute inset-0 bg-black bg-opacity-0 sm:group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                                    <div className="opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                                      <div className="bg-white rounded-full p-2">
                                        <MagnifyingGlassPlusIcon className="w-5 h-5 text-gray-700" />
                                      </div>
                                    </div>
                                  </div>
                                  {/* Image counter badge */}
                                  <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-black bg-opacity-70 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                    {idx + 1}/{discussion.images.length}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Post Actions - Mobile Optimized */}
                <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {/* Vote Button - Scaled for mobile */}
                    <div className="scale-90 sm:scale-100 origin-left">
                      <VoteButtons
                        itemId={discussion.id}
                        itemType="discussion"
                        initialVoteCount={discussion.vote_count || 0}
                        initialUpvotes={discussion.upvotes || 0}
                        initialUserVote={discussion.user_vote || null}
                        onVoteChange={(voteData) => {
                          setDiscussion(prev => ({
                            ...prev,
                            vote_count: voteData.vote_count,
                            upvotes: voteData.upvotes,
                            user_vote: voteData.vote_type
                          }));
                        }}
                      />
                    </div>

                    {/* Save/Bookmark Button - Enhanced Touch Target */}
                    <button
                      onClick={handleSaveDiscussion}
                      className={`flex items-center justify-center p-2.5 sm:p-1.5 rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 ${discussion.is_saved
                        ? 'bg-teal-100 hover:bg-teal-200:bg-teal-900/50'
                        : 'bg-gray-100 hover:bg-gray-200:bg-gray-600'
                        }`}
                      title={discussion.is_saved ? 'Saved' : 'Save'}
                    >
                      {discussion.is_saved ? (
                        <BookmarkSolidIcon className="w-4 h-4 text-teal-600" />
                      ) : (
                        <BookmarkIcon className="w-4 h-4 text-gray-500" />
                      )}
                    </button>

                    {/* Reply Button - Full width on mobile */}
                    <button
                      onClick={() => setShowReplyBox(!showReplyBox)}
                      className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-4 py-2.5 sm:py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-lg font-medium transition-colors flex-1 sm:flex-none sm:ml-auto touch-manipulation min-h-[44px] sm:min-h-0 text-sm sm:text-base active:scale-98 shadow-sm"
                    >
                      <ChatBubbleLeftRightIcon className="w-5 h-5" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Replies Section - Mobile Optimized */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
                {/* Replies Header with Sort */}
                <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      Replies ({answers.length})
                    </h2>
                  </div>

                  {/* Sort Dropdown - Enhanced Mobile */}
                  {answers.length > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">Sort by:</span>
                      <div className="relative">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="appearance-none px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-8 touch-manipulation min-h-[44px] sm:min-h-0"
                        >
                          <option value="newest">✨ Newest</option>
                          <option value="oldest">📅 Oldest</option>
                          <option value="most_voted">🔥 Most Voted</option>
                        </select>
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reply Form */}
                {(showReplyBox || user) && (
                  <div ref={replyEditorRef} className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                    {user ? (
                      <form onSubmit={handleSubmitReply}>
                        {replyingTo && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between border border-blue-200">
                            <span className="text-sm text-blue-700">
                              Replying to <strong>{replyToUsername}</strong>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyToUsername('');
                              }}
                              className="text-sm text-blue-600 hover:text-blue-700:text-blue-300 font-medium flex items-center gap-1"
                            >
                              <XMarkIcon className="w-4 h-4" />
                              Cancel
                            </button>
                          </div>
                        )}

                        {/* Rich Text Toolbar - Mobile Optimized */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 p-1.5 sm:p-2 bg-gray-50 rounded-lg border border-gray-200 overflow-x-auto scrollbar-hide">
                          <button
                            type="button"
                            onClick={() => insertFormatting('bold')}
                            className="p-2 hover:bg-gray-200:bg-gray-600 rounded text-gray-700 transition-colors touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
                            title="Bold"
                          >
                            <span className="font-bold text-sm sm:text-base">B</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting('italic')}
                            className="p-2 hover:bg-gray-200:bg-gray-600 rounded text-gray-700 transition-colors touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
                            title="Italic"
                          >
                            <span className="italic text-sm sm:text-base">I</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting('link')}
                            className="p-2 hover:bg-gray-200:bg-gray-600 rounded text-gray-700 transition-colors touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
                            title="Insert Link"
                          >
                            <LinkOutlineIcon className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting('list')}
                            className="p-2 hover:bg-gray-200:bg-gray-600 rounded text-gray-700 transition-colors touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
                            title="Bullet List"
                          >
                            <ListBulletIcon className="w-5 h-5" />
                          </button>
                          <div className="border-l border-gray-300 mx-1 sm:mx-2 h-6"></div>
                          <label
                            htmlFor="replyImageUpload"
                            className="p-2 hover:bg-gray-200:bg-gray-600 rounded text-gray-700 transition-colors cursor-pointer touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
                            title={`Upload Image (Max ${MAX_REPLY_IMAGES} images, 5MB each)`}
                          >
                            <PhotoIcon className="w-5 h-5" />
                            <input
                              id="replyImageUpload"
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleReplyImageUpload}
                              className="hidden"
                            />
                          </label>
                          <div className="flex-1"></div>
                          <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">
                            <span className="hidden sm:inline">Markdown • </span>{replyImages.length}/{MAX_REPLY_IMAGES}
                          </span>
                        </div>

                        <textarea
                          ref={replyEditorRef}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write your reply... "
                          rows={6}
                          maxLength={MAX_REPLY_LENGTH}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-400 resize-none mb-2 font-mono text-sm touch-manipulation"
                        />

                        <div className="flex items-center justify-between text-xs mb-4">
                          <span className="text-gray-500">

                          </span>
                          <span className="text-gray-500">
                            {replyContent.length}/{MAX_REPLY_LENGTH}
                          </span>
                        </div>

                        {/* Reply Images Preview */}
                        {replyImages.length > 0 && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Attached Images ({replyImages.length}/{MAX_REPLY_IMAGES})
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                              {replyImages.map((image, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={image.data}
                                    alt={image.name}
                                    className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveReplyImage(index)}
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

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
                          {showReplyBox && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowReplyBox(false);
                                setReplyContent('');
                                setReplyImages([]);
                                setReplyingTo(null);
                                setReplyToUsername('');
                              }}
                              className="px-5 py-3 sm:py-2.5 text-gray-600 hover:text-gray-800:text-gray-200 font-medium rounded-lg hover:bg-gray-100:bg-gray-700 transition-colors touch-manipulation min-h-[44px] sm:min-h-0 text-sm sm:text-base active:scale-98"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            type="submit"
                            disabled={isSubmitting || !replyContent.trim()}
                            className="px-6 py-3 sm:py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation min-h-[44px] sm:min-h-0 text-sm sm:text-base active:scale-98 shadow-sm"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Posting...
                              </>
                            ) : (
                              'Post Reply'
                            )}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="py-8 text-center">
                        <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-600 mb-4">
                          Please login to join the conversation
                        </p>
                        <button
                          onClick={() => navigate('/login')}
                          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Login to Reply
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Answers List */}
                <div className="space-y-4 sm:space-y-6">
                  {sortedAnswers.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <ChatBubbleLeftRightIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-400" />
                      <p className="text-gray-600 text-base sm:text-lg px-4">
                        No replies yet. Be the first to respond!
                      </p>
                    </div>
                  ) : (
                    sortedAnswers.map((answer) => (
                      <div key={answer.id} className="border-l-2 sm:border-l-4 border-teal-500">
                        <div className="pl-3 sm:pl-4 py-2">
                          {/* Answer Header */}
                          <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                              <Link
                                to={`/users/${answer.author_id}`}
                                className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0 flex-1 sm:flex-none"
                              >
                                <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm sm:text-base overflow-hidden">
                                  {answer.author_profile_photo ? (
                                    <img
                                      src={answer.author_profile_photo}
                                      alt={answer.author_name || 'User'}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextElementSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <span className={answer.author_profile_photo ? 'hidden' : ''}>
                                    {(answer.author_name || 'A')[0].toUpperCase()}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1 sm:gap-2">
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium text-gray-900 text-sm sm:text-base truncate">
                                        {answer.author_name || 'Anonymous'}
                                      </span>
                                      {answer.author_role === 'admin' && (
                                        <CheckBadgeIcon className="w-4 h-4 flex-shrink-0 text-red-500" title="Verified Admin" />
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-xs sm:text-sm text-gray-500">
                                    {formatRelativeDate(answer.created_at)}
                                  </span>
                                </div>
                              </Link>
                            </div>

                            {/* Answer Actions (Edit/Delete for author) */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {user && answer.author_id === user.id && (
                                <>
                                  <button
                                    onClick={() => handleEditAnswer(answer)}
                                    className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center sm:p-1.5 text-gray-500 hover:text-teal-600:text-teal-400 active:bg-gray-100:bg-gray-700 rounded transition-colors touch-manipulation"
                                    title="Edit reply"
                                  >
                                    <PencilIcon className="w-4 h-4 sm:w-4 sm:h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAnswer(answer.id)}
                                    className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center sm:p-1.5 text-gray-500 hover:text-red-600:text-red-400 active:bg-gray-100:bg-gray-700 rounded transition-colors touch-manipulation"
                                    title="Delete reply"
                                  >
                                    <TrashIcon className="w-4 h-4 sm:w-4 sm:h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Answer Content */}
                          {editingAnswerId === answer.id ? (
                            <div className="mb-2 sm:mb-3">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={4}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none mb-2 text-sm sm:text-base"
                              />
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <button
                                  onClick={() => handleSaveEdit(answer.id)}
                                  className="min-h-[44px] px-4 py-2 sm:py-1.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-lg sm:rounded text-sm font-medium transition-colors touch-manipulation"
                                >
                                  Save Changes
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="min-h-[44px] px-4 py-2 sm:py-1.5 text-gray-600 hover:text-gray-800:text-gray-200 active:bg-gray-100:bg-gray-700 rounded-lg sm:rounded text-sm font-medium transition-colors touch-manipulation"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="prose max-w-none mb-2 sm:mb-3">
                                <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                                  {answer.content}
                                </p>
                              </div>

                              {/* Answer Images */}
                              {answer.images && Array.isArray(answer.images) && answer.images.length > 0 && (
                                <div className="mb-2 sm:mb-3">
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                                    {answer.images.map((image, index) => {
                                      const imageUrl = typeof image === 'string' ? image : (image?.data || image?.url);
                                      return imageUrl ? (
                                        <div
                                          key={index}
                                          className="relative group cursor-pointer active:scale-98 transition-transform"
                                          onClick={() => openLightbox(answer.images.map(img =>
                                            typeof img === 'string' ? img : (img?.data || img?.url)
                                          ), index)}
                                        >
                                          <img
                                            src={imageUrl}
                                            alt={`Reply attachment ${index + 1}`}
                                            className="w-full h-24 sm:h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-teal-400:border-teal-500 transition-all"
                                          />
                                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-opacity flex items-center justify-center">
                                            <MagnifyingGlassPlusIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                          </div>
                                        </div>
                                      ) : null;
                                    })}
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {/* Answer Actions Bar */}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
                            {/* Vote Buttons for Answer */}
                            <div className="scale-90 sm:scale-100">
                              <VoteButtons
                                itemId={answer.id}
                                itemType="answer"
                                initialVoteCount={answer.vote_count || 0}
                                initialUpvotes={answer.upvotes || 0}
                                initialUserVote={answer.user_vote || null}
                                onVoteChange={(voteData) => {
                                  setAnswers(prev => prev.map(a =>
                                    a.id === answer.id
                                      ? { ...a, vote_count: voteData.vote_count, upvotes: voteData.upvotes, user_vote: voteData.vote_type }
                                      : a
                                  ));
                                }}
                              />
                            </div>
                            <button
                              onClick={() => handleReplyToAnswer(answer)}
                              className="min-h-[44px] flex items-center gap-1 px-3 sm:px-0 text-teal-600 hover:text-teal-700:text-teal-300 font-medium transition-colors active:scale-95 touch-manipulation"
                            >
                              <ChatBubbleLeftRightIcon className="w-4 h-4" />
                              <span className="text-xs sm:text-sm">Reply</span>
                            </button>
                            {answer.replies && answer.replies.length > 0 && (
                              <button
                                onClick={() => toggleNestedReplies(answer.id)}
                                className="min-h-[44px] flex items-center gap-1 px-3 sm:px-0 text-gray-600 hover:text-gray-800:text-gray-200 transition-colors active:scale-95 touch-manipulation"
                              >
                                {expandedReplies.has(answer.id) ? (
                                  <>
                                    <ChevronUpIcon className="w-4 h-4" />
                                    <span className="text-xs sm:text-sm">Hide {answer.replies.length} {answer.replies.length === 1 ? 'reply' : 'replies'}</span>
                                  </>
                                ) : (
                                  <>
                                    <ChevronDownIcon className="w-4 h-4" />
                                    <span className="text-xs sm:text-sm">View {answer.replies.length} {answer.replies.length === 1 ? 'reply' : 'replies'}</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {/* Nested Replies */}
                          {expandedReplies.has(answer.id) && answer.replies && answer.replies.length > 0 && (
                            <div className="mt-3 sm:mt-4 ml-4 sm:ml-8 space-y-3 sm:space-y-4 border-l-2 border-gray-300 pl-3 sm:pl-4">
                              {answer.replies.map((nestedReply) => (
                                <div key={nestedReply.id} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                  <div className="flex items-start justify-between mb-2 gap-2">
                                    <Link
                                      to={`/users/${nestedReply.author_id}`}
                                      className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0 flex-1"
                                    >
                                      <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm overflow-hidden">
                                        {nestedReply.author_profile_photo ? (
                                          <img
                                            src={nestedReply.author_profile_photo}
                                            alt={nestedReply.author_name || 'User'}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                              e.target.nextElementSibling.style.display = 'flex';
                                            }}
                                          />
                                        ) : null}
                                        <span className={nestedReply.author_profile_photo ? 'hidden' : ''}>
                                          {(nestedReply.author_name || 'A')[0].toUpperCase()}
                                        </span>
                                      </div>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1">
                                          <span className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                                            {nestedReply.author_name || 'Anonymous'}
                                          </span>
                                          {nestedReply.author_role === 'admin' && (
                                            <CheckBadgeIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 text-red-500" title="Verified Admin" />
                                          )}
                                        </div>
                                        <span className="text-xs text-gray-500">
                                          {formatRelativeDate(nestedReply.created_at)}
                                        </span>
                                      </div>
                                    </Link>

                                    {user && nestedReply.author_id === user.id && (
                                      <button
                                        onClick={() => handleDeleteAnswer(nestedReply.id)}
                                        className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center sm:p-1 text-gray-500 hover:text-red-600:text-red-400 active:bg-gray-100:bg-gray-600 rounded transition-colors touch-manipulation flex-shrink-0"
                                        title="Delete reply"
                                      >
                                        <TrashIcon className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>

                                  <p className="text-gray-700 text-xs sm:text-sm whitespace-pre-wrap mb-2 leading-relaxed">
                                    {nestedReply.content}
                                  </p>

                                  {/* Nested Reply Images */}
                                  {nestedReply.images && Array.isArray(nestedReply.images) && nestedReply.images.length > 0 && (
                                    <div className="mt-2">
                                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {nestedReply.images.map((image, index) => {
                                          const imageUrl = typeof image === 'string' ? image : (image?.data || image?.url);
                                          return imageUrl ? (
                                            <div
                                              key={index}
                                              className="relative group cursor-pointer active:scale-98 transition-transform"
                                              onClick={() => openLightbox(nestedReply.images.map(img =>
                                                typeof img === 'string' ? img : (img?.data || img?.url)
                                              ), index)}
                                            >
                                              <img
                                                src={imageUrl}
                                                alt={`Nested reply attachment ${index + 1}`}
                                                className="w-full h-20 sm:h-24 object-cover rounded-lg border border-gray-300 hover:border-teal-400:border-teal-500 transition-all"
                                              />
                                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-opacity flex items-center justify-center">
                                                <MagnifyingGlassPlusIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                              </div>
                                            </div>
                                          ) : null;
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Stacks Below on Mobile */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-8 space-y-4 sm:space-y-6">
                {/* Related Discussions */}
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">
                    Related Discussions
                  </h3>

                  {relatedDiscussions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
                        <ClockIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">
                        No related discussions found.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {relatedDiscussions.map((related) => (
                        <Link
                          key={related.id}
                          to={`/discussions/${related.id}`}
                          className="block p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <h4 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">
                            {related.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
                            <span>{related.answers_count || 0} replies</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Modal - Mobile Optimized */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                Report Thread
              </h3>
              <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm">
                Why are you reporting this thread?
              </p>

              {!selectedReportReason ? (
                <div className="space-y-2 mb-4 sm:mb-6">
                  {['Spam', 'Harassment', 'Inappropriate Content', 'Off-topic', 'Other'].map((reason) => (
                    <button
                      key={reason}
                      onClick={() => handleReportReasonSelect(reason)}
                      className="w-full px-4 py-3 sm:py-2.5 text-left bg-gray-100 hover:bg-gray-200:bg-gray-600 rounded-lg transition-colors touch-manipulation min-h-[44px] sm:min-h-0 text-sm sm:text-base active:scale-98 flex items-center"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please describe the issue:
                  </label>
                  <textarea
                    value={otherReasonText}
                    onChange={(e) => setOtherReasonText(e.target.value)}
                    placeholder="Explain why you're reporting this thread..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm sm:text-base touch-manipulation"
                    rows="4"
                    autoFocus
                  />
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <button
                      onClick={() => handleReport('Other')}
                      disabled={!otherReasonText.trim()}
                      className="flex-1 px-4 py-3 sm:py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors touch-manipulation min-h-[44px] sm:min-h-0 text-sm sm:text-base active:scale-98"
                    >
                      Submit Report
                    </button>
                    <button
                      onClick={() => {
                        setSelectedReportReason(null);
                        setOtherReasonText('');
                      }}
                      className="px-4 py-3 sm:py-2.5 bg-gray-200 hover:bg-gray-300:bg-gray-600 text-gray-800 rounded-lg font-medium transition-colors touch-manipulation min-h-[44px] sm:min-h-0 text-sm sm:text-base active:scale-98"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              {!selectedReportReason && (
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setSelectedReportReason(null);
                    setOtherReasonText('');
                  }}
                  className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300:bg-gray-600 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {/* Image Lightbox Modal */}
        {lightboxOpen && lightboxImages.length > 0 && (
          <div
            className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 touch-manipulation"
            onClick={closeLightbox}
          >
            <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4">
              {/* Top Control Bar */}
              <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex items-center justify-between z-10">
                {/* Image Counter */}
                <div className="bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-gray-800">
                  {currentImageIndex + 1} / {lightboxImages.length}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {/* Download Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadImage();
                    }}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 bg-white rounded-full hover:bg-gray-100:bg-gray-700 active:scale-95 transition-all touch-manipulation"
                    title="Download Image"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
                  </button>

                  {/* Close Button */}
                  <button
                    onClick={closeLightbox}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 bg-white rounded-full hover:bg-gray-100:bg-gray-700 active:scale-95 transition-all touch-manipulation"
                    title="Close (Esc)"
                  >
                    <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
                  </button>
                </div>
              </div>

              {/* Navigation Buttons */}
              {lightboxImages.length > 1 && (
                <>
                  {/* Previous Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      previousImage();
                    }}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 min-h-[56px] min-w-[56px] sm:min-h-0 sm:min-w-0 flex items-center justify-center p-2 sm:p-3 bg-white/90 rounded-full hover:bg-white:bg-gray-800 active:scale-95 transition-all z-10 touch-manipulation shadow-lg"
                    title="Previous (←)"
                  >
                    <ChevronUpIcon className="w-6 h-6 sm:w-7 sm:h-7 text-gray-800 transform -rotate-90" />
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 min-h-[56px] min-w-[56px] sm:min-h-0 sm:min-w-0 flex items-center justify-center p-2 sm:p-3 bg-white/90 rounded-full hover:bg-white:bg-gray-800 active:scale-95 transition-all z-10 touch-manipulation shadow-lg"
                    title="Next (→)"
                  >
                    <ChevronUpIcon className="w-6 h-6 sm:w-7 sm:h-7 text-gray-800 transform rotate-90" />
                  </button>
                </>
              )}

              {/* Main Image */}
              <div
                className="max-w-7xl max-h-full flex items-center justify-center px-12 sm:px-16"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={typeof lightboxImages[currentImageIndex] === 'string'
                    ? lightboxImages[currentImageIndex]
                    : (lightboxImages[currentImageIndex]?.data || lightboxImages[currentImageIndex]?.url)}
                  alt={`Discussion attachment ${currentImageIndex + 1}`}
                  className="max-w-full max-h-[80vh] sm:max-h-[85vh] object-contain rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Image Thumbnails (if multiple images) */}
              {lightboxImages.length > 1 && (
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-2rem)]">
                  <div className="flex gap-1.5 sm:gap-2 bg-white/95 p-2 rounded-lg overflow-x-auto scrollbar-hide">
                    {lightboxImages.map((img, idx) => {
                      const thumbUrl = typeof img === 'string' ? img : (img?.data || img?.url);
                      return (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(idx);
                          }}
                          className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded overflow-hidden border-2 transition-all touch-manipulation active:scale-95 ${idx === currentImageIndex
                            ? 'border-teal-500 ring-2 ring-teal-400'
                            : 'border-transparent hover:border-gray-400'
                            }`}
                        >
                          <img
                            src={thumbUrl}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default DiscussionThreadEnhanced;

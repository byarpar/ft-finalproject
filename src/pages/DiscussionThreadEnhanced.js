import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { discussionsAPI, answersAPI } from '../services/api';
import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  BookmarkIcon,
  ShareIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  TrashIcon,
  PencilIcon,
  FlagIcon,
  BellIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PhotoIcon,
  MicrophoneIcon,
  PaperClipIcon,
  CodeBracketIcon,
  ListBulletIcon,
  LinkIcon as LinkOutlineIcon,
  BoldIcon,
  ItalicIcon,
  ChatBubbleLeftIcon,
  SparklesIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
  BellIcon as BellSolidIcon
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyToUsername, setReplyToUsername] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);

  // Reply sorting
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, most_liked

  // Thread actions state
  const [isFollowing, setIsFollowing] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Edit state
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editContent, setEditContent] = useState('');

  // Rich text editor state
  const [showFormatting, setShowFormatting] = useState(false);

  // Nested replies
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [nestedReplies, setNestedReplies] = useState({});

  // Fetch discussion details
  const fetchDiscussion = useCallback(async () => {
    try {
      setLoading(true);
      const response = await discussionsAPI.getDiscussionById(id);

      // Handle different response formats
      const discussionData = response.discussion || response.data?.discussion || response;

      setDiscussion(discussionData);
      setIsFollowing(discussionData.is_following || false);
      setError(null);
    } catch (err) {
      console.error('Error fetching discussion:', err);
      setError('Failed to load discussion. Please try again.');
      toast.error('Failed to load discussion');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch answers/replies
  const fetchAnswers = useCallback(async () => {
    try {
      const response = await answersAPI.getAnswersForDiscussion(id);
      const answersData = response.data?.answers || response.answers || [];

      // Organize nested replies
      const organized = organizeNestedReplies(answersData);
      setAnswers(organized.topLevel);
      setNestedReplies(organized.nested);
    } catch (err) {
      console.error('Error fetching answers:', err);
    }
  }, [id]);

  // Fetch related discussions
  const fetchRelatedDiscussions = useCallback(async () => {
    try {
      if (!discussion) return;

      const response = await discussionsAPI.getDiscussions({
        category: discussion.category?.id || discussion.category,
        limit: 5,
        exclude: id
      });

      setRelatedDiscussions(response.discussions || []);
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
  }, [fetchRelatedDiscussions]);

  // Organize nested replies
  const organizeNestedReplies = (answersArray) => {
    const topLevel = [];
    const nested = {};

    answersArray.forEach(answer => {
      if (answer.parent_answer_id) {
        if (!nested[answer.parent_answer_id]) {
          nested[answer.parent_answer_id] = [];
        }
        nested[answer.parent_answer_id].push(answer);
      } else {
        topLevel.push(answer);
      }
    });

    return { topLevel, nested };
  };

  // Sort replies
  const sortReplies = (replies) => {
    const sorted = [...replies];

    switch (sortBy) {
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'most_liked':
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

  // Handle like discussion
  const handleLikeDiscussion = async () => {
    if (!user) {
      toast.error('Please login to like discussions');
      navigate('/login');
      return;
    }

    try {
      if (discussion.is_liked) {
        await discussionsAPI.unlikeDiscussion(id);
      } else {
        await discussionsAPI.likeDiscussion(id);
      }
      setDiscussion(prev => ({
        ...prev,
        is_liked: !prev.is_liked,
        likes_count: prev.is_liked ? prev.likes_count - 1 : prev.likes_count + 1
      }));
    } catch (err) {
      console.error('Error liking discussion:', err);
      toast.error('Failed to like discussion');
    }
  };

  // Handle follow thread
  const handleFollowThread = async () => {
    if (!user) {
      toast.error('Please login to follow threads');
      navigate('/login');
      return;
    }

    try {
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? 'Thread unfollowed' : 'You\'ll receive notifications for new replies!');
      // TODO: Implement API call when backend is ready
      // await discussionsAPI.followThread(id);
    } catch (err) {
      console.error('Error following thread:', err);
      setIsFollowing(!isFollowing);
      toast.error('Failed to follow thread');
    }
  };

  // Handle share
  const handleShare = (platform) => {
    const url = window.location.href;
    const title = discussion.title;

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
        setShowShareMenu(false);
        return;
      default:
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShowShareMenu(false);
    }
  };

  // Handle report
  const handleReport = async (reason) => {
    if (!user) {
      toast.error('Please login to report content');
      navigate('/login');
      return;
    }

    try {
      await discussionsAPI.reportDiscussion(id, { reason });
      toast.success('Report submitted. Our team will review it shortly.');
      setShowReportModal(false);
    } catch (err) {
      console.error('Error reporting discussion:', err);
      toast.error('Failed to submit report');
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

    if (!replyContent.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      setIsSubmitting(true);

      const replyData = {
        discussion_id: id,
        content: replyContent.trim(),
        parent_answer_id: replyingTo
      };

      await answersAPI.createAnswer(replyData);

      toast.success('Reply posted successfully!');
      setReplyContent('');
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

  // Handle quote
  const handleQuote = (content, username) => {
    const quotedText = `> ${content.split('\n').join('\n> ')}\n\n@${username} `;
    setReplyContent(quotedText);
    setShowReplyBox(true);

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

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'grammar': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
      'pronunciation': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
      'vocabulary': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
      'culture': 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
      'general': 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
    };
    const categoryKey = typeof category === 'object' ? category.id : category;
    return colors[categoryKey] || colors.general;
  };

  // Get user role badge
  const getUserRoleBadge = (role) => {
    const badges = {
      'admin': { label: 'Admin', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
      'linguist': { label: 'Linguist', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
      'moderator': { label: 'Moderator', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    };
    return badges[role] || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading discussion...</p>
        </div>
      </div>
    );
  }

  if (error || !discussion) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ChatBubbleLeftIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-red-600 dark:text-red-400 mb-4 text-lg">{error || 'Discussion not found'}</p>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              to="/discussions"
              className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium"
            >
              Discussions
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-gray-400">
              {typeof discussion.category === 'object' ? discussion.category.name : discussion.category || 'General'}
            </span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 dark:text-white font-medium truncate max-w-md">
              {discussion.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Original Post */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
              {/* Thread Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                {/* Category Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                      discussion.category
                    )}`}
                  >
                    {typeof discussion.category === 'object'
                      ? discussion.category.name
                      : discussion.category || 'General'}
                  </span>

                  {/* Thread Actions (Top Right) */}
                  <div className="flex items-center gap-2">
                    {/* Follow Button */}
                    <button
                      onClick={handleFollowThread}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isFollowing
                          ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                        }`}
                      title={isFollowing ? 'Following thread' : 'Follow thread for notifications'}
                    >
                      {isFollowing ? (
                        <BellSolidIcon className="w-4 h-4" />
                      ) : (
                        <BellIcon className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">
                        {isFollowing ? 'Following' : 'Follow'}
                      </span>
                    </button>

                    {/* Report Button */}
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                      title="Report thread"
                    >
                      <FlagIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                  {discussion.title}
                </h1>

                {/* Tags */}
                {discussion.tags && discussion.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {discussion.tags.map((tag, index) => (
                      <Link
                        key={index}
                        to={`/discussions?tag=${tag}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-full text-sm hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                      >
                        <TagIcon className="w-3 h-3" />
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Author and Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/users/${discussion.author_id}`}
                      className="flex items-center gap-2 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                        {(discussion.author_name || 'A')[0].toUpperCase()}
                      </div>
                      <span className="font-medium">{discussion.author_name || 'Anonymous'}</span>
                    </Link>
                    {getUserRoleBadge(discussion.author_role) && (
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getUserRoleBadge(discussion.author_role).color}`}>
                        {getUserRoleBadge(discussion.author_role).label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>Posted {formatDate(discussion.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <EyeIcon className="w-4 h-4" />
                    <span>{discussion.views_count || 0} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    <span>{discussion.answers_count || 0} replies</span>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-base leading-relaxed">
                    {discussion.content}
                  </p>
                </div>

                {/* TODO: Support for embedded media */}
                {discussion.images && discussion.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {discussion.images.map((image, idx) => (
                      <img
                        key={idx}
                        src={image}
                        alt={`Attachment ${idx + 1}`}
                        className="rounded-lg w-full h-auto"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Like Button */}
                  <button
                    onClick={handleLikeDiscussion}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${discussion.is_liked
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 border border-gray-200 dark:border-gray-600'
                      }`}
                  >
                    {discussion.is_liked ? (
                      <HeartSolidIcon className="w-5 h-5" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )}
                    <span>{discussion.likes_count || 0}</span>
                  </button>

                  {/* Save/Bookmark Button */}
                  <button
                    onClick={handleSaveDiscussion}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${discussion.is_saved
                        ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600 dark:hover:text-teal-400 border border-gray-200 dark:border-gray-600'
                      }`}
                  >
                    {discussion.is_saved ? (
                      <BookmarkSolidIcon className="w-5 h-5" />
                    ) : (
                      <BookmarkIcon className="w-5 h-5" />
                    )}
                    <span>{discussion.is_saved ? 'Saved' : 'Save'}</span>
                  </button>

                  {/* Share Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg font-medium transition-colors"
                    >
                      <ShareIcon className="w-5 h-5" />
                      <span>Share</span>
                    </button>

                    {/* Share Menu */}
                    {showShareMenu && (
                      <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10">
                        <button
                          onClick={() => handleShare('twitter')}
                          className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Share on Twitter
                        </button>
                        <button
                          onClick={() => handleShare('facebook')}
                          className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Share on Facebook
                        </button>
                        <button
                          onClick={() => handleShare('linkedin')}
                          className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Share on LinkedIn
                        </button>
                        <button
                          onClick={() => handleShare('copy')}
                          className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-t border-gray-200 dark:border-gray-700"
                        >
                          Copy Link
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Reply Button */}
                  <button
                    onClick={() => setShowReplyBox(!showReplyBox)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors ml-auto"
                  >
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Replies Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              {/* Replies Header with Sort */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Replies ({answers.length})
                </h2>

                {/* Sort Dropdown */}
                {answers.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="most_liked">Most Liked</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Reply Form */}
              {(showReplyBox || user) && (
                <div ref={replyEditorRef} className="mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-teal-200 dark:border-teal-700">
                  {user ? (
                    <form onSubmit={handleSubmitReply}>
                      {replyingTo && (
                        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
                          <span className="text-sm text-blue-700 dark:text-blue-300">
                            Replying to <strong>{replyToUsername}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyToUsername('');
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {/* Rich Text Toolbar */}
                      <div className="flex flex-wrap items-center gap-2 mb-3 pb-3 border-b border-gray-300 dark:border-gray-600">
                        <button
                          type="button"
                          onClick={() => insertFormatting('bold')}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          title="Bold (Ctrl+B)"
                        >
                          <span className="font-bold text-gray-700 dark:text-gray-300">B</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting('italic')}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          title="Italic (Ctrl+I)"
                        >
                          <span className="italic text-gray-700 dark:text-gray-300">I</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting('code')}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          title="Code"
                        >
                          <CodeBracketIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting('link')}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          title="Insert Link"
                        >
                          <LinkOutlineIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting('list')}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          title="Bullet List"
                        >
                          <ListBulletIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                        <button
                          type="button"
                          onClick={() => insertFormatting('lisu')}
                          className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded text-sm font-medium hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors"
                          title="Lisu Script Input"
                        >
                          Lisu 【ꓡꓲꓢꓴ】
                        </button>
                        <button
                          type="button"
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors opacity-50 cursor-not-allowed"
                          title="Image Upload (Coming Soon)"
                          disabled
                        >
                          <PhotoIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                        <button
                          type="button"
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors opacity-50 cursor-not-allowed"
                          title="Audio Upload (Coming Soon)"
                          disabled
                        >
                          <MicrophoneIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                      </div>

                      <textarea
                        ref={replyEditorRef}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply... Use the toolbar above for formatting."
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-800 dark:text-white placeholder-gray-400 resize-none mb-3"
                      />

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Tip: Use **bold**, *italic*, `code`, or [links](url)
                        </p>
                        <div className="flex items-center gap-3">
                          {showReplyBox && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowReplyBox(false);
                                setReplyContent('');
                                setReplyingTo(null);
                                setReplyToUsername('');
                              }}
                              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            type="submit"
                            disabled={isSubmitting || !replyContent.trim()}
                            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? 'Posting...' : 'Post Reply'}
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Please login to join the conversation
                      </p>
                      <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Login to Reply
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Answers List */}
              <div className="space-y-6">
                {sortedAnswers.length === 0 ? (
                  <div className="text-center py-12">
                    <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      No replies yet. Be the first to respond!
                    </p>
                  </div>
                ) : (
                  sortedAnswers.map((answer) => (
                    <div key={answer.id} className="border-l-4 border-teal-500 dark:border-teal-600">
                      <div className="pl-4 py-2">
                        {/* Answer Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Link
                              to={`/users/${answer.author_id}`}
                              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                                {(answer.author_name || 'A')[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {answer.author_name || 'Anonymous'}
                                  </span>
                                  {getUserRoleBadge(answer.author_role) && (
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getUserRoleBadge(answer.author_role).color}`}>
                                      {getUserRoleBadge(answer.author_role).label}
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatDate(answer.created_at)}
                                </span>
                              </div>
                            </Link>
                          </div>

                          {/* Answer Actions (Edit/Delete for author) */}
                          {user && answer.author_id === user.id && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditAnswer(answer)}
                                className="p-1.5 text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 transition-colors"
                                title="Edit reply"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAnswer(answer.id)}
                                className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                title="Delete reply"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Answer Content */}
                        {editingAnswerId === answer.id ? (
                          <div className="mb-3">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              rows={4}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none mb-2"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSaveEdit(answer.id)}
                                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-sm font-medium transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-4 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="prose dark:prose-invert max-w-none mb-3">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {answer.content}
                            </p>
                          </div>
                        )}

                        {/* Answer Actions Bar */}
                        <div className="flex items-center gap-4 text-sm">
                          <button
                            onClick={() => handleReplyToAnswer(answer)}
                            className="flex items-center gap-1 text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium transition-colors"
                          >
                            <ChatBubbleLeftRightIcon className="w-4 h-4" />
                            Reply
                          </button>
                          <button
                            onClick={() => handleQuote(answer.content, answer.author_name)}
                            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                          >
                            Quote
                          </button>
                          {nestedReplies[answer.id] && nestedReplies[answer.id].length > 0 && (
                            <button
                              onClick={() => toggleNestedReplies(answer.id)}
                              className="flex items-center gap-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            >
                              {expandedReplies.has(answer.id) ? (
                                <>
                                  <ChevronUpIcon className="w-4 h-4" />
                                  Hide {nestedReplies[answer.id].length} {nestedReplies[answer.id].length === 1 ? 'reply' : 'replies'}
                                </>
                              ) : (
                                <>
                                  <ChevronDownIcon className="w-4 h-4" />
                                  View {nestedReplies[answer.id].length} {nestedReplies[answer.id].length === 1 ? 'reply' : 'replies'}
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Nested Replies */}
                        {expandedReplies.has(answer.id) && nestedReplies[answer.id] && (
                          <div className="mt-4 ml-8 space-y-4 border-l-2 border-gray-300 dark:border-gray-600 pl-4">
                            {nestedReplies[answer.id].map((nestedReply) => (
                              <div key={nestedReply.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <Link
                                    to={`/users/${nestedReply.author_id}`}
                                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                                      {(nestedReply.author_name || 'A')[0].toUpperCase()}
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                                        {nestedReply.author_name || 'Anonymous'}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                        {formatDate(nestedReply.created_at)}
                                      </span>
                                    </div>
                                  </Link>

                                  {user && nestedReply.author_id === user.id && (
                                    <button
                                      onClick={() => handleDeleteAnswer(nestedReply.id)}
                                      className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                      title="Delete reply"
                                    >
                                      <TrashIcon className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>

                                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                                  {nestedReply.content}
                                </p>
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

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Related Discussions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <SparklesIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Related Discussions
                  </h3>
                </div>

                {relatedDiscussions.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No related discussions found.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {relatedDiscussions.map((related) => (
                      <Link
                        key={related.id}
                        to={`/discussions/${related.id}`}
                        className="block p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors group"
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 mb-2 line-clamp-2">
                          {related.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <ChatBubbleLeftRightIcon className="w-3 h-3" />
                            {related.answers_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <EyeIcon className="w-3 h-3" />
                            {related.views_count || 0}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg shadow-sm p-6 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <FireIcon className="w-5 h-5" />
                  <h3 className="font-bold">Thread Stats</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-teal-100">Total Replies</span>
                    <span className="font-bold text-lg">{discussion.answers_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-teal-100">Views</span>
                    <span className="font-bold text-lg">{discussion.views_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-teal-100">Likes</span>
                    <span className="font-bold text-lg">{discussion.likes_count || 0}</span>
                  </div>
                </div>
              </div>

              {/* Discussion Guidelines */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 text-sm">
                  💡 Discussion Guidelines
                </h4>
                <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-400">
                  <li>• Be respectful and constructive</li>
                  <li>• Stay on topic</li>
                  <li>• Provide sources when possible</li>
                  <li>• Use Lisu script when relevant</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Report Thread
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Why are you reporting this thread?
            </p>
            <div className="space-y-2 mb-6">
              {['Spam', 'Harassment', 'Inappropriate Content', 'Off-topic', 'Other'].map((reason) => (
                <button
                  key={reason}
                  onClick={() => handleReport(reason)}
                  className="w-full px-4 py-2 text-left bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {reason}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowReportModal(false)}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionThreadEnhanced;

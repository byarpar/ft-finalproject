import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDiscussionThread } from '../hooks/useDiscussionThread';
import HeroNavbar from '../components/Layout/HeroNavbar';
import PageLayout from '../components/Layout/PageLayout';
import SkeletonLoader from '../components/UI/SkeletonLoader';
import DiscussionActions from '../components/Discussion/DiscussionActions';
import VoteButtons from '../components/Discussion/VoteButtons';
import ReplyForm from '../components/Discussion/ReplyForm';
import ReplyItem from '../components/Discussion/ReplyItem';
import ImageLightbox from '../components/Discussion/ImageLightbox';
import {
  ChatBubbleLeftRightIcon, BookmarkIcon, ClockIcon, PencilIcon, TrashIcon,
  FlagIcon, PhotoIcon, XMarkIcon, MagnifyingGlassPlusIcon, EyeIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { formatRelativeDate } from '../utils/dateUtils';
import { markdownToHtml } from '../utils/markdownUtils';

const MIN_TITLE_LENGTH = 10;
const MIN_CONTENT_LENGTH = 20;
const MIN_REPLY_LENGTH = 10;
const MAX_REPLY_LENGTH = 5000;
const MAX_REPLY_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const DiscussionThread = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    discussion, answers, relatedDiscussions, loading, error,
    setDiscussion, setAnswers, submitReply, updateAnswer, deleteAnswer,
    updateDiscussion, deleteDiscussion, toggleSave, reportThread,
    toggleDiscussionStatus
  } = useDiscussionThread(id, user);

  // UI State
  const [replyContent, setReplyContent] = useState('');
  const [replyImages, setReplyImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyToUsername, setReplyToUsername] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editingDiscussion, setEditingDiscussion] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedImages, setEditedImages] = useState([]);
  const [isUpdatingDiscussion, setIsUpdatingDiscussion] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState(null);
  const [otherReasonText, setOtherReasonText] = useState('');

  // Sort answers
  const sortedAnswers = useMemo(() => {
    const sorted = [...answers];
    if (sortBy === 'newest') sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else if (sortBy === 'oldest') sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    else if (sortBy === 'most_voted') sorted.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
    return sorted;
  }, [answers, sortBy]);

  // Handlers
  const handleSubmitReply = async (e) => {
    e.preventDefault();

    const trimmedContent = replyContent.trim();

    // Validation
    if (!trimmedContent) {
      toast.error('Reply content cannot be empty');
      return;
    }

    if (trimmedContent.length < MIN_REPLY_LENGTH) {
      toast.error(`Reply must be at least ${MIN_REPLY_LENGTH} characters long`);
      return;
    }

    setIsSubmitting(true);
    const success = await submitReply(trimmedContent, replyImages, replyingTo);
    if (success) {
      setReplyContent('');
      setReplyImages([]);
      setReplyingTo(null);
      setReplyToUsername('');
      setShowReplyBox(false);
    }
    setIsSubmitting(false);
  };

  const handleEditAnswer = (answer) => {
    setEditingAnswerId(answer.id);
    setEditContent(answer.content);
  };

  const handleSaveEdit = async (answerId) => {
    const trimmedContent = editContent.trim();

    if (!trimmedContent) {
      toast.error('Reply content cannot be empty');
      return;
    }

    if (trimmedContent.length < MIN_REPLY_LENGTH) {
      toast.error(`Reply must be at least ${MIN_REPLY_LENGTH} characters long`);
      return;
    }

    const success = await updateAnswer(answerId, trimmedContent);
    if (success) {
      setEditingAnswerId(null);
      setEditContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingAnswerId(null);
    setEditContent('');
  };

  const handleDeleteAnswer = async (answerId) => {
    await deleteAnswer(answerId);
  };

  const handleReplyToAnswer = (answer) => {
    setReplyingTo(answer.id);
    setReplyToUsername(answer.author_name);
    setShowReplyBox(true);
    setTimeout(() => document.querySelector('textarea')?.focus(), 100);
  };

  const handleEditDiscussion = () => {
    setEditingDiscussion(true);
    setEditedTitle(discussion.title);
    setEditedContent(discussion.content);
    setEditedImages(discussion.images || []);
  };

  const handleSaveDiscussionEdit = async () => {
    const trimmedTitle = editedTitle.trim();
    const trimmedContent = editedContent.trim();

    if (!trimmedTitle) {
      toast.error('Title is required');
      return;
    }

    if (trimmedTitle.length < MIN_TITLE_LENGTH) {
      toast.error(`Title must be at least ${MIN_TITLE_LENGTH} characters long`);
      return;
    }

    if (!trimmedContent) {
      toast.error('Content is required');
      return;
    }

    if (trimmedContent.length < MIN_CONTENT_LENGTH) {
      toast.error(`Content must be at least ${MIN_CONTENT_LENGTH} characters long`);
      return;
    }

    setIsUpdatingDiscussion(true);
    const success = await updateDiscussion({
      title: trimmedTitle,
      content: trimmedContent,
      images: editedImages
    });
    if (success) {
      setEditingDiscussion(false);
    }
    setIsUpdatingDiscussion(false);
  };

  const handleCancelDiscussionEdit = () => {
    setEditingDiscussion(false);
    setEditedTitle('');
    setEditedContent('');
    setEditedImages([]);
  };

  const handleDeleteDiscussion = async () => {
    const success = await deleteDiscussion();
    if (success) navigate('/discussions');
  };

  const handleDiscussionImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name} is too large. Max 5MB`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedImages(prev => [...prev, { data: reader.result, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleReport = async (reason) => {
    const description = reason === 'Other' ? otherReasonText : '';
    const success = await reportThread(reason, description);
    if (success) {
      setShowReportModal(false);
      setSelectedReportReason(null);
      setOtherReasonText('');
    }
  };

  const openLightbox = (images, index) => {
    setLightboxImages(images);
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const getCategoryColor = (category) => {
    const name = typeof category === 'object' ? category.name : category;
    const colors = {
      'General': 'bg-blue-50 text-blue-700 border-blue-200',
      'Language Learning': 'bg-purple-50 text-purple-700 border-purple-200',
      'Grammar': 'bg-green-50 text-green-700 border-green-200',
      'Vocabulary': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Culture & Traditions': 'bg-red-50 text-red-700 border-red-200',
      'Pronunciation': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Translation': 'bg-pink-50 text-pink-700 border-pink-200',
      'Etymology': 'bg-orange-50 text-orange-700 border-orange-200'
    };
    return colors[name] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (loading) return <SkeletonLoader type="discussionThread" />;
  if (error || !discussion) return (
    <PageLayout title="Discussion Not Found">
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Discussion Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'This discussion may have been deleted'}</p>
          <Link to="/discussions" className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg">
            Back to Discussions
          </Link>
        </div>
      </div>
    </PageLayout>
  );

  return (
    <PageLayout
      title={`${discussion.title} - Lisu Dictionary`}
      description={discussion.content?.substring(0, 155)}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Hero Navigation Bar with Gradient Background */}
        <section className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800">
          <HeroNavbar />

          {/* Breadcrumb */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm overflow-x-auto">
              <Link to="/discussions" className="text-white hover:text-teal-100 font-medium whitespace-nowrap transition-colors">
                Discussions
              </Link>
              <span className="text-teal-300">/</span>
              <span className="text-teal-100 truncate">
                {typeof discussion.category === 'object' ? discussion.category.name : discussion.category || 'General'}
              </span>
            </nav>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Discussion Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(discussion.category)}`}>
                      {typeof discussion.category === 'object' ? discussion.category.name : discussion.category || 'General'}
                    </span>

                    <div className="flex items-center gap-2">
                      {user && user.id === discussion.author_id && !editingDiscussion && (
                        <>
                          <button onClick={handleEditDiscussion} className="p-1.5 text-gray-500 hover:text-teal-600 transition-colors" title="Edit">
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button onClick={handleDeleteDiscussion} className="p-1.5 text-gray-500 hover:text-red-600 transition-colors" title="Delete">
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      {(!user || user.id !== discussion.author_id) && (
                        <button onClick={() => setShowReportModal(true)} className="p-1.5 text-gray-500 hover:text-red-600 transition-colors" title="Report">
                          <FlagIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {editingDiscussion ? (
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="w-full px-4 py-3 text-2xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 mb-4"
                    />
                  ) : (
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{discussion.title}</h1>
                  )}

                  {!editingDiscussion && user?.role === 'admin' && (
                    <DiscussionActions
                      discussion={discussion}
                      isAdmin={true}
                      onToggleSolved={() => toggleDiscussionStatus('solved')}
                      onTogglePinned={() => toggleDiscussionStatus('pinned')}
                      onToggleLocked={() => toggleDiscussionStatus('locked')}
                    />
                  )}

                  {discussion.tags?.length > 0 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto">
                      {discussion.tags.map((tag, idx) => (
                        <Link key={idx} to={`/discussions?tag=${tag}`} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium hover:bg-teal-100 border border-teal-200 whitespace-nowrap">
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Link to={`/users/${discussion.author_id}`} className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center overflow-hidden">
                        {discussion.user_data?.display_picture ? (
                          <img src={discussion.user_data.display_picture} alt={discussion.user_data?.username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-white">{(discussion.user_data?.username || 'A')[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-gray-900">{discussion.user_data?.username || 'Anonymous'}</span>
                          {discussion.user_data?.role === 'admin' && (
                            <CheckBadgeIcon className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <ClockIcon className="w-3.5 h-3.5" />
                          <span>{formatRelativeDate(discussion.created_at)}</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {editingDiscussion ? (
                    <div className="space-y-4">
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        rows={8}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 resize-none"
                      />
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
                        <PhotoIcon className="w-5 h-5" />
                        <span>Upload Images</span>
                        <input type="file" accept="image/*" multiple onChange={handleDiscussionImageUpload} className="hidden" />
                      </label>
                      {editedImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                          {editedImages.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <img src={typeof img === 'string' ? img : img.data} alt="" className="w-full h-32 object-cover rounded-lg" />
                              <button onClick={() => setEditedImages(prev => prev.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100">
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-3">
                        <button onClick={handleSaveDiscussionEdit} disabled={isUpdatingDiscussion} className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium disabled:opacity-50">
                          {isUpdatingDiscussion ? 'Updating...' : 'Save Changes'}
                        </button>
                        <button onClick={handleCancelDiscussionEdit} disabled={isUpdatingDiscussion} className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="prose prose-sm sm:prose max-w-none text-gray-700 text-base leading-relaxed break-words"
                        style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                        dangerouslySetInnerHTML={{ __html: markdownToHtml(discussion.content) }}
                      />
                      {discussion.images?.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                          {discussion.images.map((img, idx) => {
                            const url = typeof img === 'string' ? img : img?.data;
                            return (
                              <div key={idx} className="relative group cursor-pointer rounded-lg overflow-hidden" onClick={() => openLightbox(discussion.images, idx)}>
                                <img src={url} alt={`Attachment ${idx + 1}`} className="w-full h-48 object-cover group-hover:scale-110 transition-transform" />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all">
                                  <MagnifyingGlassPlusIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <VoteButtons
                        itemId={discussion.id}
                        itemType="discussion"
                        initialVoteCount={discussion.vote_count || 0}
                        initialUpvotes={discussion.upvotes || 0}
                        initialUserVote={discussion.user_vote || null}
                        onVoteChange={(voteData) => setDiscussion(prev => ({ ...prev, ...voteData }))}
                      />
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <EyeIcon className="w-4 h-4" />
                        <span>{discussion.views_count || 0}</span>
                      </div>
                    </div>
                    <button onClick={toggleSave} className={`p-2 rounded-lg transition-colors ${discussion.is_saved ? 'text-teal-600 hover:bg-teal-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                      {discussion.is_saved ? <BookmarkSolidIcon className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Replies Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {user && (
                  <div className="p-6 border-b border-gray-200">
                    <ReplyForm
                      user={user}
                      replyContent={replyContent}
                      setReplyContent={setReplyContent}
                      replyImages={replyImages}
                      setReplyImages={setReplyImages}
                      replyingTo={replyingTo}
                      replyToUsername={replyToUsername}
                      setReplyingTo={setReplyingTo}
                      setReplyToUsername={setReplyToUsername}
                      showReplyBox={showReplyBox}
                      setShowReplyBox={setShowReplyBox}
                      isSubmitting={isSubmitting}
                      onSubmit={handleSubmitReply}
                      MIN_REPLY_LENGTH={MIN_REPLY_LENGTH}
                      MAX_REPLY_LENGTH={MAX_REPLY_LENGTH}
                      MAX_REPLY_IMAGES={MAX_REPLY_IMAGES}
                      MAX_IMAGE_SIZE={MAX_IMAGE_SIZE}
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {answers.length === 0 ? 'Replies' : `${answers.length} ${answers.length === 1 ? 'Reply' : 'Replies'}`}
                    </h2>
                    {answers.length > 1 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 hidden sm:inline">Sort by:</span>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500">
                          <option value="newest">Newest</option>
                          <option value="oldest">Oldest</option>
                          <option value="most_voted">Most Voted</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {sortedAnswers.length === 0 ? (
                      <div className="text-center py-12">
                        <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600">No replies yet. Be the first to respond!</p>
                      </div>
                    ) : (
                      sortedAnswers.map(answer => (
                        <ReplyItem
                          key={answer.id}
                          answer={answer}
                          user={user}
                          editingAnswerId={editingAnswerId}
                          editContent={editContent}
                          setEditContent={setEditContent}
                          onEdit={handleEditAnswer}
                          onSaveEdit={handleSaveEdit}
                          onCancelEdit={handleCancelEdit}
                          onDelete={handleDeleteAnswer}
                          onReplyTo={handleReplyToAnswer}
                          onVoteChange={(answerId, voteData) => {
                            setAnswers(prev => prev.map(a => a.id === answerId ? { ...a, ...voteData } : a));
                          }}
                          expandedReplies={expandedReplies}
                          onToggleReplies={(id) => {
                            const newSet = new Set(expandedReplies);
                            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
                            setExpandedReplies(newSet);
                          }}
                          openLightbox={openLightbox}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-8">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Related Discussions</h3>
                  {relatedDiscussions.length === 0 ? (
                    <p className="text-sm text-gray-600 text-center py-8">No related discussions found.</p>
                  ) : (
                    <div className="space-y-3">
                      {relatedDiscussions.map(related => (
                        <Link key={related.id} to={`/discussions/${related.id}`} className="block p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-teal-500 transition-colors">
                          <h4 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">{related.title}</h4>
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

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Report Thread</h3>
              <p className="text-gray-600 mb-4 text-sm">Why are you reporting this thread?</p>
              {!selectedReportReason ? (
                <div className="space-y-2 mb-6">
                  {['Spam', 'Harassment', 'Inappropriate Content', 'Off-topic', 'Other'].map(reason => (
                    <button key={reason} onClick={() => reason === 'Other' ? setSelectedReportReason(reason) : handleReport(reason)} className="w-full px-4 py-2.5 text-left bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                      {reason}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mb-6">
                  <textarea
                    value={otherReasonText}
                    onChange={(e) => setOtherReasonText(e.target.value)}
                    placeholder="Explain why you're reporting..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg resize-none mb-4"
                    rows="4"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleReport('Other')} disabled={!otherReasonText.trim()} className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white rounded-lg font-medium">
                      Submit
                    </button>
                    <button onClick={() => { setSelectedReportReason(null); setOtherReasonText(''); }} className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium">
                      Back
                    </button>
                  </div>
                </div>
              )}
              {!selectedReportReason && (
                <button onClick={() => setShowReportModal(false)} className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium">
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {/* Image Lightbox */}
        <ImageLightbox
          isOpen={lightboxOpen}
          images={lightboxImages}
          currentIndex={currentImageIndex}
          onClose={() => setLightboxOpen(false)}
          onNext={() => setCurrentImageIndex((currentImageIndex + 1) % lightboxImages.length)}
          onPrevious={() => setCurrentImageIndex((currentImageIndex - 1 + lightboxImages.length) % lightboxImages.length)}
          onIndexChange={setCurrentImageIndex}
        />
      </div>
    </PageLayout>
  );
};

export default DiscussionThread;

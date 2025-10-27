import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhotoIcon, ListBulletIcon, LinkIcon, XMarkIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ReplyForm = ({
  user,
  replyContent,
  setReplyContent,
  replyImages,
  setReplyImages,
  replyingTo,
  replyToUsername,
  setReplyingTo,
  setReplyToUsername,
  showReplyBox,
  setShowReplyBox,
  isSubmitting,
  onSubmit,
  MIN_REPLY_LENGTH = 10,
  MAX_REPLY_LENGTH = 5000,
  MAX_REPLY_IMAGES = 5,
  MAX_IMAGE_SIZE = 5 * 1024 * 1024
}) => {
  const navigate = useNavigate();
  const replyEditorRef = useRef(null);

  const insertFormatting = (type) => {
    const textarea = replyEditorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = replyContent.substring(start, end);
    let newText = replyContent;

    switch (type) {
      case 'bold':
        newText = replyContent.substring(0, start) + `**${selectedText || 'bold text'}**` + replyContent.substring(end);
        break;
      case 'italic':
        newText = replyContent.substring(0, start) + `*${selectedText || 'italic text'}*` + replyContent.substring(end);
        break;
      case 'link':
        newText = replyContent.substring(0, start) + `[${selectedText || 'link text'}](url)` + replyContent.substring(end);
        break;
      case 'list':
        newText = replyContent.substring(0, start) + `\n- ${selectedText || 'list item'}` + replyContent.substring(end);
        break;
      default:
        break;
    }

    setReplyContent(newText);
    setTimeout(() => textarea.focus(), 0);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = MAX_REPLY_IMAGES - replyImages.length;

    if (files.length > remainingSlots) {
      toast.error(`You can only upload ${remainingSlots} more image(s)`);
      return;
    }

    files.forEach(file => {
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setReplyImages(prev => [...prev, { data: reader.result, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setReplyImages(prev => prev.filter((_, i) => i !== index));
  };

  if (!user) {
    return (
      <div className="py-8 text-center">
        <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-600 mb-4">Please login to join the conversation</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
        >
          Login to Reply
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      {replyingTo && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between border border-blue-200">
          <span className="text-sm text-blue-700">
            Replying to <strong>{replyToUsername}</strong>
          </span>
          <button
            type="button"
            onClick={() => { setReplyingTo(null); setReplyToUsername(''); }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <XMarkIcon className="w-4 h-4" />
            Cancel
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 p-1.5 sm:p-2 bg-gray-50 rounded-lg border border-gray-200 overflow-x-auto scrollbar-hide">
        {['bold', 'italic', 'link', 'list'].map(type => (
          <button
            key={type}
            type="button"
            onClick={() => insertFormatting(type)}
            className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
            title={type.charAt(0).toUpperCase() + type.slice(1)}
          >
            {type === 'bold' && <span className="font-bold text-sm sm:text-base">B</span>}
            {type === 'italic' && <span className="italic text-sm sm:text-base">I</span>}
            {type === 'link' && <LinkIcon className="w-5 h-5" />}
            {type === 'list' && <ListBulletIcon className="w-5 h-5" />}
          </button>
        ))}
        <div className="border-l border-gray-300 mx-1 sm:mx-2 h-6"></div>
        <label className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center">
          <PhotoIcon className="w-5 h-5" />
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
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
        placeholder={`Write your reply (minimum ${MIN_REPLY_LENGTH} characters)...`}
        rows={6}
        maxLength={MAX_REPLY_LENGTH}
        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-400 resize-none mb-2 font-mono text-sm"
      />

      <div className="flex items-center justify-between text-xs mb-4">
        <span className={`${replyContent.trim().length < MIN_REPLY_LENGTH ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
          {replyContent.trim().length < MIN_REPLY_LENGTH && (
            <span>Minimum {MIN_REPLY_LENGTH} characters • </span>
          )}
        </span>
        <span className={`${replyContent.length > MAX_REPLY_LENGTH * 0.9 ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
          {replyContent.length}/{MAX_REPLY_LENGTH}
        </span>
      </div>

      {replyImages.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Attached Images ({replyImages.length}/{MAX_REPLY_IMAGES})
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {replyImages.map((image, index) => (
              <div key={index} className="relative group">
                <img src={image.data} alt={image.name} className="w-full h-24 object-cover rounded-lg border-2 border-gray-200" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
                <div className="mt-1 text-xs text-gray-500 truncate">{image.name}</div>
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
            className="px-5 py-3 sm:py-2.5 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] sm:min-h-0 active:scale-98"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !replyContent.trim() || replyContent.trim().length < MIN_REPLY_LENGTH}
          className="px-6 py-3 sm:py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px] sm:min-h-0 active:scale-98 shadow-sm"
          title={replyContent.trim().length < MIN_REPLY_LENGTH ? `Minimum ${MIN_REPLY_LENGTH} characters required` : ''}
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
  );
};

export default ReplyForm;

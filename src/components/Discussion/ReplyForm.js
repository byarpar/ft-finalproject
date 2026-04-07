import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhotoIcon, ListBulletIcon, LinkIcon, XMarkIcon, ChatBubbleLeftIcon, FaceSmileIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import MentionInput from '../UI/MentionInput';
import { EmojiPicker } from '../UIComponents';
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showTextFormats, setShowTextFormats] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

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

  const insertEmoji = (emoji) => {
    const mentionInputRef = replyEditorRef.current;
    if (!mentionInputRef || !mentionInputRef.textarea) return;

    const textarea = mentionInputRef.textarea;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newContent = replyContent.substring(0, start) + emoji + ' ' + replyContent.substring(end);
    setReplyContent(newContent);

    setTimeout(() => {
      mentionInputRef.focus();
      mentionInputRef.setSelectionRange(start + emoji.length + 1, start + emoji.length + 1);
    }, 0);
  };

  const insertFormatting = (type, value = null) => {
    const mentionInputRef = replyEditorRef.current;
    if (!mentionInputRef || !mentionInputRef.textarea) return;

    const textarea = mentionInputRef.textarea;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = replyContent.substring(start, end);
    let newText = replyContent;
    let newCursorPos = start;

    switch (type) {
      case 'bold':
        const boldText = `**${selectedText || 'bold text'}**`;
        newText = replyContent.substring(0, start) + boldText + replyContent.substring(end);
        newCursorPos = selectedText ? start + boldText.length : start + 2;
        break;
      case 'italic':
        const italicText = `*${selectedText || 'italic text'}*`;
        newText = replyContent.substring(0, start) + italicText + replyContent.substring(end);
        newCursorPos = selectedText ? start + italicText.length : start + 1;
        break;
      case 'underline':
        const underlineText = `__${selectedText || 'underlined text'}__`;
        newText = replyContent.substring(0, start) + underlineText + replyContent.substring(end);
        newCursorPos = selectedText ? start + underlineText.length : start + 2;
        break;
      case 'link':
        const linkText = `[${selectedText || 'link text'}](url)`;
        newText = replyContent.substring(0, start) + linkText + replyContent.substring(end);
        newCursorPos = selectedText ? start + linkText.length - 4 : start + 1;
        break;
      case 'list':
        const listText = `\n- ${selectedText || 'list item'}`;
        newText = replyContent.substring(0, start) + listText + replyContent.substring(end);
        newCursorPos = start + listText.length;
        break;
      case 'numberedList':
        const numberedText = `\n1. ${selectedText || 'numbered item'}`;
        newText = replyContent.substring(0, start) + numberedText + replyContent.substring(end);
        newCursorPos = start + numberedText.length;
        break;
      case 'code':
        const codeText = `\`${selectedText || 'code'}\``;
        newText = replyContent.substring(0, start) + codeText + replyContent.substring(end);
        newCursorPos = selectedText ? start + codeText.length : start + 1;
        break;
      case 'codeBlock':
        const codeBlockText = `\n\`\`\`\n${selectedText || 'code block'}\n\`\`\`\n`;
        newText = replyContent.substring(0, start) + codeBlockText + replyContent.substring(end);
        newCursorPos = start + codeBlockText.length;
        break;
      case 'heading1':
        const h1Text = `# ${selectedText || 'Heading 1'}`;
        newText = replyContent.substring(0, start) + h1Text + replyContent.substring(end);
        newCursorPos = selectedText ? start + h1Text.length : start + 2;
        break;
      case 'heading2':
        const h2Text = `## ${selectedText || 'Heading 2'}`;
        newText = replyContent.substring(0, start) + h2Text + replyContent.substring(end);
        newCursorPos = selectedText ? start + h2Text.length : start + 3;
        break;
      case 'heading3':
        const h3Text = `### ${selectedText || 'Heading 3'}`;
        newText = replyContent.substring(0, start) + h3Text + replyContent.substring(end);
        newCursorPos = selectedText ? start + h3Text.length : start + 4;
        break;
      case 'quote':
        const quoteText = `> ${selectedText || 'quote'}`;
        newText = replyContent.substring(0, start) + quoteText + replyContent.substring(end);
        newCursorPos = start + quoteText.length;
        break;
      case 'color':
        if (value) {
          const colorText = `<span style="color: ${value}">${selectedText || 'colored text'}</span>`;
          newText = replyContent.substring(0, start) + colorText + replyContent.substring(end);
          newCursorPos = selectedText ? end + (colorText.length - selectedText.length) : start + colorText.indexOf('>') + 1;
        }
        break;
      case 'bgColor':
        if (value) {
          const bgColorText = `<span style="background-color: ${value}; padding: 2px 4px; border-radius: 3px;">${selectedText || 'highlighted text'}</span>`;
          newText = replyContent.substring(0, start) + bgColorText + replyContent.substring(end);
          newCursorPos = selectedText ? end + (bgColorText.length - selectedText.length) : start + bgColorText.indexOf('>') + 1;
        }
        break;
      case 'emoji':
        const emojiText = selectedText ? `${selectedText} 😊` : '😊 ';
        newText = replyContent.substring(0, start) + emojiText + replyContent.substring(end);
        newCursorPos = start + emojiText.length;
        break;
      default:
        break;
    }

    setReplyContent(newText);
    setTimeout(() => {
      mentionInputRef.focus();
      if (!selectedText) {
        mentionInputRef.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const insertColor = (color, isBgColor = false) => {
    insertFormatting(isBgColor ? 'bgColor' : 'color', color);
    if (isBgColor) {
      setShowBgColorPicker(false);
    } else {
      setShowColorPicker(false);
    }
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

        <label className="p-2 hover:bg-white hover:shadow-sm rounded text-gray-700 transition-all cursor-pointer" title="Upload Images">
          <PhotoIcon className="w-4 h-4" />
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
        </label>

        <div className="flex-1"></div>

        <span className="text-xs text-gray-500 px-1">
          {replyImages.length}/{MAX_REPLY_IMAGES}
        </span>
      </div>

      <MentionInput
        ref={replyEditorRef}
        value={replyContent}
        onChange={setReplyContent}
        placeholder={`Write your reply (minimum ${MIN_REPLY_LENGTH} characters). Use @username to mention someone...`}
        rows={6}
        maxLength={MAX_REPLY_LENGTH}
        showCharCount={false}
        className="px-3 sm:px-4 py-2.5 sm:py-3 font-mono text-sm mb-2"
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

      {
        replyImages.length > 0 && (
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
        )
      }

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
    </form >
  );
};

export default ReplyForm;

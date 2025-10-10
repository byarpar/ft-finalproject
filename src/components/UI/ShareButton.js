import React, { useState, useRef, useEffect } from 'react';
import {
  ShareIcon,
  LinkIcon,
  EnvelopeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  TwitterIcon,
  FacebookIcon,
  WhatsAppIcon,
  TelegramIcon,
  RedditIcon
} from './SocialIcons';
import { useMutation } from 'react-query';
import { discussionsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ShareButton = ({ discussion, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const shareTrackingMutation = useMutation(
    ({ method, platform }) => discussionsAPI.shareDiscussion(discussion.id, {
      shareMethod: method,
      sharePlatform: platform
    }),
    {
      onError: (error) => {
        console.warn('Failed to track share:', error);
      }
    }
  );

  const generateShareUrl = () => {
    return `${window.location.origin}/discussions/${discussion.id}`;
  };

  const generateShareText = () => {
    return `Check out this discussion: "${discussion.title}" on English-Lisu Dictionary`;
  };

  const trackShare = (method, platform) => {
    shareTrackingMutation.mutate({ method, platform });
  };

  const copyToClipboard = async () => {
    try {
      setIsLoading(true);
      const url = generateShareUrl();
      await navigator.clipboard.writeText(url);
      trackShare('copy', 'clipboard');
      toast.success('Link copied!');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to copy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Discussion: ${discussion.title}`);
    const body = encodeURIComponent(`${generateShareText()}\n\n${generateShareUrl()}`);
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;

    trackShare('email', 'email');
    window.open(emailUrl, '_blank');
    setIsOpen(false);
  };

  const shareOnSocial = (platform) => {
    const url = encodeURIComponent(generateShareUrl());
    const text = encodeURIComponent(generateShareText());
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${url}&title=${encodeURIComponent(discussion.title)}`;
        break;
      default:
        return;
    }

    trackShare('social', platform);
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const shareNatively = async () => {
    if (navigator.share) {
      try {
        setIsLoading(true);
        await navigator.share({
          title: discussion.title,
          text: generateShareText(),
          url: generateShareUrl()
        });
        trackShare('native', 'system');
        setIsOpen(false);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Native share failed:', error);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const shareOptions = [
    {
      icon: LinkIcon,
      label: 'Copy Link',
      onClick: copyToClipboard,
      color: 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
    },
    {
      icon: EnvelopeIcon,
      label: 'Email',
      onClick: shareViaEmail,
      color: 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200'
    },
    {
      icon: TwitterIcon,
      label: 'Twitter',
      onClick: () => shareOnSocial('twitter'),
      color: 'text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300'
    },
    {
      icon: FacebookIcon,
      label: 'Facebook',
      onClick: () => shareOnSocial('facebook'),
      color: 'text-blue-700 hover:text-blue-900 dark:text-blue-500 dark:hover:text-blue-400'
    },
    {
      icon: WhatsAppIcon,
      label: 'WhatsApp',
      onClick: () => shareOnSocial('whatsapp'),
      color: 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'
    },
    {
      icon: TelegramIcon,
      label: 'Telegram',
      onClick: () => shareOnSocial('telegram'),
      color: 'text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
    },
    {
      icon: RedditIcon,
      label: 'Reddit',
      onClick: () => shareOnSocial('reddit'),
      color: 'text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300'
    }
  ];

  const handleMainButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Use native share API if available on mobile
    if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      shareNatively();
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={handleMainButtonClick}
        disabled={isLoading}
        className={`
          group flex items-center gap-1 px-2 py-1 text-sm font-medium 
          text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200
          hover:bg-gray-100 dark:hover:bg-gray-700 
          transition-all duration-200 rounded-md cursor-pointer
          ${isLoading ? 'opacity-50 cursor-wait' : ''}
        `}
        title="Share this discussion"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <ShareIcon className="w-4 h-4" />
        )}

        <span className="select-none">
          {discussion.share_count || 0}
        </span>
      </button>

      {/* Share Options Dropdown */}
      {isOpen && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-3/4 mb-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Share Discussion
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              {shareOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    option.onClick();
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md
                    hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200
                    ${option.color}
                  `}
                >
                  <option.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareButton;

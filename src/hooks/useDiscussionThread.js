import { useState, useCallback, useEffect } from 'react';
import { discussionsAPI, answersAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useDiscussionThread = (id, user) => {
  const [discussion, setDiscussion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [relatedDiscussions, setRelatedDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeImages = useCallback((images) => {
    if (!images) return [];
    if (typeof images === 'string') {
      try {
        return JSON.parse(images);
      } catch {
        return [];
      }
    }
    return Array.isArray(images) ? images : [];
  }, []);

  const normalizeAnswerImages = useCallback((answer) => {
    const images = normalizeImages(answer.images);
    const replies = answer.replies && Array.isArray(answer.replies)
      ? answer.replies.map(reply => normalizeAnswerImages(reply))
      : [];

    return { ...answer, images, replies };
  }, [normalizeImages]);

  const fetchDiscussion = useCallback(async () => {
    try {
      setLoading(true);
      const response = await discussionsAPI.getDiscussionById(id);
      const discussionData = response.discussion || response.data?.discussion || response;

      discussionData.images = normalizeImages(discussionData.images);
      setDiscussion(discussionData);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load discussion';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id, normalizeImages]);

  const fetchAnswers = useCallback(async () => {
    try {
      const response = await answersAPI.getAnswersForDiscussion(id);
      const answersData = response.data?.answers || response.answers || [];
      const normalizedAnswers = answersData.map(answer => normalizeAnswerImages(answer));
      const topLevelAnswers = normalizedAnswers.filter(answer => !answer.parent_answer_id);
      setAnswers(topLevelAnswers);
    } catch (err) {
      console.error('Error fetching answers:', err);
    }
  }, [id, normalizeAnswerImages]);

  const fetchRelatedDiscussions = useCallback(async () => {
    if (!discussion) return;
    try {
      const response = await discussionsAPI.getRelatedDiscussions(id, { limit: 5 });
      setRelatedDiscussions(response.data?.discussions || []);
    } catch (err) {
      console.error('Error fetching related discussions:', err);
    }
  }, [discussion, id]);

  const submitReply = async (content, images, parentAnswerId = null) => {
    try {
      const payload = { content, discussion_id: id };
      if (parentAnswerId) payload.parent_answer_id = parentAnswerId;
      // Extract base64 strings from image objects
      if (images.length > 0) {
        payload.images = images.map(img => typeof img === 'string' ? img : img.data);
      }

      await answersAPI.createAnswer(payload);
      await fetchAnswers();
      toast.success('Reply posted successfully!');
      return true;
    } catch (err) {
      console.error('Error posting reply:', err);

      // Handle validation errors from backend
      if (err.response?.data?.error?.details?.errors) {
        const errors = err.response.data.error.details.errors;
        const errorMessages = errors.map(e => e.message).join(', ');
        toast.error(errorMessages);
      } else if (err.response?.data?.error?.message) {
        toast.error(err.response.data.error.message);
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Failed to post reply. Please try again.');
      }

      return false;
    }
  };

  const updateAnswer = async (answerId, content) => {
    try {
      await answersAPI.updateAnswer(answerId, { content });
      await fetchAnswers();
      toast.success('Reply updated successfully!');
      return true;
    } catch (err) {
      console.error('Error updating answer:', err);

      // Handle validation errors
      if (err.response?.data?.error?.details?.errors) {
        const errors = err.response.data.error.details.errors;
        const errorMessages = errors.map(e => e.message).join(', ');
        toast.error(errorMessages);
      } else if (err.response?.data?.error?.message) {
        toast.error(err.response.data.error.message);
      } else {
        toast.error('Failed to update reply. Please try again.');
      }

      return false;
    }
  };

  const deleteAnswer = async (answerId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return false;
    try {
      await answersAPI.deleteAnswer(answerId);
      await fetchAnswers();
      toast.success('Reply deleted successfully');
      return true;
    } catch (err) {
      toast.error('Failed to delete reply');
      return false;
    }
  };

  const updateDiscussion = async (updates) => {
    try {
      await discussionsAPI.updateDiscussion(id, updates);
      await fetchDiscussion();
      toast.success('Discussion updated successfully!');
      return true;
    } catch (err) {
      console.error('Error updating discussion:', err);

      // Handle validation errors
      if (err.response?.data?.error?.details?.errors) {
        const errors = err.response.data.error.details.errors;
        const errorMessages = errors.map(e => e.message).join(', ');
        toast.error(errorMessages);
      } else if (err.response?.data?.error?.message) {
        toast.error(err.response.data.error.message);
      } else {
        toast.error('Failed to update discussion. Please try again.');
      }

      return false;
    }
  };

  const deleteDiscussion = async () => {
    if (!window.confirm('Are you sure you want to delete this discussion?')) return false;
    try {
      await discussionsAPI.deleteDiscussion(id);
      toast.success('Discussion deleted successfully');
      return true;
    } catch (err) {
      toast.error('Failed to delete discussion');
      return false;
    }
  };

  const toggleSave = async () => {
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
      toast.error('Failed to save discussion');
    }
  };

  const reportThread = async (reason, description) => {
    try {
      await discussionsAPI.reportDiscussion(id, { reason, description });
      toast.success('Report submitted successfully');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to submit report';
      toast.error(errorMessage);
      return false;
    }
  };

  const toggleDiscussionStatus = async (action) => {
    try {
      const actions = {
        solved: () => discussionsAPI.toggleSolved(id),
        pinned: () => discussionsAPI.togglePinned(id),
        locked: () => discussionsAPI.toggleLocked(id)
      };

      await actions[action]();
      await fetchDiscussion();
      toast.success(`Discussion ${action} status updated`);
    } catch (err) {
      toast.error(`Failed to update ${action} status`);
    }
  };

  useEffect(() => {
    fetchDiscussion();
    fetchAnswers();
  }, [fetchDiscussion, fetchAnswers]);

  useEffect(() => {
    fetchRelatedDiscussions();
  }, [fetchRelatedDiscussions]);

  return {
    discussion,
    answers,
    relatedDiscussions,
    loading,
    error,
    setDiscussion,
    setAnswers,
    submitReply,
    updateAnswer,
    deleteAnswer,
    updateDiscussion,
    deleteDiscussion,
    toggleSave,
    reportThread,
    toggleDiscussionStatus,
    refetch: fetchDiscussion
  };
};

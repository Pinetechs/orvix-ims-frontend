import { apiClient, cleanRequestParams, getErrorMessage } from './apiClient.js';
import { apiRoute } from '../util/constant.js';

const reviewUrl = (taskId, suffix = '') =>
  `${apiRoute.inventoryReviewTasks}/${taskId}/review${suffix}`;

const get = async (url, params, fallback) => {
  try {
    const response = await apiClient.get(url, { params: cleanRequestParams(params) });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, fallback));
  }
};

const post = async (url, payload, fallback) => {
  try {
    const response = await apiClient.post(url, payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, fallback));
  }
};

export const getReviewSummary = (taskId) =>
  get(reviewUrl(taskId, '/summary'), undefined, 'Failed to load review summary');

export const synchronizeReviewIssues = ({ taskId }) =>
  post(reviewUrl(taskId, '/synchronize'), undefined, 'Could not synchronize review issues');

export const getReviewIssues = ({ taskId, ...params }) =>
  get(reviewUrl(taskId, '/issues'), params, 'Failed to load review issues');

export const getReviewIssue = ({ taskId, issueId }) =>
  get(reviewUrl(taskId, `/issues/${issueId}`), undefined, 'Failed to load review issue');

export const decideReviewIssue = ({ taskId, issueId, payload }) =>
  post(reviewUrl(taskId, `/issues/${issueId}/decision`), payload, 'Could not save review decision');

export const createRecheckRequest = ({ taskId, payload }) =>
  post(reviewUrl(taskId, '/rechecks'), payload, 'Could not create recheck request');

export const getRecheckRequests = ({ taskId, ...params }) =>
  get(reviewUrl(taskId, '/rechecks'), params, 'Failed to load recheck requests');

export const getRecheckRequest = ({ taskId, requestId }) =>
  get(reviewUrl(taskId, `/rechecks/${requestId}`), undefined, 'Failed to load recheck request');

export const cancelRecheckRequest = ({ taskId, requestId, reason }) =>
  post(
    reviewUrl(taskId, `/rechecks/${requestId}/cancel`),
    { reason },
    'Could not cancel recheck request',
  );

export const decideRecheckItem = ({ taskId, requestId, itemId, payload }) =>
  post(
    reviewUrl(taskId, `/rechecks/${requestId}/items/${itemId}/decision`),
    payload,
    'Could not save recheck decision',
  );

export const getRecheckEvidence = async ({ taskId, requestId, itemId }) => {
  try {
    const response = await apiClient.get(
      reviewUrl(taskId, `/rechecks/${requestId}/items/${itemId}/evidence`),
      { responseType: 'blob' },
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load recheck evidence'));
  }
};

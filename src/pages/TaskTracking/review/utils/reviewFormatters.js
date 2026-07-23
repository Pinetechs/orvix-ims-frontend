export const REVIEW_ISSUE_STATUSES = [
  'OPEN',
  'RECHECK_REQUESTED',
  'RECHECK_IN_PROGRESS',
  'RECHECK_SUBMITTED',
  'RESOLVED',
  'SUPERSEDED',
];

export const REVIEW_ISSUE_TYPES = [
  'NOT_PROCESSED',
  'LOCATION_MISMATCH',
  'QUANTITY_SHORTAGE',
  'QUANTITY_OVERAGE',
  'CONFLICT',
  'EXTRA',
  'AMBIGUOUS',
];

export const RECHECK_REQUEST_STATUSES = [
  'PENDING',
  'IN_PROGRESS',
  'SUBMITTED',
  'COMPLETED',
  'CANCELLED',
];

export const REVIEW_REASON_CODES = [
  'RECHECK_CONFIRMED',
  'COUNTING_ERROR',
  'WRONG_LOCATION_SELECTED',
  'ITEM_MOVED',
  'ITEM_MISSING',
  'ITEM_DESTROYED',
  'ITEM_NOT_IN_SOURCE_DATA',
  'DUPLICATE_SOURCE_RECORD',
  'BARCODE_DAMAGED',
  'SOURCE_DATA_ERROR',
  'ACCESS_RESTRICTED',
  'OTHER',
];

export const ISSUE_STATUS_COLORS = {
  OPEN: 'error',
  RECHECK_REQUESTED: 'warning',
  RECHECK_IN_PROGRESS: 'info',
  RECHECK_SUBMITTED: 'secondary',
  RESOLVED: 'success',
  SUPERSEDED: 'default',
};

export const ISSUE_TYPE_COLORS = {
  NOT_PROCESSED: 'default',
  LOCATION_MISMATCH: 'warning',
  QUANTITY_SHORTAGE: 'error',
  QUANTITY_OVERAGE: 'warning',
  CONFLICT: 'error',
  EXTRA: 'warning',
  AMBIGUOUS: 'secondary',
};

export const RECHECK_STATUS_COLORS = {
  PENDING: 'warning',
  IN_PROGRESS: 'info',
  SUBMITTED: 'secondary',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

export const RECHECK_ITEM_STATUS_COLORS = {
  PENDING: 'warning',
  SUBMITTED: 'secondary',
  ACCEPTED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default',
};

export const pageRows = (page) => (Array.isArray(page?.content) ? page.content : []);
export const pageCount = (page) => Number(page?.totalElements || 0);

export const reviewUserName = (user) =>
  user?.displayName || user?.fullName || user?.name || user?.username || '-';

export const issueExpectedLocation = (issue) =>
  [issue?.expectedArea, issue?.expectedSubArea, issue?.expectedLeafArea].filter(Boolean).join(' / ') || '-';

export const issueActualLocation = (issue) =>
  [issue?.actualArea, issue?.actualSubArea, issue?.actualLeafArea].filter(Boolean).join(' / ') || '-';

export const directIssueDecisions = (issue) => {
  const decisions = ['KEEP_CURRENT_RESULT'];
  if (issue?.itemId) decisions.push('CONFIRM_MISSING', 'CONFIRM_DESTROYED');
  if (issue?.issueType === 'EXTRA' || issue?.issueType === 'AMBIGUOUS') {
    decisions.push('CONFIRM_EXTRA');
  }
  return decisions;
};

export const submittedItemDecisions = (item) => {
  const decisions = ['ACCEPT_RECHECK_RESULT', 'KEEP_CURRENT_RESULT'];
  if (item?.referenceItemId) decisions.push('CONFIRM_MISSING', 'CONFIRM_DESTROYED');
  if (item?.issues?.some(({ issueType }) => issueType === 'EXTRA' || issueType === 'AMBIGUOUS')) {
    decisions.push('CONFIRM_EXTRA');
  }
  decisions.push('REQUEST_ANOTHER_RECHECK');
  return decisions;
};

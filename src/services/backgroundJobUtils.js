export const unwrapBackgroundJobResponse = (data) => data 

export const getBackgroundJobId = (data) => {
  
  return  data?.jobId 
};

export const getBackgroundJobStatus = (data) => {
  
  return data?.status 
};

export const getBackgroundJobProgress = (data) => {
  const progress = Number(data.progress ?? 0);

  if (!Number.isFinite(progress)) {
    return 0;
  }

  return Math.min(100, Math.max(0, progress));
};

export const getBackgroundJobMessage = (data) => {
  return data?.message;
};

export const getBackgroundJobErrorMessage = (data) => {
  return data?.errorMessage ;
}

export const parseBackgroundJobResult = (data) => {
 
  const result = data?.result;

  if (!result) {
    return null;
  }

  if (typeof result === 'object') {
    return result;
  }

  if (typeof result !== 'string') {
    return null;
  }

  try {
    return JSON.parse(result);
  } catch {
    return { message: result };
  }
};

export const isBackgroundJobTerminal = (status) => ['COMPLETED', 'FAILED', 'CANCELLED'].includes(status);
export const isBackgroundJobRunning = (status) => ['PENDING', 'RUNNING'].includes(status);

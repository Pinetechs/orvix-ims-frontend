
  
  








export const parseBackgroundJobResult = (data) => {



  const result = data?.result 

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

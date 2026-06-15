let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = typeof handler === 'function' ? handler : null;
};

export const notifyUnauthorized = async () => {
  if (unauthorizedHandler) {
    await unauthorizedHandler();
  }
};

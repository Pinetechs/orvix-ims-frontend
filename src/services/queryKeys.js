export const queryKeys = {
  users: {
    all: ['users'],
    list: (params) => ['users', 'list', params],
    details: (id) => ['users', 'details', id],
  },
  companies: {
    all: ['companies'],
    list: (params) => ['companies', 'list', params],
  },
};
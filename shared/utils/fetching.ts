export const createHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

// export const createHeaders = ({}) => ({
//   'Content-Type': 'application/json',
//   Authorization: `Bearer ${token}`,
// });

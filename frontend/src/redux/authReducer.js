const initialState = {
  id: 0,
  username: '',
  displayName: '',
  image: '',
  password: '',
  isLoggedIn: false
};

export default function authReducer(state = initialState, action) {
  if (action.type === 'logout-success') {
    return { ...initialState };
  } else if (action.type === 'login-success') {
    return {
      ...action.payload,
      isLoggedIn: true
    };
  }
  return state;
}

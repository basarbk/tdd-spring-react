import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import UserPage from './UserPage';
import * as apiCalls from '../api/apiCalls';
import { Provider } from 'react-redux';
import configureStore from '../redux/configureStore';
import axios from 'axios';

apiCalls.loadHoaxes = jest.fn().mockResolvedValue({
  data: {
    content: [],
    number: 0,
    size: 3,
  },
});

const mockSuccessGetUser = {
  data: {
    id: 1,
    username: 'user1',
    displayName: 'display1',
    image: 'profile1.png',
  },
};

const mockSuccessUpdateUser = {
  data: {
    id: 1,
    username: 'user1',
    displayName: 'display1-update',
    image: 'profile1-update.png',
  },
};
const mockFailGetUser = {
  response: {
    data: {
      message: 'User not found',
    },
  },
};

const mockFailUpdateUser = {
  response: {
    data: {
      validationErrors: {
        displayName: 'It must have minimum 4 and maximum 255 characters',
        image: 'Only PNG and JPG files are allowed',
      },
    },
  },
};

const match = {
  params: {
    username: 'user1',
  },
};

let store;
const setup = (props) => {
  store = configureStore(false);
  return render(
    <Provider store={store}>
      <UserPage {...props} />
    </Provider>
  );
};
beforeEach(() => {
  localStorage.clear();
  delete axios.defaults.headers.common['Authorization'];
});
const setUserOneLoggedInStorage = () => {
  localStorage.setItem(
    'hoax-auth',
    JSON.stringify({
      id: 1,
      username: 'user1',
      displayName: 'display1',
      image: 'profile1.png',
      password: 'P4ssword',
      isLoggedIn: true,
    })
  );
};
describe('UserPage', () => {
  describe('Layout', () => {
    it('has root page div', () => {
      const { queryByTestId } = setup();
      const userPageDiv = queryByTestId('userpage');
      expect(userPageDiv).toBeInTheDocument();
    });
    it('displays the displayName@username when user data loaded', async () => {
      apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
      const { findByText } = setup({ match });
      const text = await findByText('display1@user1');
      expect(text).toBeInTheDocument();
    });
    it('displays not found alert when user not found', async () => {
      apiCalls.getUser = jest.fn().mockRejectedValue(mockFailGetUser);
      const { findByText } = setup({ match });
      const alert = await findByText('User not found');
      expect(alert).toBeInTheDocument();
    });
    it('displays spinner while loading user data', () => {
      const mockDelayedResponse = jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(mockSuccessGetUser);
          }, 300);
        });
      });
      apiCalls.getUser = mockDelayedResponse;
      const { queryAllByText } = setup({ match });
      const spinners = queryAllByText('Loading...');
      expect(spinners.length).not.toBe(0);
    });
    it('displays the edit button when loggedInUser matches to user in url', async () => {
      setUserOneLoggedInStorage();
      apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
      const { queryByText, findByText } = setup({ match });
      await findByText('display1@user1');
      const editButton = queryByText('Edit');
      expect(editButton).toBeInTheDocument();
    });
  });
  describe('Lifecycle', () => {
    it('calls getUser when it is rendered', () => {
      apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
      setup({ match });
      expect(apiCalls.getUser).toHaveBeenCalledTimes(1);
    });
    it('calls getUser for user1 when it is rendered with user1 in match', () => {
      apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
      setup({ match });
      expect(apiCalls.getUser).toHaveBeenCalledWith('user1');
    });
  });
  describe('ProfileCard Interactions', () => {
    const setupForEdit = async () => {
      setUserOneLoggedInStorage();
      apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
      const rendered = setup({ match });
      const editButton = await rendered.findByText('Edit');
      fireEvent.click(editButton);
      return rendered;
    };

    const mockDelayedUpdateSuccess = () => {
      return jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(mockSuccessUpdateUser);
          }, 300);
        });
      });
    };
    it('displays edit layout when clicking edit button', async () => {
      const { queryByText } = await setupForEdit();
      expect(queryByText('Save')).toBeInTheDocument();
    });
    it('returns back to none edit mode after clicking cancel', async () => {
      const { queryByText } = await setupForEdit();

      const cancelButton = queryByText('Cancel');
      fireEvent.click(cancelButton);

      expect(queryByText('Edit')).toBeInTheDocument();
    });
    it('calls updateUser api when clicking save', async () => {
      const { queryByRole } = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const saveButton = queryByRole('button', { name: 'Save' });
      fireEvent.click(saveButton);

      expect(apiCalls.updateUser).toHaveBeenCalledTimes(1);
    });
    it('calls updateUser api with user id', async () => {
      const { queryByRole } = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const saveButton = queryByRole('button', { name: 'Save' });
      fireEvent.click(saveButton);
      const userId = apiCalls.updateUser.mock.calls[0][0];

      expect(userId).toBe(1);
    });
    it('calls updateUser api with request body having changed displayName', async () => {
      const { queryByRole, container } = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const displayInput = container.querySelector('input');
      fireEvent.change(displayInput, { target: { value: 'display1-update' } });

      const saveButton = queryByRole('button', { name: 'Save' });
      fireEvent.click(saveButton);

      const requestBody = apiCalls.updateUser.mock.calls[0][1];

      expect(requestBody.displayName).toBe('display1-update');
    });
    it('returns to non edit mode after successful updateUser api call', async () => {
      const { queryByRole, findByText } = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const saveButton = queryByRole('button', { name: 'Save' });
      fireEvent.click(saveButton);
      const editButtonAfterClickingSave = await findByText('Edit');

      expect(editButtonAfterClickingSave).toBeInTheDocument();
    });
    it('returns to original displayName after its changed in edit mode but cancelled', async () => {
      const { queryByText, container } = await setupForEdit();
      const displayInput = container.querySelector('input');
      fireEvent.change(displayInput, { target: { value: 'display1-update' } });

      const cancelButton = queryByText('Cancel');
      fireEvent.click(cancelButton);

      const originalDisplayText = queryByText('display1@user1');
      expect(originalDisplayText).toBeInTheDocument();
    });
    it('returns to last updated displayName when display name is changed for another time but cancelled', async () => {
      const {
        queryByText,
        findByText,
        container,
        queryByRole,
      } = await setupForEdit();
      let displayInput = container.querySelector('input');
      fireEvent.change(displayInput, { target: { value: 'display1-update' } });
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const saveButton = queryByRole('button', { name: 'Save' });
      fireEvent.click(saveButton);

      const editButtonAfterClickingSave = await findByText('Edit');
      fireEvent.click(editButtonAfterClickingSave);

      displayInput = container.querySelector('input');
      fireEvent.change(displayInput, {
        target: { value: 'display1-update-second-time' },
      });
      const cancelButton = queryByText('Cancel');
      fireEvent.click(cancelButton);

      const lastSavedData = container.querySelector('h4');

      expect(lastSavedData).toHaveTextContent('display1-update@user1');
    });
    it('displays spinner when there is updateUser api call', async () => {
      const { queryByText, queryByRole } = await setupForEdit();
      apiCalls.updateUser = mockDelayedUpdateSuccess();

      const saveButton = queryByRole('button', { name: 'Save' });
      fireEvent.click(saveButton);
      const spinner = queryByText('Loading...');
      expect(spinner).toBeInTheDocument();
    });
    it('disables save button when there is updateUser api call', async () => {
      const { queryByRole } = await setupForEdit();
      apiCalls.updateUser = mockDelayedUpdateSuccess();

      const saveButton = queryByRole('button', { name: 'Save' });
      fireEvent.click(saveButton);

      expect(saveButton).toBeDisabled();
    });

    it('disables cancel button when there is updateUser api call', async () => {
      const { queryByText, queryByRole } = await setupForEdit();
      apiCalls.updateUser = mockDelayedUpdateSuccess();

      const saveButton = queryByRole('button', { name: 'Save' });
      fireEvent.click(saveButton);

      const cancelButton = queryByText('Cancel');

      expect(cancelButton).toBeDisabled();
    });
    it('enables save button after updateUser api call success', async () => {
      const {
        queryByText,
        container,
        findByText,
        queryByRole,
      } = await setupForEdit();
      let displayInput = container.querySelector('input');
      fireEvent.change(displayInput, { target: { value: 'display1-update' } });
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const saveButton = queryByRole('button', { name: 'Save' });
      fireEvent.click(saveButton);

      const editButtonAfterClickingSave = await findByText('Edit');

      fireEvent.click(editButtonAfterClickingSave);

      const saveButtonAfterSecondEdit = queryByText('Save');

      expect(saveButtonAfterSecondEdit).not.toBeDisabled();
    });
    it('enables save button after updateUser api call fails', async () => {
      const { queryByRole, container } = await setupForEdit();
      let displayInput = container.querySelector('input');
      fireEvent.change(displayInput, { target: { value: 'display1-update' } });
      apiCalls.updateUser = jest.fn().mockRejectedValue(mockFailUpdateUser);

      const saveButton = queryByRole('button', { name: 'Save' });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });
    });
    it('displays the selected image in edit mode', async () => {
      const { container } = await setupForEdit();

      const inputs = container.querySelectorAll('input');
      const uploadInput = inputs[1];

      const file = new File(['dummy content'], 'example.png', {
        type: 'image/png',
      });

      fireEvent.change(uploadInput, { target: { files: [file] } });

      await waitFor(() => {
        const image = container.querySelector('img');
        expect(image.src).toContain('data:image/png;base64');
      });
    });
    it('returns back to the original image even the new image is added to upload box but cancelled', async () => {
      const { queryByText, container } = await setupForEdit();

      const inputs = container.querySelectorAll('input');
      const uploadInput = inputs[1];

      const file = new File(['dummy content'], 'example.png', {
        type: 'image/png',
      });

      fireEvent.change(uploadInput, { target: { files: [file] } });

      const cancelButton = queryByText('Cancel');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        const image = container.querySelector('img');
        expect(image.src).toContain('/images/profile/profile1.png');
      });
    });

    it('does not throw error after file not selected', async () => {
      const { container } = await setupForEdit();
      const inputs = container.querySelectorAll('input');
      const uploadInput = inputs[1];
      expect(() =>
        fireEvent.change(uploadInput, { target: { files: [] } })
      ).not.toThrow();
    });

    it('calls updateUser api with request body having new image without data:image/png;base64', async () => {
      const { queryByRole, container } = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const inputs = container.querySelectorAll('input');
      const uploadInput = inputs[1];

      const file = new File(['dummy content'], 'example.png', {
        type: 'image/png',
      });

      fireEvent.change(uploadInput, { target: { files: [file] } });

      await waitFor(() => {
        const image = container.querySelector('img');
        expect(image.src).toContain('data:image/png;base64');
      });
      const saveButton = queryByRole('button', { name: 'Save' });
      fireEvent.click(saveButton);

      const requestBody = apiCalls.updateUser.mock.calls[0][1];

      expect(requestBody.image).not.toContain('data:image/png;base64');
    });

    it('returns to last updated image when image is change for another time but cancelled', async () => {
      const {
        queryByText,
        container,
        queryByRole,
        findByText,
      } = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const inputs = container.querySelectorAll('input');
      const uploadInput = inputs[1];

      const file = new File(['dummy content'], 'example.png', {
        type: 'image/png',
      });

      fireEvent.change(uploadInput, { target: { files: [file] } });

      await waitFor(() => {
        const image = container.querySelector('img');
        expect(image.src).toContain('data:image/png;base64');
      });
      const saveButton = queryByRole('button', { name: 'Save' });
      fireEvent.click(saveButton);

      const editButtonAfterClickingSave = await findByText('Edit');
      fireEvent.click(editButtonAfterClickingSave);

      const newFile = new File(['another content'], 'example2.png', {
        type: 'image/png',
      });

      fireEvent.change(uploadInput, { target: { files: [newFile] } });

      const cancelButton = queryByText('Cancel');
      fireEvent.click(cancelButton);
      const image = container.querySelector('img');
      expect(image.src).toContain('/images/profile/profile1-update.png');
    });
    it('displays validation error for displayName when update api fails', async () => {
      const { queryByRole, findByText } = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockRejectedValue(mockFailUpdateUser);

      const saveButton = queryByRole('button', { name: 'Save' });
      fireEvent.click(saveButton);

      const errorMessage = await findByText(
        'It must have minimum 4 and maximum 255 characters'
      );
      expect(errorMessage).toBeInTheDocument();
    });
    it('shows validation error for file when update api fails', async () => {
      const { queryByRole, findByText } = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockRejectedValue(mockFailUpdateUser);

      const saveButton = queryByRole('button', { name: 'Save' });
      fireEvent.click(saveButton);

      const errorMessage = await findByText(
        'Only PNG and JPG files are allowed'
      );
      expect(errorMessage).toBeInTheDocument();
    });
    it('removes validation error for displayName when user changes the displayName', async () => {
      const { container, queryByRole, findByText } = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockRejectedValue(mockFailUpdateUser);

      const saveButton = queryByRole('button', { name: 'Save' });
      fireEvent.click(saveButton);
      const errorMessage = await findByText(
        'It must have minimum 4 and maximum 255 characters'
      );

      const displayInput = container.querySelectorAll('input')[0];
      fireEvent.change(displayInput, { target: { value: 'new-display-name' } });

      expect(errorMessage).not.toBeInTheDocument();
    });

    it('removes validation error for file when user changes the file', async () => {
      const { container, queryByRole, findByText } = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockRejectedValue(mockFailUpdateUser);

      const saveButton = queryByRole('button', { name: 'Save' });
      fireEvent.click(saveButton);
      const errorMessage = await findByText(
        'Only PNG and JPG files are allowed'
      );

      const fileInput = container.querySelectorAll('input')[1];

      const newFile = new File(['another content'], 'example2.png', {
        type: 'image/png',
      });
      fireEvent.change(fileInput, { target: { files: [newFile] } });

      await waitFor(() => {
        expect(errorMessage).not.toBeInTheDocument();
      });
    });
    it('removes validation error if user cancels', async () => {
      const { queryByText, queryByRole } = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockRejectedValue(mockFailUpdateUser);

      const saveButton = queryByRole('button', { name: 'Save' });
      fireEvent.click(saveButton);
      await waitForElementToBeRemoved(() => queryByText('Loading...'));
      fireEvent.click(queryByText('Cancel'));

      fireEvent.click(queryByText('Edit'));
      const errorMessage = queryByText(
        'It must have minimum 4 and maximum 255 characters'
      );
      expect(errorMessage).not.toBeInTheDocument();
    });
    it('updates redux state after updateUser api call success', async () => {
      const { queryByRole, container } = await setupForEdit();
      let displayInput = container.querySelector('input');
      fireEvent.change(displayInput, { target: { value: 'display1-update' } });
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const saveButton = queryByRole('button', { name: 'Save' });
      fireEvent.click(saveButton);
      await waitForElementToBeRemoved(saveButton);
      const storedUserData = store.getState();
      expect(storedUserData.displayName).toBe(
        mockSuccessUpdateUser.data.displayName
      );
      expect(storedUserData.image).toBe(mockSuccessUpdateUser.data.image);
    });
    it('updates localStorage after updateUser api call success', async () => {
      const { queryByRole, container } = await setupForEdit();
      let displayInput = container.querySelector('input');
      fireEvent.change(displayInput, { target: { value: 'display1-update' } });
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const saveButton = queryByRole('button', { name: 'Save' });
      fireEvent.click(saveButton);
      await waitForElementToBeRemoved(saveButton);
      const storedUserData = JSON.parse(localStorage.getItem('hoax-auth'));
      expect(storedUserData.displayName).toBe(
        mockSuccessUpdateUser.data.displayName
      );
      expect(storedUserData.image).toBe(mockSuccessUpdateUser.data.image);
    });
  });
});

console.error = () => {};

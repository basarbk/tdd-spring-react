import React from 'react';
import { render, fireEvent, waitForDomChange } from '@testing-library/react';
import HoaxSubmit from './HoaxSubmit';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import authReducer from '../redux/authReducer';
import * as apiCalls from '../api/apiCalls';

const defaultState = {
  id: 1,
  username: 'user1',
  displayName: 'display1',
  image: 'profile1.png',
  password: 'P4ssword',
  isLoggedIn: true
};

let store;

const setup = (state = defaultState) => {
  store = createStore(authReducer, state);
  return render(
    <Provider store={store}>
      <HoaxSubmit />
    </Provider>
  );
};

describe('HoaxSubmit', () => {
  describe('Layout', () => {
    it('has textarea', () => {
      const { container } = setup();
      const textArea = container.querySelector('textarea');
      expect(textArea).toBeInTheDocument();
    });
    it('has image', () => {
      const { container } = setup();
      const image = container.querySelector('img');
      expect(image).toBeInTheDocument();
    });
    it('has textarea', () => {
      const { container } = setup();
      const textArea = container.querySelector('textarea');
      expect(textArea.rows).toBe(1);
    });
    it('displays user image', () => {
      const { container } = setup();
      const image = container.querySelector('img');
      expect(image.src).toContain('/images/profile/' + defaultState.image);
    });
  });
  describe('Interactions', () => {
    it('displays 3 rows when focused to textarea', () => {
      const { container } = setup();
      const textArea = container.querySelector('textarea');
      fireEvent.focus(textArea);
      expect(textArea.rows).toBe(3);
    });
    it('displays hoaxify button when focused to textarea', () => {
      const { container, queryByText } = setup();
      const textArea = container.querySelector('textarea');
      fireEvent.focus(textArea);
      const hoaxifyButton = queryByText('Hoaxify');
      expect(hoaxifyButton).toBeInTheDocument();
    });
    it('displays Cancel button when focused to textarea', () => {
      const { container, queryByText } = setup();
      const textArea = container.querySelector('textarea');
      fireEvent.focus(textArea);
      const cancelButton = queryByText('Cancel');
      expect(cancelButton).toBeInTheDocument();
    });
    it('does not display Hoaxify button when not focused to textarea', () => {
      const { queryByText } = setup();
      const hoaxifyButton = queryByText('Hoaxify');
      expect(hoaxifyButton).not.toBeInTheDocument();
    });
    it('does not display Cancel button when not focused to textarea', () => {
      const { queryByText } = setup();
      const cancelButton = queryByText('Cancel');
      expect(cancelButton).not.toBeInTheDocument();
    });
    it('returns back to unfocused state after clicking the cancel', () => {
      const { container, queryByText } = setup();
      const textArea = container.querySelector('textarea');
      fireEvent.focus(textArea);
      const cancelButton = queryByText('Cancel');
      fireEvent.click(cancelButton);
      expect(queryByText('Cancel')).not.toBeInTheDocument();
    });
    it('calls postHoax with hoax request object when clicking Hoaxify', () => {
      const { container, queryByText } = setup();
      const textArea = container.querySelector('textarea');
      fireEvent.focus(textArea);
      fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

      const hoaxifyButton = queryByText('Hoaxify');

      apiCalls.postHoax = jest.fn().mockResolvedValue({});
      fireEvent.click(hoaxifyButton);

      expect(apiCalls.postHoax).toHaveBeenCalledWith({
        content: 'Test hoax content'
      });
    });
    it('returns back to unfocused state after successful postHoax action', async () => {
      const { container, queryByText } = setup();
      const textArea = container.querySelector('textarea');
      fireEvent.focus(textArea);
      fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

      const hoaxifyButton = queryByText('Hoaxify');

      apiCalls.postHoax = jest.fn().mockResolvedValue({});
      fireEvent.click(hoaxifyButton);

      await waitForDomChange();
      expect(queryByText('Hoaxify')).not.toBeInTheDocument();
    });
    it('clear content after successful postHoax action', async () => {
      const { container, queryByText } = setup();
      const textArea = container.querySelector('textarea');
      fireEvent.focus(textArea);
      fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

      const hoaxifyButton = queryByText('Hoaxify');

      apiCalls.postHoax = jest.fn().mockResolvedValue({});
      fireEvent.click(hoaxifyButton);

      await waitForDomChange();
      expect(queryByText('Test hoax content')).not.toBeInTheDocument();
    });
    it('clears content after clicking cancel', () => {
      const { container, queryByText } = setup();
      const textArea = container.querySelector('textarea');
      fireEvent.focus(textArea);
      fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

      fireEvent.click(queryByText('Cancel'));

      expect(queryByText('Test hoax content')).not.toBeInTheDocument();
    });
    it('disables Hoaxify button when there is postHoax api call', async () => {
      const { container, queryByText } = setup();
      const textArea = container.querySelector('textarea');
      fireEvent.focus(textArea);
      fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

      const hoaxifyButton = queryByText('Hoaxify');

      const mockFunction = jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve({});
          }, 300);
        });
      });

      apiCalls.postHoax = mockFunction;
      fireEvent.click(hoaxifyButton);

      fireEvent.click(hoaxifyButton);
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });
    it('disables Cancel button when there is postHoax api call', async () => {
      const { container, queryByText } = setup();
      const textArea = container.querySelector('textarea');
      fireEvent.focus(textArea);
      fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

      const hoaxifyButton = queryByText('Hoaxify');

      const mockFunction = jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve({});
          }, 300);
        });
      });

      apiCalls.postHoax = mockFunction;
      fireEvent.click(hoaxifyButton);

      const cancelButton = queryByText('Cancel');
      expect(cancelButton).toBeDisabled();
    });
    it('displays spinner when there is postHoax api call', async () => {
      const { container, queryByText } = setup();
      const textArea = container.querySelector('textarea');
      fireEvent.focus(textArea);
      fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

      const hoaxifyButton = queryByText('Hoaxify');

      const mockFunction = jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve({});
          }, 300);
        });
      });

      apiCalls.postHoax = mockFunction;
      fireEvent.click(hoaxifyButton);

      expect(queryByText('Loading...')).toBeInTheDocument();
    });
    it('enables Hoaxify button when postHoax api call fails', async () => {
      const { container, queryByText } = setup();
      const textArea = container.querySelector('textarea');
      fireEvent.focus(textArea);
      fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

      const hoaxifyButton = queryByText('Hoaxify');

      const mockFunction = jest.fn().mockRejectedValueOnce({
        response: {
          data: {
            validationErrors: {
              content: 'It must have minimum 10 and maximum 5000 characters'
            }
          }
        }
      });

      apiCalls.postHoax = mockFunction;
      fireEvent.click(hoaxifyButton);

      await waitForDomChange();

      expect(queryByText('Hoaxify')).not.toBeDisabled();
    });
    it('enables Cancel button when postHoax api call fails', async () => {
      const { container, queryByText } = setup();
      const textArea = container.querySelector('textarea');
      fireEvent.focus(textArea);
      fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

      const hoaxifyButton = queryByText('Hoaxify');

      const mockFunction = jest.fn().mockRejectedValueOnce({
        response: {
          data: {
            validationErrors: {
              content: 'It must have minimum 10 and maximum 5000 characters'
            }
          }
        }
      });

      apiCalls.postHoax = mockFunction;
      fireEvent.click(hoaxifyButton);

      await waitForDomChange();

      expect(queryByText('Cancel')).not.toBeDisabled();
    });
    it('enables Hoaxify button after successful postHoax action', async () => {
      const { container, queryByText } = setup();
      const textArea = container.querySelector('textarea');
      fireEvent.focus(textArea);
      fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

      const hoaxifyButton = queryByText('Hoaxify');

      apiCalls.postHoax = jest.fn().mockResolvedValue({});
      fireEvent.click(hoaxifyButton);

      await waitForDomChange();
      fireEvent.focus(textArea);
      expect(queryByText('Hoaxify')).not.toBeDisabled();
    });
  });
});

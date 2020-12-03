import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
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
  isLoggedIn: true,
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
    let textArea;
    const setupFocused = () => {
      const rendered = setup();
      textArea = rendered.container.querySelector('textarea');
      fireEvent.focus(textArea);
      return rendered;
    };

    it('displays 3 rows when focused to textarea', () => {
      setupFocused();
      expect(textArea.rows).toBe(3);
    });
    it('displays hoaxify button when focused to textarea', () => {
      const { queryByText } = setupFocused();
      const hoaxifyButton = queryByText('Hoaxify');
      expect(hoaxifyButton).toBeInTheDocument();
    });
    it('displays Cancel button when focused to textarea', () => {
      const { queryByText } = setupFocused();
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
      const { queryByText } = setupFocused();
      const cancelButton = queryByText('Cancel');
      fireEvent.click(cancelButton);
      expect(queryByText('Cancel')).not.toBeInTheDocument();
    });
    it('calls postHoax with hoax request object when clicking Hoaxify', () => {
      const { queryByText } = setupFocused();
      fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

      const hoaxifyButton = queryByText('Hoaxify');

      apiCalls.postHoax = jest.fn().mockResolvedValue({});
      fireEvent.click(hoaxifyButton);

      expect(apiCalls.postHoax).toHaveBeenCalledWith({
        content: 'Test hoax content',
      });
    });
    it('returns back to unfocused state after successful postHoax action', async () => {
      const { queryByText } = setupFocused();
      fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

      const hoaxifyButton = queryByText('Hoaxify');

      apiCalls.postHoax = jest.fn().mockResolvedValue({});
      fireEvent.click(hoaxifyButton);

      await waitFor(() => {
        expect(queryByText('Hoaxify')).not.toBeInTheDocument();
      });
    });
    it('clear content after successful postHoax action', async () => {
      const { queryByText } = setupFocused();
      fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

      const hoaxifyButton = queryByText('Hoaxify');

      apiCalls.postHoax = jest.fn().mockResolvedValue({});
      fireEvent.click(hoaxifyButton);

      await waitFor(() => {
        expect(queryByText('Test hoax content')).not.toBeInTheDocument();
      });
    });
    it('clears content after clicking cancel', () => {
      const { queryByText } = setupFocused();
      fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

      fireEvent.click(queryByText('Cancel'));

      expect(queryByText('Test hoax content')).not.toBeInTheDocument();
    });
    it('disables Hoaxify button when there is postHoax api call', async () => {
      const { queryByText } = setupFocused();
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
      const { queryByText } = setupFocused();
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
      const { queryByText } = setupFocused();
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
      const { queryByText } = setupFocused();
      fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

      const hoaxifyButton = queryByText('Hoaxify');

      const mockFunction = jest.fn().mockRejectedValueOnce({
        response: {
          data: {
            validationErrors: {
              content: 'It must have minimum 10 and maximum 5000 characters',
            },
          },
        },
      });

      apiCalls.postHoax = mockFunction;
      fireEvent.click(hoaxifyButton);

      await waitFor(() => {
        expect(queryByText('Hoaxify')).not.toBeDisabled();
      });
    });
    it('enables Cancel button when postHoax api call fails', async () => {
      const { queryByText } = setupFocused();
      fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

      const hoaxifyButton = queryByText('Hoaxify');

      const mockFunction = jest.fn().mockRejectedValueOnce({
        response: {
          data: {
            validationErrors: {
              content: 'It must have minimum 10 and maximum 5000 characters',
            },
          },
        },
      });

      apiCalls.postHoax = mockFunction;
      fireEvent.click(hoaxifyButton);

      await waitFor(() => {
        expect(queryByText('Cancel')).not.toBeDisabled();
      });
    });
    it('enables Hoaxify button after successful postHoax action', async () => {
      const { queryByText } = setupFocused();
      fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

      const hoaxifyButton = queryByText('Hoaxify');

      apiCalls.postHoax = jest.fn().mockResolvedValue({});
      fireEvent.click(hoaxifyButton);
      await waitForElementToBeRemoved(hoaxifyButton);
      fireEvent.focus(textArea);
      await waitFor(() => {
        expect(queryByText('Hoaxify')).not.toBeDisabled();
      });
    });
    it('displays validation error for content', async () => {
      const { queryByText } = setupFocused();
      fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

      const hoaxifyButton = queryByText('Hoaxify');

      const mockFunction = jest.fn().mockRejectedValueOnce({
        response: {
          data: {
            validationErrors: {
              content: 'It must have minimum 10 and maximum 5000 characters',
            },
          },
        },
      });

      apiCalls.postHoax = mockFunction;
      fireEvent.click(hoaxifyButton);

      await waitFor(() => {
        expect(
          queryByText('It must have minimum 10 and maximum 5000 characters')
        ).toBeInTheDocument();
      });
    });
    it('clears validation error after clicking cancel', async () => {
      const { queryByText, findByText } = setupFocused();
      fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

      const hoaxifyButton = queryByText('Hoaxify');

      const mockFunction = jest.fn().mockRejectedValueOnce({
        response: {
          data: {
            validationErrors: {
              content: 'It must have minimum 10 and maximum 5000 characters',
            },
          },
        },
      });

      apiCalls.postHoax = mockFunction;
      fireEvent.click(hoaxifyButton);

      const error = await findByText(
        'It must have minimum 10 and maximum 5000 characters'
      );

      fireEvent.click(queryByText('Cancel'));

      expect(error).not.toBeInTheDocument();
    });
    it('clears validation error after content is changed', async () => {
      const { queryByText, findByText } = setupFocused();
      fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

      const hoaxifyButton = queryByText('Hoaxify');

      const mockFunction = jest.fn().mockRejectedValueOnce({
        response: {
          data: {
            validationErrors: {
              content: 'It must have minimum 10 and maximum 5000 characters',
            },
          },
        },
      });

      apiCalls.postHoax = mockFunction;
      fireEvent.click(hoaxifyButton);
      const error = await findByText(
        'It must have minimum 10 and maximum 5000 characters'
      );

      fireEvent.change(textArea, {
        target: { value: 'Test hoax content updated' },
      });

      expect(error).not.toBeInTheDocument();
    });
    it('displays file attachment input when text area focused', () => {
      const { container } = setup();
      const textArea = container.querySelector('textarea');
      fireEvent.focus(textArea);

      const uploadInput = container.querySelector('input');
      expect(uploadInput.type).toBe('file');
    });
    it('displays image component when file selected', async () => {
      apiCalls.postHoaxFile = jest.fn().mockResolvedValue({
        data: {
          id: 1,
          name: 'random-name.png',
        },
      });
      const { container } = setup();
      const textArea = container.querySelector('textarea');
      fireEvent.focus(textArea);

      const uploadInput = container.querySelector('input');
      expect(uploadInput.type).toBe('file');

      const file = new File(['dummy content'], 'example.png', {
        type: 'image/png',
      });
      fireEvent.change(uploadInput, { target: { files: [file] } });

      await waitFor(() => {
        const images = container.querySelectorAll('img');
        const attachmentImage = images[1];
        expect(attachmentImage.src).toContain('data:image/png;base64');
      });
    });
    it('removes selected image after clicking cancel', async () => {
      apiCalls.postHoaxFile = jest.fn().mockResolvedValue({
        data: {
          id: 1,
          name: 'random-name.png',
        },
      });
      const { queryByText, container } = setupFocused();

      const uploadInput = container.querySelector('input');
      expect(uploadInput.type).toBe('file');

      const file = new File(['dummy content'], 'example.png', {
        type: 'image/png',
      });
      fireEvent.change(uploadInput, { target: { files: [file] } });

      await waitFor(() => {
        const images = container.querySelectorAll('img');
        expect(images.length).toBe(2);
      });

      fireEvent.click(queryByText('Cancel'));
      fireEvent.focus(textArea);

      await waitFor(() => {
        const images = container.querySelectorAll('img');
        expect(images.length).toBe(1);
      });
    });
    it('calls postHoaxFile when file selected', async () => {
      apiCalls.postHoaxFile = jest.fn().mockResolvedValue({
        data: {
          id: 1,
          name: 'random-name.png',
        },
      });

      const { container } = setupFocused();

      const uploadInput = container.querySelector('input');
      expect(uploadInput.type).toBe('file');

      const file = new File(['dummy content'], 'example.png', {
        type: 'image/png',
      });
      fireEvent.change(uploadInput, { target: { files: [file] } });

      await waitFor(() => {
        const images = container.querySelectorAll('img');
        expect(images.length).toBe(2);
      });
      expect(apiCalls.postHoaxFile).toHaveBeenCalledTimes(1);
    });
    it('calls postHoaxFile with selected file', async () => {
      apiCalls.postHoaxFile = jest.fn().mockResolvedValue({
        data: {
          id: 1,
          name: 'random-name.png',
        },
      });

      const { container } = setupFocused();

      const uploadInput = container.querySelector('input');
      expect(uploadInput.type).toBe('file');

      const file = new File(['dummy content'], 'example.png', {
        type: 'image/png',
      });
      fireEvent.change(uploadInput, { target: { files: [file] } });

      await waitFor(() => {
        const images = container.querySelectorAll('img');
        expect(images.length).toBe(2);
      });

      const body = apiCalls.postHoaxFile.mock.calls[0][0];

      const readFile = () => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();

          reader.onloadend = () => {
            resolve(reader.result);
          };
          reader.readAsText(body.get('file'));
        });
      };

      const result = await readFile();

      expect(result).toBe('dummy content');
    });
    it('calls postHoax with hoax with file attachment object when clicking Hoaxify', async () => {
      apiCalls.postHoaxFile = jest.fn().mockResolvedValue({
        data: {
          id: 1,
          name: 'random-name.png',
        },
      });
      const { queryByText, container } = setupFocused();
      fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

      const uploadInput = container.querySelector('input');
      expect(uploadInput.type).toBe('file');

      const file = new File(['dummy content'], 'example.png', {
        type: 'image/png',
      });
      fireEvent.change(uploadInput, { target: { files: [file] } });

      await waitFor(() => {
        const images = container.querySelectorAll('img');
        expect(images.length).toBe(2);
      });

      const hoaxifyButton = queryByText('Hoaxify');

      apiCalls.postHoax = jest.fn().mockResolvedValue({});
      fireEvent.click(hoaxifyButton);

      expect(apiCalls.postHoax).toHaveBeenCalledWith({
        content: 'Test hoax content',
        attachment: {
          id: 1,
          name: 'random-name.png',
        },
      });
    });
    it('clears image after postHoax success', async () => {
      apiCalls.postHoaxFile = jest.fn().mockResolvedValue({
        data: {
          id: 1,
          name: 'random-name.png',
        },
      });
      const { queryByText, container } = setupFocused();
      fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

      const uploadInput = container.querySelector('input');
      expect(uploadInput.type).toBe('file');

      const file = new File(['dummy content'], 'example.png', {
        type: 'image/png',
      });
      fireEvent.change(uploadInput, { target: { files: [file] } });

      await waitFor(() => {
        const images = container.querySelectorAll('img');
        expect(images.length).toBe(2);
      });

      const hoaxifyButton = queryByText('Hoaxify');

      apiCalls.postHoax = jest.fn().mockResolvedValue({});
      fireEvent.click(hoaxifyButton);

      fireEvent.focus(textArea);
      await waitFor(() => {
        const images = container.querySelectorAll('img');
        expect(images.length).toBe(1);
      });
    });
    it('calls postHoax without file attachment after cancelling previous file selection', async () => {
      apiCalls.postHoaxFile = jest.fn().mockResolvedValue({
        data: {
          id: 1,
          name: 'random-name.png',
        },
      });
      const { queryByText, container } = setupFocused();
      fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

      const uploadInput = container.querySelector('input');
      expect(uploadInput.type).toBe('file');

      const file = new File(['dummy content'], 'example.png', {
        type: 'image/png',
      });
      fireEvent.change(uploadInput, { target: { files: [file] } });

      await waitFor(() => {
        const images = container.querySelectorAll('img');
        expect(images.length).toBe(2);
      });
      fireEvent.click(queryByText('Cancel'));
      fireEvent.focus(textArea);

      const hoaxifyButton = queryByText('Hoaxify');

      apiCalls.postHoax = jest.fn().mockResolvedValue({});
      fireEvent.change(textArea, { target: { value: 'Test hoax content' } });
      fireEvent.click(hoaxifyButton);

      expect(apiCalls.postHoax).toHaveBeenCalledWith({
        content: 'Test hoax content',
      });
    });
  });
});

console.error = () => {};

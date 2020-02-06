import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Modal from './Modal';

describe('Modal', () => {
  describe('Layout', () => {
    it('will be visible when visible property set to true', () => {
      const { queryByTestId } = render(<Modal visible={true} />);
      const modalRootDiv = queryByTestId('modal-root');
      expect(modalRootDiv).toHaveClass('modal fade d-block show');
      expect(modalRootDiv).toHaveStyle(`background-color: #000000b0`);
    });
    it('displays the title provided as prop', () => {
      const { queryByText } = render(<Modal title="Test Title" />);
      expect(queryByText('Test Title')).toBeInTheDocument();
    });
    it('displays the body provided as prop', () => {
      const { queryByText } = render(<Modal body="Test Body" />);
      expect(queryByText('Test Body')).toBeInTheDocument();
    });
    it('displays OK button text provided as prop', () => {
      const { queryByText } = render(<Modal okButton="OK" />);
      expect(queryByText('OK')).toBeInTheDocument();
    });
    it('displays Cancel button text provided as prop', () => {
      const { queryByText } = render(<Modal cancelButton="Cancel" />);
      expect(queryByText('Cancel')).toBeInTheDocument();
    });
    it('displays defaults for buttons when corresponding props not provided', () => {
      const { queryByText } = render(<Modal />);
      expect(queryByText('Ok')).toBeInTheDocument();
      expect(queryByText('Cancel')).toBeInTheDocument();
    });
    it('calls callback function provided as prop when clicking ok button', () => {
      const mockFn = jest.fn();
      const { queryByText } = render(<Modal onClickOk={mockFn} />);
      fireEvent.click(queryByText('Ok'));
      expect(mockFn).toHaveBeenCalled();
    });
    it('calls callback function provided as prop when clicking cancel button', () => {
      const mockFn = jest.fn();
      const { queryByText } = render(<Modal onClickCancel={mockFn} />);
      fireEvent.click(queryByText('Cancel'));
      expect(mockFn).toHaveBeenCalled();
    });
  });
});

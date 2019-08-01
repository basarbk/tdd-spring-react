import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ProfileImageWithDefault from './ProfileImageWithDefault';

describe('ProfileImageWithDefault', () => {
  describe('Layout', () => {
    it('has image', () => {
      const { container } = render(<ProfileImageWithDefault />);
      const image = container.querySelector('img');
      expect(image).toBeInTheDocument();
    });
    it('displays default image when image property not provided', () => {
      const { container } = render(<ProfileImageWithDefault />);
      const image = container.querySelector('img');
      expect(image.src).toContain('/profile.png');
    });
    it('displays user image when image property provided', () => {
      const { container } = render(
        <ProfileImageWithDefault image="profile1.png" />
      );
      const image = container.querySelector('img');
      expect(image.src).toContain('/images/profile/profile1.png');
    });
    it('displays default image when provided image loading fails', () => {
      const { container } = render(
        <ProfileImageWithDefault image="profile1.png" />
      );
      const image = container.querySelector('img');
      fireEvent.error(image);
      expect(image.src).toContain('/profile.png');
    });
    it('displays the image provided through src property', () => {
      const { container } = render(
        <ProfileImageWithDefault src="image-from-src.png" />
      );
      const image = container.querySelector('img');
      expect(image.src).toContain('/image-from-src.png');
    });
  });
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import MusicPlayer from '../components/component/MusicPlayer'; // Adjust path as needed

describe('MusicPlayer', () => {
  const mockProps = {
    currentSong: {
      title: 'Test Song',
      coverUrl: 'test-cover.jpg',
    },
    isPlaying: false,
    togglePlayPause: jest.fn(),
    currentTime: 45,
    duration: 120,
    formatTime: jest.fn((time) => `0:${time}`),
    handleSliderChange: jest.fn(),
    playPrevious: jest.fn(),
    playNext: jest.fn(),
    volume: 0.5,
    handleVolumeChange: jest.fn(),
    increaseVolume: jest.fn(),
    decreaseVolume: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders song title and cover image', () => {
    const { getByText, getByAltText } = render(<MusicPlayer {...mockProps} />);
    expect(getByText('Test Song')).toBeInTheDocument();
    expect(getByAltText('Cover for Test Song')).toBeInTheDocument();
  });

  it('renders play icon when not playing', () => {
    const { container } = render(<MusicPlayer {...mockProps} />);
    expect(container.querySelector('.icon')).toBeInTheDocument();
  });

  it('calls togglePlayPause when play/pause button is clicked', () => {
    const { container } = render(<MusicPlayer {...mockProps} />);
    const playButton = container.querySelector('.playIcon');
    fireEvent.click(playButton);
    expect(mockProps.togglePlayPause).toHaveBeenCalled();
  });

  it('calls playPrevious and playNext when buttons are clicked', () => {
    const { getAllByRole } = render(<MusicPlayer {...mockProps} />);
    const buttons = getAllByRole('button');
    fireEvent.click(buttons[1]); // Previous
    fireEvent.click(buttons[2]); // Next
    expect(mockProps.playPrevious).toHaveBeenCalled();
    expect(mockProps.playNext).toHaveBeenCalled();
  });

  it('calls handleSliderChange when progress slider is changed', () => {
    const { container } = render(<MusicPlayer {...mockProps} />);
    const slider = container.querySelector('.progress');
    fireEvent.change(slider, { target: { value: 60 } });
    expect(mockProps.handleSliderChange).toHaveBeenCalled();
  });

  it('calls handleVolumeChange when volume slider is changed', () => {
    const { container } = render(<MusicPlayer {...mockProps} />);
    const volumeSlider = container.querySelector('.volume-slider');
    fireEvent.change(volumeSlider, { target: { value: 0.7 } });
    expect(mockProps.handleVolumeChange).toHaveBeenCalled();
  });

  it('adjusts volume when "+" and "-" buttons are clicked', () => {
    const { getByText } = render(<MusicPlayer {...mockProps} />);
    fireEvent.click(getByText('+'));
    expect(mockProps.handleVolumeChange).toHaveBeenCalledWith({ target: { value: 0.6 } });

    fireEvent.click(getByText('-'));
    expect(mockProps.handleVolumeChange).toHaveBeenCalledWith({ target: { value: 0.4 } });
  });

  it('renders fallback title and image if currentSong is undefined', () => {
    const props = { ...mockProps, currentSong: undefined };
    const { getByText, getByAltText } = render(<MusicPlayer {...props} />);
    expect(getByText('Untitled')).toBeInTheDocument();
    expect(getByAltText('Cover for Untitled')).toBeInTheDocument();
  });
});
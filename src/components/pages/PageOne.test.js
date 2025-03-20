import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import PageOne from './PageOne';

npm install --save-dev jest @testing-library/react @testing-library/jest-dom
describe('PageOne Component', () => {
    test('renders MP3 Tag Processor heading', () => {
        render(<PageOne />);
        expect(screen.getByText('MP3 Tag Processor')).toBeInTheDocument();
    });

    test('displays error message for invalid file type', () => {
        render(<PageOne />);
        const fileInput = screen.getByLabelText(/file/i);
        const file = new File(['dummy content'], 'example.txt', { type: 'text/plain' });

        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(screen.getByText('Please upload a valid MP3 file.')).toBeInTheDocument();
    });

    test('displays tags for valid MP3 file', async () => {
        render(<PageOne />);
        const fileInput = screen.getByLabelText(/file/i);
        const file = new File(['dummy content'], 'example.mp3', { type: 'audio/mp3' });

        // Mock FileReader
        const fileReaderMock = {
            readAsArrayBuffer: jest.fn(),
            onload: null,
            result: new ArrayBuffer(8),
        };
        window.FileReader = jest.fn(() => fileReaderMock);

        // Mock jsmediatags
        jest.mock('jsmediatags', () => ({
            read: (buffer, callbacks) => {
                callbacks.onSuccess({
                    tags: {
                        title: 'Test Title',
                        artist: 'Test Artist',
                    },
                });
            },
        }));

        fireEvent.change(fileInput, { target: { files: [file] } });

        // Simulate FileReader onload
        fileReaderMock.onload();

        expect(await screen.findByText(/Tags for example.mp3:/)).toBeInTheDocument();
        expect(screen.getByText(/Test Title/)).toBeInTheDocument();
        expect(screen.getByText(/Test Artist/)).toBeInTheDocument();
    });
});

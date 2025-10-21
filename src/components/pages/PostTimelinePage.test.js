import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { act } from "react-dom/test-utils";
import PostTimelinePage from "./PostTimelinePage";

// Mock Firebase dependencies
jest.mock("../../firebase/firebase", () => ({
    db: jest.fn(),
}));
jest.mock("firebase/firestore", () => ({
    collection: jest.fn(),
    getDocs: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
}));

describe("PostTimelinePage Component", () => {
    it("renders loading skeletons while fetching posts", () => {
        render(
            <BrowserRouter>
                <PostTimelinePage />
            </BrowserRouter>
        );

        const skeletons = screen.getAllByClassName("skeleton-post");
        expect(skeletons.length).toBeGreaterThan(0);
    });

    it("renders posts after fetching data", async () => {
        const mockPosts = [
            {
                id: "1",
                username: "Test User",
                userProfilePicture: "/test-avatar.png",
                timestamp: new Date().toISOString(),
                content: "Test content",
                likesCount: 5,
                sharesCount: 2,
                fileUrl: null,
                fileType: null,
            },
        ];

        jest.spyOn(global, "fetch").mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockPosts),
        });

        await act(async () => {
            render(
                <BrowserRouter>
                    <PostTimelinePage />
                </BrowserRouter>
            );
        });

        const postContent = screen.getByText("Test content");
        expect(postContent).toBeInTheDocument();
    });

    it("handles like button click", async () => {
        const mockPosts = [
            {
                id: "1",
                username: "Test User",
                userProfilePicture: "/test-avatar.png",
                timestamp: new Date().toISOString(),
                content: "Test content",
                likesCount: 5,
                sharesCount: 2,
                fileUrl: null,
                fileType: null,
            },
        ];

        jest.spyOn(global, "fetch").mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockPosts),
        });

        await act(async () => {
            render(
                <BrowserRouter>
                    <PostTimelinePage />
                </BrowserRouter>
            );
        });

        const likeButton = screen.getByText("❤️ 5 Likes");
        fireEvent.click(likeButton);

        await waitFor(() => {
            expect(screen.getByText("❤️ 6 Likes")).toBeInTheDocument();
        });
    });

    it("handles share button click", async () => {
        const mockPosts = [
            {
                id: "1",
                username: "Test User",
                userProfilePicture: "/test-avatar.png",
                timestamp: new Date().toISOString(),
                content: "Test content",
                likesCount: 5,
                sharesCount: 2,
                fileUrl: null,
                fileType: null,
            },
        ];

        jest.spyOn(global, "fetch").mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockPosts),
        });

        await act(async () => {
            render(
                <BrowserRouter>
                    <PostTimelinePage />
                </BrowserRouter>
            );
        });

        const shareButton = screen.getByText("🔗 2 Shares");
        fireEvent.click(shareButton);

        await waitFor(() => {
            expect(screen.getByText("🔗 3 Shares")).toBeInTheDocument();
        });
    });

    it("navigates to post details on content click", async () => {
        const mockPosts = [
            {
                id: "1",
                username: "Test User",
                userProfilePicture: "/test-avatar.png",
                timestamp: new Date().toISOString(),
                content: "Test content",
                likesCount: 5,
                sharesCount: 2,
                fileUrl: null,
                fileType: null,
            },
        ];

        jest.spyOn(global, "fetch").mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockPosts),
        });

        const mockNavigate = jest.fn();
        jest.mock("react-router-dom", () => ({
            ...jest.requireActual("react-router-dom"),
            useNavigate: () => mockNavigate,
        }));

        await act(async () => {
            render(
                <BrowserRouter>
                    <PostTimelinePage />
                </BrowserRouter>
            );
        });

        const postContent = screen.getByText("Test content");
        fireEvent.click(postContent);

        expect(mockNavigate).toHaveBeenCalledWith("/view-post/1");
    });
});
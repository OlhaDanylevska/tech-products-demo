import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";

import { server } from "../../../setupTests";

import BookmarksPage from "./index.jsx";

describe("BookmarksPage", () => {
	it("shows bookmarked resources", async () => {
		const mockResources = [
			{
				id: "1",
				title: "Resource 1",
				url: "https://example.com/resource1",
				description: "Description of Resource 1",
			},
			{
				id: "2",
				title: "Resource 2",
				url: "https://example.com/resource2",
				description: "Description of Resource 2",
			},
		];
		const mockBookmarks = [{ resource_id: "1" }, { resource_id: "2" }];

		server.use(
			http.get("/api/resources", () => {
				return HttpResponse.json({
					resources: mockResources,
				});
			}),
			http.get("/api/bookmarks", () => {
				return HttpResponse.json(mockBookmarks);
			})
		);

		render(
			<MemoryRouter>
				<BookmarksPage />
			</MemoryRouter>
		);

		const resourceTitle = await screen.findByText(mockResources[0].title);
		const resourceDescription = await screen.findByText(
			mockResources[0].description
		);

		expect(resourceTitle).toBeInTheDocument();
		expect(resourceDescription).toBeInTheDocument();

		expect(
			screen.queryByText("You haven’t bookmarked any resources yet.")
		).not.toBeInTheDocument();
	});

	it("shows 'No bookmarked resources' message when there are no bookmarks", async () => {
		const mockResources = [
			{
				id: "1",
				title: "Hello",
				description: "This is a useful resource",
				url: "https://example.com",
			},
		];
		const mockBookmarks = [];

		server.use(
			http.get("/api/resources", () => {
				return HttpResponse.json({
					resources: mockResources,
				});
			}),
			http.get("/api/bookmarks", () => {
				return HttpResponse.json(mockBookmarks);
			})
		);

		render(
			<MemoryRouter>
				<BookmarksPage />
			</MemoryRouter>
		);

		const noBookmarksMessage = await screen.findByText(
			"You haven’t bookmarked any resources yet."
		);

		expect(noBookmarksMessage).toBeInTheDocument();

		expect(screen.queryByRole("list")).not.toBeInTheDocument();
	});
});

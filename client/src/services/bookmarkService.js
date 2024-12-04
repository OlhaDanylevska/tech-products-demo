export default class BookmarkService {
	static ENDPOINT = "/api/bookmarks";

	constructor(request = fetch) {
		this.fetch = request;
	}

	async getBookmarks() {
		const res = await this.fetch(BookmarkService.ENDPOINT);
		if (res.ok) {
			const bookmarks = await res.json();
			return bookmarks;
		}
		throw new Error("Failed to fetch bookmarks");
	}

	async addBookmark(resourceId) {
		const res = await this.fetch(BookmarkService.ENDPOINT, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ resourceId }),
		});
		if (res.ok) {
			return await res.json();
		} else if (res.status === 401 || res.status === 403) {
			throw new Error("User is not authorised to add bookmarks");
		}
		throw new Error(`Failed to add bookmark: ${res.statusText}`);
	}

	async removeBookmark(resourceId) {
		const res = await this.fetch(`${BookmarkService.ENDPOINT}/${resourceId}`, {
			method: "DELETE",
		});
		if (!res.ok) {
			throw new Error("Failed to remove bookmark");
		}
	}
}

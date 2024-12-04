import { randomUUID } from "node:crypto";

import { authenticateAs } from "../setupTests";

describe("/api/bookmarks", () => {
	describe("POST /", () => {
		it("adds a new bookmark", async () => {
			const {
				agent,
				user: { id: userId },
			} = await authenticateAs("user");
			const resourceId = randomUUID();

			const { body } = await agent
				.post("/api/bookmarks")
				.send({ resourceId })
				.set("User-Agent", "supertest")
				.expect(201);

			expect(body).toMatchObject({
				user_id: userId,
				resource_id: resourceId,
			});
		});

		it("prevents duplicate bookmarks", async () => {
			const { agent } = await authenticateAs("user");
			const resourceId = randomUUID();

			await agent
				.post("/api/bookmarks")
				.send({ resourceId })
				.set("User-Agent", "supertest")
				.expect(201);

			await agent
				.post("/api/bookmarks")
				.send({ resourceId })
				.set("User-Agent", "supertest")
				.expect(409, { message: "Bookmark already exists." });
		});

		it("rejects unauthenticated users", async () => {
			const { agent } = await authenticateAs("anonymous");
			await agent
				.post("/api/bookmarks")
				.send({ resourceId: randomUUID() })
				.set("User-Agent", "supertest")
				.expect(401, "Unauthorized");
		});
	});

	describe("DELETE /:id", () => {
		it("deletes an existing bookmark", async () => {
			const { agent } = await authenticateAs("user");
			const resourceId = randomUUID();

			await agent
				.post("/api/bookmarks")
				.send({ resourceId })
				.set("User-Agent", "supertest")
				.expect(201);

			await agent
				.delete(`/api/bookmarks/${resourceId}`)
				.set("User-Agent", "supertest")
				.expect(204);
		});
	});

	it("returns 404 for non-existent bookmark", async () => {
		const { agent } = await authenticateAs("user");
		await agent
			.delete(`/api/bookmarks/${randomUUID()}`)
			.set("User-Agent", "supertest")
			.expect(404, { message: "Bookmark not found." });
	});

	it("rejects unauthorized delete requests", async () => {
		const { agent } = await authenticateAs("anonymous");
		await agent
			.delete(`/api/bookmarks/${randomUUID()}`)
			.set("User-Agent", "supertest")
			.expect(401, "Unauthorized");
	});
});

describe("GET /", () => {
	it("retrieves all bookmarks for the user", async () => {
		const { agent, user } = await authenticateAs("user");
		const resourceIds = [randomUUID(), randomUUID(), randomUUID()];

		await Promise.all(
			resourceIds.map((resourceId) =>
				agent
					.post("/api/bookmarks")
					.send({ resourceId })
					.set("User-Agent", "supertest")
					.expect(201)
			)
		);

		const { body } = await agent
			.get("/api/bookmarks")
			.set("User-Agent", "supertest")
			.expect(200);

		expect(body).toHaveLength(3);
		body.forEach((bookmark) => {
			expect(bookmark).toHaveProperty("user_id", user.id);
			expect(resourceIds).toContain(bookmark.resource_id);
		});
	});

	it("returns an empty list if no bookmarks exist", async () => {
		const { agent } = await authenticateAs("user");
		const { body } = await agent
			.get("/api/bookmarks")
			.set("User-Agent", "supertest")
			.expect(200);

		expect(body).toHaveLength(0);
	});

	it("rejects unauthenticated users", async () => {
		const { agent } = await authenticateAs("anonymous");
		await agent
			.get("/api/bookmarks")
			.set("User-Agent", "supertest")
			.expect(401, "Unauthorized");
	});
});

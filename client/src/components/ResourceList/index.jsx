import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import Link from "react-dom";

import { BookmarkService, useService } from "../../services";
import BookmarkFlag from "../BookmarkFlag";

import "./ResourceList.scss";

export default function ResourceList({
	publish,
	resources = [],
	bookmarkedResources = [],
	setBookmarkedResources = () => {},
	onBookmarkToggle = () => {},
}) {
	const [bookmarkedResourceIds, setBookmarkedResourceIds] = useState({});
	const bookmarkService = useService(BookmarkService);

	useEffect(() => {
		try {
			if (Array.isArray(bookmarkedResources)) {
				const ids = {};
				bookmarkedResources.forEach((bookmark) => {
					if (bookmark && bookmark.resource_id) {
						ids[bookmark.resource_id] = true;
					}
				});
				setBookmarkedResourceIds(ids);
			} else {
				throw new Error(
					`Invalid bookmarkedResources format: ${JSON.stringify(bookmarkedResources)}`
				);
			}
		} catch (err) {
			throw new Error("Error updating bookmarked resources:", err);
		}
	}, [bookmarkedResources, resources]);

	const handleToggleBookmark = async (resourceId) => {
		try {
			if (bookmarkedResourceIds[resourceId]) {
				await bookmarkService.removeBookmark(resourceId);
				setBookmarkedResources((prev) =>
					prev.filter((bookmark) => bookmark.resource_id !== resourceId)
				);
				if (onBookmarkToggle) {
					onBookmarkToggle(resourceId);
				}
			} else {
				const newBookmark = await bookmarkService.addBookmark(resourceId);
				setBookmarkedResourceIds((prev) => ({ ...prev, [resourceId]: true }));
				setBookmarkedResources((prev) => [...prev, newBookmark]);
			}
		} catch (err) {
			throw new Error("Error toggling bookmark:", err);
		}
	};

	return (
		<ul className="resource-list">
			{resources.length === 0 ? (
				<li className="no-resources">
					<em>No resources to show.</em>
				</li>
			) : (
				resources.map((resource, index) => {
					if (!resource || !resource.id || !resource.title) {
						throw new Error(`Invalid resource at index ${index}:`, resource);
					}

					const { description, id, title, topic_name, url } = resource;

					return (
						<li
							key={id}
							className={
								bookmarkedResourceIds[id] ? "bookmarked" : "not-bookmarked"
							}
						>
							<div>
								<h3>
									<Link to={id && `/resource/${id}`}>{title}</Link>
								</h3>

								{topic_name && <span className="topic">{topic_name}</span>}
							</div>
							{description && (
								<p className="resource-description">{description}</p>
							)}
							<div>
								<a href={url} target="_blank" rel="noopener noreferrer">
									{formatUrl(url)}
								</a>
								{publish && (
									<button onClick={() => publish(id)}>Publish</button>
								)}
								<BookmarkFlag
									color={bookmarkedResourceIds[id] ? "black" : "white"}
									stroke="black"
									onClick={() => handleToggleBookmark(id)}
								/>
							</div>
						</li>
					);
				})
			)}
		</ul>
	);
}

ResourceList.propTypes = {
	publish: PropTypes.func,
	resources: PropTypes.arrayOf(
		PropTypes.shape({
			description: PropTypes.string,
			id: PropTypes.string.isRequired,
			title: PropTypes.string.isRequired,
			topic_name: PropTypes.string,
			url: PropTypes.string,
		})
	),
	bookmarkedResources: PropTypes.arrayOf(
		PropTypes.shape({
			resource_id: PropTypes.string,
		})
	).isRequired,
	setBookmarkedResources: PropTypes.func,
	onBookmarkToggle: PropTypes.func,
};

function formatUrl(url) {
	try {
		const host = new URL(url).host;
		return host.startsWith("www.") ? host.slice(4) : host;
	} catch (error) {
		throw new Error("Invalid URL:", url);
	}
}

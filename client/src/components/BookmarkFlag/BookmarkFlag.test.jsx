import { render, screen, fireEvent } from "@testing-library/react";

import BookmarkFlag from "./index.jsx";

describe("BookmarkFlag component", () => {
	it("renders the button", () => {
		render(<BookmarkFlag color="white" stroke="black" onClick={() => {}} />);
		const button = screen.getByRole("button", { name: /bookmark/i });
		expect(button).toBeInTheDocument();
	});

	it("toggles bookmark color between white and black on click", () => {
		let color = "white";
		const toggleColor = () => {
			color = color === "white" ? "black" : "white";
		};

		const { rerender } = render(
			<BookmarkFlag color={color} stroke="black" onClick={toggleColor} />
		);

		const button = screen.getByRole("button", { name: /bookmark/i });

		const svg = screen.getByTestId("bookmark-icon");

		expect(svg).toHaveStyle({ fill: "white" });

		fireEvent.click(button);

		color = "black";
		rerender(
			<BookmarkFlag color={color} stroke="black" onClick={toggleColor} />
		);

		expect(svg).toHaveStyle({ fill: "black" });

		fireEvent.click(button);

		color = "white";
		rerender(
			<BookmarkFlag color={color} stroke="black" onClick={toggleColor} />
		);

		expect(svg).toHaveStyle({ fill: "white" });
	});
});

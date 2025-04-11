import { createRoot } from "react-dom/client";
import "./index.css";
import HomePage from "./page/HomePage";
import { ThemeProvider } from "./components/theme-provider";

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error("Failed to find the root element");
}

createRoot(rootElement).render(
	<ThemeProvider>
		<HomePage />
	</ThemeProvider>,
);

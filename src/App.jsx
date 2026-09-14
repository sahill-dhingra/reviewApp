import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReviewPage from "./pages/ReviewPage";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/review/:businessId" element={<ReviewPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
import Header from "./components/Header";
import Footer from "./components/Footer";
import Main from "./components/Main";
import { ModelProvider } from "./context/ModelContext";
import ShinobiCodeLogo from "./assets/images/Shinobi_Code.png";
import "./App.css";

function App() {

	return (
		<ModelProvider>
			<div className="flex flex-col min-h-screen">
				<Header />
				<div className="flex justify-center my-6">
					<img className="h-13" src={ShinobiCodeLogo} alt="Shinobi Code" />
				</div>
				<main className="flex-1 w-full flex flex-col items-center">
					<div></div>
					<Main />

					<div className=""></div>
					<p className="py-6">
						Please visit our <a href="https://shinobicode.dev" className="hover:text-orange-400">documentation site</a> before geting started.
					</p>
				</main>
				<Footer />
			</div>
		</ModelProvider>
	);
}

export default App;

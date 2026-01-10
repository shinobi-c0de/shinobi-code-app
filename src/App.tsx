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
				<div className="flex justify-center my-6 px-10 md:px-0">
					<img className="h-13" src={ShinobiCodeLogo} alt="Shinobi Code" />
				</div>
				<main className="flex-1 w-full flex flex-col items-center px-10 md:px-0">
					
					<Main />
					<div className="flex md:hidden flex-1 items-center justify-center w-full">
						<h1 className="text-2xl font-bold text-center">Shinobi Code is not accessible on mobile devices</h1>
					</div>
					<div className="flex py-6 mt-auto">
						<p className="text-center">
							Please visit our <a href="https://shinobicode.dev" className="hover:text-orange-400">documentation site</a> before geting started.
						</p>
					</div>
				</main>
				<Footer />
			</div>
		</ModelProvider>
	);
}

export default App;

import { Icon } from "@iconify/react";
import Logo from "../assets/images/shinobi-code-logo-white.png";

export default function Header() {
	return (
		<header className="sticky top-0 z-50 w-full border-b border-white/10 bg-zinc-800">
			<div className="w-full px-6 md:px-12">
				<div className="flex h-14 items-center justify-between">
					{/* Left */}
					<div className="flex items-center gap-2 sm:gap-6">
						<img src={Logo} alt="Logo" className="w-16 h-auto" />
						<span className="text-2xl font-semibold text-white hover:text-orange-400 select-none">
							Shinobi Code
						</span>
					</div>

					{/* Right */}
					<a
						href="https://github.com/yourname/yourrepo"
						target="_blank"
						rel="noreferrer"
						className="text-white/70 hover:text-white transition hidden sm:block"
					>
						<Icon icon="mdi:github" width="28" height="28" />
					</a>
				</div>
			</div>
		</header>
	);
}

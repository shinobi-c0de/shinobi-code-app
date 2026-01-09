
export default function Footer() {
    return (
        <footer className="w-full pb-8">
            <div className="w-full px-6 md:px-12 py-4">
                <div className="flex items-center justify-center">
                    <p className="text-gray-400 text-sm font-bold text-center">
                        Built with ❤️ in this chaotic world<br />
                        Copyright &copy; {new Date().getFullYear()} <a className="hover:text-gray-300" href="https://github.com/shinobi-c0de">Shinobi Code</a>
                    </p>
                </div>
            </div>
        </footer>
    );
}

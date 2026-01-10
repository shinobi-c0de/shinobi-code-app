
//To send data to VS Code
export async function sendJutsu(jutsu: string, port: string) {
	const Data = JSON.stringify({ jutsu: jutsu });

	try {
		const response = await fetch(`http://localhost:${port}/sendJutsu`, {
			method: "POST", // Can be GET, PUT, DELETE etc.
			body: Data,
			headers: { "Content-Type": "application/json" }, // Specify content type
		});
		if (!response.ok) {
			throw new Error(`Error sending data: ${response.statusText}`);
		}
	} catch (error) {
		console.error("Error:", error);
	}
}
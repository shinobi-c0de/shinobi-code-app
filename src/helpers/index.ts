
export async function checkPort(port: string, expectedMessage: string) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2-second timeout

    try {
        const response = await fetch(`http://localhost:${port}/`, {
            signal: controller.signal,
        });
        clearTimeout(timeoutId); // Clear timeout if request succeeds

        if (!response.ok) {
            return "Closed"; // Handle non-200s
        }

        const data = await response.json();
        return data.message === expectedMessage ? "App" : "Unknown";
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            // Silence silent timeout
        }
        return "Closed";
    }
}

export function addLog(message: string) {
    const logs = document.getElementById("logs");
    if (!logs) {
        console.error("Logs element not found in the document.");
        return;
    }
    const logEntry = document.createElement("div");
    logEntry.classList.add("log-entry");

    const timeStamp = new Date().toLocaleTimeString();

    logEntry.textContent = `[${timeStamp}] : ${message}`;
    logs.appendChild(logEntry);
}

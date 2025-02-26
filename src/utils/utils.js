
import * as vision from '@mediapipe/tasks-vision'

const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;

//const logs = document.getElementById('logs');

export async function createFaceLandmarker() {
  try {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
  );
  let faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU"
    },
    //outputFaceBlendshapes: true,
    //runningMode,
    numFaces: 1
  });

  return faceLandmarker;
} catch (error) {
  console.error("Error initializing FaceLandmarker:", error);
}
}

export async function checkPort(port, expectedMessage) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000); // 2-second timeout

  try {
      let response = await fetch(`http://localhost:${port}/`, { signal: controller.signal });
      clearTimeout(timeoutId); // Clear timeout if request succeeds

      if (response.ok) {
          let data = await response.json();
          return data.message === expectedMessage ? 'App' : 'Unknown';
      }
  } catch (error) {
      if (error.name === 'AbortError') {
          console.error(`Endpoint: http://localhost:${port}/ timed out.`);
      } else {
          console.error("Port check failed:", error.message);
      }
      return 'Closed';
  }
}

export function addLog(message) {
  const logEntry = document.createElement('div');
  logEntry.classList.add('log-entry');

  const timeStamp = new Date().toLocaleTimeString();

  logEntry.textContent = `[${timeStamp}] : ${message}`;
  logs.appendChild(logEntry);
}





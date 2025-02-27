import { bootstrapCameraKit } from '@snap/camera-kit';

(async function () {
  const cameraKit = await bootstrapCameraKit({
    apiToken: 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzMyMjk5NzE5LCJzdWIiOiI2MGMzOWExZS02YjU1LTQ5NzktODkwZi02YjRlYmJmMDMyZjJ-U1RBR0lOR34wYTQxOWRkYy1mZDhiLTQ1YzEtOWRkNC0xNDBjNzBiNjRhNzgifQ.X7daj-HIZiossiqK2AIPXNOYU3V7kH7dnWR_ueqIZYU',
  });

  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.width = '640px'; // Fixed width
  container.style.height = '480px'; // Fixed height
  container.style.overflow = 'hidden'; // Prevent scaling outside
  container.style.border = '2px solid black';
  document.body.appendChild(container);

  const liveRenderTarget = document.createElement('canvas');
  liveRenderTarget.width = 640; // Ensure canvas matches container
  liveRenderTarget.height = 480;
  liveRenderTarget.style.position = 'absolute';
  liveRenderTarget.style.top = '0';
  liveRenderTarget.style.left = '0';
  liveRenderTarget.style.transition = 'transform 0.3s ease-in-out';
  liveRenderTarget.style.transformOrigin = 'center'; // Zoom towards the center
  container.appendChild(liveRenderTarget);

  const session = await cameraKit.createSession({ liveRenderTarget });
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });

  await session.setSource(mediaStream);
  await session.play();

  const lens = await cameraKit.lensRepository.loadLens(
    '43309500875',
    '005e1b2f-d2e9-49e9-b5b5-ef81cd066448'
  );

  await session.applyLens(lens);

  // Add button to capture photo
  let captureButton = document.getElementById('capture-button') as HTMLButtonElement;

  captureButton.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640; // Match fixed size
    canvas.height = 480;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(liveRenderTarget, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const anchor = document.createElement('a');
          const url = URL.createObjectURL(blob);
          anchor.href = url;
          anchor.download = 'captured-image.png';
          anchor.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    }
  });

  // Function to display live GPS coordinates
  const displayCoordinates = () => {
    const coordsDiv = document.createElement('div');
    coordsDiv.style.position = 'absolute';
    coordsDiv.style.top = '10px';
    coordsDiv.style.right = '10px';
    coordsDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    coordsDiv.style.color = 'white';
    coordsDiv.style.padding = '10px';
    coordsDiv.style.borderRadius = '8px';
    document.body.appendChild(coordsDiv);

    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          coordsDiv.innerText = `Latitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}`;
        },
        (error) => {
          console.error('Error fetching location:', error);
          coordsDiv.innerText = 'Unable to fetch location';
        },
        { enableHighAccuracy: true }
      );
    } else {
      coordsDiv.innerText = 'Geolocation not supported by this browser';
    }
  };

  // Display live coordinates
  displayCoordinates();
})();

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

  // Zoom Controls UI
  const zoomControls = document.createElement('div');
  zoomControls.style.position = 'absolute';
  zoomControls.style.bottom = '10px';
  zoomControls.style.left = '50%';
  zoomControls.style.transform = 'translateX(-50%)';
  zoomControls.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  zoomControls.style.padding = '10px';
  zoomControls.style.borderRadius = '8px';
  zoomControls.style.display = 'flex';
  zoomControls.style.alignItems = 'center';
  zoomControls.style.gap = '10px';
  document.body.appendChild(zoomControls);

  // Zoom Slider
  const zoomSlider = document.createElement('input');
  zoomSlider.type = 'range';
  zoomSlider.min = '1';
  zoomSlider.max = '3'; // Max zoom level
  zoomSlider.step = '0.1';
  zoomSlider.value = '1';
  zoomControls.appendChild(zoomSlider);

  // Reset Zoom Button
  const resetZoomButton = document.createElement('button');
  resetZoomButton.innerText = 'Reset Zoom';
  resetZoomButton.style.padding = '5px 10px';
  resetZoomButton.style.border = 'none';
  resetZoomButton.style.backgroundColor = '#fff';
  resetZoomButton.style.color = '#000';
  resetZoomButton.style.cursor = 'pointer';
  resetZoomButton.style.borderRadius = '5px';
  zoomControls.appendChild(resetZoomButton);

  // Handle Zoom Change
  zoomSlider.addEventListener('input', () => {
    const zoomLevel = parseFloat(zoomSlider.value);
    liveRenderTarget.style.transform = `scale(${zoomLevel})`;
  });

  // Reset Zoom
  resetZoomButton.addEventListener('click', () => {
    zoomSlider.value = '1';
    liveRenderTarget.style.transform = 'scale(1)';
  });

  // Capture Photo Button
  const captureButton = document.createElement('button');
  captureButton.innerText = 'Capture Photo';
  captureButton.style.position = 'absolute';
  captureButton.style.top = '10px';
  captureButton.style.left = '10px';
  captureButton.style.backgroundColor = '#fff';
  captureButton.style.padding = '8px 12px';
  captureButton.style.border = 'none';
  captureButton.style.borderRadius = '5px';
  captureButton.style.cursor = 'pointer';
  document.body.appendChild(captureButton);

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

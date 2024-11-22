import { bootstrapCameraKit } from '@snap/camera-kit';

(async function () {
  const cameraKit = await bootstrapCameraKit({
    apiToken: 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzMyMjk5NzE5LCJzdWIiOiI2MGMzOWExZS02YjU1LTQ5NzktODkwZi02YjRlYmJmMDMyZjJ-U1RBR0lOR34wYTQxOWRkYy1mZDhiLTQ1YzEtOWRkNC0xNDBjNzBiNjRhNzgifQ.X7daj-HIZiossiqK2AIPXNOYU3V7kH7dnWR_ueqIZYU',
  });

  const liveRenderTarget = document.getElementById('canvas') as HTMLCanvasElement;
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
  const captureButton = document.createElement('button');
  captureButton.innerText = 'Capture Photo';
  document.body.appendChild(captureButton);

  captureButton.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    const videoElement = liveRenderTarget as HTMLCanvasElement;
    canvas.width = videoElement.width;
    canvas.height = videoElement.height;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      // Convert canvas to image blob
      canvas.toBlob((blob) => {
        if (blob) {
          const anchor = document.createElement('a');
          const url = URL.createObjectURL(blob);
          anchor.href = url;
          anchor.download = 'captured-image.png'; // Default filename
          anchor.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    }
  });
})();
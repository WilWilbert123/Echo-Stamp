export const checkIsVideo = (uri) => {
  if (!uri || typeof uri !== 'string') return false;
  const url = uri.toLowerCase();
  return url.includes('/video/upload/') || url.endsWith('.mp4') || url.endsWith('.mov');
};


export const renderStreetViewHTML = (lat, lng, apikey) => `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no">
    <style>
      html, body, #pano { height: 100%; margin: 0; padding: 0; background-color: #000; }
      #loader {
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        text-align: center; color: white; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto;
        z-index: 10; transition: opacity 0.5s ease;
      }
      .spinner {
        border: 4px solid rgba(255, 255, 255, 0.1);
        border-left-color: #4285F4;
        border-radius: 50%; width: 40px; height: 40px;
        animation: spin 1s linear infinite; margin: 0 auto 15px;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <div id="loader">
      <div class="spinner"></div>
      <div id="status">Finding best view...</div>
    </div>
    <div id="pano"></div>

    <script src="https://maps.googleapis.com/maps/api/js?key=${apikey}"></script>
    <script>
      function calculateHeading(from, to) {
        if (!from || !to) return 0;
        const lat1 = from.lat() * Math.PI / 180;
        const lon1 = from.lng() * Math.PI / 180;
        const lat2 = to.lat * Math.PI / 180;
        const lon2 = to.lng * Math.PI / 180;
        const dLon = lon2 - lon1;
        const y = Math.sin(dLon) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
      }

      function init() {
        const loader = document.getElementById('loader');
        const status = document.getElementById('status');
        const sv = new google.maps.StreetViewService();
        const targetPoint = { lat: ${lat}, lng: ${lng} };

        sv.getPanorama({
          location: targetPoint,
          radius: 100,
          source: google.maps.StreetViewSource.OUTDOOR
        }, (data, statusResult) => {
          
          const panoOptions = {
            addressControl: false,
            fullscreenControl: false,
            motionTracking: true,
            motionTrackingControl: false,
            linksControl: true,
            panControl: true,
            zoomControl: true,
            clickToGo: true,
            enableCloseButton: false
          };

          if (statusResult === "OK") {
            const heading = calculateHeading(data.location.latLng, targetPoint);
            const panorama = new google.maps.StreetViewPanorama(
              document.getElementById('pano'), 
              { 
                ...panoOptions,
                position: data.location.latLng,
                pov: { heading: heading, pitch: 0 } 
              }
            );

            google.maps.event.addListenerOnce(panorama, 'status_changed', () => {
              loader.style.opacity = '0';
              setTimeout(() => loader.style.display = 'none', 500);
            });

          } else {
            status.innerHTML = "No road found. Using snapshot...";
            new google.maps.StreetViewPanorama(
              document.getElementById('pano'), 
              { ...panoOptions, position: targetPoint }
            );
            setTimeout(() => { loader.style.display = 'none'; }, 2000);
          }
        });
      }
      google.maps.event.addDomListener(window, 'load', init);
    </script>
  </body>
</html>
`;
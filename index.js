
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

async function initMap(enableClustering) {
    const allMarkers = [];
    const markers = [];
    var searchbox = document.getElementById('search-box');
    var searchAddressBox = document.getElementById('search-address');

    // Request needed libraries.
    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary(
      "marker",
    );
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 7,
      center: { lat: jsonData[0].GeoResult.Geometry.Location.Lat, lng: jsonData[0].GeoResult.Geometry.Location.Lng },
      mapId: "DEMO_MAP_ID",
    });
    const infoWindow = new google.maps.InfoWindow({
      content: "",
      disableAutoPan: true,
    });
    // Create an array of alphabetical characters used to label the markers.
    
    // Add some markers to the map.
    jsonData.map(person => {
        const location = { lat: person.GeoResult.Geometry.Location.Lat, lng: person.GeoResult.Geometry.Location.Lng };
    //   const pinGlyph = new google.maps.marker.PinElement({
    //     glyph: "label",
    //     glyphColor: "white",
    //   });
    const infoContent = `
                    <div>
                        <h4>${person.FirstName} ${person.LastName}</h4>
                        <p><strong>Address:</strong> ${person.Address || 'N/A'}</p>
                        <p><strong>City:</strong> ${person.City || 'N/A'}</p>
                        <p><strong>ZipCode:</strong> ${person.ZipCode || 'N/A'}</p>
                    </div>
                `;
      const marker = new google.maps.Marker({
        position: location,
        map: map,
        data: person
      });

      allMarkers.push({marker: marker, data: person});
      markers.push(marker);
  
      // markers can only be keyboard focusable when they have click listeners
      // open info window when marker is clicked
      marker.addListener("click", () => {
        infoWindow.setContent(infoContent);
        infoWindow.open(map, marker);
      });
      return marker;
    });
  
    // Add a marker clusterer to manage the markers.
    var markerCluster = new markerClusterer.MarkerClusterer({ markers, map, algorithm: enableClustering ? new markerClusterer.GridAlgorithm({}) : new markerClusterer.NoopAlgorithm()});
    
    var checkbox = document.getElementById('useCluster')
    checkbox.addEventListener('change', function() {
            initMap(this.checked);
            searchbox.className = this.checked ? "hidden" : "";
            searchbox.value = "";
            searchAddressBox.className = this.checked ? "hidden" : "";
            searchAddressBox.value = "";
      });

      searchbox.addEventListener('input', debounce(filterMarkers, 300));
      searchAddressBox.addEventListener('input', debounce(filterMarkers, 300));

      function filterMarkers(){
        const searchTerm = searchbox.value.toUpperCase();
        const searchAddressTerm = searchAddressBox.value.toUpperCase();

        // Clear existing markers
        markers.length = 0;

        var searchTermHasValue = searchTerm != null && searchTerm != undefined && searchTerm != '' && searchTerm != ' ';
        var searchAddressTermHasValue = searchAddressTerm != null && searchAddressTerm != undefined && searchAddressTerm != '' && searchAddressTerm != ' ';

        
        // Filter markers and re-add them to the cluster
        if(searchTermHasValue || searchAddressTermHasValue){
            allMarkers.forEach(({ marker, data }) => {
                if(searchTermHasValue && searchAddressTermHasValue) {
                    if (
                        (data.LastName.toUpperCase().includes(searchTerm) || data.FirstName.toUpperCase().includes(searchTerm)) 
                        && (data.Address.toUpperCase().includes(searchAddressTerm) || data.City.toUpperCase().includes(searchAddressTerm) || data.ZipCode.toUpperCase().includes(searchAddressTerm))
                        ) {
                        markers.push(marker);
                        marker.setMap(map);
                    }
                    else{
                        marker.setMap(null);
                    } 
                }
                else if (searchTermHasValue) {
                    if (data.LastName.toUpperCase().includes(searchTerm) || data.FirstName.toUpperCase().includes(searchTerm)) {
                        markers.push(marker);
                        marker.setMap(map);
                    }
                    else{
                        marker.setMap(null);
                    }
                }
                else if (searchAddressTermHasValue) {
                    if (data.Address.toUpperCase().includes(searchAddressTerm) || data.City.toUpperCase().includes(searchAddressTerm) || data.ZipCode.toUpperCase().includes(searchAddressTerm)) {
                        markers.push(marker);
                        marker.setMap(map);
                    }
                    else{
                        marker.setMap(null);
                    }
                }                
            });
        }
        else {
            allMarkers.forEach(({ marker, data }) => {
                markers.push(marker);
                marker.setMap(map);
             });
        }
           
        markerCluster = new markerClusterer.MarkerClusterer({ markers, map, algorithm: checkbox.checked ? new markerClusterer.GridAlgorithm({}) : new markerClusterer.NoopAlgorithm()});

      }

  }
  
  initMap();
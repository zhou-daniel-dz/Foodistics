import loadGoogleMapsApi from 'load-google-maps-api';
const API_KEY = 'AIzaSyC56u6DH0i0eCW4YhU1awRxP0PE46UZUVk';

// Loads and returns the Google Maps service instance when loaded
const getGoogleMapsService = async () => {
  return await loadGoogleMapsApi({ key: API_KEY, libraries: ['places'] })
};

// Retrieves nearby restaurants from the google_maps_service using provided location and radius
const getNearbyRestaurants = async (google_maps_service, location, radius) => {
  return new Promise((resolve, reject) => {
    const places_service = new google_maps_service.places.PlacesService(document.createElement('div'));
    const params = {
      location: new google_maps_service.LatLng(location.latitude, location.longitude),
      radius,
      openNow: true,
      type: ['restaurant'],
    };
    places_service.nearbySearch(params, (results) => {
      resolve(results);
    });
  });
}

// Retrieves relevant Place Details from the given place_id using the provided google_maps_service 
const getPlaceDetails = async (google_maps_service, place_id) => {
  return new Promise((resolve, reject) => {
    const places_service = new google_maps_service.places.PlacesService(document.createElement('div'));
    const params = {
      placeId: place_id,
      fields: ['name', 'rating', 'formatted_address', 'photo'],
    };
    places_service.getDetails(params, (result) => {
      resolve(result);
    });
  });
};

// Retrieves a DirectionsResult object from origin to destination using the provided google_maps_service
const getDirections = async (google_maps_service, origin, destination) => {
  return new Promise((resolve, reject) => {
    const directions_service = new google_maps_service.DirectionsService();
    origin = new google_maps_service.LatLng(origin.latitude, origin.longitude);
    const params = {
      origin,
      destination,
      travelMode: 'WALKING',
    };
    directions_service.route(params, (result) => {
      resolve(result);
    });
  });
};

export { getGoogleMapsService, getNearbyRestaurants, getPlaceDetails, getDirections };

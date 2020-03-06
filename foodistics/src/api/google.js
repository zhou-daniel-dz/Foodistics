import Axios from 'axios'

const API_KEY = 'AIzaSyC56u6DH0i0eCW4YhU1awRxP0PE46UZUVk';
const CORS_URL = 'https://cors-anywhere.herokuapp.com/';
const ROOT_URL = 'https://maps.googleapis.com';

// Returns a list of open places within the specified location and radius
const getPlaces = async (location, radius) => {
  const path = '/maps/api/place/nearbysearch/json';
  let res = await Axios({
    method: 'get',
    url: `${CORS_URL}${ROOT_URL}${path}`,
    params: {
      key: API_KEY,
      opennow: true,
      location: `${location.latitude},${location.longitude}`,
      radius,
      type: 'restaurant',
    },
  });
  return res.data;
}

// Returns place details for the specified place
const getPlaceDetails = async (place_id) => {
  const path = '/maps/api/place/details/json';
  let res = await Axios({
    method: 'get',
    url: `${CORS_URL}${ROOT_URL}${path}`,
    params: {
      key: API_KEY,
      place_id,
      fields: 'photo,name,formatted_address,geometry',
    },
  });
  return res.data;
}

// Returns the photo associated with the photo_reference
const getPhoto = async (photo_reference, size) => {
  const path = '/maps/api/place/photo';
  let res = await Axios({
    method: 'get',
    url: `${CORS_URL}${ROOT_URL}${path}`,
    params: {
      key: API_KEY,
      photo_reference,
      maxheight: size,
      maxwidth: size,
    },
  });
  return res.data;
}

export { getPlaces, getPlaceDetails, getPhoto };

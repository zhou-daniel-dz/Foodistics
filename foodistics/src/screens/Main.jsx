import React from 'react';
import { getLocation } from '../api/geolocator';
import { getPlaces, getPlaceDetails, getPhoto } from '../api/google';

class Main extends React.Component {
  constructor(props) {
    super(props);
  }

  getTopPlacesInformation = async () => {
    let location = await getLocation();
    let placeList = await getPlaces(location.coords, 1000);

    // Sort the places by rating
    let rankedPlaces = placeList.results.sort((a, b) => {
      if (a.rating <= b.rating) {
        return 1;
      }
      return -1;
    });

    let max_places = 8;
    let topPlacesInformation = [];
    for (const place of rankedPlaces) {
      if (max_places <= 0) {
        break;
      }
      const placeInformation = await getPlaceDetails(place.place_id);
      topPlacesInformation.push(placeInformation.result);
      max_places -= 1;
    }
    let testPhoto = await getPhoto(topPlacesInformation[0].photos[0].photo_reference, 500);
    console.log(topPlacesInformation);
    console.log(testPhoto);
  }

  render() {
    this.getTopPlacesInformation();
    return <h1>Hello, World</h1>;
  }
}

export default Main;
import React, { Component } from 'react';
import { getLocation } from '../api/geolocator';
import { getGoogleMapsService, getNearbyRestaurants, getPlaceDetails, getDirections } from '../api/google';

class Main extends Component {
  constructor(props) {
    super(props);
    // this.getTopPlacesInformation();
  }

  getTopPlacesInformation = async () => {
    let location = await getLocation();
    let google_maps_service = await getGoogleMapsService();
    let nearby_restaurants = await getNearbyRestaurants(google_maps_service, location.coords, '1000');

    // Sort the nearby restauraunts by rating
    nearby_restaurants = nearby_restaurants.sort(
      (a, b) => {
        if (a.rating <= b.rating) {
          return 1;
        }
        return -1;
      }
    );

    // Pull maximum 8 entries
    let max_restaurants = 8;
    let nearby_restaurant_info = [];
    nearby_restaurants.forEach((
      restaurant => {
        if (max_restaurants <= 0) {
          return;
        }
        nearby_restaurant_info.push(restaurant);
        max_restaurants -= 1;
      }
    ));

    // Retrieve relevant information for only the top 8 ranked entries
    nearby_restaurant_info = await Promise.all(nearby_restaurant_info.map(basic_data => {
      return getPlaceDetails(google_maps_service, basic_data.place_id);
    }));
  }

  render() {
    return <div>
      <h1>Hello, World</h1>
    </div>;
  }
}

export default Main;
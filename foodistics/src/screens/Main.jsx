import React, { Component } from 'react';
import GoogleMap from './GoogleMap';
import { getLocation } from '../api/geolocator';
import { getGoogleMapsService, getNearbyRestaurants, getPlaceDetails, getDirections } from '../api/google';
import Button from '@material-ui/core/Button';

const LOADING_STATES = {
  AWAITING_REQUEST: 'awaiting_request',
  RETRIEVING_NEARBY_RESTAURANTS: 'retrieving_nearby_restaurants',
  DONE: 'done',
}

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading_progress: LOADING_STATES.AWAITING_REQUEST,
      location: null,
      google_maps_service: null,
    }
    getLocation().then(location => this.setState({ location }));
    getGoogleMapsService().then(google_maps_service => this.setState({ google_maps_service }));
  }

  getTopPlacesInformation = async () => {
    this.setState({ loading_progress: LOADING_STATES.RETRIEVING_NEARBY_RESTAURANTS });
    let google_maps_service = await getGoogleMapsService();
    let nearby_restaurants = await getNearbyRestaurants(google_maps_service, this.state.location.coords, '1000');

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
    this.setState({ loading_progress: LOADING_STATES.DONE });
  }

  render() {
    const { google_maps_service, location } = this.state
    return <div>
      <Button variant="contained" color="primary" onClick={this.getTopPlacesInformation}>Eat Now!</Button>
      <span>{this.state.loading_progress}</span>
      {
        location && google_maps_service ?
          <GoogleMap google_maps_service={google_maps_service} retrieved_position={location.coords} /> : null
      }
    </div>;
  }
}

export default Main;
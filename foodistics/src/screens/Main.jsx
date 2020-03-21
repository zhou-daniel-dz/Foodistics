import React, { Component } from 'react';
import { shuffle } from 'lodash';
import GoogleMap from './GoogleMap';
import RestaurantTournament from './RestaurantTournament';
import { getLocation } from '../api/geolocator';
import { getGoogleMapsService, getNearbyRestaurants, getPlaceDetails, getDirections } from '../api/google';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';

const theme = createMuiTheme({
  overrides: {
    MuiButton: {
      root: {
        fontFamily: 'Poppins',
        fontWeight: 'normal',
        lineHeight: 'inherit',
      },
    },
  },
});

const STEPS = {
  AWAITING_START: {
    instructions: `We'll help you decide what to eat! 🍎`,
    submit_button_text: `Start`,
  },
  SELECTING_LOCATION: {
    instructions: `Drag the map to pinpoint your location`,
    submit_button_text: `Looks good`,
  },
  SELECTING_LOCATION_AGAIN: {
    instructions: `Try selecting another location. There weren't enough nearby restaurants...`,
    submit_button_text: `Looks good`,
  },
  RETRIEVING_RESTAURANTS: {
    instructions: `Retrieving nearby restaurants...`,
    submit_button_text: `This shouldn't exist`,
  },
  RESTAURANT_TOURNAMENT: {
    instructions: `Select the most appealing restaurant`,
    submit_button_text: `This shouldn't exist`,
  },
  RETRIEVING_DIRECTIONS: {
    instructions: `Calculating directions...`,
    submit_button_text: `This shouldn't exist`,
  },
  FINISHED_PRIMARY: {
    instructions: `You'll probably like this one best:`,
    submit_button_text: `See a close second`,
  },
  FINISHED_SECONDARY: {
    instructions: `You'll probably also like this one:`,
    submit_button_text: `Go back to first choice`,
  },
}

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showButton: true,
      showLoading: false,
      location: null,
      google_maps_service: null,
      step: STEPS.AWAITING_START,
      best_restaurant: null,
      runner_up_restaurant: null,
      primary_directions: null,
      secondary_directions: null,
    }
  }

  getTopPlacesInformation = async () => {
    let google_maps_service = await getGoogleMapsService();
    let nearby_restaurants = await getNearbyRestaurants(google_maps_service, this.state.location, '1400');

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
        nearby_restaurant_info.push({
          ...restaurant,
          photos: shuffle(restaurant.photos),
        });
        max_restaurants -= 1;
      }
    ));

    // Retrieve and return relevant information for only the top 8 ranked entries
    return await Promise.all(nearby_restaurant_info.map(basic_data => {
      return getPlaceDetails(google_maps_service, basic_data.place_id);
    }));
  }

  centerChanged = (location) => {
    this.setState({ location });
  }

  restaurantTournamentComplete = (best_restaurant, runner_up_restaurant) => {
    console.log(best_restaurant);
    console.log(runner_up_restaurant);
    this.setState({
      showLoading: true,
      showButton: false,
      best_restaurant,
      runner_up_restaurant,
      step: STEPS.RESTAURANT_TOURNAMENT,
    }, this.nextStep);
  }

  nextStep = async () => {
    switch (this.state.step) {
      case STEPS.AWAITING_START:
        this.setState({
          showButton: false,
        })
        const retrieved_location = (await getLocation()).coords;
        const retrieved_google_maps_service = await getGoogleMapsService();
        this.setState({
          showButton: true,
          location: retrieved_location,
          google_maps_service: retrieved_google_maps_service,
          step: STEPS.SELECTING_LOCATION,
          variable_content: <GoogleMap
            google_maps_service={retrieved_google_maps_service}
            retrieved_position={retrieved_location}
            centerChanged={this.centerChanged}
          />,
        });
        break;
      case STEPS.SELECTING_LOCATION_AGAIN:
        this.setState({
          showButton: false,
          showLoading: true,
          step: STEPS.RETRIEVING_RESTAURANTS,
        });
        const nearby_restaurant_info_again = await this.getTopPlacesInformation();
        if (nearby_restaurant_info_again <= 2) {
          // Not enough restaurants
          this.setState({
            step: STEPS.SELECTING_LOCATION_AGAIN,
            showButton: true,
            showLoading: false,
          });
          return;
        }
        this.setState({
          step: STEPS.RESTAURANT_TOURNAMENT,
          showLoading: false,
          variable_content: <RestaurantTournament
            onComplete={this.restaurantTournamentComplete}
            nearby_restaurants={nearby_restaurant_info_again}
            startLoad={() => this.setState({ showLoading: true })}
            endLoad={() => this.setState({ showLoading: false })}
          />,
        });
        break;
      case STEPS.SELECTING_LOCATION:
        this.setState({
          showButton: false,
          showLoading: true,
          step: STEPS.RETRIEVING_RESTAURANTS,
        });
        const nearby_restaurant_info = await this.getTopPlacesInformation();
        if (nearby_restaurant_info <= 2) {
          // Not enough restaurants
          this.setState({
            step: STEPS.SELECTING_LOCATION_AGAIN,
            showButton: true,
            showLoading: false,
          });
          return;
        }
        this.setState({
          step: STEPS.RESTAURANT_TOURNAMENT,
          showLoading: false,
          variable_content: <RestaurantTournament
            onComplete={this.restaurantTournamentComplete}
            nearby_restaurants={nearby_restaurant_info}
            startLoad={() => this.setState({ showLoading: true })}
            endLoad={() => this.setState({ showLoading: false })}
          />,
        });
        break;
      case STEPS.RESTAURANT_TOURNAMENT:
        const { google_maps_service, location, best_restaurant, runner_up_restaurant } = this.state;
        this.setState({
          step: STEPS.RETRIEVING_DIRECTIONS,
        });
        const primary_directions = await getDirections(google_maps_service, location, { placeId: best_restaurant.place_id });
        const secondary_directions = await getDirections(google_maps_service, location, { placeId: runner_up_restaurant.place_id });
        this.setState({
          primary_directions,
          secondary_directions,
          showLoading: false,
          showButton: true,
          step: STEPS.FINISHED_PRIMARY,
          variable_content:
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <span style={{ fontSize: 20, fontWeight: 'bold' }}>{best_restaurant.name}</span>
              <GoogleMap
                directions_only={true}
                directions={primary_directions}
                google_maps_service={google_maps_service}
                retrieved_position={location}
              />
            </div>,
        });
        break;
      case STEPS.FINISHED_PRIMARY:
        this.setState({
          step: STEPS.FINISHED_SECONDARY,
          variable_content:
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <span style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.runner_up_restaurant.name}</span>
              <GoogleMap
                directions_only={true}
                directions={this.state.secondary_directions}
                google_maps_service={this.state.google_maps_service}
                retrieved_position={this.state.location}
              />
            </div>,
        });
        break;
      case STEPS.FINISHED_SECONDARY:
        this.setState({
          step: STEPS.FINISHED_PRIMARY,
          variable_content:
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <span style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.best_restaurant.name}</span>
              <GoogleMap
                directions_only={true}
                directions={this.state.primary_directions}
                google_maps_service={this.state.google_maps_service}
                retrieved_position={this.state.location}
              />
            </div>,
        });
        break;
    }
  }

  render() {
    const { step, variable_content, showLoading, showButton } = this.state;
    return <div style={{
      marginTop: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <span style={{ fontSize: 120, userSelect: 'none' }}>Foodistics</span>
      <div style={{ height: 10, width: 576, marginBottom: 16 }}>
        {showLoading ? <LinearProgress /> : null}
      </div>
      <span style={{ fontSize: 16, marginBottom: 14, userSelect: 'none' }}>{step.instructions}</span>
      {variable_content}
      {showButton ?
        <ThemeProvider theme={theme}>
          <Button variant="contained" color="primary" onClick={() => this.nextStep()}>{step.submit_button_text}</Button>
        </ThemeProvider>
        : null}
    </div>;
  }
}

export default Main;
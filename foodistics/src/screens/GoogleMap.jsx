import React, { Component } from 'react';

class GoogleMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: null,
      source_marker: null,
    }
  }

  componentDidMount() {
    const { google_maps_service, retrieved_position } = this.props;
    const map_element = document.getElementById('map');
    const retrieved_position_latlng = new google_maps_service.LatLng(
      retrieved_position.latitude, retrieved_position.longitude
    );
    const map = new google_maps_service.Map(map_element, {
      zoom: 15,
      disableDefaultUI: true,
      center: retrieved_position_latlng,
    });
    const source_marker = new google_maps_service.Marker({
      position: retrieved_position_latlng,
      map,
    });
    this.setState({
      map,
    });
  }

  renderDirections() {
    const { google_maps_service, directions } = this.props;
    const { map } = this.state;
    if ( !directions ) {
      // If there are no directions to render, don't do anything
      return null;
    }
    let directions_renderer = new google_maps_service.DirectionsRenderer();
    directions_renderer.setMap(map);
    directions_renderer.setDirections(directions);
  }

  render() {
    this.renderDirections();
    return <div id='map' style={{ width: '400px', height: '300px' }}>
    </div>;
  }
}

export default GoogleMap;
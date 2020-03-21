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
    const { google_maps_service, retrieved_position, centerChanged, directions_only, directions } = this.props;
    const map_element = document.getElementById('map');
    const retrieved_position_latlng = new google_maps_service.LatLng(
      retrieved_position.latitude, retrieved_position.longitude
    );
    const map = new google_maps_service.Map(map_element, {
      zoom: 15,
      disableDefaultUI: true,
      center: retrieved_position_latlng,
    });

    if (!directions_only) {
      const source_marker = new google_maps_service.Marker({
        position: retrieved_position_latlng,
        map,
      });
      map.addListener('center_changed', () => {
        const map_center = map.getCenter();
        centerChanged({ latitude: map_center.lat(), longitude: map_center.lng() });
        source_marker.setPosition(map_center);
      });
      this.setState({ map });
    } else {
      let directions_renderer = new google_maps_service.DirectionsRenderer();
      directions_renderer.setMap(map);
      directions_renderer.setDirections(directions);
      this.setState({
        map,
        directions_renderer,
      });
    }
  }

  renderDirections = () => {
    const { directions, directions_only } = this.props;
    const { directions_renderer } = this.state;
    if ( !directions || !directions_only || !directions_renderer ) {
      return null;
    };
    directions_renderer.setDirections(directions);
  }

  render() {
    this.renderDirections();
    return <div id='map' style={{ width: 500, height: 300, marginBottom: 30, border: '2px solid red' }}>
    </div>;
  }
}

export default GoogleMap;
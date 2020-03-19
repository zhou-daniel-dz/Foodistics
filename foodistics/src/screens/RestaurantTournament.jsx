import React, { Component } from 'react';
import { shuffle } from 'lodash';
import Button from '@material-ui/core/Button';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  overrides: {
    MuiButton: {
      root: {
        marginTop: 30,
        fontFamily: 'Poppins',
        fontWeight: 'normal',
        lineHeight: 'inherit',
      },
    },
  },
});

class RestaurantTournament extends Component {
  constructor(props) {
    super(props);
    this.state = {
      round: 0,
      index: 0,
      nearby_restaurants: shuffle(props.nearby_restaurants),
      selected: null,
      photos_1: null,
      photos_2: null,
      second_place: null,
    };
  }

  componentDidMount() {
    this.loadPhotos();
  }

  loadPhotos = async () => {
    const { startLoad, endLoad, onComplete } = this.props;
    const { round, index, nearby_restaurants, second_place } = this.state;
    if (nearby_restaurants.length === 1) {
      // One restaurant means we've narrowed it down
      onComplete(nearby_restaurants[0], second_place);
    } else if (index + 1 >= nearby_restaurants.length) {
      // When we reach the end, we shuffle and start the next round
      this.setState({
        round: round + 1,
        index: 0,
        nearby_restaurants: shuffle(nearby_restaurants)
      },
        () => this.loadPhotos(),
      );
    } else {
      startLoad();
      let restaurant_photos = nearby_restaurants.slice(index, index + 2);
      restaurant_photos = await Promise.all(restaurant_photos.map(
        restaurant => {
          const photos_per_round = Math.floor(restaurant.photos.length / 3);
          return Promise.all(restaurant.photos.slice(round * photos_per_round, photos_per_round * (round + 1)).map(
            photo => photo.getUrl(),
          ))
        }
      ));
      this.setState({
        photos_1: restaurant_photos[0],
        photos_2: restaurant_photos[1],
      });
      endLoad();
    }
  }

  nextMatch = () => {
    const { index, selected, nearby_restaurants } = this.state;
    let new_nearby_restaurants = nearby_restaurants;
    new_nearby_restaurants.splice(selected === 1 ? index : index + 1, 1);
    if (nearby_restaurants.length === 2) {
      this.setState({
        second_place: selected === 1 ? nearby_restaurants[0] : nearby_restaurants[1]
      });
    }
    this.setState({
      nearby_restaurants: new_nearby_restaurants,
      index: index + 1,
      selected: null,
    }, () => {
      this.loadPhotos();
    });
  }

  render() {
    const { selected, photos_1, photos_2 } = this.state;
    return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Photo grid */}
      <div style={{ display: 'flex' }}>
        <div
          style={{ border: selected === 0 ? '4px solid blue' : 'none', width: 328, height: 324, marginRight: 40 }}
          onClick={() => this.setState({ selected: 0 })}>
          {
            photos_1 ?
              <GridList cellHeight={160} cols={2}>
                {photos_1.map((img, i) => (
                  <GridListTile key={img} cols={i === 0 ? 2 : 1}>
                    <img src={img} alt='' />
                  </GridListTile>
                ))}
              </GridList> : null
          }
        </div>
        <div
          style={{ border: selected === 1 ? '4px solid blue' : 'none', width: 328, height: 324 }}
          onClick={() => this.setState({ selected: 1 })}>
          {
            photos_2 ?
              <GridList cellHeight={160} cols={2}>
                {photos_2.map((img, i) => (
                  <GridListTile key={img} cols={i === 0 ? 2 : 1}>
                    <img src={img} alt='' />
                  </GridListTile>
                ))}
              </GridList> : null
          }
        </div>
      </div>

      <ThemeProvider theme={theme}>
        <Button
          variant="contained"
          color="primary"
          disabled={selected === null ? true : false}
          onClick={this.nextMatch}>
          This one seems better
					</Button>
      </ThemeProvider>
    </div>
  }
}

export default RestaurantTournament;
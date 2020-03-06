// getLocation asynchronously resolves your location which
//  provides coordinates and an accuracy confidence in metres
const getLocation = async () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(result => {
      resolve(result);
    });
  })
}

export { getLocation }

// const loc = JSON.parse(document.getElementById('map').dataset.locations);
// console.log(loc);

// var map = L.map('map').setView([51.505, -0.09], 13);
// L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   maxZoom: 19,
//   attribution:
//     '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
// }).addTo(map);

////// Doesn't WORK make sure to fix it later
const map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);
const locations = JSON.parse(
  document.getElementById('map').getAttribute('data-locations')
);

locations.forEach((location) => {
  const marker = L.marker([location.lat, location.lng]).addTo(map);
  marker.bindPopup(location.name);
});

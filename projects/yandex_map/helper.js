var coords;

function dateWrite() {
  var date = new Date();

  var day = date.getDate();

  if (day < 10) day = '0' + day;

  var month = date.getMonth() + 1;

  if (month < 10) month = '0' + month;

  var year = date.getFullYear(),
    d = day + '.' + month + '.' + year;

  return d;
}

function updateMarkers(coords) {
  
    // let closeBtn = document.body.querySelector('.close-btn')
    // let storageContent = localStorage.data ? JSON.parse(localStorage.data) : [];

    // storageContent.push({
    //   coords: coords,
    //   commentatorName: inputName.value,
    //   place: inputPlace.value,
    //   desc: inputDesc.value,
    // });

    // localStorage.data = JSON.stringify(storageContent)

    // closeBtn.click();

    // fillMarkers();

}

let fillMarkers = () => {
  let storageList = JSON.parse(localStorage.data);

  ymaps.clusterer.removeAll();
  let markers = [];

  for (let item of storageList) {
    if (markers.find( (element) => {
      return element.coords.join('') === item.coords.join('');
    })) {
      markers.find( (element) => {
        return element.coords.join('') === item.coords.join('');
      }).comment.push(
          {
            date: dateWrite(),
            author: item.commentatorName,
            place: item.place,
            desc: item.desc,
          }
      );
    }
    else {
      markers.push({
        coords: item.coords,
        comment: [{
          date: dateWrite(),
          author: item.commentatorName,
          place: item.place,
          desc: item.desc,
        }]
      });
    }
  }

  for (let marker of markers) {
    newMarker(marker.coords, marker.comment);
  }
}

async function newMarker(coords, comments = []) {
  var geocoder = new ymaps.geocode(coords, {results: 1});
  var address;
  await geocoder.then(
      (res) => {
        if (res.geoObjects.getLength()) {
          address = res.geoObjects.get(0).properties.get('name');
        }
      },
      function (error) {
        alert("Возникла ошибка: " + error.message);
      }
  )
  let placemark =  new ymaps.Placemark(coords,
      {
        address: address,
        comments: comments,
        coords: coords
      },
      {
        iconLayout: 'default#image',
        // iconImageHref: './placemark.png',
        iconImageSize: [23, 28],
        balloonLayout: 'my#layout',
      }
  )
  placemark.events.add('balloonopen',  function (e) {
    coords = placemark.geometry.getCoordinates();
    updateMarkers(coords);
  })
  ymaps.clusterer.add(placemark)
}

async function openPlacemarkBalloon(address) {
  ymaps.clusterer.balloon.close();

  let bal = ymaps.clusterer.getGeoObjects().filter(obj => obj.properties.get("address") == address)
  let comments = bal[0].properties.get('comments');

  await ymaps.myMap.balloon.open(coords, {
        address: address,
        comments: comments,
      },
      {
        layout: 'my#layout',
        address: address,
        comments: comments,
      },
  );
  updateMarkers( bal[0].geometry.getCoordinates());

}

export {
  dateWrite, updateMarkers, fillMarkers, newMarker, openPlacemarkBalloon
}
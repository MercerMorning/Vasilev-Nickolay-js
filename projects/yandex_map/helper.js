var coords;

function dateWrite() {
    var date = new Date();

    var day = date.getDate();

    if (day < 10) day = '0' + day;

    var month = date.getMonth() + 1;

    if (month < 10) month = '0' + month;

    var year = date.getFullYear();


    var d = day + '.' + month + '.' + year;
   
    return d;
}

function setButtons(coords) {
    coords = coords;
    let addBtn = document.body.querySelector('.add-btn'),
        closeBtn = document.body.querySelector('.close-btn'),
        inputName = document.body.querySelector('#inputName '),
        inputPlace = document.body.querySelector('#inputPlace'),
        inputDesc = document.body.querySelector('#inputDesc');
    
    addBtn.onclick = function () {
        
        if (inputName.value && inputPlace.value && inputDesc.value) {
            let storageContent = localStorage.data ? JSON.parse(localStorage.data) : [];
            
            storageContent.push({
                coords: coords,
                commentatorName: inputName.value,
                place: inputPlace.value,
                desc: inputDesc.value,
            });
            
            localStorage.data = JSON.stringify(storageContent)
            
            closeBtn.click();
            
            fillMarkers();
        }
    }

}

let fillMarkers = () => {
    let storageList = JSON.parse(localStorage.data);
    
    window.clusterer.removeAll();
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
        },
        {
            iconLayout: 'default#image',
            iconImageHref: './placemark.png',
            iconImageSize: [23, 28],
            balloonLayout: 'my#layout',
        }
    )
    placemark.events.add('balloonopen',  function (e) { 
        coords = placemark.geometry.getCoordinates();
        setButtons(coords);
    })
    window.clusterer.add(placemark)
}

async function openPlacemarkBalloon(address) {
    window.clusterer.balloon.close();

    let bal = window.clusterer.getGeoObjects().filter(obj => obj.properties.get("address") == address)
    let comments = bal[0].properties.get('comments');
    
    await window.myMap.balloon.open(coords, {
        contentHeader: address,
        contentFooter: comments,
        address: address,
        comments: comments,
    },
    { 
        layout: 'my#layout',
        address: address,
        comments: comments,
    },
    );
    setButtons( bal[0].geometry.getCoordinates());

}

export {
    dateWrite, setButtons, fillMarkers, newMarker, openPlacemarkBalloon
}
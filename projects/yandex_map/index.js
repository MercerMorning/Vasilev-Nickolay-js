import ymaps from 'ymaps';
import { updateMarkers, fillMarkers, openPlacemarkBalloon } from './helper';

ymaps.load('https://api-maps.yandex.ru/2.1/?apikey=4040c59a-ba5a-403b-8e3a-7b3a6ac9f8a9&lang=ru_RU').then(maps => {
  maps.ready(init(maps));
});

function init(ymaps){

  var coords,
      customItemContentLayout = ymaps.templateLayoutFactory.createClass(
          ` 
            <div class="clusterer-baloon">
            <a href='#' class="clusterer-address" data-address="{{ geoObject.properties.address }}">
                {{ properties.address|raw }}
            </a>
            {% if comments %}
                {% for comment in comments %}
                    <b>{{ comment.author }}</b>
                    <b>{{ comment.date }}</b>
                    <span>{{ comment.place }}</span>
                    <p>{{ comment.desc }}</p>
                {% endfor %}
            {% elseif (properties.comments) %}
                    {% for comment in properties.comments %}
                        <b>{{ comment.author }}</b>
                        <b>{{ comment.date }}</b>
                        <span>{{ comment.place }}</span>
                        <p>{{ comment.desc }}</p>
                    {% endfor %}
                    {% else %} 
                        нет комментириев 
                    {% endif %}
            </div>`
      ),
      myBalloonLayout = ymaps.templateLayoutFactory.createClass(
          `<div class="balloonContainer">
            <div class="balloonHeader"> 
              <p class="address">
                {% if address %}
                    $[address]
                {% else %}
                    $[properties.address]
                {% endif %}
              </p>
              <i class="fas fa-times close-btn"></i>
            </div>
            <div class="balloonContent">
            <div class="comments">
            {% if comments %}
            {% for comment in comments %}
                <b>{{ comment.author }}</b>
                <b>{{ comment.date }}</b>
                <span>{{ comment.place }}</span>
                <p>{{ comment.desc }}</p>
            {% endfor %}
        {% elseif (properties.comments) %}
                {% for comment in properties.comments %}
                    <b>{{ comment.author }}</b>
                    <b>{{ comment.date }}</b>
                    <span>{{ comment.place }}</span>
                    <p>{{ comment.desc }}</p>
                {% endfor %}
                {% else %} 
                    нет комментириев 
                {% endif %}
            </div>
            <h3>Ваш отзыв</h3>
            <input type="text" id='inputName' placeholder="Ваше имя">
            <input type="text" id='inputPlace' placeholder="Укажите место">
            <input type="text" id='inputDesc' placeholder="Поделитесь впечатлениями">
            {% if coords %}
              <input type="hidden" id='coords' name="coords" value={{ coords }}>
            {% else %} 
            <input type="hidden" id='coords' name="coords" value=$[properties.coords]> 
            {% endif %}
            </div>
            <div class="balloonFooter">
                <button class="add-btn">Добавить</button>
            </div>
            </div>`
      );

  ymaps.layout.storage.add('my#layout', myBalloonLayout);
  ymaps.layout.storage.add('my#itemlayout', customItemContentLayout);

  ymaps.clusterer = new ymaps.Clusterer({
    clusterDisableClickZoom: true,
    clusterOpenBalloonOnClick: true,
    clusterBalloonContentLayout: 'cluster#balloonCarousel',
    clusterBalloonItemContentLayout: 'my#itemlayout',
  });

  ymaps.myMap = new ymaps.Map("map", {
    center: [55.76, 37.64],
    zoom: 7,
    controls: ['zoomControl'],
    behaviors: ['drag']
  });

  ymaps.myMap.events.add('click', async function (e) {
    if (!ymaps.myMap.balloon.isOpen()) {
      coords = e.get('coords');
      let geocoder = new ymaps.geocode(coords, {results: 1}),
          address;
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
      await ymaps.myMap.balloon.open(coords, {
            address: address,
            coords: coords,
          },
          {
            layout: 'my#layout',
            address: address,
          },
      );
      // updateMarkers(coords);

    }
    else {
      ymaps.myMap.balloon.close();
    }

  });

  document.addEventListener('click', (e) => {
    let target = e.target,
        inputName,
        inputPlace,
        inputDesc,
        inputCoords;

    if ( target.className === 'clusterer-address' ) {
      openPlacemarkBalloon(e.target.dataset.address)
    }

    if ( target.classList.contains("close-btn")) {
      ymaps.myMap.balloon.close();
    }

    if ( target.classList.contains("add-btn")) {
      inputName = document.body.querySelector('#inputName '),
      inputPlace = document.body.querySelector('#inputPlace'),
      inputDesc = document.body.querySelector('#inputDesc');
      inputCoords = document.body.querySelector('#coords');
      console.log(inputName)
      if (inputName.value && inputPlace.value && inputDesc.value) {
          updateMarkers(inputCoords.value.split(','), inputName.value, inputPlace.value, inputDesc.value)
      }
    }
  });

  ymaps.myMap.geoObjects.add(ymaps.clusterer)

  fillMarkers()
}


import './index.html'
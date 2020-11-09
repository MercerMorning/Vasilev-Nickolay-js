    ymaps.ready(init);
     
    window.addEventListener('storage', function(e) {  
        console.log(e.key);
      });

    const storage = localStorage;

    // storage.clear()

    var myMap,
        addBtn,
        closeBtn,
        inputName,
        inputPlace,
        inputDesc,
        coords,
        clusterer,
        markers;

    let placemarks = [];

    function setButtons(coords) {
        addBtn = document.body.querySelector('.add-btn')
        closeBtn = document.body.querySelector('.close-btn')
        inputName = document.body.querySelector('#inputName ')
        inputPlace = document.body.querySelector('#inputPlace')
        inputDesc = document.body.querySelector('#inputDesc')
        
        addBtn.onclick = function () {
            
            if (inputName.value && inputPlace.value && inputDesc.value) {
                let storageContent = storage.data ? JSON.parse(storage.data) : [];
                
                storageContent.push({
                    coords: coords,
                    commentatorName: inputName.value,
                    place: inputPlace.value,
                    desc: inputDesc.value,
                });
                
                console.log(storageContent)
                storage.data = JSON.stringify(storageContent)
                
                closeBtn.click();
                // newMarker(coords)
                
                fillMarkers();
                clusterer.add(placemarks);
            }
        }

        closeBtn.onclick = function () {
            myMap.balloon.close()
        }
    }

    let fillMarkers = () => {
        let storageList = JSON.parse(storage.data);
        
        clusterer.removeAll();
        placemarks = [];
        console.log(placemarks)
        markers = [];

        for (item of storageList) {
          if (markers.find( (element) => {
              return element.coords.join('') === item.coords.join('');
          })) {
              markers.find( (element) => {
                  return element.coords.join('') === item.coords.join('');
              }).comment.push(
                  {
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
                  author: item.commentatorName,
                  place: item.place,
                  desc: item.desc,
              }]
            });
          }
        }
      
      
        for (let marker of markers) {
          // console.log(marker)
          placemarks.push(newMarker(marker.coords, marker.comment));
          // myMap.geoObjects.add(newMarker(marker.coords, marker.comment))
        }
    }

    function newMarker(coords, comments = []) {
        var geocoder = new ymaps.geocode(coords, {results: 1});
            var address;
            geocoder.then(
                (res) => {
                    if (res.geoObjects.getLength()) {
                        address = res.geoObjects.get(0).properties.get('name');
                        // console.log(address)
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
                balloonLayout: 'my#layout',
            }
        )
        placemark.events.add('balloonopen',  function (e) { 
            coords = placemark.geometry.getCoordinates();
            setButtons(coords);
        })
        return placemark;
        // myMap.geoObjects.add(placemark);
    }

    function init(){
        // Создание карты.
        myMap = new ymaps.Map("map", {
            center: [55.76, 37.64],
            zoom: 7,
            controls: ['zoomControl'],
            behaviors: ['drag']
        });
        
        

        var myBalloonLayout = ymaps.templateLayoutFactory.createClass(
            `<div class="balloonContainer">
            <div class="balloonHeader"> 
            <p class="address">
            {% if contentHeader %}
                $[contentHeader]
            {% else %}
                $[properties.address]
            {% endif %}
            </p><i class="fas fa-times close-btn"></i>
            </div>
            <div class="balloonContent">
            <div class="comments">
                {% if properties.comments %} 
                {% for comment in properties.comments %}
                    <b>{{ comment.author }}</b>
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
            </div>
            <div class="balloonFooter">
                <button class="add-btn">Добавить</button>
            </div>
            </div>`
        );

        ymaps.layout.storage.add('my#layout', myBalloonLayout);

        myMap.events.add('click', async function (e) {
            if (!myMap.balloon.isOpen()) {
                coords = e.get('coords');
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

                await myMap.balloon.open(coords, {
                    contentHeader: address,
                },
                { 
                    layout: 'my#layout',
                    address: address,
                },
                );
                setButtons(coords);
                
                
            }
            else {
                myMap.balloon.close();
            }

          
        });

        var customBalloonContentLayout = ymaps.templateLayoutFactory.createClass([
            '<ul class=list>',
            // Выводим в цикле список всех геообъектов.
            '{% for geoObject in properties.geoObjects %}',
                '<li>', 
                    '<a href=# data-placemarkid="{{ geoObject.properties.placemarkId }}" class="list_item">',
                        '{{ geoObject }}',
                    '</a>',
                '</li>',
            '{% endfor %}',
            '</ul>'
        ].join(''));

        clusterer = new ymaps.Clusterer({
            clusterDisableClickZoom: true,
            clusterOpenBalloonOnClick: true,
            clusterBalloonContentLayout: customBalloonContentLayout
        });
        // for (let placemark in placemarks) {
        //     console.log(placema)
        // }

        

        myMap.geoObjects.add(clusterer)


        //   myMap.panTo(point.geometry.getCoordinates());

        
          
        fillMarkers()
        //   myMap.geoObjects.add(placemarks)
        
        clusterer.add(placemarks)
        // clusterer.events.add('balloonopen', function(e) {
        //     e.preventDefault();
        //     alert(123)
        // });
        // clusterer.balloon.open(clusterer.getClusters()[0]);
    }

    

   
    // document.body.onmousemove = (e) => console.log(e)
    
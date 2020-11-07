  // Функция ymaps.ready() будет вызвана, когда
    // загрузятся все компоненты API, а также когда будет готово DOM-дерево.
    ymaps.ready(init);
    function init(){
        // Создание карты.
        var myMap = new ymaps.Map("map", {
            center: [55.76, 37.64],
            zoom: 7,
            controls: ['zoomControl'],
            behaviors: ['drag']
        });
        
        var storage = localStorage;

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
                var coords = e.get('coords');
                var geocoder = new ymaps.geocode(coords, {results: 1});
                var address;
                await geocoder.then(
                    (res) => {
                        if (res.geoObjects.getLength()) {
                            // var point = res.geoObjects.get(0);
                            // console.log(res.geoObjects.get(0).properties.getAll())
                            address = res.geoObjects.get(0).properties.get('name');
                            // console.log(address)
                            // myMap.panTo(point.geometry.getCoordinates());
                        }
                    },
                    function (error) {
                    alert("Возникла ошибка: " + error.message);
                    }
                )

                // var myBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
                //     '<div class="myBalloon">' +
                //     '<h3>$[contentHeader]</h3>' +
                //     '<p><strong>Адрес:</strong> $[contentBody]</p>' +
                //     '<button>Добавить</button>' +
                //     '</div>'
                // );

                // var myBalloonCloseLayout = ymaps.templateLayoutFactory.createClass(
                //     '<button>close</button>'
                // );

               
                // ymaps.layout.storage.add('my#contentlayout', myBalloonContentLayout);
                // ymaps.layout.storage.add('my#contentCloselayout', myBalloonCloseLayout);

                await myMap.balloon.open(coords, {
                    contentHeader: address,
                },
                { 
                    layout: 'my#layout',
                    address: address,
                    // contentLayout: 'my#contentlayout',
                    // closeButtonLayout:  'my#contentCloselayout',
                },
                );

                
                var addBtn = document.body.querySelector('.add-btn');
                var closeBtn = document.body.querySelector('.close-btn');
                var inputName = document.body.querySelector('#inputName ');
                var inputPlace = document.body.querySelector('#inputPlace');
                var inputDesc = document.body.querySelector('#inputDesc');
                
                // storage.clear()

                addBtn.onclick = function () {
                
                    if (inputName.value && inputPlace.value && inputDesc.value) {
                        let storageContent = storage.data ? JSON.parse(storage.data) : [];
                        storageContent.push({
                            coords: coords,
                            commentatorName: inputName.value,
                            place: inputPlace.value,
                            desc: inputDesc.value,
                        });
                        storage.data = JSON.stringify(storageContent)
                        closeBtn.click();
                        newMarker(coords)
                    }
                }

                closeBtn.onclick = function () {
                    myMap.balloon.close()
                }

            }
            else {
                myMap.balloon.close();
            }

          
        });


        //   myMap.panTo(point.geometry.getCoordinates());
          let storageList = JSON.parse(storage.data);

          let markers = []

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
          let placemarks = [];
          for (let marker of markers) {
            // console.log(marker)
            placemarks.push(newMarker(marker.coords, marker.comment));
            // myMap.geoObjects.add(newMarker(marker.coords, marker.comment))
          }
        //   myMap.geoObjects.add(placemarks)
        //   console.log(markers)
        //   console.log(storageList)
        
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
                var addBtn = document.body.querySelector('.add-btn');
                var closeBtn = document.body.querySelector('.close-btn');
                var inputName = document.body.querySelector('#inputName ');
                var inputPlace = document.body.querySelector('#inputPlace');
                var inputDesc = document.body.querySelector('#inputDesc');
                
                // storage.clear()

                addBtn.onclick = function () {
                
                    if (inputName.value && inputPlace.value && inputDesc.value) {
                        let storageContent = storage.data ? JSON.parse(storage.data) : [];
                        storageContent.push({
                            coords: coords,
                            commentatorName: inputName.value,
                            place: inputPlace.value,
                            desc: inputDesc.value,
                        });
                        storage.data = JSON.stringify(storageContent)
                        closeBtn.click();
                        newMarker(coords, )
                    }
                }

                closeBtn.onclick = function () {
                    myMap.balloon.close()
                }
             })
             return placemark;
            // myMap.geoObjects.add(placemark);
        }

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

        var clusterer = new ymaps.Clusterer({
            clusterDisableClickZoom: true,
            clusterOpenBalloonOnClick: true,
            clusterBalloonContentLayout: customBalloonContentLayout
        });
        // for (let placemark in placemarks) {
        //     console.log(placema)
        // }
        console.log(placemarks)

        

        myMap.geoObjects.add(clusterer)
        clusterer.add(placemarks)
        // clusterer.events.add('balloonopen', function(e) {
        //     e.preventDefault();
        //     alert(123)
        // });
        // clusterer.balloon.open(clusterer.getClusters()[0]);
    }

    

   
    // document.body.onmousemove = (e) => console.log(e)
    
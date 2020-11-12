
import { dateWrite } from './helper';
import ymaps from 'ymaps';

ymaps.load('https://api-maps.yandex.ru/2.1/?apikey=4040c59a-ba5a-403b-8e3a-7b3a6ac9f8a9&lang=ru_RU').then(maps => {
    maps.ready(init(maps));
});

    function init(ymaps){
        window.addEventListener('storage', function(e) {  
            console.log(e.key);
          });
    
        const storage = localStorage;
    
        // storage.clear()
    
        var myMap,
            prevBtn,
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
            console.log(storageList)
    
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
                    // iconImageHref: './placemark.png',
                    iconImageSize: [23, 28],
                    balloonLayout: 'my#layout',
                }
            )
            placemark.events.add('balloonopen',  function (e) { 
                coords = placemark.geometry.getCoordinates();
                setButtons(coords);
            })
            // placemark.balloon.open()
            clusterer.add(placemark)
            return placemark;
        }

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
            {% if contentFooter %}
                {% for comment in contentFooter %}
                    <b>{{ comment.author }}</b>
                    <b>{{ comment.date }}</b>
                    <span>{{ comment.place }}</span>
                    <p>{{ comment.desc }}</p>
                {% endfor %}
            {% else %}
                {% if properties.comments %} 
                    {% for comment in properties.comments %}
                        <b>{{ comment.author }}</b>
                        <b>{{ comment.date }}</b>
                        <span>{{ comment.place }}</span>
                        <p>{{ comment.desc }}</p>
                    {% endfor %}
                    {% else %} 
                        нет комментириев 
                    {% endif %}
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
                console.timeLog(address)
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
            // Выводим в цикле список всех геообъектов.
            
            `
            <div class="balloonClaster">
                {% for geoObject in properties.geoObjects %}
                    <div class="balloonContainer baloon-slide">
                        <div class="balloonHeader"> 
                            <p class="address">
                                {{ geoObject.properties.address }}
                            </p>
                            <i class="fas fa-times close-btn"></i>
                        </div>
                        <div class="balloonContent">
                            <div class="comments">
                                {% if geoObject.properties.comments %} 
                                    {% for comment in geoObject.properties.comments %}
                                        <b>{{ comment.author }}</b>
                                        <span>{{ comment.place }}</span>
                                        <p>{{ comment.desc }}</p>
                                    {% endfor %}
                                {% else %} 
                                    нет комментириев 
                                {% endif %}
                            </div>     
                        </div>
                        
                   </div>
                   
                
                {% endfor %}
                <div class="actions">
                    <button class='previous-slide'>Предыдущий</button>
                   <button class='next-slide'>Следующий</button>
                </div>
            </div>
            `

            
        ].join(''));

        function setSlideButtons() {
            let addressLinks = document.body.querySelectorAll('.clusterer-address');
            let clustererBaloon = document.body.querySelector('.clusterer-baloon');
            console.log(clustererBaloon)
            clustererBaloon.addEventListener("DOMSubtreeModified", function() {
                alert(123)
              });
            document.getElementById("demo1").addEventListener("DOMSubtreeModified", function() {
                document.getElementById("demo2").innerHTML = "demo1 Changed!"
              });
            for (let addressLink of addressLinks) {
                console.log(addressLink)
                addressLink.addEventListener('click', function() {
                    openPlacemarkBalloon(addressLink.dataset.address)
                })
            }

                // console.log(balloonClaster.firstElementChild)
            // currentSlide.classList.add('active')
                
            // nextBtn = document.body.querySelector('.next-slide')
            
            // actionsContainer.addEventListener('click', (e) => {
            //     if (e.target.className == 'next-slide' && currentSlide.nextElementSibling && currentSlide.nextElementSibling.classList.contains('baloon-slide')) {
            //         console.log(currentSlide.nextElementSibling)
            //         currentSlide.classList.remove('active');
            //         currentSlide.nextElementSibling.classList.add('active')
            //         currentSlide = currentSlide.nextElementSibling;
            //     } else {
            //         currentSlide.classList.remove('active');
            //         currentSlide = balloonClaster.firstElementChild;
            //         currentSlide.nextElementSibling.classList.add('active')
            //     }
            //     if (e.target.className == 'previous-slide' && currentSlide.previousElementSibling && currentSlide.previousElementSibling.classList.contains('baloon-slide')) {
            //         currentSlide.classList.remove('active');
            //         currentSlide.previousElementSibling.classList.add('active')
            //         currentSlide = currentSlide.previousElementSibling;
            //     } else {
            //         // currentSlide.classList.remove('active');
            //         // currentSlide = balloonClaster.lastElementChild;
            //         // currentSlide.previousElementSibling.classList.add('active')
            //     }
            // })
        }

        var customItemContentLayout = ymaps.templateLayoutFactory.createClass(
            // The "raw" flag means that data is inserted "as is" without escaping HTML.
            ` 
            <div class="clusterer-baloon">
            <a href='#' class="clusterer-address" data-address="{{ geoObject.properties.address }}">
            {{ properties.address|raw }}
            </a>
            {% if contentFooter %}
                {% for comment in contentFooter %}
                    <b>{{ comment.author }}</b>
                    <b>{{ comment.date }}</b>
                    <span>{{ comment.place }}</span>
                    <p>{{ comment.desc }}</p>
                {% endfor %}
            {% else %}
                {% if properties.comments %} 
                    {% for comment in properties.comments %}
                        <b>{{ comment.author }}</b>
                        <b>{{ comment.date }}</b>
                        <span>{{ comment.place }}</span>
                        <p>{{ comment.desc }}</p>
                    {% endfor %}
                    {% else %} 
                        нет комментириев 
                    {% endif %}
                {% endif %}
            </div>`
        );

        clusterer = new ymaps.Clusterer({
            clusterDisableClickZoom: true,
            clusterOpenBalloonOnClick: true,
            clusterBalloonContentLayout: 'cluster#balloonCarousel',
            clusterBalloonItemContentLayout: customItemContentLayout,
            // clusterBalloonLayout: customBalloonContentLayout
        });
        for (let geoObject in myMap.geoObjects.properties) {
            console.log(geoObject)
        }  

        clusterer.events.add('balloonopen', function (e) {
           setSlideButtons()
        });

        myMap.geoObjects.add(clusterer)

        fillMarkers()

        async function openPlacemarkBalloon(address) {
            clusterer.balloon.close();
    
            let bal = clusterer.getGeoObjects().filter(obj => obj.properties.get("address") == address)
            let comments = bal[0].properties.get('comments');
            
            await myMap.balloon.open(coords, {
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
    
            
            // let bal = clusterer.getGeoObjects().filter(obj => obj.properties.get("address") == address)
            // let error = true;
            // while(error) {
            //     try {
                    // myMap.setCenter(bal[0].geometry.getCoordinates());
            //         bal[0].balloon.open()
            //         error = false;
            //     } catch {
            //         myMap.setZoom( myMap.getZoom() + 1 );
            //         continue;
            //     }
            // }
            
            
            
            // bal[0].balloon.open();
        }
    }

    import './index.html'
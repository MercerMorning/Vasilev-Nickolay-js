    ymaps.ready(init);
     
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

        for (item of storageList) {
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
                balloonLayout: 'my#layout',
            }
        )
        placemark.events.add('balloonopen',  function (e) { 
            coords = placemark.geometry.getCoordinates();
            setButtons(coords);
        })
        clusterer.add(placemark)
    }

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
    

    function init(){
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
                $[properties.address]
            </p><i class="fas fa-times close-btn"></i>
            </div>
            <div class="balloonContent">
            <div class="comments">
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
                    address: [address],
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
                    <a class='previous-slide'>Предыдущий</a>
                   <a class='next-slide'>Следующий</a>
                </div>
            </div>
            `

            
        ].join(''));

        function setSlideButtons() {
            let nextBtn = document.body.querySelector('.next-slide'),
                prevBtn = document.body.querySelector('.previous-slide'),
                balloonClaster = document.body.querySelector('.balloonClaster');
                currentSlide =  balloonClaster.firstElementChild,
                actionsContainer = document.body.querySelector('.actions');

                // console.log(balloonClaster.firstElementChild)
            currentSlide.classList.add('active')
                
            nextBtn = document.body.querySelector('.next-slide')
            
            actionsContainer.addEventListener('click', (e) => {
                if (e.target.className == 'next-slide' && currentSlide.nextElementSibling.classList.contains('baloon-slide')) {
                    console.log(currentSlide.nextElementSibling)
                    currentSlide.classList.remove('active');
                    currentSlide.nextElementSibling.classList.add('active')
                    currentSlide = currentSlide.nextElementSibling;
                }
                if (e.target.className == 'previous-slide' && currentSlide.previousElementSibling.classList.contains('baloon-slide')) {
                    currentSlide.classList.remove('active');
                    currentSlide.previousElementSibling.classList.add('active')
                    currentSlide = currentSlide.previousElementSibling;
                }
            })
        }

        clusterer = new ymaps.Clusterer({
            clusterDisableClickZoom: true,
            clusterOpenBalloonOnClick: true,
            clusterBalloonLayout: customBalloonContentLayout
        });
        for (let geoObject in myMap.geoObjects.properties) {
            console.log(placemark)
        }  

        clusterer.events.add('balloonopen', function (e) {
           setSlideButtons()
        });

        myMap.geoObjects.add(clusterer)

        fillMarkers()
    }

    

   
    // document.body.onmousemove = (e) => console.log(e)
    
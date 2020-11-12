
import { setButtons, fillMarkers, openPlacemarkBalloon } from './helper';
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
    
        var customItemContentLayout = ymaps.templateLayoutFactory.createClass(
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

            var coords;

            window.clusterer = new ymaps.Clusterer({
                clusterDisableClickZoom: true,
                clusterOpenBalloonOnClick: true,
                clusterBalloonContentLayout: 'cluster#balloonCarousel',
                clusterBalloonItemContentLayout: customItemContentLayout,
            });

      
    
        

        window.myMap = new ymaps.Map("map", {
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

      

        window.myMap.events.add('click', async function (e) {
            if (!window.myMap.balloon.isOpen()) {
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
                await window.myMap.balloon.open(coords, {
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
                window.myMap.balloon.close();
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

        document.addEventListener('click', (e) => {
            let target = e.target;
    
            if ( target.className === 'clusterer-address' ) {
                openPlacemarkBalloon(e.target.dataset.address)
            }

            if ( target.classList.contains("close-btn")) {
                window.myMap.balloon.close();
            }
        });

        
        
        for (let geoObject in window.myMap.geoObjects.properties) {
            console.log(geoObject)
        }  

        window.myMap.geoObjects.add(window.clusterer)

        fillMarkers()

        
    }

    
    import './index.html'
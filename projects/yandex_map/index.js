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
        

        myMap.events.add('click', async function (e) {
            if (!myMap.balloon.isOpen()) {
                var coords = e.get('coords');
                var geocoder = new ymaps.geocode(coords, {results: 1});
                var address;
                await geocoder.then(
                    (res) => {
                        if (res.geoObjects.getLength()) {
                            // var point = res.geoObjects.get(0);
                            address = res.geoObjects.get(0).properties.get('name');
                            console.log(address)
                            // myMap.panTo(point.geometry.getCoordinates());
                        }
                    },
                    function (error) {
                    alert("Возникла ошибка: " + error.message);
                    }
                )
                myMap.balloon.open(coords, {
                    contentHeader:address,
                    contentBody: [
                        '<input type="text" placeholder="Укажите ваше имя">',
                        '<br>',
                        '<input type="text" placeholder="Укажите место">',
                        '<br>',
                        '<textarea placeholder="Оставьте отзыв"></textarea>'
                    ].join(''),
                    contentFooter:'<button>Добавить</button>'
                });
            }
            else {
                myMap.balloon.close();
            }
        });
    }

   
    // document.body.onmousemove = (e) => console.log(e)
    
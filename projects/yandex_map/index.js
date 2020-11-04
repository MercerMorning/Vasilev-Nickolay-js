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
                            console.log(res.geoObjects.get(0).properties.getAll())
                            address = res.geoObjects.get(0).properties.get('name');
                            console.log(address)
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

                var myBalloonLayout = ymaps.templateLayoutFactory.createClass(
                    `<div class="balloonContainer">
                    <div class="balloonHeader"> 
                    <p class="address">${address}</p><i class="fas fa-times close-btn"></i>
                    </div>
                    <div class="balloonContent">
                    <h3>Ваш отзыв</h3>
                    <input type="text" placeholder="Ваше имя">
                    <input type="text" placeholder="Укажите место">
                    <input type="text" placeholder="Поделитесь впечатлениями">
                    </div>
                    <div class="balloonFooter">
                        <button class="addButton">Добавить</button>
                    </div>
                    </div>`
                );
     
                ymaps.layout.storage.add('my#layout', myBalloonLayout);
                // ymaps.layout.storage.add('my#contentlayout', myBalloonContentLayout);
                // ymaps.layout.storage.add('my#contentCloselayout', myBalloonCloseLayout);
                
                await myMap.balloon.open(coords, {
                    layout: 'my#contentlayout',
                    contentHeader:address,
                    contentBody: [
                        '<input type="text" placeholder="Укажите ваше имя">',
                        '<br>',
                        '<input type="text" placeholder="Укажите место">',
                        '<br>',
                        '<textarea placeholder="Оставьте отзыв"></textarea>'
                    ].join(''),
                    contentFooter:'<button>Добавить</button>'
                },
                { 
                    layout: 'my#layout',
                    // contentLayout: 'my#contentlayout',
                    // closeButtonLayout:  'my#contentCloselayout',
                },
                );

                var closeBtn = document.body.querySelector('.close-btn');
                closeBtn.onclick = function () {
                    myMap.balloon.close()
                }

               
            }
            else {
                myMap.balloon.close();
            }
        });
    }

   
    // document.body.onmousemove = (e) => console.log(e)
    
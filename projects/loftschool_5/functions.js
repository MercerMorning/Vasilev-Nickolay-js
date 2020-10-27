/* ДЗ 5 - Асинхронность и работа с сетью */

/*
 Задание 1:

 Функция должна возвращать Promise, который должен быть разрешен через указанное количество секунд

 Пример:
   delayPromise(3) // вернет promise, который будет разрешен через 3 секунды
 */
function delayPromise(seconds) {
  return new Promise((resolve) => {
    setTimeout(() => 
      resolve()
    , seconds * 1000);
  });
}

/*
 Задание 2:

 2.1: Функция должна вернуть Promise, который должен быть разрешен с массивом городов в качестве значения

 Массив городов можно получить отправив асинхронный запрос по адресу
 https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json

 2.2: Элементы полученного массива должны быть отсортированы по имени города

 Пример:
   loadAndSortTowns().then(towns => console.log(towns)) // должна вывести в консоль отсортированный массив городов
 */
function loadAndSortTowns() {
  // return fetch('https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json').then(response => {
  //   let responseResult = response.json();
  //   return responseResult.sort((a, b) => a.name > b.name ? 1 : -1).map((currentValue) => currentValue['name']);
  // });
  return new Promise( (resolve, reject) => {
    let xhr = new XMLHttpRequest();
  
    xhr.open('GET', 'https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json', false);
    xhr.send();

    if (xhr.status >= 400) {
      reject(xhr.response);
    } else {
      resolve(JSON.parse(xhr.responseText).sort((a, b) => a.name > b.name ? 1 : -1).map((currentValue) => currentValue['name']))
    }
  })
  
}

console.log(loadAndSortTowns());

export { delayPromise, loadAndSortTowns };

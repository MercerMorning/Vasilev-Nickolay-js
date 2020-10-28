/*
 Страница должна предварительно загрузить список городов из
 https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json
 и отсортировать в алфавитном порядке.

 При вводе в текстовое поле, под ним должен появляться список тех городов,
 в названии которых, хотя бы частично, есть введенное значение.
 Регистр символов учитываться не должен, то есть "Moscow" и "moscow" - одинаковые названия.

 Во время загрузки городов, на странице должна быть надпись "Загрузка..."
 После окончания загрузки городов, надпись исчезает и появляется текстовое поле.

 Разметку смотрите в файле towns.html

 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер

 *** Часть со звездочкой ***
 Если загрузка городов не удалась (например, отключился интернет или сервер вернул ошибку),
 то необходимо показать надпись "Не удалось загрузить города" и кнопку "Повторить".
 При клике на кнопку, процесс загрузки повторяется заново
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то дабавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */

// import './towns.html';

const homeworkContainer = document.querySelector('#homework-container');

/*
 Функция должна вернуть Promise, который должен быть разрешен с массивом городов в качестве значения

 Массив городов пожно получить отправив асинхронный запрос по адресу
 https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json
 */
function loadTowns() {
  // return fetch('https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json')
  // return fetch('https://raw.githubusercontent.com/smfelukov/citiesTest/master/cities.json')
  // .then(response => response.json())
  //   .then(response => response.sort((a, b) => a.name > b.name ? 1 : -1));
  return new Promise( (resolve, reject) => {
    let xhr = new XMLHttpRequest();
    try {
      xhr.open('GET', 'https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json', false);
      xhr.send();
      resolve(JSON.parse(xhr.responseText));
    } catch (e) {
      resolve('error');
    }
  })
}


/*
 Функция должна проверять встречается ли подстрока chunk в строке full
 Проверка должна происходить без учета регистра символов

 Пример:
   isMatching('Moscow', 'moscow') // true
   isMatching('Moscow', 'mosc') // true
   isMatching('Moscow', 'cow') // true
   isMatching('Moscow', 'SCO') // true
   isMatching('Moscow', 'Moscov') // false
 */
function isMatching(full, chunk) {
  if (full.toUpperCase().indexOf(chunk.toUpperCase()) >= 0) {
    return true;
  }
  return false;
}

/* Блок с надписью "Загрузка" */
// const loadingBlock = homeworkContainer.querySelector('#loading-block');
/* Блок с надписью "Не удалось загрузить города" и кнопкой "Повторить" */
const loadingFailedBlock = homeworkContainer.querySelector('#loading-failed');
/* Кнопка "Повторить" */
const retryButton = homeworkContainer.querySelector('#retry-button');
/* Блок с текстовым полем и результатом поиска */
const filterBlock = homeworkContainer.querySelector('#filter-block');
/* Текстовое поле для поиска по городам */
const filterInput = homeworkContainer.querySelector('#filter-input');
/* Блок с результатами поиска */
const filterResult = homeworkContainer.querySelector('#filter-result');

retryButton.addEventListener('click', () => {
  loadingFailedBlock.style.display = 'none';
  
});

filterInput.addEventListener('input', function (e) {
  filterResult.innerHTML = '<div id="loading-block">Загрузка...</div>';
  let symb = this.value;
  loadTowns().then( function (resolve)  {    
    if (resolve == 'error') {
      loadingFailedBlock.style.display = 'block';
      filterResult.innerHTML = '';
      return resolve;
    } else {
      filterResult.innerHTML = resolve
      .filter(element => isMatching(element.name, symb))
      .map(element => element.name)
      .join('<br>');
    };
    // if (filterResult.innerHTML = resolve.filter(element => isMatching(element.name, symb)).map(element => element.name).join('<br>')) {
    //   return resolve;
    // } else {
    //   return 'нет совпадений';
    // }
  });
  
});



loadingFailedBlock.classList.add('hidden');
filterBlock.classList.add('hidden');

export { loadTowns, isMatching };

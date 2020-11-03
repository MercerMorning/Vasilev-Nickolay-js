/* Задание со звездочкой */

/*
 Создайте страницу с кнопкой.
 При нажатии на кнопку должен создаваться div со случайными размерами, цветом и позицией на экране
 Необходимо предоставить возможность перетаскивать созданные div при помощи drag and drop
 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
import './dnd.html';

const homeworkContainer = document.querySelector('#app');

document.addEventListener('mousemove', (e) => {
  if (e.target.classList.contains('draggable-div')) {
    let div = e.target;
    e.target.addEventListener('dragover', (e) => {
      div.style.left = e.pageX - div.offsetWidth / 2 + 'px';
      div.style.top = e.pageY - div.offsetHeight / 2 + 'px';
    });
  }
});

export function createDiv() {
  let div = document.createElement('div'),
  size = () => getRandomArbitrary(1, 100),
  randomColor = () => '#' + (Math.random().toString(16) + '000000').substring(2,8).toUpperCase(),
  left = () => Math.floor(Math.random() * (window.innerWidth - size())),
  top = () => Math.floor(Math.random() * (window.innerHeight - size()));
  div.classList.add('draggable-div');
  div.setAttribute('style',
    `width:${size()}px;
    height:${size()}px;
    position: absolute;
    left:${left()}px;
    top:${top()}px;
    background-color: ${randomColor()}`
  );
  return div;
}

const addDivButton = homeworkContainer.querySelector('#addDiv');

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

addDivButton.addEventListener('click', function () {
  let div = createDiv();
  homeworkContainer.appendChild(div)
});


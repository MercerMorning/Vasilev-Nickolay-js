/*
 ДЗ 7 - Создать редактор cookie с возможностью фильтрации

 7.1: На странице должна быть таблица со списком имеющихся cookie. Таблица должна иметь следующие столбцы:
   - имя
   - значение
   - удалить (при нажатии на кнопку, выбранная cookie удаляется из браузера и таблицы)

 7.2: На странице должна быть форма для добавления новой cookie. Форма должна содержать следующие поля:
   - имя
   - значение
   - добавить (при нажатии на кнопку, в браузер и таблицу добавляется новая cookie с указанным именем и значением)

 Если добавляется cookie с именем уже существующей cookie, то ее значение в браузере и таблице должно быть обновлено

 7.3: На странице должно быть текстовое поле для фильтрации cookie
 В таблице должны быть только те cookie, в имени или значении которых, хотя бы частично, есть введенное значение
 Если в поле фильтра пусто, то должны выводиться все доступные cookie
 Если добавляемая cookie не соответствует фильтру, то она должна быть добавлена только в браузер, но не в таблицу
 Если добавляется cookie, с именем уже существующей cookie и ее новое значение не соответствует фильтру,
 то ее значение должно быть обновлено в браузере, а из таблицы cookie должна быть удалена

 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

import './cookie.html';

/*
 app - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
const homeworkContainer = document.querySelector('#homework-container');
// текстовое поле для фильтрации cookie
const filterNameInput = homeworkContainer.querySelector('#filter-name-input');
// текстовое поле с именем cookie
const addNameInput = homeworkContainer.querySelector('#add-name-input');
// текстовое поле со значением cookie
const addValueInput = homeworkContainer.querySelector('#add-value-input');
// кнопка "добавить cookie"
const addButton = homeworkContainer.querySelector('#add-button');
// таблица со списком cookie
const listTable = homeworkContainer.querySelector('#list-table tbody');

function createCookie(name, value) {
  let chunk = filterNameInput.value;

  if (name === '' || value === '') {
      return;
  }

  document.cookie = `${name}=${value}`;
  if (isMatching(name, chunk)) makeTable([name, value])
}

function isMatching(full, chunk) {
  if (full.toLowerCase().includes(chunk.toLowerCase())) {
      return true;
  }

  return false;    
}

function showCookie() {
  listTable.innerHTML = '';
  let chunk = filterNameInput.value;
  let cookies = getCookies();// положить сюда все куки
  for (let cookie of cookies) {
    if (isMatching(cookie[0], chunk)) { 
      makeTable(cookie);
    }
  }
}

function makeTable(cookie) {
  let fragment = document.createDocumentFragment();
  let nodeRow = document.createElement('tr');
  for (let prop of cookie) { 
    let nodeEl = document.createElement('th');
    nodeEl.innerHTML = prop;
    nodeRow.append(nodeEl);
  }
    let del = document.createElement('th');
    del.classList.add('del-button');
    del.innerHTML = 'удалить'
    nodeRow.append(del);
    fragment.append(nodeRow)
  listTable.append(fragment)
}

function getCookies() {
  let cookies = document.cookie.split(';');
  cookies = cookies.map((element) => element.split('=') )
  return cookies;

}


listTable.addEventListener('click', (e) => {
  if (e.target.className == 'del-button') {
    let cookieName = e.target.closest('tr').firstChild.innerText
    var cookie_date = new Date ( );
    cookie_date.setTime ( cookie_date.getTime() - 1 );
    document.cookie = `${cookieName}='';expires=-1` + cookie_date.toGMTString();
    e.target.closest('tr').remove()
  }
});

filterNameInput.addEventListener('input', function () {
  showCookie();
});

addButton.addEventListener('click', () => {
  createCookie(addNameInput.value, addValueInput.value);
});

showCookie();
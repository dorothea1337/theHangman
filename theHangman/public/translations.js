const translations = {
    ru: {
      'username-def': 'Имя пользователя:',
      'h1': 'Виселица',
      'hints-def': 'Подсказки:',
      'coins-def': 'Монетки:',
      'switch-theme marg text-btn': 'Переключить тему',
      'switch-lang marg text-btn': 'Переключить язык',
      'quit marg text-btn': 'Выйти',
      'collection-button': 'Коллекция',
      'get-word-button light': 'Лёгкий',
      'get-word-button medium': 'Средний',
      'get-word-button hard': 'Сложный',
      'used-letters-hello': 'Использованные буквы:',
      'play-again': 'Сыграть ещё',
      'hints-left': 'Подсказки: ',
      'use-hint': 'Взять подсказку',
      'number-hints-left': 'Осталось подсказок: ',
      'plus-one': '+1',
      'skin-def rd': 'Красный',
      'skin-def bl': 'Синий',
      'skin-def def': 'Обычный',
      'skin-def skin-custom': 'Кастомный',
      'add-head-button add': 'Голова',
      'add-body-button add': 'Тело',
      'add-leftHand-button add': 'Левая рука',
      'add-rightHand-button add': 'Правая рука',
      'add-leftLeg-button add': 'Левая нога',
      'add-rightLeg-button add': 'Правая нога',
      'save-added-btn': 'Сохранить',
      'h2-victory': 'Победа!',
      'h2-defeat': 'Поражение...',
    },
    en: {
      'username-def': 'Username:',
      'h1': 'The Hangman',
      'hints-def': 'Hints:',
      'coins-def': 'Coins:',
      'switch-theme marg text-btn': 'Switch Theme',
      'switch-lang marg text-btn': 'Switch Language',
      'quit marg text-btn': 'Log Out',
      'collection-button': 'Collection',
      'get-word-button light': 'Easy',
      'get-word-button medium': 'Medium',
      'get-word-button hard': 'Hard',
      'used-letters-hello': 'Used Letters:',
      'play-again': 'Play Again',
      'hints-left': 'Hints: ',
      'use-hint': 'Use Hint',
      'number-hints-left': 'Hints Left: ',
      'plus-one': '+1',
      'skin-def rd': 'Red',
      'skin-def bl': 'Blue',
      'skin-def def': 'Default',
      'skin-def skin-custom': 'Custom',
      'add-head-button add': 'Head',
      'add-body-button add': 'Body',
      'add-leftHand-button add': 'Left Hand',
      'add-rightHand-button add': 'Right Hand',
      'add-leftLeg-button add': 'Left Leg',
      'add-rightLeg-button add': 'Right Leg',
      'save-added-btn': 'Save',
      'h2 victory': 'Victory!',
      'h2 defeat': 'Defeat...',
    },
  };
  

// Функция для переключения языка
function switchLanguage(language) {
    // Сначала обновляем все элементы <p>
    const pElements = document.querySelectorAll('p');
    
    pElements.forEach(element => {
      const key = element.className || element.id;  // Получаем класс или id элемента
      if (translations[language][key]) {
        element.textContent = translations[language][key];  // Меняем текст на перевод
      }
    });
  
    // Теперь обновим заголовок <h1>
    const h1Element = document.querySelector('h1');
    if (h1Element && translations[language]['h1']) {
      h1Element.textContent = translations[language]['h1'];  // Меняем текст в h1
    }

    const h2Elements = document.querySelectorAll('.h2');
    h2Elements.forEach(element => {
      const key = element.className || element.id;
      if (translations[language][key]) {
        element.textContent = translations[language][key];
      }
    });

    const playAgainButtons = document.querySelectorAll('.play-again');
    playAgainButtons.forEach(button => {
      const key = button.className || button.id;
      if (translations[language][key]) {
        button.textContent = translations[language][key];
      }
    });
    localStorage.setItem('language', language);
  }
  
  // Обработчик события для кнопки "switch-lang"
  document.querySelector('.switch-lang').addEventListener('click', () => {
    const currentLanguage = document.documentElement.lang || 'ru'; 
    
    
    
    const newLanguage = currentLanguage === 'ru' ? 'en' : 'ru'; // Переключение языка
  
    document.documentElement.lang = newLanguage; // Обновляем атрибут lang на html
    switchLanguage(newLanguage); // Переключаем тексты
  });
  

  document.addEventListener('DOMContentLoaded', () => {
    const savedLanguage = localStorage.getItem('language') || 'ru'; // Получаем сохранённый язык или ставим 'ru' по умолчанию
    document.documentElement.lang = savedLanguage; // Устанавливаем атрибут lang на html
    switchLanguage(savedLanguage); // Переключаем текст на сохранённый язык
  });
  
  
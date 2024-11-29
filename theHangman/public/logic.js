//=======================СИСТЕМА АККАУНТОВ=================
let currentUser = null;

// Функция для получения текущего логина с сервера
async function getCurrentLogin() {
    try {
        const response = await fetch('/current-user'); // Сервер возвращает текущий логин
        if (!response.ok) {
            throw new Error('Ошибка получения текущего логина');
        }

        const data = await response.json();
        console.log('Текущий логин с сервера:', data.currentLogin);
        localStorage.setItem('currentLogin', data.currentLogin);
        return data.currentLogin;
    } catch (error) {
        console.error('Ошибка при запросе текущего логина:', error);
        return null;
    }
}

// Логика при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Страница загружена, начинаем работу.');

    const currentLogin = await getCurrentLogin(); // Получаем текущий логин
    if (currentLogin) {
        await loadUserDataByLogin(currentLogin); // Загружаем данные пользователя
    } else {
        console.error('Не удалось получить текущий логин, данные не будут загружены');
    }
});

// Функция для загрузки данных пользователя по логину
async function loadUserDataByLogin(login) {
    try {
        const response = await fetch('/users.json'); // Загружаем всех пользователей
        if (!response.ok) {
            throw new Error('Ошибка загрузки файла users.json');
        }

        const users = await response.json();
        console.log('Все пользователи из файла:', users);

        // Ищем пользователя по логину
        const user = users.find(u => u.login === login);
        console.log('Найденный пользователь:', user);

        if (user) {
            currentUser = user; // Сохраняем найденного пользователя
            console.log('Найденные элементы username:', document.querySelectorAll('.username'));
            updateCoins(user.coins); 
            updateHints(user.hints);

            console.log('Найденные элементы username:', document.querySelectorAll('.username'));

            updateUName(user.login);// Обновляем монеты
        } else {
            console.error('Пользователь с таким логином не найден');
        }
    } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
    }
}

// Функция для обновления монет на странице
function updateCoins(coins) {
    console.log('Обновляем монеты на странице:', coins);
    const coinsElements = document.querySelectorAll('.coins-p'); // Элементы для отображения монет
    if (coinsElements.length === 0) {
        console.error('Элемент для отображения монет не найден');
        return;
    }

    coinsElements.forEach(el => {
        el.textContent = `${coins}`; // Обновляем текст
    });
}

function updateUName(uname){
    const unameElements = document.querySelectorAll('.username');
    if (unameElements.length === 0) {
        console.error('Элемент для отображения uname не найден');
        return;
    }

    unameElements.forEach(el => {
        el.textContent = `${localStorage.getItem('currentLogin')}`; // Обновляем текст
    });
}

function updateHints(hints) {
    const hintsElements = document.querySelectorAll('.hints'); // Элементы для отображения монет
    if (hintsElements.length === 0) {
        console.error('Элемент для отображения монет не найден');
        return;
    }

    hintsElements.forEach(el => {
        el.textContent = `${hints}`; // Обновляем текст
    });
}



document.addEventListener('DOMContentLoaded', () => {
    const quitButton = document.querySelector('.quit'); // Кнопка выйти

    if (!quitButton) {
        console.error('Кнопка "выйти" не найдена на странице');
        return;
    }

    quitButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                
                clearGameState();
                localStorage.removeItem('currentLogin');
                console.log('Пользователь вышел успешно');
                // Перенаправляем на страницу входа
                window.location.href = '/login';

            } else {
                console.error('Ошибка при выходе');
            }
        } catch (error) {
            console.error('Ошибка при выполнении запроса на выход:', error);
        }
    });
});

//=========================СИСТЕМА ИГРЫ==================


// Функция для создания игрового поля
function createPlayground(symbol, parentElementId, count) {
    const parent = document.getElementById(parentElementId);

    if (parent.querySelectorAll('.empty-field').length === 0) {
        for (let i = 0; i < count-1; i++) {
            const newElement = document.createElement('span');
            newElement.textContent = symbol;
            newElement.className = 'empty-field';
            newElement.setAttribute('data-index', i); // Уникальный индекс для каждой буквы
            parent.appendChild(newElement);
        }
        console.log('Добавлено', count, 'символов:', symbol);

        // Проверяем ширину контейнера и изменяем размер шрифта
        adjustFontSizeIfNeeded();
    } else {
        console.log('Элементы уже существуют, пропускаем создание.');
    }
}

// Запрос случайного слова с сервера
async function fetchRandomWord(difficulty) {
    try {
        // Получаем текущий язык из localStorage
        const language = localStorage.getItem('language') || 'ru'; // По умолчанию 'ru' если язык не выбран

        // Формируем запрос с языком и уровнем сложности
        const response = await fetch(`/random-word?difficulty=${difficulty}&language=${language}`);
        if (!response.ok) {
            throw new Error('Failed to fetch the random word');
        }
        const word = await response.text();
        console.log(`Получено слово (${difficulty}, ${language}):`, word);

        // Сохраняем слово в localStorage
        localStorage.setItem('randomWord', word);

        // Переход на страницу игры
        window.location.href = '/the-hangman';
    } catch (error) {
        console.error('Ошибка получения случайного слова:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Загружаем сохраненный язык из localStorage или ставим 'ru' по умолчанию
    const savedLanguage = localStorage.getItem('language') || 'ru'; 
    document.documentElement.lang = savedLanguage; // Устанавливаем атрибут lang на html
    switchLanguage(savedLanguage); // Переключаем текст на сохранённый язык

    const russianKeyboard = document.querySelector('.russian-letters');
    const englishKeyboard = document.querySelector('.english-letters');

    // Проверяем, что оба элемента существуют, а затем меняем их видимость
    if (russianKeyboard && englishKeyboard) {
        if (savedLanguage === 'ru') {
            russianKeyboard.style.display = 'flex';  // Показываем русскую клавиатуру
            englishKeyboard.style.display = 'none';  // Скрываем английскую клавиатуру
        } else if (savedLanguage === 'en') {
            russianKeyboard.style.display = 'none';  // Скрываем русскую клавиатуру
            englishKeyboard.style.display = 'flex';  // Показываем английскую клавиатуру
        }
    }
});
  

// Инициализация страницы
document.addEventListener('DOMContentLoaded', () => {
    const lightButton = document.getElementById('get-word-light');
    const mediumButton = document.getElementById('get-word-medium');
    const hardButton = document.getElementById('get-word-hard');

    if (lightButton) {
        lightButton.addEventListener('click', () => {
            localStorage.setItem('currentDifficulty', 'light'); // Сохраняем уровень
            fetchRandomWord('light');
        });
    }
    if (mediumButton) {
        mediumButton.addEventListener('click', () => {
            localStorage.setItem('currentDifficulty', 'medium'); // Сохраняем уровень
            fetchRandomWord('medium');
        });
    }
    if (hardButton) {
        hardButton.addEventListener('click', () => {
            localStorage.setItem('currentDifficulty', 'hard'); // Сохраняем уровень
            fetchRandomWord('hard');
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const fieldsContainer = document.getElementById('fields');
    const savedState = loadGameState();
    let randomWord;

    if (savedState) {
        randomWord = savedState.word;
        console.log('Восстановлено сохраненное состояние игры:', savedState);
        createPlayground('_', 'fields', randomWord.length);

        const currentTheme = localStorage.getItem('theme') || 'light';
        const fieldTextColor = currentTheme === 'dark' ? 'white' : 'black'; // Цвет для текста на игровом поле
        const buttonTextColor = currentTheme === 'dark' ? 'black' : 'white';

        // Восстанавливаем отгаданные буквы
        const fields = document.querySelectorAll('.empty-field');
        savedState.guessedLetters.forEach((letter, index) => {
            if (letter) {
                fields[index].textContent = letter;
                fields[index].style.color = fieldTextColor;
                fields[index].style.fontFamily = 'Melectron';
            }
        });

        

        // Восстанавливаем состояние кнопок
        const letterButtons = document.querySelectorAll('.letter-button');
        letterButtons.forEach((button) => {
            const letter = button.textContent.trim().toUpperCase();
            if (savedState.usedLetters[letter]) {
                button.disabled = true;
                if (savedState.usedLetters[letter] === 'correct') {
                    button.style.backgroundColor = 'green';
                    button.style.color = buttonTextColor;
                    button.style.borderColor = 'green';
                    button.style.fontColor = 'White';
                    button.style.cursor = 'default';
                } else {
                    button.style.backgroundColor = 'rgba(73, 73, 73, 0.45)';
                    button.style.color = 'gray';
                    button.style.cursor = 'default';
                }
            }
        });
    } else {
        // Если нет сохраненного состояния, начинаем новую игру
        randomWord = localStorage.getItem('randomWord');
        if (randomWord) {
            console.log('Начало новой игры со словом:', randomWord);
            createPlayground('_', 'fields', randomWord.length);
        } else {
            console.error('Слово не найдено в localStorage');
        }
    }

    // Добавляем обработчики для кнопок
    const letterButtons = document.querySelectorAll('.letter-button');
    letterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const letter = button.textContent.trim().toUpperCase(); // Получаем букву из кнопки
            handleLetterClick(letter, randomWord, button);
        });
    });
});

function setGameLanguage() {
    const savedLanguage = localStorage.getItem('language') || 'ru'; // По умолчанию 'ru', если язык не установлен
    document.documentElement.lang = savedLanguage; // Устанавливаем атрибут lang для страницы
    switchLanguage(savedLanguage); // Переключаем язык текста на странице
}

// Когда пользователь возвращается на главную страницу, язык сохраняется
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем сохранённый язык из localStorage или по умолчанию 'ru'
    const savedLanguage = localStorage.getItem('language') || 'ru'; 
    document.documentElement.lang = savedLanguage; // Устанавливаем атрибут lang на html
    switchLanguage(savedLanguage); // Переключаем текст на сохранённый язык

    const russianKeyboard = document.querySelector('.russian-letters');
    const englishKeyboard = document.querySelector('.english-letters');

    // Проверяем, что оба элемента существуют, а затем меняем их видимость
    if (russianKeyboard && englishKeyboard) {
        if (savedLanguage === 'ru') {
            russianKeyboard.style.display = 'flex';  // Показываем русскую клавиатуру
            englishKeyboard.style.display = 'none';  // Скрываем английскую клавиатуру
        } else if (savedLanguage === 'en') {
            russianKeyboard.style.display = 'none';  // Скрываем русскую клавиатуру
            englishKeyboard.style.display = 'flex';  // Показываем английскую клавиатуру
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const arrowButton = document.querySelector('.arrow');
    if (arrowButton) {
        arrowButton.addEventListener('click', () => {
            // Устанавливаем язык перед переходом
            setGameLanguage();
            clearGameState();
            localStorage.removeItem('selectedSkin');
            window.location.href = 'index.html'; 
        });
    }
});

async function loadUserDataByLogin(login) {
    try {
        const response = await fetch('/users.json'); // Загружаем всех пользователей
        if (!response.ok) {
            throw new Error('Ошибка загрузки файла users.json');
        }

        const users = await response.json();
        console.log('Все пользователи из файла:', users);

        // Ищем пользователя по логину
        const user = users.find(u => u.login === login);
        console.log('Найденный пользователь:', user);

        if (user) {
            currentUser = user; // Сохраняем найденного пользователя
            updateCoins(user.coins);
            updateHints(user.hints); 
            updateUName(user.login);
        } else {
            console.error('Пользователь с таким логином не найден');
        }
    } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
    }
}


function adjustFontSizeIfNeeded() {
    const fieldsContainer = document.getElementById('fields');
    const maxContainerWidth = 695; // Максимальная ширина контейнера
    const defaultFontSize = 100; // Размер шрифта по умолчанию
    const fontSizeStep = 5; // На сколько уменьшается размер

    if (fieldsContainer.offsetWidth > maxContainerWidth) {
        const newFontSize = defaultFontSize - fontSizeStep;

        // Устанавливаем уменьшенный размер шрифта для всех символов
        fieldsContainer.querySelectorAll('.empty-field').forEach(field => {
            field.style.fontSize = `${newFontSize}px`;
        });
        console.log(`Размер шрифта уменьшен до ${newFontSize}px, так как ширина контейнера больше ${maxContainerWidth}px`);
    } else {
        // Возвращаем размер шрифта к дефолтному, если ширина в пределах
        fieldsContainer.querySelectorAll('.empty-field').forEach(field => {
            field.style.fontSize = `${defaultFontSize}px`;
        });
        console.log(`Размер шрифта остался ${defaultFontSize}px, так как ширина контейнера не превышает ${maxContainerWidth}px`);
    }
}

function saveGameState(word, guessedLetters, usedLetters) {
    const gameState = {
        word: word,
        guessedLetters: guessedLetters,
        usedLetters: usedLetters
    };
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

function loadGameState() {
    const gameState = localStorage.getItem('gameState');
    return gameState ? JSON.parse(gameState) : null;
}

function handleLetterClick(letter, word, button) {
    const wordArray = word.toUpperCase().split('');
    const fields = document.querySelectorAll('.empty-field');
    const guessedLetters = Array.from(fields).map(field => field.textContent === '_' ? null : field.textContent);
    const usedLetters = loadGameState()?.usedLetters || {};

    let isLetterFound = false;

    // Получаем текущую тему из localStorage
    const currentTheme = localStorage.getItem('theme') || 'light';
    const fieldTextColor = currentTheme === 'dark' ? 'white' : 'black'; // Цвет для текста на игровом поле
    const buttonTextColor = currentTheme === 'dark' ? 'black' : 'white'; // Цвет для кнопки

    wordArray.forEach((char, index) => {
        if (char === letter) {
            isLetterFound = true;
            fields[index].textContent = char; // Заменяем символ _ на букву
            fields[index].style.color = fieldTextColor; // Устанавливаем цвет текста в зависимости от темы
            guessedLetters[index] = char;
            fields[index].style.fontFamily = 'Melectron';
            fields[index].style.lineHeight = '0%';

            // Уменьшаем размер шрифта, если нужно
            adjustFontSizeIfNeeded();
        }
    });

    // Обновляем состояние кнопки
    button.disabled = true;
    if (isLetterFound) {
        button.style.backgroundColor = 'green';
        button.style.color = buttonTextColor; 
        button.style.borderColor = 'green';
        usedLetters[letter] = 'correct';
        button.style.cursor = 'default';
    } else {
        button.style.backgroundColor = 'rgba(73, 73, 73, 0.45)';
        button.style.color = 'gray';
        usedLetters[letter] = 'incorrect';
        button.style.cursor = 'default';

        // Показываем следующую часть тела
        showNextBodyPart();
    }

    // Проверяем, завершена ли игра
    if (isWordGuessed()) {
        console.log('Слово отгадано! Очищаем состояние игры.');
        clearGameState(); // Удаляем состояние игры
    } else {
        // Сохраняем состояние игры, если игра не завершена
        saveGameState(word, guessedLetters, usedLetters);
    }
}


const bodyParts = ['bro-head', 'bro-body', 'bro-left-hand', 'bro-right-hand', 'bro-left-leg', 'bro-right-leg'];
let errorCount = 0; 

// Список стандартных скинов
const availableSkins = {
    default: 'bro',
    red: 'red-bro',
    blue: 'blue-bro',
};

function loadErrorState() {
    const errorState = localStorage.getItem('errorState');
    return errorState ? JSON.parse(errorState) : { errorCount: 0, displayedParts: [] };
}

function saveErrorState(errorCount, displayedParts) {
    const errorState = { errorCount, displayedParts };
    localStorage.setItem('errorState', JSON.stringify(errorState));
}

function initializeErrorState() {
    const { errorCount: savedErrorCount, displayedParts } = loadErrorState();
    errorCount = savedErrorCount;

    displayedParts.forEach(partId => {
        const part = document.getElementById(partId);
        if (part) {
            part.classList.add('bro-visible');
        }
    });

    // Если были ошибки, обновляем изображение виселицы
    const hangImage = document.getElementById('hang-img');
    if (errorCount > 0 && hangImage) {
        hangImage.src = './content/theHangEmpty.png';
        console.log('Изображение виселицы обновлено на theHangEmpty.png');
    }
}



function showNextBodyPart() {
    const hangImage = document.getElementById('hang-img'); 
    const currentUserLogin = localStorage.getItem('currentLogin'); // Берём логин текущего пользователя

    fetch('/users.json') // Загружаем файл users.json
        .then(response => response.json())
        .then(users => {
            const user = users.find(u => u.login === currentUserLogin); // Ищем пользователя по логину
            if (user) {
                currentSkin = user.currentSkin || 'default';

                // Здесь выполняем логику с изменением изображений
                updateBroAppearance(currentSkin, currentUserLogin);
            } else {
                console.error('Пользователь не найден в файле users.json');
            }
        })
        .catch(err => console.error('Ошибка загрузки файла users.json:', err));

    // Функция для обновления внешнего вида
    function updateBroAppearance(skin, currentUserLogin) {
        const headImg = document.getElementById('bro-head');
        const bodyImg = document.getElementById('bro-body');
        const leftHandImg = document.getElementById('bro-left-hand');
        const rightHandImg = document.getElementById('bro-right-hand');
        const leftLegImg = document.getElementById('bro-left-leg');
        const rightLegImg = document.getElementById('bro-right-leg');

        if (skin === 'blue') {
            console.log('Скин: синий');
            headImg.src = './content/blue-bro-head.png';
            bodyImg.src = './content/blue-bro-body.png';
            leftHandImg.src = './content/blue-bro-leftHand.png';
            rightHandImg.src = './content/blue-bro-rightHand.png';
            leftLegImg.src = './content/blue-bro-leftLeg.png';
            rightLegImg.src = './content/blue-bro-rightLeg.png';
        } else if (skin === 'red') {
            console.log('Скин: красный');
            headImg.src = './content/red-bro-head.png';
            bodyImg.src = './content/red-bro-body.png';
            leftHandImg.src = './content/red-bro-leftHand.png';
            rightHandImg.src = './content/red-bro-rightHand.png';
            leftLegImg.src = './content/red-bro-leftLeg.png';
            rightLegImg.src = './content/red-bro-rightLeg.png';
        } else if (skin === 'my-skin-1') {
            console.log('Скин: мой скин 1');
            // Загрузка изображений из папки uploads/{login}
            headImg.src = `./uploads/${currentUserLogin}/head.png`;
            bodyImg.src = `./uploads/${currentUserLogin}/body.png`;
            leftHandImg.src = `./uploads/${currentUserLogin}/leftHand.png`;
            rightHandImg.src = `./uploads/${currentUserLogin}/rightHand.png`;
            leftLegImg.src = `./uploads/${currentUserLogin}/leftLeg.png`;
            rightLegImg.src = `./uploads/${currentUserLogin}/rightLeg.png`;
        } else {
            console.log('Скин: стандартный');
            headImg.src = './content/head.png';
            bodyImg.src = './content/body.png';
            leftHandImg.src = './content/leftHand.png';
            rightHandImg.src = './content/rightHand.png';
            leftLegImg.src = './content/leftLeg.png';
            rightLegImg.src = './content/rightLeg.png';
            }
        }
    

    if (errorCount < bodyParts.length) {
        if (errorCount === 0 && hangImage) {
            hangImage.src = './content/theHangEmpty.png'; // Заменяем изображение виселицы
            console.log('Изображение виселицы обновлено на theHangEmpty.png');
        }

        const partId = bodyParts[errorCount];
        const part = document.getElementById(partId);

        if (part) {
            part.classList.add('bro-visible'); // Показываем следующую часть
            errorCount++;
            saveErrorState(errorCount, bodyParts.slice(0, errorCount)); // Сохраняем состояние ошибок
        }

        if (errorCount === 6 && hangImage) {
            showGameOverPopup();
        }
    }
}

// Инициализация состояния игры
document.addEventListener('DOMContentLoaded', initializeErrorState);

function clearGameState() {
    localStorage.removeItem('gameState');
    localStorage.removeItem('errorState');
}

function clearGameLanguage(){
    localStorage.removeItem('language');
}

function isWordGuessed() {
    const fields = document.querySelectorAll('.empty-field');
    const allGuessed = Array.from(fields).every(field => field.textContent !== '_');

    if (allGuessed) {
        console.log('Слово отгадано!');
        showVictoryPopup(); // Показываем окно победы
        return true;
    }
    return false;
}

// Местоположение переменной letterButtons: глобальная область видимости
let letterButtons = null;


// Обработчик события для кнопки подсказки
document.addEventListener('DOMContentLoaded', () => {
    const hintButton = document.querySelector('.use-hint'); // Кнопка "взять подсказку"

    if (!hintButton) {
        console.error('Кнопка "взять подсказку" не найдена');
        return;
    }

    hintButton.addEventListener('click', async () => {
        try {
            const fields = document.querySelectorAll('.empty-field'); // Все буквы в поле
            const randomWord = localStorage.getItem('randomWord')?.toUpperCase();
            if (!randomWord) {
                console.error('Слово не найдено');
                return;
            }

            const guessedLetters = Array.from(fields).map(field => field.textContent); // Отгаданные буквы
            const unopenedIndexes = randomWord.split('').map((char, index) => {
                if (guessedLetters[index] === '_') {
                    return index;
                }
                return null;
            }).filter(index => index !== null); // Индексы закрытых букв

            if (unopenedIndexes.length === 0) {
                console.log('Все буквы уже открыты!');
                return;
            }

            // Выбираем случайный индекс из оставшихся
            const randomIndex = unopenedIndexes[Math.floor(Math.random() * unopenedIndexes.length)];
            const letterToReveal = randomWord[randomIndex];

            // Открываем букву в поле
            fields[randomIndex].textContent = letterToReveal;
            fields[randomIndex].style.color = 'black';
            fields[randomIndex].style.fontFamily = 'Melectron';

            // Делаем кнопку некликабельной
            const letterButtons = document.querySelectorAll('.letter-button');
            letterButtons.forEach(button => {
                if (button.textContent.trim().toUpperCase() === letterToReveal) {
                    button.disabled = true;
                    button.style.backgroundColor = 'white';
                    button.style.color = 'white';
                    button.style.borderColor = 'white';
                    button.style.cursor = 'default';
                }
            });

            // Обновляем подсказки и монеты
            const response = await fetch('/use-hint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ login: currentUser.login }),
            });

            if (response.ok) {
                const { hints, coins } = await response.json(); // Получаем обновленное состояние
                currentUser.hints = hints;
                currentUser.coins = coins;

                // Обновляем отображение на странице
                updateHints(hints);
                updateCoins(coins);
                console.log('Подсказка использована. Осталось подсказок:', hints, 'монет:', coins);

                // Проверяем, не отгадано ли слово
                if (isWordGuessed()) {
                    console.log('Слово отгадано! Очищаем состояние игры.');
                    clearGameState(); // Удаляем состояние игры
                }
            } else {
                const error = await response.json();
                console.warn(error.error);
            }
        } catch (error) {
            console.error('Ошибка при использовании подсказки:', error);
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const playAgainButton = document.getElementById('play-again-button');
    if (playAgainButton) {
        playAgainButton.addEventListener('click', resetGame); // Перезапуск игры
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const playAgainButton1 = document.getElementById('play-again-button-1');
    if (playAgainButton1) {
        playAgainButton1.addEventListener('click', resetGame); // Перезапуск игры
    }
});

function addGameResultToUser(result, word = null) {
    if (!currentUser) {
        console.error('Текущий пользователь не найден. Невозможно обновить историю игр.');
        return;
    }

    // Создаем запись для игры
    const gameRecord = {
        result: result, // "поражение" или "победа"
        word: word, // Загаданное слово, если победа
        timestamp: new Date().toISOString() // Время завершения игры
    };

    // Добавляем новую запись в начало массива и ограничиваем размер до 5
    currentUser.recentGames = [gameRecord, ...currentUser.recentGames].slice(0, 5);

    console.log('Recent games:', currentUser.recentGames);

    // Отправляем данные на сервер
    saveUserData(currentUser);
}

function saveUserData(user) {
    // Проверка: убедитесь, что все обязательные данные передаются в запросе
    if (!user.login || !user.recentGames || user.recentGames.length === 0) {
        console.error('Ошибка: Недостаточно данных для сохранения.');
        return;
    }

    // Формируем объект данных для отправки
    const dataToSend = {
        login: user.login,                // Логин пользователя
        result: user.recentGames[0].result, // Результат последней игры
        word: user.recentGames[0].word     // Загаданное слово (если есть)
    };

    fetch('http://localhost:3000/update-user-games', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend), // Отправляем только нужные данные
    })
    .then(response => {
        if (response.ok) {
            console.log('Данные успешно сохранены.');
        } else {
            console.error('Ошибка при сохранении данных. Статус: ', response.status);
        }
    })
    .catch(error => {
        console.error('Ошибка при отправке данных:', error);
    });
}
function showGameOverPopup(){
    const overlay = document.getElementById('overlay-defeat');
    overlay.classList.remove('hidden-victory');
    overlay.style.display = 'flex';

    const arrowButton = document.querySelector('.arrow');
    if (arrowButton) {
        arrowButton.classList.remove('hidden-arrow');
    } 

    const nav =document.querySelector('.nav');
    if (nav){
        nav.style.justifyContent = 'space-between';
    }

    addGameResultToUser('поражение');
    loadRecentGames();
}

function showVictoryPopup() {
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('hidden-victory');
    overlay.style.display = 'flex';

    // Показываем стрелочку
    const arrowButton = document.querySelector('.arrow');
    if (arrowButton) {
        arrowButton.classList.remove('hidden-arrow'); // Убираем класс hidden
    }

    const nav = document.querySelector('.nav');
    if (nav) {
        nav.style.justifyContent = 'space-between';
    }

    // Начисляем игроку 1 подсказку и 1 монету
    if (currentUser) {
        currentUser.hints = (currentUser.hints || 0) + 1; // Увеличиваем подсказки
        currentUser.coins = (currentUser.coins || 0) + 1; // Увеличиваем монеты

        // Получаем уровень сложности из локального хранилища
        const difficulty = localStorage.getItem('currentDifficulty') || 'light';

        // Начисляем очки в зависимости от уровня сложности
        let points = 0;
        if (difficulty === 'light') {
            points = 1;
        } else if (difficulty === 'medium') {
            points = 5;
        } else if (difficulty === 'hard') {
            points = 10;
        }
        currentUser.score = (currentUser.score || 0) + points; // Увеличиваем очки

        // Обновляем отображение на странице
        updateHints(currentUser.hints);
        updateCoins(currentUser.coins);
        //updateScore(currentUser.score); // Функция для обновления отображения очков

        console.log(`Начислено: 1 подсказка, 1 монета и ${points} очков за уровень "${difficulty}".`);
        console.log('Текущее состояние:', {
            hints: currentUser.hints,
            coins: currentUser.coins,
            score: currentUser.score,
        });

        // Сохраняем изменения на сервере
        fetch('/update-user-rewards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                login: currentUser.login,
                hints: currentUser.hints,
                coins: currentUser.coins,
                score: currentUser.score,
            }),
        })
            .then(response => {
                if (response.ok) {
                    console.log('Начисления успешно сохранены на сервере.');
                } else {
                    console.error('Ошибка при сохранении начислений на сервере.');
                }
            })
            .catch(error => {
                console.error('Ошибка сети при сохранении начислений:', error);
            });

        // Добавляем результат игры в историю пользователя
        const word = localStorage.getItem('randomWord') || 'неизвестно'; // Загаданное слово
        addGameResultToUser('победа', word);
        loadRecentGames();
    } else {
        console.warn('Текущий пользователь не найден. Невозможно начислить подсказки, монеты и очки.');
    }   
}


function resetGame() {
    clearGameState();

    const overlay = document.getElementById('overlay');
    overlay.style.display = 'none';
    const overlayDefeat = document.getElementById('overlay-defeat');
    overlayDefeat.style.display = 'none';

    // Скрываем стрелочку
    const arrowButton = document.querySelector('.arrow');
    if (arrowButton) {
        arrowButton.classList.add('hidden-arrow'); // Добавляем класс hidden
    }

    const nav = document.querySelector('.nav');
    if (nav) {
        nav.style.justifyContent = 'flex-end';
    }

    const difficulty = localStorage.getItem('currentDifficulty') || 'medium'; // Если не найдено, выбираем "medium"

    fetchRandomWord(difficulty).then(() => {
        // Очищаем элементы поля
        const fieldsContainer = document.getElementById('fields');
        fieldsContainer.innerHTML = '';

        // Восстанавливаем кнопки
        const letterButtons = document.querySelectorAll('.letter-button');
        letterButtons.forEach(button => {
            button.disabled = false;
            button.style.backgroundColor = '';
            button.style.color = '';
            button.style.borderColor = '';
        });

        console.log('Игра сброшена и новое слово сгенерировано.');
    }).catch((error) => {
        console.error('Ошибка при сбросе игры:', error);
    });
}

document.querySelector('.cross').addEventListener('click', () => {
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'none';
});

document.querySelector('.cross-1').addEventListener('click', () => {
    const overlayDefeat = document.getElementById('overlay-defeat');
    overlayDefeat.style.display = 'none';
});

//============================ВИЗУАЛ==========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');  // Проверим, что скрипт загружается

    // Для страницы с profile-window
    const profileIcon = document.querySelector('.header-button.profile');
    const profileWindow = document.querySelector('.profile-window');
    const overlayBackground = document.querySelector('.overlay-background');

    if (profileIcon && profileWindow && overlayBackground) {
        console.log('Profile window elements found');  // Проверим, что элементы есть
        profileIcon.addEventListener('click', () => {
            console.log('Profile window clicked');
            profileWindow.classList.toggle('active');
            overlayBackground.classList.toggle('active');
        });

        overlayBackground.addEventListener('click', () => {
            profileWindow.classList.remove('active');
            overlayBackground.classList.remove('active');
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');  

    const historyIcon = document.querySelector('.header-button.history');
    const historyWindow = document.querySelector('.history-window');
    const overlayBackground = document.querySelector('.overlay-background');

    if (historyIcon && historyWindow && overlayBackground) {
        console.log('history window elements found');  
        historyIcon.addEventListener('click', () => {
            console.log('history window clicked');
            historyWindow.classList.toggle('active');
            overlayBackground.classList.toggle('active');
        });

        overlayBackground.addEventListener('click', () => {
            historyWindow.classList.remove('active');
            overlayBackground.classList.remove('active');
        });
    }
});

setInterval(loadRecentGames, 5000);

// Функция для загрузки истории игр пользователя
function loadRecentGames() {
    // Получаем текущего пользователя
    fetch('/current-user')
        .then(response => {
            if (!response.ok) {
                throw new Error('Не удалось получить текущего пользователя');
            }
            return response.json();
        })
        .then(data => {
            const currentLogin = data.currentLogin;

            // Загружаем данные пользователя
            return fetch(`/users.json`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Не удалось загрузить пользователей');
                    }
                    return response.json();
                })
                .then(users => {
                    // Находим текущего пользователя в списке
                    const user = users.find(u => u.login === currentLogin);
                    if (!user || !user.recentGames) {
                        console.warn('Нет истории игр для пользователя');
                        return;
                    }

                    // Обновляем HTML с историей игр
                    updateHistoryWindow(user.recentGames);
                });
        })
        .catch(error => {
            console.error('Ошибка при загрузке истории игр:', error);
        });
}

// Функция для обновления HTML с историей игр
function updateHistoryWindow(recentGames) {
    // Очищаем поля
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`recent-game-text-${i}`).textContent = '';
    }

    // Заполняем поля данными из recentGames
    recentGames.reverse().forEach((game, index) => {
        const field = document.getElementById(`recent-game-text-${index + 1}`);
        const savedLanguage = localStorage.getItem('language') || 'ru'; 
        if (field) {
            // Вставляем текст в поле
            if (typeof game === 'string') {
                field.textContent = game; // Если просто "победа" или "поражение"
            } else if (game.result && game.word) {
                if (savedLanguage === 'ru'){
                    field.textContent = `${game.result}: ${game.word}`;
                }
                else{
                    field.textContent = `victory: ${game.word}`;
                }
            } else {
                if (savedLanguage === 'ru'){
                    field.textContent = game.result;
                }
                else{
                    field.textContent = `defeat`;
                }
                
            }
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    loadRecentGames();
});

document.addEventListener('DOMContentLoaded', () => {

    const leaderIcon = document.querySelector('.header-button.leader');
    const leaderWindow = document.querySelector('.leader-window');
    const overlayBackground = document.querySelector('.overlay-background');

    if (leaderIcon && leaderWindow && overlayBackground) {
        console.log('Elements found on index.html'); // Проверим, что элементы найдены
        leaderIcon.addEventListener('click', () => {
            console.log('leader icon clicked'); // Логируем клик
            leaderWindow.classList.toggle('active');
            overlayBackground.classList.toggle('active');
            loadLeaders();
        });

        overlayBackground.addEventListener('click', () => {
            console.log('Overlay clicked'); // Логируем клик по overlay
            leaderWindow.classList.remove('active');
            overlayBackground.classList.remove('active');
        });
    } else {
        console.log('leader elements not found on index.html');
    }
});

function loadLeaders() {
    console.log('Загрузка списка лидеров...');
    fetch('/leaders')
        .then(response => {
            if (!response.ok) {
                throw new Error('Не удалось загрузить список лидеров');
            }
            return response.json();
        })
        .then(leaders => {
            console.log('Полученные лидеры:', leaders); // Проверяем, что получили
            const savedLanguage = localStorage.getItem('language') || 'ru'; 
            // Заполняем текстовые поля для каждого лидера
            for (let i = 1; i <= 5; i++) {
                const leaderText = document.getElementById(`leader-text-${i}`);
                if (leaderText) {
                    if (leaders[i - 1]) {
                        const leader = leaders[i - 1];
                        if (savedLanguage === 'ru'){
                            leaderText.textContent = `${i}. ${leader.login}, очки: ${leader.score}`;
                        }
                        else{
                            leaderText.textContent = `${i}. ${leader.login}, score: ${leader.score}`;
                        }
                    } else {
                        leaderText.textContent = ''; // Очищаем поле, если лидера нет
                    }
                } else {
                    console.warn(`Элемент leader-text-${i} не найден`);
                }
            }
        })
        .catch(error => {
            console.error('Ошибка при загрузке списка лидеров:', error);
        });
}


// Загружаем список лидеров при открытии окна
document.addEventListener('DOMContentLoaded', () => {
    const leaderIcon = document.querySelector('.header-button.leader');
    const leaderWindow = document.querySelector('.leader-window');

    if (leaderIcon && leaderWindow) {
        leaderIcon.addEventListener('click', () => {
            if (!leaderWindow.classList.contains('active')) {
                loadLeaders(); // Обновляем список лидеров при открытии окна
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded: Checking theme preference');

    const switchThemeButton = document.querySelector('.switch-theme');
    const leaderIcon = document.querySelector('.leader-table');
    const historyIcon = document.querySelector('.history');
    const profileIcon = document.querySelector('.profile');
    const arrowIcon = document.querySelector('.arrow');
    const letterButtons = document.querySelectorAll('.letter-button');

    // Функция для применения темы
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.style.backgroundColor = 'black';
            const paragraphs = document.querySelectorAll('p:not(.recent-game-text):not(.leader-text):not(.plus-one):not(.play-again):not(.profile-window p)');
            paragraphs.forEach(p => {
                p.style.color = 'white';
            });

            const headings = document.querySelectorAll('.h1');
            headings.forEach(h => {
                h.style.color = 'white';
            });

            const fields = document.querySelectorAll('span');
            fields.forEach(field => {
                field.style.color = 'white';
            });

            leaderIcon.src = 'content/leadersWhite.svg';
            historyIcon.src = 'content/historyWhite.svg';
            profileIcon.src = 'content/profileWhite.svg';
            arrowIcon.src = 'content/arrowWhite.svg';

            // Обновление стилей кнопок
            letterButtons.forEach(button => {
                if (!button.disabled) {
                    button.style.border = '1px solid white';
                }
            });

            // Сохранение текущей темы
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.style.backgroundColor = 'white';
            const paragraphs = document.querySelectorAll(
                'p:not(.recent-game-text):not(.leader-text):not(.plus-one):not(.play-again):not(.profile-window p)');
            paragraphs.forEach(p => {
                p.style.color = 'black';
            });

            const headings = document.querySelectorAll('.h1');
            headings.forEach(h => {
                h.style.color = 'black';
            });

            const fields = document.querySelectorAll('span');
            fields.forEach(field => {
                field.style.color = 'black';
            });

            leaderIcon.src = 'content/leaders.svg';
            historyIcon.src = 'content/history.svg';
            profileIcon.src = 'content/profile.svg';
            arrowIcon.src = 'content/arrow.svg';

            // Обновление стилей кнопок
            letterButtons.forEach(button => {
                if (!button.disabled) {
                    button.style.border = '1px solid black';
                }
            });

            // Сохранение текущей темы
            localStorage.setItem('theme', 'light');
        }
    }

    // Проверка текущей темы в localStorage
    const savedTheme = localStorage.getItem('theme') || 'light'; // Если не задано, по умолчанию светлая тема
    applyTheme(savedTheme);

    // Слушатель на переключение темы
    if (switchThemeButton) {
        switchThemeButton.addEventListener('click', () => {
            const currentTheme = localStorage.getItem('theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }

    // Функция для обновления состояния кнопок
    function updateButtonState(button, state) {
        const currentTheme = localStorage.getItem('theme') || 'light';

        if (state === 'correct') {
            button.style.backgroundColor = currentTheme === 'dark' ? 'black' : 'green';
            button.style.color = currentTheme === 'dark' ? 'white' : 'green';
            button.style.borderColor = currentTheme === 'dark' ? 'black' : 'white';
        } else if (!button.disabled) {
            button.style.backgroundColor = 'transparent';
            button.style.border = currentTheme === 'dark' ? '1px solid white' : '1px solid black';
            
        }
    }

    // Обновление стилей кнопок при загрузке
    letterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Пример обработки клика кнопки: отмечаем состояние correct
            const isCorrect = Math.random() > 0.5; // Замените эту логику своей
            const state = isCorrect ? 'correct' : 'incorrect';
            updateButtonState(button, state);

            if (state === 'correct') {
                button.disabled = true; // Деактивируем кнопку
            }
        });

        // Установка начального состояния кнопок
        updateButtonState(button, 'default');
    });
});

//================= СКИНЫ ===================

document.addEventListener('DOMContentLoaded', () => {
    const currentUserLogin = localStorage.getItem('currentLogin'); // Получение логина текущего пользователя
    let currentSkin = 'default';
    const userSkins = new Set();
    const skinsContainer = document.querySelector('.collection-window-1');

    updateSkinsUI();

    // Функция для обновления интерфейса
    function updateSkinsUI() {
        // Сброс рамок всех скинов
        skinsContainer.querySelectorAll('.skin').forEach(skin => {
            skin.style.border = '';
        });

        // Установка зелёной рамки для активного скина
        const activeSkin = document.querySelector(`.skin.${currentSkin}`);
        if (activeSkin) {
            activeSkin.style.border = '3px solid green';
        }

        // Удаление оверлея с купленных скинов
        userSkins.forEach(skin => {
            const overlay = document.querySelector(`.skin.${skin} .skin-overlay`);
            if (overlay) overlay.style.display = 'none';
        });
    }

    // Загрузка данных пользователя с сервера
    fetch(`/users.json`)
        .then(response => response.json())
        .then(users => {
            const user = users.find(u => u.login === currentUserLogin);

            if (!user) return console.error('Пользователь не найден');

            currentSkin = user.currentSkin || 'default';
            userSkins.clear();
            user.skins.forEach(skin => userSkins.add(skin));

            updateSkinsUI();
        })
        .catch(err => console.error('Ошибка загрузки пользователей:', err));

    // Обработчик кликов на скины
    skinsContainer.addEventListener('click', (e) => {
        const skinElement = e.target.closest('.skin');
        if (!skinElement) return;

        const skinName = skinElement.classList[1]; // Второй класс указывает на имя скина

        if (userSkins.has(skinName)) {
            // Скин уже куплен — активируем его
            currentSkin = skinName;

            // Обновляем сервер
            fetch('/update-user-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: currentUserLogin, currentSkin }),
            }).then(() => updateSkinsUI())
              .catch(err => console.error('Ошибка обновления текущего скина:', err));
        } else {
            // Покупаем скин
            fetch('/users.json')
                .then(response => response.json())
                .then(users => {
                    const user = users.find(u => u.login === currentUserLogin);

                    if (!user) return console.error('Пользователь не найден');
                    if (user.coins < 3) {
                        return alert('Недостаточно монет для покупки скина');
                    }

                    // Обновляем данные
                    userSkins.add(skinName);
                    user.coins -= 3;

                    fetch('/update-user-data', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            login: currentUserLogin,
                            skins: Array.from(userSkins),
                            coins: user.coins,
                        }),
                    }).then(() => updateSkinsUI())
                      .catch(err => console.error('Ошибка покупки скина:', err));
                });
        }
    });
});


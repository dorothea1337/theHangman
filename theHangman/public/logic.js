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
        return data.currentLogin; // Возвращаем логин
    } catch (error) {
        console.error('Ошибка при запросе текущего логина:', error);
        return null;
    }
}

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
            updateCoins(user.coins); // Обновляем монеты
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
        for (let i = 0; i < count - 1; i++) {
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
        const response = await fetch(`/random-word?difficulty=${difficulty}`); // Указываем уровень сложности
        if (!response.ok) {
            throw new Error('Failed to fetch the random word');
        }
        const word = await response.text();
        console.log(`Получено слово (${difficulty}):`, word);

        // Сохраняем слово в localStorage
        localStorage.setItem('randomWord', word);

        // Переход на страницу игры
        window.location.href = '/the-hangman';
    } catch (error) {
        console.error('Ошибка получения случайного слова:', error);
    }
}

// Инициализация страницы
document.addEventListener('DOMContentLoaded', () => {
    const lightButton = document.getElementById('get-word-light');
    const mediumButton = document.getElementById('get-word-medium');
    const hardButton = document.getElementById('get-word-hard');

    const handleDifficultyChange = (difficulty) => {
        const savedState = loadGameState(); // Проверяем состояние игры
        if (savedState) {
            console.log('Уже есть незаконченная игра, новое слово не будет сгенерировано.');
            return; // Если есть сохранённое состояние, выходим из функции
        }

        localStorage.setItem('currentDifficulty', difficulty); // Сохраняем уровень сложности
        fetchRandomWord(difficulty); // Генерируем новое слово
    };

    if (lightButton) {
        lightButton.addEventListener('click', () => handleDifficultyChange('light'));
    }
    if (mediumButton) {
        mediumButton.addEventListener('click', () => handleDifficultyChange('medium'));
    }
    if (hardButton) {
        hardButton.addEventListener('click', () => handleDifficultyChange('hard'));
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

        // Восстанавливаем отгаданные буквы
        const fields = document.querySelectorAll('.empty-field');
        savedState.guessedLetters.forEach((letter, index) => {
            if (letter) {
                fields[index].textContent = letter;
                fields[index].style.color = 'black';
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
                    button.style.backgroundColor = 'white';
                    button.style.color = 'white';
                    button.style.borderColor = 'white';
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

document.addEventListener('DOMContentLoaded', () => {
    const arrowButton = document.querySelector('.arrow');
    if (arrowButton) {
        arrowButton.addEventListener('click', () => {
            clearGameState();
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

    wordArray.forEach((char, index) => {
        if (char === letter) {
            isLetterFound = true;
            fields[index].textContent = char; // Заменяем символ _ на букву
            fields[index].style.color = 'black'; // Отображаем букву
            guessedLetters[index] = char;
            fields[index].style.fontFamily = 'Melectron';
            fields[index].style.lineHeigth = '0%';

            // Уменьшаем размер шрифта, если нужно
            adjustFontSizeIfNeeded();
        }
    });

    // Обновляем состояние кнопки
    button.disabled = true;
    if (isLetterFound) {
        button.style.backgroundColor = 'white';
        button.style.color = 'white';
        button.style.borderColor = 'white';
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
let errorCount = 0; // Счётчик ошибок

function showNextBodyPart() {
    const hangImage = document.getElementById('hang-img'); // Элемент изображения виселицы

    if (errorCount < bodyParts.length) {
        if (errorCount == 0 && hangImage) {
            hangImage.src = './content/theHangEmpty.png'; // Заменяем изображение виселицы
            console.log('Изображение виселицы обновлено на theHangEmpty.png');
        }

        const part = document.getElementById(bodyParts[errorCount]);
        part.classList.add('bro-visible'); // Показываем следующую часть
        errorCount++;

        if (errorCount == 6 && hangImage){
        showGameOverPopup();
        }
    } 
}

function clearGameState() {
    localStorage.removeItem('gameState');
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
    
    const nav =document.querySelector('.nav');
    if (nav){
        nav.style.justifyContent = 'space-between';
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


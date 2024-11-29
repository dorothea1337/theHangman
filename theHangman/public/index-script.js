document.addEventListener('DOMContentLoaded', () => {
    console.log('Index page script loaded'); // Проверим, что скрипт запускается на нужной странице

    const profileIcon = document.querySelector('.header-button.profile1');
    const profileWindow = document.querySelector('.profile-window-1');
    const overlayBackground = document.querySelector('.overlay-background-1');

    if (profileIcon && profileWindow && overlayBackground) {
        console.log('Elements found on index.html'); // Проверим, что элементы найдены
        profileIcon.addEventListener('click', () => {
            console.log('Profile icon clicked'); // Логируем клик
            profileWindow.classList.toggle('active');
            overlayBackground.classList.toggle('active');
        });

        overlayBackground.addEventListener('click', () => {
            console.log('Overlay clicked'); // Логируем клик по overlay
            profileWindow.classList.remove('active');
            overlayBackground.classList.remove('active');
        });
    } else {
        console.log('Profile elements not found on index.html');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('Index page script loaded'); // Проверим, что скрипт запускается на нужной странице

    const historyIcon = document.querySelector('.header-button.history1');
    const historyWindow = document.querySelector('.history-window-1');
    const overlayBackground = document.querySelector('.overlay-background-1');

    if (historyIcon && historyWindow && overlayBackground) {
        console.log('Elements found on index.html'); // Проверим, что элементы найдены
        historyIcon.addEventListener('click', () => {
            console.log('history icon clicked'); // Логируем клик
            historyWindow.classList.toggle('active');
            overlayBackground.classList.toggle('active');
        });

        overlayBackground.addEventListener('click', () => {
            console.log('Overlay clicked'); // Логируем клик по overlay
            historyWindow.classList.remove('active');
            overlayBackground.classList.remove('active');
        });
    } else {
        console.log('history elements not found on index.html');
    }
});

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

// Вызываем функцию при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
    loadRecentGames();
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('Index page script loaded'); // Проверим, что скрипт запускается на нужной странице

    const leaderIcon = document.querySelector('.header-button.leader1');
    const leaderWindow = document.querySelector('.leader-window-1');
    const overlayBackground = document.querySelector('.overlay-background-1');

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
                        leaderText.textContent = ''; 
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
    const leaderIcon = document.querySelector('.header-button.leader1');
    const leaderWindow = document.querySelector('.leader-window-1');

    if (leaderIcon && leaderWindow) {
        leaderIcon.addEventListener('click', () => {
            if (!leaderWindow.classList.contains('active')) {
                loadLeaders(); 
            }
        });
    }
});



document.addEventListener('DOMContentLoaded', () => {
    console.log('Index page script loaded'); // Проверим, что скрипт запускается на нужной странице

    const switchTheme = document.querySelector('.switch-theme'); 
    const bro = document.querySelector('.bro-image');
    const leaderIcon = document.querySelector('.leader-table');
    const historyIcon = document.querySelector('.history1');
    const profileIcon = document.querySelector('.profile1');

    // Функция для установки темы
    function setTheme(theme) {
        if (theme === 'dark') {
            // Установка темной темы
            document.body.style.backgroundColor = 'black';

            // Изменение цвета текста всех <p>, кроме исключений
            const paragraphs = document.querySelectorAll(
                'p:not(.recent-game-text):not(.leader-text):not(.profile-window-1 p)'
            );
            paragraphs.forEach(p => {
                p.style.color = 'white';
            });

            // Изменение цвета текста всех элементов с классом h1
            const headings = document.querySelectorAll('.h1');
            headings.forEach(h => {
                h.style.color = 'white';
            });

            // Изменение изображений
            bro.src = 'content/broWhite.png';
            leaderIcon.src = 'content/leadersWhite.svg';
            historyIcon.src = 'content/historyWhite.svg';
            profileIcon.src = 'content/profileWhite.svg';

            // Сохранение темы в localStorage
            localStorage.setItem('theme', 'dark');
        } else {
            // Установка светлой темы
            document.body.style.backgroundColor = 'white';

            // Изменение цвета текста всех <p>, включая исключения
            const paragraphs = document.querySelectorAll(
                'p:not(.recent-game-text):not(.leader-text):not(.profile-window-1 p)'
            );
            paragraphs.forEach(p => {
                p.style.color = 'black';
            });

            // Изменение цвета текста всех элементов с классом h1
            const headings = document.querySelectorAll('.h1');
            headings.forEach(h => {
                h.style.color = 'black';
            });

            // Изменение изображений
            bro.src = 'content/bro.png'; // Оригинальное изображение
            leaderIcon.src = 'content/leaders.svg';
            historyIcon.src = 'content/history.svg';
            profileIcon.src = 'content/profile.svg';

            // Сохранение темы в localStorage
            localStorage.setItem('theme', 'light');
        }
    }

    // Установка темы при загрузке страницы
    const savedTheme = localStorage.getItem('theme') || 'light'; // По умолчанию светлая тема
    setTheme(savedTheme);

    // Слушатель переключения темы
    if (switchTheme) {
        switchTheme.addEventListener('click', () => {
            // Переключение темы
            const currentTheme = localStorage.getItem('theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }
});


//================== СКИНЫ ==================
document.addEventListener('DOMContentLoaded', () => {
    const currentUserLogin = localStorage.getItem('currentLogin');
    console.log('login tried');

    let currentSkin = 'default';
    const userSkins = new Set();
    const skinsContainer = document.querySelector('.collection-window-1');

    // Очищаем интерфейс
    function clearGameState() {
        currentSkin = 'default';
        userSkins.clear();
        skinsContainer.querySelectorAll('.skin').forEach(skin => {
            skin.style.border = '';
            const overlay = skin.querySelector('.skin-overlay');
            if (overlay) overlay.style.display = 'block';
        });
    }

    // Загрузка данных пользователя
    function loadUserData() {
        fetch(`/users.json`)
            .then(response => response.json())
            .then(users => {
                const user = users.find(u => u.login === currentUserLogin);

                if (!user) {
                    console.error('Пользователь не найден');
                    return;
                }

                currentSkin = user.currentSkin || 'default';
                userSkins.clear();
                user.skins.forEach(skin => userSkins.add(skin));

                updateSkinsUI();
            })
            .catch(err => console.error('Ошибка загрузки пользователей:', err));
    }

    // Обновление интерфейса
    function updateSkinsUI() {
        skinsContainer.querySelectorAll('.skin').forEach(skin => {
            skin.style.border = '';
        });

        const activeSkin = document.querySelector(`.skin.${currentSkin}`);
        if (activeSkin) {
            activeSkin.style.border = '3px solid green';
        }

        userSkins.forEach(skin => {
            const overlay = document.querySelector(`.skin.${skin} .skin-overlay`);
            if (overlay) overlay.style.display = 'none';
        });
    }

    // Загружаем данные пользователя
    loadUserData();

    skinsContainer.addEventListener('click', (e) => {
        const skinElement = e.target.closest('.skin');
        if (!skinElement) return;

        let skinName = skinElement.classList[1]; // Второй класс указывает на имя скина

        if (skinElement.classList.contains('custom-skin')) {
            // Если это кастомный скин, определяем его уникальное имя
            const customSkinIndex = Array.from(skinsContainer.querySelectorAll('.custom-skin')).indexOf(skinElement) + 1;
            skinName = `${currentUserLogin}-custom-${customSkinIndex}`;
        }

        if (userSkins.has(skinName)) {
            // Скин уже куплен — активируем его
            currentSkin = skinName;

            // Сохраняем в localStorage
            localStorage.setItem('selectedSkin', skinName);

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

                    userSkins.add(skinName);
                    user.coins -= 3;
                    

                    // Сохраняем в localStorage
                    localStorage.setItem('selectedSkin', skinName);

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

                      updateCoins(user.coins);
                });

        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const collectionBtn = document.querySelector('.collection-button');
    const collectionWindow = document.querySelector('.collection-window-1');
    const overlayBackground = document.querySelector('.overlay-background-1');

    if (collectionBtn && collectionWindow && overlayBackground) {
        collectionBtn.addEventListener('click', () => {
            collectionWindow.classList.toggle('active');
            overlayBackground.classList.toggle('active');
        });

        overlayBackground.addEventListener('click', () => {
            collectionWindow.classList.remove('active');
            overlayBackground.classList.remove('active');
        });
    } 
});

document.addEventListener('DOMContentLoaded', () => {
    const customSkinsContainer = document.querySelector('.custom-skins');
    const defaultSkinsContainer = document.querySelector('.default-skins');
    const addSkinContainer = document.querySelector('.add-skin');
    const saveAddedBtn = document.querySelector('.save-added-btn');

    // Проверяем, что все элементы существуют
    if (customSkinsContainer && defaultSkinsContainer && addSkinContainer && saveAddedBtn) {
        const skinsContainer = document.querySelector('.collection-window-1');

        skinsContainer.addEventListener('click', (e) => {
            const skinElement = e.target.closest('.skin');
            if (!skinElement) return;

            // Проверяем, является ли это кастомным скином
            if (skinElement.classList.contains('my-skin-1') || 
                skinElement.classList.contains('my-skin-2') || 
                skinElement.classList.contains('my-skin-3')) {

                // Проверка, куплен ли скин (на нём нет overlay)
                const overlay = skinElement.querySelector('.skin-overlay');
                if (!overlay || overlay.style.display === 'none') {
                    // Скрываем default и custom skins
                    customSkinsContainer.style.display = 'none';
                    defaultSkinsContainer.style.display = 'none';

                    // Показываем add-skin
                    addSkinContainer.style.display = 'flex';
                }
            }
        });

        saveAddedBtn.addEventListener('click', () => {
            // При нажатии на кнопку "Сохранить"
            addSkinContainer.style.display = 'none'; // Скрываем add-skin
            customSkinsContainer.style.display = 'flex'; // Показываем custom-skins
            defaultSkinsContainer.style.display = 'flex'; // Показываем default-skins
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const addSkinButtons = document.querySelectorAll('.add'); // Найти все кнопки с классом add
    const fileInput = document.createElement('input'); // Создаем input для выбора файла
    fileInput.type = 'file';
    fileInput.accept = 'image/png'; // Только PNG-файлы

    addSkinButtons.forEach(button => {
        button.addEventListener('click', () => {
            fileInput.click(); // Имитируем клик по input
        });
    });

    fileInput.addEventListener('change', async () => {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];

            const formData = new FormData();
            formData.append('skin', file);

            try {
                const response = await fetch('/upload-skin', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const result = await response.json();
                    alert(`Скин успешно загружен! Путь: ${result.path}`);
                } else {
                    const error = await response.text();
                    alert(`Ошибка загрузки: ${error}`);
                }
            } catch (err) {
                alert(`Произошла ошибка: ${err.message}`);
            }
        }
    });
});



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


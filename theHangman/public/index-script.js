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
    const leaderIcon = document.querySelector('.header-button.leader1');
    const leaderWindow = document.querySelector('.leader-window-1');

    if (leaderIcon && leaderWindow) {
        leaderIcon.addEventListener('click', () => {
            if (!leaderWindow.classList.contains('active')) {
                loadLeaders(); // Обновляем список лидеров при открытии окна
            }
        });
    }
});
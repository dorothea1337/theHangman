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

    // Заполняем поля данными из recentGames
    recentGames.reverse().forEach((game, index) => {
        const field = document.getElementById(`recent-game-text-${index + 1}`);
        if (field) {
            // Вставляем текст в поле
            if (typeof game === 'string') {
                field.textContent = game; // Если просто "победа" или "поражение"
            } else if (game.result && game.word) {
                field.textContent = `${game.result}: ${game.word}`;
            } else {
                field.textContent = game.result;
            }
        }
    });
}

// Вызываем функцию при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
    loadRecentGames();
});

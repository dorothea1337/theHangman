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

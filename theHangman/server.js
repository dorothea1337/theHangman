const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');


const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Настройка сессий
app.use(session({
    secret: 'your-secret-key',  // Секретный ключ для подписи сессий
    resave: false,             // Не сохранять сессию, если данные не менялись
    saveUninitialized: true,   // Сохранять пустую сессию
    cookie: { secure: false }  // Если используете HTTPS, установите true
}));

const wordsLightRuPath = path.join(__dirname, 'words-light-ru.txt');
const wordsMediumRuPath = path.join(__dirname, 'words-medium-ru.txt');
const wordsHardRuPath = path.join(__dirname, 'words-hard-ru.txt');

const wordsLightEnPath = path.join(__dirname, 'words-light-en.txt');
const wordsMediumEnPath = path.join(__dirname, 'words-medium-en.txt');
const wordsHardEnPath = path.join(__dirname, 'words-hard-en.txt');

const usersFilePath = path.join(__dirname, 'users.json');
const leadersFilePath = path.join(__dirname, 'leaders.json');


//=======================================СИСТЕМА АККАУНТОВ===============================

// Регистрация
app.post('/register', (req, res) => {
    const { login, password } = req.body;

    const users = readUsers();
    const userExists = users.some(u => u.login === login);

    if (userExists) {
        return res.status(400).send('User already exists');
    }

    const newUser = {
        login,
        password,
        hints: 3, // Начальные подсказки
        coins: 2,  // Начальные монеты
        recentGames: [], 
        score: 0
    };

    users.push(newUser);
    writeUsers(users);
    return res.status(201).send('Registration successful');
});
updateUserStructure();

app.get('/users.json', (req, res) => {
    const filePath = path.join(__dirname, 'users.json');
    res.sendFile(filePath);
});

function readUsers() {
    if (!fs.existsSync(usersFilePath)) {
        fs.writeFileSync(usersFilePath, JSON.stringify([])); // Создаём файл, если его нет
    }
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
}

function writeUsers(users) {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

function updateUserStructure() {
    const users = readUsers();

    const updatedUsers = users.map(user => ({
        ...user,
        hints: user.hints ?? 3, // Устанавливаем 3 подсказки, если их нет
        coins: user.coins ?? 2  // Устанавливаем 2 монеты, если их нет
    }));

    writeUsers(updatedUsers);
}

app.post('/update-user-data', (req, res) => {
    const updatedUserData = req.body;

    // Проверка входных данных
    if (!updatedUserData || !updatedUserData.login) {
        return res.status(400).json({ error: 'Необходимо передать данные пользователя с логином.' });
    }

    const users = readUsers();
    const userIndex = users.findIndex(user => user.login === updatedUserData.login);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'Пользователь не найден.' });
    }

    // Обновление данных пользователя
    const user = users[userIndex];
    users[userIndex] = {
        ...user, // Сохраняем существующие данные
        ...updatedUserData, // Обновляем только переданные поля
        recentGames: updatedUserData.recentGames || user.recentGames // Обновляем recentGames, если они переданы
    };

    // Если недавние игры превышают 5 записей, оставляем последние 5
    if (users[userIndex].recentGames.length > 5) {
        users[userIndex].recentGames = users[userIndex].recentGames.slice(-5);
    }

    // Сохраняем изменения в файл
    writeUsers(users);

    res.status(200).json({
        message: 'Данные пользователя успешно обновлены.',
        user: users[userIndex]
    });
});

app.get('/leaders', (req, res) => {
    fs.readFile(leadersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка при чтении leaders.json:', err);
            return res.status(500).json({ error: 'Не удалось загрузить список лидеров' });
        }

        try {
            const leaders = JSON.parse(data);
            res.json(leaders); // Отправляем содержимое файла клиенту
        } catch (parseError) {
            console.error('Ошибка при разборе JSON из leaders.json:', parseError);
            res.status(500).json({ error: 'Ошибка при разборе списка лидеров' });
        }
    });
});


// Вход
app.post('/login', (req, res) => {
    const { login, password } = req.body;
    console.log('Получен запрос на вход:', { login, password }); // Лог для отладки

    const users = readUsers();
    console.log('Существующие пользователи:', users); // Лог для проверки пользователей

    const user = users.find(u => u.login === login && u.password === password);

    if (user) {
        console.log('Успешный вход');
        req.session.currentLogin = user.login;  // Сохраняем логин в сессии
        return res.status(200).send('Login successful');
    } else {
        console.log('Ошибка входа: Неверный логин или пароль');
        return res.status(401).send('Invalid login or password');
    }
});

// Эндпоинт для получения текущего пользователя
app.get('/current-user', (req, res) => {
    // Проверяем, авторизован ли пользователь через сессию
    if (!req.session.currentLogin) {
        return res.status(401).json({ error: "Пользователь не авторизован" });
    }
    res.json({ currentLogin: req.session.currentLogin });
});

function updateLeadersFile() {
    // Чтение файла users.json
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка при чтении users.json:', err);
            return;
        }

        let users;
        try {
            users = JSON.parse(data); // Парсим содержимое users.json
        } catch (parseError) {
            console.error('Ошибка при разборе JSON из users.json:', parseError);
            return;
        }

        // Формируем список лидеров: { login, score }
        const leaders = users
            .map(user => ({
                login: user.login,
                score: user.score || 0, // Учитываем, что score может отсутствовать
            }))
            .sort((a, b) => b.score - a.score); // Сортировка по убыванию score

        // Запись отсортированных лидеров в leaders.json
        fs.writeFile(leadersFilePath, JSON.stringify(leaders, null, 2), 'utf8', writeErr => {
            if (writeErr) {
                console.error('Ошибка при записи в leaders.json:', writeErr);
            } else {
                console.log('leaders.json успешно обновлен.');
            }
        });
    });
}

// Устанавливаем интервал для обновления файла раз в 10 секунд
setInterval(updateLeadersFile, 10000);

// Запускаем первое обновление при старте сервера
updateLeadersFile();

app.post('/logout', (req, res) => {
    console.log('Запрос на выход получен');
    
    req.session.destroy((err) => {
        if (err) {
            console.error('Ошибка при завершении сессии:', err);
            return res.status(500).send('Ошибка при выходе');
        }
        res.clearCookie('user');
        console.log('Пользователь вышел, отправка успешного ответа');
        res.status(200).json({ message: 'Logout successful' }); // Успешный ответ
    });
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html')); // Или другой файл входа
});




//===============================СИСТЕМА ГЕНЕРАЦИИ СЛОВА==================================


// Обработчик запроса на случайное слово
app.get('/random-word', (req, res) => {
    const difficulty = req.query.difficulty; // Получаем уровень сложности
    const language = req.query.language; // Получаем язык

    // Проверяем, если язык не задан, по умолчанию ставим русский
    if (!language) {
        return res.status(400).send('Language is required');
    }

    let filePath;

    // Определяем, какой файл использовать в зависимости от языка и сложности
    if (language === 'ru') {
        if (difficulty === 'light') {
            filePath = wordsLightRuPath;
        } else if (difficulty === 'medium') {
            filePath = wordsMediumRuPath;
        } else if (difficulty === 'hard') {
            filePath = wordsHardRuPath;
        } else {
            return res.status(400).send('Invalid difficulty level');
        }
    } else if (language === 'en') {
        if (difficulty === 'light') {
            filePath = wordsLightEnPath;
        } else if (difficulty === 'medium') {
            filePath = wordsMediumEnPath;
        } else if (difficulty === 'hard') {
            filePath = wordsHardEnPath;
        } else {
            return res.status(400).send('Invalid difficulty level');
        }
    } else {
        return res.status(400).send('Invalid language');
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading the file');
        }
        const words = data.split('\n').filter(word => word.trim().length > 0);
        const randomIndex = Math.floor(Math.random() * words.length);
        const randomWord = words[randomIndex];
        console.log(`Случайное слово (${language}-${difficulty}):`, randomWord);
        res.send(randomWord);
    });
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


app.get('/the-hangman', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'theHangman.html'));
});

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/use-hint', (req, res) => {
    const { login } = req.body;

    if (!login) {
        return res.status(400).json({ error: 'Логин не указан' });
    }

    const users = readUsers(); // Читаем файл с пользователями
    const user = users.find(u => u.login === login);

    if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (user.hints > 0) {
        user.hints -= 1; // Уменьшаем количество подсказок
        writeUsers(users); // Сохраняем изменения в файл
        return res.json({ hints: user.hints, coins: user.coins }); // Возвращаем обновленное состояние
    } else if (user.coins > 0) {
        user.coins -= 1; // Уменьшаем количество монет
        writeUsers(users); // Сохраняем изменения в файл
        return res.json({ hints: user.hints, coins: user.coins }); // Возвращаем обновленное состояние
    } else {
        // Ничего не списываем, если ни подсказок, ни монет
        return res.status(400).json({ error: 'Недостаточно подсказок и монет' });
    }
});

app.post('/update-user-rewards', (req, res) => {
    const { login, hints, coins, score } = req.body;

    const users = readUsers();
    const user = users.find(u => u.login === login);

    if (user) {
        user.hints = hints;
        user.coins = coins;
        user.score = score;
        writeUsers(users);
        res.status(200).json({ message: 'Rewards updated successfully' });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});



app.use(express.static('public'));

app.listen(PORT, () => {
    console.log('Server is running on http://localhost:',PORT);
});
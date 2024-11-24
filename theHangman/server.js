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

const usersFilePath = path.join(__dirname, 'users.json');


//=======================================СИСТЕМА АККАУНТОВ===============================

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
        coins: 2  // Начальные монеты
    };

    users.push(newUser);
    writeUsers(users);
    return res.status(201).send('Registration successful');
});
updateUserStructure();

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


app.get('/random-word', (req, res) => {
    const difficulty = req.query.difficulty; // Получаем уровень сложности из запроса
    let filePath;

    // Определяем, какой файл использовать
    if (difficulty === 'light') {
        filePath = wordsLightRuPath;
    } else if (difficulty === 'medium') {
        filePath = wordsMediumRuPath;
    } else if (difficulty === 'hard') {
        filePath = wordsHardRuPath;
    } else {
        return res.status(400).send('Invalid difficulty level');
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading the file');
        }
        const words = data.split('\n').filter(word => word.trim().length > 0);
        const randomIndex = Math.floor(Math.random() * words.length);
        const randomWord = words[randomIndex];
        console.log(`Случайное слово (${difficulty}):`, randomWord);
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




app.use(express.static('public'));

app.listen(PORT, () => {
    console.log('Server is running on http://localhost:',PORT);
});
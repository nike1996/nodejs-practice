const express = require('express');
const app = express();
const sqlite = require('sqlite')
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const {addDays} = require('date-fns');


let dbPromise = sqlite.open({
    filename: 'todoApplication.db',
    driver: sqlite3.Database
});

app.use(express.json());


app.get('/todos', async (req, res) => {
    const db = await dbPromise;
    let { status, priority, search_q } = req.query;
    priority = priority?.toUpperCase();
    // priority = priority?.replace('%20', ' ');
    status = status?.toUpperCase();
    // status = status?.replace('%20', ' ');
    search_q = search_q?.toUpperCase();
    // search_q = search_q?.replace('%20', ' ');

    console.log(req.query);

    switch (true) {
        case status === 'TO DO':
            res.json(await db.all(`SELECT * FROM todo WHERE status = 'TO DO'`));
            break;
        case priority === 'HIGH':
            res.json(await db.all(`SELECT * FROM todo WHERE priority = 'HIGH'`));
            break;
        case priority === 'HIGH' && status === 'IN PROGRESS':
            res.json(await db.all(`SELECT * FROM todo WHERE priority = 'HIGH' AND status = 'IN PROGRESS'`));
            break;
        case search_q === 'PLAY':
            res.json(await db.all(`SELECT * FROM todo WHERE todo LIKE '%PLAY%'`));
            break;

        default:
            res.json(await db.all('SELECT * FROM todo'));
    }
});

app.get('/todos/:id', async (req, res) => {
    const db = await dbPromise;
    const { id } = req.params;
    res.json(await db.get(`SELECT * FROM todo WHERE id = ${id}`));
});

app.post("/todos/", async (request, response) => {
    const db = await dbPromise;
    const { id, todo, priority, status } = request.body; //Destructuring variables from the request body
    const insertTodo = `
            INSERT INTO todo (id, todo, priority, status)
            VALUES (${id},'${todo}','${priority}','${status}');`; //Updated the values with the variables
    await db.run(insertTodo);
    response.send("Todo Successfully Added");
});

app.put('/todos/:id', async (req, res) => {
    const db = await dbPromise;
    const { id } = req.params;
    let { todo, priority, status } = req.body;
    // convert to uppercase
    priority = priority?.toUpperCase();
    status = status?.toUpperCase();
    console.log('priority', priority);
    console.log('status', status);

    console.log('this is req.body', req.body);
    // await db.run(`UPDATE todo SET todo = '${todo}', priority = '${priority}', status = '${status}' WHERE id = ${id}`);
    // res.json({ message: 'Status Updated' });

    const fieldsToUpdate = [];
    const values = [];
    if (todo !== undefined) {
        fieldsToUpdate.push('todo = ?');
        values.push(todo);
        const query = `UPDATE todo SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
        values.push(id);
        await db.run(query, values);
        res.send('Todo Updated');
    }
    if (priority !== undefined) {
        fieldsToUpdate.push('priority = ?');
        values.push(priority);
        const query = `UPDATE todo SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
        values.push(id);
        await db.run(query, values);
        res.send('Priority Updated');
    }
    if (status !== undefined) {
        fieldsToUpdate.push('status = ?');
        values.push(status);
        const query = `UPDATE todo SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
        values.push(id);
        await db.run(query, values);
        res.send('Status Updated');
    }
});

app.delete('/todos/:id', async (req, res) => {
    const db = await dbPromise;
    const { id } = req.params;
    await db.run(`DELETE FROM todo WHERE id = ${id}`);
    res.json({ message: 'Todo Deleted' });
});

app.listen(3000, () => {
    console.log('Server started at http://localhost:3000');
});

// authentication
app.post('/users', async (req, res) => {
    const db = await dbPromise;
    const {username, name, password, gender, location} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (hashedPassword === undefined) {
        // create user
        await db.run(`INSERT INTO users (username, name, password, gender, location) VALUES ('${username}', '${name}', '${password}, ${gender}, ${location}')`);
        res.send('User Successfully Added');
    }
    else {
        res.status(401)
        res.send('Username already exists');
    }

});

// register
// he POST request with path '/register' should return 'User already exists' as a response if the username already exists
// he POST request with path '/register' should return 'Password is too short' as a response if the registrant provides a password with less than 5 characters

// app.post('/register', async (request, response) => {
//     const {username, password} = request.body
//     const hashedPassword = await bcrypt.hash(password, 10)
//     const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`
//     const dbUser = await db.get(selectUserQuery)
//     if (dbUser === undefined) {
//       if (password.length < 5) {
//         response.status(400)
//         response.send('Password is too short')
//       } else {
//         const createUserQuery = `
//         INSERT INTO
//           user (username, password)
//         VALUES
//           (
//             '${username}',
//             '${hashedPassword}'
//           );`
//         await db.run(createUserQuery)
//         response.status(200)
//         response.send('User created successfully')
//       }
//     } else {
//       response.status(400)
//       response.send('User already exists')
//     }
//   })

app.post('/register', async (req, res) => {
    const db = await dbPromise;
    const {username, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.get(`SELECT * FROM users WHERE username = '${username}'`);
    if (user === undefined) {
        if (password.length < 5) {
            res.status(400);
            res.send('Password is too short');
        }
        else {
            await db.run(`INSERT INTO users (username, password) VALUES ('${username}', '${hashedPassword}')`);
            res.send('User created successfully');
        }
    }
    else {
        res.status(400);
        res.send('User already exists');
    }
}
);

// login
app.post('/login', async (req, res) => {
    const db = await dbPromise;
    const {username, password} = req.body;
    const user = await db.get(`SELECT * FROM users WHERE username = '${username}'`);
    if (user === undefined) {
        res.status(401);
        res.send('user does not exist');
    }
    else {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            res.send('Login successful');
        }
        else {
            res.status(401);
            res.send('Incorrect password');
        }
    }
}
);


module.exports = app;


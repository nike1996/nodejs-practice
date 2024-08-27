const express = require('express')
const path = require('path')
const { open } = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { format } = require('date-fns')
const {isValid} = require('date-fns')

const app = express()

app.use(express.json())


let dbPromise = open({
    filename: 'todoApplication.db',
    driver: sqlite3.Database
})


function validateRequestParameters(req, res, next) {
    let { status, priority, search_q, category, due_date } = req.query;

    // Replace spaces in URL with %20 (handled by client/browser, but decodeURIComponent ensures proper decoding)
    // status = decodeURIComponent(status || '');
    // priority = decodeURIComponent(priority || '');
    // search_q = decodeURIComponent(search_q || '');
    // category = decodeURIComponent(category || '');
    // due_date = decodeURIComponent(due_date || '');

    // Validate priority
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
    if (priority && !validPriorities.includes(priority)) {
        return res.status(400).send('Invalid Todo Priority');
    }

    // Validate status
    const validStatuses = ['TO DO', 'IN PROGRESS', 'DONE'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).send('Invalid Todo Status');
    }

    // Validate category
    const validCategories = ['WORK', 'HOME', 'LEARNING'];
    if (category && !validCategories.includes(category)) {
        return res.status(400).send('Invalid Todo Category');
    }

    // Validate and format due_date
    if (due_date) {
        let date = new Date(due_date);
        // let month = date.getMonth() + 1;
        // let day = date.getDate();
        // let year = date.getFullYear();

        // if (month > 12 || month < 1 || day > 31 || day < 1 || year < 1000 || year > 9999) {
        //     return res.status(400).send('Invalid Due Date');
        // } else {
        //     due_date = format(date, 'yyyy-MM-dd');
        // }
        if (!isValid(date)) {
            return res.status(400).send('Invalid Due Date');
        } else {
            due_date = format(date, 'yyyy-MM-dd');
        }
    }
    next()

}

app.get('/todos', validateRequestParameters, async (req, res) => {
    const db = await dbPromise;
    console.log(req.query)
    let { status, priority, search_q, category, due_date } = req.query;
    // let { todoId } = req.params;
    let query = `SELECT * FROM todo`
    let queryArray = []
    if (status !== undefined) {
        queryArray.push(`status = '${status}'`)
    }
    if (priority !== undefined) {
        queryArray.push(`priority = '${priority}'`)
    }
    if (search_q !== undefined) {
        queryArray.push(`todo LIKE '%${search_q}%'`)
    }
    if (category !== undefined) {
        queryArray.push(`category = '${category}'`)
    }
    if (due_date !== undefined) {
        queryArray.push(`due_date = '${due_date}'`)
    }
    if (queryArray.length !== 0) {
        query += ` WHERE ${queryArray.join(' AND ')}`
    }
    query += ';'
    console.log(query)
    let result = await db.all(query)
    // to camel case
    result = result.map((todo) => {
        return {
            id: todo.id,
            todo: todo.todo,
            priority: todo.priority,
            status: todo.status,
            category: todo.category,
            dueDate: todo.due_date
        }
    })
    console.log(result)
    res.json(result)

});

app.get('/todos/:todoId/', async (req, res) => {
    const db = await dbPromise;
    let { todoId } = req.params;
    let query = `SELECT * FROM todo WHERE id = ${todoId};`
    let result = await db.get(query)
    if (result === undefined) {
        res.status(400).send('Invalid Todo Id')
    }
    result = {
        id: result.id,
        todo: result.todo,
        priority: result.priority,
        status: result.status,
        category: result.category,
        dueDate: result.due_date
    }
    res.json(result)
});

app.get('/agenda/', async (req, res) => {
    const db = await dbPromise;
    let { date } = req.query;
    let query = `SELECT * FROM todo WHERE due_date = '${date}';`
    let result = await db.all(query)
    result = result.map((todo) => {
        return {
            id: todo.id,
            todo: todo.todo,
            priority: todo.priority,
            status: todo.status,
            category: todo.category,
            dueDate: todo.due_date
        }
    }
    )
    res.json(result)
}
);

app.post('/todos/', async (req, res) => {
    const db = await dbPromise;
    let { todo, priority, status, category, dueDate } = req.body;
    let query = `INSERT INTO todo (todo, priority, status, category, due_date) VALUES ('${todo}', '${priority}', '${status}', '${category}', '${dueDate}');`
    await db.run(query)
    res.send('Todo Successfully Added')
}
);

app.put('/todos/:todoId/', async (req, res) => {
    const db = await dbPromise;
    let { todoId } = req.params;
    let { todo, priority, status, category, dueDate } = req.body;

    // check if all fields are present
    if (todo !== undefined) {
        let query = `UPDATE todo SET todo = '${todo}' WHERE id = ${todoId};` // update todo
        await db.run(query)
        res.send('Todo Updated')
        return
    }
    if (priority !== undefined) {
        let query = `UPDATE todo SET priority = '${priority}' WHERE id = ${todoId};` // update priority
        await db.run(query)
        res.send('Priority Updated')
        return
    }
    if (status !== undefined) {
        let query = `UPDATE todo SET status = '${status}' WHERE id = ${todoId};` // update status
        await db.run(query)
        res.send('Status Updated')
        return
    }
    if (category !== undefined) {
        let query = `UPDATE todo SET category = '${category}' WHERE id = ${todoId};` // update category
        await db.run(query)
        res.send('Category Updated')
        return
    }
    if (dueDate !== undefined) {
        let query = `UPDATE todo SET due_date = '${dueDate}' WHERE id = ${todoId};` // update due date
        await db.run(query)
        res.send('Due Date Updated')
        return
    }

    // let query = `UPDATE todo SET todo = '${todo}', priority = '${priority}', status = '${status}', category = '${category}', due_date = '${dueDate}' WHERE id = ${todoId};`
    // await db.run(query)
    // res.send('Todo Updated Successfully')
    //
});

app.delete('/todos/:todoId/', async (req, res) => {
    const db = await dbPromise;
    let { todoId } = req.params;
    let query = `DELETE FROM todo WHERE id = ${todoId};`
    await db.run(query)
    res.send('Todo Deleted')
});

app.listen(3000, () => {
    console.log('Server started at http://localhost:3000/')
});

module.exports = app;

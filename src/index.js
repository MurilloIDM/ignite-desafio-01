const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userAlreadyExists = users.find((user) => user.username === username);

  if (!userAlreadyExists) {
    return response.status(400).json({ error: "User not exists!"});
  }

  request.user = userAlreadyExists;
  next();
}

function checksExistsTodoInList(request, response, next) {
  const { user } = request;
  const { id } = request.params;

  const todoSelected = user.todos.findIndex((todo) => todo.id === id);

  if (!todoSelected) {
    return response.status(400).json({ error: "Todo not exists!" });
  }

  request.todoSelected = todoSelected;

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(users);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(newTodo);

  return response.status(201).send();
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodoInList, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  user.todos.forEach((todo) => {
    if (todo.id === id) {
      todo.title = title;
      todo.deadline = deadline;
    }
  });

  return response.send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodoInList, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  user.todos.forEach((todo) => {
    if (todo.id === id) {
      todo.done = true;
    }
  });

  return response.send();
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodoInList, (request, response) => {
  const { user } = request;
  const { todoSelected } = request;

  user.todos.splice(todoSelected, 1);

  return response.send();
});

module.exports = app;
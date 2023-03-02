const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Todo = require('../models/todo');
const User = require('../models/user');

const getTodosByUserId = async (req, res, next)=>{
    const userId = req.params.uid;
    let userWithTodos;
    try {
        userWithTodos = await User.findById(userId).populate('todos');
    } catch (err) {
        const error = new HttpError(
            'Fetching todos failed, please try again later',
            500
        );
        return next(error);
    }
    if (!userWithTodos || userWithTodos.todos.length === 0) {
        return next(
            new HttpError('Could not find todos for the provided user id.', 404)
        );
    }

    res.json({
        todos: userWithTodos.todos.map(todo =>
            todo.toObject({ getters: true })
        )
    });
}
const createTodo = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    }

    const { content, isDone, creator } = req.body;

    const createdTodo = new Todo({
        content,
        isDone,
        creator
    });

    let user;
    try {
        user = await User.findById(creator);
    } catch (err) {
        const error = new HttpError('Creating todo failed, please try again', 500);
        return next(error);
    }

    if (!user) {
        const error = new HttpError('Could not find user for provided id', 404);
        return next(error);
    }

    console.log(user);

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdTodo.save({ session: sess });
        user.todos.push(createdTodo);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Creating todo failed, please try again.',
            500
        );
        return next(error);
    }

    res.status(201).json({ todo: createdTodo });
};

exports.createTodo = createTodo
exports.getTodosByUserId = getTodosByUserId

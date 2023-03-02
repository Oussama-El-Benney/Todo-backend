const express = require('express');
const { check } = require('express-validator');

const todosControllers = require('../controllers/todos-controllers');

const router = express.Router();


router.get('/user/:uid', todosControllers.getTodosByUserId);

router.post(
    '/',
    [
        check('content')
            .not()
            .isEmpty(),
        check('isDone')
            .not()
            .isEmpty()
    ],
    todosControllers.createTodo
);
module.exports = router;

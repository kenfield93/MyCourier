/**
 * Created by kyle on 9/8/16.
 */
var express = require('express');
var authorRouter = express.Router();

var router = function(nav){
    var authors = [
        {
            name: 'Buttholes',
            books: [{title: 'big', id: 0}, {title: 'booty', id: 0}, {title: 'hoes', id: 0}]
        },
        {
            name: 'jk pooping',
            books: [{title: 'sorrerers poop', id:1}, { title: 'chamber of poop', id:1}, { title: 'prisoner of poopistan', id:1}, { title: 'goblet of poop', id:1}]
        }
    ];

    authorRouter.route('/')
        .get(function (req, res) {
            res.render('authorListView', {
                nav: nav,
                title: 'EJS render',
                authors: authors
            });
        });

    authorRouter.route('/:id')
        .get(function (req, res) {
            var id = req.params.id;
            res.render('authorView', {
                nav: nav,
                title: 'EJS render',
                authors: authors[id]
            });
        });

    return authorRouter;
};
module.exports = router;
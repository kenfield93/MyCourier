/**
 * Created by kyle on 9/16/16.
 */

var should = require('should'),
    sinon = require('sinon');

describe('Book Controller Tests:', function(){
   describe('Post', function(){
       it('should not allow an empty title on post', function(){
           var Book = function(book){this.save = function(){}};

           var req = {
               body: {
                   author: '1'
               }
           };

           var response = {
               status: sinon.spy(),
               send: sinon.spy()
           };

           var bookController = require('../controllers/bookController')()
           res.status.calledWith(400).should.equal('true', 'bad status ' + res.status.args[0][0]);
           //res.send.calledWith()
       });
    })
});
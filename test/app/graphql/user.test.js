'use strict';
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const url = 'http://localhost:7001/';
const request = require('supertest')(url);
describe('GraphQL', () => {
  it('Returns user with id = 1', done => {
    request.post('/graphql')
      .send({ query: '{ user(id: 1) { id  } }' })
      .expect(200)
      .end((err, res) => {
        // res will contain array with one user
        if (err) return done(err);
        res.body.data.user.should.have.property('id');
        done();
      });
  });
});

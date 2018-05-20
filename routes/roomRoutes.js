const express = require('express');
const router = express.Router();
const { ObjectID } = require('mongodb');

const User = require('../models/userModel');
const { Room } = require('../models/roomModel');
let { authenticate } = require('./../middleware/auth');


// GET all the rooms
router.get('/', authenticate, async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('apartment')
      .populate('user');
    if (!rooms) res.status(400).send({ error: 'No rooms found', api: 'GET/rooms' });
    
    res.send({ message: 'Rooms retrieved succesfully', api: 'GET/rooms', rooms });
  } catch (e) {
    res.status(400).send({ error: 'There was an error in retrieving the rooms', api: 'GET/rooms', e });
  }
});

// GET query of rooms
router.get('/query', authenticate, async (req, res) => {
  try {
    const searchQuery = req.query;
    // in the search term I want to be able to query both query with name or description, then query both with only one. So I take which has been queried and copy that across to query both, plus I query the label with the search term just for wider visibilty
    if (req.query.name || req.query.description) {
      req.query.$or = [];
      req.query.$or.push({ name: new RegExp(req.query.name || req.query.description, 'i') });
      req.query.$or.push({ description: new RegExp(req.query.description || req.query.name, 'i') });
      req.query.$or.push({ 'label': new RegExp(req.query.description || req.query.name, 'i') });
      delete req.query.name;
    }
    const mongoQuery = { $and: [{ }] };

    mongoQuery.$and.push(searchQuery);
  
    const rooms = await Room.find(mongoQuery)
      .populate('apartment')
      .populate('user');
    if (!rooms) res.status(400).send({ error: 'No rooms found', api: 'GET/rooms/query' });
    
    res.send({ message: 'Rooms retrieved by the query', api: 'GET/rooms/query', rooms });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Create a new room
router.post('/', authenticate, (req, res) => {
  const token = req.header('x-auth') || req.session.accessToken;
  const { body } = req;

  const room = new Room(body);

  User.findByToken(token)
    .then(user => {
      room.createdBy = user;
      return room.save();
    })
    .then(room => res.send({ room }))
    .catch(e => {
      e.error ? res.status(400).send(e.error.erromsg) : res.status(400).send(e);
    });
});

// UPDATE room
router.patch('/:id', authenticate, (req, res) => {
  const token = req.header('x-auth') || req.session.accessToken;
  const { id } = req.params;
  const { body } = req;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send({ error: 'ObjectID not valid' });
  }

  User.findByToken(token)
    .then(user => {
      return Room.findByIdAndUpdate(id, {
        $set: body,
        updatedBy: user._id
      }, { new: true });
    })
    .then(room => res.send({ room }))
    .catch(e => res.status(400).send(e));
});

// DELETE room
router.delete('/:id', authenticate, (req, res) => {
  const { id } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send({ error: 'ObjectID not valid' });
  }

  Room.findByIdAndRemove(id)
    .then(() => res.send({ message: 'Room Deleted' })
    .catch(e => res.status(400).send(e)));
});

module.exports = router;

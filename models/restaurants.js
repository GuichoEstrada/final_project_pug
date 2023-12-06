/********************************************************************************** 
 * ITE5315 – Final Project
 * I declare that this assignment is my own work in accordance with Humber Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.*
 * Name: Luis Carlo Estrada | Steven Marty Ces Student ID: N01541627 Date: 11/23/2023
 **********************************************************************************/
// load mongoose since we need it to define a model
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GradeSchema = new Schema({
    date: Date,
    grade: String,
    score: Number
});

const AddressSchema = new Schema({
    building: String,
    coord: {
        type: [Number]
    },
    street: String,
    zipcode: String,
    borough: String,
    cuisine: String
});

const RestaurantSchema = new Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    address: AddressSchema,
    grades: [GradeSchema],
    name: String,
    restaurant_id: String,
    borough: String,
    cuisine: String
});

const RestaurantModel = mongoose.model('Restaurant', RestaurantSchema);

module.exports = RestaurantModel;
const mongoose = require('mongoose');
const RestaurantModel = require('../models/restaurants');

const initialize = async (connectionString) => {
    try {
        await mongoose.connect(connectionString);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        throw error;
    }
};

const addNewRestaurant = async (data) => {
    try {
        const newRestaurant = new RestaurantModel(data);
        await newRestaurant.save();
        console.log('New restaurant added:', newRestaurant);
        return newRestaurant;
    } catch (error) {
        console.error('Error adding new restaurant:', error.message);
        throw error;
    }
};

const getAllRestaurants = async (page, perPage, borough) => {
    try {
        const query = borough ? { borough } : {};
        const totalCount = await RestaurantModel.countDocuments(query);
        const totalPages = Math.ceil(totalCount / perPage);

        if (page < 1 || page > totalPages) {
            throw new Error('Invalid page number');
        }

        const skip = (page - 1) * perPage;

        const restaurants = await RestaurantModel
            .find(query)
            .sort({ restaurant_id: 1 })
            .skip(skip)
            .limit(perPage);

        return restaurants;
    } catch (error) {
        console.error('Error retrieving restaurants:', error.message);
        throw error;
    }
};

module.exports = {
    initialize,
    addNewRestaurant,
    getAllRestaurants,
};
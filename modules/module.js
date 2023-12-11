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
        // Create a new instance of the RestaurantModel with the provided data
        const newRestaurant = new RestaurantModel(data);

        // Save the new restaurant to the database
        const savedRestaurant = await newRestaurant.save();

        return savedRestaurant;
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

        return { restaurants, totalPages };
    } catch (error) {
        console.error('Error retrieving restaurants:', error.message);
        throw error;
    }
};

const getRestaurantById = async (id) => {
    try {
        const restaurant = await RestaurantModel.findOne({ _id: id });

        if (!restaurant) {
            throw new Error('Restaurant not found');
        }

        return restaurant;
    } catch (error) {
        console.error(`Error retrieving restaurant by ID (${id}):`, error.message);
        return null; // Return null when the restaurant is not found
    }
};

const deleteRestaurantById = async (restaurant_id) => {
    try {
        // Use Mongoose's deleteOne method to remove the restaurant by _id
        const result = await RestaurantModel.deleteOne({ 'restaurant_id': restaurant_id });

        if (result.deletedCount === 1) {
            // Restaurant successfully deleted
            console.log('Result:', result);
            return { success: true, message: 'Restaurant deleted successfully' };
            
        } else {
            // Restaurant not found
            return { success: false, message: 'Restaurant not found' };
        }
    } catch (error) {
        console.error('Error deleting restaurant:', error.message);
        throw error;
    }
};

const searchRestaurantsByAddress = async (borough, page, perPage) => {
    try {
        const query = borough ? { borough } : {};
        const resultsCount = await RestaurantModel.find({ 'borough': borough });
        const totalPages = Math.ceil(resultsCount / perPage);

        if (page < 1 || page > totalPages) {
            throw new Error('Invalid page number');
        }

        const skip = (page - 1) * perPage;

        const results = await RestaurantModel
            .find(query)
            .sort({ restaurant_id: 1 })
            .skip(skip)
            .limit(perPage);

        return { results, totalPages };
    } catch (error) {
        console.error('Error searching restaurants by borough:', error.message);
        throw error;
    }
};

module.exports = {
    initialize,
    addNewRestaurant,
    getAllRestaurants,
    getRestaurantById,
    addNewRestaurant,
    deleteRestaurantById,
    searchRestaurantsByAddress
};
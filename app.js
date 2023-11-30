/********************************************************************************** 
 * ITE5315 – Final Project
 * I declare that this assignment is my own work in accordance with Humber Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.*
 * Name: Luis Carlo Estrada Student ID: N01541627 Date: 11/23/2023
 **********************************************************************************/
const express = require('express');
const restaurantModule = require('./modules/module');
const config = require('./config/database');

const app = express();
const port = 3000;

// Set the view engine to Pug
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// Initialize the module before starting the server
restaurantModule.initialize(config.url)
    .then(() => {
        // Define your routes after successful MongoDB connection
        defineRoutes();
        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Failed to initialize restaurant module:', error.message);
    });

// Function to define routes
const defineRoutes = () => {
    // Route to add a new restaurant
    app.post('/restaurants', async (req, res) => {
        try {
            const newRestaurant = await restaurantModule.addNewRestaurant(req.body);
            res.status(201).json(newRestaurant);
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    });

    // Route to get all restaurants
    app.get('/restaurants', async (req, res) => {
        try {
            const page = req.query.page || 1;
            const perPage = req.query.perPage || 10;
            const borough = req.query.borough || null;
    
            const restaurants = await restaurantModule.getAllRestaurants(page, perPage, borough);
            res.render('main', { restaurants });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    });

    // Add other routes as needed
};
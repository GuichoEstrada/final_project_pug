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
const path = require('path');

const app = express();
const port = 3000;

app.set('views', path.join(__dirname, 'views', 'layouts'));
app.set('view engine', 'pug');

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
    // Landing page
    app.get('/', async (req, res) => {
        try {
            res.send('WELCOME')
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    });
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

    app.get('/restaurants/:id', async (req, res) => {
        const restaurantId = req.params.id;
    
        try {
            const restaurant = await restaurantModule.getRestaurantById(restaurantId);
    
            if (restaurant) {
                // Restaurant found
                res.render('main', { restaurants: [restaurant] });  // Render the main layout
            } else {
                // Restaurant not found
                res.status(404).send('Restaurant not found');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    });

    app.delete('/restaurants/:id', async (req, res) => {
        const restaurantIdToDelete = req.params.id;
    
        try {
            const deleteResult = await restaurantModule.deleteRestaurantById(restaurantIdToDelete);
    
            if (deleteResult.success) {
                res.status(200).json({ message: 'Restaurant deleted successfully' });
            } else {
                res.status(404).json({ message: 'Restaurant not found or could not be deleted' });
            }
        } catch (error) {
            console.error('Error deleting restaurant:', error.message);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });
    
};
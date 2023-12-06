/********************************************************************************** 
 * ITE5315 – Final Project
 * I declare that this assignment is my own work in accordance with Humber Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.*
 * Name: Luis Carlo Estrada | Steven Marty Ces Student ID: N01541627 Date: 11/23/2023
 **********************************************************************************/

const express = require('express');
const http = require('http');
// const Greenlock = require('greenlock');
const restaurantModule = require('./modules/module');
const config = require('./config/database');
const bodyParser = require('body-parser');
const path = require('path');
const Restaurant = require('./models/restaurants');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
require('dotenv').config();
const connectionString = process.env.MONGODB_URI
const app = express();
const PORT = process.env.PORT | 3000;

// Use middleware to parse URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'views', 'layouts'));
app.set('view engine', 'pug');

app.use('/public', express.static('public'));

// Greenlock setup for HTTPS and SSL Certificates
// const greenlock = Greenlock.create({
//     packageRoot: __dirname,
//     configDir: "./greenlock.d/",
//     packageAgent: 'final_project/1.0.0',  // Replace with your app name and version
//     maintainerEmail: 'lcrestrada.dev@gmail.com',  // Replace with your email
//     staging: true,  // Change to false for production
//     notify: function (event, details) {
//       if ('error' === event) {
//         console.error(details);
//       }
//     },
//   });

// const altnames = ['localhost'];

// greenlock
// .add({
//     subject: altnames[0],
//     altnames: altnames,
// })
// .then(function () {
//     // saved config to db (or file system)
// });

// Initialize the module before starting the server
restaurantModule.initialize(connectionString)
    .then(() => {
        // Define your routes after a successful MongoDB connection
        defineRoutes();

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Failed to initialize the restaurant module:', error.message);
});

// Function to define routes
const defineRoutes = () => {
    // Landing page
    app.get('/', async (req, res) => {
        try {
            res.render('landing.pug')
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    });
    // Registration page
    app.get('/registration', async (req, res) => {
        try {
            res.render('registration.pug')
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    });
    // Route to add a new restaurant
    app.post('/api/addNewRestaurant', async (req, res) => {
        try {
            // Get the restaurant data from the request body
            const { building, street, zipcode, borough, name, restaurant_id, cuisine } = req.body;
    
            // Validate the required fields
            if (!building || !street || !zipcode || !borough || !name || !restaurant_id || !cuisine) {
                return res.status(400).json({ error: 'Incomplete restaurant data' });
            }
    
            // Create a new restaurant object
            const newRestaurant = new Restaurant({
                building,
                street,
                zipcode,
                borough,
                name,
                restaurant_id,
                cuisine,
            });
    
            // Save the new restaurant to the MongoDB database
            const savedRestaurant = await newRestaurant.save();
            console.log(savedRestaurant)
            // Respond with the saved restaurant data
            res.status(201).json(savedRestaurant);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    app.get('/api/addNewRestaurant', async (req, res) => {
        try {
            res.render('addRestaurant')
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    });

    // Route to get all restaurants
    app.get('/api/restaurants', async (req, res) => {
        try {
            const page = req.query.page || 1;
            const perPage = req.query.perPage || 10;
            const borough = req.query.borough || null;
            const showNotification = req.query.notification === 'added';
            const restaurants = await restaurantModule.getAllRestaurants(page, perPage, borough);
            res.render('main', { 
                restaurants,
                showNotification 
            })
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    });

    app.get('/api/restaurants/:id', async (req, res) => {
        const restaurantId = req.params.id;
    
        try {
            const restaurant = await restaurantModule.getRestaurantById(restaurantId);
    
            if (restaurant) {
                // Restaurant found
                res.render('main', { restaurants: [restaurant] }); 
            } else {
                // Restaurant not found
                res.status(404).send('Restaurant not found');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    });

    // Route to update restaurant data
    app.put('/api/updateRestaurant/:id', async (req, res) => {
        const restaurantIdToUpdate = req.params.id;
    
        try {
            // Your validation logic here...
    
            // Extract updated data from the request body
            const { building, street, zipcode, borough, name, cuisine } = req.body;
    
            // Construct the updated restaurant object
            const updatedRestaurant = {
                address: {
                    building,
                    street,
                    zipcode,
                    borough,
                },
                name,
                cuisine,
            };
    
            // Update the restaurant in the database
            const updateResult = await RestaurantModel.findByIdAndUpdate(
                { _id: new ObjectId(restaurantIdToUpdate) },
                { $set: updatedRestaurant },
                { new: true } // Return the updated document
            );
    
            if (updateResult) {
                // If successfully updated, send a JSON response
                res.status(200).json({ message: 'Restaurant updated successfully', updatedRestaurant: updateResult });
            } else {
                // If the restaurant is not found, send an error response
                res.status(404).json({ message: 'Restaurant not found or could not be updated' });
            }
        } catch (error) {
            console.error('Error updating restaurant:', error.message);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    });

    // Route to delete restaurant
    app.delete('/api/restaurants/:id', async (req, res) => {
        const RestaurantId = req.params.id;
    
        try {
            // Delete the restaurant by ID from the MongoDB database
            const deleteResult = await restaurantModule.deleteRestaurantById(RestaurantId);
    
            if (deleteResult.success) {
                // If successfully deleted, send a JSON response
                res.status(200).json({ message: 'Restaurant deleted successfully' });
            } else {
                // If not found or could not be deleted, send an error JSON response
                res.status(404).json({ message: 'Restaurant not found or could not be deleted' });
            }
        } catch (error) {
            console.error('Error deleting restaurant:', error.message);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    });
    
    // Additional Feature ( Search by Borough)
    // Route for search bar
    app.get('/api/search', async (req, res) => {
        try {
            res.render('search');
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    });
    //Route for search result
    // Assuming you have a restaurantModule with a function searchRestaurantsByAddress
    app.post('/api/search', async (req, res) => {
        try {
            const address = req.body.keyword;
            const restaurants = await restaurantModule.searchRestaurantsByAddress(address);
            // Render the 'main' template with the search results
            res.render('search', {
                restaurants
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    });
    
};
/********************************************************************************** 
 * ITE5315 – Final Project
 * I declare that this assignment is my own work in accordance with Humber Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.*
 * Name: Luis Carlo Estrada | Steven Marty Ces Student ID: N01541627 Date: 11/23/2023
 **********************************************************************************/
require('dotenv').config();
const express = require('express');
const https = require('https');
const fs = require('fs');
const config = require('./config/database');
const connectionString = process.env.MONGODB_URI
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const path = require('path');

const restaurantModule = require('./modules/module');
const Restaurant = require('./models/restaurants');
const UserModel = require('./models/users');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const app = express();
const PORT = process.env.PORT | 3000;

// Use middleware to parse URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('views', path.join(__dirname, 'views', 'layouts'));
app.set('view engine', 'pug');

app.use('/public', express.static('public'));
app.use(express.json());

// Initialize the module before starting the server
restaurantModule.initialize(connectionString)
    .then(() => {
        // Define your routes after a successful MongoDB connection
        defineRoutes();

        const privateKeyPath = 'C:/Users/Carlo/key.pem';
        const certificatePath = 'C:/Users/Carlo/cert.pem';

        // Configure HTTPS
        const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
        const certificate = fs.readFileSync(certificatePath, 'utf8');
        const credentials = { key: privateKey, cert: certificate, passphrase:'password' };
        const server = https.createServer(credentials, app);
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Failed to initialize the restaurant module:', error.message);
});

// Create a middleware function for authentication
const authenticate = async (req, res, next) => {
    try {
        console.log('Authenticate Middleware Executed');
        const token = req.header('Authorization')?.replace('Bearer ', '');
        console.log('Token:', token);

        if (!token) {
            throw new Error('Token missing');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await UserModel.findOne({ _id: decoded.userId });

        console.log('Decoded Token:', decoded);
        console.log('User:', user);
        if (!user) {
            throw new Error('User not found');
        }
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication Error:', error);
        res.status(401).json({ error: `Authentication failed: ${error.message}` });
    }
};

// Function to define routes
const defineRoutes = () => {
    // Default route
    app.get('/', async (req, res) => {
        try {
            res.render('landing', { query: req.query, user: req.user });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    });
    // Logging In
    app.get('/login', async (req, res) => {
        try {
            res.render('landing', { query: req.query, user: req.user });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    });

    app.post('/login', async (req, res) => {
        try {
            const { email, password } = req.body;
            // Check user credentials and get the user
            const user = await UserModel.findByCredentials(email, password);
            console.log('Logged in user:', user);
            // Generate a JWT token using the generateToken method
            const token = user.generateToken();
            console.log('Generated Token:', token);
            // Send the token in the response header
            res.json({ token: token });
        } catch (error) {
            console.error(error);
            res.status(401).json({ error: 'Invalid credentials' });
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
    app.post('/register', async (req, res) => {
        try {
          const userData = {
            email: req.body.email,
            password: req.body.password,
          };
      
          // Create a new user using the model
          const newUser = new UserModel(userData);
      
          // Save the new user to the database
          await newUser.save();

          res.redirect('/login?registrationSuccess=true');
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
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
            const page = parseInt(req.query.page) || 1;
            const perPage = req.query.perPage || 10;
            const showNotification = req.query.notification === 'added';
            const { restaurants, totalPages } = await restaurantModule.getAllRestaurants(page, perPage);
    
            const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    
            res.render('main', {
                restaurants,
                showNotification,
                pages,
                currentPage: page
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    })

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
            const page = parseInt(req.query.page) || 1;
            const perPage = req.query.perPage || 10;
            const address = req.body.keyword;
            const { results, totalPages } = await restaurantModule.searchRestaurantsByAddress(address, page, perPage);

            const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
            
            res.render('search', {
                restaurants:results,
                pages,
                currentPage: page
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    });
    
};
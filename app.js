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

//load the handlebars module
const exphbs = require('express-handlebars');
//app.set('view engine', 'hbs');

//loads the path module
const path = require('path');

app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs', 
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
}));
app.set('view engine', '.hbs');


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
            res.render('layouts/main', { restaurants });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    });

    // Add other routes as needed
};
/***********************************************************************************************************************************
//Ongoing code for Step 5
app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs', 
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views'),
    runtimeOptions: {
        allowProtoPropertiesByDefault: true, // Disable the warning for accessing non-own properties
        allowProtoMethodsByDefault: true // Disable the warning for accessing non-own methods
    }
  }));
  app.set('view engine', '.hbs');

  //get all info of restaurant records
  const RestaurantModel = require('./models/restaurants'); // replace with the path to your model

app.get('/search', function(req, res) {
    // use mongoose to get all restaurants in the database
    RestaurantModel.find({})
        .then(restaurants => {
            // render the 'table' view with the retrieved restaurants
            res.render('search', { restaurants: restaurants });
        })
        .catch(err => {
            // send the error if there is an error retrieving
            res.status(500).send(err);
        });
});

app.post('/searched', (req, res) => {
	const keyword = req.body.keyword;
  
	// use Mongoose to get all restaurants in the database
	RestaurantModel.find({})
		.then(restaurants => {
			const filteredData = restaurants.filter(
				item =>
					item.restaurant_id.toLowerCase().includes(keyword.toLowerCase()) ||
					item.address.street.toLowerCase().includes(keyword.toLowerCase())
			);
  
			if (filteredData.length > 0) {
				res.render('table', { restaurants: filteredData });
			} else {
				res.send('No results found');
			}
		})
		.catch(err => {
			console.error(err);
			res.status(500).send('Error loading data from database');
		});
});
********************************************************************************************************************************** */

  
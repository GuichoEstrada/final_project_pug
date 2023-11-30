/********************************************************************************** 
 * ITE5315 – Final Project
 * I declare that this assignment is my own work in accordance with Humber Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.*
 * Name: Luis Carlo Estrada Student ID: N01541627 Date: 11/23/2023
 **********************************************************************************/
const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/database');
const RestaurantModel = require('./models/restaurants');

const app = express();
const port = 3000;

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

mongoose.connect(config.url);

app.get('/restaurants', async (req, res) => {
    try {
        const restaurants = await RestaurantModel.find({}, 'name cuisine');
        res.render('restaurants', { restaurants }); // Render the 'restaurants' template
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
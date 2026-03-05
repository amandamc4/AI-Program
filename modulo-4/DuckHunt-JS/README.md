# DUCK HUNT JS v3.0 auto play with TensorFlow and Yolo

This is an implementation of DuckHunt in Javascript and HTML5. It uses the PixiJS rendering engine, Green Sock Animations, Howler, and Bluebird Promises. This implementation was done by (https://github.com/MattSurabian/DuckHunt-JS)

In this application, we use YOLO, a powerful model for real-time object detection. After being rained with the game image, the model has been converted to Tensorflow.js. It created a model.json file with the model topology and a manifest of the weight files (bin). It then uses Tensorflow.js to run detection of the ducks in the browser, where it transforms the screen pixels into vectors and find the coordinates of the ducks (identified as kites) so we know where to aim.

## Working With This Repo

 - You must have [nodejs](https://nodejs.org/) installed.
 - run `npm install`
 - Use `npm start` to start a local webserver which will make the site available at http://localhost:8080/. 
 
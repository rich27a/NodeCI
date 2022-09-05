require("../models/User");

// const { jest } = require("jest");

const mongoose = require("mongoose");
const keys = require("../config/keys");

// mongoose.Promise = global.Promise;
// mongoose.connect(keys.mongoURI, { useMongoClient: true });
Number.prototype._called = {};
mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useMongoClient: true });

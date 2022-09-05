const { json } = require("body-parser");
const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");
const keys = require("../config/keys");

const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || "");

  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    console.log("returning from mongodb");
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );

  //   see if we have value for 'key' in redis
  const cachedValue = await client.hget(this.hashKey, key);

  //if we do, return that
  if (cachedValue) {
    console.log("returning from cache");
    const doc = JSON.parse(cachedValue);

    return Array.isArray(doc)
      ? doc.map((d) => new this.model(d))
      : new this.model(doc);
  }

  //otherwise, issue the query and store the result in redis

  const result = await exec.apply(this, arguments);

  client.hset(this.hashKey, key, JSON.stringify(result));
  //   console.log(result);

  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  },
};

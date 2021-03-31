const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../configs/db.config');

const client = redis.createClient(keys.REDIS_URI);

client.on('connect', () => {
    console.log('Redis client connected');
});

client.on('error', (err) => {
    console.log('Something went wrong ' + err);
});

/** hget cmd is used to get the value associated with the field in the hashed stored a key.
 * Node Redis doesn’t natively support promises, so we promisify it.
 */
client.hget = util.promisify(client.hget);

/** create reference for .exec
 *  Every query in mongoose uses a Query class to build the query and then executes it via exec function
 *  exec() will return a promise if no callback is provided. So the following pattern is very convenient and generic - it can handle callbacks or promises nicely:
 */
const exec = mongoose.Query.prototype.exec;

/** Create new cache function on prototype
 *  Js prototype property allows you to add new properties to object constructors:
 */
mongoose.Query.prototype.cache = function (options = { expire: 60 }) {
    this.useCache = true;
    this.expire = options.expire;
    this.hashKey = JSON.stringify(options.key || this.mongooseCollection.name);

    return this;
}

/** Override exec function to first check cache for data
 *  What we want to happen is upon every query, first check if the data is cached in Redis. 
 * If it is, we return that data. If it is NOT, we will retrieve the data from MongoDB and also cache it in Redis.
 */
mongoose.Query.prototype.exec = async function () {
    // Check if the query should use cache.
    if (!this.useCache) {
        return await exec.apply(this, arguments);
    }

    // Create a unique key for the cache, which is the query itself and collection name.
    //  The Redis key has to be a string so we convert it using JSON.stringify.
    const key = JSON.stringify({
        ...this.getQuery(),
        collection: this.mongooseCollection.name
    });

    // get cached value from redis
    // Try to retrieve the data from cache and store in cacheValue.
    const cacheValue = await client.hget(this.hashKey, key);

    /** If cache value is not found, fetch data from mongodb and cache it
     *  If no data is returned for cacheValue, we move forward with querying MongoDB using the exec function and store the value in cache.
     */
    if (!cacheValue) {
        const result = await exec.apply(this, arguments);
        // Sets field in the hash stored at key to value . If key does not exist, a new key holding a hash is created. If field already exists in the hash, it is overwritten
        client.hset(this.hashKey, key, JSON.stringify(result));
        client.expire(this.hashKey, this.expire);

        console.log('Returning data from MongoDB');
        return result;
    }

    /** Return found cachedValue
     * If data for cacheValue is retrieved, we need to first parse it. 
     * Since we are using mongoose, we have to make sure to return a mongoose model.
     * We accomplish this by passing the data into the mongoose model.
    */
    const doc = JSON.parse(cacheValue);
    console.log('Returning data from Redis');
    return Array.isArray(doc)
        ? doc.map(d => new this.model(d))
        : new this.model(doc);
};

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
}
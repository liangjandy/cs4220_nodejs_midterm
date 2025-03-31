import fs from 'fs';
import path from 'path';
import url from 'url';

// In ECMAScript Modules (ESM), __dirname is not available directly like in CommonJS
// Use 'url' and 'path' modules to achieve similar functionality
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path to the mock database directory
const dbDirectory = path.resolve(__dirname, 'mock_database');

/**
 * Reads and parses JSON data from a file.
 * @param {string} collection - the name of the collection file.
 * @returns {Promise<Array|Object>} the parsed JSON data from the collection.
 * @throws {Error} an error if there's an issue reading or parsing the data.
 */
const _read = async (collection) => {
    try {
        const fullPath = path.resolve(dbDirectory, `${collection}.json`);
        const data = await fs.promises.readFile(fullPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`Error reading data from collection ${collection}: ${error.message}`);
    }
};

/**
 * Inserts a new entry in a collection.
 * @param {string} collection - the name of the collection file.
 * @param {Object} data - the data to be added to the collection.
 * @returns {Promise<void>} a Promise that resolves when the operation is complete.
 * @throws {Error} an error if there's an issue inserting the record.
 */
export const insert = async (collection, data) => {
    try {
        // Generate a simple unique ID based on timestamp and random number
        const _id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Add the generated _id to the record
        const recordWithId = { ...data, _id };

        // Read existing records from the collection
        const records = await _read(collection);

        // Push the new record with the unique _id
        records.push(recordWithId);

        // Write the updated records back to the file
        const fullPath = path.resolve(dbDirectory, `${collection}.json`);
        await fs.promises.writeFile(fullPath, JSON.stringify(records, null, 2));
    } catch (error) {
        throw new Error(`Error inserting record in collection ${collection}: ${error.message}`);
    }
};

/**
 * Finds all records or a record by a specific key-value query in a collection.
 * @param {string} collection - the name of the collection file.
 * @param {Object|null} query - an object with a single key and value to match.
 * @returns {Promise<Array|Object|null>} the record(s) found in the collection.
 * @throws {Error} an error if there's an issue finding the record(s).
 */
export const find = async (collection, query = null) => {
    try {
        const records = await _read(collection);

        if (query) {
            // Destructure the key-value pair from the query object
            const [key, value] = Object.entries(query)[0];

            // Attempt to get matching records
            const matches = records.filter((record) => record[key] === value);

            // Return matching records - could be an empty array if none found
            return matches;
        } else {
            // Return all records if no query is provided
            return records;
        }
    } catch (error) {
        // Throw an error if there's an issue finding the records
        throw new Error(`Error finding record in collection ${collection}: ${error.message}`);
    }
};

/**
 * Saves unique data to the collection if it does not already exist.
 * @param {string} collection - the collection file (keywords or selections).
 * @param {string} data - the keyword or selection to be saved.
 * @returns {Promise<void>} a promise that resolves when the operation is complete.
 * @throws {Error} an error if there's an issue saving the data.
 */
export const saveUnique = async (collection, data) => {
    try {
        // Read the existing records
        const records = await _read(collection);

        // Check if the data already exists in the collection
        const exists = records.some((record) => record.title === data);

        if (!exists) {
            // If it does not exist, insert the data
            await insert(collection, { title: data });
            console.log(`Saved unique ${collection.slice(0, -1)}: ${data}`);
        } 
    } catch (error) {
        throw new Error(`Error saving unique data in collection ${collection}: ${error.message}`);
    }
};

/**
 * Deletes a single record from a collection by matching a key-value pair.
 * @param {string} collection - The name of the collection file.
 * @param {Object} query - An object with a single key-value pair to match.
 * @returns {Promise<void>}
 */
export const deleteOne = async (collection, query) => {
    try {
        let records = await _read(collection);
        const [key, value] = Object.entries(query)[0];

        const filteredRecords = records.filter(record => record[key] !== value);

        if (filteredRecords.length === records.length) {
            console.log(`⚠️ No record found for deletion in ${collection}.`);
            return;
        }

        const fullPath = path.resolve(dbDirectory, `${collection}.json`);
        await fs.promises.writeFile(fullPath, JSON.stringify(filteredRecords, null, 2));

        console.log(`✅ Successfully deleted ${key}: ${value}`);
    } catch (error) {
        throw new Error(`Error deleting record in ${collection}: ${error.message}`);
    }
};
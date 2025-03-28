import axios from 'axios';

export const searchByKeyword = async (keyword) => {
    try {
        console.log(`Fetching data for: ${keyword}`); 
        const response = await axios.get(`https://openlibrary.org/search.json?q=${keyword}`);
        return response.data.docs; 

    } catch (error) {
        console.error(`Error fetching data:`, error.message);
        return []; 
    }
};

export const getDetailedData = async (id) => {
    try {
        console.log(`Fetching detailed data for ID: ${id}...`);
        const response = await axios.get(`https://openlibrary.org/search.json?q=${id}`);

        if (!response.data) {
            console.log("No details found for the selected item.");
            return null;
        }

        return response.data;

    } catch (error) {
        console.error("Error fetching detailed data.", error.message);
        return null;
    }
};

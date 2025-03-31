import inquirer from 'inquirer';
import * as api from './api.js';
import * as db from './db.js';

const keywordFile = 'search_history_keyword';
const selectionFile = 'search_history_selection';
const bookmarkFile = 'bookmarks'; // File to store bookmarks

// Function to search API
export const searchAPI = async (keyword) => {
    try {
        const results = await api.searchByKeyword(keyword);

        // Prevent further execution if no results exist
        if (!results || results.length === 0) {
            console.log('No results found.');
            return; 
        }

        await db.saveUnique(keywordFile, keyword);


        // Show list of results for user selection
        const choices = results.map((item, index) => ({
            name: item.title, 
            value: item
        }));

        // Prompts user to select
        const { selectedItem } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedItem',
                message: 'Select an item',
                choices: [...choices, new inquirer.Separator(), { name: 'Exit', value: null }]
            }
        ]);

        if (!selectedItem) {
            console.log('Exiting Search...');
            return;
        }

        await db.saveUnique(selectionFile, selectedItem.title);
        displayItemDetails(selectedItem);

    } catch (error) {
        console.error(`Error fetching data: `, error.message);
    }
};

// Function to get history from files
export const getHistory = async (type) => {

    // Chooses correct file based on type
    const file = type === 'keywords' ? keywordFile : selectionFile;
    const history = await db.find(file) || [];

    if (history.length === 0) {
        console.log(`No ${type} history found.`);
    }

    // Prompts user to pick from history
    const { selectedHistory } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedHistory',
            message: `Select a ${type === 'keywords' ? 'keyword' : 'selection'}:`,
            choices: ['Exit', ...history.map(entry => entry.title)]
        }
    ]);

    if (selectedHistory === 'Exit') {
        console.log('Exiting history view.');
        return;
    }

    if (type === 'keywords') {
        await searchAPI(selectedHistory);
    } else {
        // Gets and displays information from history_selection
        const results = await api.searchByKeyword(selectedHistory);

        if (results.length > 0) {
            // tries to find an exact title match
            const selectedItem = results.find(item => item.title === selectedHistory || results[0]);
            displayItemDetails(selectedItem);
        } else {
            console.log("No details found for this selection.");
        }
    }
};

// Function to display item details
const displayItemDetails = async (item) => {
    console.log("\nSelected Item Details: ");
    console.log(`Title: ${item.title}`);
    console.log(`Author: ${item.author_name || "No Author available"} `);
    console.log(`Publish Year: ${item.first_publish_year || "No Publish Year Available"} `);

    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: ['🔖 Bookmark', 'Exit' ]
        }
    ]);

    if (action === '🔖 Bookmark') {
        await saveBookmark(item);
    } else {
        console.log('Returning to main menu.');
    }
};

// Function to save a bookmark
export const saveBookmark = async (item) => {
    let bookmarks = await db.find(bookmarkFile) || [];

    if (!bookmarks.find(b => b.title === item.title)) {
        await db.saveUnique(bookmarkFile, item.title);
        console.log(`✅ Bookmarked: ${item.title}`);
    } else {
        console.log(`🔖 Already bookmarked.`);
    }
};

// Function to view and manage bookmarks with delete confirmation
export const viewBookmarks = async () => {
    try {
        let bookmarks = await db.find(bookmarkFile) || [];

        if (bookmarks.length === 0) {
            console.log('📂 No bookmarks saved.');
            return;
        }

        const { selectedBookmark } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedBookmark',
                message: 'Select a bookmark to manage:',
                choices: [...bookmarks.map(b => b.title), new inquirer.Separator(), '❌ Cancel']
            }
        ]);

        if (selectedBookmark === '❌ Cancel') {
            console.log('Operation canceled.');
            return;
        }

        // Ask for confirmation before deleting
        const { confirmDelete } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirmDelete',
                message: `Are you sure you want to delete "${selectedBookmark}"?`,
                default: false
            }
        ]);

        if (!confirmDelete) {
            console.log('❌ Deletion canceled.');
            return;
        }

        // Proceed with deletion
        await db.deleteOne(bookmarkFile, { title: selectedBookmark });

        console.log(`🗑️ Successfully deleted bookmark: ${selectedBookmark}`);

    } catch (error) {
        console.error('❌ Error loading bookmarks:', error.message);
    }
};
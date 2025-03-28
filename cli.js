import { searchAPI, getHistory } from './app.js';
import * as db from './db.js';

const args = process.argv.slice(2);
const bookmarkFile = 'bookmarks';

function showHelp(){
    console.log(`
        Usage: node cli.js <command> [options]

        Commands:
        search <keyword>    Search for a keyword using the API
        history keywords    Show past searched keywords
        history selections  Show past selected search results
        bookmarks           View saved bookmarks
        --help              Display this help menu``
    `);
}

// command line handling

if (args.length === 0 || args[0] === '--help') {
    showHelp();
} else if (args[0] === 'search' && args[1]) {
    searchAPI(args[1]);
} else if (args[0] === 'history' && (args[1] === 'keywords' || args[1] === 'selections')) {
    getHistory(args[1]);
} else if (args[0] === 'bookmarks') {
    viewBookmarks();
} else {
    console.error("Invalid command. Run 'node cli.js --help' for usage");
}


// Function to view bookmarks
async function viewBookmarks() {
    try {
        const bookmarks = await db.find(bookmarkFile) || [];

        if (bookmarks.length === 0) {
            console.log('📂 No bookmarks saved.');
            return;
        }

        console.log('\n📖 Your Bookmarks:');
        bookmarks.forEach((b, i) => {
            console.log(`${i + 1}. ${b.title}`);
        });
    } catch (error) {
        console.error('❌ Error loading bookmarks:', error.message);
    }
}
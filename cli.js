import { searchAPI, getHistory, viewBookmarks } from './app.js';

const args = process.argv.slice(2);
const bookmarkFile = 'bookmarks';

function showHelp(){
    console.log(`
        Usage: node cli.js <command> [options]

        Commands:
        search <keyword>    Search for a keyword using the API
        history keywords    Show past searched keywords
        history selections  Show past selected search results
        bookmarks           View and manage saved bookmarks
        --help              Display this help menu
    `);
}

// Command line handling
(async () => {
    if (args.length === 0 || args[0] === '--help') {
        showHelp();
    } else if (args[0] === 'search' && args[1]) {
        await searchAPI(args[1]);
    } else if (args[0] === 'history' && (args[1] === 'keywords' || args[1] === 'selections')) {
        await getHistory(args[1]);
    } else if (args[0] === 'bookmarks') {
        await viewBookmarks();
    } else {
        console.error("Invalid command. Run 'node cli.js --help' for usage");
    }
})();
import 'dotenv/config';
import app from '@src/app';
import { Client } from '@notionhq/client';

const PORT = process.env.PORT || 3000;

const notion: Client = new Client({ auth: process.env.NOTION_SECRET });

type APIOptions = {
    'Option 1': string;
    'Option 2': string;
    'Option 3': string;
    'Option 4': string;
};

let previousValue = [];

// Function to poll an external API
const notionPoll = async () => {
    const options: APIOptions = {
        'Option 1':
            'https://d1wvu1ls1c540u.cloudfront.net/api/v1/getState?state=CO',
        'Option 2': 'https://d1wvu1ls1c540u.cloudfront.net/api/v1/getState',
        'Option 3':
            'https://d1wvu1ls1c540u.cloudfront.net/api/v1/getCount?state=FL',
        'Option 4':
            'https://d1wvu1ls1c540u.cloudfront.net/api/v1/getCount?state=FL&district=2',
    };

    const notionDbId = process.env.NOTION_DB_ID || '';
    try {
        console.log(notionDbId);
        const notionDb = await notion.databases.query({
            database_id: notionDbId,
        });

        const pages = notionDb.results.length;
        previousValue = [...notionDb.results];

        for (let i = 0; i < pages; i++) {
            const page = notionDb.results[i].properties.Tags.select;

            if (page !== null) {
                const option = notionDb.results[i].properties.Tags.select
                    .name as keyof APIOptions;
                const response = await fetch(options[option]);
                const data = await response.json();
                console.log(data);
            }
        }
        console.log(previousValue);
    } catch (error) {
        console.log(error);
    }
    // try {
    //     const response = await axios.get('https://api.example.com/data'); // Replace with your API URL
    //     const currentValue = response.data.value; // Adjust based on your API response structure

    //     if (currentValue !== previousValue) {
    //         console.log(`Value changed to: ${currentValue}`);
    //         previousValue = currentValue; // Update previous value
    //         // You can add any additional logic here, e.g., notify a client or call another API
    //     }
    // } catch (error) {
    //     console.error('Error polling API:', error);
    // }
};

const onStart = () =>
    console.log(`SERVER START: eventhand-chat listening at ${PORT}`);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onError = (error: any) => {
    if (error.syscall !== 'listen') {
        console.log(error);
        throw error;
    }

    switch (error.code) {
        case 'EACCESS':
            console.error('Insufficient permissions to start server:', error);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`Port ${PORT} is already in use`);
            process.exit(1);
            break;
        default:
            console.log('An Error has occured:', error);
            throw error;
    }
};

const httpServer = app.listen(PORT, onStart);

const onListening = () => {
    const addr = httpServer.address();
    const bind =
        typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
    console.log(`Listening on ${bind}`);
};

httpServer.on('listening', onListening).on('error', onError);

setInterval(notionPoll, 5000);

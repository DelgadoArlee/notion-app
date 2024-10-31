import 'dotenv/config';
import app from '@src/app';
import { Client } from '@notionhq/client';
// import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

const PORT = process.env.PORT || 3000;

const notion: Client = new Client({ auth: process.env.NOTION_SECRET });

// type APIOptions = {
//     'Option 1': string;
//     'Option 2': string;
//     'Option 3': string;
//     'Option 4': string;
// };

// let previousValue: QueryDatabaseResponse | null = null;

// const checkPrevValue = (
//     previousValue: QueryDatabaseResponse | null,
//     currentValue: keyof APIOptions,
//     index: number
// ) => {
//     if (previousValue !== null) {
//         const prevOption = previousValue.results[index].properties.Tags.select;

//         if (prevOption !== null) {
//             return prevOption.name !== currentValue;
//         } else {
//             return false;
//         }
//     } else {
//         return true;
//     }
// };

const notionSelect = async () => {
    // const notionDbId = process.env.NOTION_DB_ID || '';

    try {
        const response = await fetch(
            'https://d1wvu1ls1c540u.cloudfront.net/api/v1/getState'
        );
        const data = await response.json();

        const states = data.states;

        const stateCodes = states.map((state) => {
            return state.state_code;
        });

        const stateNames = states.map((state) => {
            return state.state_name;
        });

        const stateNameOptions = stateNames.map((stateName) => {
            return {
                name: stateName,
            };
        });
        const stateCodeOptions = stateCodes.map((stateCode) => {
            return {
                name: stateCode,
            };
        });

        const notionResponse = await notion.databases.create({
            parent: {
                type: 'page_id',
                page_id: '12ff2544a36b805f9005de17713945a5',
            },
            title: [
                {
                    type: 'text',
                    text: {
                        content: 'States',
                        link: null,
                    },
                },
            ],
            properties: {
                Name: {
                    title: {},
                },
                State_Codes: {
                    select: {
                        options: stateCodeOptions,
                    },
                },
                State_Names: {
                    select: {
                        options: stateNameOptions,
                    },
                },
            },
        });

        console.log(notionResponse);
    } catch (error) {
        console.log(error);
    }
};

// const notionPoll = async () => {
//     const options: APIOptions = {
//         'Option 1':
//             'https://d1wvu1ls1c540u.cloudfront.net/api/v1/getState?state=CO',
//         'Option 2': 'https://d1wvu1ls1c540u.cloudfront.net/api/v1/getState',
//         'Option 3':
//             'https://d1wvu1ls1c540u.cloudfront.net/api/v1/getCount?state=FL',
//         'Option 4':
//             'https://d1wvu1ls1c540u.cloudfront.net/api/v1/getCount?state=FL&district=2',
//     };

//     const notionDbId = process.env.NOTION_DB_ID || '';
//     try {
//         const notionDb = await notion.databases.query({
//             database_id: notionDbId,
//         });

//         const pages = notionDb.results.length;

//         for (let i = 0; i < pages; i++) {
//             const page = notionDb.results[i].properties.Tags.select;

//             if (page !== null) {
//                 const option = page.name as keyof APIOptions;
//                 const response = await fetch(options[option]);
//                 const data = await response.json();
//                 console.log(option);
//                 console.log(data);
//             }
//         }

//         previousValue = notionDb;
//     } catch (error) {
//         console.log(error);
//     }
// };

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

notionSelect();

// setInterval(notionPoll, 5000);

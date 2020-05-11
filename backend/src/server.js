import express from 'express';
import bodyParser from 'body-parser';
import {MongoClient} from 'mongodb';

const app = express();
const PORT = 8000;

app.use(bodyParser.json());

app.get('/api/leaders/', async (req, res) => {
    try {
        const client = await MongoClient.connect('mongodb://localhost:27017', {useNewUrlParser: true, useUnifiedTopology: true});
        const db = client.db('leaders');

        var sort = {score: -1};
        const leadersList = await db.collection('leaders').find({}).sort(sort).toArray();

        res.status(200).json(leadersList);

        client.close();

    } catch (error) {
        res.status(500).json({message: 'Error connecting to db', error});
    }
})

app.get('/api/leaders/:username', async (req, res) => {
    try {
        const userName = req.params.username;

        const client = await MongoClient.connect('mongodb://localhost:27017', {useNewUrlParser: true, useUnifiedTopology: true});
        const db = client.db('leaders');

        const leaderInfo = await db.collection('leaders').findOne({username: userName});

        res.status(200).json(leaderInfo);

        client.close();
    } catch (error) {
        res.status(500).json({message: 'Error connecting to db', error});
    }
});

app.post('/api/leaders/:username/:newscore', async (req, res) => {
    try {
        const userName = req.params.username;
        const newScore = req.params.newscore;

        const client = await MongoClient.connect('mongodb://localhost:27017', {useNewUrlParser: true, useUnifiedTopology: true});
        const db = client.db('leaders');

        const leaderInfo = await db.collection('leaders').findOne({username: userName});
        await db.collection('leaders').updateOne({username: userName},{
            '$set': {
                score: newScore,
            }
        })
        const updatedLeaderInfo = await db.collection('leaders').findOne({username: userName});

        //res.status(200).json(updatedLeaderInfo);
        res.status(200).send(`Score for ${userName} has been updated to ${updatedLeaderInfo.score}`);

        client.close();

    } catch (error) {
        res.status(500).json({message: 'Error connecting to db', error});
    }
});

app.listen(PORT, () => console.log("Listening on port ", PORT));
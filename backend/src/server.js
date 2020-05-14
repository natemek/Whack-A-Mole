import express from 'express';
import bodyParser from 'body-parser';
import {MongoClient} from 'mongodb';
import path from 'path';

const app = express();
const PORT = 8000;

app.use(express.static(path.join(__dirname, '/build')));
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
        const newScore = Number(req.params.newscore);

        const client = await MongoClient.connect('mongodb://localhost:27017', {useNewUrlParser: true, useUnifiedTopology: true});
        const db = client.db('leaders');

        const leaderInfo = await db.collection('leaders').findOne({username: userName});
        if (leaderInfo) {
            console.log("It exists");
            await db.collection('leaders').updateOne({username: userName},{
                '$set': {
                    score: newScore,
                }
            })
        } else {
            console.log("It doesn't exist"); 
            try {
                await db.collection('leaders').insertOne({
                    "username": userName,
                    "score": newScore,
                })
            } catch (error) {
                console.log(error);
            }
        }
        
        var sort = {score: -1};
        const updatedLeadersList = await db.collection('leaders').find({}).sort(sort).toArray();

        res.status(200).json(updatedLeadersList);

        client.close();

    } catch (error) {
        res.status(500).json({message: 'Error connecting to db', error});
    }
});

app.post('/api/leaders/', async (req, res) => {
    try {
        const userName = req.body.username;
        const score = req.body.score;

        const client = await MongoClient.connect('mongodb://localhost:27017', {useNewUrlParser: true, useUnifiedTopology: true});
        const db = client.db('leaders');

        const leaderInfo = await db.collection('leaders').findOne({username: userName});
        console.log(leaderInfo);
        if (leaderInfo === null) {
            try {
                const newLeader = await db.collection('leaders').insertOne({
                    "username": userName,
                    "score": score,
                });
                console.log("new leader ->", newLeader);
            } catch (error) {
                console.error("xxxo>", error);
            }
        } else {
            console.log("the above leader already exists");
        }
        
        var sort = {score: -1};
        const updatedLeadersList = await db.collection('leaders').find({}).sort(sort).toArray();

        res.status(200).json(updatedLeadersList);

        client.close();

    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error connecting to db', error});
    }
});

app.delete('/api/leaders/:username', async (req, res) => {
    const userName = req.params.username;

    const client = await MongoClient.connect('mongodb://localhost:27017', {useNewUrlParser: true, useUnifiedTopology: true});
    const db = client.db('leaders');

    try {
        // eslint-disable-next-line no-unused-vars
        const deletedLeader = await db.collection('leaders').deleteOne({
            "username": userName
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error connecting to db', error});
    }

    var sort = {score: -1};
    const updatedLeadersList = await db.collection('leaders').find({}).sort(sort).toArray();

    res.status(200).json(updatedLeadersList);
})

app.delete('/api/leaders/', async (req, res) => {

    const client = await MongoClient.connect('mongodb://localhost:27017', {useNewUrlParser: true, useUnifiedTopology: true});
    const db = client.db('leaders');

    try {
        // eslint-disable-next-line no-unused-vars
        const deletedLeader = await db.collection('leaders').deleteMany({
            "score": {$lt: 30}
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error connecting to db', error});
    }

    var sort = {score: -1};
    const updatedLeadersList = await db.collection('leaders').find({}).sort(sort).toArray();

    res.status(200).json(updatedLeadersList);
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.listen(PORT, () => console.log("Listening on port ", PORT));
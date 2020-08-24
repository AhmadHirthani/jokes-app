'use strict'
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
require('dotenv').config();
const PORT = process.env.PORT || 8080;
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
const pg = require('pg');
const superagent = require('superagent');
const client = new pg.Client(process.env.DATABASE_URL);
// const methodOverride = require('method-override');
// app.use(methodOverride('_method'));



app.get('/', homePage);
app.post('/addJokeToList', addJokeToList);
app.post('/jokeDetails', jokeDetails);
app.post('/deleteJoke', deleteJoke);
app.get('/jokesFavPage', jokesFavPage);
app.post('/getRandomJoke', getRandomJoke);



function getRandomJoke(req, res) {
    let url = `https://official-joke-api.appspot.com/jokes/programming/random`;
    superagent.get(url).then(data => {
        console.log('data.body[0]: ', data.body[0])
        let joke = new Joke(data.body[0]);
        console.log('joke: ', joke);
        res.render('reandomJoke', { randomJoke: joke })
    });
}


function deleteJoke(req, res) {
    let { id } = req.body;
    console.log('id for del: ', id);
    let SQL = `DELETE from jokes where id=${id};`;
    client.query(SQL).then(data => {
        // console.log('favJokesArray: ', favJokesArray);
        // res.render('jokesFavPage', { favJokesArray: favJokesArray });
    })
}


function jokeDetails(req, res) {
    let { id, type, setup, punchline } = req.body;
    res.render('jokeDetails', { id: id, type: type, setup: setup, punchline: punchline })
}



function jokesFavPage(req, res) {
    let favJokesArray = [];
    let SQL = `Select * from jokes;`;
    client.query(SQL).then(data => {
        for (let index = 0; index < data.rows.length; index++) {
            let joke = new Joke(data.rows[index]);
            favJokesArray.push(joke);
        }
        console.log('favJokesArray: ', favJokesArray);
        res.render('jokesFavPage', { favJokesArray: favJokesArray });
    })


}



function addJokeToList(req, res) {
    let { id, type, setup, punchline } = req.body;
    let VALUES = [id, type, setup, punchline];
    let SQL = `INSERT INTO jokes (id, type, setup, punchline) VALUES(${id}, ${type}, ${setup}, ${punchline});`;
    // let SQL = `INSERT INTO jokes (id, type, setup, punchline) VALUES (${id}, ${type}, ${setup}, ${punchline});`;
    // console.log('id: ', id);
    client.query(SQL).then(data => {
        res.redirect('jokesFavPage');
    })
}

function homePage(req, res) {
    let jokesArray = [];
    let url = `https://official-joke-api.appspot.com/jokes/programming/ten`;
    superagent.get(url).then(data => {
        data.body.forEach(element => {
            let joke = new Joke(element);
            jokesArray.push(joke);
        });
        // console.log('jokesArray: ', jokesArray);
        res.render('index', { jokesArray: jokesArray })
    })
}


client.connect().then(() => {
    app.listen(PORT, () => {
        console.log(`Example app listening at http://localhost:${PORT}`)
    })
})

function Joke(joke) {
    this.id = joke.id;
    this.type = joke.type;
    this.setup = joke.setup;
    this.punchline = joke.punchline
}
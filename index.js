require('dotenv').config()
const express = require('express')
const app = express()
const Person = require('./models/person')

const morgan = require('morgan')

//create token to log request body for POST requests
morgan.token('body', (req) => {
    return req.method === 'POST' ? JSON.stringify(req.body) : ''
});

//use morgan middleware based on tiny format and custom logging for POST requests
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.use(express.static('dist'))

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }

const cors = require('cors')

app.use(cors())

app.use(express.json())
app.use(requestLogger)

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }

app.get('/info', (request, response) => {
    const totalPersons = persons.length;
    const todayDate = new Date();
    
    response.send(`
        <p>Phonebook has info for ${totalPersons} people</p>
        <p>${todayDate}</p>
    `);
})
  
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
      response.json(person)
    })
  })

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
  })

app.post('/api/persons', (request, response) => {
    const body = request.body;

    if (!body.name || !body.number) {
        return response.status(400).json({ error: 'The name or number is missing' })
      }

    const person = new Person({
        name: body.name,
        number: body.number,
    });
      
    person.save().then(savedPerson => {
        response.json(savedPerson);
    });
});

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
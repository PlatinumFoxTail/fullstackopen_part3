const express = require('express')
const app = express()

const morgan = require('morgan')

//create token to log request body for POST requests
morgan.token('body', (req) => {
    return req.method === 'POST' ? JSON.stringify(req.body) : ''
});

//use morgan middleware based on tiny format and custom logging for POST requests
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
    { 
        "id": "1",
        "name": "Arto Hellas", 
        "number": "040-123456"
      },
      { 
        "id": "2",
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
      },
      { 
        "id": "3",
        "name": "Dan Abramov", 
        "number": "12-43-234345"
      },
      { 
        "id": "4",
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
      }
  ]

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
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
  })

app.post('/api/persons', (request, response) => {
    const person = request.body;

    //check name and number provided
    if (!person.name || !person.number) {
        return response.status(400).json({ 
            error: 'The name or number is missing' 
        });
    }

    //check if name already occupied
    const nameOccupied = persons.some(p => p.name === person.name);
    if (nameOccupied) {
        return response.status(400).json({ 
            error: 'The name already exists in the phonebook' 
        });
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max)
    }
    const randomId = getRandomInt(10000)

    const newPerson = {
        id: String(randomId),
        name: person.name,
        number: person.number
    };

    persons = persons.concat(newPerson)
    response.json(newPerson)
});

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
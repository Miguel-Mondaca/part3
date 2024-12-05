const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', (request) => {
    if (request.method === 'POST') {
        const { name, number } = request.body
        return JSON.stringify({ name, number })
    }
    return ''
})

app.use(morgan(':method :url :status - :response-time ms :body'))

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
    const dateTime = new Date().toString()
    const infoTime = `<p>Phonebook has info for ${persons.length} people</p><p>${dateTime}</p>`

    response.send(infoTime)
})

app.get('/api/persons', (request, response) => {
    response.json(persons);
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).json({ error: `The Person with ID '${id}' was not found.` })
    }
})

app.post('/api/persons', (request, response) => {
    const person = request.body
    if (!person.name || !person.number) {
        return response.status(400).json({
            error: 'Both name and number fields are mandatory.'
        })
    }

    const similarName = persons.some(similarName => similarName.name === person.name)
    if (similarName) {
        return response.status(400).json({
            error: `The name '${person.name}' is already in the phonebook.`
        })
    }

    const id = Math.floor(Math.random() * 90000) + 10000
    person.id = id

    persons = persons.concat(person)
    response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (!person) {
        return response.status(404).json({ error: `Person with ID ${id} not found.` })
    }

    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
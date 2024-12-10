require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

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

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
    .catch(error => {
      console.error('Error retrieving persons list', error.message)
      next(error)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  Person.findById(id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
    .catch(error => {
      console.error('Error retrieving person by ID', error.message)
      next(error)
    })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'Both name and number are required' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => {
      console.error('Error adding person', error.message)
      next(error)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
  const { id } = request.params
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    id,
    { name, number },
    { new: true, runValidators: true, content: 'query' }).then(updatedPerson => {
    if (updatedPerson) {
      response.json(updatedPerson)
    } else {
      response.status(404).json({ error: 'Person not found' })
    }
  })
    .catch(error => {
      console.error('Error updating person', error.message)
      next(error)
    })
})

app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then(count => {
      const dateTime = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
      const infoTime = `<p>Phonebook has info for ${count} people</p><p>Last request date: ${dateTime}</p>`
      response.send(infoTime)
    })
    .catch(error => {
      console.error('Error fetching info data', error.message)
      next(error)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => {
      console.error('Error deleting person', error.message)
      next(error)
    })
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
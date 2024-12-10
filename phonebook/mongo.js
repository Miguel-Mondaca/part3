const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url =
    `mongodb+srv://miguelmondacag89:${password}@cluster0.pjhfe.mongodb.net/personApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (name && number) {

  const person = new Person({
    name,
    number,
  })

  person.save().then(() => {
    console.log(`Added: ${name}, number: ${number} to the phonebook!`)
  })
    .catch(err => {
      console.error('Error adding person:', err)
    })
    .finally(() => {
      mongoose.connection.close()
    })

} else {

  Person.find({}).then(result => {
    console.log('Phonebook:')
    result.forEach(person => {
      console.log(`${person.name}, ${person.number}`)
    })
  })
    .catch(err => {
      console.error('Error retrieving data:', err)
    })
    .finally(() => {
      mongoose.connection.close()
    })
}
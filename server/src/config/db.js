const mongoose = require('mongoose')

async function connectDb(uri) {
  if (!uri) return
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
}

module.exports = { connectDb }

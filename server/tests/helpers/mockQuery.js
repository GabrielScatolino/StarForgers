// Simula uma consulta encadeada do Mongoose (find().sort().skip().limit()) que
// pode ser "esperada" com await e devolve o resultado informado.
function mockQuery(result) {
  const query = {
    sort: jest.fn(() => query),
    skip: jest.fn(() => query),
    limit: jest.fn(() => query),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  }
  return query
}

module.exports = mockQuery

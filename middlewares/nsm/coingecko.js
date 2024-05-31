exports.getList = () => {
  return fetch(`https://api.coingecko.com/api/v3/coins/list?apikey=${process.env.COINGECKO_API}`)
  .then((list) => list.json())
  .then((list) => list)
}
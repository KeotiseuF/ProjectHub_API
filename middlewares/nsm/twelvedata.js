exports.getList = () => {
  return fetch(`https://api.twelvedata.com/stocks?apikey=${process.env.TWELVE_DATA_API}`)
  .then((list) => list.json())
  .then((list) => list)
}
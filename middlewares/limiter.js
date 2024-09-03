const { RateLimiter } = require('limiter');

const limiter = new RateLimiter({
  tokensPerInterval: Number(process.env.MAX_REQUEST),
  interval: process.env.INTERVAL_REQUEST,
  fireImmediately: true
});

const requestHandler = async (req, res, next) => {
  const remainingRequests = await limiter.removeTokens(1);
  if (remainingRequests < 0) {
    console.error('Too requests the user is limited');
    res.status(429).end('Too Many Requests - your IP is being rate limited');
  } else next();
}

module.exports = requestHandler;
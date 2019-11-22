// function random otp code [low, high]
module.exports =  (low, high) => Math.floor(Math.random() * (high - low + 1) + low);
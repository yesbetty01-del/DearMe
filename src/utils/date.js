const today = new Date();

const day = today.toLocaleDateString('en-US', {weekday: 'long'});
const month = today.toLocaleDateString('en-US', {month: 'long'});
const dateNo = today.getDate();

export {day, month, dateNo};
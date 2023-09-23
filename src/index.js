exports.handler = function(event, context, callback) {
  console.log("Received event: ", event);
  var data = {
      "greetings": "Hello there, " + event.firstName + " " + event.lastName + "."
  };
  callback(null, data);
}
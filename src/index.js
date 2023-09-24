const nodemailer = require("nodemailer");

const refereneObj = {
  name: "string",
  email: "string",
  message: "string"
};

const transportData = {
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "zanessmtpserver@gmail.com",
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN
  }
};

const sendEmail = async (sender) => {
  try {
    return await nodemailer.createTransport(transportData).sendMail({
      from: "Contact Form Submission <zanessmtpserver@gmail.com>",
      to: "zanecosmo@gmail.com",
      subject: `Message From: ${sender.name}`,
      text: `NAME: ${sender.name}, E-MAIL: ${sender.email}, MESSAGE: ${sender.message}`
    });

  } catch (error) { return error };
};

const compareObjects = (obj1, obj2) => {
  const keys1 = Object.keys(obj1).sort();
  const keys2 = Object.keys(obj2).sort();

  if (keys1.length !== keys2.length) return false;

  return keys1.every((key, index) => key === keys2[index]);
};

const createResponse = (statusCode, message) => {
  return {
    statusCode: statusCode,
    body: message
  };
};

const allowedOrigins = [
    "https://zanecosmo.com",
    "http://127.0.0.1:5501"
  ];

const verifyOrigin = (origin) => allowedOrigins.includes(origin) ? origin : "";

exports.handler = async (event) => {

  if (event.httpMethod === "OPTIONS") {
    const corsHeaders = event.headers['Access-Control-Request-Headers'].split(',');

    const responseHeaders = {
      'Access-Control-Allow-Headers': corsHeaders.join(', '),
      'Access-Control-Allow-Origin': verifyOrigin(event.headers.origin)
    };

    return {
      statusCode: 200,
      headers: responseHeaders
    };
  };
  
  if (event.body === null || event.body === undefined) {
    return createResponse(500, "INTERNAL SERVER ERROR");
  };
  
  const message = JSON.parse(event.body);
  
  if (!compareObjects(message, refereneObj)) {
    return createResponse(400, "INCORRECT OBJECT FORMAT. DID NOT SEND");
  };

  for (let key in message) {
    if (message[key] === undefined || message[key] === "") {
      message[key] = "TEST - NO ENTRY";
    }
  };

  if (Object.values(message).every(val => val === "NO ENTRY")) {
    return createResponse(406, "MESSAGE EMPTY. DID NOT SEND");
  };

  try {
    await sendEmail(message);
    return createResponse(200, "MESSAGE SENT");
  }

  catch (error) {
    return { statusCode: 500, body: "INTERNAL SERVER ERROR" };
  };
};
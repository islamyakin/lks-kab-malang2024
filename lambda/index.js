const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
exports.handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = { 
    "Content-Type": "application/json"
  };
  try {
    console.info("event data: " + JSON.stringify(event))
      switch (event.httpMethod + " " + event.resource) {
          //Delete a single product by id
        case "DELETE /products/{id}":
          await dynamo
            .delete({
              TableName: "products",
              Key: {
                id: event.pathParameters.id
              }
            })
            .promise();
          body = `Deleted item ${event.pathParameters.id}`;
          break;
          //Get a single product by id
        case "GET /products/{id}":
          body = await dynamo
            .get({
              TableName: "products",
              Key: {
                id: event.pathParameters.id
              }
            })
            .promise();
          break;
          //Get all products in the table
        case "GET /products":
          body = await dynamo.scan({ TableName: "products" }).promise();
          break;
          //Put a single product in the table
        case "PUT /products":
          let requestJSON = JSON.parse(event.body);
          await dynamo.put({
            TableName: "products",
            Item: {
              id: requestJSON.id,
              price: requestJSON.price,
              name: requestJSON.name
            }
          })
            .promise();
          body = `Put item ${requestJSON.id}`;
          break;
          //If no route found output message with all even
        default:
          throw new Error(`Unsupported route: "${event.httpMethod + " " + event.resource + " - EVENT: " + JSON.stringify(event)}"`);
      }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }
  return {
    statusCode,
    body,
    headers
  };
};

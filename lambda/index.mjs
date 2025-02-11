import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = "products";

export const handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    const routeKey = `${event.httpMethod} ${event.resource}`;

    switch (routeKey) {
      case "DELETE /items/{id}":
        await dynamo.send(
          new DeleteCommand({
            TableName: tableName,
            Key: { id: event.pathParameters.id },
          })
        );
        body = `Deleted item ${event.pathParameters.id}`;
        break;

      case "GET /items/{id}":
        const getResult = await dynamo.send(
          new GetCommand({
            TableName: tableName,
            Key: { id: event.pathParameters.id },
          })
        );
        body = getResult.Item || {};
        break;

      case "GET /items":
        const scanResult = await dynamo.send(new ScanCommand({ TableName: tableName }));
        body = scanResult.Items || [];
        break;

      case "PUT /items":
        const requestJSON = JSON.parse(event.body);
        await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id: requestJSON.id,
              price: requestJSON.price,
              name: requestJSON.name,
            },
          })
        );
        body = `Put item ${requestJSON.id}`;
        break;

      default:
        throw new Error(`Unsupported route: "${routeKey}"`);
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
    headers,
  };
};

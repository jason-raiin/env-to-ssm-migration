const AWS = require('aws-sdk');
const fs = require('fs');

// config (You only need to edit this part)
const SSM = new AWS.SSM({
  region: 'ca-central-1', // Specify AWS region
  accessKeyId: "",
  secretAccessKey: "",
  sessionToken: ""
});

async function getParams(nextToken, paramList) {
  SSM.getParametersByPath({
    Path: '/project/env/',
    Recursive: true,
    WithDecryption: true,
    MaxResults: 10,
    NextToken: nextToken
  }).send((_, data) => {
    paramList.push(...data.Parameters || []);
    if (data.Parameters?.length === 10) getParams(data.NextToken, paramList)
    else {
      const paramDefinitions = paramList.map(param => {
        const name = param.Name.replace('/project/env/', '');
        const value = param.Value;
        return { name, value };
      });
      fs.writeFile('./env.json', JSON.stringify(paramDefinitions), function(err) {
        if (err) return console.log(err);
        console.log("The file was saved!");
      });
    }
  });
}

const paramList = [];
getParams(undefined, paramList)

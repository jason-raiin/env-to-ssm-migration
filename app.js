const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const fs = require('fs');

// config (You only need to edit this part)
const SSM = new AWS.SSM({
  region: 'ca-central-1', // Specify AWS region
  accessKeyId: "",
  secretAccessKey: "",
  sessionToken: ""
});
let path = '/project/env/'; // Optionally setup a path for the parameter, otherwise leave empty
const secureStringPerfix = '_'; // Specify a prefix to indicate a paramter is a SecureString (the prefix will be excluded from the parameter name)


// load .env and parse parameters
const Buffer = fs.readFileSync('./.env');
const env = dotenv.parse(Buffer);

// prepare parameters in objects with paramters store options
let envArr = [];
for (let key in env) {
  path = path ? path : '';
  let Type = key.substring(0, secureStringPerfix.length) === secureStringPerfix ? 'SecureString' : 'String';
  let Name = Type === 'SecureString' ? path + key.substring(secureStringPerfix.length) : path + key;
  envArr.push({
    Name,
    Type,
    Value: env[key],
    Tier: 'Standard',
    DataType: 'text',
    Overwrite: false,
  });
}

// push paramters to SSM paramter store one by one
envArr.map(param => {
  SSM.putParameter(param, (err) => {
    if (err) {
      if (err.code === 'ParameterAlreadyExists') console.error("\x1b[91m%s\x1b[0m", param.Name + ' already exists. To overwrite current value, set overwrite option to true');
      else console.log(`\x1b[91m${param.Name}\x1b[0m ${err.code}: ${err.message}`);
    }
    else console.log(`\x1b[92m${param.Name}\x1b[0m pushed succesfully`)
  });
});

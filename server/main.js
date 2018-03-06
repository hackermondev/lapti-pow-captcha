/**
 * This Node.js code is just a proof-of-concept.
 * Please, don't use it in production.
 */

const http = require('http');

// SHA-3-512 hashing algorithm is used in this captcha
const sha3_512 = require('js-sha3').sha3_512;

// SECRET should be only known to the server, never share it
const SECRET = 'qdqwj9d8h01k2jdas';

// COMPLEXITY will affect the client-side check of a proof
const COMPLEXITY = 4;

const respond = (res, code, json) => {
    res.writeHead(code, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    });
    json && res.write(JSON.stringify(json));
    res.end();
};

// Creates a token from initial client data and SECRET
const createToken = (data, cb) => {
    if (!data) {
        cb(null);
    } else {
        cb(sha3_512(data + SECRET));
    }
};

// Checks a proof to match complexity requirements
// 1) Gets the token anew from initial data
// 2) Gets the proof from that token and nonce from client
// 3) Checks the proof against complexity
const checkProof = (data, nonce, cb) => {
    createToken(data, (token) => {
        if (!token) {
            cb(false);
        } else {
            const test = Array(COMPLEXITY + 1).join('0');
            const proof = sha3_512(token + nonce);
            if (proof.slice(0, COMPLEXITY) === test) {
                cb(true);
            } else {
                cb(false);
            }
        }
    });
};

http.createServer((req, res) => {
    const path = req.url.slice(1).split('/');
    switch(path[0]) {
        // Separate method especially for captcha
        case 'handshake':
            createToken(path[1], (token) => {
                if (!token) {
                    respond(res, 400, { error: 'no.token.provided' });
                } else {
                    respond(res, 200, { token, complexity: COMPLEXITY });
                }
            });
            break;
        // Any method with payload which should be protected
        case 'action':
            checkProof(path[1], path[2], (isValid) => {
                if (!isValid) {
                    respond(res, 400, { error: 'proof.is.invalid' });
                } else {
                    respond(res, 200, { message: 'Action is completed!' });
                }
            });
            break;
        default:
            respond(res, 404, { error : 'nothing.here' });
            break;

    }
}).listen(8000);

# Lapti Proof-of-Work Captcha [![npm version](https://badge.fury.io/js/lapti-pow-captcha.svg)](https://www.npmjs.com/package/lapti-pow-captcha)

Protect heavy API methods with the force of Proof-of-Work algorithms hosted locally.

## Idea

If there are some methods in the API which take much time to serve, you may want to guard them against DDoS attacks. A way of doing that is described below.

The server keeps some secret data `SECRET` which is unknown to anyone. The client sends a bit of arbitrary data `data` to the API method `/handshake/{data}`. In response to the call the server returns a token `token` which is `SHA3(data + SECRET)`, and also a number `complexity` which sets the complexity level.

The client then takes `token` and tries to find such a value `nonce` that the first n characters of `SHA3(token + nonce)` are `0` characters, where n equals `complexity`.

When the needed `nonce` is found the client sends a request to the protected API method and attach two values to it: the initial `data` and the found `nonce`.

The server then calculates the `token` from `data` and `SECRET` one more time (or gets it from a storage of some kind) and checks if `SHA3(token + nonce)` really matches the given `complexity`. If it does indeed, the protected method can be called.

## Alternatives

You can freely modify the captcha so its `handshake` method does not require any data and a session is created for every request with `token` entries stored somewhere in a database bound each to a correlating session. After that, all you will need to do is to check the validity of `SHA3(token, nonce)` against the given `complexity`.

## Usage

There are two principal ways to use this captcha.

The first one is to initialize it with the `container` field and optional `onComplete` callback:

```
LaptiCaptcha.create({
    apiUrl: 'https://api.root.url',
    data: 'data-to-be-passed-in-handshake',
    container: 'containerId',
    onComplete: function (data, proof) {
        fetch(API_ROOT + '/action/' + dataOne + '/' + proof).then(function (res) {
            res.json().then(function (data) {
                console.log(data);
            });
        });
    }
});
```

The second one is to create an instance of the captcha and interact with it through the API:

```
var captcha = LaptiCaptcha.create({
    apiUrl: 'https://api.root.url',
    data: 'data-to-be-passed-in-handshake'
});

// You can run it from wherever you want
second.run().then(function (proof) {
    console.log(proof);
    fetch('https://api.root.url/action/' + captcha.data + '/' + proof).then(function (res) {
        res.json().then(function (data) {
            console.log(data);
        });
    });
});
```

## Test setup

Start the server file with Node JS and open _index.html_ in browser.

```
node server/main.js
```

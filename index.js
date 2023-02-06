const express = require("express");
const mysql = require("mysql");
const http = require('http');
const openpgp = require("openpgp");
const fs = require("fs");
const bodyParser = require('body-parser');
const md5 = require('md5');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 3000;

// Parsing middleware
// Parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false })); // Remove 
app.use(express.urlencoded({ extended: true })); // New
// Parse application/json
// app.use(bodyParser.json()); // Remove
app.use(express.json()); // New

// var server = http.createServer(app);
app.listen(port, () => console.log(`Listening on port ${port}`))

console.log(process.env.DB_USERNAME)
const connection = mysql.createConnection({
    host: "localhost",
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// server.listen(3000);
// console.log('Express server started on port %s', server.address().port);

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get("/", (req, res) => {
    res.send("Hello From The Server");
})

function validateEmail(email) {
    let errors = [];

    // checks whether email is empty or not
    if (email.length === 0) {
        errors.push("Email Is Null");
    }

    // checks whether email length is more then 100 or not
    if (email.length > 100) {
        errors.push("Email Can not exceed 100 Character");
    }


    // checks whether email is valid or not usinf regular expression
    if (!(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g.test(email))) {
        errors.push("Email Is Not Valid");
    }

    return errors;
}

function validateUsername(username) {
    let errors = [];

    // checks whether username is empty or not
    if (username.length == 0) {
        errors.push("Username Is Null");
    }

    // checks whether username length is more then 100 or not
    if (username.length > 100) {
        errors.push("Username Can not exceed 100 Character");
    }

    return errors;
}

function validatePassword(password) {
    let errors = [];
    if (password.length == 0) {
        errors.push("Password Is Null");
    }

    if (password.length > 50) {
        errors.push("Password Length Can Not Exceed 50 Characters.");
    }

    return errors;
}

function validateRepeatPassword(rePassword, password) {
    let errors = [];
    if (rePassword.length == 0) {
        errors.push("Repeat Password Is Null");
    }

    if (rePassword != password) {
        errors.push("Repeat Password Is Not Same as Password.");
    }

    return errors;
}

async function generate(name_input, email_input, passphrase_input) {
    const { privateKeyArmored, publicKeyArmored } = await openpgp.generateKey({
        userIds: [{ name: name_input, email: email_input }],
        curve: "ed25519",
        passphrase: passphrase_input,
    });
    console.log(privateKeyArmored);
    console.log(publicKeyArmored);

    //private dan public key simpan di komputer pengguna
    //sedangkan server hanya public key untuk contact
    //passphrase tidak boleh diucapkan dalam aplikasi ini tapi bolehnya hanya di tempat lain
}

async function encrypt(file_location_input, public_key_input) {
    const plainData = fs.readFileSync(file_location_input);
    const encrypted = await openpgp.encrypt({
        message: openpgp.message.fromText(plainData),
        publicKeys: (await openpgp.key.readArmored(public_key_input)).keys,
    });

    //public key yang berupa file akan di input dari front end
    fs.writeFileSync("encrypted.txt", encrypted.data);
}

async function decrypt(private_key_input, passphrase_input, file_location_input) {
    const privateKey = (await openpgp.key.readArmored([private_key_input])).keys[0];
    await privateKey.decrypt(passphrase_input);

    const encryptedData = fs.readFileSync(file_location_input);
    const decrypted = await openpgp.decrypt({
        message: await openpgp.message.readArmored(encryptedData),
        privateKeys: [privateKey],
    });

    fs.writeFileSync("decrypted.txt", decrypted.data);
}

app.post("/user/register", (req, result) => {
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    let rePassword = req.body.rePassword;

    let errEmail = validateEmail(email); // validate email
    let errUsername = validateUsername(username); // validate username
    let errPassword = validatePassword(password); // validate password
    let errrePassword = validateRepeatPassword(rePassword, password); // validate password repeat apakah sama

    if (errEmail.length || errPassword.length || errrePassword.length || errUsername.length) {
        result.status(400).json({
            message: "Validation Failed",
            errors: {
                email: errEmail,
                username: errUsername,
                password: errPassword,
                rePassword: errrePassword
            }
        });
    }
    else {
        var hash = md5(password);
        var sql = `INSERT INTO pengguna (pengguna_id, pengguna_email, pengguna_password, pengguna_username) VALUES ( NULL,'${email}', '${hash}', '${username}')`;

        connection.connect((err) => {
            if (err) throw err;
            console.log("Connected successfully to MySql server")

            connection.query(sql, function (err, res) {
                if (err) {
                    console.log("Error starts here : " + err);

                    // error internal
                    result.status(500).send({ message: 'Something went wrong please try again' })
                } else {
                    // insert success
                    result.status(200).json({ message: 'Registered Succesfully' })
                }
            })
        });
        //selalu ingat! res nya mysql dan express berbeda
    }
});

app.post("/user/login", (req, result) => {
    let email = req.body.email;
    let password = req.body.password;

    let errEmail = validateEmail(email); // validate email
    let errPassword = validatePassword(password); // validate password

    if (errEmail.length || errPassword.length) {
        res.json(400, {
            message: "Validation Failed",
            errors: {
                email: errEmail,
                password: errPassword
            }
        });
    }
    else {
        var hash = md5(password);

        let sql = `SELECT * FROM PENGGUNA WHERE pengguna_email = '${email}' AND pengguna_password = '${hash}'`;

        connection.query(sql, function (err, res) {
            if (err) {
                console.log("Error starts here : " + err);
                // error internal
                result.status(500).send({ message: 'Something went wrong please try again' })
            } else {
                // insert success
                console.log(res[0].pengguna_email);
                result.status(200).json({ message: 'Logged In Succesfully',
                pengguna: {
                    email_content: res[0].pengguna_email,
                    username_content: res[0].pengguna_username
                } 
            })
            }
        })

    }
});

app.post("/key/generate", (req, result) => {
    let email = req.body.email;
    let username = req.body.username;
    let passphrase = req.body.passphrase;

    let errEmail = validateEmail(email); // validate email
    let errUsername = validateUsername(email); // validate username

    if (errEmail.length || errUsername.length) {
        res.json(400, {
            message: "Validation Failed",
            errors: {
                email: errEmail,
                username: errUsername
            }
        });
    }
    else {
        (async () => {
            const { privateKey, publicKey, revocationCertificate } = await openpgp.generateKey({
                type: 'ecc', // Type of the key, defaults to ECC
                curve: 'curve25519', // ECC curve name, defaults to curve25519
                userIDs: [{ name: username, email: email }], // you can pass multiple user IDs
                passphrase: passphrase, // protects the private key
                format: 'armored' // output key format, defaults to 'armored' (other options: 'binary' or 'object')
            });
        
            // console.log(privateKey);     // '-----BEGIN PGP PRIVATE KEY BLOCK ... '
            // console.log(publicKey);      // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
            // console.log(revocationCertificate); // '-----BEGIN PGP PUBLIC KEY BLOCK ... '

            let keyPrivate = Buffer.from(privateKey).toString('base64');
            let keyPublic = Buffer.from(publicKey).toString('base64');

            let sql = `SELECT * FROM PENGGUNA WHERE pengguna_email = '${email}'`;
    
            connection.query(sql, function (err, res) {
                if (err) {
                    console.log("Error starts here : " + err);
                    // error internal
                    result.status(500).send({ message: 'Something went wrong please try again' })
                } else {
                    // get pengguna success
                    
                    let sqlKunci = `INSERT INTO kunci (kunci_id, kunci_content, fk_pengguna, kunci_status) VALUES ( NULL,'${keyPublic}', '${res[0].pengguna_id}', '1')`;
            
                    connection.query(sqlKunci, function (err, res2) {
                        if (err) {
                            console.log("Error starts here : " + err);
                            // error internal
                            result.status(500).send({ message: 'Something went wrong please try again' })
                        } else {
                            // insert success
                            result.status(200).json({ message: 'Key Generated Succesfully',
                            key: {
                                private: keyPrivate,
                                public: keyPublic
                            } 
                        })
                        }
                    })
                }
            })
            
        })();
    }
});
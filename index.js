const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const http = require('http');
const openpgp = require("openpgp");
const fs = require("fs");

const app = express();
var server = http.createServer(app);

const connection = mysql.createConnection({
    host: "kembang.in",
    user: "andrew",
    password: "password",
    database: "secure-attached-db"
});

server.listen(3000);
console.log('Express server started on port %s', server.address().port);

connection.connect((err) => {
    if (err) throw err;
    console.log("Connected successfully to MySql server")
});

app.get("/", (req, res) => {
    res.send("Hello From The Server");
})

function validateEmail(email) {
    let errors = [];

    // checks whether email is empty or not
    if (email.length == 0) {
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

    //key public jangan lupa untuk disimpan di db sedangkan private kirim ke user
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

app.get("/user/register", (req, res) => {
    console.log(req.query);
    let email = req.query.email;
    let password = req.query.password;
    let rePassword = req.query.rePassword;

    let errEmail = validateEmail(email); // validate email
    let errPassword = validatePassword(password); // validate password
    let errrePassword = validateRepeatPassword(rePassword, password); // validate password repeat apakah sama

    if (errEmail.length || errPassword.length || errrePassword.length) {
        res.json(200, {
            msg: "Validation Failed",
            errors: {
                email: errEmail,
                password: errPassword,
                rePassword: errrePassword
            }
        });
    }
    else {
        let query = `INSERT INTO USER (user_id, user_email, user_password) VALUES ( NULL,'${email}', '${password}')`;

        connection.query(query, (err, result) => {
            if (err) {
                // error internal
                res.json(500, {
                    msg: "Some thing went wrong please try again"
                })
            }

            // insert success

            res.json(200, {
                msg: "Student Registered Succesfully",
            })
        })

    }
});
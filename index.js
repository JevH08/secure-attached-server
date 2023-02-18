const express = require("express");
const mysql = require("mysql");
const http = require('http');
const openpgp = require("openpgp");
const fs = require("fs");
const bodyParser = require('body-parser');
const multer = require("multer");
const md5 = require('md5');
const path = require("path");
require('dotenv').config()
const app = express();
const port = process.env.PORT || 3000;
const upload = multer({ dest: './public/data/uploads/' })
// Parsing middleware
// Parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false })); // Remove 
app.use(express.urlencoded({ extended: true })); // New
// Parse application/json
// app.use(bodyParser.json()); // Remove
app.use(express.json()); // New
app.use(bodyParser.raw());// file

// var server = http.createServer(app);
app.listen(port, () => console.log(`Listening on port ${port}`))

// console.log(process.env.DB_USERNAME)
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
        //selalu ingat! res nya mysql dan express berbeda
        connection.end;
    }
});

app.post("/user/login", (req, result) => {
    let email = req.body.email;
    let password = req.body.password;

    let errEmail = validateEmail(email); // validate email
    let errPassword = validatePassword(password); // validate password

    if (errEmail.length || errPassword.length) {
        result.json(400, {
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
                result.status(200).json({ message: 'Logged In Succesfully',
                pengguna: {
                    id_content: res[0].pengguna_id,
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
    let fk_pengguna = req.body.fk_pengguna;
    
    let errEmail = validateEmail(email); // validate email
    let errUsername = validateUsername(email); // validate username

    if (errEmail.length || errUsername.length) {
        console.log("masuk if");
        result.json(400, {
            message: "Validation Failed",
            errors: {
                email: errEmail,
                username: errUsername
            }
        });
    }
    else {
        generate();
        async function generate() {
            const { privateKey, publicKey, revocationCertificate } = await openpgp.generateKey({
                type: 'ecc', // Type of the key, defaults to ECC
                curve: 'curve25519', // ECC curve name, defaults to curve25519
                userIDs: [{ name: username, email: email }], // you can pass multiple user IDs
                passphrase: passphrase, // protects the private key
                format: 'armored' // output key format, defaults to 'armored' (other options: 'binary' or 'object')
            });

            let keyPrivate = Buffer.from(privateKey).toString('base64');
            let keyPublic = Buffer.from(publicKey).toString('base64');

            let sql = `SELECT * FROM PENGGUNA WHERE pengguna_email = '${email}' AND pengguna_id = '${fk_pengguna}'`;
            try {
                connection.query(sql, function (err, res) {
                    if (res.length < 1) {
                        // error internal
                        result.status(500).send({ message: 'Logged in User and email mismatch' })
                    } else {
                        // get pengguna success
                        if(res.length < 1){
                            let sqlEmptyKunci = `UPDATE kunci SET kunci_status = 0 WHERE fk_pengguna = '${fk_pengguna}'`;
                            connection.query(sqlEmptyKunci, function (err, res) {
                                console.log(res);
                            })
                        }

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
                                }})
                            }
                        })
                    }
                })
            } catch (error) {
                console.log(error);
            }
            
        };
    }
});

app.post("/file/encryption", upload.single('file'), (req, result) => {
    let originalname = req.file.originalname;
    let filename = req.file.filename;
    let filepath = req.file.path;
    let email = req.body.email;
    let passwordFile = req.body.passwordFile;
    let id_pengirim = req.body.id_pengirim;

    let errEmail = validateEmail(email); // validate email

    if (errEmail.length) {
        res.json(400, {
            message: "Validation Failed",
            errors: {
                email: errEmail
            }
        });
    }
    else {
        //mencari id penerima 
        let sql = `SELECT * FROM PENGGUNA WHERE pengguna_email = '${email}'`;
    
        connection.query(sql, function (err, res) {
            if (err) {
                console.log("Error starts here : " + err);
                // error internal
                result.status(500).send({ message: 'Select pengguna fail' })
            } else {
                // get id penerima success
                console.log("get id penerima sukses");
                let pengguna_id = res[0].pengguna_id
                let sqlKunci = `SELECT * FROM KUNCI WHERE fk_pengguna = '${pengguna_id}'`;

                connection.query(sqlKunci, function (err, res2) {
                    if (err) {
                        console.log("Error starts here : " + err);
                        // error internal
                        result.status(500).send({ message: 'Select kunci fail' })
                    } else {
                        // select fk pengguna di tabel kunci success
                        console.log("get fk pengguna sukses");
                        let encodedPublicKey = res2[0].kunci_content;
                        let buff = Buffer.from(encodedPublicKey, 'base64');
                        let publicKeyArmored = buff.toString('utf-8');

                        // tipe text jangan lupa tambahkan untuk tipe zip lihat github
                        // pengecekan tipe extension
                        if(originalname.includes(".txt")){
                            enkrip();
                            async function enkrip() {
                                const plainData = fs.readFileSync(filepath,'utf8');
                                const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
    
                                const encrypted = await openpgp.encrypt({
                                    message: await openpgp.createMessage({text: plainData}),
                                    encryptionKeys: publicKey
                                });
    
                                console.log(encrypted);
                                let fk_penerima = res2[0].fk_pengguna;
                                let filepathBaru = "\\" + filename ;
                                let date_now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    
                                // filepathBaru disimpan pada tabel history di history_link. filepath pada history adalah link www sedangkan pada file adalah directory untuk akses pada server
                                let sqlHistory = `INSERT INTO history (history_id, history_link, history_fk_sender, history_fk_receiver, history_time, history_status) VALUES ( NULL,'${filepathBaru}','${id_pengirim}','${fk_penerima}', '${date_now}', '1')`;
                                connection.query(sqlHistory, function (err, res3) {
                                    if (err) {
                                        console.log("Error starts here : " + err);
                                        // error internal
                                        result.status(500).send({ message: 'Insert History fail' })
                                    } else {
                                        // history success
                                        console.log("insert history sukses");
    
                                        let sqlGetHistoryId = `SELECT * FROM history WHERE history_link = '${filepathBaru}'`;
                                        connection.query(sqlGetHistoryId, function (err, res4) {
                                            if (err) {
                                                console.log("Error starts here : " + err);
                                                // error internal
                                                result.status(500).send({ message: 'Insert History fail' })
                                            } else {
                                                // ambil data history
                                                let fk_history = res4[0].history_id;
                                                let filepathServer = "public\\" + filepathBaru;
                                                //file content adalah filepath pada directory server
                                                let sqlFile = `INSERT INTO file (file_id, file_content, file_type, fk_history, file_status) VALUES ( NULL,'${filepathServer}','txt','${fk_history}', '1')`;
                                                connection.query(sqlFile, function (err, res5) {
                                                    if (err) {
                                                        console.log("Error starts here : " + err);
                                                        // error internal
                                                        result.status(500).send({ message: 'Insert History fail' })
                                                    } else {
                                                        // history success
                                                        console.log("insert file sukses");
    
                                                        fs.writeFileSync(__dirname + "\\public\\" + filepathBaru, encrypted);
                                                        result.status(200).json({ message: 'File Encrypted Succesfully', 
                                                        download_link: filepathBaru})
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            };
                        }else if(originalname.includes(".zip")){
                            // jika zip
                            enkrip();
                            async function enkrip() {
                                const fileToUint8Array = fs.readFileSync(filepath);

                                const fileForOpenPGP = await openpgp.createMessage({ binary: new Uint8Array(fileToUint8Array) });
                                
                                console.log(fileToUint8Array);
                                const message = await openpgp.createMessage({ binary: fileToUint8Array });
                                const encrypted = await openpgp.encrypt({
                                    message, // input as Message object
                                    passwords: [passwordFile], // multiple passwords possible
                                    format: 'binary' // don't ASCII armor (for Uint8Array output)
                                });

                                let fk_penerima = res2[0].fk_pengguna;
                                let filepathBaru = "\\" + filename ;
                                let date_now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

                                // filepathBaru disimpan pada tabel history di history_link. filepath pada history adalah link www sedangkan pada file adalah directory untuk akses pada server
                                let sqlHistory = `INSERT INTO history (history_id, history_link, history_fk_sender, history_fk_receiver, history_time, history_status) VALUES ( NULL,'${filepathBaru}','${id_pengirim}','${fk_penerima}', '${date_now}', '1')`;
                                connection.query(sqlHistory, function (err, res3) {
                                    if (err) {
                                        console.log("Error starts here : " + err);
                                        // error internal
                                        result.status(500).send({ message: 'Insert History fail' })
                                    } else {
                                        // history success
                                        console.log("insert history sukses");
    
                                        let sqlGetHistoryId = `SELECT * FROM history WHERE history_link = '${filepathBaru}'`;
                                        connection.query(sqlGetHistoryId, function (err, res4) {
                                            if (err) {
                                                console.log("Error starts here : " + err);
                                                // error internal
                                                result.status(500).send({ message: 'Insert History fail' })
                                            } else {
                                                // ambil data history
                                                let fk_history = res4[0].history_id;
                                                let filepathServer = "public\\" + filepathBaru;
                                                //file content adalah filepath pada directory server
                                                let sqlFile = `INSERT INTO file (file_id, file_content, file_type, fk_history, file_status) VALUES ( NULL,'${filepathServer}','zip','${fk_history}', '1')`;
                                                connection.query(sqlFile, function (err, res5) {
                                                    if (err) {
                                                        console.log("Error starts here : " + err);
                                                        // error internal
                                                        result.status(500).send({ message: 'Insert History fail' })
                                                    } else {
                                                        // history success
                                                        console.log("insert file sukses");
    
                                                        fs.writeFileSync(__dirname + "\\public\\" + filepathBaru, encrypted);
                                                        result.status(200).json({ message: 'File Encrypted Succesfully', 
                                                        download_link: filepathBaru})
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            };
                        }else{
                            result.status(500).send({ message: 'File not supported' })
                        }
                    }
                })
            }
        })
    }
});

app.post("/file/decryption", upload.single('key'), (req, result) => {
    
    let downloadCode = req.body.down_code;
    let passwordTxt = req.body.pass_txt;

    if (!downloadCode.length) {
        result.json(400, {
            message: "Bad Request",
            errors: {
                downCode: "Download code is not given"
            }
        });
    }
    else {
        //mencari link download dari database
        let sql = `SELECT * FROM HISTORY WHERE history_link = '${downloadCode}'`;
    
        connection.query(sql, function (err, res) {
            if (err) {
                console.log("Error starts here : " + err);
                // error internal
                result.status(500).send({ message: 'Download code not Exist' })
            } else {
                // get id penerima success
                console.log("get id penerima sukses");
                let history_id = res[0].history_id;
                let history_time = res[0].history_time;
                let date = history_time.getDay();
                let month = history_time.getMonth();
                let year = history_time.getYear();
                let newFileName = "decrypted" + date + month + year + history_id;
                let sqlFile = `SELECT * FROM FILE WHERE fk_history = '${history_id}'`;

                connection.query(sqlFile, function (err, res2) {
                    if (err) {
                        console.log("Error starts here : " + err);
                        // error internal
                        result.status(500).send({ message: 'File not found' })
                    } else {
                        // ambil lokasi file dari database
                        let directoryFile = res2[0].file_content;
                        let fileType = res2[0].file_type;

                        if(fileType == "txt"){
                            let keyName = req.file.filename;
                            let keyDirectory = req.file.path;
                            const txtData = fs.readFileSync(__dirname + "\\" + directoryFile);
                            const privateKeyArmored = fs.readFileSync(__dirname + "\\" + keyDirectory);

                            console.log(txtData.toString());
                            dekrip();
                            async function dekrip() {
                                const passphrase = passwordTxt;
                                const privateKey = await openpgp.decryptKey({
                                    privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored.toString()}),
                                    passphrase
                                });

                                const message = await openpgp.readMessage({
                                    armoredMessage: txtData.toString() // parse armored message
                                });
                                const { data: decrypted } = await openpgp.decrypt({
                                    message,
                                    decryptionKeys: privateKey
                                });
                                console.log(decrypted); // 'Hello, World!'
                                result.status(200).json({ message: 'txt', file: decrypted});
                            }
                        }else if(fileType == "zip"){
                            const zipData = fs.readFileSync(__dirname + "\\" + directoryFile);

                            dekrip();
                            async function dekrip() {
                                const encryptedMessage = await openpgp.readMessage({
                                    binaryMessage: zipData // parse encrypted bytes
                                });
                                const { data: decrypted } = await openpgp.decrypt({
                                    message: encryptedMessage,
                                    passwords: [passwordTxt], // decrypt with password
                                    format: 'binary' // output as Uint8Array
                                });
                                let downloadLink = __dirname + "\\public\\" + newFileName;
                                fs.writeFileSync(downloadLink + ".zip", decrypted);
                                console.log("Download di server sukses");
                                console.log(downloadLink);

                                result.status(200).json({ message: 'zip', 
                                download_link: newFileName});
                            }
                        }
                    }
                })
            }
        })
    }
});

app.get('/download/:directory', (req, res)=>{
    var filename = req.params.directory;
    console.log("ini directory pada /download : " + filename + ".zip");

    res.download(path.resolve( __dirname + "\\public\\" + filename + ".zip"));
});

app.get('/upload/history/:id_pengirim', (req, result)=>{
    var id_pengirim = req.params.id_pengirim;

    let sqlHistory = `SELECT h.history_id, h.history_link, h.history_time, p.pengguna_username FROM history h, pengguna p WHERE h.history_fk_sender = '${id_pengirim}' AND h.history_fk_receiver = p.pengguna_id AND h.history_status = '1'`;

    connection.query(sqlHistory, function (err, res) {
        if (err) {
            console.log("Error starts here : " + err);
            // error internal
            result.status(500).send({ message: 'Get History fail' })
        } else {
            // history success
            console.log("get history sukses");
            console.log(res);

            result.status(200).json({ message: 'Upload History', 
            history: res});
        }
    })
});
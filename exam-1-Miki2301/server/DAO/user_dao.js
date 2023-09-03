const crypto = require('crypto');

const sqlite = require('sqlite3');
const db = new sqlite.Database('database.db', (err) => {
    if (err) throw err;
});
/**
 * Query the database and check whether the username exists and the password
 * hashes to the correct value.
 * If so, return an object with full user information.
 * @param {string} username
 * @param {string} password
 * @returns {Promise} a Promise that resolves to the full information about the current user, if the password matches
 * @throws the Promise rejects if any errors are encountered
 */
function getUser(username, password) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE email=?';
        db.get(sql, [username], (err, row) => {
            if (err) { // database error
                reject(err);
            } else {
                if (!row) { // non-existent user
                    reject('Invalid username or password');
                } else {
                    crypto.scrypt(password, row.salt, 32, (err, computed_hash) => {
                        if (err) { // key derivation fails
                            reject(err);
                        } else {
                            const equal = crypto.timingSafeEqual(computed_hash, Buffer.from(row.hash, 'hex'));
                            if (equal) { // password ok
                                resolve(row);
                            } else { // password doesn't match
                                reject('Invalid username or password');
                            }
                        }
                    });
                }
            }
        });
    });
}

function getUserIdByEmail(email) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT userId FROM users WHERE email=?';
        db.get(sql, [email], (err, row) => {
            if (err) { // database error
                reject(err);
            } else {
                if (!row) { // non-existent user
                    resolve(undefined);
                } else {
                    resolve(row.userId);
                }
            }
        });
    });
}

function getEmailByUserId(userId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT email FROM users WHERE userId=?';
        db.get(sql, [userId], (err, row) => {
            if (err) { // database error
                reject(err);
            } else {
                if (!row) { // non-existent user
                    resolve(undefined);
                } else {
                    resolve(row.email);
                }
            }
        });
    })
}

function getUsers(){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT email FROM users';
        db.all(sql, [], (err, rows) => {
            if (err) { // database error
                reject(err);
            } else {
                resolve(rows);
            }
        });
    })
}

module.exports = {getUser, getUserIdByEmail, getEmailByUserId, getUsers};
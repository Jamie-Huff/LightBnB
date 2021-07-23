const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});


/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithEmail = function(email) {
  return pool
    .query(`SELECT * FROM users
    WHERE email = '${email}'`)
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message, 'test');
    });
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool
  .query(`SELECT * FROM users
  WHERE id = '${id}'`)
  .then((result) => {
    return result.rows[0]
  })
  .catch((err) => {
    console.log(err.message);
  });
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  return pool
  .query(`INSERT INTO users(name, email, password)
  VALUES('${user.name}', '${user.email}', 'password')
  RETURNING *`)
  .then((result) => {
    return Promise.resolve(result.rows)
  })
  .catch((err) => {
    console.log(err.message);
  });
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  console.log('limit = ', limit)
  const queryString = `SELECT r.*, p.* 
      FROM reservations r
      JOIN properties p ON r.property_id = p.id
      WHERE guest_id = $1 LIMIT $2`;

  return pool
  .query(queryString, [guest_id, limit])
  .then((result) => {
    return result.rows;
  })
  .catch((err) => {
    console.log(err.message);
  });
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
 const getAllProperties = (options, limit = 10) => {
  const queryParams = [];
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;
  console.log(options)
  // if (options.city) {
  //   queryParams.push(`%${options.city}%`);
  //   queryString += `WHERE city LIKE $${queryParams.length} `;
  // }
  // if (options.owner_id) {
  //   queryParams.push(`%${options.owner_id}%`);
  //   queryString += `WHERE owner_id = $${owner_id} `;
  // }
  // if (options.minimum_price_per_night) {
  //   queryParams.push(`%${options.minimum_price_per_night}%`);
  //   queryString += `WHERE cost_per_night/100 >= $${minimum_price_per_night} `;
  // }
  // if (options.maximum_price_per_night) {
  //   queryParams.push(`%${options.maximum_price_per_night}%`);
  //   queryString += `WHERE cost_per_night/100 <= $${maximum_price_per_night} `;
  // }
  // if (options.minimum_rating) {
  //   // join statement..? multi lines? 
  //   queryParams.push(``);
  //   queryString += ``;
  // }
  if (options.owner_id || options.city || options.minimum_price_per_night || options.maximum_price_per_night) {
    queryString = queryString.concat('WHERE ')
    for (const key in options) {
      if (options[key] && key !== 'minimum_rating') {
        if (key === 'city') {
          queryParams.push(`%${options.city}%`)
          queryString = queryString.concat(`${key} LIKE $${queryParams.length} `)
        }
        if (key === 'owner_id') {
          queryParams.push(`${options.owner_id}`)
          queryString = queryString.concat(`owner_id = $${queryParams.length} `)
        }
        if (key === 'minimum_price_per_night') {
          queryParams.push(`${options.minimum_price_per_night}`)
          queryString = queryString.concat(`cost_per_night/100 >= $${queryParams.length} `)
        }
        if (key === 'maximum_price_per_night') {
          queryParams.push(`${options.maximum_price_per_night}`)
          queryString = queryString.concat(`cost_per_night/100 <= $${queryParams.length} `)
        }
        queryString = queryString.concat('AND ')
      }
    }
    queryString = queryString.substring(0, queryString.length - 4)
  }

  queryString += `GROUP BY properties.id `
  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`)
    queryString = queryString.concat(`HAVING avg(property_reviews.rating) >= $${queryParams.length} `)
  }
  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;
  console.log(queryString, queryParams, 'this string');

  return pool.query(queryString, queryParams).then((res) => res.rows);
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;

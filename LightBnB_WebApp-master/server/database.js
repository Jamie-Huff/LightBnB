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
  console.log(email)
  const queryString = `SELECT * FROM users
  WHERE email = $1`
  return pool
  .query(queryString, [email])
  .then((result) => {
    console.log(result.rows[0])
    return result.rows[0]
  })
  .catch((err) => {
    console.log(err.message);
  });
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  console.log(id)
  const queryString = `SELECT * FROM users
  WHERE id = $1`
  return pool
  .query(queryString, [id])
  .then((result) => {
    console.log(result.rows)
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
  const queryString = `
    INSERT INTO users(name, email, password)
    VALUES($1, $2, $3)
    RETURNING *` 

  return pool
  .query(queryString, [user.name, user.email, user.password])
  .then((result) => {
    return result.rows[0]['id']
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

  return pool
  .query(`
    INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;`, [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, Number(property.cost_per_night * 100), property.street, property.city, property.province, property.post_code, property.country, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms])
  .then((result) => {
    return result.rows[0]
  })
  .catch((err) => {
    return err.message;
  })


  
}
exports.addProperty = addProperty;

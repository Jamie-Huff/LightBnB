INSERT INTO users (name, email, password)
VALUES ('billy', 'billysOriginalEmail@email.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.'),
('sally', 'sallyemail@email.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.'),
('bobbie', 'bobbieEmail@email.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.');

INSERT INTO properties (title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, parking_spaces, number_of_bathrooms, number_of_bedrooms, country, street, city, province, post_code, active)
VALUES ('bobs house', 'description', 'photo', 'coverphoto', 5, 5, 5, 5, 'canada', 'main street', 'london', 'ontario', 'n0n1e0', true),
('sally house', 'description', 'photo', 'coverphoto', 5, 3, 2, 6, 'canada', 'main street', 'toronto', 'ontario', 'n1n1n1', true),
('haunted house', 'description', 'photo', 'coverphoto', 5, 5, 5, 5, 'canada', 'main street', 'big city town', 'ontario', 'n1ddw12', true);

INSERT INTO reservations (start_date, end_date)
VALUES ('2021-01-01', '2021-01-05'),
('2021-05-04', '2021-09-12'),
('2021-09-04', '2021-10-25');

INSERT INTO property_reviews (rating, message)
VALUES (5, 'nice house'),
(1, 'actual garbage'),
(3, 'nice pool');
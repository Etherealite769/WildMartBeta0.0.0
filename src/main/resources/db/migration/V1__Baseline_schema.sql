-- This is a baseline migration that matches the current database schema
-- It's generated based on the Hibernate-managed schema

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone_number VARCHAR(50),
    profile_image VARCHAR(512),
    bio TEXT,
    shipping_address TEXT,
    payment_info_encrypted VARCHAR(512),
    is_verified TINYINT(1) DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (user_id),
    UNIQUE KEY uk_email (email),
    UNIQUE KEY uk_username (username)
) ENGINE=InnoDB;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    category_id BIGINT NOT NULL AUTO_INCREMENT,
    category_name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    is_active TINYINT(1) DEFAULT 1,
    PRIMARY KEY (category_id),
    UNIQUE KEY uk_category_name (category_name)
) ENGINE=InnoDB;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    product_id BIGINT NOT NULL AUTO_INCREMENT,
    seller_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(15,2) NOT NULL,
    quantity_available INT DEFAULT 0,
    image_url VARCHAR(512),
    status VARCHAR(50) DEFAULT 'active',
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    average_rating DOUBLE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (product_id),
    CONSTRAINT fk_products_seller FOREIGN KEY (seller_id) REFERENCES users(user_id),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(category_id)
) ENGINE=InnoDB;

-- Create carts table
CREATE TABLE IF NOT EXISTS carts (
    cart_id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (cart_id),
    UNIQUE KEY uk_user_cart (user_id),
    CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
    cart_item_id BIGINT NOT NULL AUTO_INCREMENT,
    cart_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price_at_addition DECIMAL(15,2) NOT NULL,
    added_at DATETIME NOT NULL,
    PRIMARY KEY (cart_item_id),
    UNIQUE KEY uk_cart_product (cart_id, product_id),
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(product_id)
) ENGINE=InnoDB;

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    order_id BIGINT NOT NULL AUTO_INCREMENT,
    buyer_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    order_number VARCHAR(100) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    order_status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    shipping_address TEXT,
    notes TEXT,
    order_date DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (order_id),
    UNIQUE KEY uk_order_number (order_number),
    CONSTRAINT fk_orders_buyer FOREIGN KEY (buyer_id) REFERENCES users(user_id),
    CONSTRAINT fk_orders_seller FOREIGN KEY (seller_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id BIGINT NOT NULL AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,
    PRIMARY KEY (order_item_id),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(product_id)
) ENGINE=InnoDB;

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
    like_id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    liked_at DATETIME NOT NULL,
    PRIMARY KEY (like_id),
    UNIQUE KEY uk_like_user_product (user_id, product_id),
    CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_likes_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Create views table
CREATE TABLE IF NOT EXISTS views (
    view_id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    viewed_at DATETIME NOT NULL,
    PRIMARY KEY (view_id),
    CONSTRAINT fk_views_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_views_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    INDEX idx_views_user (user_id),
    INDEX idx_views_product (product_id)
) ENGINE=InnoDB;

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    review_id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (review_id),
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Create indexes for better performance
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

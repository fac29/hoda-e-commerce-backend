//import { db } from 'database/db.sqlite';
const Database = require('better-sqlite3');
export const db = new Database('database/db.sqlite');

type Product = {
    product_id: number;
    product_name: string;
    product_author: string;
    product_description: string;
    category: string;
    price: number;
    product_image: string;
    stock: number;
};

type Review = {
    review_id: number;
    author: string;
    rating: number;
    comment: string;
};

type ProductWithReviews = Product & {
    reviews: Review[];
};

type Products = Product[];
type ProductsWithReviews = ProductWithReviews[];

type OrderItem = {
    product_id: number;
    product_name: string;
    price: number;
    quantity: number;
};

type Order = {
    user_id: number;
    order_id?: number;
    products: OrderItem[];
};

type OrderId = {
    order_id: number;
};

const select_products = db.prepare(/*sql*/ `
SELECT
    p.product_id,
    p.product_name,
    p.product_author,
    p.product_description,
    p.category,
    p.price,
    p.product_image,
    p.stock,
    json_group_array(
        json_object(
            'review_id', r.review_id,
            'author', r.author,
            'rating', r.rating,
            'comment', r.comment
        )
    ) as reviews
FROM products p
LEFT JOIN reviews r ON r.product_id = p.product_id
GROUP BY p.product_id
`);

export function listProductsAll(): ProductsWithReviews {
    const products = select_products.all();
    return products.map((product: any) => ({
        ...product,
        reviews: JSON.parse(product.reviews),
    }));
}
// Test for getProductsAll - get an array of all the product objects.
//console.log(listProductsAll());

const select_product_by_id = db.prepare(
    `
SELECT
    p.product_id,
    p.product_name,
    p.product_author,
    p.product_description,
    p.category,
    p.price,
    p.product_image,
    p.stock,
    json_group_array(
        json_object(
            'review_id', r.review_id,
            'author', r.author,
            'rating', r.rating,
            'comment', r.comment
        )
    ) as reviews
FROM products p
LEFT JOIN reviews r ON r.product_id = p.product_id
WHERE p.product_id = ?
GROUP BY p.product_id
    `
);
export function getProductByID(id: number): ProductWithReviews | undefined {
    const product = select_product_by_id.get(id);
    if (product) {
        return {
            ...product,
            reviews: JSON.parse(product.reviews),
        };
    }
    return undefined;
}
// Test for geProductByID - where you can get a product via a products'id (1 - 12)
// console.log(getProductByName(10));

const select_product_by_name = db.prepare(`
SELECT
    p.product_id,
    p.product_name,
    p.product_author,
    p.product_description,
    p.category,
    p.price,
    p.product_image,
    p.stock,
    json_group_array(
        json_object(
            'review_id', r.review_id,
            'author', r.author,
            'rating', r.rating,
            'comment', r.comment
        )
    ) as reviews
FROM products p
LEFT JOIN reviews r ON r.product_id = p.product_id
WHERE p.product_name = ?
GROUP BY p.product_id
`);
export function getProductByName(name: string): ProductWithReviews | undefined {
    const product = select_product_by_name.get(name);
    if (product) {
        return {
            ...product,
            reviews: JSON.parse(product.reviews),
        };
    }
    return undefined;
}

//Test for geProductByName - where you can get a product via a products'(book) name
//console.log(getProductByName('To Kill a Mockingbird'));

const search_products = db.prepare(`
SELECT
    p.product_id,
    p.product_name,
    p.product_author,
    p.product_description,
    p.category,
    p.price,
    p.product_image,
    p.stock,
    json_group_array(
        json_object(
            'review_id', r.review_id,
            'author', r.author,
            'rating', r.rating,
            'comment', r.comment
        )
    ) as reviews
FROM products p
LEFT JOIN reviews r ON r.product_id = p.product_id
WHERE p.product_description LIKE ? OR p.product_name LIKE ? OR p.product_author LIKE ? OR p.category LIKE ?
GROUP BY p.product_id
`);

export function getProductBySearchTerm(
    searchTerm: string
): ProductsWithReviews | undefined {
    const products = search_products.all(
        '%' + searchTerm + '%',
        '%' + searchTerm + '%',
        '%' + searchTerm + '%',
        '%' + searchTerm + '%'
    );
    return products.map((product: any) => ({
        ...product,
        reviews: JSON.parse(product.reviews),
    }));
}

/*test for getProductsBySeatchTerm
you can seach by any word in
- name
- description
-author
-category
*/
// console.log(getProductBySearchTerm('The'));

const add_new_order = db.prepare(/* sql */ `
    INSERT INTO orders (user_id) VALUES (?)
    RETURNING order_id
`);

const add_order_item = db.prepare(/* sql */ `
    INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)
    RETURNING product_id, quantity
`);

export function addNewOrder({ user_id, products }: Order) {
    const orderId: OrderId = add_new_order.get(user_id);
    const order: Order = {
        user_id: user_id,
        order_id: 0,
        products: [],
    };
    order.order_id = orderId.order_id;
    for (const product of products) {
        let orderItem = add_order_item.get(
            orderId.order_id,
            product.product_id,
            product.quantity
        );

        orderItem.product_name = product.product_name;
        orderItem.price = product.price;

        order.products.push(orderItem);
    }
    return order;
}

//Test object
// const newOrder = {
//     user_id: 1,
//     products: [
//         {
//             product_id: 1,
//             product_name: 'The Great Gatsby',
//             price: 1099,
//             quantity: 1,
//         },
//         {
//             product_id: 2,
//             product_name: 'To Kill a Mockingbird',
//             price: 1299,
//             quantity: 1,
//         },
//     ],
// };

// console.log(addNewOrder(newOrder));

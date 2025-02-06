SELECT 
    c.name AS category_name,
    SUM(oi.quantity * p.price) AS total_revenue
FROM order_items oi
JOIN orders o ON oi.ord_id = o.ord_id
JOIN products p ON oi.product_id = p.prod_id
JOIN categories c ON p.cat_id = c.cat_id
WHERE 
    o.ordered_at >= CURRENT_DATE - INTERVAL '1 year'
    AND o.status = 'done'
GROUP BY c.name
HAVING SUM(oi.quantity * p.price) > 150000
ORDER BY total_revenue DESC;

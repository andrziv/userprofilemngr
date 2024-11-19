const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Client } = require('pg');  // PostgreSQL client

// PostgreSQL client setup
const client = new Client({
    user: 'USER',
    host: 'HOST',
    database: 'usermanagement',
    password: 'PASSWORD',
    port: PORT, // default PostgreSQL port
});

client.connect(); // Establish connection to the database

const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

app.get('/api/users', async (req, res) => {
    try {
        const result = await client.query('SELECT users.* , name as company_name FROM users INNER JOIN companies ON users.company_id = companies.id');
        res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).send('Database error');
    }
});

// Route to get user details (fetch from SQL database)
app.get('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const userResult = await client.query('SELECT users.* , name as company_name FROM users INNER JOIN companies ON users.company_id = companies.id WHERE users.id = $1', [userId]);
        const purchasesResult = await client.query('SELECT * FROM purchases WHERE user_id = $1', [userId]);
        const vehiclesResult = await client.query('SELECT * FROM vehicles WHERE company_id = $1', [userResult.rows[0].company_id]);
        const paymentCredsResult = await client.query('SELECT * FROM payment_credentials WHERE user_id = $1', [userId]);

        res.json({
            user: userResult.rows[0],
            purchases: purchasesResult.rows.map((row) => ({...row, purchase_date: row.purchase_date.toISOString().substring(0, 10)})),
            vehicles: vehiclesResult.rows,
            paymentCreds: paymentCredsResult.rows,
        });
    } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
    }
});

// Update user details
app.put("/api/user/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const { firstName, lastName, email, phone, employeeRole } = req.body;
  try {
    const result = await client.query(
      `UPDATE "UserProfile"
      SET "FirstName" = $1, "LastName" = $2, "EmailAddress" = $3, "PhoneNumber" = $4, "EmployeeRole" = $5
      WHERE "UserID" = $6 RETURNING *`,
      [firstName, lastName, email, phone, employeeRole, userId]
    );
    if (result.rows.length === 0) return res.status(404).send("User not found");
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).send("Database query error");
  }
});

// Route to update user contact info (update SQL database)
app.put('/api/user/contact/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    const { email, phone_number } = req.body;

    try {
        console.log(`Received request to update user ${userId} with email: ${email}, phone_number: ${phone_number}`);

        const result = await client.query(
            'UPDATE users SET email = $1, phone_number = $2 WHERE id = $3',
            [email, phone_number, userId]
        );

        if (result.rowCount > 0) {
            console.log('User contact info updated successfully');
            res.json({ message: 'User contact info updated successfully' });
        } else {
            console.log('User not found');
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error('Error updating user contact info:', err);
        res.status(500).send('Internal server error');
    }
});

// Create a new user
// Haven't tested yet
app.post("/api/user", async (req, res) => {
  const { firstName, lastName, email, phone, companyId, employeeRole, loyaltyPoints } = req.body;
  try {
    const result = await client.query(
      `INSERT INTO users (last_name, first_name, email, phone_number, company_id, role, loyalty_points)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [lastName, firstName, email, phone, companyId, employeeRole, loyaltyPoints]
    );
    const id_get_response = await client.query(`SELECT id FROM users WHERE email = '${email}';`)
    const id = id_get_response.rows[0].id;
    console.log(`New user created with ID: ${id}`);
    const payment_create_result = await client.query(`INSERT INTO payment_credentials (user_id) VALUES (${id}) RETURNING *`);

    const combo_json = {...result.rows[0], ...payment_create_result[0]}
    res.status(201).json(combo_json);
  } catch (err) {
    console.error("Error creating user: or payment credentials", err);
    res.status(500).send("Database query error");
  }
});

// Delete a user
// Doesn't work because we'd need to remove any existence of the ID in other tables. Tbh we don't need the ability to delete users.
app.delete("/api/user/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);
    if (result.rows.length === 0) return res.status(404).send("User not found");
    res.json({ message: "User deleted successfully", user: result.rows[0] });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send("Database query error");
  }
});

// Route to update payment details (update SQL database)
app.put("/api/user/:userId/payment", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const { card_number, cvv, expiration_date, provider, address } = req.body;

  try {
    console.log(`Received request to update payment details for user ${userId} with card_number: ${card_number}, cvv: ${cvv}, expiration_date: ${expiration_date}, provider: ${provider}, address: ${address}`);

    const result = await client.query(
      `UPDATE payment_credentials
      SET card_number = $1, cvv = $2, expiration_date = $3, provider = $4, address = $5
      WHERE user_id = $6 RETURNING *`,
      [card_number, cvv, expiration_date, provider, address, userId]
    );

    if (result.rows.length === 0) {
      console.log('Payment credentials not found');
      return res.status(404).send("Payment credentials not found");
    }

    console.log('Payment credentials updated successfully');
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating payment credentials:", err);
    res.status(500).send("Database query error");
  }
});

// Get payment credentials for a user
// Haven't tested yet
app.get("/api/user/:userId/payment", async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const result = await client.query('SELECT * FROM "PaymentCredential" WHERE "Owner" = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).send("No payment credentials found");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching payment credentials:", err);
    res.status(500).send("Database query error");
  }
});

// Add payment credentials
// Haven't tested yet
app.post("/api/user/:userId/payment", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const { accountNumber, cvv, expiryDate, accountType, address } = req.body;
  try {
    const result = await client.query(
      `INSERT INTO "PaymentCredential" 
      ("AccountNumber", "CVV", "ExpiryDate", "AccountType", "Address", "Owner") 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [accountNumber, cvv, expiryDate, accountType, address, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding payment credentials:", err);
    res.status(500).send("Database query error");
  }
});

// Delete payment credentials
// Haven't tested yet
app.delete("/api/user/:userId/payment", async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const result = await client.query('DELETE FROM "PaymentCredential" WHERE "Owner" = $1 RETURNING *', [userId]);
    if (result.rows.length === 0) return res.status(404).send("Payment credentials not found");
    res.json({ message: "Payment credentials deleted successfully", credentials: result.rows[0] });
  } catch (err) {
    console.error("Error deleting payment credentials:", err);
    res.status(500).send("Database query error");
  }
});
// Route to get company vehicles (fetch from SQL database)
app.get('/api/user/vehicles/:id', async (req, res) => {
    const companyId = parseInt(req.params.id);

    try {
        // Query the database for user's vehicles
        const result = await client.query('SELECT * FROM vehicles WHERE company_id = $1', [companyId]);

        if (result.rows.length > 0) {
        res.json(result.rows);
        } else {
        res.status(404).send('No vehicles found for this company');
        }
    } catch (err) {
        console.error('Error fetching vehicles:', err);
        res.status(500).send('Internal server error');
    }
});

// Route to get user purchase history (fetch from SQL database)
app.get('/api/user/purchases/:id', async (req, res) => {
    const userId = parseInt(req.params.id);

    try {
        // Query the database for user's purchase history
        const result = await client.query('SELECT * FROM purchases WHERE user_id = $1', [userId]);

        if (result.rows.length > 0) {
        res.json(result.rows);
        } else {
        res.status(404).send('No purchase history found for this user');
        }
    } catch (err) {
        console.error('Error fetching purchases:', err);
        res.status(500).send('Internal server error');
    }
});

// Route to update user loyalty points (update SQL database)
app.put('/api/user/loyalty/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    const { points } = req.body;

    try {
        // Update loyalty points in the database
        await client.query('UPDATE users SET loyalty_points = $1 WHERE id = $2', [points, userId]);

        res.json({ message: 'User loyalty points updated successfully' });
    } catch (err) {
        console.error('Error updating loyalty points:', err);
        res.status(500).send('Internal server error');
    }
});

// Server setup
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

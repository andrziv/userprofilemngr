const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Client } = require('pg');  // PostgreSQL client
const axios =  require('axios');

// require("dotenv").config({path:"./conf.env"});
require("dotenv").config({path:"./conf.env"});

C_DB_USER = process.env.PGUSER || 'postgres';
C_DB_HOST = process.env.PGHOST || 'localhost';
C_DB_NAME = process.env.DB_NAME || 'usermanagement';
C_DB_PASS = process.env.PGPASSWORD || 'master';
C_DB_PORT = process.env.PGPORT || 5432;

// PostgreSQL client setup
const client = new Client({
    user: C_DB_USER,
    host: C_DB_HOST,
    database: C_DB_NAME,
    password: C_DB_PASS,
    port: C_DB_PORT, 
});

client.connect(); // Establish connection to the database

const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Get basic info on all users
app.get('/api/users', async (req, res) => {
    try {
        const result = await client.query('SELECT users.* , name as company_name FROM users INNER JOIN companies ON users.company_id = companies.id');
        res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).send('Database error');
    }
});

// Route to get user details via email (fetch from SQL database)
app.get('/api/users/alt/:email', async (req, res) => {
  try {
      const email = req.params.email;
      const userResult = await client.query(`SELECT users.* , name as company_name FROM users INNER JOIN companies ON users.company_id = companies.id WHERE users.email = '${email}'`);
      const userId = userResult.rows[0].id;
      const purchasesResult = await client.query('SELECT * FROM purchases WHERE user_id = $1', [userId]);
      const vehiclesResult = await client.query(`SELECT vehicle.* , vehicle_ownership.id as ownership_id FROM vehicle   
                                                INNER JOIN vehicle_ownership 
                                                ON vehicle_ownership.vehicle_id = vehicle.id 
                                                  INNER JOIN companies 
                                                  ON vehicle_ownership.company_id = companies.id 
                                                    WHERE companies.id = ${userResult.rows[0].company_id}`);
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

// Route to get user details via ID (fetch from SQL database)
app.get('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const userResult = await client.query('SELECT users.* , name as company_name FROM users INNER JOIN companies ON users.company_id = companies.id WHERE users.id = $1', [userId]);
        const purchasesResult = await client.query('SELECT * FROM purchases WHERE user_id = $1', [userId]);
        const vehiclesResult = await client.query(`SELECT vehicle.* , vehicle_ownership.id as ownership_id FROM vehicle   
                                                  INNER JOIN vehicle_ownership 
                                                  ON vehicle_ownership.vehicle_id = vehicle.id 
                                                    INNER JOIN companies 
                                                    ON vehicle_ownership.company_id = companies.id 
                                                      WHERE companies.id = ${userResult.rows[0].company_id}`);
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

// Route to create a new user
app.post("/api/user", async (req, res) => {
  const { firstName, lastName, email, phone, companyId, employeeRole, loyaltyPoints } = req.body;
  console.log(`Create a user with: ${firstName} ${lastName} ${email} ${phone} ${companyId} ${employeeRole} ${loyaltyPoints}`);
  try {
    // Create user
    const result = await client.query(
      `INSERT INTO users (last_name, first_name, email, phone_number, company_id, role, loyalty_points)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [lastName, firstName, email, phone, companyId, employeeRole, loyaltyPoints]
    );
    const id_get_response = await client.query(`SELECT id FROM users WHERE email = '${email}'`)
    const id = id_get_response.rows[0].id;
    console.log(`New user created with ID: ${id}`);
    // Automatically create a payment credential entry for user
    const payment_create_result = await client.query(`INSERT INTO payment_credentials (user_id) VALUES (${id}) RETURNING *`);

    // Forward creation of user to Group 5's stuff so we have user parity
    axios.post(`https://backend-group5.up.railway.app/register`, {username:(lastName + " " + firstName), email: email, pass:(email + '%' + lastName), 'pass-confirm':(email + '%' + lastName)});

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

// Get payment credentials for a user
// Haven't tested yet
app.get("/api/user/:userId/payment", async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const result = await client.query(`SELECT * FROM payment_credentials WHERE user_id = '${userId}'`);
    if (result.rows.length === 0) return res.status(404).send("No payment credentials found");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching payment credentials:", err);
    res.status(500).send("Database query error");
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

// Route to get user activity logs (all of them)
app.get('/api/user/activity/:id', async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
      // Synchronize our activity logs with Group 5's so we have data parity.
      synchronize_activities_G4(userId);
      synchronize_activities_G5(userId);

      // Get activity logs from DB
      const result = await client.query(`SELECT * FROM activities WHERE user_id = ${userId}`);
      res.json(result.rows);
  } catch (err) {
      console.error('Error updating loyalty points:', err);
      res.status(500).send('Internal server error');
  }
});

async function synchronize_activities_G4(userId) {
    try {
      const email_row = await client.query(`SELECT email FROM users WHERE id = ${userId}`);
      const email = email_row.rows[0].email;
      const g4_activities = await axios.get(`https://backend-group4.up.railway.app/api/activities/${userId}`);
      if (g4_activities.status !== 200) {
          return;
      }
      const our_activity_ids = await client.query(`SELECT activity_id FROM activities WHERE user_id = ${userId}`);
      const activity_ids = our_activity_ids.rows.map((activity) => activity.activity_id);
      
      const activities_to_add = g4_activities.data.filter((activity) => !activity_ids.includes(activity.activityId));
      activities_to_add.forEach(async element => {
          console.log(element);
          await client.query(`INSERT INTO activities (activity_id, description, user_id, act_timestamp, type, points_change) VALUES (${element.activityId}, '${element.description}', ${userId}, '${new Date(element.timestamp).toISOString().split('T')[0]}', '${element.type}', ${element.user.rewardPoints})`);
          console.log(`Added form_id: ${element.activityId} for ${email} as part of Group 4 Activity Synchronization Process.`);
      });
      if (activities_to_add.length != 0) {
          console.log(`Activity Synchronzation with Group 4 Success for ${email}.`); // Log success response
      } else {
          console.log(`No need for Activity Synchronzation with Group 4 for ${email}.`); 
      }
    } catch (error) {
        console.error('Error synchronizing with Group 4 Activities', error);
    }
    return ;
}

async function synchronize_activities_G5(userId) {
  try {
    const email_row = await client.query(`SELECT email FROM users WHERE id = ${userId}`);
    const email = email_row.rows[0].email;
    const g5_id = await axios.post(`https://backend-group5.up.railway.app/lookup-user`, {email:email});
    if (g5_id.data.status) { // if user doesnt exist with group 5, don't bother synchronising
      return;
    }
    const g5_activities = await axios.post(`https://backend-group5.up.railway.app/get-forms`, {requested_by:g5_id.data.user_id});
    if (g5_activities.status !== 200) {
        return;
    }
    const our_activity_ids = await client.query(`SELECT activity_id_G5 FROM activities WHERE user_id = ${userId}`);
    const activity_ids = our_activity_ids.rows.map((activity) => activity.activity_id_g5);
    
    const activities_to_add = g5_activities.data.forms.filter((activity) => !activity_ids.includes(activity.form_id));
    activities_to_add.forEach(async element => {
        await client.query(`INSERT INTO activities (activity_id_G5, user_id, act_timestamp, type, points_change) VALUES ('${element.form_id}', ${userId}, '${new Date(element.created_at).toISOString().split('T')[0]}', '${element.type}', ${element.points})`);
        console.log(`Added form_id: ${element.form_id} for ${email} as part of Group 5 Activity Synchronization Process.`);
    });
    if (activities_to_add.length != 0) {
        console.log(`Activity Synchronzation with Group 5 Success for ${email}.`); // Log success response
    } else {
        console.log(`No need for Activity Synchronzation with Group 5 for ${email}.`); 
    }
  } catch (error) {
      console.error('Error synchronizing with Group 5 Activities', error);
  }
  return ;
}

// Route to get company vehicles (fetch from SQL database)
app.get('/api/user/vehicles/:id', async (req, res) => {
  const companyId = parseInt(req.params.id);

  try {
      // Query the database for user's vehicles
      const result = await client.query(`SELECT vehicle.* , vehicle_ownership.id as ownership_id FROM vehicle   
                                          INNER JOIN vehicle_ownership 
                                          ON vehicle_ownership.vehicle_id = vehicle.id 
                                            INNER JOIN companies 
                                            ON vehicle_ownership.company_id = companies.id 
                                              WHERE companies.id = ${companyId}`);

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

// Route to remove vehicle ownership for a company
app.delete('/api/company/vehicles/:id', async (req, res) => {
  const ownershipId = parseInt(req.params.id);

  try {
      // Delete the vehicle from the company's ownership record
      console.log(`Attempt to delete vehicle with ownership ID of ${ownershipId}`)
      const result = await client.query(`DELETE FROM vehicle_ownership WHERE id = ${ownershipId}`);
      res.status(202).send('Vehicle deleted.');
  } catch (err) {
      console.error('Error deleting vehicle:', err);
      res.status(500).send('Internal server error');
  }
});

// Route to register a new vehicle to a company's fleet
app.post("/api/company/new_vehicle", async (req, res) => {
  const { vehicle_id, company_id } = req.body;
  try {
    const result = await client.query(
      `insert into vehicle_ownership (vehicle_id, company_id) values (${vehicle_id}, ${company_id}) RETURNING *`
    );

    res.status(201).json(result);
  } catch (err) {
    console.error("Error adding vehicle to company fleet.", err);
    res.status(500).send("Database query error");
  }
});

// Route to get all of FleetRewards' available vehicles (vehicle catalogue)
app.get('/api/catalogue/vehicle', async (req, res) => {
  try {
      const result = await client.query('SELECT * FROM vehicle');
      res.json(result.rows);
  } catch (err) {
          console.error(err);
          res.status(500).send('Database error');
  }
});

app.get('/rewards/all', async (req, res) => {
    axios.get(`https://backend-group4.up.railway.app/api/rewards/all`)
    .then(response => {
        res.json(response.data);
    })
    .catch(error => {
        console.error('Error fetching Group 4s Rewards:', error);
    });
});

// Server setup
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

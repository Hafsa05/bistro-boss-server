const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.afx5ss3.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	}
});

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();

		const usersCollection = client.db("bistroDb").collection("users");
		const menuCollection = client.db("bistroDb").collection("menu");
		const reviewsCollection = client.db("bistroDb").collection("reviews");
		const cartCollection = client.db("bistroDb").collection("carts");

		// users related api 
		app.get('/users', async (req, res) => {
			const result = await usersCollection.find().toArray();
			res.send(result);
		})

		// users related api =>  save user data in database after checking wheather it's a new user or not 
		app.post('/users', async (req, res) => {
			const user = req.body;
			console.log(user);
			const query = { email: user.email };
			const existingUser = await usersCollection.findOne(query);
			console.log('existing user', existingUser);
			if (existingUser) {
				return res.send({ message: 'user already exist in DB' });
			}
			const result = await usersCollection.insertOne(user);
			res.send(result);
		})

		// make admin 
		app.patch('/users/admin/:id', async (req, res) => {
			const id = req.params.id;
			console.log(id);
			const filter = { _id: new ObjectId(id) };
			const updateDoc = {
				$set: {
					role: 'Admin'
				},
			};
			const result = await usersCollection.updatedDoc(filter, updateDoc);
			res.send(result);
		})

		// menu related api 
		app.get('/menu', async (req, res) => {
			const result = await menuCollection.find().toArray();
			res.send(result);
		})

		// review related api 
		app.get('/reviews', async (req, res) => {
			const result = await reviewsCollection.find().toArray();
			res.send(result);
		})

		// cart collection apis
		app.get('/carts', async (req, res) => {
			const email = req.query.email;
			if (!email) {
				res.send([]);
			}
			const query = { email: email };
			const result = await cartCollection.find(query).toArray();
			res.send(result);
		});

		app.post('/carts', async (req, res) => {
			const item = req.body;
			const result = await cartCollection.insertOne(item);
			res.send(result);
		})

		// delete an item from cart table 
		app.delete('/carts/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await cartCollection.deleteOne(query);
			res.send(result);
		})

		// Send a ping to confirm a successful connection
		await client.db("admin").command({ ping: 1 });
		console.log("Pinged your deployment. You successfully connected to MongoDB!");
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);


app.get('/', (req, res) => {
	res.send("Boss is sitting");
})

app.listen(port, () => {
	console.log(`Bistro Boss is sitting on port ${port}`);
})



/**
 * --------------------------------
 *      NAMING CONVENTION
 * --------------------------------
 * users : userCollection
 * app.get('/users')        => sob user ke pacche
 * app.get('/users/:id')    => specific 1ta user pacche using id
 * app.post('/users')       => create user (usually 1)
 * app.patch('/users/:id')  => update a specific user
 * app.put('/users/:id')    => update a specific user
 * app.delete('/users/:id') => delete a specific user
*/
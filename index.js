const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f3zbe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db('soapSellShope');
    const commentCollectionInhome = database.collection('comments');
    //for comment section in home page
    const topproductsCollectionInHome = database.collection('topproducts');
    //for products at home page
    const allproductsCollection = database.collection('allproducts');
    //for product purchse collection
    const allbuyingproductsCollection =
      database.collection('allbuyingproducts');

    //--------for all buying/purchase list------------
    //for user collection
    const userCollection = database.collection('users');
    //email
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //user post
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      console.log('result', result);
      res.json(result);
    });
    //upsert
    //upsert uset for to make sure one user info 1 tyme register
    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });
    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    //to show products list  which are bought my client
    app.get('/allbuyingproducts', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = allbuyingproductsCollection.find(query);
      // console.log(query);
      const listsItems = await cursor.toArray();
      // console.log(listsItems);
      res.json(listsItems);
    });
    //product which was bought putted in server
    app.post('/allbuyingproducts', async (req, res) => {
      const boughtproducts = req.body;
      const result = await allbuyingproductsCollection.insertOne(
        boughtproducts
      );
      // console.log(boughtproducts);
      // console.log(result);
      res.json(result);
    });

    //delet for client if he want to cancel order
    app.delete('/allbuyingproducts/:_id', async (req, res) => {
      const id = req.params._id;
      const query = { _id: ObjectId(id) };
      const result = await allbuyingproductsCollection.deleteOne(query);
      res.json(result);
      // allbuyingproductsCollection
      //   .deleteOne({ _id: ObjectId(req.params._id) })
      //   .then((result) => {
      //     res.send(result.deletedCount > 0);
      //   });
    });

    //-------------------for allproducts  page where more than 6 exists--------------
    //for allproduct to show in allProducts page from db
    app.get('/allproducts', async (req, res) => {
      const cursor = allproductsCollection.find({});
      const allproducts = await cursor.toArray();
      res.send(allproducts);
    });

    //for getting single product in booking page from home top products
    //get single product
    app.get('/allproducts/:id', async (req, res) => {
      const id = req.params.id;
      // console.log('getting specific id for boking', id);
      const query = { _id: ObjectId(id) };
      const productinallproductpage = await allproductsCollection.findOne(
        query
      );
      res.json(productinallproductpage);
    });
    //for all-products taking from form uploading to db in product page
    app.post('/allproducts', async (req, res) => {
      const allproduct = req.body;
      console.log('hitting the post api for all products', allproduct);

      const result = await allproductsCollection.insertOne(allproduct);
      // console.log(result);
      res.json(result);
    });

    //deleting from home page products
    app.delete('/allproducts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await allproductsCollection.deleteOne(query);
      res.json(result);
    });

    //--------------above code for all products shown in allproducts  page--------------

    //-------------------for home page top products--------------
    //for topproduct to show in home from db
    app.get('/topproducts', async (req, res) => {
      const cursor = topproductsCollectionInHome.find({});
      const topproducts = await cursor.toArray();
      res.send(topproducts);
    });

    //for getting single product in booking page from home top products
    //get single product
    app.get('/topproducts/:id', async (req, res) => {
      const id = req.params.id;
      console.log('getting specific id for boking', id);
      const query = { _id: ObjectId(id) };
      const productinhome = await topproductsCollectionInHome.findOne(query);
      res.json(productinhome);
    });

    //for top-products taking from form uploading to db in home
    app.post('/topproducts', async (req, res) => {
      const topproduct = req.body;
      console.log('hitting the post api for top products', topproduct);

      const result = await topproductsCollectionInHome.insertOne(topproduct);
      // console.log(result);
      res.json(result);
    });
    //deleting from home page products
    app.delete('/topproducts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await topproductsCollectionInHome.deleteOne(query);
      res.json(result);
    });
    //--------------above code for top product shown in home page

    // -------------------forComment-section----------------
    //get api for comment
    app.get('/comment', async (req, res) => {
      const addingcomment = commentCollectionInhome.find({});
      const comments = await addingcomment.toArray();
      res.send(comments);
    });
    //getting comment by id to  update cmnt
    app.get('/comment/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const comnt = await commentCollectionInhome.findOne(query);

      // console.log('load withid: ', id);
      res.send(comnt);
    });
    //post apifor comment

    app.post('/comment', async (req, res) => {
      const newcomment = req.body;
      const result = await commentCollectionInhome.insertOne(newcomment);
      // console.log('new comment post', req.body);
      // console.log('added newcomment', result);
      res.json(result);
    });
    // commentadding to db above code
    //updating comment
    app.put('/comment/:id', async (req, res) => {
      const id = req.params.id;
      const updatedComment = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updatedComment.name,
          comment: updatedComment.comment,
        },
      };
      const result = await commentCollectionInhome.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log('updating comment', req);
      res.json(result);
    });

    //comment deleting
    app.delete('/comment/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await commentCollectionInhome.deleteOne(query);

      // console.log('deleting comment with id', id, result);
      res.json(result);
    });
    // console.log('database connected successfully');
    // ----------------------for comment section ended---------------
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello Soap Buyers!');
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});

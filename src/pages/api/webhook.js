import { buffer } from "micro";
import * as admin from 'firebase-admin';

//secure connection to firebase from the backend
//const serviceAccount = require('../../../permissions.json');
//'../../../permissions.json'
//make them process.env.STRIPE_SECRET_KEY); and add to vercel envierment
const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert({
        type: "service_account",
        project_id: process.env.PROJECT_ID,
        private_key_id: process.env.PRIVATE_KEY_ID,
        private_key: process.env.PRIVATE_KEY,
        client_email: process.env.CLIENT_EMAIL,
        client_id: process.env.CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-w71o4%40clone-57c79.iam.gserviceaccount.com"
      })
}) : admin.app();

//establish connection to stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_SIGNING_SECRET;

const fulfillOrder = async (session) => {
    return app.firestore().
        collection('users')
        .doc(session.metadata.email)
        .collection('orders')
        .doc(session.id).set({
            amount: session.amount_total / 100,
            amount_shipping: session.total_details.amount_shipping / 100,
            images:JSON.parse(session.metadata.images),
            timestamp:admin.firestore.FieldValue.serverTimestamp()
        })
        .then(()=>{
            console.log(`SUCCESS: Order ${session.id} had been added to the DB`);
        });
};

export default async (req, res) => {
    if (req.method === 'POST') {
        const requestBuffer = await buffer(req);
        const payload = requestBuffer.toString();
        const sig = req.headers['stripe-signature'];

        let event;
        //verify that event posted came from stripe
        try {
            event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
        } catch (err) {
            // console.log('Error',err.message)
            return res.status(400).send(`Webhook error: ${err.message}`)
        }

        //handle the checkout session completed event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            return fulfillOrder(session).then(()=> res.status(200)).catch((err)=> res.status(400).send(`Webhook Error: ${err.message}`));
        }
    }
}

export const config ={
    api:{
        bodyParser:false,
        externalResolver:true
    }
}